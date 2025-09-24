"use client";

import { useSearchStore } from "@/app/main/search/components/store/useSearchStore";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface SearchInputButtonProps {
  onOpen: () => void;
}

export default function SearchInputButton({ onOpen }: SearchInputButtonProps) {
  const selectedLocation = useSearchStore((state) => state.selectedLocation);
  const searchType = useSearchStore((state) => state.searchType);

  return (
    <div className="absolute left-5 z-10 top-[23px] max-md:inset-x-5 max-md:w-auto max-sm:inset-x-4">
      <button
        onClick={onOpen}
        className={`flex flex-col justify-center gap-5 items-start px-5 border border-solid shadow-sm bg-stone-50 border-stone-300 rounded-[100px] w-[316px] ${
          selectedLocation ? "h-[50px]" : "h-[42px]"
        }`}
      >
        <div className="flex justify-between items-center w-full">
          {selectedLocation ? (
            <div className="flex items-center gap-2 truncate">
              <Badge className="bg-green-600 text-white flex-shrink-0 rounded-full h-[26px]">
                {searchType === "address" ? "주소" : "코드"}
              </Badge>
              <span className="text-sm font-semibold text-primary truncate">
                {selectedLocation.address}
              </span>
            </div>
          ) : (
            <div className="text-sm font-semibold text-[#9A9A9A]">
              검색 조건을 입력해주세요
            </div>
          )}
          <Image
            src={
              selectedLocation
                ? "/search_address_green.svg"
                : "/search_address.svg"
            }
            alt="search"
            width={18}
            height={18}
            className="flex-shrink-0"
          />
        </div>
      </button>
    </div>
  );
}
