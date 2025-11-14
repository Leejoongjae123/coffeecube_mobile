const Jimp = require("jimp");
const jsQR = require("jsqr");
const { BrowserMultiFormatReader } = require("@zxing/library");

async function decodeBarcodeWithZXing() {
  try {
    console.log("=== ZXing으로 바코드 디코딩 ===");
    const codeReader = new BrowserMultiFormatReader();
    
    // Node.js 환경에서는 이미지 경로를 직접 사용할 수 없으므로
    // Jimp로 이미지를 읽어서 처리
    const image = await Jimp.read("./public/barcode.png");
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height,
    };
    
    console.log("📊 이미지 크기:", imageData.width, "x", imageData.height);
    
    // ZXing은 브라우저 환경용이라 Node.js에서는 제한적
    console.log("⚠️  ZXing은 브라우저 환경에 최적화되어 있습니다.");
    
  } catch (error) {
    console.log("❌ ZXing 디코딩 실패:", error.message);
  }
}

async function decodeBarcodeWithJimp() {
  try {
    console.log("\n=== Jimp로 바코드 이미지 분석 ===");
    const image = await Jimp.read("./public/barcode.png");
    
    console.log("📊 이미지 정보:");
    console.log("   - 너비:", image.bitmap.width, "px");
    console.log("   - 높이:", image.bitmap.height, "px");
    console.log("   - 색상 타입:", image._rgba ? "RGBA" : "RGB");
    
    // 이미지를 그레이스케일로 변환하여 바코드 패턴 확인
    const gray = image.clone().greyscale();
    
    // 중간 라인의 픽셀 값 샘플링
    const y = Math.floor(image.bitmap.height / 2);
    const samples = [];
    
    for (let x = 0; x < Math.min(50, image.bitmap.width); x += 5) {
      const idx = (y * image.bitmap.width + x) * 4;
      const brightness = gray.bitmap.data[idx];
      samples.push(brightness);
    }
    
    console.log("\n📈 바코드 패턴 샘플 (중간 라인, 0=검정, 255=흰색):");
    console.log("   ", samples.join(", "));
    
    console.log("\n💡 바코드 이미지가 존재하지만, JavaScript로 CODE128 디코딩하려면");
    console.log("   전문 라이브러리(quagga2 등)가 필요합니다.");
    
  } catch (error) {
    console.log("❌ 이미지 분석 실패:", error.message);
  }
}

// Python을 사용한 디코딩 스크립트 생성
function createPythonDecoder() {
  const pythonScript = `
import cv2
from pyzbar.pyzbar import decode
import numpy as np

# 바코드 이미지 읽기
image = cv2.imread('public/barcode.png')

if image is None:
    print("❌ 이미지를 찾을 수 없습니다.")
else:
    print("=== Python으로 바코드 디코딩 ===")
    print(f"📊 이미지 크기: {image.shape[1]} x {image.shape[0]}")
    
    # 바코드 디코딩
    decoded_objects = decode(image)
    
    if decoded_objects:
        for obj in decoded_objects:
            print(f"\\n✅ 바코드 디코딩 성공!")
            print(f"   📋 타입: {obj.type}")
            print(f"   📊 데이터: {obj.data.decode('utf-8')}")
            print(f"   📏 데이터 길이: {len(obj.data.decode('utf-8'))}")
            
            # 탭으로 분리
            data = obj.data.decode('utf-8')
            if '\\t' in data:
                parts = data.split('\\t')
                print(f"\\n🔍 탭으로 분리:")
                print(f"   📧 Email: {parts[0]}")
                print(f"   🔓 Password: {parts[1] if len(parts) > 1 else '(없음)'}")
    else:
        print("\\n❌ 바코드를 디코딩할 수 없습니다.")
        print("💡 이미지가 손상되었거나 바코드 형식이 올바르지 않을 수 있습니다.")
`;

  require("fs").writeFileSync("decode-barcode.py", pythonScript.trim());
  console.log("\n✅ Python 디코딩 스크립트 생성: decode-barcode.py");
  console.log("💡 실행 방법:");
  console.log("   1. pip install opencv-python pyzbar");
  console.log("   2. python decode-barcode.py");
}

async function main() {
  await decodeBarcodeWithJimp();
  createPythonDecoder();
  
  console.log("\n" + "=".repeat(50));
  console.log("📝 요약:");
  console.log("JavaScript로 CODE128 바코드를 디코딩하는 것은 복잡합니다.");
  console.log("Python 스크립트(decode-barcode.py)를 사용하면 쉽게 확인할 수 있습니다.");
}

main();
