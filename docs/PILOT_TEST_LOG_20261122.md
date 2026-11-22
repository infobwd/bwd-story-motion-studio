# Pilot Test Log — STORY-EN-001 (2026-11-22)

**Status updated 2026-11-22: Produced & uploaded; technical file QA PASS; human feedback says visuals/voice NEEDS REVISION. Not approved for release.**

## Story
- Title: **Lumi and the Lost Bunny**
- Format: original English children's story, 6 scenes, 50 seconds, 9:16
- Characters: Lumi (yellow firefly), Ben (white bunny)
- Message: kindness — even a small light can make a big difference
- Script and scene data: [Google Sheet](https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit?usp=drivesdk), tabs `Story` and `Scenes`
- Script source of truth for edits **after pilot**: Google Sheets; `stories/STORY-EN-001.json` is a snapshot, not an independently writable master

## Output
- Google Drive parent 2569: https://drive.google.com/drive/folders/1mptg083MKUgLguzbsmWlhMqTW7BdrwNY
- Pilot subfolder: https://drive.google.com/drive/folders/1Cpb4Epc8iAmplFx8yVu1bwyRkpAlnLLl
- **Video:** https://drive.google.com/file/d/15bLE8DvnoV17hmL1Z7AYDFWAU950cOVN/view?usp=drivesdk
- Drive File ID: `15bLE8DvnoV17hmL1Z7AYDFWAU950cOVN`
- File name: `STORY-EN-001_Lumi_and_the_Lost_Bunny_PILOT_v1.mp4`
- 958,389 bytes; SHA-256 (local): `ab9ee37594779787fb4fb23948469c6c560ce60632919f61419769d9ccd2b4a8`

## Production performed
- Built 6 frame-based 2D motion-graphics scenes locally using Python/Pillow + FFmpeg (no cloud video AI charges).
- Generated offline English speech via `espeak` for technical test; embedded English subtitles on video.
- Assembled MP4 with H.264 video (540x960, 12 fps), AAC audio, 50.0 sec.
- Created native Google Sheet with Story and Scenes tabs via Google Drive connector, and moved it to the new output folder.
- Uploaded MP4 via authenticated Google Drive connector, then read back metadata/listed folder and verified matching size, MIME `video/mp4`, and destination parent ID.

## QA matrix
| Check | Result | Evidence |
|---|---|---|
| Actual MP4 exists locally and in Google Drive | PASS | Drive API file ID and folder listing |
| MP4 length, codec, resolution | PASS | ffprobe 50s, H.264/AAC, 540x960 |
| Scene count matches storyboard | PASS | 6 scene manifests; 50s total |
| Video Drive size matches local bytes | PASS | 958389 bytes |
| Google Sheet tabs and script data | PASS | readback 7 rows in Scenes and metadata in Story |
| Human approval of story, timing, English accent | PENDING | Voice is synthetic offline proof-of-concept |
| Production Worker and Supabase queue integration | NOT IMPLEMENTED | Pilot was manually triggered, not automated |
| Public distribution approval / license sign-off | PENDING | Must review before publication |

**Do not label `Delivered` in Supabase.** No Supabase job exists. This is an externally completed pilot marked `pilot_uploaded_pending_human_qa`.

## Next work
1. Owner reviews voice pronunciation, story pacing, visual treatment, and subtitles.
2. Select licensed Thai/English voice provider for final version.
3. Define Story/Scene schema from Google Sheet columns, Supabase project and secure Drive worker auth.
4. Implement durable external render worker and full QA approval before automating batches.

## Notes
- GitHub Actions were **not** used to render this pilot; there is no new GitHub Actions billing consumed by this test.
- Google Drive file and spreadsheet access depend on Shared Drive permissions; broad public visibility not verified.

## User feedback and follow-up (2026-11-22)
- Human reviewer reported voice unnatural and scene images unsatisfactory. Original pilot remains as test evidence, **not final**.
- Generated and uploaded 6 new PNG scene drafts, all stored in [02_scene_images_draft](https://drive.google.com/drive/folders/1Des_VC-5FYDMLPXcN9tRESIQRRBX8b_k) and mapped in Google Sheet.
- See [visual QA report](QA_VISUAL_ASSETS_20261122.md) and [voice guide](VOICE_GUIDE.md). Await scene-by-scene visual approval and a better voice sample. No production v2 exists yet.
