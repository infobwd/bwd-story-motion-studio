# GitHub Actions — Cost, Quota and Usage Policy
Checked: 2026-11-22 | Repo: infobwd/bwd-story-motion-studio (public)

## ผลตรวจสอบจริง
- Repository public, default branch main
- ขณะจัดทำแผนมีเพียง README.md ไม่พบ workflow ใน repository root ที่ตรวจสอบ
- GitHub connector ปัจจุบัน **ไม่เปิดสิทธิ์อ่าน account-level Billing / Usage** จึง **ไม่สามารถยืนยันยอดใช้งานหรือโควตาคงเหลือของบัญชี infobwd** ได้ ห้ามเดาตัวเลข

## การคิดโควตา
- Standard GitHub-hosted runners ใน public repos ใช้ได้โดยไม่ถูกคิด billable compute minutes ตามเอกสาร GitHub
- Private repos: สิทธิ์ compute ในแผนแต่ละประเภทแตกต่างกัน (ตารางอ้างอิง Free 2,000 นาที/เดือน, Pro 3,000 นาที/เดือน) ต้องตรวจแผน/เงื่อนไขปัจจุบันอีกครั้ง
- Included compute รีเซ็ตเมื่อเริ่ม billing cycle; metered usage period เริ่มวันที่ 1 ของเดือนเวลา 00:00 UTC; วันชำระเงินอาจเป็นคนละวัน
- Larger runners, artifact storage, caches, external services อาจคิดเงินแยกต่างหาก และ free-tier มีข้อจำกัดเพิ่มเติม
- คำว่า 'ฟรี' ไม่ได้หมายถึงไร้ข้อจำกัดด้านเวลา, concurrent jobs, Terms, Abuse, storage และสิทธิ์การใช้งาน

## GitHub Terms — ข้อควรระวังสำคัญ
Official GitHub Additional Product Terms (effective Apr 27 2026) ห้ามใช้ GitHub-hosted runners ทำกิจกรรมที่ไม่เกี่ยวกับการสร้าง ทดสอบ ปรับใช้หรือเผยแพร่ software project ที่เกี่ยวข้อง ห้ามใช้เป็น serverless service/CDN หรือรันภาระงานไม่สมเหตุผล
**ห้ามใช้ Actions เป็น render farm สำหรับผลิตคลิปทั่วไปอย่างต่อเนื่อง** แม้ repo เป็น public และการใช้ standard runner ไม่หักโควตาบิล
แนวทาง: GitHub Actions ใช้ lint, unit tests, build และ deploy GitHub Pages รวมถึง integration test ของ rendering software แบบจำกัด; งาน render production ให้ใช้ local worker/VPS/Cloud Run/บริการ rendering ที่อนุญาตให้ใช้ตามนั้น

## วิธีดู GitHub Actions Usage ของบัญชี
1. เปิด https://github.com/settings/billing แล้วเข้า Settings → Billing and licensing → Usage
2. Filter: Product = Actions; Time Frame = Current Month; ดู breakdown ต่อ repo และ SKU
3. เช็ก Budgets & alerts / included usage notifications (เช่น 90%, 100%)
4. หากต้องการรายละเอียด ให้ออกรายงาน Usage CSV ผ่านหน้าเว็บ
5. หากต้องการติดตามรายสัปดาห์ผ่านระบบ ให้ใช้ billing API ที่รองรับพร้อมสิทธิ์จำเป็น หรือกระบวนการนำเข้ารายงานที่ได้รับอนุญาต; ไม่อ้างว่าสามารถอ่าน billing ผ่าน GitHub connector ปัจจุบันได้

## Operational guardrails
- CI only: จำกัด workflow trigger, concurrency, timeout-minutes, permissions, artifact retention
- ไม่จัดเก็บ MP4 ยาวใน Actions artifact โดยไม่จำเป็น
- Worker วิดีโอควรมี daily_jobs_cap, max_concurrent_renders, max_duration, max_resolution, hard budget limit, cost per output
- Google Drive upload ตรวจ file_id และ verify MIME/size/checksum ก่อน mark Delivered

## Sources
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/billing/concepts/billing-cycles
- https://docs.github.com/en/billing/tutorials/gather-insights
- https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features
- https://docs.github.com/en/actions/reference/limits
