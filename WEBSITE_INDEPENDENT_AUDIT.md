# Kiểm định độc lập — The Secret Bloom

**OVERALL VERDICT: NOT READY**  
Ngày kiểm tra: 14/10/2026, múi giờ Asia/Saigon. Hạn phát hành: 20/10/2026.

## 1. Kết luận điều hành

Website production hoạt động, giao diện hoa vintage có bản sắc và luồng xác thực G02 trả đúng tên, thư, hoa. Tuy nhiên, **khóa ký phiên đang dùng trên production chính là khóa cố định được Git theo dõi**. Đây là P0: cơ chế bảo vệ thư riêng không còn đáng tin cậy. Ảnh G02 còn trả 404 dù đã xác thực thành công. Không nên gửi website cho người nhận ở trạng thái hiện tại.

Có **17 phát hiện: 1 P0, 7 P1, 9 P2, 0 P3**. P0 được xác minh bằng cách kiểm tra chữ ký của cookie hợp lệ do máy chủ cấp; không tạo cookie giả, không đổi ID trong cookie và không truy cập quà người khác trên production.

| Nhóm | Trạng thái | Kết quả chính |
|---|---|---|
| UI/UX | PARTIAL | Có hero, form, wall, closing; thiệp standard quan sát bằng dữ liệu giả; font/contrast/animation còn vấn đề |
| Mobile | PARTIAL | Đã quan sát đủ kích thước yêu cầu; tháng bị cắt chữ tại 320px |
| Gift Unlock | PARTIAL | Production G02 thành công qua HTTP; luồng browser đầy đủ kiểm tra ở local với dữ liệu giả |
| Personalization | PARTIAL | Local đủ 10 ID, tên đúng, thư/hoa khác nhau; G01 có năm chưa được nguồn yêu cầu xác minh |
| Photos | FAIL | Production G02 trả 404; local 10 ảnh trả 200 nhưng chưa xác nhận đúng người |
| Security | FAIL | Khóa production nằm trong Git; thiếu giới hạn lượt thử; cache quà dùng public |
| Performance | PARTIAL | Build đạt, có số liệu kích thước JS; chưa đo Lighthouse/CWV |
| Vercel | PARTIAL | URL và headers hoạt động; chưa xác minh deployment SHA, dashboard, Blob, Git integration |
| GitHub | FAIL | Remote main khớp local; secrets tồn tại trong file được theo dõi |

**Biện pháp khẩn cấp đề xuất:** chủ dự án tạm vô hiệu hóa hoặc bảo vệ các API quà riêng; thay SESSION_SECRET và mã mở thư đã lộ; cập nhật cả hash mã mời; redeploy bản sửa để các cookie cũ mất hiệu lực. Xóa giá trị khỏi source không thu hồi được giá trị đã nằm trong lịch sử Git. Audit này không thực hiện containment, sửa source, commit, push hoặc deploy.

## 2. Phạm vi và bằng chứng

- Workspace: `E:\20_10`.
- Production do người dùng cung cấp: https://2010-silk.vercel.app/.
- Repository: https://github.com/Logm12/20_10_KHUD.
- Local HEAD và remote HEAD/main cùng là `086d6bfa16fec9b65d3b1dafa0ce8c34e220617b`.
- Working tree sạch trước audit. Chỉ ba báo cáo được tạo; build sinh lại output bị Git ignore.
- Trình duyệt: Codex in-app browser, Chromium; screenshot và DOM thực tế, không giả lập chỉ bằng CSS source.
- Local HTTP: production build Next.js 14.2.35, Node.js 22.19.0, Windows; cổng 3001 với cấu hình hiện có.
- Local browser: cùng production build, cổng 3002, cấu hình thay trong bộ nhớ bằng một người nhận giả; không sửa cấu hình thật, không có ảnh hoặc thư cá nhân.
- Production positive: người dùng đã cho phép rõ ràng dùng G02 đúng một lần để mở quà và đọc kết quả riêng. Không thử mã Nhật Lệ lấy từ Git trên production, không brute force, không chạy ma trận 10 người trên production.
- Bằng chứng trong báo cáo chỉ gồm trạng thái, ID và kết quả so sánh. Không ghi ngày sinh, secrets, cookie, thư riêng hoặc đường dẫn ảnh cá nhân.

Các mã bằng chứng được dùng xuyên suốt:

| Mã | Kiểm tra độc lập | Kết quả |
|---|---|---|
| E01 | Git status/log/ls-files và ls-remote | HEAD/main khớp; generator secrets đã có từ commit `f8a3e30` |
| E02 | Đối chiếu cấu hình private, chỉ xuất boolean/ID | 10 ID; 10 tên hiển thị đúng; 10 thư/hoa khác nhau; G02–G10 DOB khớp nguồn người dùng; G01 có năm và BOTH |
| E03 | HTTP production + kiểm tra chữ ký cookie được cấp hợp lệ | Home 200; unlock G02 200; đúng ID/thư/hoa; chữ ký khớp khóa trong generator |
| E04 | HTTP API production, có và không có phiên | Không phiên: gift 200/auth chưa mở, photo 401; có phiên G02: gift 200, photo 404 |
| E05 | Browser production, screenshot/DOM | Đủ 6 kích thước; CTA tới form; empty form bị chặn; labels DOB thiếu; tháng mobile cắt chữ |
| E06 | HTTP local, route thật | 10/10 ID mở theo cấu hình; 10/10 ảnh 200; negative cases và Unicode; query ID khác bị bỏ qua |
| E07 | Browser local, fixture giả | Mở phong thư, thiệp, copy, replay, reload và đổi người; reload khôi phục phiên cũ |
| E08 | npm test/lint/build | 14/14 unit tests đạt; lint đạt; build đạt |
| E09 | npm audit --omit=dev và nguồn advisory chính thức | 2 package có cảnh báo: next critical, postcss high; điều kiện khai thác phải xét riêng |
| E10 | CSS build + computed style production | Thiếu animate-in/fade-in/slide-in/sm:w-88; thiếu reduced-motion; CTA contrast 2,91:1; font variables bị ghi đè |
| E11 | 7 script từ HTML production, tải để đọc, không chạy | 464.185 byte sau giải nén; không thấy nguyên văn thư private hoặc assignment SESSION_SECRET trong mẫu đã kiểm tra |

## 3. Repository và kiến trúc

Kiến trúc Next.js App Router đơn giản, phù hợp quy mô 10 người: server routes xác thực và proxy ảnh, client components cho form/thiệp. TypeScript strict, build/lint đều đạt. Không thấy overengineering đáng kể; framer-motion được khai báo nhưng không thấy dùng trong components đã đọc.

`recipients.server.ts` đọc config từ env/private file và `toPublicGift` không trả DOB, hash mã mời hoặc đường dẫn lưu ảnh. Các client component không import runtime module private. Tuy nhiên, hậu tố `.server.ts` chưa có guard `server-only`, nên nên thêm để tránh import nhầm trong tương lai; chưa thấy leak client do lỗi này hiện tại.

Config loader chỉ kiểm tra array không rỗng, không kiểm tra schema, ID trùng, tính hợp lệ của accessMode hoặc đủ 10 recipients. Nếu cấu hình không dùng được, loader trả DEMO01. Đây là rủi ro vận hành được xác minh ở source, chưa xác minh đang xảy ra trên production. Production G02 đã chạy nên không phải bằng chứng production chỉ có demo.

Session dùng HMAC, so sánh constant-time, cookie HttpOnly/Secure/SameSite=Lax. Photo route lấy ID từ cookie, không lấy ID người nhận từ query. Phân quyền này bị suy yếu nghiêm trọng bởi A01. Payload session cũng chưa kiểm tra schema chặt chẽ; cần kiểm tra recipientId/iat/exp khi sửa bảo mật.

Không thấy `.env.local`, config private hoặc ảnh cá nhân trong danh sách file tracked hiện tại và các tên đường dẫn lịch sử của refs local đã có. **Không kết luận lịch sử Git sạch**: secrets xuất hiện trực tiếp trong generator và mã mời trong test scripts; chưa quét forensic toàn bộ blob, refs đã xóa hoặc fork.

README mô tả private Blob và key ngẫu nhiên nhưng implementation không đáp ứng. Unit tests copy lại logic thay vì import implementation thật; dữ liệu G01 còn được tests coi là đã xác minh. Không dùng 14/14 tests làm bằng chứng đáp ứng source of truth.

## 4. UI/UX và responsive

Hero có hierarchy rõ, sắc ivory/blush/plum đồng nhất, SVG hoa, paper texture và wall scrapbook tạo phong cách riêng. Nội dung tiếng Việt nhìn chung tự nhiên. CTA chuyển tới form. Wall có 6 thiệp; closing đầy đủ chữ ký. Khoảng trống hero khá lớn ở màn hình rộng nhưng chưa thấy lỗi nghiêm trọng.

| Viewport yêu cầu | Đã quan sát | Kết quả |
|---|---|---|
| 1440 × 900 | Có, production | Form và chuyển section ổn |
| 1920 × 1080 | Có, production toàn trang | Không thấy nội dung chính vỡ bố cục |
| 375 × 812 | Có, production toàn trang | Hero/form/wall/closing đọc được; nhãn năm hẹp |
| 390 × 844 | Có, production toàn trang | Bố cục chính ổn; ô tháng hẹp |
| 320 × 812 | Có, production; thiệp standard fixture local | Ô tháng cắt chữ; CTA/form xuống dòng nhưng sử dụng được; thiệp hẹp và nút copy nhiều dòng |
| 768 × 1024 | Có, production toàn trang | Wall hai cột, form căn giữa |

DOM scrollWidth ở production không vượt viewport trong các lần đo; **không coi đây là chứng minh mọi phần tử không bị clip**, vì body dùng overflow-x:hidden. Thiệp thật, ảnh thật và special card trên production chưa quan sát bằng browser.

| Tiêu chí | Điểm /10 | Cơ sở đã quan sát |
|---|---:|---|
| Visual design | 8 | Bản sắc hoa vintage, viền giấy, wall có chủ đích |
| Typography | 6 | Hierarchy khá rõ; chữ phụ nhỏ, font variables bị ghi đè |
| Color harmony | 7,5 | Pastel hài hòa; chữ CTA tương phản thấp |
| Animation quality | 6 | Fixture local có seal/envelope/replay; class trượt thư không sinh CSS |
| Mobile UX | 6,5 | Luồng chính dùng được; 320px cắt tháng, thiệp khá chật |
| Emotional appeal | 8 | Hero và wall có cảm xúc; không chấm nội dung riêng chưa nhìn thấy |
| Overall polish | 6,5 | Giao diện sạch nhưng lỗi ảnh và accessibility chưa xử lý |

**Điểm thiết kế tổng quan: 7/10**, đánh giá chủ quan theo production công khai và thiệp standard fixture local. Không phải điểm Lighthouse hoặc điểm special card thật.

## 5. Ma trận chức năng

PASS chỉ áp dụng môi trường được ghi trong bảng.

| Case | Môi trường | Trạng thái | Bằng chứng |
|---|---|---|---|
| Landing/CTA/form/wall/closing | Production browser | PASS | E05 |
| Empty name | Production browser; local HTTP | PASS | Native required chặn; HTTP 400 |
| Thiếu ngày/tháng/năm | Local HTTP | PASS | Từng case HTTP 400 |
| Ngày không tồn tại | Local HTTP | PASS | HTTP 400; browser production gửi request bằng dữ liệu giả nhưng không dùng lần đó làm bằng chứng hoàn tất |
| Sai năm/sai ngày/tên không tồn tại | Local HTTP | PASS | HTTP 400 |
| Sai tháng | Unit test copy logic | PARTIAL | Unit test đạt; chưa chạy case riêng trên route thật |
| Chữ hoa và khoảng trắng đầu/cuối | Local HTTP | PASS | HTTP 200, đúng recipient |
| Unicode NFD | Local HTTP | PASS | HTTP 200 |
| Chỉ nhập Huyền | Local HTTP | PASS | HTTP 400 |
| Ba tên Huyền | Local HTTP + cấu hình | PASS local | G02/G03/G10 trả đúng ID; không chứng minh mọi tổ hợp tên/DOB chéo |
| Mở quà đúng G02 | Production HTTP | PASS phần xác thực | E03 đúng ID, thư, hoa và cookie flags |
| Ảnh G02 sau xác thực | Production HTTP | FAIL | 404, E04 |
| 10 ID mở theo dữ liệu đang lưu | Local HTTP | PASS về route | E06; riêng G01 FAIL về yêu cầu năm chưa xác minh |
| Query ID khác với session | Local HTTP | PASS | Session G02 + query G03 vẫn trả G02 |
| Envelope → card standard | Local browser fixture giả | PASS local | E07, không đại diện ảnh/thư thật |
| Copy lời chúc/replay | Local browser fixture giả | PASS happy path | Clipboard khớp thư giả; replay trở lại envelope |
| Refresh sau mở | Local browser fixture giả | PASS về restore | Quà khôi phục; A13 về reset |
| Back/forward | Local browser fixture giả | PARTIAL | Có về trang và envelope restore; không kiểm tra mọi lịch sử/navigation |
| Chuyển invite → birthday còn mã cũ | Local HTTP + source form | FAIL | A09; birthday đúng bị chuyển qua invite và trả 400 |
| Click lặp khi loading | Production browser/source | PARTIAL | Nút submit disabled đã quan sát; chưa đo race request |
| Network failure/API timeout | Source review | NOT VERIFIED runtime | Có catch, không có AbortController/timeout chủ động |
| Nhật Lệ invite valid/invalid | Production | NOT VERIFIED | Không dùng mã lộ trong Git để thử |
| Nhật Lệ special UI thật | Browser | NOT VERIFIED | Chỉ kiểm tra source SPECIAL_LEADER |

## 6. Cá nhân hóa và ảnh

Đã đối chiếu local với bảng người dùng: chính xác 10 ID duy nhất, toàn bộ tên đầy đủ/tên hiển thị khớp, tên hiển thị là hai từ cuối. G02–G10 ngày sinh khớp nguồn cung cấp (không ghi giá trị vào báo cáo). 10 trường letter khác nhau và dài hơn 50 ký tự; điều này chứng minh khác chuỗi, chưa chứng minh mọi thư khác nhau sâu về ý tưởng. Hoa và theme được cấu hình riêng; renderer chưa hỗ trợ đúng mọi loài (A15).

G01 có SPECIAL_LEADER, nhưng config có năm và accessMode BOTH, trái với nguồn yêu cầu hiện tại. Không có bằng chứng cho phép coi năm đó đã xác minh. Không gọi năm đó là giả với độ chắc chắn vượt bằng chứng; lỗi là **dùng năm chưa được xác minh theo source of truth**.

`girl_photo/` không có. Có `girl_image/`, 10 mapping đều tìm được file và endpoint local trả 200. Audit không có cơ sở độc lập để xác nhận người trong ảnh chính là người nhận tương ứng. **Đúng người trong ảnh: NOT VERIFIED cho cả 10**, kể cả ảnh local load được. Không ghi tên file ảnh cá nhân hoặc screenshot ảnh người nhận vào báo cáo.

## 7. Danh sách phát hiện có thể hành động

### A01 — P0 — Khóa ký phiên production đã nằm trong Git

- **File/function:** `scripts/gen-env.js:6–7`; `lib/session.server.ts:getSessionSecret` dòng 7–13; `tests/gift-matching.test.mjs:117`; `scripts/test-http-e2e.mjs:122`.
- **Actual:** Generator ghi khóa/mã cố định. Local env khớp. Chữ ký cookie G02 do production cấp khớp HMAC tính với khóa trong generator. Generator được tracked từ `f8a3e30`, remote main khớp local. Mã mời cố định cũng khớp env/hash local; production mã mời chưa thử.
- **Expected:** Secrets ngẫu nhiên, chỉ ở secret store; thiếu khóa production phải fail closed.
- **Reproduce an toàn:** Người được phép mở G02 một lần, kiểm tra chữ ký cookie đã cấp trong bộ nhớ với giá trị source; chỉ xuất boolean, không ghi cookie/khóa. Không cần và không được thử giả mạo phiên trên production.
- **Evidence/cause:** E01/E03, nguyên nhân hardcode là verified. Khả năng tạo phiên hợp lệ ngoài luồng mở quà là hệ quả mật mã; chưa thực hiện exploit hoặc xác nhận truy cập dữ liệu người khác.
- **Fix:** Containment ngay; rotate key/mã/hash, bỏ hardcode và fallback production, crypto.randomBytes; validate session payload; rà logs và lịch sử secrets. Nếu cần rewrite history, chủ repo đánh giá và cho phép riêng; rotate vẫn bắt buộc.
- **Regression:** Thiếu secret không mở quà; token cũ bị từ chối; token đổi payload/signature/expiry bị từ chối bằng implementation thật; secret scan source/history, không đưa values vào log.

### A02 — P1 — Ảnh production G02 không tải được

- **File/function:** `lib/photo-storage.server.ts:getPhotoForRecipient` dòng 24–68; `app/api/me/photo/route.ts:17–22`; `.vercelignore:2–5`; `components/EnvelopeReveal.tsx:162–173`.
- **Actual/expected:** Unlock G02 200 và hasPhoto=true, nhưng photo trả 404; yêu cầu là ảnh riêng thực sự hiển thị. Local cùng ID photo 200.
- **Reproduce:** Với phiên hợp lệ được cho phép, GET /api/me/photo; E04. Không cần ghi body ảnh.
- **Cause:** 404 verified; **giả thuyết** production không có local file/Blob hợp lệ. Local mapping không có remote URL và thư mục ảnh bị loại khỏi upload; chưa đọc config/dashboard production để kết luận chính xác.
- **Fix:** Cấu hình private storage thật và proxy; health check sự tồn tại ảnh. Không đưa ảnh vào public để chữa 404. UI phải báo tình trạng thiếu ảnh thay vì âm thầm coi hoa fallback là ảnh.
- **Regression:** 10 ID staging photo 200 image/*, bytes/decode hợp lệ; unauth 401; chính chủ xác nhận mapping; production smoke test được phép.

### A03 — P1 — Script “private photos” thực tế upload public và không có dependency

- **File/function:** `scripts/upload-private-photos.js:3,32–34`; `package.json:dependencies`; README mục 8.3/11.
- **Actual:** put dùng access:'public'; pathname dựa trên ID tuần tự, không phải bí mật ngẫu nhiên. @vercel/blob không khai báo và không được cài. Chưa chạy upload và chưa chứng minh ảnh đang public trên production.
- **Expected/reproduce:** Upload phải private và có thể chạy từ clean install. Đọc put options và dependency manifest đủ chứng minh lỗi implementation; không upload ảnh để tái hiện.
- **Evidence/cause:** E02/source, verified. Proxy phía app không biến public Blob thành private. Theo [Vercel private storage](https://vercel.com/docs/vercel-blob/private-storage), private Blob yêu cầu xác thực truy cập.
- **Fix:** Cài SDK được hỗ trợ, private store/access, proxy có session; xác nhận unauth direct URL bị chặn. Nếu chủ dự án phát hiện đã upload public, nâng thành P0, gỡ public objects và xử lý containment.
- **Regression:** Clean install chạy dry-run fixture; staging private upload; direct unauth 401/403; không log URL/tokens thật.

### A04 — P1 — G01 dùng năm sinh chưa được yêu cầu xác minh

- **File/function:** `config/recipients.private.json` entry G01, không sao chép value; `tests/gift-matching.test.mjs:82–121`; `scripts/test-http-e2e.mjs:133–151`.
- **Actual/expected:** Local G01 hasYear=true, BOTH, birthday unlock 200. Source of truth yêu cầu thiếu năm/chưa xác minh và dùng mã mở thay thế.
- **Reproduce/evidence:** E02/E06, đối chiếu boolean và HTTP local, không in DOB. Nguyên nhân verified: cấu hình/tests đang coi DOB đầy đủ là hợp lệ; nguồn xác minh năm là NOT VERIFIED.
- **Fix:** Trả year=null và INVITE_CODE cho tới khi chủ dự án có xác minh rõ ràng; không tự suy diễn năm. Cập nhật tests bám yêu cầu, giữ SPECIAL_LEADER.
- **Regression:** G01 không mở bằng birthday khi chưa xác minh; mã test hợp lệ chỉ ở staging; sai mã bị từ chối; special card và thư cảm ơn đúng.

### A05 — P1 — Dependency có cảnh báo bảo mật và Next 14 chưa đáp ứng các bản vá hiện tại

- **File:** `package-lock.json` next=14.2.35, postcss gián tiếp; `package.json`.
- **Actual:** E09 npm audit --omit=dev báo 2 packages: next critical, postcss high. Không đồng nghĩa production đã bị RCE. Advisory Windows RCE có liên quan môi trường local Windows; production Vercel không được chứng minh là Windows. AVIF/Image Optimization và các advisory khác có điều kiện riêng.
- **Expected/reproduce:** Dependency được hỗ trợ, không để cảnh báo nghiêm trọng chưa đánh giá; chạy audit đọc-only và đối chiếu advisory maintainer.
- **Cause:** Version range/package lock cũ, verified. [Vercel May security release](https://vercel.com/changelog/next-js-may-2026-security-release) nêu Next 13/14 cần chuyển sang nhánh đã vá. [Windows advisory](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36) và [AVIF advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4) phải xét điều kiện.
- **Fix:** Chọn phiên bản hỗ trợ có đủ bản vá tại thời điểm sửa, cập nhật tối thiểu framework/deps liên quan; không chạy audit fix --force mù quáng. Kiểm tra cookies API, React và lint khi đổi major.
- **Regression:** Clean install, audit, lint/typecheck/build và toàn bộ routes/session/photo/browser staging; lập bảng applicability cho cảnh báo còn lại.

### A06 — P1 — Thiếu giới hạn lượt thử cho cơ chế mở bằng DOB

- **File/function:** `app/api/unlock/route.ts:8–46`; `lib/recipients.server.ts`.
- **Actual/expected:** Route không có limiter/lockout; DOB không phải secret mạnh. Cần hạn chế thử lặp trước khi cấp thư/ảnh riêng.
- **Reproduce/evidence:** Đọc toàn route và dependencies, verified về application code. Không flood production. WAF/limiter dashboard ngoài app là NOT VERIFIED.
- **Cause:** Không có kiểm soát trong route. **Fix:** Limiter lưu trữ bền vững cho serverless theo IP/identifier, giới hạn request body, generic errors và Retry-After; cân nhắc mã ngẫu nhiên gửi riêng cho tất cả người nhận khi ảnh/thư cần riêng tư.
- **Regression:** Synthetic staging dưới/ngang/vượt ngưỡng, nhiều instance; 429, recovery, không lộ tên/DOB trong logs; không khóa nhầm quá mức.

### A07 — P1 — Trường DOB thiếu accessible labels, error không thông báo và CTA contrast thấp

- **File:** `components/GiftUnlockForm.tsx:138–185,210–222`; `components/HeroSection.tsx`; màu `tailwind.config.ts`.
- **Actual:** Day/month/year không có id/label association hoặc aria-label; error div không role alert/aria-live. Browser AX hiển thị year không tên. CTA ivory trên dusty đo từ computed colors là **2,91:1**; không đạt 4,5:1 cho chữ thường. Focus ring trên input có và đã quan sát.
- **Expected/reproduce:** Screen reader phân biệt từng field và nghe lỗi; chữ CTA đọc được. E05/E10; DOM labels và công thức WCAG relative luminance, không phải điểm axe.
- **Cause/fix:** Markup và palette verified; thêm field labels/group, aria-describedby/invalid/live region, focus management và màu chữ/nền đạt contrast; không chỉ dựa placeholder. Ngôn ngữ thông báo validation cần kiểm tra trong browser tiếng Việt.
- **Regression:** Keyboard và screen reader thật/axe staging; contrast CTA ≥4,5:1; tên/ngày/tháng/năm/mã đều được đọc rõ, lỗi và loading được công bố.

### A08 — P1 — API quà riêng trả Cache-Control public

- **File:** `app/api/me/gift/route.ts:19–22`; `app/api/unlock/route.ts:46`; `next.config.mjs` chỉ bảo vệ cache photo.
- **Actual/expected:** Production GET gift có phiên và POST unlock trả `public, max-age=0, must-revalidate`; dữ liệu riêng nên private,no-store. Photo đã có private/no-store.
- **Reproduce/evidence:** E03/E04, đọc headers sau request hợp lệ. **Không xác nhận leak qua CDN**; public header là lỗi chính sách cache, không đủ để kết luận Vercel đã share response giữa users.
- **Cause/fix:** JSON responses thiếu header riêng, verified. Đặt private,no-store cho mọi response nhạy cảm và lỗi liên quan; rà Vercel/CDN behavior, dùng Vary phù hợp nếu cần.
- **Regression:** Hai phiên staging độc lập không nhận quà nhau; headers đúng cả success/error; kiểm tra browser/CDN không lưu nội dung riêng.

### A09 — P2 — Mã mời còn sót lấn át birthday; accessMode không được thực thi

- **File/function:** `components/GiftUnlockForm.tsx:48–55`; `app/api/unlock/route.ts:19`; birthday/invite matchers `lib/recipients.server.ts:84–129`.
- **Actual/expected:** Form luôn gửi inviteCode dù đã đổi sang birthday. Route ưu tiên Boolean(inviteCode), nên birthday đúng + mã giả cũ trả 400. Các matcher không kiểm tra accessMode. Chế độ request và chính sách recipient phải được tuân thủ.
- **Reproduce/evidence:** E06 stale-code-birthday 400 so với baseline 200; source xác minh form và omission accessMode. Policy INVITE_CODE-only với DOB đầy đủ chưa thử runtime riêng.
- **Cause/fix:** Nhánh route và payload verified; chỉ gửi fields đúng mode, allowlist mode, kiểm tra accessMode phía server, không dùng presence mã để đoán mode.
- **Regression:** Invite nhập sai → đổi birthday → DOB đúng thành công; INVITE_CODE-only/BIRTHDAY-only/BOTH fixtures; mode sai/malformed bị từ chối.

### A10 — P2 — Chưa hỗ trợ reduced motion

- **File:** `components/PetalCanvas.tsx:79–101`; `components/EnvelopeReveal.tsx:26–66`; `app/globals.css:16–17`.
- **Actual/expected:** requestAnimationFrame/confetti/timers và smooth scroll không xét prefers-reduced-motion; CSS build không có media query tương ứng. Người dùng giảm chuyển động nên được mở quà trực tiếp hoặc có animation nhẹ.
- **Reproduce/evidence:** Source và E10 verified; chưa giả lập preference runtime.
- **Fix/cause:** Thiếu preference handling; dùng matchMedia/CSS media query và disableForReducedMotion cho confetti, cleanup timers, tắt loop khi trang không hiển thị.
- **Regression:** Reduced motion on/off staging, không loop/confetti khi yêu cầu giảm; mở quà và replay vẫn dùng được.

### A11 — P2 — Class hiệu ứng trượt thư và width desktop không có CSS

- **File:** `components/EnvelopeReveal.tsx:92,128`; `tailwind.config.ts`.
- **Actual/expected:** animate-in/fade-in/slide-in-from-bottom-8/sm:w-88 không sinh rule trong CSS build. Envelope có các bước seal/replay nhưng thư cuối không có animation trượt được khai báo.
- **Reproduce/evidence:** E10 kiểm tra CSS output; E07 quan sát chuyển trạng thái. Root cause verified: utility/plugin/keyframes chưa khai báo.
- **Fix:** Dùng keyframe thật hoặc utility có sẵn, width hợp lệ, không thêm thư viện chỉ cho việc này.
- **Regression:** CSS build có rules cần dùng; quan sát final letter transition desktop/mobile và reduced motion.

### A12 — P2 — UI copy báo thành công trước khi clipboard hoàn tất

- **File/function:** `components/EnvelopeReveal.tsx:handleCopyGreeting` dòng 68–72.
- **Actual/expected:** writeText không await/catch rồi setCopied(true). Fixture happy path copy đạt, nhưng lỗi permission/unsupported có thể vẫn hiện “Đã chép!”.
- **Reproduce/evidence:** Source verified; failure runtime chưa mô phỏng. Giả thuyết UI báo thành công sai được suy ra từ async code.
- **Fix:** Await writeText, chỉ báo thành công khi resolve; lỗi có feedback/fallback chọn text.
- **Regression:** Mock clipboard resolve/reject/không có API; không hiện thành công khi copy thất bại.

### A13 — P2 — “Đổi người” chưa kết thúc phiên trước

- **File:** `components/SecretGiftSection.tsx:53` và effect dòng 13–22.
- **Actual/expected:** Đổi người chỉ xóa React state; reload lại mở quà cũ. E07 đã tái hiện với người nhận giả. Cần hành vi rõ ràng khi dùng chung thiết bị.
- **Cause/fix:** Cookie giữ 24 giờ, verified. Thêm reset/logout server xóa cookie hoặc đổi wording nếu chỉ quay lại form; tránh restore ghi đè thao tác mới.
- **Regression:** Đổi người → refresh vẫn là form khi mục tiêu là logout; hai lần unlock liên tiếp không nhầm thư/ảnh; request restore chậm không ghi đè quà mới.

### A14 — P2 — Ô tháng/năm quá hẹp ở mobile

- **File:** `components/GiftUnlockForm.tsx:141–185`.
- **Actual/expected:** 320px field rộng khoảng 70px; selected month bị cắt thành “Thá…”; 375px year placeholder bị cắt. Từng giá trị phải đọc đủ để kiểm tra trước submit.
- **Reproduce/evidence:** E05 ở 320/375/390px, screenshot trực tiếp không chứa DOB thật; layout grid 3 cột + padding verified.
- **Fix:** Giảm padding hoặc dùng tháng số/label ngoài; layout hai hàng tại width nhỏ. Không cần thiết kế lại toàn bộ form.
- **Regression:** 320/375/390px chọn tháng 10–12, năm bốn chữ số; zoom 200%; nội dung đọc được và touch target phù hợp.

### A15 — P2 — Một số loài hoa bị vẽ thành hoa hồng

- **File/function:** `components/EnvelopeReveal.tsx:renderFlowerIllustration` dòng 75–83.
- **Actual/expected:** Mẫu đơn, lan trắng, baby's breath, anh đào chưa có case; fallback RoseIllustration. Fixture tên Mẫu đơn đã quan sát hoa hồng. Mong muốn hình minh họa đúng loài được gán.
- **Reproduce/evidence:** E07 fixture Mẫu đơn; E02 các loài còn lại + source. Không kết luận ảnh chân dung là sai người từ lỗi này.
- **Fix/cause:** Map thiếu verified; map ổn định theo flower ID, hỗ trợ đủ 10 theme hoặc dùng hình floral trung tính có chủ đích khi thiếu.
- **Regression:** Snapshot/visual fixtures cho mọi flower theme và cardVariant; text/illustration nhất quán.

### A16 — P2 — QA hiện tại copy logic và phụ thuộc config private

- **File:** `tests/access-control.test.mjs:7–61`; `tests/gift-matching.test.mjs:7–80`; `tests/validation.test.mjs`; README mục 9.
- **Actual/expected:** Tests copy implementation, đọc file gitignored, test G01 theo dữ liệu đang lưu. Clean checkout không có file đó; việc tests đạt không chứng minh route/requirements đúng.
- **Reproduce/evidence:** E08 14/14 tests đạt đồng thời A01/A04 còn tồn tại; source verified. Không xóa config thật để thử clean checkout.
- **Fix:** Import implementation thật; dùng fixture giả, không commit DOB/mã thật; tách test config local có quyền; thêm route integration và negative security cases.
- **Regression:** Clean checkout + npm ci có thể chạy tests với fixtures; cố ý làm hỏng validation/session trong fixture branch khiến tests fail; G01 chưa xác minh phải không mở bằng DOB.

### A17 — P2 — CSS ghi đè biến font của next/font

- **File:** `app/globals.css:5–7`; `app/layout.tsx:5–18,38`.
- **Actual:** CSS build có biến generated next/font, sau đó :root đặt lại --font-lora/--font-vietnam thành tên gốc. Computed production body là “Be Vietnam Pro”, heading là “Lora, serif, Georgia, serif”, không dùng generated font-family.
- **Expected/reproduce/evidence:** Font đã tải bằng next/font phải được tham chiếu đúng; E10/source. Nguy cơ browser rơi về font hệ thống là **probable**, chưa xác định chính xác glyph font trên từng máy.
- **Fix:** Bỏ assignments trùng tên, giữ biến do next/font cung cấp; tên biến fallback riêng nếu cần.
- **Regression:** Computed font-family dùng generated names; tiếng Việt dấu/line wrapping đúng khi máy không cài Lora/Be Vietnam Pro.

## 8. Bảo mật và riêng tư: phần đã kiểm tra và giới hạn

PASS có giới hạn: unauth photo production 401; payload unlock G02 không trả DOB/hash/photo path; cookie flags đúng; query recipientId local không đổi chủ phiên; headers nosniff/DENY/referrer/noindex được production trả thực tế. React render string, không thấy dangerouslySetInnerHTML/eval trong components đã đọc. Không thấy app ghi dữ liệu người nhận vào localStorage/sessionStorage hoặc URL trong source đã kiểm tra.

E11 không tìm thấy nguyên văn thư private/assignment secret trong 7 JS tải từ HTML. Chưa quét mọi lazy chunk/source map, mọi dạng DOB serialization hoặc toàn bộ CDN. Không khẳng định “không có leak client” tuyệt đối.

NOT VERIFIED: Blob store thật/unauth direct URL; secrets khác trong dashboard; runtime log retention và nội dung logs thực tế; consent của người trong ảnh; quyền truy cập preview; toàn bộ cross-recipient production; lịch sử fork/deleted refs; security monitoring. Photo fetch server nhận remote URL từ config và gửi bearer token nếu có, chưa allowlist host/timeout; nên chỉ cho host private store được tin cậy khi sửa A03.

Ngày sinh không phải xác thực mạnh. Với thư/ảnh cần riêng tư, mã ngẫu nhiên phân phối riêng và cơ chế thu hồi phiên sẽ phù hợp hơn. Noindex là hướng dẫn crawler, không phải access control.

## 9. Performance và accessibility

- Local build: route `/` 15,1 kB, First Load JS 102 kB theo output Next build. Đây là số liệu bundle do framework báo, không phải tải thực tế trên thiết bị.
- Production: 7 script đọc từ HTML, tổng 464.185 byte **sau giải nén**, không phải kích thước truyền qua mạng, TTI hoặc CWV.
- Ảnh private dùng img thường và full buffer; chưa đo kích thước ảnh production do 404, chưa xác minh optimization/latency ảnh thật.
- Fonts display:swap có trong source nhưng A17 làm việc sử dụng font chưa đúng.
- Không chạy Lighthouse, axe hoặc đo field LCP/CLS/INP. Các điểm này **NOT VERIFIED**, không có score giả.
- Browser console production công khai không có error/warn trong mẫu thu thập; không đại diện toàn bộ runtime logs hoặc luồng riêng.
- Keyboard controls native sử dụng được trong thao tác fixture; chưa thực hiện full keyboard-only/screen-reader audit. Labels/contrast/reduced-motion là lỗi có bằng chứng riêng.

## 10. Vercel và trạng thái phát hành

| Hạng mục | Status | Cơ sở |
|---|---|---|
| Production HTTPS/home | PASS | E03 200 |
| URL README khớp người dùng | PASS | README mục 10.3 |
| Local lint/build | PASS | E08 |
| Build trên Vercel mới nhất | NOT VERIFIED | Không đọc build logs |
| Latest deployed commit | NOT VERIFIED | HEAD/main khớp không chứng minh deployment SHA |
| GitHub integration/production branch/auto deploy khi push | NOT VERIFIED | README chỉ mô tả mong muốn; không test commit |
| Project link local | PARTIAL | .vercel/project.json có projectName 20_10; không chứng minh settings dashboard |
| Production session secret riêng tư | FAIL | A01 |
| Private Blob/ảnh production | FAIL/PARTIAL | Photo G02 404; store config chưa đọc |
| Preview vs production env | NOT VERIFIED | Script push-env nhắm cả ba môi trường; không chạy script hoặc đọc env dashboard |
| Runtime compatibility | PARTIAL | Local Node 22 build/run đạt, production HTTP routes chạy; chưa biết Node version dashboard |
| Deployment reproducibility | PARTIAL | Local build đạt với .env.local/node_modules hiện có; clean install + private data/storage setup chưa kiểm tra |

## 11. Quyết định và thứ tự sửa

1. **A01 P0:** containment, rotate secrets/hash và vô hiệu hóa phiên cũ.
2. **A02–A03:** thiết lập private storage đúng, phục hồi ảnh production; xác nhận không có public objects cũ.
3. **A05–A06–A08:** dependency đã vá, giới hạn thử, no-store cho dữ liệu riêng.
4. **A04–A07:** đưa G01 về trạng thái chưa xác minh, sửa accessible form và contrast.
5. **A09–A17:** sửa form modes, reduced motion, animation/copy/reset/mobile/flower/tests/fonts.

Chỉ đánh giá lại READY khi P0/P1 đã khép bằng bằng chứng mới; staging đủ 10 người với credentials được cấp, chính chủ kiểm tra mapping ảnh/thư; production smoke test có phép; deployed SHA, Vercel integration và private Blob được xác minh. Những mục NOT VERIFIED vẫn phải giữ đúng trạng thái cho tới khi có quyền/bằng chứng.

**Khuyến nghị hiện tại: chưa phát hành cho người nhận.**
