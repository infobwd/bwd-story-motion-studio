const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const code = fs.readFileSync(require('node:path').join(__dirname, '../apps-script/Code.gs'), 'utf8');

const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const narr = 'One evening, Lumi the firefly saw a little bunny crying in the forest.';
function makeEnv({ enabled = false, key = false, imageApproved = true, duplicate = false, httpStatus = 200, initialState='Queued' } = {}) {
  const jobs = [];
  const sheets = {
    Story: [['Field','Value'],['Story ID','STORY-EN-001'],['Script revision','v1'],['Voice Recording Status','Not generated']],
    Scenes: [['Story ID','Scene ID','Duration (s)','Narration (English)','Image Status','Approved Image Drive ID','Voice Direction (Draft)','Voice Status'],
             ['STORY-EN-001','STORY-EN-001-S01','8',narr,imageApproved?'Approved — user':'Draft','APPROVED_S01','Warm and calm','NeedsVoice']],
    VoiceQueue: [],
    VoiceEvents: [['event_at','job_id','event_type','old_state','new_state','detail']]
  };
  const props = { ENABLE_VOICE_JOBS: enabled ? 'YES':'NO', FREE_TIER_CONFIRMED: enabled ? 'YES':'NO', NO_BILLING_PROJECT_CONFIRMED: enabled ? 'YES':'NO' };
  if(key)props.GEMINI_API_KEY='secret-in-test-only';
  let networkCalls=0, files=[];
  const sheet = name=>({
    getName:()=>name,
    getDataRange:()=>({getDisplayValues:()=>sheets[name].map(r=>r.map(String))}),
    getRange:(r,c,h,w)=>({
      getDisplayValues:()=>sheets[name].slice(r-1,r-1+h).map(row=>Array.from({length:w},(_,i)=>String(row[c+i-1]??''))),
      setValues:values=>{for(let j=0;j<h;j++){while(sheets[name].length<r+j)sheets[name].push([]);for(let k=0;k<w;k++)sheets[name][r-1+j][c-1+k]=String(values[j][k])}},
      setValue:value=>{sheets[name][r-1][c-1]=String(value)}
    }),
    appendRow:row=>sheets[name].push(row.map(String))
  });
  const context = {
    console,
    PropertiesService: {getScriptProperties:()=>({getProperty:x=>props[x]||null, setProperty:(k,v)=>{props[k]=v}})},
    SpreadsheetApp: {openById:()=>({getSheetByName:(name)=>sheets[name]?sheet(name):null}), flush:()=>{},getUi:()=>({createMenu:()=>({addItem(){return this},addToUi(){return this}})})},
    Utilities: {
      computeDigest:(_algo,v)=>[...crypto.createHash('sha256').update(v).digest()].map(b=>b>127?b-256:b),
      DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1},
      formatDate:()=> '2026-11-22',
      base64Decode:data=>[...Buffer.from(data,'base64')].map(b=>b>127?b-256:b),
      newBlob:(bytes,mime,name)=>({bytes,mime,name})
    },
    LockService: {getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
    ScriptApp: {getProjectTriggers:()=>[],newTrigger:()=>({timeBased:()=>({everyMinutes:()=>({create:()=>{}})})}),deleteTrigger:()=>{}},
    UrlFetchApp: {fetch:()=>{networkCalls++;const pcm=Buffer.alloc(24000*2*3);return {getResponseCode:()=>httpStatus,getContentText:()=>JSON.stringify({output_audio:{data:pcm.toString('base64')}})}}},
    DriveApp: {getFolderById:()=>({getFilesByName:()=>({hasNext:()=>false}),createFile:blob=>{const id=`ID_${files.length+1}`; const newFile={blob,getId:()=>id,getUrl:()=>`https://drive.google.com/file/d/${id}/view`};files.push(newFile);return newFile}})},
    Date,
    Number,
    String
  };
  vm.createContext(context);
  vm.runInContext(code,context);
  const columns=vm.runInContext('BWD.queueColumns',context);
  sheets.VoiceQueue.push([...columns]);
  const record={job_id:'VOICE-STORY-EN-001-S01-TEST',story_id:'STORY-EN-001',scene_id:'STORY-EN-001-S01',script_revision:'v1',text_sha256:sha(narr),voice:'Kore',state:initialState,attempts:'0',created_at:'2026-11-22T10:00:00+07:00',claimed_at:'',output_drive_id:'',output_url:'',duration_seconds:'',last_error:'',last_http_status:'',idempotency_key:sha('STORY-EN-001|S01|v1|'+sha(narr)+'|Kore|gemini-3.1-flash-tts-preview').slice(0,24),model:'gemini-3.1-flash-tts-preview',approved_image_id:'APPROVED_S01',finished_at:'',requested_by:'ChatGPT conversation'};
  sheets.VoiceQueue.push(columns.map(k=>String(record[k]||'')));
  if(duplicate)sheets.VoiceQueue.push(columns.map(k=>String(record[k]||'')));
  const state=()=>Object.fromEntries(columns.map((k,i)=>[k,sheets.VoiceQueue[1][i]]));
  return {ctx:context,sheets,props,state,network:()=>networkCalls,files,record};
}
const results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.message});}}
test('DISABLED_BY_DEFAULT does not call API or alter queue',()=>{const e=makeEnv();const r=vm.runInContext('processVoiceQueue()',e.ctx);assert.equal(r.action,'NO_OP');assert.equal(e.network(),0);assert.equal(e.state().state,'Queued')});
test('MISSING_KEY does not call API',()=>{const e=makeEnv({enabled:true});vm.runInContext('processVoiceQueue()',e.ctx);assert.equal(e.network(),0)});
test('STAGED_REQUEST not called without manual arm',()=>{const e=makeEnv({enabled:true,key:true,initialState:'PendingSetup'});vm.runInContext('processVoiceQueue()',e.ctx);assert.equal(e.network(),0);assert.equal(e.state().state,'PendingSetup')});
test('UNAPPROVED_IMAGE rejects request before API',()=>{const e=makeEnv({enabled:true,key:true,imageApproved:false});vm.runInContext('processVoiceQueue()',e.ctx);assert.equal(e.network(),0);assert.equal(e.state().state,'NeedsRevision')});
test('DUPLICATE_IDEMPOTENCY rejects request before API',()=>{const e=makeEnv({enabled:true,key:true,duplicate:true});vm.runInContext('processVoiceQueue()',e.ctx);assert.equal(e.network(),0);assert.equal(e.state().state,'NeedsRevision')});
test('ENABLED_AND_APPROVED generates WAV once and records Drive output',()=>{const e=makeEnv({enabled:true,key:true});const result=vm.runInContext('processVoiceQueue()',e.ctx);assert.equal(result.action,'DraftReady');assert.equal(e.network(),1);assert.equal(e.files.length,1);assert.equal(e.files[0].blob.mime,'audio/wav');assert.equal(e.files[0].blob.bytes.length,44+24000*2*3);assert.equal(e.state().state,'DraftReady');assert.equal(e.state().output_drive_id,'ID_1');assert.equal(e.sheets.VoiceEvents.length,3);assert.ok(e.sheets.Scenes[1][7].startsWith('VoiceDraft'));assert.ok(e.sheets.Story[3][1].includes('DraftReady'))});
test('NO_REPEAT calls with delivered draft',()=>{const e=makeEnv({enabled:true,key:true});vm.runInContext('processVoiceQueue()',e.ctx);vm.runInContext('processVoiceQueue()',e.ctx);assert.equal(e.network(),1);assert.equal(e.files.length,1)});
test('HTTP_429 needs manual reconciliation without retry',()=>{const e=makeEnv({enabled:true,key:true,httpStatus:429});const r=vm.runInContext('processVoiceQueue()',e.ctx);assert.equal(r.action,'NeedsReconcile');assert.equal(e.state().last_http_status,'429');vm.runInContext('processVoiceQueue()',e.ctx);assert.equal(e.network(),1)});
test('STAGED job manual arm requires full gates',()=>{const e=makeEnv({initialState:'PendingSetup'});assert.throws(()=>vm.runInContext('armS01Pilot()',e.ctx),/REFUSE_ARM/)});
test('STAGED job manual arm changes ONLY S01 pending job to queue',()=>{const e=makeEnv({enabled:true,key:true,initialState:'PendingSetup'});const r=vm.runInContext('armS01Pilot()',e.ctx);assert.equal(r.armed,true);assert.equal(e.state().state,'Queued');assert.equal(e.network(),0)});
test('TTS payload uses official Interactions API schema',()=>{const e=makeEnv();const p=vm.runInContext('bwdMakePayload_({narration:"Hello",direction:"calm"},"Kore")',e.ctx);assert.equal(p.model,'gemini-3.1-flash-tts-preview');assert.equal(p.response_format.type,'audio');assert.equal(p.generation_config.speech_config[0].voice,'Kore')});
console.log(results.map(x=>`${x.status} ${x.name}${x.error?': '+x.error:''}`).join('\n'));
const passed=results.filter(r=>r.status==='PASS').length;
console.log(`RESULT: ${passed}/${results.length} PASSED`);
if(passed!==results.length)process.exit(1);
