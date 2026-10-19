export interface IntroConfig {
  /** Bật/tắt trải nghiệm video mở đầu trên toàn website */
  enabled: boolean;
  /** URL HTTPS công khai của video từ Vercel Public Blob (ví dụ: https://<store>.public.blob.vercel-storage.com/...) */
  videoUrl: string;
  /** Ảnh đại diện (poster) hiển thị trước khi phát video (tùy chọn) */
  posterUrl?: string;
  /** Cho phép người xem bấm nút "Bỏ qua, vào khu vườn" */
  allowSkip: boolean;
  /** Đường dẫn file phụ đề WebVTT (.vtt) nếu nhóm cung cấp (tùy chọn, không tự bịa lời thoại) */
  captionsUrl?: string;
  /** Nhãn ngôn ngữ phụ đề (mặc định: "Tiếng Việt") */
  captionsLabel?: string;
  /** Mã ngôn ngữ phụ đề (mặc định: "vi") */
  captionsLang?: string;
}

/**
 * Cấu hình tập trung cho Video Mở Đầu (Intro Video).
 *
 * MẶC ĐỊNH KHI CHƯA CÓ VIDEO:
 * - enabled: false
 * - videoUrl: ""
 * Website sẽ vào thẳng giao diện khu vườn mà không hiện màn hình chờ.
 *
 * CÁCH BẬT SAU KHI UPLOAD VIDEO LÊN VERCEL PUBLIC BLOB:
 * 1. Upload video bằng script `node scripts/upload-intro-video.js <duong-dan-file.mp4>` hoặc qua Vercel Dashboard.
 * 2. Dán URL HTTPS công khai (`https://*.public.blob.vercel-storage.com/...`) vào `videoUrl` bên dưới (hoặc qua biến môi trường NEXT_PUBLIC_INTRO_VIDEO_URL).
 * 3. Đổi `enabled: true` (hoặc đặt NEXT_PUBLIC_INTRO_ENABLED="true").
 */
export const INTRO_CONFIG: IntroConfig = {
  enabled:
    process.env.NEXT_PUBLIC_INTRO_ENABLED === "false"
      ? false
      : true,
  videoUrl:
    process.env.NEXT_PUBLIC_INTRO_VIDEO_URL ||
    "https://djwwq8t6znwblubj.public.blob.vercel-storage.com/intro/KHUD_20_10.mp4",
  posterUrl: process.env.NEXT_PUBLIC_INTRO_POSTER_URL || "",
  allowSkip: true,
  captionsUrl: process.env.NEXT_PUBLIC_INTRO_CAPTIONS_URL || "",
  captionsLabel: "Tiếng Việt",
  captionsLang: "vi",
};

/**
 * Kiểm tra URL video có hợp lệ để phát trực tiếp hay không.
 * Chấp nhận HTTPS URL công khai (hoặc đường dẫn tương đối bắt đầu bằng "/" trong môi trường test cục bộ).
 */
export function isValidIntroVideoUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "https:" && Boolean(parsed.hostname);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Xác định xem trải nghiệm Intro có đang được bật và đủ điều kiện hiển thị hay không.
 * Nếu `enabled = false` hoặc `videoUrl` trống/không hợp lệ, trả về `false` để không chặn người dùng.
 */
export function isIntroActive(config: IntroConfig = INTRO_CONFIG): boolean {
  if (!config || !config.enabled) return false;
  return isValidIntroVideoUrl(config.videoUrl);
}
