"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 컨텐츠 */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-lg shadow-lg">
        {title && (
          <div className="px-6 py-4 ">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}

        <div className="px-6 py-4">{children}</div>

        {showCloseButton && (
          <div className="px-6 py-4 border-gray-200">
            <Button
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              확인
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
