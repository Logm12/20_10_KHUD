import type { Metadata } from "next";
import { Lora, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["vietnamese", "latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  variable: "--font-vietnam",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Secret Bloom — Khu vườn của những lời chúc 20/10",
  description: "Trải nghiệm mở quà và gửi gắm những lời chúc ngọt ngào nhất nhân ngày Phụ nữ Việt Nam 20/10/2026.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${lora.variable} ${beVietnam.variable}`}>
      <body className="min-h-screen bg-ivory text-plum antialiased selection:bg-blush selection:text-plum-dark">
        {children}
      </body>
    </html>
  );
}
