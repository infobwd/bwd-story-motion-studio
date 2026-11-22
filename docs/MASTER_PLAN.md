# BWD Story Motion Studio — Master Plan v1.0
วันที่: 22 พฤศจิกายน 2569 | สถานะ: Approved direction / Planning only
Project: **BWD Story Motion Studio — AI Video Production**
Repository: https://github.com/infobwd/bwd-story-motion-studio

> โครงการนี้ยังไม่ใช่ระบบผลิตคลิปที่ใช้งานได้จริง เอกสารนี้เป็นหลักการออกแบบและแผนดำเนินการเท่านั้น

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
