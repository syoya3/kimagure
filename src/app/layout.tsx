import type { Metadata } from "next";
import { Noto_Sans_JP, Oswald } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "木まぐれ｜友達コレクション 〜気になる木の森〜",
  description:
    "歩いて、話しかけて、株式会社木まぐれを知るゲーム体験。森のグローブを巡りながら、理念・ビジョン・ミッション・バリューに出会おう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body
        className={`${notoSansJP.variable} ${oswald.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
