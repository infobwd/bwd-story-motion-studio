# Apps Script Gemini TTS Voice Queue — Implementation & QA 2026-11-22
Story: STORY-EN-001 | MVP version 0.1.0 | Phase: **Source-ready / Queue staged / Not deployed**

## Work actually performed
- Read live Repo project documents, Google Sheet `Story` and `Scenes`, source Drive folders and assets.
- Confirmed 6 still illustrations were approved and no natural-sounding voice had been produced.
- Chose model `gemini-3.1-flash-tts-preview` based on official REST Interactions API and Free Tier pricing. No API key or billing accessed.
- Implemented Apps Script worker `apps-script/Code.gs` with a strictly limited pilot, queue locking, SHA-256 script validation, image approval gate, daily hard cap, no automatic retry, WAV construction, Drive write, QA states, and event logging.
- Created two new Google Sheets tabs: `VoiceQueue` (20 columns) and `VoiceEvents` (6 columns). Seeded only S01 in `PendingSetup`. Did **not** set any `Queued` or `Claimed` job.
- Saved one Apps Script JSON manifest; no secrets committed.
- Offline tests (Node 22 VM with mocks): 11/11 passing, including no-key/no-gate no-op, staged request, unapproved scene rejection, duplicate ID rejection, simulated 3 s TTS WAV file write, single execution idempotency, and HTTP 429 needs reconciliation.
- Deployed nothing on Google Apps Script; no installable trigger, no Gemini API call, no new audio file, no new video.

## QA evidence and levels
| Check | Outcome |
|---|---|
| Current Google Sheet source and approved images verified | PASS |
| Queue tab created / S01 pre-staged safely | PASS |
| Event log tab created | PASS |
| JS code syntax | PASS |
| Mock tests | 11 / 11 PASS |
| Third-party App Script deployment | NOT DONE — needs owner OAuth |
| Authorized Free Tier API key in ScriptProperties | NOT DONE |
| Shared Drive write as script runtime | NOT TESTED |
| Real Gemini TTS | NOT DONE |
| Human listening and timing QA | NOT DONE |
| Final video MP4 | NOT DONE |

## Costs and operational risk
- No Gemini request was made by this work; no new model charges from this test. Google Apps Script free quotas also apply.
- Real usage requires Free Tier eligibility from the API project's owner; **do not assume zero billing merely from model being listed as free**.
- The script stops by default until owner supplies private key and manually confirms non-billing project; no stored key/credentials in GitHub or Sheet.
- The Google Drive app connector can create/read/edit spreadsheets and files, but cannot currently create or deploy an Apps Script project directly. Must install via authorized Google Apps Script editor once. No misleading claims about remote deployment.

## References
- [Google Sheet](https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit)
- [Output folder](https://drive.google.com/drive/folders/122SYWkyqHgXSe6-aFD8XYyBJbGDSv2rb)
- [Worker setup guide](APPS_SCRIPT_VOICE_WORKER_SETUP.md)
- [Source](../apps-script/Code.gs) and [test suite](../tests/queue.test.cjs)
- https://ai.google.dev/gemini-api/docs/speech-generation
- https://ai.google.dev/gemini-api/docs/pricing
