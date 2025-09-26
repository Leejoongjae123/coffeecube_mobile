import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const goal = searchParams.get("goal");

  console.log("[driving API] 요청 받음:", {
    start,
    goal,
    url: request.url,
  });

  if (!start || !goal) {
    console.error("[driving API] 파라미터 누락:", { start, goal });
    return NextResponse.json(
      { error: "출발지와 도착지를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  // 좌표 형식 검증
  const startCoords = start.split(",");
  const goalCoords = goal.split(",");

  if (startCoords.length !== 2 || goalCoords.length !== 2) {
    console.error("[driving API] 좌표 형식 오류:", { start, goal });
    return NextResponse.json(
      { error: "좌표 형식이 올바르지 않습니다. (경도,위도 형식이어야 합니다)" },
      { status: 400 }
    );
  }

  const startLng = parseFloat(startCoords[0]);
  const startLat = parseFloat(startCoords[1]);
  const goalLng = parseFloat(goalCoords[0]);
  const goalLat = parseFloat(goalCoords[1]);

  console.log("[driving API] 파싱된 좌표:", {
    start: { longitude: startLng, latitude: startLat },
    goal: { longitude: goalLng, latitude: goalLat },
  });

  // 좌표 유효성 검증 (한국 좌표 범위 체크)
  if (
    isNaN(startLng) ||
    isNaN(startLat) ||
    isNaN(goalLng) ||
    isNaN(goalLat) ||
    startLng < 124 ||
    startLng > 132 || // 한국 경도 범위
    startLat < 33 ||
    startLat > 43 || // 한국 위도 범위
    goalLng < 124 ||
    goalLng > 132 ||
    goalLat < 33 ||
    goalLat > 43
  ) {
    console.error("[driving API] 좌표 범위 오류:", {
      start: { longitude: startLng, latitude: startLat },
      goal: { longitude: goalLng, latitude: goalLat },
    });
    return NextResponse.json(
      { error: "좌표가 한국 범위를 벗어났습니다." },
      { status: 400 }
    );
  }

  // 환경변수 확인
  const apiKeyId = process.env.NEXT_PUBLIC_NAVER_MAP_KEY_ID || "";
  const apiKey = process.env.NEXT_PUBLIC_NAVER_MAP_KEY_SECRET || "";

  if (!apiKeyId || !apiKey) {
    console.error("[driving API] API 키 누락");
    return NextResponse.json(
      { error: "네이버 API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    // 네이버 클라우드 플랫폼 Maps API Directions 5 호출
    const naverApiUrl = `https://maps.apigw.ntruss.com/map-direction/v1/driving?start=${start}&goal=${goal}&option=traoptimal`;

    console.log("[driving API] 네이버 API 호출:", {
      url: naverApiUrl,
      start,
      goal,
    });

    const response = await fetch(naverApiUrl, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": apiKeyId,
        "X-NCP-APIGW-API-KEY": apiKey,
      },
    });

    console.log("[driving API] 네이버 API 응답:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[driving API] 네이버 API 에러 응답:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      return NextResponse.json(
        {
          error: "경로 찾기에 실패했습니다.",
          details: `${response.status} ${response.statusText}`,
          responseBody: errorText,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("[driving API] 네이버 API 성공 응답:", data);

    // 네이버 API 응답 코드 확인
    if (data.code !== 0) {
      const errorMessages: Record<number, string> = {
        1: "출발지와 도착지가 동일합니다.",
        2: "출발지 또는 도착지가 도로 주변이 아닙니다.",
        3: "자동차 길 찾기 결과를 제공할 수 없습니다.",
        4: "경유지가 도로 주변이 아닙니다.",
        5: "경로가 너무 깁니다.",
      };

      console.error("[driving API] 네이버 API 코드 에러:", {
        code: data.code,
        message: errorMessages[data.code],
        data,
      });

      return NextResponse.json(
        { error: errorMessages[data.code] || "경로 찾기에 실패했습니다." },
        { status: 400 }
      );
    }

    console.log("[driving API] 성공적으로 경로 찾기 완료");
    return NextResponse.json(data);
  } catch (error) {
    console.error("[driving API] 예외 발생:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "경로 찾기 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
