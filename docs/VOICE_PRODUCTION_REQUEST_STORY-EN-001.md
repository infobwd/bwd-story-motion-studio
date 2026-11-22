# Voice production request — STORY-EN-001
Status 2026-11-22: **Production-ready brief; voice NOT generated or approved.**

## Voice target
- Audience: Thai primary pupils learning English, level A1–A2.
- Language: English (en-US), warm, soothing storybook narration, natural tempo around 105–120 wpm with gentle expressive variations.
- Characters: narrator warm and clear; Ben sounds concerned in S02, relieved by S05; Lumi sounds kind and reassuring. A single well-acted narrator is acceptable for MVP.
- Pronunciation guide: `Lumi` = /ˈluː.mi/ ("LOO-mee"), `Ben` = /bɛn/. Have humans verify correctness.
- Avoid synthetic metallic timbre, clipped words, exaggerated childish/squeaky speech, and unauthorized voice clones.
- Six separate files preferably mono/stereo WAV 48 kHz, one `scene_id` each, clear start/end silence. Encode AAC only when compositing.
- Use exact source narration from Google Sheets `Scenes!E2:E7`; do not silently alter text. Captions timing currently broad scene-level and needs actual audio alignment.
- Total target 50 sec: S01 8s, S02 8s, S03 9s, S04 8s, S05 8s, S06 9s.
- Provider/model/license/voice ID, rights and actual usage cost must be recorded. Never put API keys in GitHub.
- Human voice QA must listen to all clips and check mispronunciations, clipping, level consistency, pacing, subtitle alignment and background noise.
- Proposed outputs: `VOICE_DRAFT_v1/S01.wav` … `S06.wav`; **do not mark VoiceApproved merely because files exist**.

## Blocker
Free design selected 2026-11-22: **local Kokoro-82M + kokoro-onnx** (Apache-2.0/MIT); prepare CPU worker on school machine; no paid API required. See [free TTS decision](FREE_TTS_DECISION_20261122.md) and [draft-voice CLI](../tools/generate_voice_kokoro.py). Dry-run passed but no model installed in current environment, so no audio created. Azure Speech F0 is fallback with free monthly quota, but requires account/service setup and a budget guard. Earlier `eSpeak` voice rejected; never reuse. Need human voice QA before composition.

## 2026-11-22 Cloud-first update
User rejected school-computer requirement. A Gemini Cloud TTS S01 evaluation package is prepared; Google AI Studio free tier exists but is not authorized in the current connected environment. No paid service, API call, or voice artifact generated. Follow [S01 Gemini trial log](GEMINI_TTS_SCENE01_TRIAL_20261122.md) and do not mark `VoiceApproved`.
