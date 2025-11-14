const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey() {
  const key = "godcoffeecube";
  return crypto.scryptSync(key, "salt", KEY_LENGTH);
}

function decryptPassword(encryptedText) {
  try {
    if (!encryptedText) {
      return "";
    }

    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedText, "base64");

    const iv = combined.slice(0, IV_LENGTH);
    const tag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encryptedBuffer = combined.slice(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    return decryptedBuffer.toString("utf8");
  } catch (error) {
    console.log("❌ 복호화 실패:", error.message);
    return "";
  }
}

// admin@naver.com의 데이터
const email = "admin@naver.com";
const encryptedPassword = "60iVc43ZrOtoj7E6rUr/ymRxNgXtpGgs18cGlUh1Rf4Q3d0PLw==";

console.log("=== 바코드 데이터 생성 테스트 ===");
console.log("");

// 1. 복호화
const decryptedPassword = decryptPassword(encryptedPassword);
console.log("1️⃣ 복호화 결과");
console.log("   📧 Email:", email);
console.log("   🔓 Decrypted Password:", decryptedPassword);
console.log("   📏 Password Length:", decryptedPassword.length);
console.log("");

// 2. 바코드 데이터 생성
const barcodeData = `${email}\t${decryptedPassword}`;
console.log("2️⃣ 바코드 데이터");
console.log("   📊 Barcode Data:", barcodeData);
console.log("   📏 Total Length:", barcodeData.length);
console.log("");

// 3. 바코드 데이터 파싱 (스캔 후 시뮬레이션)
const parts = barcodeData.split("\t");
console.log("3️⃣ 바코드 스캔 시뮬레이션 (탭으로 분리)");
console.log("   📧 Parsed Email:", parts[0]);
console.log("   🔓 Parsed Password:", parts[1]);
console.log("");

// 4. 검증
if (parts[0] === email && parts[1] === decryptedPassword) {
  console.log("✅ 바코드 데이터가 올바르게 생성되었습니다!");
  console.log("✅ 스캔 후 이메일과 비밀번호를 정상적으로 추출할 수 있습니다.");
} else {
  console.log("❌ 바코드 데이터에 문제가 있습니다.");
}
