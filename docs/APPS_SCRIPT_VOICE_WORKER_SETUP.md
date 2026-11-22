# BWD Story Motion Studio — Apps Script Cloud Voice Worker MVP v0.1.0
Updated 22 November 2026 | Deployment status: **NOT INSTALLED / NOT AUTHORIZED / NO REAL GEMINI CALL**

## Goal
Owner can say in ChatGPT: **"ผลิตเสียงนิทาน STORY-EN-001 ฉาก S01"**. ChatGPT updates the Google Sheet `VoiceQueue` using the connected Google Drive/Sheets app. Every five minutes (after one-time setup), Google Apps Script reads a queued scene, verifies approved image + current script revision, calls Gemini Free Tier API, creates WAV in Drive and writes output ID/URL and `DraftReady` or `NeedsTimingReview` back to the Sheet. The human listener must approve the voice before further video processing.

The ChatGPT connector **only enqueues/reads requests**; it does not itself create continuous background execution. Google Apps Script trigger performs background polling on Google's server.

## Live resources (already created and verified)
- [Google Sheet](https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit) with `Story`, `Scenes`, new `VoiceQueue`, `VoiceEvents`
- Initial staged job `VOICE-STORY-EN-001-S01-5fa460d8` in `VoiceQueue` with state `PendingSetup`; no API request is sent while staged
- [Story scene images approved 6/6](https://drive.google.com/drive/folders/18nLmhtYKEAmYiwmSr19PCE4ESM8uo7dJ)
- [Draft voice output Drive folder](https://drive.google.com/drive/folders/122SYWkyqHgXSe6-aFD8XYyBJbGDSv2rb), to be used for WAVs
- [Worker setup files in Drive](https://drive.google.com/drive/folders/16R01HlPdMe_gprIux84Qe2Cw7EVM4Q0D)
- Source: [`apps-script/Code.gs`](../apps-script/Code.gs) + [`apps-script/appsscript.json`](../apps-script/appsscript.json)
- Tests: [`tests/queue.test.cjs`](../tests/queue.test.cjs)

## One-time Google authorization (requires owner account)
1. Sign in as account authorized to edit the story Sheet and write into the destination Drive folder, preferably the school's authorized account. Verify the Gemini API key belongs to a **non-billing, Free Tier-only** project in Google AI Studio. Do **not** upgrade or link billing for this MVP. A Free Tier in AI Studio playground does not automatically grant the ChatGPT connector API credentials.
2. Open the [Sheet](https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit), choose **Extensions → Apps Script** (may require desktop-mode browser or ChatGPT Work's cloud browser). This creates a bound Apps Script project under the owner account. The current ChatGPT Drive connector cannot create/write/deploy a native Apps Script project; no deployment exists yet.
3. Paste exact content of [`Code.gs`](../apps-script/Code.gs) into the Apps Script editor. In **Project Settings**, choose **Show `appsscript.json` manifest**, and replace it with [`appsscript.json`](../apps-script/appsscript.json). Save.
4. In Apps Script **Project Settings → Script properties**, enter `GEMINI_API_KEY` **privately in Google**, never in a chat, Sheets, Public GitHub, or frontend. Set `FREE_TIER_CONFIRMED=YES` and `NO_BILLING_PROJECT_CONFIRMED=YES` **only after confirming that the API key's project truly has no billing attached and this TTS model is available for Free Tier**. Initially keep `ENABLE_VOICE_JOBS=NO`.
5. Run `healthCheckVoiceQueue` from the editor and grant required Google scopes (Sheets, Drive, external requests, script triggers) after checking their effect. Test that account can write to the Shared Drive folder; Shared Drive policies may require administrator access.
6. Once the script can access both Sheet and Drive and the API key is confirmed free, set `ENABLE_VOICE_JOBS=YES`. Execute `installVoiceTrigger()` once. It installs one timer trigger every 5 minutes; it does not create a job. `PendingSetup` jobs remain inactive.
7. Execute `armS01Pilot()` **once**, which validates S01 approved image/current script and changes `PendingSetup` → `Queued`; the next timer tick processes at most this one scene. Alternatively run `processVoiceQueue()` once manually to test immediately. **Do not arm remaining scenes until S01 audio has been listened to.**
8. Inspect `VoiceQueue` and `VoiceEvents`; if `DraftReady`/`NeedsTimingReview`, open real `output_url`, listen and record actual Voice QA. If 403/429 or API response unexpected, state becomes `NeedsReconcile`, and the worker does not retry automatically.
9. To shut off instantly, run `disableVoiceQueue()`: sets `ENABLE_VOICE_JOBS=NO` and removes triggers. Also review Google AI Studio quota/billing manually.

## Free-only safeguards (fail-closed)
- Three explicit gates must equal `YES`: `ENABLE_VOICE_JOBS`, `FREE_TIER_CONFIRMED`, `NO_BILLING_PROJECT_CONFIRMED`. `GEMINI_API_KEY` must be present. No default enables them.
- API model allowlisted to `gemini-3.1-flash-tts-preview` (the model with official REST Interactions documentation and listed Free Tier), voice fixed to `Kore` for the first pilot. No paid fallback or model auto-switch.
- Hard cap of 6 Gemini calls per day **per script**, and **one attempt per job**. User must verify there is no billing attached; code cannot query Google's account billing state. A truthy flag alone cannot financially guarantee zero cost on a paid-key project.
- `LockService` prevents parallel claims, stores `Claimed` before external calls. If interrupted during a request, retains `Claimed` until **manual reconciliation**, rather than retrying and potentially duplicating paid usage or files.
- Use text SHA256, script revision, idempotency key and approved image ID to reject stale changes. `DriveApp` checks the precise output filename before creating a file to avoid duplicate uploads.
- Only the approved `STORY-EN-001` six English scenes and `Kore` voice are allowed. No unapproved student data sent to Gemini Free Tier (Google states Free Tier content may be used to improve its products).
- If output audio is longer than the assigned scene, mark `NeedsTimingReview`. Never speed up unnaturally, and never self-approve voice or final video.

## Queue schema (20 columns)
`job_id | story_id | scene_id | script_revision | text_sha256 | voice | state | attempts | created_at | claimed_at | output_drive_id | output_url | duration_seconds | last_error | last_http_status | idempotency_key | model | approved_image_id | finished_at | requested_by`

Allowed worker statuses: `PendingSetup → Queued → Claimed → DraftReady / NeedsTimingReview / NeedsReconcile / NeedsRevision`; manual-only `VoiceApproved`, optional `Cancelled`. No automatic retries. New revisions must create a **new row/job_id**; never overwrite finished output.

ChatGPT may append a new `Queued` row only when the owner has verified that the worker is installed, explicitly enabled, and a pilot call succeeded. Until then, all new jobs must remain `PendingSetup`.

## Tested / not tested
- `node tests/queue.test.cjs`: **11/11 PASS** with mock Apps Script services (no real provider calls)
- Syntax checked: `Code.gs` valid JS syntax when parsed as `.js`
- Live Script deployment: **NOT DONE** (no Apps Script API connection)
- Real Gemini TTS invocation: **NOT DONE** (no authorized API key)
- WAV created in Drive by worker: **NOT DONE**
- Google Workspace authorization and Shared Drive write under the script owner: **NOT TESTED**
- Therefore no statement of end-to-end production success is permitted yet.

## Official references
- Gemini Speech generation REST: https://ai.google.dev/gemini-api/docs/speech-generation
- Gemini Free Tier pricing: https://ai.google.dev/gemini-api/docs/pricing
- Apps Script installable triggers: https://developers.google.com/apps-script/guides/triggers/installable
- Apps Script quota: https://developers.google.com/apps-script/guides/services/quotas
- Apps Script project API / consent: https://developers.google.com/apps-script/api/reference/rest/v1/projects/create
