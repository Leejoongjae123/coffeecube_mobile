"use client";

export default function MapArea() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/2a940d1891c9eb3c0c8b4fde16349db22b7e0270?width=853"
        alt="지도"
        className="w-full h-full object-cover"
      />

      <div className="inline-flex absolute gap-2.5 justify-center items-center px-3 py-0.5 bg-neutral-950 bg-opacity-60 h-[22px] left-[275px] rounded-[100px] top-[100px] w-[70px]">
        <div className="text-xs font-bold tracking-normal leading-5 text-center text-white ">내 위치</div>
      </div>

      <div className="absolute left-[285px] top-[126px]">
        <svg width="12" height="26" viewBox="0 0 12 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.666667 19.8078C0.666667 22.7533 3.05448 25.1411 6 25.1411C8.94552 25.1411 11.3333 22.7533 11.3333 19.8078C11.3333 16.8623 8.94552 14.4744 6 14.4744C3.05448 14.4744 0.666667 16.8623 0.666667 19.8078ZM6 0H5V19.8078H6H7V0H6Z" fill="#282828"/>
        </svg>
      </div>

      <div className="absolute w-5 h-5 bg-sky-500 bg-opacity-30 left-[84px] rounded-[100px] top-[198px]">
        <div className="inline-flex absolute flex-col items-center h-11 left-[-37px] top-[-34px] w-[94px]">
          <div className="flex gap-2.5 justify-center items-center px-3 py-0.5 bg-sky-500 rounded-[100px]">
            <div className="text-xs leading-5 text-center text-white">asdfghjkl001</div>
          </div>
          <div className="mt-1">
            <svg width="12" height="26" viewBox="0 0 12 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.666667 20C0.666667 22.9455 3.05448 25.3334 6 25.3334C8.94552 25.3334 11.3333 22.9455 11.3333 20C11.3333 17.0545 8.94552 14.6667 6 14.6667C3.05448 14.6667 0.666667 17.0545 0.666667 20ZM6 0.192261H5V20H6H7V0.192261H6Z" fill="#0E8FEB"/>
            </svg>
          </div>
        </div>
        <div className="absolute left-1 top-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="6" fill="#006DFB"/>
          </svg>
        </div>
      </div>

      <div className="absolute left-[200px] top-[250px]">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="20" rx="10" fill="#00A70B" fillOpacity="0.3"/>
          <circle cx="10" cy="10" r="6" fill="#26A12E"/>
        </svg>
      </div>

      <div className="absolute left-[150px] top-[180px]">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="20" rx="10" fill="#DE1443" fillOpacity="0.3"/>
          <circle cx="10" cy="10" r="6" fill="#DE1443"/>
        </svg>
      </div>
    </div>
  );
}


