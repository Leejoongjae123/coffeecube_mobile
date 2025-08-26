"use client";

import { Search } from "lucide-react";

interface SearchInputButtonProps {
  onOpen: () => void;
}

export default function SearchInputButton({ onOpen }: SearchInputButtonProps) {
  return (
    <div className="absolute left-5 z-10 top-[23px] max-md:inset-x-5 max-md:w-auto max-sm:inset-x-4">
      <button
        onClick={onOpen}
        className="flex flex-col gap-5 items-start px-5 py-3 border border-solid shadow-sm bg-stone-50 border-stone-300 h-[42px] rounded-[100px] w-[316px] max-md:w-full max-sm:px-4 max-sm:py-2.5 max-sm:h-10"
      >
        <div className="flex justify-between items-center w-full">
          <div className="text-sm font-semibold text-neutral-400 max-sm:text-xs">주소를 입력해주세요</div>
          <Search className="w-[18px] h-[18px] text-blue-500 stroke-2" />
        </div>
      </button>
    </div>
  );
}


