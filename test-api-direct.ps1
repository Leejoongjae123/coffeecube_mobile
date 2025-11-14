# PowerShell 스크립트로 바코드 API 테스트

Write-Host "=== 바코드 API 직접 테스트 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 로그인 API 호출
Write-Host "1️⃣ 로그인 시도..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@naver.com"
    password = "123456789"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session `
        -ErrorAction Stop
    
    Write-Host "✅ 로그인 성공!" -ForegroundColor Green
    Write-Host "   Status: $($loginResponse.StatusCode)" -ForegroundColor Gray
    
    # 쿠키 확인
    if ($session.Cookies) {
        Write-Host "   쿠키 개수: $($session.Cookies.Count)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # 2. 바코드 API 호출
    Write-Host "2️⃣ 바코드 생성 요청..." -ForegroundColor Yellow
    
    $barcodeResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/barcode" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    Write-Host "✅ 바코드 생성 성공!" -ForegroundColor Green
    Write-Host "   Status: $($barcodeResponse.StatusCode)" -ForegroundColor Gray
    Write-Host "   Content-Type: $($barcodeResponse.Headers.'Content-Type')" -ForegroundColor Gray
    Write-Host "   Size: $($barcodeResponse.Content.Length) bytes" -ForegroundColor Gray
    Write-Host ""
    
    # 3. 바코드 이미지 저장
    $outputPath = "public\barcode-new.png"
    [System.IO.File]::WriteAllBytes($outputPath, $barcodeResponse.Content)
    
    Write-Host "3️⃣ 바코드 저장 완료!" -ForegroundColor Yellow
    Write-Host "   저장 경로: $outputPath" -ForegroundColor Gray
    Write-Host ""
    
    # 4. Python으로 디코딩
    Write-Host "4️⃣ 바코드 디코딩..." -ForegroundColor Yellow
    
    # decode-barcode.py를 수정하여 새 파일 읽기
    $pythonScript = @"
import cv2
from pyzbar.pyzbar import decode

image = cv2.imread('public/barcode-new.png')
if image is not None:
    decoded = decode(image)
    if decoded:
        data = decoded[0].data.decode('utf-8')
        print(f'📊 바코드 데이터: {repr(data)}')
        if '\t' in data:
            parts = data.split('\t')
            print(f'📧 Email: {parts[0]}')
            print(f'🔓 Password: {parts[1] if len(parts) > 1 else "(없음)"}')
            print(f'📏 Password 길이: {len(parts[1]) if len(parts) > 1 else 0}')
    else:
        print('❌ 바코드 디코딩 실패')
else:
    print('❌ 이미지 로드 실패')
"@
    
    $pythonScript | Out-File -FilePath "decode-new-barcode.py" -Encoding UTF8
    
    python decode-new-barcode.py
    
} catch {
    Write-Host "❌ 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   HTTP Status: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
