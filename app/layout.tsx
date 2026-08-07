import type { Metadata } from "next";
import "./globals.css";

const title = "서울 2043 | 야망과 자유의 하드보일드 SF";
const description = "인간과 안드로이드, 야망과 자유가 충돌하는 2043년 서울의 라이트노벨 세계관 아카이브.";

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: "seoul-2043-logo.png", shortcut: "seoul-2043-logo.png" },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: "og.png", width: 1536, height: 1024, alt: "서울 2043 사이버펑크 세계관" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
