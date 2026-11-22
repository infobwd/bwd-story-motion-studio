# BWD Story Motion Studio

**AI Storytelling & Motion Graphics Video Production**  
โรงเรียนบ้านวังด้ง | แผนเริ่มต้น 22 พฤศจิกายน 2569

ระบบในแผน: สร้างคลิปสั้นเล่าเรื่องด้วยตัวละครประจำจากบท Google Sheets → แยก Storyboard เป็นฉาก → เข้าคิว Supabase → เรนเดอร์ด้วย Worker ภายนอก → ตรวจ QA → อัปโหลด Google Drive → เปิดดูและติดตามผ่าน GitHub Pages

> **Current status: Planning only.** ยังไม่มีระบบเว็บหรือ Worker ที่ผลิตวิดีโอสำเร็จจริง; Repository เริ่มต้นสำหรับจัดเก็บแผนและพัฒนาต่อ

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

## ขั้นต่อไป
เริ่ม P0 ยืนยัน Spreadsheet ID, Supabase project, Drive folder, Worker location และค่าใช้จ่าย ก่อนลงมือเขียนระบบจริง

## ความปลอดภัย
Repository เป็น Public: **ห้าม commit credentials, tokens, ข้อมูลนักเรียนหรือบทลับ**. Secrets จัดเก็บบน backend; frontend ใช้ Supabase publishable key และ RLS เท่านั้น
