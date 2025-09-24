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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 네이버 지도 API 로딩 상태 관리
              window.naverMapLoaded = false;
              window.naverGeocoderLoaded = false;
              
              // API 로딩 완료 콜백
              window.initNaverMap = function() {
                window.naverMapLoaded = true;
                
                // geocoder 서브모듈 로딩 체크
                function checkGeocoderLoaded() {
                  if (window.naver && window.naver.maps && window.naver.maps.Service && window.naver.maps.Service.geocode) {
                    window.naverGeocoderLoaded = true;
                    console.log('네이버 지도 API 및 Geocoder 서브모듈 로딩 완료');
                    
                    // 커스텀 이벤트 발생
                    window.dispatchEvent(new CustomEvent('naverMapReady'));
                  } else {
                    setTimeout(checkGeocoderLoaded, 100);
                  }
                }
                
                checkGeocoderLoaded();
              };
              
              // 스크립트 동적 로딩
              var script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_KEY_ID}&submodules=geocoder&callback=initNaverMap';
              script.onerror = function() {
                console.error('네이버 지도 API 로딩 실패');
              };
              document.head.appendChild(script);
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.className} antialiased lg:bg-[url('/bg.webp')] lg:bg-cover lg:bg-center lg:bg-no-repeat lg:min-h-screen relative`}
      >
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
              <p className="text-[32px] font-semibold mb-2">
                창조와 환경, 그 이상의 실천
              </p>
              <p className="text-[16px]">
                환경을 위한 제품을 만드는 회사와 개인을 응원합니다.
              </p>
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
