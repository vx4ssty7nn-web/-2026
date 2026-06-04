import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community Board",
  description: "日本語向け掲示板アプリ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
     {children}
      </body>
    </html>
  );
}
