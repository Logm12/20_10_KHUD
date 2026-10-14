# The Secret Bloom — Khu Vườn Của Những Lời Chúc (20/10/2026)

> **Website chúc mừng ngày Phụ nữ Việt Nam 20/10 dành riêng cho các bạn nữ Liên chi đoàn Khoa Các Khoa học Ứng dụng, Trường Quốc tế — Đại học Quốc gia Hà Nội (VNU-IS).**

---

## 1. Giới Thiệu Dự Án

**The Secret Bloom** là một trang web thiệp hoa kỹ thuật số được thiết kế dựa trên triết lý **Soft Floral Editorial × Vintage Letters × Personal Gift Experience**. Thay vì một trang landing page thông thường, dự án mang đến trải nghiệm mở quà giàu cảm xúc, kết hợp giữa chất liệu thiệp giấy cổ điển, con dấu sáp niêm phong, cánh hoa rơi nhẹ nhàng và các lá thư chúc mừng được cá nhân hóa trọn vẹn cho từng thành viên.

---

## 2. Tính Năng Nổi Bật

- **Giao diện Editorial Botanical Cao Cấp:** Bảng màu pastel hoa cỏ tự nhiên (Ivory, Blush Pink, Lavender, Sage Green, Dark Plum, Dusty Rose) kết hợp kiểu chữ Lora và Be Vietnam Pro.
- **Hiệu ứng Cánh hoa rơi (Petal Canvas):** Hệ thống hạt cánh hoa rơi nhẹ nhàng trên nền Canvas GPU-friendly, hỗ trợ mượt mà trên cả máy tính và điện thoại.
- **Cơ chế Mở Quà Bảo Mật (The Secret Gift):**
  - Mở thư bằng tổ hợp Tên hiển thị (hoặc biệt danh hai từ cuối) + Ngày/Tháng/Năm sinh chính xác.
  - Tùy chọn mở thư bằng **Mã mở thư bí mật** dành cho trường hợp đặc biệt hoặc ngày sinh chưa xác minh.
  - Phản hồi lỗi thân thiện, bảo mật dạng generic, tuyệt đối không tiết lộ tài khoản hay trường thông tin sai.
- **Trải Nghiệm Mở Phong Thư (Envelope Reveal Animation):**
  - Phong thư khẽ rung, con dấu sáp phát sáng, nắp thư mở ra cùng pháo hoa cánh hoa tung bay.
  - Tấm thiệp trượt lên trình bày ảnh chân dung, đóa hoa đại diện, ý nghĩa loài hoa, lời chúc ngắn và bức thư cá nhân hóa.
  - Nút **Sao chép lời chúc** và **Mở lại thư** giúp tương tác thuận tiện.
- **Phiên Bản Vinh Danh Đặc Biệt — The Golden Bloom:**
  - Thiết kế riêng cho Bùi Nhật Lệ (Bí thư Liên chi đoàn) với tông màu Rose Gold và Warm Ivory, viền ánh kim hoàng gia, vòng hoa cẩm tú cầu vinh danh và lời chúc ghi nhận công sức cống hiến cho tập thể.
- **Bức Tường Yêu Thương (Wall of Kindness):** 6 tấm thiệp phong cách polaroid/scrapbook mang thông điệp tích cực, ấm áp.
- **Nhạc Nền Dịu Êm Tùy Chọn (Audio Player):** Giai điệu chuông gió ngũ âm thư giãn sử dụng Web Audio API thuần túy, tuyệt đối **không tự động phát (no autoplay)**, người dùng hoàn toàn chủ động bật/tắt.

---

## 3. Cấu Trúc UI & Thiết Kế

Website gồm 5 phân đoạn trải nghiệm liền mạch:
1. **Hero Section:** Lời chào mừng ngày 20/10, đồ họa hoa trang nhã và nút bấm chuyển tiếp mượt mà.
2. **The Secret Gift:** Khung nhập tên và ngày sinh hoặc mã mở thư.
3. **Personalized Letter Reveal:** Trải nghiệm mở phong thư tương tác và đọc thiệp chúc mừng.
4. **Wall of Kindness:** Góc sẻ chia những lời chúc tích cực gửi đến tập thể.
5. **Closing Section:** Lời chúc khép lại cùng chữ ký tập thể.

---

## 4. Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components & Route Handlers).
- **Ngôn ngữ:** TypeScript (Strict mode).
- **Styling:** Tailwind CSS, Typography system, CSS variables.
- **Animation & Visuals:** Canvas 2D Petals, Canvas-confetti, Lucide Icons.
- **Typography:** `next/font/google` nạp trước font `Lora` (Heading/Serif) và `Be Vietnam Pro` (Body/Sans-serif).
- **Bảo mật & Session:** Cookie HttpOnly, mã hóa chữ ký HMAC SHA-256 (`crypto`).
- **Lưu trữ ảnh:** Vercel Private Blob Store & Local Secure Storage Streaming Proxy.
- **Kiểm thử:** Node.js native test runner (`node:test`, `node:assert/strict`).

---

## 5. Cấu Trúc Thư Mục Dự Án

```
20_10/
├── app/
│   ├── api/
│   │   ├── me/
│   │   │   ├── gift/route.ts      # Khôi phục phiên mở quà khi tải lại trang
│   │   │   └── photo/route.ts     # Proxy stream ảnh riêng tư theo phiên đã ký
│   │   └── unlock/route.ts        # Endpoint xác thực ngày sinh / mã mở quà
│   ├── globals.css                # Style giấy vintage, hiệu ứng viền và scrollbar
│   ├── layout.tsx                 # Cấu hình font Google Lora, Be Vietnam Pro & SEO tags
│   └── page.tsx                   # Trang chính tích hợp 5 sections
├── components/
│   ├── AudioPlayer.tsx            # Trình phát nhạc chuông thư giãn (Web Audio API)
│   ├── BotanicalDecorations.tsx   # Đồ họa hoa SVG & Con dấu sáp (Wax Seal)
│   ├── ClosingSection.tsx         # Phần kết trang và chữ ký tập thể
│   ├── EnvelopeReveal.tsx         # Hiệu ứng phong thư nở hoa, ảnh và thư cá nhân
│   ├── GiftUnlockForm.tsx         # Form mở quà bằng ngày sinh / mã bí mật
│   ├── HeroSection.tsx            # Màn hình chào mừng ngày 20/10
│   ├── KindnessWall.tsx           # Bức tường 6 tấm thiệp polaroid yêu thương
│   ├── PetalCanvas.tsx            # Hiệu ứng cánh hoa bay trên nền Canvas
│   └── SecretGiftSection.tsx      # Bộ điều phối trạng thái mở quà
├── config/
│   └── recipients.private.json    # Cấu hình người nhận nội bộ (gitignored)
├── lib/
│   ├── photo-storage.server.ts    # Module lấy ảnh từ Vercel Blob hoặc local an toàn
│   ├── recipients.server.ts       # Module quản lý danh sách người nhận & quyền truy cập
│   ├── session.server.ts          # Module tạo & kiểm tra session HttpOnly bằng HMAC SHA-256
│   └── validation.ts              # Chuẩn hóa tên tiếng Việt, kiểm tra lịch Gregory, hash mã
├── scripts/
│   ├── audit-photos.js            # Kiểm tra ảnh và đối chiếu danh sách thành viên
│   ├── gen-env.js                 # Tạo biến môi trường .env.local an toàn
│   ├── test-http-e2e.mjs          # Kiểm thử tích hợp HTTP E2E toàn bộ luồng
│   └── upload-private-photos.js   # Script tải ảnh lên Vercel Blob Store bảo mật
├── tests/
│   ├── access-control.test.mjs    # Test chữ ký session, chống giả mạo token
│   ├── gift-matching.test.mjs     # Test khớp ngày sinh, mã mời, tính đơn nhất của thư
│   └── validation.test.mjs        # Test chuẩn hóa tên, lịch nhuận, chống nhầm lẫn tên
├── .env.example                   # Mẫu cấu hình môi trường an toàn (không chứa dữ liệu thật)
├── .gitignore                     # Loại trừ ảnh cá nhân, file private, env local, skills
├── .vercelignore                  # Loại trừ thư mục không cần thiết khi build trên Vercel
├── next.config.mjs                # Header bảo mật, chống bot lập chỉ mục tìm kiếm
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 6. Hướng Dẫn Cài Đặt & Chạy Môi Trường Cục Bộ

### 6.1. Yêu cầu hệ thống
- Node.js version 18 trở lên (khuyến nghị v20 hoặc v22).
- npm version 9 trở lên.

### 6.2. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 6.3. Khởi tạo biến môi trường cục bộ
Tạo file `.env.local` dựa trên `.env.example`:
```bash
cp .env.example .env.local
```
Hoặc chạy lệnh tự động tạo key bảo mật:
```bash
node scripts/gen-env.js
```

### 6.4. Chạy chế độ phát triển (Development)
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

---

## 7. Cấu Hình Biến Môi Trường (`.env`)

| Tên biến | Bắt buộc | Mô tả |
|---|---|---|
| `SESSION_SECRET` | Có | Chuỗi bí mật 32-byte ngẫu nhiên để ký HMAC HttpOnly Cookie. |
| `SPECIAL_LEADER_CODE` | Có | Mã mời bí mật dùng để mở món quà đặc biệt của Nhật Lệ. |
| `RECIPIENTS_JSON` | Tùy chọn | Chuỗi JSON (hoặc Base64 của JSON) chứa danh sách người nhận trên Production. |
| `BLOB_READ_WRITE_TOKEN` | Tùy chọn | Token cấp quyền đọc/ghi Vercel Blob nếu dùng Private Blob Store. |

*Lưu ý: Không bao giờ commit file `.env.local` lên GitHub.*

---

## 8. Hướng Dẫn Cập Nhật & Quản Trị Dữ Liệu An Toàn

### 8.1. Cập nhật ngày sinh hoặc thư chúc mừng
1. Mở file `config/recipients.private.json` trên máy quản trị viên (file này đã được gitignore).
2. Chỉnh sửa ngày sinh (`day`, `month`, `year`) hoặc nội dung trường `letter`.
3. Chạy `node scripts/gen-env.js` để cập nhật biến môi trường `RECIPIENTS_JSON`.
4. Nếu cập nhật trên Vercel: copy giá trị `RECIPIENTS_JSON` mới và cập nhật trong **Vercel Dashboard > Project Settings > Environment Variables**.

### 8.2. Cập nhật ngày sinh chính thức của Nhật Lệ
Khi xác minh được ngày/tháng/năm sinh chính xác của Nhật Lệ:
1. Đổi `year: null` thành năm sinh thật (ví dụ: `2006`).
2. Đổi `accessMode: "INVITE_CODE"` thành `"BOTH"` hoặc `"BIRTHDAY"`.
3. Cập nhật lại `RECIPIENTS_JSON` trên Vercel.

### 8.3. Quản lý và tải ảnh lên Vercel Private Blob
1. Đặt ảnh vào thư mục riêng `girl_image/`.
2. Chạy kiểm tra tính đầy đủ của ảnh:
   ```bash
   npm run audit:photos
   ```
3. Khi đã có `BLOB_READ_WRITE_TOKEN` từ Vercel Storage, chạy:
   ```bash
   node scripts/upload-private-photos.js
   ```
   Script sẽ tự động upload ảnh với ID ẩn danh, không chứa tên hay ngày sinh, và cập nhật `photoBlobPath`.

---

## 9. Các Lệnh Kiểm Thử (Testing & QA)

Dự án trang bị đầy đủ bộ kiểm thử chất lượng cao:

```bash
# Kiểm tra định dạng và liên kết ảnh thành viên
npm run audit:photos

# Chạy toàn bộ Unit Tests (kiểm tra ngày sinh, mã mời, bảo mật token)
npm test

# Chạy E2E Integration Tests (kiểm tra toàn bộ luồng HTTP API & session cookie)
npm run test:e2e

# Kiểm tra cú pháp và quy chuẩn mã nguồn
npm run lint

# Biên dịch thử nghiệm bản phát hành (Production Build)
npm run build
```

---

## 10. Triển Khai Lên Vercel Production

### Cách 1: Tự động qua GitHub Integration (Khuyến nghị)
1. Push code sạch lên repository `https://github.com/Logm12/20_10_KHUD`.
2. Kết nối repo tại [vercel.com](https://vercel.com).
3. Thêm các Environment Variables:
   - `SESSION_SECRET`: Chuỗi khóa ký HMAC bí mật.
   - `SPECIAL_LEADER_CODE`: Mã mời của Nhật Lệ.
   - `RECIPIENTS_JSON`: Chuỗi cấu hình 10 người nhận (dạng base64 từ file `.env.local`).
   - `BLOB_READ_WRITE_TOKEN`: Token từ tab Storage của Vercel (nếu dùng Blob).
4. Nhấn **Deploy**. Mỗi commit mới vào nhánh `main` sẽ tự động kích hoạt CI/CD deploy.

### Cách 2: Triển khai qua Vercel CLI
```bash
# Đăng nhập Vercel
vercel login

# Triển khai bản Production
vercel --prod
```

---

## 11. Kiến Trúc Bảo Mật & Quyền Riêng Tư

1. **Không rò rỉ dữ liệu qua Client Bundle:** Toàn bộ danh sách ngày sinh, thư riêng và thông tin cá nhân đều nằm phía Server-side. Client chỉ nhận được món quà của chính mình sau khi đã mở khóa thành công.
2. **Không rò rỉ đường dẫn tĩnh ảnh cá nhân:** Ảnh cá nhân không đặt trong thư mục `public/`. Ảnh chỉ được truyền qua endpoint `/api/me/photo` được kiểm tra chữ ký HttpOnly Cookie.
3. **Chống dò quét thông tin (Enumeration Defense):** Phản hồi lỗi khi nhập sai luôn là một thông điệp thân thiện duy nhất, không báo cụ thể sai tên hay sai ngày sinh.
4. **Header chống lập chỉ mục (Anti-Indexing):** Cấu hình `X-Robots-Tag: noindex, nofollow, noarchive` trong `next.config.mjs` nhằm ngăn chặn các công cụ tìm kiếm thu thập dữ liệu website.

---

## 12. Lời Chúc 20/10

*Chúc toàn thể các bạn nữ Liên chi đoàn Khoa Các Khoa học Ứng dụng (Trường Quốc tế — ĐHQGHN) một ngày 20/10 ngập tràn niềm vui, luôn rạng rỡ, tự tin và ngập tràn hạnh phúc trên con đường mình đã chọn! 🌸✨*
