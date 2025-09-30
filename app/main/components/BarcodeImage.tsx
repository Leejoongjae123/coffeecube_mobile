"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function BarcodeImage() {
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const barcodeUrlRef = useRef<string | null>(null);

  // 바코드 이미지 가져오기
  useEffect(() => {
    const fetchBarcodeImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/barcode", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          setError("바코드를 생성할 수 없습니다.");
          return;
        }

        // 이미지 blob을 URL로 변환
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setBarcodeUrl(imageUrl);
        barcodeUrlRef.current = imageUrl;
      } catch {
        setError("바코드 로딩 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarcodeImage();

    // 컴포넌트 언마운트 시 URL 정리
    return () => {
      if (barcodeUrlRef.current) {
        URL.revokeObjectURL(barcodeUrlRef.current);
      }
    };
  }, []);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center space-y-3">
        <div className="w-full bg-white rounded-lg relative aspect-[4/1] p-4">
          <Skeleton className="w-full h-full rounded-md" />
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-sm text-red-600 text-center">{error}</p>
      </div>
    );
  }

  // 바코드 이미지 표시
  if (barcodeUrl) {
    return (
      <div className="w-full flex flex-col items-center space-y-3">
        <div className="w-full bg-white rounded-lg relative aspect-[4/1]">
          <Image
            src={barcodeUrl}
            alt="로그인 바코드"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  return null;
}
