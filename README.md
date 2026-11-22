# BWD Story Motion Studio

**AI Storytelling & Motion Graphics Video Production**  
โรงเรียนบ้านวังด้ง | แผนเริ่มต้น 22 พฤศจิกายน 2569

ระบบในแผน: สร้างคลิปสั้นเล่าเรื่องด้วยตัวละครประจำจากบท Google Sheets → แยก Storyboard เป็นฉาก → เข้าคิว Supabase → เรนเดอร์ด้วย Worker ภายนอก → ตรวจ QA → อัปโหลด Google Drive → เปิดดูและติดตามผ่าน GitHub Pages

> **Current status: Google Sheets VoiceQueue staged / Apps Script source and 11 mock tests completed / NOT DEPLOYED.** ภาพอนุมัติ 6/6 และมี Visual Animatic V2 ไม่มีเสียง; ระบบยังต้องติดตั้ง Google Apps Script และตรวจบัญชี Free Tier

## เอกสารที่ควรอ่าน
- [Master Plan / Architecture](docs/MASTER_PLAN.md)
- [ChatGPT Project Instructions v1.0 (ไม่เกิน 8,000 ตัวอักษร)](docs/PROJECT_INSTRUCTIONS_V1.md)
- [Implementation Roadmap & QA](docs/ROADMAP_AND_QA.md)
- [GitHub Actions Quota, Cost & Policy](docs/GITHUB_ACTIONS_COST_AND_POLICY.md)

## ชื่อ ChatGPT Project
**BWD Story Motion Studio — AI Video Production**

ให้นำข้อความส่วน Project Instructions ใน `docs/PROJECT_INSTRUCTIONS_V1.md` ไปใส่ที่ ChatGPT Project > Instructions เมื่อสร้าง Project

## สถาปัตยกรรมโดยสรุป
| Component | Responsibility |
|---|---|
| Google Sheets | ต้นฉบับบท/ฉากและเวอร์ชัน |
| GitHub | โค้ด, แผน, Character Library, Presets |
| Supabase | Auth, งานผลิต, QA, audit |
| GitHub Pages | Dashboard/PWA บนมือถือ |
| External Worker | Render Motion Canvas/FFmpeg และ upload |
| Google Drive | MP4 และไฟล์ส่งมอบ |
| ChatGPT/Plugins | วิเคราะห์บท ออกแบบฉาก สั่งงานตามสิทธิ์ |

### คำเตือนเรื่อง GitHub Actions
Actions บน Standard runners สำหรับ Public Repo ฟรีในแง่ billable minutes แต่ **ไม่ควรใช้เป็นบริการผลิตวิดีโอต่อเนื่อง** ตามข้อจำกัด GitHub Terms สำหรับ hosted runners ใช้ Actions สำหรับ build/test/deploy ซอฟต์แวร์แทน รายละเอียด [เอกสารนโยบายและต้นทุน](docs/GITHUB_ACTIONS_COST_AND_POLICY.md)

## คลิปทดสอบ STORY-EN-001 (22 พฤศจิกายน 2569)
- [ดูวิดีโอ MP4 บน Google Drive](https://drive.google.com/file/d/15bLE8DvnoV17hmL1Z7AYDFWAU950cOVN/view?usp=drivesdk)
- [บทและ Storyboard บน Google Sheets](https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit?usp=drivesdk)
- [โฟลเดอร์จัดเก็บไฟล์](https://drive.google.com/drive/folders/1Cpb4Epc8iAmplFx8yVu1bwyRkpAlnLLl)
- [บันทึก QA และรายละเอียดไฟล์](docs/PILOT_TEST_LOG_20261122.md)
- [Storage config](config/drive-storage.json), [Original story snapshot](stories/STORY-EN-001.json)
- **[ภาพร่าง 6 ฉาก (PNG)](https://drive.google.com/drive/folders/1Des_VC-5FYDMLPXcN9tRESIQRRBX8b_k)** — อัปโหลดครบและตรวจขนาด/รายการไฟล์แล้ว รออนุมัติภาพ
- [Visual manifest](assets/STORY-EN-001_visual_draft_manifest_v1.json) · [Visual Style Guide](docs/VISUAL_STYLE_GUIDE.md) · [Voice Direction](docs/VOICE_GUIDE.md) · [Visual QA log](docs/QA_VISUAL_ASSETS_20261122.md)
- [Visual Animatic V2 (ไม่มีเสียง)](https://drive.google.com/file/d/1p3uyTiY4SuLiP4IAohp0WOYbuO30cHwM/view?usp=drivesdk) · [ภาพรวม 6 ฉาก](https://drive.google.com/file/d/1ESOLGiZHNzgxJ0LnN4V0FsHVDuFTWvj4/view?usp=drivesdk) · [SRT draft](https://drive.google.com/file/d/160zZMR1toRimzjAtXJOKoLBtt2yesxE_/view?usp=drivesdk)
- [Animatic renderer source](tools/render_visual_animatic.py) · [V2 QA](docs/ANIMATIC_V2_QA_20261122.md) · [Voice production brief](docs/VOICE_PRODUCTION_REQUEST_STORY-EN-001.md)
- สถานะ: **Pilot v1 NeedsRevision; V2 เป็นภาพเคลื่อนไหวและคำบรรยายแบบ Silent Draft เท่านั้น** รอ VisualApproval และบริการเสียงพากย์คุณภาพดี ก่อนทำ MP4 final

## อัปเดตภาพและเสียง 22 พ.ย. 2569
- [ภาพ Approved ครบ 6/6](https://drive.google.com/drive/folders/18nLmhtYKEAmYiwmSr19PCE4ESM8uo7dJ) · [Approved Manifest](assets/STORY-EN-001_visual_approved_manifest_v1.json)
- **ทางเลือกเสียงที่คัดเลือก**: [Kokoro-82M Offline TTS](docs/FREE_TTS_DECISION_20261122.md) (โมเดล Apache-2.0, wrapper MIT, ไม่เสียค่า API; ต้องมีเครื่องติดตั้ง)
- [สคริปต์เสียง](tools/generate_voice_kokoro.py) และ [ตัวอย่าง export จาก Google Sheet](examples/STORY-EN-001_sheet_export_for_voice_20261122.json) — Python compile + dry-run PASS, ไม่มีไฟล์เสียงที่ผลิตจริง
- [Google Drive เอกสารเตรียมเสียง](https://drive.google.com/drive/folders/122SYWkyqHgXSe6-aFD8XYyBJbGDSv2rb)

## ทดลอง Gemini Cloud TTS ฟรี (22 พ.ย. 2569)
- ผู้ใช้ระบุ **ไม่ใช้เครื่องคอมพิวเตอร์โรงเรียน** ดังนั้น Kokoro Local เป็นทางเลือกสำรอง ไม่ใช่ตัวเลือกหลักปัจจุบัน
- เลือกทดสอบ Gemini Free Tier ใน [Google AI Studio](https://aistudio.google.com/welcome) เฉพาะ S01 ก่อน ไม่เปิด Paid Tier
- [รายงานการทดสอบ Gemini S01](docs/GEMINI_TTS_SCENE01_TRIAL_20261122.md) · [Script ทดสอบ API](tools/generate_gemini_s01_trial.py) · [Voice Prompt](examples/STORY-EN-001_S01_GEMINI_TTS_PROMPT.txt)
- **Dry Run ผ่าน แต่ยังไม่มีการเข้าสู่ระบบบัญชี Google AI Studio หรือ API Key ที่อนุญาตให้เรียก จึงยังไม่มีเสียงจริง**

## ขั้นต่อไป
ลงชื่อเข้าใช้ Google AI Studio อย่างปลอดภัย → ทดลองเสียง S01 ภายใต้ Free Tier → QA ฟังเสียง → ถ้าผ่านจึงผลิตครบ 6 ฉากและเรนเดอร์ MP4; ระบบ Queue/Worker อัตโนมัติยังไม่ดำเนินการ

## ความปลอดภัย
Repository เป็น Public: **ห้าม commit credentials, tokens, ข้อมูลนักเรียนหรือบทลับ**. Secrets จัดเก็บบน backend; frontend ใช้ Supabase publishable key และ RLS เท่านั้น

## Voice Queue (Google Apps Script Cloud MVP v0.1.0 — not deployed)
- **คิวสร้างจริงใน Google Sheets แล้ว:** [Story Sheet → VoiceQueue / VoiceEvents](https://docs.google.com/spreadsheets/d/1FwQK1zftNFEI0gIX7V-Pfwo6Dl9JSHld0IXnExC69do/edit)
- Job ทดสอบแรก `VOICE-STORY-EN-001-S01-5fa460d8` = **PendingSetup**; ยังไม่ได้ยิง Gemini API หรือสร้าง WAV
- [Google Apps Script Worker source](apps-script/Code.gs) · [Manifest](apps-script/appsscript.json) · [Mock tests 11/11](tests/queue.test.cjs)
- [คู่มือติดตั้งครั้งเดียว](docs/APPS_SCRIPT_VOICE_WORKER_SETUP.md) · [ผล QA และ blocker](docs/APPS_SCRIPT_VOICE_MVP_QA_20261122.md)
- [โฟลเดอร์ติดตั้งใน Drive](https://drive.google.com/drive/folders/16R01HlPdMe_gprIux84Qe2Cw7EVM4Q0D)
- ข้อจำกัด: **ยังไม่สามารถสร้างโปรเจกต์ Apps Script และอนุญาต OAuth แทนเจ้าของบัญชีผ่านเครื่องมือที่เชื่อมในแชทนี้** จึงยังไม่มี trigger หรือเสียงที่ผลิตผ่าน worker จริง และห้ามอ้างว่าระบบอัตโนมัติใช้งานได้แล้ว
- ไม่ใช้คอมพิวเตอร์โรงเรียน; หลังติดตั้งครั้งแรก ChatGPT ส่งคิวผ่าน Sheets, Apps Script polling ทุก 5 นาที, Gemini Free Tier สร้างเสียง (ถ้าโครงการไม่มี Billing), เก็บ WAV ลง Drive และรอตรวจเสียง
