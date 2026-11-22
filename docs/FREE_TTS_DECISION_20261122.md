# Free English Voice — Decision & Guardrails v1.0
Date checked: 2026-11-22 · Story: STORY-EN-001 · Purpose: English story narration (Thai primary pupils, 6 scenes, total 50 sec).

## Decision (design selected, not installed)
**Previously selected local option (now superseded for current user preference): [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) + [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx).**
- Kokoro model license Apache-2.0; Python ONNX wrapper MIT; verify exact bundled voice packs before publication.
- Runs offline on a school Windows/Linux/Mac computer with CPU; no cloud account or per-character subscription. Hardware/electricity and installation effort are not zero.
- English narration voice candidate `af_sarah` (or `af_heart`) at speed ~1.0; final voice requires human listening for clarity and safe punctuation.
- Once installed, generate 6 local WAV drafts, one per scene; then optionally upload approved WAV files to Drive, use FFmpeg to composite with existing silent animatic.
- This choice does NOT create an authorized production worker or an active automation. Do not attempt continuous production via GitHub Actions.

## Current cloud-first direction (2026-11-22)
- User does **not** want any school computer for TTS. Primary current evaluation is Gemini Cloud TTS Free Tier via Google AI Studio, one S01 voice sample first.
- Dry-run only; no Google AI Studio authorized session/API key yet, so no sound generated. Do not treat an available Free Tier as an active account connection.
- [Evidence and instructions](GEMINI_TTS_SCENE01_TRIAL_20261122.md).

## Cloud fallback (free quota, needs account)
**[Azure Speech F0](https://azure.microsoft.com/en-us/pricing/details/speech/):** official page lists 0.5 million standard prebuilt Neural TTS characters/month free. Requires an Azure account, F0 resource creation, appropriate region availability and service authentication; verify any card/billing/subscription requirement before activation. This is a quota, not an unlimited free plan, and no Azure Speech credential is connected here.

## Other options considered
- Google Cloud Text-to-Speech has some monthly free characters but official pricing states billing must be enabled, charges automatically apply above allowance; not chosen for zero-billing goal: https://cloud.google.com/text-to-speech/pricing
- ElevenLabs free plan includes monthly credits, but usage and voice publishing rights differ by plan; not chosen as guaranteed forever-free production backend: https://elevenlabs.io/pricing
- ChatGPT-connected fal/Runway/HeyGen apps may consume plan credits or have independent costs; not assumed free.
- Browser SpeechSynthesis and unofficial Edge-TTS clients cannot be assumed to support reliable downloadable WAVs and allowed unattended production. Not chosen as production backend.
- Piper is a viable lighter offline fallback, but check engine version and each model's separate license (some are restrictive).

## What was actually done on 2026-11-22
1. User explicitly accepted the six illustrations: “ภาพโอเคแล้ว”.
2. Six Drive PNGs copied from `02_scene_images_draft` to [03_scene_images_approved](https://drive.google.com/drive/folders/18nLmhtYKEAmYiwmSr19PCE4ESM8uo7dJ); Drive folder list confirmed all 6 copied PNGs with matching sizes.
3. Google Sheet `Scenes!J2:J7` marked image approved; `Scenes!P1:Q7` stores approved file IDs/URLs; `Story!B21` and `B32:B34` store approval, folder and TTS decision.
4. Created `tools/generate_voice_kokoro.py` and checked `examples/STORY-EN-001_sheet_export_for_voice_20261122.json` into Repo.
5. Local dry-run of the 6 scene export **passed**; Python syntax compilation passed. This test did **not** generate audio.
6. This work environment has NO `kokoro_onnx`/ONNXRuntime/model and network download could not be completed. **No voice WAV or narrated MP4 produced or uploaded.**
7. Files also uploaded to [05_voice_preproduction](https://drive.google.com/drive/folders/122SYWkyqHgXSe6-aFD8XYyBJbGDSv2rb).

## Run Kokoro on a permitted school workstation
Requirements: Python (compatible with current `kokoro-onnx`), disk space for model and voice data, FFmpeg optional.
```bash
python -m pip install -U kokoro-onnx soundfile
mkdir -p models
# Download two official release assets ONCE from:
# https://github.com/thewh1teagle/kokoro-onnx/releases
# Place them at models/kokoro-v1.0.onnx and models/voices-v1.0.bin
python tools/generate_voice_kokoro.py \
  --sheet-export examples/STORY-EN-001_sheet_export_for_voice_20261122.json \
  --dry-run
python tools/generate_voice_kokoro.py \
  --sheet-export examples/STORY-EN-001_sheet_export_for_voice_20261122.json \
  --model models/kokoro-v1.0.onnx \
  --voices models/voices-v1.0.bin \
  --voice af_sarah --speed 1.0 \
  --out-dir output/STORY-EN-001_voice_draft_v1
```
- The JSON is a **dated snapshot**, NOT independently writable script of record; before any actual narration, re-export the current approved text from Google Sheets `Scenes!A2:E7` and check `script_revision` and source hash.
- Outputs are six WAV voice drafts and a manifest with durations/checksums/fit flags. The code refuses to overwrite old WAVs; use new versioned output directories.
- Do not change spoken wording silently to fit time. If clip exceeds scene duration, revise the timing/storyboard first and reapprove.
- Never mark VoiceApproved automatically. Human reviewers must listen and verify pronunciation ("Lumi" /LOO-mee/, "Ben"), naturalness, volume, breathing, alignment, licensing/rights.
- Avoid hardcoding secrets, students' private data, and copyrighted voice cloning.

## Linkages
- [Story Sheet](https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit?usp=drivesdk)
- [Approved visual manifest](../assets/STORY-EN-001_visual_approved_manifest_v1.json)
- [Source guide](VOICE_GUIDE.md)
- [Existing silent 50 s animatic](https://drive.google.com/file/d/1p3uyTiY4SuLiP4IAohp0WOYbuO30cHwM/view?usp=drivesdk)

## Blocker / milestone
Next real milestone is to install and run the ONNX model on an authorized computer, generate one scene-voice trial, listen to it, and correct pronunciation or timing. Then produce all six, perform voice QA, compositing, and final QA. No server setup or paid subscription has been authorized or created.

## 2026-11-22 implementation status — Cloud Google Apps Script queue
- Chosen MVP path is **ChatGPT → Google Sheets VoiceQueue → Apps Script timed trigger → Gemini 3.1 Flash TTS Preview Free Tier → Google Drive WAV**, no local PC.
- One S01 job staged as `PendingSetup`. Script worker (not deployed) and 11 mock tests available: [guide](APPS_SCRIPT_VOICE_WORKER_SETUP.md) and [code](../apps-script/Code.gs).
- Google Workspace OAuth, Gemini private key and free-tier check remain owner-controlled. No request, file, or paid tier activation has occurred.
