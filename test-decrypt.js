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
      console.log("❌ 암호화된 텍스트가 비어있습니다.");
      return "";
    }

    const key = getEncryptionKey();
    console.log("🔑 암호화 키 생성 완료");
    
    const combined = Buffer.from(encryptedText, "base64");
    console.log("📦 Combined buffer 길이:", combined.length);

    // IV, TAG, 암호문 분리
    const iv = combined.slice(0, IV_LENGTH);
    const tag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encryptedBuffer = combined.slice(IV_LENGTH + TAG_LENGTH);

    console.log("📊 IV 길이:", iv.length);
    console.log("📊 TAG 길이:", tag.length);
    console.log("📊 암호문 길이:", encryptedBuffer.length);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    const result = decryptedBuffer.toString("utf8");
    console.log("✅ 복호화 성공!");
    return result;
  } catch (error) {
    console.log("❌ 복호화 실패:", error.message);
    return "";
  }
}

// admin@naver.com의 암호화된 비밀번호
const encryptedPassword = "60iVc43ZrOtoj7E6rUr/ymRxNgXtpGgs18cGlUh1Rf4Q3d0PLw==";

console.log("=== 비밀번호 복호화 테스트 ===");
console.log("🔐 암호화된 비밀번호:", encryptedPassword);
console.log("");

const decrypted = decryptPassword(encryptedPassword);
console.log("");
console.log("🔓 복호화된 비밀번호:", decrypted);
console.log("📏 복호화된 비밀번호 길이:", decrypted.length);
