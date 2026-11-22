# Voice Direction & Narration QA — STORY-EN-001 v1.0
Date: 2026-11-22. Stage: **pre-production voice direction only** (no approved or uploaded new audio yet).

## Why change
Pilot v1 uses an offline synthetic English TTS voice; user feedback: voice not acceptable, visual scenes not acceptable. Mark earlier voice NeedsRevision, keep old MP4 as pilot evidence only.

## English voice quality target
- Audience: Thai primary-school English learners; clear, natural and gentle English pronunciation, not overly fast.
- Suggested: one warm narrator with light variation for Lumi and Ben, or three carefully matched voices if affordable; do not require expensive voice cloning.
- Neutral easy-to-understand accent (e.g. en-US). Keep pace approximately 100–120 words/minute, slower for first exposure to new words, with expressive pauses, clear final consonants, no robotic speed-ups or clipped endings.
- Voice design: `Lumi` reassuring, high but not squeaky; `Ben` soft and worried becoming cheerful; `Narrator` warm and calm. Do not imitate a real person without permission.
- Record/export audio in WAV 48 kHz if supported, then encode AAC for MP4; no clipping; consistent loudness and clean speech.
- Do not add unlicensed background music. Optional subtle licensed forest ambience well below narration.

## Scene-by-scene performance (original narration, v1)
| Scene | Target | Narration | Delivery |
|---|---|---|---|
| S01 | 8 s | One evening, Lumi the firefly saw a little bunny crying in the forest. | Warm curiosity; soft pause after “evening” |
| S02 | 8 s | “I am lost,” said Ben. “I cannot find my way home.” | Ben worried, slow; pause between dialogue |
| S03 | 9 s | Lumi smiled. “Follow my tiny light. We can find the path together.” | Gently hopeful; emphasize “together” |
| S04 | 8 s | They crossed a stream and walked past the tall trees. | Slight adventure and anticipation |
| S05 | 8 s | At last, Ben saw his cozy home. “Thank you, Lumi!” | Warm excitement and gratitude |
| S06 | 9 s | Even a small light can make a big difference. The end. | Calm, uplifting conclusion |
Total target: 50 s. Dialogue punctuation is performance guidance; do not change source of truth silently.

## Voice stage / gate
1. Produce 6 **draft** voice clips from selected licensed TTS provider or recorded voice, with one `scene_id` per clip. Never reuse old eSpeak voice as final.
2. Verify speech clarity, pacing, pronunciation of `Lumi` and `Ben`, scene timing, clip length, silence and peaks; human audition required.
3. Record provider, model/voice identifier, licensing/consent, estimated cost and actual cost if paid, and transcript hash; do not expose API key.
4. Mark `VoiceApproved` only when approved; composite video follows both ImageApproved + VoiceApproved.
5. Connected ChatGPT video/TTS plugin is **not** proof that a backend worker API exists; build/test integration separately.

## Unresolved
Chosen narration service, license, paid-usage consent, and production credential not configured. No new audio published by this document.
