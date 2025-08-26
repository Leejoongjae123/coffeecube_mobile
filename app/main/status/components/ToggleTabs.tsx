"use client";

import { TabKey } from "../types";

interface ToggleTabsProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export default function ToggleTabs({ active, onChange }: ToggleTabsProps) {
  return (
    <div className="flex gap-2.5 items-center self-start font-semibold">
      <button
        onClick={() => onChange('daily')}
        className={`flex gap-2.5 justify-center items-center px-2 py-1.5 w-20 rounded-[100px] transition-colors ${
          active === 'daily' ? 'text-white bg-green-600' : 'bg-neutral-200 text-stone-500'
        }`}
      >
        <div className="self-stretch my-auto">일별 수거량</div>
      </button>
      <button
        onClick={() => onChange('monthly')}
        className={`flex gap-2.5 justify-center items-center px-2 py-1.5 w-20 rounded-[100px] transition-colors ${
          active === 'monthly' ? 'text-white bg-green-600' : 'bg-neutral-200 text-stone-500'
        }`}
      >
        <div className="self-stretch my-auto">월별 수거량</div>
      </button>
    </div>
  );
}


