# Implementation Roadmap & QA — v1.4
Updated: 2026-11-22 | One manually produced pilot and six new scene-image drafts; production automation not built

## Roadmap
| Phase | งาน | ผลลัพธ์/หลักฐาน | Gate |
|---|---|---|---|
| P0 Foundation | ยืนยันบัญชี Google Sheets / Drive destination folder / Supabase project ref / Google OAuth/Service Account consent / renderer choice / TTS licence / budgets | `docs/decisions/` และ `.env.example` ไม่มี secret | เจ้าของระบบยืนยันตัวตน สิทธิ์ และต้นทุน |
| P1 Story + Motion Demo | storyboard 6 ฉาก, PNG scene illustrations, character continuity QA, approved visuals and improved licensed English narration; trial animation + MP4 | 6 scene images uploaded; next: human QA, voice sample and motion test | VisualApproved + VoiceApproved ก่อน render v2 |
| P2 Backend Production | Supabase Auth, RLS, stories/jobs/assets/QA tables, atomic claim, retry, worker + Drive upload; log status + checksum | migration SQL, integration test, validated Drive file ID | end-to-end 1 job ผ่านโดยไม่ต้องแก้ DB ด้วยมือ |
| P3 Dashboard | GitHub Pages SPA/PWA, responsive dashboard, queue filters, story editor/preview, QA approve/reject, inline video viewer | Pages URL, mobile QA screenshots, role tests | ครู/ผู้ตรวจเข้าถึงตามสิทธิ์ |
| P4 ChatGPT + Advanced AI | command interface, optional service-specific APIs, generated scene handling, metrics cost reporting | E2E from chat → queued, real audit events | ไม่มี hallucinated completion; cost cap ใช้ได้ |

## MVP Acceptance criteria
1. มี story_id และ script_revision ที่อนุมัติแล้วจาก Google Sheets
2. สร้าง storyboard 5–6 ฉากพร้อม duration, narration, animation, character action
3. ตัวละครหลักใช้ master assets เดียวกันทุกฉาก; ภาพ/เสียงไม่เปลี่ยนรูปลักษณ์โดยไม่ได้ตั้งใจ
4. เรนเดอร์ MP4 (H.264 + AAC หรือ codec ที่รองรับกว้าง) เปิดเล่นได้และครบ 45–60 วินาทีโดยประมาณ
5. ซับไทยไม่ล้น safe area; ข้อความและเสียงสอดคล้อง; ไม่มีภาพหรือเสียงหลุด
6. QA มี checklist, reviewer identity, revision และ approved_at; reject ต้องส่งกลับสถานะ NeedsRevision
7. Upload MP4 ไป Drive สำเร็จ; verify file_id, owner/destination, MIME/size/checksum และการเปิดเล่นตามสิทธิ์
8. Supabase และ Sheet มี URL/เวอร์ชัน/สถานะสอดคล้องกัน; status Delivered แสดงเมื่อไฟล์ตรวจผ่านแล้วเท่านั้น
9. สั่งผลิตซ้ำด้วย idempotency_key เดิมไม่สร้างไฟล์ซ้ำ; retry หลังขัดข้องทำงานได้จริง
10. บท/เสียง/ภาพผ่านตรวจสิทธิ์และความเป็นส่วนตัว; browser ไม่เห็น privileged secrets

## Suggested tables
- `stories`: story_id, title, sheet_id, sheet_row, script_revision, approved_at, approved_by, requested_by, visibility
- `scenes`: scene_id, story_id, scene_order, duration_ms, dialogue, visual_prompt, animation_preset, character_id, on_screen_text
- `characters`: character_id, name, manifest_ref, version, palette, voice_profile, rights_status
- `render_jobs`: job_id, story_id, script_revision, state, idempotency_key, worker_id, lease_until, attempts, error_code, output_version
- `media_assets`: asset_id, job_id, scene_id, kind, mime_type, storage_ref, drive_file_id, sha256, bytes
- `qa_reviews`: review_id, job_id, reviewer_id, criteria_json, verdict, notes, reviewed_at
- `audit_logs`: log_id, actor_id, event_type, entity_type, entity_id, created_at, metadata (avoid PII)

## UI pages
Dashboard / Stories / Storyboard / Character Library / Production Queue / QA & Review / Delivered Library / Settings / Admin.
Mobile bottom nav & bottom sheet, responsive 9:16 preview, PWA, safe-area and pull-to-refresh with rate-limits.

## Test matrix / security
- Unauthorized anonymous user cannot view private story/job or change status (RLS)
- Editor cannot self-approve when reviewer separation policy enabled
- Public GitHub Pages does not embed Google refresh token, private keys, Supabase service role
- Script row changes after approval require new revision and new approval
- Worker crash causes lease expiration, requeue once, bounded retries and audit trail
- Drive 401/403/429/quota errors do not mark Delivered; recover without duplicate upload
- Thai TTS pronunciation, timing, subtitle segmentation and text overflow pass human QA
- Final approved output immutable; later edits generate output_version+1
- Long renders run **outside GitHub Actions**; Actions limited to code CI / deployment, within Terms

## Open decisions (require real account data)
- Spreadsheet URL/tab names and column mapping
- Google Drive target folder ID and account ownership
- Supabase project reference for this project (do not assume from WD Media)
- Rendering: local school workstation vs paid cloud worker; capacity/cost ceiling
- TTS/voice provider, usage rights, allowed AI video integrations
- Video publishing access: internal teachers vs public; content classification
- Remotion commercial/non-profit eligibility if selected (Motion Canvas MIT preferred)
- Is ChatGPT instruction-to-queue mediated by a connector, a backend command API, or manual approval?

## Operational constraints
- Workflow statuses must be factual; no invented URLs, credentials or QA passes
- Public repo is for code and public design assets only
- Start with a single sample story and 1 render job; never enable autonomous batch processing before rate/cost limits and QA gates

## References
- [Master Plan](MASTER_PLAN.md)
- [ChatGPT Project Instructions](PROJECT_INSTRUCTIONS_V1.md)
- [GitHub Actions policy](GITHUB_ACTIONS_COST_AND_POLICY.md)

## Actual pilot 2026-11-22
- Pilot v1 MP4 technically valid and in Drive, but human feedback marked visuals and synthetic voice **NeedsRevision**.
- Six PNG draft scene images uploaded to Drive. Technical files/IDs verified; human visual review **pending**.
- Scene file refs and statuses recorded in Google Sheet `Scenes!H1:M7`.
- Do not mark v2 rendered, approved or delivered. See [Visual QA Log](QA_VISUAL_ASSETS_20261122.md).

## P1 progress 2026-11-22 (evidence)
- 6 image drafts in Google Drive, still unapproved.
- Silent visual animatic V2 (50s) uploaded with contact sheet and scene-level SRT. Technical render QA passes, but character rigging, natural voice and final QA remain incomplete.
- Source code: `tools/render_visual_animatic.py`; the visual prototype is not production automation.
- Blocker for better audio: no connected/authorized high-quality TTS service or recorded narration; old eSpeak voice explicitly rejected.
- Explicit approval gate remains: image review → voice selection/sample and QA → full-motion draft → final QA → Drive delivery.
- [Detailed V2 QA](ANIMATIC_V2_QA_20261122.md).

## 2026-11-22: Visual QA gate passed, narration pending
- User approved all six still images and copies were verified in [approved folder](https://drive.google.com/drive/folders/18nLmhtYKEAmYiwmSr19PCE4ESM8uo7dJ).
- ImageApproved ≠ VoiceApproved or Final QA; the 50-second silent animatic remains a technical preview only.
- Free local Kokoro TTS integration prepared and dry-run tested, actual voice inference not yet attempted due to missing model/runtime on executing host; see [decision](FREE_TTS_DECISION_20261122.md).
- Required next: run local ONNX model on permitted worker → six WAV drafts → human audio QA → time-aligned captions/MP4 final → human approval + Drive verification.

## 2026-11-22: Cloud TTS experiment (user declined computer worker)
- Evaluate Gemini Free Tier TTS as primary for voice, Azure Speech F0 fallback subject to cloud-account eligibility; Kokoro local remains optional only.
- S01 prompt and secure API sample prepared and dry-run tested; verified no API key. Real voice not produced (authorization required).
- Next gate: sign in Gemini AI Studio/authorize project (no paid upgrade) → one S01 voice test → human listening & timing QA → six scene audio drafts.
- [Gemini S01 trial log](GEMINI_TTS_SCENE01_TRIAL_20261122.md).
