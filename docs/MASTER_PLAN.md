# BWD Story Motion Studio — Master Plan v1.4
วันที่: 22 พฤศจิกายน 2569 | สถานะ: ImageApproved 6/6 / silent animatic V2 uploaded / voice generation pending / production automation not built
Project: **BWD Story Motion Studio — AI Video Production**
Repository: https://github.com/infobwd/bwd-story-motion-studio

> คลิปนำร่อง v1 อัปโหลด Drive แล้วแต่ผู้ใช้ให้ข้อเสนอแนะว่าเสียงและภาพไม่ผ่าน; ภาพร่าง 6 ฉากชุดใหม่อยู่ใน Drive รออนุมัติ ยังไม่มี production worker/queue

## 1. วิสัยทัศน์
พัฒนาระบบผลิตคลิปสั้นเชิงเล่าเรื่อง (character-led motion graphics) จากบทใน Google Sheets โดยแบ่งเรื่องเป็นฉากอย่างเป็นระบบ ควบคุมตัวละครประจำ สร้าง/ประสานเสียงพากย์และคำบรรยาย ตรวจคุณภาพก่อนเผยแพร่ จัดเก็บ MP4 ที่ Google Drive และบริหารการผลิตผ่าน GitHub Pages ที่เชื่อม Supabase ผู้ใช้สามารถสั่งงาน/ตรวจสถานะผ่าน ChatGPT ได้ตามสิทธิ์ของเครื่องมือที่เชื่อมต่อ

## 2. เป้าหมาย MVP
- คลิปแนวตั้ง 9:16 ความยาวเป้าหมาย 45–60 วินาที จำนวน 5–6 ฉาก; ความยาวจริงปรับตามบท
- ตัวละครหลัก 1 ตัวแบบ reusable (character sheet, vector layers, pose library, color/voice profile)
- Theme สีน้ำเงิน–เหลือง; ข้อความอ่านได้บนมือถือ; ภาษาไทยและฟอนต์ที่มีสิทธิ์ใช้งาน
- ต้นทางบทจาก Google Sheets; storyboard แยกฉากก่อนอนุมัติ
- สร้างเสียงและซับไตเติล, เรนเดอร์ MP4, QA, อัปโหลด Drive, เก็บ File ID และ URL
- เว็บ GitHub Pages ดูคิว/ตัวอย่าง/สถานะ/ผล QA/ลิงก์ Drive, แบบ PWA/mobile-first
- ผู้ใช้ต้องอนุมัติ Storyboard และ Final ก่อนเผยแพร่

## 3. Architecture และแหล่งข้อมูลจริง (Single Source of Truth)
1. **Google Sheets** — Story metadata, script, dialogue, per-scene storyboard, script revision และการอนุมัติบท
2. **Supabase Postgres** — queue, render jobs, retry, ownership, workflow state, QA, audit trail, asset registry
3. **GitHub Repository** — source code, design system, visual presets, reusable character manifest, schema migrations, docs, deployment workflows; ห้ามเก็บ secret/ข้อมูลผู้เรียน/บทที่เป็นความลับ
4. **GitHub Pages** — static frontend; Supabase Auth + RLS; ไม่มี server process, secret, video rendering หรือ Google OAuth refresh token ใน browser
5. **Rendering Worker ภายนอก GitHub Actions** — local PC โรงเรียน / VPS / Cloud Run / Render worker; รับคิวจาก backend อย่างปลอดภัย ประมวลผล motion graphics, voice/subtitles, compose MP4, ส่งผล QA
6. **Google Drive** — authoritative artifact store ของ MP4, thumbnails และ deliverables; ใช้ OAuth/Service Account เท่าที่จำเป็นบนฝั่ง backend เท่านั้น
7. **ChatGPT + Connected Apps** — อ่าน/แก้แผน เขียนบท สั่งคิว ตรวจผลผ่านเครื่องมือที่ได้รับสิทธิ์; คำสั่งอัตโนมัติต้องอาศัย API/Worker แยกจากปลั๊กอินในแชท

## 4. เทคโนโลยี
- Frontend: Vite + TypeScript/React หรือ static SPA + PWA บน GitHub Pages
- Auth/API: Supabase Auth, Postgres RLS, Edge Functions ทำหน้าที่ orchestration/validation
- Renderer: **Motion Canvas (MIT) เป็นตัวเลือกแรกให้ทดลอง**, FFmpeg สำหรับ encoding/compositing; **Remotion เป็นทางเลือก** หลังตรวจสอบใบอนุญาตที่ใช้กับสถานศึกษา
- TTS: บริการเสียงไทยที่มีสิทธิ์ใช้งาน หรือเสียงที่ผู้ใช้จัดเตรียม (validate quality, consent และ costs)
- Optional AI scene: HeyGen / Runway / Canva / generated assets; API ไม่ได้เท่ากับ ChatGPT connector และต้องประเมินราคา/สิทธิ์/การคงตัวละคร
- GitHub Actions: CI/CD/build/test/deploy เว็บเท่านั้น; อาจมี test render สั้นของซอฟต์แวร์ตามความเหมาะสม **ไม่ใช้เป็น render farm ผลิตคลิปต่อเนื่อง** เพราะข้อกำหนด GitHub Actions

## 5. Flow / State Machine
Draft → StoryboardReady → ScriptApproved → Queued → Claimed → AssetsReady → Rendering → Rendered → QAReview → Approved → Uploading → Delivered
สถานะผิดพลาด: NeedsRevision / Failed / RetryScheduled / Cancelled
- รองรับ Version: story_id + script_revision + render_preset_version + output_version
- Unique idempotency key ป้องกันสร้างคิวซ้ำ; งานต้อง claim แบบ atomic พร้อม lease, heartbeat, timeout
- งานล้มเหลว: retry แบบ exponential backoff, bounded retry, error logs; ห้าม mark Delivered จนตรวจ Drive file ID ได้จริง
- หากแก้เฉพาะฉาก ให้ rebuild เฉพาะ scene assets ที่เกี่ยวข้องก่อน recompose โดย version ไม่ทับไฟล์เดิม

## 6. กฎการออกแบบคลิป
- Story arc: hook → context → explanation → example → takeaway → outro
- Characters: character_id, master sheet, poses, expressions, audio voice id, brand colors; ทำให้หน้าตาคงที่ทุกฉาก
- ทุกฉากต้องมี scene_id, start/end หรือ duration, narration, visual instructions, text, animation preset, character actions, media refs, audio refs
- รองรับ subtitle safe area, responsive text, reading speed และ accessibility
- ห้ามสร้างข้อเท็จจริงอ้างอิงเองในสื่อการศึกษาหรือสรุปข่าว; ต้องมี fact check/แหล่งที่มาตรวจสอบได้
- ตรวจลิขสิทธิ์ภาพ เสียง เพลง ฟอนต์ ตัวละครก่อนเผยแพร่

## 7. Security & Governance
- Repo นี้เป็น **Public**: ห้าม commit PII นักเรียน, access token, Google credentials, service_role, private script หรือ URL เข้าถึงเนื้อหาลับ
- Public frontend ใช้เฉพาะ Supabase publishable key + RLS; privileged operations ผ่าน Edge Function/worker with auth
- ใช้ least-privilege Google Drive scope + dedicated destination folder; ปกป้อง OAuth token ฝั่ง server
- Supabase เปิด RLS ทุกตารางที่เผยแพร่; แยก roles editor, producer, reviewer, admin; QA ต้องบันทึกผู้ตรวจและเวลา
- Secrets และ API keys ผ่าน secret manager; audit log บันทึกเหตุการณ์สำคัญ

## 8. Deliverables & Definition of Done
- Source + docs + deployment guide + configured secrets template (.env.example ไม่ใช่ secret จริง)
- Sheet schema + example data ไม่ระบุตัวบุคคล, migrations + RLS, dashboard, worker, character presets, sample story
- End-to-end: 1 row sheet → approve script → queued → rendered MP4 → QA approved → uploaded Drive → verify download/playback → links & status consistent
- Tests: schema validation, Thai caption layout, audio sync, frame continuity, retry/idempotency, unauthorized access denial, upload verification
- DoD ต้องแสดงหลักฐานทดสอบและ URL ของแต่ละชิ้น; ห้ามรายงานว่าทำเสร็จหากยังไม่ตรวจหลักฐานจริง

## 9. Phase gates
- P0: สำรวจบัญชี/โควตา/สิทธิ์ระบบ + สิทธิ์ renderer/TTS, ยืนยัน folder Sheet และ security policy (ไม่เดาข้อมูล)
- P1: สร้างตัวละคร+scene template+story schema + ทดลองเรนเดอร์ตัวอย่างในเครื่อง
- P2: Supabase schema + worker queue + Drive integration + QA workflow
- P3: GitHub Pages dashboard + PWA + role permissions
- P4: ChatGPT command bridge + advanced AI scenes + metrics, costs, retry + operational hardening

## 10. แหล่งอ้างอิง
- GitHub billing: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- GitHub terms for Actions: https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features
- GitHub usage: https://docs.github.com/en/billing/tutorials/gather-insights
- Motion Canvas: https://github.com/motion-canvas/motion-canvas
- Remotion licensing: https://www.remotion.dev/docs/license/pricing
- Supabase docs: https://supabase.com/docs
- Google Drive uploads: https://developers.google.com/workspace/drive/api/guides/manage-uploads

## 11. เอกสารประกอบ
- [PROJECT_INSTRUCTIONS_V1.md](PROJECT_INSTRUCTIONS_V1.md)
- [ROADMAP_AND_QA.md](ROADMAP_AND_QA.md)
- [GITHUB_ACTIONS_COST_AND_POLICY.md](GITHUB_ACTIONS_COST_AND_POLICY.md)

## 12. ผลทดสอบการผลิตแรก (22 พ.ย. 2569)
- ทดลองคลิปต้นฉบับภาษาอังกฤษ **STORY-EN-001 / Lumi and the Lost Bunny** จำนวน 6 ฉาก ความยาว 50 วินาที แบบ 9:16
- ได้ MP4 จาก local vector/FFmpeg, เสียงสังเคราะห์ English offline, ซับฝังบนภาพ; QA ด้านไฟล์เบื้องต้น PASS และ upload Google Drive จริงแล้ว
- โฟลเดอร์ปลายทางปี 2569: https://drive.google.com/drive/folders/1mptg083MKUgLguzbsmWlhMqTW7BdrwNY
- โฟลเดอร์คลิปที่สร้างแล้ว: https://drive.google.com/drive/folders/1Cpb4Epc8iAmplFx8yVu1bwyRkpAlnLLl
- Google Sheet สำหรับ Script/Storyboard: https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit?usp=drivesdk
- MP4 Drive: https://drive.google.com/file/d/15bLE8DvnoV17hmL1Z7AYDFWAU950cOVN/view?usp=drivesdk
- **ยังไม่มี Supabase queue หรือ deployed worker**; ตัวอย่างทดสอบนี้ไม่ผ่านระบบคิวอัตโนมัติ; human QA ยังไม่ผ่าน ห้ามระบุว่าส่งมอบเป็นงานเผยแพร่แล้ว
- รายละเอียดหลักฐาน/QA: [PILOT_TEST_LOG_20261122.md](PILOT_TEST_LOG_20261122.md); config: [drive-storage.json](../config/drive-storage.json)

## 13. Image-first visual production gate — update 2026-11-22
- User reported Pilot v1 voice and scene visual quality unacceptable. **Do not reuse it as final**; classify as NeedsRevision (technical file validation remains PASS).
- Replace quick render-first flow for this project with: Script → Scene images 6 draft → **Human visual QA** → Enhanced English narration draft → **Voice QA** → Motion composition/MP4 v2 → Final QA → Drive upload/verification.
- Draft folder (6 uploaded PNGs): https://drive.google.com/drive/folders/1Des_VC-5FYDMLPXcN9tRESIQRRBX8b_k
- Google Sheet `Scenes!H1:M7` holds real Drive image ID, URL, draft status and voice status; `Story` tab records next approval gate.
- More details: [Visual Style Guide](VISUAL_STYLE_GUIDE.md), [Voice Guide](VOICE_GUIDE.md), [Visual QA Log](QA_VISUAL_ASSETS_20261122.md), [Image Manifest](../assets/STORY-EN-001_visual_draft_manifest_v1.json).
- All scene-image drafts **unapproved**; no v2 render started. Supabase and API-based worker integration remain NOT IMPLEMENTED.

## 14. Visual Animatic V2 test (22 พ.ย. 2569)
- Rendered an actual silent 50s 9:16 video using six previously uploaded scene stills, Ken Burns/Pan-Zoom, brief fairy lights and original English onscreen captions.
- Uploaded MP4 file ID `1p3uyTiY4SuLiP4IAohp0WOYbuO30cHwM`: https://drive.google.com/file/d/1p3uyTiY4SuLiP4IAohp0WOYbuO30cHwM/view?usp=drivesdk
- Technical evidence: 720x1280 H.264 / 20 fps / 50 sec / 4,277,209 bytes; no audio stream. Human scene review still PENDING.
- Draft folder: https://drive.google.com/drive/folders/1Gh7kvNn1xEQHIPOvkDEwGzeocZPLBD-s (MP4, contact sheet, timed SRT, local renderer copy).
- The renderer is in `tools/render_visual_animatic.py`; storyboard/voice direction and truthful status synced to Google Sheets `Story!A24:B31` and `Scenes!N1:O7`.
- **Do not interpret the silent animatic as a final narrated motion-graphics MP4**. No natural TTS service selected/connected; voice clips not produced and no editorial visual approval recorded.
- References: [QA report](ANIMATIC_V2_QA_20261122.md), [voice production brief](VOICE_PRODUCTION_REQUEST_STORY-EN-001.md), [animatic manifest](../assets/STORY-EN-001_animatic_v2_manifest.json).

## 15. User approved still images; free TTS architecture — 2026-11-22
- User explicitly accepted all six illustrations ("ภาพโอเคแล้ว") as image assets only; approval does NOT imply video visual timing, motion, narration or final QA.
- Six PNG copies in approved folder: https://drive.google.com/drive/folders/18nLmhtYKEAmYiwmSr19PCE4ESM8uo7dJ, verified 6/6. Original image drafts remain intact.
- Google Sheet has Approved statuses and links in `Scenes!J2:J7`, `Scenes!P1:Q7`, and `Story!B21`; no VoiceApproved status.
- Zero-paid-API option selected for evaluation: Kokoro-82M + kokoro-onnx local inference, no subscription. Azure Speech F0 (500k neural TTS characters/month free quota) is optional fallback needing account setup and eligibility checks.
- Prepared `tools/generate_voice_kokoro.py`, validated local dry run and sample sheet-export JSON; real model/voice files unavailable in current session, no new audio produced and no final v2.
- Decision and precise instructions: [FREE_TTS_DECISION_20261122.md](FREE_TTS_DECISION_20261122.md), [Approved manifest](../assets/STORY-EN-001_visual_approved_manifest_v1.json).

## 16. Cloud TTS direction — 2026-11-22
- User explicitly does not want to run any school computer for audio production. Stop advancing Kokoro local as the primary route.
- Evaluation route: Gemini Cloud TTS Free Tier in Google AI Studio for English S01; verify model and account quota, never activate paid tier without approval.
- Live S01 narration verified from Sheet, prompt and no-key-safe test harness committed to repo and copied to Drive.
- `python -m py_compile` PASS and `--dry-run` PASS; no real Gemini request sent because Google AI Studio sign-in/API key are not available via current tools. **Voice files 0, VoiceApproved=false**.
- Account ownership/Google AI Studio authorization must be completed securely before any live audio generation. [Trial evidence](GEMINI_TTS_SCENE01_TRIAL_20261122.md).
