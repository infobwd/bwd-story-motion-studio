/**
 * BWD Story Motion Studio — Gemini Free Tier Voice Queue Worker v0.1.0
 * Bound to STORY-EN-001 Google Sheet. Free-only pilot; no automatic paid fallback.
 * Source of truth: Story/Scenes. VoiceQueue is an append-only job ledger.
 * NOTE: This file is NOT deployed by copying it to GitHub.
 */
const BWD = Object.freeze({
  spreadsheetId: '1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do',
  outputFolderId: '122SYWkyqHgXSe6-aFD8XYyBJbGDSv2rb',
  storyId: 'STORY-EN-001',
  model: 'gemini-3.1-flash-tts-preview',
  voice: 'Kore',
  maxRequestsPerDay: 6,
  maxAttemptsPerJob: 1,
  maxOutputBytes: 5000000,
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/interactions',
  queueColumns: [
    'job_id', 'story_id', 'scene_id', 'script_revision', 'text_sha256',
    'voice', 'state', 'attempts', 'created_at', 'claimed_at', 'output_drive_id',
    'output_url', 'duration_seconds', 'last_error', 'last_http_status',
    'idempotency_key', 'model', 'approved_image_id', 'finished_at', 'requested_by'
  ],
  eventColumns: ['event_at', 'job_id', 'event_type', 'old_state', 'new_state', 'detail'],
  validVoices: ['Kore'],
  // Fail closed: paid Gemini API projects are NOT authorized, even if API returns 200.
  gates: ['ENABLE_VOICE_JOBS', 'FREE_TIER_CONFIRMED', 'NO_BILLING_PROJECT_CONFIRMED']
});

function bwdSheet_(name) {
  const sh = SpreadsheetApp.openById(BWD.spreadsheetId).getSheetByName(name);
  if (!sh) throw new Error('MISSING_TAB_' + name);
  return sh;
}
function bwdProperties_() { return PropertiesService.getScriptProperties(); }
function bwdHex_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
}
function bwdNow_() { return new Date().toISOString(); }
function bwdRows_(sh) {
  const v = sh.getDataRange().getDisplayValues();
  if (!v.length) throw new Error('EMPTY_SHEET_' + sh.getName());
  return v;
}
function bwdMap_(row, headers) {
  const o = {}; headers.forEach((h, i) => { o[h] = String(row[i] || '').trim(); });
  return o;
}
function bwdStoryMeta_() {
  const rows = bwdRows_(bwdSheet_('Story'));
  const obj = {};
  rows.slice(1).forEach(r => { if (r[0]) obj[String(r[0]).trim()] = String(r[1] || '').trim(); });
  return obj;
}
function bwdScene_(storyId, sceneId) {
  const rows = bwdRows_(bwdSheet_('Scenes'));
  const headers = rows[0];
  const ixStory = headers.indexOf('Story ID');
  const ixScene = headers.indexOf('Scene ID');
  if (ixStory < 0 || ixScene < 0) throw new Error('SCENE_HEADERS_MISSING');
  const matches = rows.slice(1).filter(r => r[ixStory] === storyId && r[ixScene] === sceneId);
  if (matches.length !== 1) throw new Error('SCENE_NOT_FOUND_OR_DUPLICATE');
  return bwdMap_(matches[0], headers);
}
function bwdCheckScene_(job) {
  if (job.story_id !== BWD.storyId || !/^STORY-EN-001-S0[1-6]$/.test(job.scene_id)) throw new Error('PILOT_SCOPE_ONLY');
  const m = bwdStoryMeta_();
  if (m['Story ID'] !== job.story_id || m['Script revision'] !== job.script_revision) throw new Error('SCRIPT_REVISION_MISMATCH');
  const s = bwdScene_(job.story_id, job.scene_id);
  if (!s['Image Status'].startsWith('Approved') || !s['Approved Image Drive ID']) throw new Error('IMAGE_APPROVAL_REQUIRED');
  if (s['Approved Image Drive ID'] !== job.approved_image_id) throw new Error('APPROVED_IMAGE_CHANGED');
  if (!s['Narration (English)'] || s['Narration (English)'].length > 500) throw new Error('INVALID_NARRATION');
  if (bwdHex_(s['Narration (English)']) !== job.text_sha256) throw new Error('SCRIPT_TEXT_CHANGED');
  if (job.model !== BWD.model || BWD.validVoices.indexOf(job.voice) < 0) throw new Error('DISALLOWED_TTS_MODEL_OR_VOICE');
  const duration = Number(s['Duration (s)']);
  if (!Number.isFinite(duration) || duration < 2 || duration > 30) throw new Error('INVALID_SCENE_DURATION');
  return { narration: s['Narration (English)'], targetSeconds: duration, direction: s['Voice Direction (Draft)'] || '' };
}
function bwdCheckQueueShape_() {
  const sh = bwdSheet_('VoiceQueue');
  const rows = bwdRows_(sh);
  if (BWD.queueColumns.some((c, i) => rows[0][i] !== c)) throw new Error('QUEUE_SCHEMA_MISMATCH');
  return { sh, rows };
}
function bwdWriteRow_(sh, index, changes) {
  // index is zero-based in getDisplayValues(), including the header row
  const values = sh.getRange(index + 1, 1, 1, BWD.queueColumns.length).getDisplayValues()[0];
  BWD.queueColumns.forEach((header, i) => { if (Object.prototype.hasOwnProperty.call(changes, header)) values[i] = String(changes[header]); });
  sh.getRange(index + 1, 1, 1, BWD.queueColumns.length).setValues([values]);
  SpreadsheetApp.flush();
}
function bwdEvent_(jobId, event, from, to, detail) {
  bwdSheet_('VoiceEvents').appendRow([bwdNow_(), jobId, event, from, to, String(detail || '').slice(0, 300)]);
}
function bwdIsEnabled_() {
  const p = bwdProperties_();
  return BWD.gates.every(key => p.getProperty(key) === 'YES') && !!p.getProperty('GEMINI_API_KEY');
}
function bwdDailyCount_() {
  const p = bwdProperties_();
  const today = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
  const name = 'REQUEST_COUNT_' + today;
  const count = Number(p.getProperty(name) || 0);
  if (!Number.isInteger(count) || count < 0) throw new Error('INVALID_DAILY_COUNT');
  return { p, name, count };
}
function bwdMakePrompt_(scene) {
  const guide = 'Narrate a gentle English bedtime story for Thai primary-school learners. ' +
    'Natural American English, clear consonants, no music, no extra words. ' +
    'Pronounce Lumi as LOO-mee. ' +
    (scene.direction ? ('Performance note: ' + scene.direction + '. ') : '');
  return guide + 'Read exactly once: ' + scene.narration;
}
function bwdMakePayload_(scene, voice) {
  return {
    model: BWD.model,
    input: bwdMakePrompt_(scene),
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice: voice }] }
  };
}
function bwdWav_(base64Data) {
  const pcm = Utilities.base64Decode(base64Data);
  if (pcm.length < 24000 || pcm.length > BWD.maxOutputBytes || pcm.length % 2 !== 0) throw new Error('INVALID_AUDIO_BYTES');
  const prefix = String.fromCharCode.apply(null, pcm.slice(0, 4).map(b => b & 255));
  if (prefix === 'RIFF') {
    // Some newer models already return WAV; avoid double-wrapping.
    if (pcm.length < 44) throw new Error('INVALID_WAV');
    return { bytes: pcm, seconds: (pcm.length - 44) / 48000, alreadyWav: true };
  }
  const h = [];
  const ascii = s => { for (let i = 0; i < s.length; i++) h.push(s.charCodeAt(i)); };
  const i16 = n => { h.push(n & 255, (n >>> 8) & 255); };
  const i32 = n => { h.push(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255); };
  ascii('RIFF'); i32(pcm.length + 36); ascii('WAVEfmt '); i32(16); i16(1);
  i16(1); i32(24000); i32(48000); i16(2); i16(16); ascii('data'); i32(pcm.length);
  return { bytes: h.concat(pcm), seconds: pcm.length / 48000, alreadyWav: false };
}
function bwdCallTts_(scene, voice, apiKey) {
  const body = JSON.stringify(bwdMakePayload_(scene, voice));
  const response = UrlFetchApp.fetch(BWD.endpoint, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': apiKey },
    muteHttpExceptions: true,
    payload: body,
    followRedirects: false
  });
  const status = response.getResponseCode();
  if (status !== 200) {
    const e = new Error('GEMINI_HTTP_' + status);
    e.httpStatus = status;
    throw e;
  }
  // Fail safely on unknown response shapes; never store raw API response in Sheet/logs.
  let obj;
  try { obj = JSON.parse(response.getContentText()); } catch (_) { throw new Error('BAD_GEMINI_RESPONSE_JSON'); }
  if (!obj.output_audio || typeof obj.output_audio.data !== 'string') throw new Error('AUDIO_MISSING_FROM_RESPONSE');
  return bwdWav_(obj.output_audio.data);
}
function bwdFindExistingOutput_(fileName) {
  const files = DriveApp.getFolderById(BWD.outputFolderId).getFilesByName(fileName);
  return files.hasNext() ? files.next() : null;
}
function bwdStore_(job, wav) {
  const name = 'STORY-EN-001_' + job.scene_id.slice(-3) + '_VOICE_DRAFT_' + job.script_revision + '_' + job.job_id + '.wav';
  const existing = bwdFindExistingOutput_(name);
  if (existing) return existing; // crash recovery; never duplicate a prior upload
  const blob = Utilities.newBlob(wav.bytes, 'audio/wav', name);
  return DriveApp.getFolderById(BWD.outputFolderId).createFile(blob);
}
function bwdClaimFirst_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return null;
  try {
    if (!bwdIsEnabled_()) return null; // no API calls before all gates are true
    const daily = bwdDailyCount_();
    if (daily.count >= BWD.maxRequestsPerDay) return null;
    const { sh, rows } = bwdCheckQueueShape_();
    const jobs = rows.slice(1).map((r, i) => ({ ...bwdMap_(r, BWD.queueColumns), rowIndex: i + 1 }));
    // Never automatically reclaim uncertain requests after a crash.
    if (jobs.some(j => j.state === 'Claimed')) return null;
    const pending = jobs.filter(j => j.state === 'Queued');
    if (!pending.length) return null;
    const job = pending[0];
    const duplicate = jobs.filter(j => j.idempotency_key === job.idempotency_key);
    if (duplicate.length !== 1 || !job.idempotency_key || !job.job_id) {
      bwdWriteRow_(sh, job.rowIndex, { state: 'NeedsRevision', last_error: 'DUPLICATE_OR_MISSING_JOB_ID' });
      bwdEvent_(job.job_id, 'REJECTED', 'Queued', 'NeedsRevision', 'duplicate');
      return null;
    }
    if (Number(job.attempts || 0) >= BWD.maxAttemptsPerJob) {
      bwdWriteRow_(sh, job.rowIndex, { state: 'NeedsReconcile', last_error: 'MAX_ATTEMPTS' });
      bwdEvent_(job.job_id, 'RECONCILE', 'Queued', 'NeedsReconcile', 'no automatic retries');
      return null;
    }
    let scene;
    try { scene = bwdCheckScene_(job); }
    catch (e) {
      bwdWriteRow_(sh, job.rowIndex, { state: 'NeedsRevision', last_error: e.message });
      bwdEvent_(job.job_id, 'REJECTED', 'Queued', 'NeedsRevision', e.message);
      return null;
    }
    bwdWriteRow_(sh, job.rowIndex, { state: 'Claimed', claimed_at: bwdNow_(), attempts: Number(job.attempts || 0) + 1, last_error: '' });
    bwdEvent_(job.job_id, 'CLAIMED', 'Queued', 'Claimed', 'model=' + job.model);
    daily.p.setProperty(daily.name, String(daily.count + 1));
    return { job, scene };
  } finally { lock.releaseLock(); }
}
function bwdSyncSourceVoiceStatus_(job, updates) {
  const sh = bwdSheet_('Scenes');
  const values = bwdRows_(sh);
  const header = values[0];
  const sceneCol = header.indexOf('Scene ID');
  const storyCol = header.indexOf('Story ID');
  const voiceCol = header.indexOf('Voice Status');
  if (sceneCol < 0 || storyCol < 0 || voiceCol < 0) throw new Error('SCENE_VOICE_COLUMN_MISSING');
  const sceneIdx = values.findIndex((r, i) => i > 0 && r[storyCol] === job.story_id && r[sceneCol] === job.scene_id);
  if (sceneIdx < 1) throw new Error('SCENE_ROW_GONE');
  const label = updates.state === 'DraftReady' ? 'VoiceDraft — needs human QA; ' + updates.output_drive_id :
    updates.state === 'NeedsTimingReview' ? 'VoiceDraft — timing review required; ' + updates.output_drive_id :
    'NeedsReconcile — ' + (updates.last_error || 'manual check needed');
  sh.getRange(sceneIdx + 1, voiceCol + 1, 1, 1).setValue(label);
  const story = bwdSheet_('Story');
  const sr = bwdRows_(story);
  const field = sr.findIndex((r, i) => i > 0 && r[0] === 'Voice Recording Status');
  if (field >= 1) {
    story.getRange(field + 1, 2, 1, 1).setValue(
      'Voice queue ' + job.scene_id + ': ' + updates.state + '; final voice QA not approved');
  }
  SpreadsheetApp.flush();
}
function bwdFinish_(claimed, updates, event) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('FINISH_LOCK_UNAVAILABLE; manual reconciliation required');
  try {
    const { sh, rows } = bwdCheckQueueShape_();
    const i = rows.findIndex((r, ix) => ix > 0 && String(r[0]) === claimed.job.job_id);
    if (i < 1) throw new Error('JOB_ROW_MISSING_AFTER_API');
    const job = bwdMap_(rows[i], BWD.queueColumns);
    if (job.state !== 'Claimed') throw new Error('UNEXPECTED_FINAL_STATE_' + job.state);
    bwdWriteRow_(sh, i, updates);
    bwdEvent_(claimed.job.job_id, event, 'Claimed', updates.state, updates.last_error || '');
    try { bwdSyncSourceVoiceStatus_(claimed.job, updates); }
    catch (syncErr) { bwdEvent_(claimed.job.job_id, 'SHEET_SYNC_FAILED', updates.state, updates.state, String(syncErr.message).slice(0, 120)); }
  } finally { lock.releaseLock(); }
}
function processVoiceQueue() {
  const claimed = bwdClaimFirst_();
  if (!claimed) return { action: 'NO_OP', reason: 'disabled, no queued jobs, daily cap, or claimed job exists' };
  let output = null;
  try {
    const wav = bwdCallTts_(claimed.scene, claimed.job.voice, bwdProperties_().getProperty('GEMINI_API_KEY'));
    output = bwdStore_(claimed.job, wav);
    const status = wav.seconds <= claimed.scene.targetSeconds - 0.2 ? 'DraftReady' : 'NeedsTimingReview';
    bwdFinish_(claimed, {
      state: status,
      output_drive_id: output.getId(), output_url: output.getUrl(),
      duration_seconds: wav.seconds.toFixed(3), finished_at: bwdNow_(),
      last_error: '', last_http_status: '200'
    }, 'TTS_UPLOADED');
    return { action: status, file_id: output.getId(), duration_seconds: wav.seconds };
  } catch (e) {
    // Request may have been charged or upload succeeded before a Sheets failure:
    // DO NOT retry automatically. Require manual review / reconciliation.
    const msg = String(e.message || 'UNKNOWN').slice(0, 160);
    try {
      bwdFinish_(claimed, {
        state: 'NeedsReconcile', last_error: msg,
        last_http_status: e.httpStatus ? String(e.httpStatus) : '', finished_at: bwdNow_(),
        output_drive_id: output ? output.getId() : '', output_url: output ? output.getUrl() : ''
      }, 'TTS_ERROR');
    } catch (_) { /* logging may be unavailable; claimed row stays as reconciliation blocker */ }
    return { action: 'NeedsReconcile', error: msg };
  }
}
function healthCheckVoiceQueue() {
  const props = bwdProperties_();
  const { rows } = bwdCheckQueueShape_();
  return {
    system: 'BWD_STORY_MOTION_GEMINI_TTS', version: '0.1.0',
    gates_ready: bwdIsEnabled_(), key_present: !!props.getProperty('GEMINI_API_KEY'),
    scripts_enabled: props.getProperty('ENABLE_VOICE_JOBS') === 'YES',
    queue_rows: rows.length - 1, model: BWD.model,
    // Never print secret values, tokens or underlying project billing details.
    running_trigger_count: ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'processVoiceQueue').length
  };
}
function installVoiceTrigger() {
  if (!bwdIsEnabled_()) throw new Error('REFUSE_ENABLE: set all explicit FREE-only gates and GEMINI_API_KEY privately first');
  bwdCheckQueueShape_();
  const same = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'processVoiceQueue');
  if (same.length) return { installed: false, reason: 'already_exists', count: same.length };
  ScriptApp.newTrigger('processVoiceQueue').timeBased().everyMinutes(5).create();
  return { installed: true, minutes: 5 };
}
function disableVoiceQueue() {
  bwdProperties_().setProperty('ENABLE_VOICE_JOBS', 'NO');
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'processVoiceQueue').forEach(t => ScriptApp.deleteTrigger(t));
  return { disabled: true };
}
function armS01Pilot() {
  if (!bwdIsEnabled_()) throw new Error('REFUSE_ARM: secure free-only settings not complete');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('ARM_LOCK_UNAVAILABLE');
  try {
    const { sh, rows } = bwdCheckQueueShape_();
    const i = rows.findIndex((r, ix) => ix > 0 && String(r[0]).startsWith('VOICE-STORY-EN-001-S01-') && r[6] === 'PendingSetup');
    if (i < 1) throw new Error('S01_STAGED_JOB_MISSING_OR_ALREADY_ARMED');
    const job = bwdMap_(rows[i], BWD.queueColumns);
    bwdCheckScene_(job);
    bwdWriteRow_(sh, i, { state: 'Queued' });
    bwdEvent_(job.job_id, 'ARMED_BY_OWNER', 'PendingSetup', 'Queued', 'one S01 trial only');
    return { armed: true, job_id: job.job_id };
  } finally { lock.releaseLock(); }
}
function showVoiceHealth() {
  const health = healthCheckVoiceQueue();
  SpreadsheetApp.getUi().alert('BWD Voice Queue',
    'Version: ' + health.version + '\nReady: ' + (health.gates_ready ? 'YES' : 'NO') +
    '\nAPI Key configured: ' + (health.key_present ? 'YES' : 'NO') +
    '\nQueue items: ' + health.queue_rows +
    '\nTriggers installed: ' + health.running_trigger_count,
    SpreadsheetApp.getUi().ButtonSet.OK);
}
function onOpen() {
  SpreadsheetApp.getUi().createMenu('BWD Voice')
    .addItem('Check voice queue setup', 'showVoiceHealth')
    .addItem('Arm scene 01 pilot (after setup)', 'armS01Pilot')
    .addItem('Install 5-minute trigger', 'installVoiceTrigger')
    .addItem('Disable voice worker', 'disableVoiceQueue').addToUi();
}
