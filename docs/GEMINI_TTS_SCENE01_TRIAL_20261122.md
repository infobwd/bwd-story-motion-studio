# Gemini Cloud TTS S01 Free-Tier trial — 2026-11-22
Story: STORY-EN-001 / S01. Script revision: v1. **Result: PREPARED, NOT GENERATED.**
Goal: natural English narration on Google Cloud without using school computer and without paid quota.

## Actual evidence
- Reopened Google Sheet `Scenes!A1:Q2` and verified S01 text:
  "One evening, Lumi the firefly saw a little bunny crying in the forest."
- Confirmed Gemini TTS available from Google AI Studio and official free-tier pricing for `gemini-3.8-flash-tts` (subject to quota and account eligibility): https://ai.google.dev/gemini-api/docs/pricing
- Official TTS guide documents the Interactions API call with `gemini-3.1-flash-tts-preview` and a prebuilt voice (Kore): https://ai.google.dev/gemini-api/docs/speech-generation
- Checked available ChatGPT app connections/browser profile for Google AI Studio: NO signed-in Google AI Studio session or available Gemini API key with authorization; current environment has no `GEMINI_API_KEY` / `GOOGLE_API_KEY`; no authorized API request can be made.
- Created exact scene prompt and minimal secure Python REST harness under `examples/` and `tools/`. Local Python syntax compilation PASS, `--dry-run` PASS, no-key safety check PASS (refuses to send any request). Dry run is not speech generation.
- Uploaded prompt, script and dry-run result to [05_voice_preproduction](https://drive.google.com/drive/folders/122SYWkyqHgXSe6-aFD8XYyBJbGDSv2rb) and committed text files to GitHub.
- No audio output, no WAV, no MP3, no final MP4, no new Gemini API usage or charges, no voice QA.

## Direct mobile trial (no computer required)
1. Open [Google AI Studio](https://aistudio.google.com/welcome) and sign into an authorized Google account.
2. Use **Gemini TTS / Speech generation**. In the model selection choose `gemini-3.8-flash-tts` with Free Tier when offered. Verify **Free** / no paid quota / do not upgrade.
3. Set a gentle English voice e.g. Kore. Paste the instructions from [S01 prompt](../examples/STORY-EN-001_S01_GEMINI_TTS_PROMPT.txt) and generate **only scene 1**.
4. Listen for "Lumi" as "LOO-mee", natural/clear en-US, no truncated words; budget 8 sec.
5. Save/download WAV or other available audio and upload it to a versioned folder in Google Drive, then record its real Drive file ID and QA state in the story sheet. Do not approve automatically.
6. If AI Studio blocks a free request (e.g. HTTP 403/429) or requires billing, stop and choose another free provider; do not enable paid tiers to bypass.

## Production integration later
- Use a server-side secure Gemini key (never put credentials in GitHub Public repository, Google Sheets, ChatGPT conversation, or GitHub Pages frontend).
- Validate the exact current script revision from Sheet, 6 scene IDs, output mime/duration, and actual free-tier quotas.
- Use an external authorized backend worker for API call and Google Drive upload. Supabase Edge Function may orchestrate; it is not a continuously running video-render worker.
- Prefer one scene first; then six distinct voice drafts with human review before final MP4.
- Do not imply a connected Google Drive app shares auth with Google AI Studio; these are separate authorizations.

## Official sources
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/speech-generation
- https://aistudio.google.com/welcome

## Trial artifacts
- [S01 Google Drive prompt](https://drive.google.com/file/d/1NETuH0UwlHalWGo-7FL0LKxuRxhXQsZa/view?usp=drivesdk)
- [S01 Google Drive test harness](https://drive.google.com/file/d/1oL6gD7P0-sye-cU_OvL4Akw6bk3qu9Iv/view?usp=drivesdk)
- [S01 Dry run result](https://drive.google.com/file/d/1ub5JSlr7F3aVn7R3tR0C3zhRJDig03dK/view?usp=drivesdk)

**State: `voice_provider_trial_blocked_authorization`. Next step: sign into Google AI Studio in browser, or connect authorized cloud Gemini API credentials through a server-side secret manager.**
