# BWD Story Motion Studio

**AI Storytelling & Motion Graphics Video Production**  
โรงเรียนบ้านวังด้ง | แผนเริ่มต้น 22 พฤศจิกายน 2569

ระบบในแผน: สร้างคลิปสั้นเล่าเรื่องด้วยตัวละครประจำจากบท Google Sheets → แยก Storyboard เป็นฉาก → เข้าคิว Supabase → เรนเดอร์ด้วย Worker ภายนอก → ตรวจ QA → อัปโหลด Google Drive → เปิดดูและติดตามผ่าน GitHub Pages

> **Current status: Silent Visual Animatic V2 uploaded; human visual QA pending; voice not generated.** คลิป V1 ยัง NeedsRevision; มีภาพร่าง 6 ฉากและวิดีโอทดสอบแบบไม่มีเสียง V2 ใน Drive แต่ยังไม่มี production worker, Supabase queue หรือ GitHub Pages

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

## ขั้นต่อไป
ตรวจรับภาพและ Visual Animatic V2 เป็นรายฉาก → เชื่อม/บันทึกเสียงพากย์ภาษาอังกฤษที่ใช้งานได้จริง → QA เสียงและคำบรรยาย → จัดทำตัวละครเคลื่อนไหวและ MP4 ฉบับสมบูรณ์ → ตรวจ QA/อัปโหลด Drive; ระบบ Supabase/worker อัตโนมัติยังไม่ดำเนินการ

## ความปลอดภัย
Repository เป็น Public: **ห้าม commit credentials, tokens, ข้อมูลนักเรียนหรือบทลับ**. Secrets จัดเก็บบน backend; frontend ใช้ Supabase publishable key และ RLS เท่านั้น
