const fs = require('fs');
const path = require('path');

async function testBarcodeAPI() {
  try {
    console.log("=== 바코드 API 테스트 ===\n");
    
    // 쿠키를 읽어서 인증 토큰 가져오기 (실제로는 브라우저에서 로그인 필요)
    console.log("⚠️  주의: 이 스크립트는 인증이 필요합니다.");
    console.log("브라우저에서 http://localhost:3000/api/barcode 를 직접 호출하세요.\n");
    
    // 대신 현재 public/barcode.png 파일 정보 확인
    const barcodePath = path.join(__dirname, 'public', 'barcode.png');
    
    if (fs.existsSync(barcodePath)) {
      const stats = fs.statSync(barcodePath);
      console.log("📁 현재 바코드 파일 정보:");
      console.log(`   경로: ${barcodePath}`);
      console.log(`   크기: ${stats.size} bytes`);
      console.log(`   수정일: ${stats.mtime}`);
      console.log();
      
      // Python으로 현재 바코드 디코딩
      console.log("🔍 현재 바코드 내용 확인:");
      console.log("   python decode-barcode.py 를 실행하세요.");
      console.log();
    } else {
      console.log("❌ 바코드 파일이 없습니다.");
    }
    
    console.log("=" .repeat(50));
    console.log("\n📝 테스트 방법:");
    console.log("1. 브라우저에서 admin@naver.com / 123456789 로 로그인");
    console.log("2. 개발자 도구(F12) 열기");
    console.log("3. Console 탭에서 다음 실행:");
    console.log("\n   fetch('/api/barcode')");
    console.log("     .then(r => r.blob())");
    console.log("     .then(blob => {");
    console.log("       const url = URL.createObjectURL(blob);");
    console.log("       const a = document.createElement('a');");
    console.log("       a.href = url;");
    console.log("       a.download = 'new-barcode.png';");
    console.log("       a.click();");
    console.log("     });");
    console.log("\n4. 다운로드된 new-barcode.png를 public 폴더에 복사");
    console.log("5. python decode-barcode.py 로 확인");
    
  } catch (error) {
    console.log("❌ 오류:", error.message);
  }
}

testBarcodeAPI();
