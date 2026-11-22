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
No connected natural TTS audio generation service is available for this pipeline at this step. The earlier local `eSpeak` test was rejected by the user and is not reused. An eligible TTS/voiceover app (such as fal, if connected and the required audio model/rights are available) or authorized human recording must be configured before making a quality voice draft. Connection or model usage may have separate costs, require user approval, and must be verified.
