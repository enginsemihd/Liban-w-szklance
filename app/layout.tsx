import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Liban w Szklance",
  description: "Home made cocktails and food. Authentic taste.",
  openGraph: {
    title: "Liban w Szklance",
    description: "Come as a guest, leave as a friend.",
    url: "https://liban-w-szklance.vercel.app",
    siteName: "Liban w Szklance",
    images: [
      {
        // NOT: Buraya Supabase'e yükleyeceğin kendi Logonun linkini koyabilirsin. 
        // Şimdilik test için menündeki Batroun kokteylinin resmini koydum.
        url: "https://wixiouwhfthwahlqwatb.supabase.co/storage/v1/object/public/menu%20images/batroun.png",
        width: 1200,
        height: 630,
        alt: "Liban w Szklance Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}