import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GrammarlyFix } from "@/components/grammarly-fix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InstaGraph - Instagram Growth Assistant",
  description: "Instagram-ის ზრდის ასისტენტი - ანალიტიკა და AI რჩევები Instagram-ის ზრდისთვის",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        suppressHydrationWarning={true}
      >
        <GrammarlyFix />
        {children}
      </body>
    </html>
  );
}
