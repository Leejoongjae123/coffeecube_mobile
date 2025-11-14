# 새로 생성된 바코드 다운로드

Write-Host "=== 새 바코드 다운로드 ===" -ForegroundColor Cyan
Write-Host ""

try {
    # 바코드 API 호출 (이미 로그인된 세션 쿠키 사용)
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/barcode" `
        -Method GET `
        -UseBasicParsing
    
    # 바코드 이미지 저장
    $outputPath = "public\barcode-latest.png"
    [System.IO.File]::WriteAllBytes($outputPath, $response.Content)
    
    Write-Host "✅ 바코드 다운로드 완료!" -ForegroundColor Green
    Write-Host "   저장 경로: $outputPath" -ForegroundColor Gray
    Write-Host "   크기: $($response.Content.Length) bytes" -ForegroundColor Gray
    Write-Host ""
    
    # Python으로 디코딩
    Write-Host "🔍 바코드 디코딩 중..." -ForegroundColor Yellow
    
    $pythonScript = @"
import cv2
from pyzbar.pyzbar import decode

print('=== 새로 생성된 바코드 디코딩 ===')
image = cv2.imread('public/barcode-latest.png')
if image is not None:
    decoded = decode(image)
    if decoded:
        data = decoded[0].data.decode('utf-8')
        print(f'\n📊 바코드 원본 데이터: {repr(data)}')
        print(f'📏 데이터 길이: {len(data)} 문자')
        
        if '\t' in data:
            parts = data.split('\t')
            print(f'\n🔍 탭으로 분리:')
            print(f'   [0] 📧 Email: {parts[0]}')
            print(f'   [1] 🔓 Password: {parts[1] if len(parts) > 1 else "(없음)"}')
            print(f'   [1] 📏 Password 길이: {len(parts[1]) if len(parts) > 1 else 0} 문자')
            
            if len(parts) > 1 and parts[1]:
                print(f'\n✅ 비밀번호가 정상적으로 포함되어 있습니다!')
            else:
                print(f'\n❌ 비밀번호가 비어있습니다!')
        else:
            print(f'\n⚠️  탭 문자 없음: {data}')
    else:
        print('\n❌ 바코드 디코딩 실패')
else:
    print('\n❌ 이미지 로드 실패')

print('\n' + '='*50)
print('\n비교: 기존 바코드 (public/barcode.png)')
old_image = cv2.imread('public/barcode.png')
if old_image is not None:
    old_decoded = decode(old_image)
    if old_decoded:
        old_data = old_decoded[0].data.decode('utf-8')
        print(f'📊 기존 바코드 데이터: {repr(old_data)}')
        if '\t' in old_data:
            old_parts = old_data.split('\t')
            print(f'   Password: {old_parts[1] if len(old_parts) > 1 else "(없음)"}')
"@
    
    $pythonScript | Out-File -FilePath "decode-latest-barcode.py" -Encoding UTF8
    python decode-latest-barcode.py
    
} catch {
    Write-Host "❌ 오류: $($_.Exception.Message)" -ForegroundColor Red
}
