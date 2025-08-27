import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased lg:bg-[url('/bg.webp')] lg:bg-cover lg:bg-center lg:bg-no-repeat lg:min-h-screen relative`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* 배경 카피 텍스트 - 데스크톱에서만 표시 */}
          <div className="hidden lg:block absolute right-[calc(50%+180px+5%)] top-1/2 transform -translate-y-1/2 z-0 flex">
            <div className="text-white leading-relaxed text-end">
              <p className="text-[32px] font-medium ">더 많은곳에서의</p>
              <p className="text-[32px] font-semibold mb-2">창조와 환경, 그 이상의 실천</p>
              <p className="text-[16px]">환경을 위한 제품을 만드는 회사와 개인을 응원합니다.</p>
            </div>
          </div>
          
          <div className="w-full lg:w-[360px] lg:mx-auto relative z-10">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
