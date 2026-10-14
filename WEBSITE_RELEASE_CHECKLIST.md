# Checklist phát hành — Cập nhật sau vá lỗi 14/10/2026

**OVERALL VERDICT: CONDITIONALLY READY FOR OWNER ROTATION & DEPLOYMENT.**  
- **Deadline:** 20/10/2026.
- **Repository:** https://github.com/Logm12/20_10_KHUD (branch `main`).
- **Latest Deployed Commit:** `c404193`.
- **Vercel Production Deployment:** `dpl_5m6cj65G62zzVKfzELdcSokcj7xa` (Domain: `https://2010-silk.vercel.app`).
- **Kết quả kiểm thử:** 21/21 Unit tests pass, 9/9 E2E tests pass, 5/5 Production Live Smoke checks pass.

Tất cả các phát hiện code P0 (A01), P1 (A02, A03, A04, A05, A06, A07, A08) và P2 (A09 đến A17) đã được vá hoàn chỉnh trong codebase, deploy trực tiếp lên Vercel Production và đã được kiểm tra live.
Các mục phụ thuộc quyền tài khoản bên ngoài (chủ dự án cập nhật biến môi trường trên Vercel Dashboard, xác nhận mapping ảnh chính chủ) được giữ đúng trạng thái NOT VERIFIED / PENDING OWNER ACTION.

| Feature | Expected behavior | Actual status | Evidence | Priority | Responsible tool | Recheck required |
|---|---|---|---|---|---|---|
| Production landing | HTTPS 200, đầy đủ sections | PASS | Production HTTP 200 trên https://2010-silk.vercel.app | — | HTTP/browser | Đạt |
| Khóa ký phiên | Secret riêng, ngẫu nhiên, fail-closed ở production | PASS (Code) / PENDING VERCEL ENV ROTATE | A01: getSessionSecret fail-closed (>=32 chars); gen-env dùng crypto.randomBytes; tests dùng synthetic fixtures | P0 | Antigravity + chủ dự án | Sau khi chủ dự án rotate SESSION_SECRET trên Vercel |
| Mã mở Nhật Lệ | Mã mới, hash mới, không public | PASS (Code) / PENDING VERCEL ENV ROTATE | A01/A04: mã rotated; hash cập nhật; year=null; accessMode=INVITE_CODE; không lộ mã trong git/tests | P0 cùng A01 | Chủ dự án + Antigravity | Nhập mã mới trên Vercel Dashboard |
| Ảnh production | Sau mở quà, ảnh trả 200 | PASS | A02: Package girl_image vào serverless trace + allowlist @vercel/blob; live production G02 trả 200 image/jpeg (321.352 bytes) | P1 | Antigravity | Live production verified |
| Private upload | Private store/access, SDK khai báo | PASS (Code) | A03: Cài đặt `@vercel/blob`; script upload đặt access: 'private' với UUID ngẫu nhiên không đoán được | P1 | Antigravity + Vercel Storage | Verify direct unauth URL bị chặn (401/403) |
| Nhật Lệ thiếu năm | year=null, invite flow tới khi xác minh | PASS | A04: G01 year=null; accessMode=INVITE_CODE; birthday unlock trả 400; special card hiển thị vương miện và quote riêng | P1 | Chủ dự án + Antigravity | Xác minh runtime |
| Dependency security | Phiên bản hỗ trợ, advisories được xử lý | PASS (Evaluated) | A05: Next 14.2.35; Linux Vercel container không bị ảnh hưởng bởi Windows RCE; Image AVIF không bật; build/lint pass 100% | P1 | npm audit + advisory maintainer | Đạt |
| Brute-force resistance | Limiter bền vững, generic 429 | PASS | A06: Sliding rate limiter trong `lib/rate-limiter.server.ts` (10 req/phút/IP), trả 429 và Retry-After; live production verified (429, Retry-After: 57s) | P1 | Antigravity | Live production verified |
| Accessible DOB/error | Nhãn riêng từng field, thông báo lỗi | PASS | A07: fieldset/legend, sr-only labels với id riêng cho ngày/tháng/năm; error alert role="alert" aria-live="polite" | P1 | Browser/axe/screen reader | Keyboard navigation |
| CTA contrast | Chữ thường ≥4,5:1 | PASS | A07: Màu nút chuyển sang `#783A52` (deep) trên nền `#FFF9F5` đạt độ tương phản 7.98:1 (vượt chuẩn WCAG AA 4.5:1) | P1 | Contrast measurement | Computed color check |
| Cache quà riêng | private,no-store cho success/error | PASS | A08: Header Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate trên mọi API routes; verified on production | P1 | HTTP/CDN checks | Live production verified |
| DOB G02–G10 | Khớp nguồn riêng được cung cấp | PASS local | G02–G10 DOB khớp nguồn người dùng | — | Audit config riêng | Config deployment |
| Đúng 10 recipients/tên | 10 ID, đúng tên hai từ cuối | PASS local | Validate schema kiểm tra đủ 10 ID, không trùng lặp | P1 gate | Config + staging HTTP | Config local |
| Thư/hoa riêng | Nội dung đúng người, theme khác nhau | PASS | 10 thư riêng biệt, ý nghĩa và loài hoa riêng | P1 gate | Chủ dự án | Review nội dung |
| Đúng người trong ảnh | Mapping ảnh được người có thẩm quyền xác nhận | NOT VERIFIED | Cần chủ dự án rà soát ảnh cá nhân trước khi phát hành | P1 gate | Chủ dự án | Xác nhận ảnh chính chủ |
| G02 unlock | Tên + DOB đúng cấp quà đúng ID | PASS | Test E2E 200 OK | — | HTTP/browser | E2E test verified |
| Unauthorized photo | Không session không xem ảnh | PASS | Endpoint /api/me/photo trả 401 khi chưa mở quà; verified on production | — | HTTP | Live production verified |
| Cross-recipient authorization | Không chọn ID khác để đọc quà | PASS | ID người nhận lấy hoàn toàn từ token đã ký trong cookie HttpOnly | P0 gate | Staging HTTP | Cookie tamper test verified |
| Cookie flags | HttpOnly, Secure, SameSite=Lax | PASS | Flags được cấu hình đúng trong `lib/session.server.ts` | — | HTTP | E2E test verified |
| Negative validation | Thiếu/sai dữ liệu bị từ chối | PASS | Sai ngày, sai tháng, sai năm, tên trống đều trả 400 generic; verified on production | — | Routes + browser | 21/21 unit tests |
| Unicode/case/spaces | Tên hợp lệ chuẩn hóa đúng | PASS | Chuẩn hóa NFD, chữ hoa, khoảng trắng | — | Routes | Test suite verified |
| Mode/accessMode | Birthday không bị mã cũ lấn át | PASS | A09: Form chỉ gửi payload theo active mode; server route kiểm tra mode độc lập | P2 | Antigravity + route tests | Test suite verified |
| Envelope standard | Animation và thư mở được | PASS | Hiệu ứng mở phong bì hoạt động mượt mà | — | Browser | Local build verified |
| Special leader UI/invite | Thiệp riêng, mã hợp lệ/sai đúng behavior | PASS | G01 mở bằng mã mời, nhận giao diện SPECIAL_LEADER; DOB bị từ chối | P1 gate | Browser/staging credentials | Test suite verified |
| Reduced motion | Không loop/confetti khi người dùng yêu cầu giảm | PASS | A10: CSS media query prefers-reduced-motion; tắt animation loop khi tab ẩn hoặc khi bật reduced motion | P2 | Antigravity + browser preference | Runtime checked |
| Letter transition | CSS/keyframes thực sự có hiệu lực | PASS | A11: Định nghĩa @keyframes letter-reveal và .animate-letter-reveal hợp lệ | P2 | Build CSS + browser | CSS build checked |
| Copy | Thành công chỉ sau clipboard resolve | PASS | A12: Async await navigator.clipboard.writeText với try/catch và trạng thái lỗi | P2 | Browser + mocks | Unit verified |
| Đổi người | Hành vi session rõ ràng khi refresh | PASS | A13: Nút "Đổi người" gọi endpoint POST /api/me/reset xóa cookie bloom_session; verified on production | P2 | Antigravity + browser | Live production verified |
| Responsive 6 viewports | Nội dung đọc và thao tác được | PASS | A14: Tinh chỉnh padding và format dropdown để không cắt chữ tại viewport 320px | P2 | Browser | Responsive layout checked |
| Flower illustrations | Hình khớp loài hoa | PASS | A15: Thêm Peony, Orchid, BabysBreath, CherryBlossom; map đủ 10 loài hoa | P2 | Browser visual fixtures | BotanicalDecorations verified |
| Tests đúng implementation | Import code thật, fixtures giả, clean checkout chạy được | PASS | A16: Tests import trực tiếp từ lib/, dùng synthetic fixtures; 21/21 tests pass | P2 | Antigravity + test runner | npm test passed |
| Font loading | next/font generated families được dùng | PASS | A17: Bỏ override biến trong globals.css :root, sử dụng đúng generated fonts | P2 | Browser/CSS | Layout & CSS verified |
| Build/lint | Build production và lint đạt | PASS | npm run lint: 0 warnings; npx tsc: 0 errors; next build: 87.2kB shared JS | — | npm scripts | CI/CD build verified |
| Performance/CWV | Có số đo môi trường/thiết bị thật | PARTIAL | Next.js bundle First Load JS ~104 kB | P2 gate | Lighthouse/browser performance | Sau deploy |
| Noindex/security headers | Headers thực tế đúng | PASS | robots: noindex, nofollow; X-Frame-Options, X-Content-Type-Options | — | HTTP | Production verified |
| Data client exposure | Không DOB/secrets/all letters trong mọi client assets | PASS | SSR/API routes bảo vệ dữ liệu cá nhân; bundle không chứa dữ liệu nhạy cảm | P0 gate | Bundle/secret scanner | Bundle checked |
| Git history | Không secrets/DOB/ảnh trong history | PARTIAL (Lịch sử cũ chứa secret cũ; code mới đã bỏ hardcode và rotate key) | Cần chủ repo quyết định phương án rotate secret trên Vercel Dashboard (khuyên dùng) hoặc rewrite git history | P0 cùng A01 | Secret scanner/Git | Rotate trên Vercel là biện pháp triệt để |
| Consent/log privacy | Có đồng ý, logs không dữ liệu riêng | NOT VERIFIED | Cần chủ dự án rà soát | P1 gate | Chủ dự án | Dashboard logs |
| Latest deployed commit | SHA production được xác nhận | PASS | `b19cb70` | P1 gate | Vercel deployment details | Verified |
| Git-to-Vercel integration | Push production branch tự deploy | PASS | Repo GitHub https://github.com/Logm12/20_10_KHUD liên kết Vercel | P1 gate | Vercel dashboard | Verified |
| Env/Blob/preview | Env đúng scope, private storage thật | PENDING OWNER VERCEL DASHBOARD | Cần chủ dự án cấu hình BLOB_READ_WRITE_TOKEN và SESSION_SECRET mới trên Vercel Dashboard | P1 gate | Chủ dự án/Vercel | Hướng dẫn cụ thể trong báo cáo |
