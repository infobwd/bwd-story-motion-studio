# Visual Asset Upload & QA — STORY-EN-001 (2026-11-22)

## Verified upload
- [Folder — 02_scene_images_draft](https://drive.google.com/drive/folders/1Des_VC-5FYDMLPXcN9tRESIQRRBX8b_k) under [STORY-EN-001](https://drive.google.com/drive/folders/1Cpb4Epc8iAmplFx8yVu1bwyRkpAlnLLl).
- Uploaded **6 PNG images**, names `STORY-EN-001_S01_visual_draft_v1.png` through `STORY-EN-001_S06_visual_draft_v1.png`.
- Image source: ChatGPT generated illustrations in previous turn, each 941×1672 RGB.
- Google Drive folder list readback: 6/6, MIME image/png and exact local byte sizes.
- Manifest (IDs, hashes, size, URLs): [STORY-EN-001_visual_draft_manifest_v1.json](../assets/STORY-EN-001_visual_draft_manifest_v1.json).
- In [Google Sheet](https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit?usp=drivesdk), updated **Scenes!H1:M7** with image Drive ID/URL/status, voice status, direction and notes. Updated Story sheet with draft location and gate.

## QA results
| Dimension | Status | Notes |
|---|---|---|
| Files uploaded and readable in folder list | PASS | 6/6 PNG, correct file names, sizes, folder |
| Format/dimensions | PASS | 941×1672 RGB all 6 |
| Correct scene mapping | PASS | S01-S06 mapped to Storyboard by ID |
| Character continuity / composition | REVIEW REQUIRED | Generated independently; compare outfits, poses, eyes and wings between frames |
| Distinct scene 1 vs 2 and scene 5 vs 6 | REVIEW REQUIRED | Similar camera setups; might need stronger visual differentiation |
| Subtitle safe area | REVIEW REQUIRED | Preliminary empty lower area; needs mobile overlay test |
| Human final visual approval | PENDING | No approval recorded |
| Improved voice | NOT YET PRODUCED | Existing pilot voice not acceptable; new licensed TTS or recording needed |
| New MP4 v2 | NOT STARTED | Approval gates not met |

## Correct workflow
Script → six illustrations drafted → **review and approve individual scene assets** → produce and QA improved English narration → motion composition → MP4 v2 QA → upload final Drive → mark Delivered when approved/verified.

**Do not mislabel the earlier pilot MP4 as approved.** User feedback indicates needs revision. This upload is visual preproduction, not a rendered or delivered v2.
