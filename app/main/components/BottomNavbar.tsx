"use client";

import { useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";

// SVG 아이콘 컴포넌트들
const HomeIcon = ({ className, fill = "currentColor" }: { className?: string; fill?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 19V10C4 9.68333 4.071 9.38333 4.213 9.1C4.355 8.81667 4.55067 8.58333 4.8 8.4L10.8 3.9C11.15 3.63333 11.55 3.5 12 3.5C12.45 3.5 12.85 3.63333 13.2 3.9L19.2 8.4C19.45 8.58333 19.646 8.81667 19.788 9.1C19.93 9.38333 20.0007 9.68333 20 10V19C20 19.55 19.804 20.021 19.412 20.413C19.02 20.805 18.5493 21.0007 18 21H15C14.7167 21 14.4793 20.904 14.288 20.712C14.0967 20.52 14.0007 20.2827 14 20V15C14 14.7167 13.904 14.4793 13.712 14.288C13.52 14.0967 13.2827 14.0007 13 14H11C10.7167 14 10.4793 14.096 10.288 14.288C10.0967 14.48 10.0007 14.7173 10 15V20C10 20.2833 9.904 20.521 9.712 20.713C9.52 20.905 9.28267 21.0007 9 21H6C5.45 21 4.97933 20.8043 4.588 20.413C4.19667 20.0217 4.00067 19.5507 4 19Z" fill={fill} />
  </svg>
);

const SearchIcon = ({ className, fill = "currentColor" }: { className?: string; fill?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M11.6775 20.7954L11.6806 20.7964C11.8861 20.8861 12.0008 20.8653 12.0008 20.8653C12.0008 20.8653 12.1156 20.8861 12.3221 20.7964L12.3242 20.7954L12.3304 20.7923L12.3492 20.7839C12.4482 20.7378 12.5459 20.6891 12.6423 20.6379C12.8363 20.5377 13.1075 20.3875 13.4319 20.1862C14.0786 19.7857 14.9392 19.1786 15.8039 18.3452C17.5313 16.6804 19.3024 14.0779 19.3024 10.4344C19.3024 9.47555 19.1136 8.52608 18.7466 7.64021C18.3797 6.75434 17.8418 5.94942 17.1638 5.2714C16.4858 4.59339 15.6809 4.05555 14.795 3.68861C13.9091 3.32167 12.9597 3.13281 12.0008 3.13281C11.042 3.13281 10.0925 3.32167 9.20662 3.68861C8.32075 4.05555 7.51582 4.59339 6.83781 5.2714C6.15979 5.94942 5.62196 6.75434 5.25502 7.64021C4.88808 8.52608 4.69922 9.47555 4.69922 10.4344C4.69922 14.0769 6.47038 16.6804 8.19877 18.3452C8.92226 19.0404 9.71695 19.6575 10.5697 20.1862C10.9001 20.3911 11.2398 20.5804 11.5878 20.7537L11.6524 20.7839L11.6712 20.7923L11.6775 20.7954ZM12.0008 12.7814C12.6233 12.7814 13.2202 12.5341 13.6604 12.094C14.1005 11.6538 14.3478 11.0569 14.3478 10.4344C14.3478 9.81196 14.1005 9.21501 13.6604 8.77487C13.2202 8.33474 12.6233 8.08747 12.0008 8.08747C11.3784 8.08747 10.7814 8.33474 10.3413 8.77487C9.90114 9.21501 9.65387 9.81196 9.65387 10.4344C9.65387 11.0569 9.90114 11.6538 10.3413 12.094C10.7814 12.5341 11.3784 12.7814 12.0008 12.7814Z" fill={fill} />
  </svg>
);

const StatusIcon = ({ className, fill = "currentColor" }: { className?: string; fill?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <mask id="mask0_255_8103" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="3" y="3" width="18" height="18">
      <path d="M18.7535 4.05371H5.24469C4.92856 4.05371 4.62539 4.17929 4.40185 4.40283C4.17832 4.62636 4.05273 4.92954 4.05273 5.24567V18.7545C4.05273 19.0706 4.17832 19.3738 4.40185 19.5974C4.62539 19.8209 4.92856 19.9465 5.24469 19.9465H18.7535C19.0697 19.9465 19.3728 19.8209 19.5964 19.5974C19.8199 19.3738 19.9455 19.0706 19.9455 18.7545V5.24567C19.9455 4.92954 19.8199 4.62636 19.5964 4.40283C19.3728 4.17929 19.0697 4.05371 18.7535 4.05371Z" fill="white" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M7.23047 10.4415C8.55142 8.85226 10.1407 8.05762 11.9983 8.05762C13.8556 8.05762 15.4449 8.85226 16.7661 10.4415" stroke="black" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11.9986 15.4503C12.3147 15.4503 12.6179 15.3247 12.8414 15.1012C13.065 14.8777 13.1906 14.5745 13.1906 14.2584C13.1906 13.9422 13.065 13.6391 12.8414 13.4155C12.6179 13.192 12.3147 13.0664 11.9986 13.0664C11.6825 13.0664 11.3793 13.192 11.1558 13.4155C10.9322 13.6391 10.8066 13.9422 10.8066 14.2584C10.8066 14.5745 10.9322 14.8777 11.1558 15.1012C11.3793 15.3247 11.6825 15.4503 11.9986 15.4503Z" fill="black"/>
      <path d="M10.0117 11.4766L12.0015 14.2578" stroke="black" strokeWidth="1.4" strokeLinecap="round"/>
    </mask>
    <g mask="url(#mask0_255_8103)">
      <path d="M2.46289 2.46484H21.5342V21.5362H2.46289V2.46484Z" fill={fill} />
    </g>
  </svg>
);

const PointIcon = ({ className, fill = "currentColor" }: { className?: string; fill?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12.6636 9.60828C13.2962 9.60842 13.8094 10.1215 13.8094 10.7542C13.8094 11.3868 13.2962 11.8999 12.6636 11.9H11.3112C11.1869 11.9 11.0859 11.7991 11.0859 11.6748V9.8335C11.0859 9.70923 11.1869 9.60828 11.3112 9.60828H12.6636Z" fill={fill} />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 3C16.9704 3.00015 21 7.02953 21 12C21 16.9705 16.9704 20.9999 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3ZM10.4114 7.80872C9.79006 7.80872 9.28638 8.3124 9.28638 8.93372V16.0627C9.28641 16.5662 9.68912 16.9746 10.1862 16.9746C10.6832 16.9746 11.0859 16.5662 11.0859 16.0627V13.6996H12.6636C14.2903 13.6994 15.609 12.3809 15.609 10.7542C15.609 9.1274 14.2903 7.80886 12.6636 7.80872H10.4114Z" fill={fill} />
  </svg>
);

function BottomNavbarContent() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      path: "/main",
      icon: HomeIcon,
      label: "홈",
      alt: "home"
    },
    {
      path: "/main/search",
      icon: SearchIcon,
      label: "비니봇 찾기",
      alt: "search"
    },
    {
      path: "/main/status",
      icon: StatusIcon,
      label: "커피박 수거량",
      alt: "coffee"
    },
    {
      path: "/main/point",
      icon: PointIcon,
      label: "포인트 조회",
      alt: "point"
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex gap-6 justify-between items-center px-6 py-2 w-full text-xs font-medium tracking-normal leading-5 text-center bg-white shadow-[0px_-2px_10px_rgba(0,0,0,0.1)] text-neutral-400">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const IconComponent = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col justify-center items-center rounded-lg min-h-[60px] w-[60px] gap-y-[2px] transition-colors duration-200 ${
              isActive ? "text-green-600" : "text-neutral-400 hover:text-green-500"
            }`}
          >
            <IconComponent 
              fill="currentColor"
              className="transition-colors duration-200" 
            />
            <div className="text-[10px] transition-colors duration-200">{item.label}</div>
          </button>
        );
      })}
    </div>
  );
}

export default function BottomNavbar() {
  return (
    <Suspense fallback={
      <div className="flex gap-6 justify-between items-center px-6 py-2 w-full text-xs font-medium tracking-normal leading-5 text-center bg-white shadow-[0px_-2px_10px_rgba(0,0,0,0.1)] text-neutral-400">
        <div className="flex flex-col justify-center items-center rounded-lg min-h-[60px] w-[60px] gap-y-[2px]">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col justify-center items-center rounded-lg min-h-[60px] w-[60px] gap-y-[2px]">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col justify-center items-center rounded-lg min-h-[60px] w-[60px] gap-y-[2px]">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col justify-center items-center rounded-lg min-h-[60px] w-[60px] gap-y-[2px]">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    }>
      <BottomNavbarContent />
    </Suspense>
  );
}
