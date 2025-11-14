import cv2
from pyzbar.pyzbar import decode
import os

def decode_barcode(filepath):
    """바코드 이미지를 디코딩하여 결과 반환"""
    if not os.path.exists(filepath):
        return None, "파일이 존재하지 않습니다"
    
    image = cv2.imread(filepath)
    if image is None:
        return None, "이미지를 로드할 수 없습니다"
    
    decoded = decode(image)
    if not decoded:
        return None, "바코드를 디코딩할 수 없습니다"
    
    data = decoded[0].data.decode('utf-8')
    return data, None

print("=" * 60)
print("바코드 비교 분석")
print("=" * 60)

# 기존 바코드 (문제가 있는 것)
print("\n1️⃣ 기존 바코드 (public/barcode.png)")
print("-" * 60)
old_data, old_error = decode_barcode('public/barcode.png')
if old_error:
    print(f"❌ {old_error}")
else:
    print(f"📊 원본 데이터: {repr(old_data)}")
    print(f"📏 길이: {len(old_data)} 문자")
    if '\t' in old_data:
        parts = old_data.split('\t')
        print(f"\n분리 결과:")
        print(f"  📧 Email: {parts[0]}")
        print(f"  🔓 Password: '{parts[1] if len(parts) > 1 else '(없음)'}'")
        print(f"  📏 Password 길이: {len(parts[1]) if len(parts) > 1 else 0} 문자")
        
        if len(parts) > 1 and parts[1]:
            print(f"\n✅ 비밀번호 있음")
        else:
            print(f"\n❌ 비밀번호 없음 (문제!)")

# 새 바코드 (브라우저에서 다운로드한 것)
print("\n\n2️⃣ 새 바코드 (다운로드 후 확인)")
print("-" * 60)

# 가능한 파일명들 체크
possible_files = [
    'public/barcode-new.png',
    'public/test-barcode.png',
    'public/barcode-latest.png',
    'test-barcode.png',
    'barcode-new.png'
]

found = False
for filepath in possible_files:
    if os.path.exists(filepath):
        print(f"📁 파일 발견: {filepath}")
        new_data, new_error = decode_barcode(filepath)
        if new_error:
            print(f"❌ {new_error}")
        else:
            print(f"📊 원본 데이터: {repr(new_data)}")
            print(f"📏 길이: {len(new_data)} 문자")
            if '\t' in new_data:
                parts = new_data.split('\t')
                print(f"\n분리 결과:")
                print(f"  📧 Email: {parts[0]}")
                print(f"  🔓 Password: '{parts[1] if len(parts) > 1 else '(없음)'}'")
                print(f"  📏 Password 길이: {len(parts[1]) if len(parts) > 1 else 0} 문자")
                
                if len(parts) > 1 and parts[1]:
                    print(f"\n✅ 비밀번호 정상 포함!")
                else:
                    print(f"\n❌ 비밀번호 없음")
        found = True
        break

if not found:
    print("⚠️  새 바코드 파일을 찾을 수 없습니다.")
    print("\n다음 중 하나로 저장하세요:")
    for f in possible_files:
        print(f"  - {f}")

print("\n" + "=" * 60)
print("\n📝 결론:")
print("서버 로그에서는 비밀번호가 정상적으로 복호화되고 있습니다.")
print("브라우저에서 새로 다운로드한 바코드를 확인해보세요.")
print("=" * 60)
