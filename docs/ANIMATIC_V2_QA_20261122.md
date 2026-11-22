# STORY-EN-001 — Silent Visual Animatic V2 / Technical QA (2026-11-22)
Status: **Visual preview created and uploaded; technical QA pass; visual editorial QA and narration pending. NOT FINAL.**

## Sources verified
- Story and exact 6 scene narrations: [Google Sheets](https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit?usp=drivesdk), `Scenes!A1:O7`, `Story!A1:B31`.
- 6 PNG scene illustrations verified by Drive folder list, each stored in [02_scene_images_draft](https://drive.google.com/drive/folders/1Des_VC-5FYDMLPXcN9tRESIQRRBX8b_k).
- SHA-256 of six local input images matched [image manifest](../assets/STORY-EN-001_visual_draft_manifest_v1.json).
- The user has not approved each illustration; no images moved to approved folder.

## Actual work performed
- Built 50-second 9:16 silent animatic with gentle Pan/Zoom and small visual particles, overlaying six *original English captions* from the current Google Sheet; **not rigged character movement**.
- Scene timing: S01 0–8, S02 8–16, S03 16–25, S04 25–33, S05 33–41, S06 41–50 seconds.
- Rendered locally with **Python/Pillow + OpenCV + FFmpeg**; source checked into [tools/render_visual_animatic.py](../tools/render_visual_animatic.py). No GitHub-hosted video render or AI video-credit use.
- Uploaded three preview files to [04_visual_animatic_draft](https://drive.google.com/drive/folders/1Gh7kvNn1xEQHIPOvkDEwGzeocZPLBD-s):
  1. [Visual animatic draft MP4](https://drive.google.com/file/d/1p3uyTiY4SuLiP4IAohp0WOYbuO30cHwM/view?usp=drivesdk)
  2. [6-scene contact sheet PNG](https://drive.google.com/file/d/1ESOLGiZHNzgxJ0LnN4V0FsHVDuFTWvj4/view?usp=drivesdk)
  3. [6-line timed English captions SRT](https://drive.google.com/file/d/160zZMR1toRimzjAtXJOKoLBtt2yesxE_/view?usp=drivesdk)
- Saved renderer script in GitHub; source copy also in draft folder for reproducibility.
- Updated Google Sheet `Scenes!N1:O7` with voice direction/scene review and `Story!A24:B31` with video/file QA links and states.

## Technical QA results
| Check | Result | Evidence |
|---|---|---|
| 50s duration | PASS | ffprobe: exactly 50.000s |
| 9:16 720×1280 20 fps | PASS | ffprobe |
| H.264 MP4 size | PASS | local 4,277,209 bytes; Drive metadata 4,277,209 bytes |
| Local SHA-256 | LOGGED | `284bc00af128fed436ad95f5095e7269fdf39df9d525b818b124898d2bcbbdce` |
| Three preview artifacts in correct Drive folder | PASS | Drive list and individual metadata |
| Source scene order and original text | PASS | 6 scene captions from Sheet |
| Human check of visual continuity/legibility | PENDING | S01/S02 and S05/S06 compositions need attention |
| Narration | NOT GENERATED | no audio stream in animatic; eSpeak pilot voice rejected |
| Accurate word-level subtitle timing | PENDING | SRT currently scene-level only |
| Actual full-motion character rig, mouth/pose animation | NOT IMPLEMENTED | preview uses pan/zoom only |
| Production job & Supabase queue | NOT IMPLEMENTED | no render_job_id or atomic claim |
| Final QA, approval, delivery | NOT DONE | this is an unapproved silent preview |

## QA notes
- Scene 1 and 2 share similar close-up framing; animation alone will not solve duplicate compositions. Reviewer can request a new shot angle.
- Scene 5 and 6 need separation between arriving home and moral closing.
- Use gentle child-friendly English voice; do **not** reuse the earlier robotic narration or label a silent file final.
- Do not overwrite V1 MP4 or image drafts; preserve version history.
- Google Drive external sharing and a full visual playback by all intended reviewers remain unverified.

## Next gate
Review the animatic/storyboard visually, mark approval or revisions per scene; choose/authorize a licensed natural-sounding TTS or recording service. Create and audition six voice clips with timing before final animated/rendered V2. Keep `ImageApproved`, `VoiceApproved`, and `Delivered` false until documented.
