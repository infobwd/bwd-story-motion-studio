# BWD Story Motion Studio

**AI Storytelling & Motion Graphics Video Production**  
โรงเรียนบ้านวังด้ง | แผนเริ่มต้น 22 พฤศจิกายน 2569

ระบบในแผน: สร้างคลิปสั้นเล่าเรื่องด้วยตัวละครประจำจากบท Google Sheets → แยก Storyboard เป็นฉาก → เข้าคิว Supabase → เรนเดอร์ด้วย Worker ภายนอก → ตรวจ QA → อัปโหลด Google Drive → เปิดดูและติดตามผ่าน GitHub Pages

> **Current status: Pilot uploaded / human QA pending.** ผลิตคลิปทดสอบจริงและอัปโหลด Google Drive ได้แล้วโดยใช้เครื่องเรนเดอร์เฉพาะกิจ ยังไม่มีระบบ Queue/Supabase, GitHub Pages หรือ Worker แบบอัตโนมัติ

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
- สถานะ: **อัปโหลดและ technical QA ผ่าน / รอ human QA** ไม่ใช่ระบบผลิตอัตโนมัติและยังไม่ได้เปิดเผยแพร่เป็นสื่อฉบับสมบูรณ์

## ขั้นต่อไป
กำหนดโปรเจกต์ Supabase และเชื่อม Secure Rendering Worker; ปรับเสียงพากย์ภาษาอังกฤษให้เหมาะกับผู้เรียนและเปิดขั้นตอนตรวจรับก่อนเผยแพร่

## ความปลอดภัย
Repository เป็น Public: **ห้าม commit credentials, tokens, ข้อมูลนักเรียนหรือบทลับ**. Secrets จัดเก็บบน backend; frontend ใช้ Supabase publishable key และ RLS เท่านั้น
