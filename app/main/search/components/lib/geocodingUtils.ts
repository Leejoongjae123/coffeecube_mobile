// 네이버 지도 geocoding / reverseGeocoding 유틸리티

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export const sanitizeAddress = (address: string): string => {
  if (!address) {
    return "";
  }
  const noParentheses = address.replace(/\s*\([^)]*\)\s*/g, " ");
  return noParentheses.replace(/\s+/g, " ").trim();
};

export const expandProvinceName = (address: string): string => {
  if (!address) {
    return "";
  }
  const provinceMap: Record<string, string> = {
    서울: "서울특별시",
    부산: "부산광역시",
    대구: "대구광역시",
    인천: "인천광역시",
    광주: "광주광역시",
    대전: "대전광역시",
    울산: "울산광역시",
    세종: "세종특별자치시",
    경기: "경기도",
    강원: "강원특별자치도",
    충북: "충청북도",
    충남: "충청남도",
    전북: "전북특별자치도",
    전남: "전라남도",
    경북: "경상북도",
    경남: "경상남도",
    제주: "제주특별자치도",
  };
  return address.replace(/^(\S+)/, (match) => provinceMap[match] || match);
};

export const buildAddressCandidates = (
  address: string,
  alt?: string
): string[] => {
  const candidates: string[] = [];
  const pushUnique = (v?: string) => {
    if (v && v.trim() && !candidates.includes(v.trim())) {
      candidates.push(v.trim());
    }
  };
  pushUnique(address);
  pushUnique(alt);
  [...candidates].forEach((base) => {
    const sanitized = sanitizeAddress(base);
    pushUnique(sanitized);
    const expanded = expandProvinceName(base);
    pushUnique(expanded);
    const expandedSanitized = sanitizeAddress(expanded);
    pushUnique(expandedSanitized);
  });
  return candidates;
};

export const waitForNaverGeocoder = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).naverGeocoderLoaded) {
      resolve(true);
      return;
    }
    const handleNaverMapReady = () => {
      resolve(true);
      (window as any).removeEventListener("naverMapReady", handleNaverMapReady);
    };
    (window as any).addEventListener("naverMapReady", handleNaverMapReady);
    setTimeout(() => {
      resolve(false);
      (window as any).removeEventListener("naverMapReady", handleNaverMapReady);
    }, 10000);
  });
};

export const geocodeOnce = (query: string): Promise<GeocodeResult | null> => {
  return new Promise<GeocodeResult | null>((resolve) => {
    if (
      !window.naverGeocoderLoaded ||
      !(window as any).naver?.maps?.Service?.geocode
    ) {
      resolve(null);
      return;
    }
    (window as any).naver.maps.Service.geocode(
      { query },
      (status: number, response: any) => {
        if (status === (window as any).naver.maps.Service.Status.OK) {
          const r = response?.v2?.addresses?.[0];
          if (r && r.x && r.y) {
            resolve({ lat: parseFloat(r.y), lng: parseFloat(r.x) });
            return;
          }
        }
        resolve(null);
      }
    );
  });
};

export const reverseGeocodeOnce = (
  lat: number,
  lng: number
): Promise<string | null> => {
  return new Promise<string | null>((resolve) => {
    if (
      !window.naverGeocoderLoaded ||
      !(window as any).naver?.maps?.Service?.reverseGeocode
    ) {
      resolve(null);
      return;
    }
    (window as any).naver.maps.Service.reverseGeocode(
      {
        coords: new (window as any).naver.maps.LatLng(lat, lng),
        orders: [
          (window as any).naver.maps.Service.OrderType.ADDR,
          (window as any).naver.maps.Service.OrderType.ROAD_ADDR,
        ],
      },
      (status: number, response: any) => {
        if (status === (window as any).naver.maps.Service.Status.OK) {
          const r = response?.v2?.addresses?.[0];
          if (r?.roadAddress) {
            resolve(r.roadAddress);
            return;
          }
          if (r?.jibunAddress) {
            resolve(r.jibunAddress);
            return;
          }
        }
        resolve(null);
      }
    );
  });
};

export const geocodeAddress = async (
  address: string,
  altAddress?: string
): Promise<GeocodeResult | null> => {
  if (!address) {
    return null;
  }
  const candidates = buildAddressCandidates(address, altAddress);
  console.log("[geocodeAddress] 후보:", candidates);
  for (const candidate of candidates) {
    const result = await geocodeOnce(candidate);
    if (result) {
      console.log("[geocodeAddress] 성공:", candidate, result);
      return result;
    }
  }
  console.log("[geocodeAddress] 실패 -", address);
  return null;
};

export const isInKoreaBounds = (lat: number, lng: number): boolean => {
  // 대략적 한반도 경계 박스
  const minLat = 33.0;
  const maxLat = 39.5;
  const minLng = 124.5;
  const maxLng = 132.0;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};
