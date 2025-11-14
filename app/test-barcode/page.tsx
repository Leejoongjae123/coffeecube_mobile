"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TestBarcodePage() {
  const [result, setResult] = useState<string>("");
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null);

  const testBarcode = async () => {
    try {
      setResult("바코드 생성 중...");

      const response = await fetch("/api/barcode", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        setResult(`❌ 에러: ${JSON.stringify(error)}`);
        return;
      }

      // 이미지 blob을 URL로 변환
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setBarcodeUrl(imageUrl);

      setResult("✅ 바코드 생성 성공! 서버 콘솔 로그를 확인하세요.");
    } catch (error) {
      setResult(`❌ 오류: ${error}`);
    }
  };

  const downloadBarcode = () => {
    if (barcodeUrl) {
      const a = document.createElement("a");
      a.href = barcodeUrl;
      a.download = "test-barcode.png";
      a.click();
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">바코드 API 테스트</h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              admin@naver.com으로 로그인한 상태에서 테스트하세요.
            </p>
            <Button onClick={testBarcode} className="w-full">
              바코드 생성 테스트
            </Button>
          </div>

          {result && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {barcodeUrl && (
            <div className="space-y-2">
              <div className="border rounded-lg p-4 bg-white">
                <img
                  src={barcodeUrl}
                  alt="Generated Barcode"
                  className="w-full"
                />
              </div>
              <Button onClick={downloadBarcode} variant="outline" className="w-full">
                바코드 다운로드
              </Button>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✅ 바코드가 생성되었습니다.</p>
                <p>📝 다음 단계:</p>
                <ol className="list-decimal list-inside ml-4 space-y-1">
                  <li>바코드 다운로드 버튼 클릭</li>
                  <li>다운로드한 파일을 public 폴더에 복사</li>
                  <li>
                    터미널에서 <code className="bg-gray-200 px-1 rounded">python decode-barcode.py</code> 실행
                  </li>
                </ol>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-bold mb-2">서버 로그 확인 방법:</h2>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>개발 서버 터미널 확인</li>
              <li>
                다음 정보가 출력됩니다:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>📧 Email</li>
                  <li>🔐 Encrypted Password</li>
                  <li>🔓 Decrypted Password</li>
                  <li>📊 Final Barcode Data</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
