export interface MusicTrack {
  id: string;
  title: string;
  src: string;
}

/**
 * Danh sách nhạc nền của khu vườn The Secret Bloom.
 * Để thêm bài mới:
 * 1. Copy file nhạc vào thư mục `public/music/<ten-file>.m4a`
 * 2. Thêm một object { id, title, src: "/music/<ten-file>.m4a" } vào mảng MUSIC_PLAYLIST bên dưới.
 */
export const MUSIC_PLAYLIST: MusicTrack[] = [
  {
    id: "phep-mau",
    title: "Phép Màu",
    src: "/music/phep-mau.m4a",
  },
  {
    id: "em-se-rang-ngoi-nhe",
    title: "Em Sẽ Rạng Ngời Nhé",
    src: "/music/em-se-rang-ngoi-nhe.m4a",
  },
  {
    id: "cham-hoa",
    title: "Chăm Hoa",
    src: "/music/cham-hoa.m4a",
  },
  {
    id: "undertale",
    title: "Undertale",
    src: "/music/undertale.m4a",
  },
];

/**
 * Tính index bài tiếp theo trong playlist (tự động quay vòng về 0 khi hết danh sách).
 */
export function getNextTrackIndex(currentIndex: number, totalTracks: number): number {
  if (totalTracks <= 1) return 0;
  return (currentIndex + 1) % totalTracks;
}

/**
 * Tính index bài trước đó trong playlist (tự động quay vòng về cuối danh sách khi ở đầu).
 */
export function getPrevTrackIndex(currentIndex: number, totalTracks: number): number {
  if (totalTracks <= 1) return 0;
  return (currentIndex - 1 + totalTracks) % totalTracks;
}
