import cv2
from pyzbar.pyzbar import decode
import sys

try:
    # 바코드 이미지 읽기
    image = cv2.imread('public/barcode.png')

    if image is None:
        print("❌ 이미지를 찾을 수 없습니다: public/barcode.png")
        sys.exit(1)

    print("=== 바코드 이미지 디코딩 ===")
    print(f"📊 이미지 크기: {image.shape[1]} x {image.shape[0]} 픽셀")
    print()

    # 바코드 디코딩
    decoded_objects = decode(image)

    if decoded_objects:
        for obj in decoded_objects:
            print("✅ 바코드 디코딩 성공!")
            print(f"📋 바코드 타입: {obj.type}")
            print()
            
            # 원본 데이터 출력
            raw_data = obj.data.decode('utf-8')
            print(f"📊 원본 데이터: {repr(raw_data)}")
            print(f"📏 데이터 길이: {len(raw_data)} 문자")
            print()
            
            # 탭으로 분리 시도
            if '\t' in raw_data:
                parts = raw_data.split('\t')
                print("🔍 탭(\\t)으로 분리된 데이터:")
                print(f"   [0] 📧 Email: {parts[0]}")
                if len(parts) > 1:
                    print(f"   [1] 🔓 Password: {parts[1]}")
                    print(f"   [1] 📏 Password 길이: {len(parts[1])} 문자")
                else:
                    print(f"   [1] 🔓 Password: (없음)")
                
                if len(parts) > 2:
                    print(f"   ⚠️  추가 데이터: {parts[2:]}")
            else:
                print("⚠️  탭 문자가 없습니다. 전체 데이터:")
                print(f"   {raw_data}")
            
            print()
            print("=" * 50)
            
    else:
        print("❌ 바코드를 디코딩할 수 없습니다.")
        print()
        print("가능한 원인:")
        print("  1. 이미지가 손상되었습니다")
        print("  2. 바코드 형식이 지원되지 않습니다")
        print("  3. 이미지 품질이 낮습니다")

except ImportError as e:
    print("❌ 필요한 라이브러리가 설치되지 않았습니다.")
    print()
    print("다음 명령어로 설치하세요:")
    print("  pip install opencv-python pyzbar")
    print()
    print(f"오류 상세: {e}")

except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()
