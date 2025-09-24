"use client";
import * as React from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  SearchResult,
  SearchResponse,
  RobotStatus,
  SelectedLocation,
} from "@/app/main/search/types";
import {
  useSearchStore,
  SearchState,
} from "@/app/main/search/components/store/useSearchStore";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 상태에 따른 배지 스타일 함수
const getStatusBadgeStyle = (status: RobotStatus) => {
  switch (status) {
    case "수거필요":
      return "w-20 px-2 py-1.5 bg-sky-200 text-sky-600 text-xs font-bold rounded-[100px] justify-center";
    case "장애발생":
      return "w-20 px-2 py-1.5 bg-red-100 text-rose-600 text-xs font-bold rounded-[100px] justify-center";
    default:
      return "w-20 px-2 py-1.5 bg-green-100 text-green-600 text-xs font-bold rounded-[100px] justify-center";
  }
};

function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const setResults = useSearchStore(
    (s: SearchState) => s.setSearchResultsFromApi
  );
  const setSelectedLocation = useSearchStore(
    (s: SearchState) => s.setSelectedLocation
  );
  const [activeTab, setActiveTab] = React.useState<"address" | "code">(
    "address"
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showResults, setShowResults] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [searchHistory, setSearchHistory] = React.useState<
    Array<{
      query: string;
      type: "address" | "code";
      date: string;
    }>
  >([]);

  // 주소 전처리 및 재시도 유틸리티
  const sanitizeAddress = React.useCallback((address: string) => {
    if (!address) {
      return "";
    }
    const noParentheses = address.replace(/\s*\([^)]*\)\s*/g, " ");
    return noParentheses.replace(/\s+/g, " ").trim();
  }, []);

  const expandProvinceName = React.useCallback((address: string) => {
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
  }, []);

  const buildAddressCandidates = React.useCallback(
    (address: string, alt?: string) => {
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
    },
    [sanitizeAddress, expandProvinceName]
  );

  const geocodeOnce = React.useCallback((query: string) => {
    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (
        !window?.naverGeocoderLoaded ||
        !window?.naver?.maps?.Service?.geocode
      ) {
        resolve(null);
        return;
      }
      window.naver.maps.Service.geocode(
        { query },
        (status: number, response: NaverGeocodeResponse) => {
          if (status === window.naver.maps.Service.Status.OK) {
            const r = response.v2?.addresses?.[0];
            if (r && r.x && r.y) {
              resolve({ lat: parseFloat(r.y), lng: parseFloat(r.x) });
              return;
            }
          }
          resolve(null);
        }
      );
    });
  }, []);

  // 네이버 지도 API 타입 정의
  interface NaverGeocodeResult {
    x: string;
    y: string;
    roadAddress: string;
    jibunAddress: string;
  }

  interface NaverGeocodeResponse {
    v2: {
      addresses: NaverGeocodeResult[];
      meta: {
        totalCount: number;
      };
    };
  }

  // 직접 주소를 geocode로 변환하는 함수
  const handleDirectGeocode = React.useCallback(
    async (address: string) => {
      if (!address.trim() || activeTab !== "address") {
        return;
      }

      const candidates = buildAddressCandidates(address);
      console.log("=== 직접 입력 주소 후보 ===");
      candidates.forEach((c, i) => console.log(`#${i + 1}:`, c));
      console.log("======================");

      for (const c of candidates) {
        const r = await geocodeOnce(c);
        if (r) {
          console.log("직접 입력 주소 변환 성공:", c);
          const selectedLocation: SelectedLocation = {
            id: `geocode_${Date.now()}`,
            code: "",
            name: c,
            address: c,
            install_location_raw: undefined,
            latitude: r.lat,
            longitude: r.lng,
            status: "정상",
          };
          setSelectedLocation(selectedLocation, activeTab);
          onClose();
          return;
        }
      }
      console.log("직접 입력 주소 변환 실패");
    },
    [
      activeTab,
      setSelectedLocation,
      onClose,
      buildAddressCandidates,
      geocodeOnce,
    ]
  );

  // 검색 함수
  const handleSearch = React.useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/equipment/search?query=${encodeURIComponent(
            query
          )}&type=${activeTab}`
        );
        const data: SearchResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "검색 중 오류가 발생했습니다.");
        }

        setSearchResults(data.results);
        setResults(data.results);
        setShowResults(true);

        // 검색 기록에 추가
        const newHistoryItem = {
          query,
          type: activeTab,
          date: new Date().toISOString().split("T")[0],
        };
        setSearchHistory((prev) => {
          const filtered = prev.filter(
            (item) => !(item.query === query && item.type === activeTab)
          );
          return [newHistoryItem, ...filtered].slice(0, 10); // 최대 10개만 저장
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, setResults]
  );

  // 디바운스된 검색
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch, setResults]);

  // 위치 선택 핸들러
  const handleSelectLocation = async (result: SearchResult) => {
    // result 객체 전체를 로그로 출력하여 install_location_raw 필드 확인
    console.log("=== 선택된 검색 결과 전체 데이터 ===");
    console.log(result);
    console.log("===================================");

    // install_location_raw가 있는지 확인
    console.log(`install_location_raw: ${result.install_location_raw}`);
    console.log(`address (install_location): ${result.address}`);

    const addressForGeocode = result.install_location_raw || result.address;
    console.log(`Geocode에 사용할 주소: ${addressForGeocode}`);
    console.log(
      `install_location_raw 존재 여부: ${
        result.install_location_raw ? "YES" : "NO"
      }`
    );

    // 주소를 기반으로 geocode API를 통해 정확한 좌표 가져오기
    // 후보 주소 집합 구성
    const candidates = buildAddressCandidates(
      addressForGeocode,
      result.address !== addressForGeocode ? result.address : undefined
    );
    console.log("=== 검색 결과 선택 주소 후보 ===");
    candidates.forEach((c, i) => console.log(`#${i + 1}:`, c));
    console.log("===========================");

    for (const c of candidates) {
      const r = await geocodeOnce(c);
      if (r) {
        const selectedLocation: SelectedLocation = {
          id: result.id,
          code: result.code,
          name: result.name,
          address: result.address,
          install_location_raw: result.install_location_raw,
          latitude: r.lat,
          longitude: r.lng,
          status: result.status,
        };
        setSelectedLocation(selectedLocation, activeTab);
        onClose();
        return;
      }
    }

    // 실패 시 기존 좌표 사용
    const fallbackLocation: SelectedLocation = {
      id: result.id,
      code: result.code,
      name: result.name,
      address: result.address,
      install_location_raw: result.install_location_raw,
      latitude: result.coordinates_y
        ? parseFloat(result.coordinates_y)
        : undefined,
      longitude: result.coordinates_x
        ? parseFloat(result.coordinates_x)
        : undefined,
      status: result.status,
    };
    setSelectedLocation(fallbackLocation, activeTab);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:flex lg:justify-center">
      <div className="bg-stone-50 h-screen w-full lg:w-[360px] lg:mx-auto">
        <div className="box-border flex flex-col gap-5 items-end self-stretch p-5 bg-stone-50 h-full w-full ">
          <div className="flex relative justify-between items-start self-stretch">
            <div className="flex relative gap-2.5 items-center">
              <button
                onClick={() => setActiveTab("address")}
                className={`flex relative gap-2.5 justify-center items-center px-2 py-1.5 w-20 rounded-[100px] ${
                  activeTab === "address" ? "bg-green-600" : "bg-neutral-200"
                }`}
              >
                <div
                  className={`text-xs font-bold ${
                    activeTab === "address" ? "text-white" : "text-stone-500"
                  }`}
                >
                  주소로 검색
                </div>
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex relative gap-2.5 justify-center items-center px-2 py-1.5 w-20 rounded-[100px] ${
                  activeTab === "code" ? "bg-green-600" : "bg-neutral-200"
                }`}
              >
                <div
                  className={`text-xs font-bold ${
                    activeTab === "code" ? "text-white" : "text-stone-500"
                  }`}
                >
                  코드로 검색
                </div>
              </button>
            </div>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex relative flex-col gap-5 items-center w-full px-[18px] border-b border-solid border-b-neutral-300 h-[42px] ">
            <div className="flex relative justify-between items-center self-stretch">
              <div className="flex-1 mr-3">
                <Input
                  type="text"
                  placeholder={
                    activeTab === "address"
                      ? "검색 조건을 입력해주세요"
                      : "코드를 입력해주세요"
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      activeTab === "address" &&
                      searchQuery.trim()
                    ) {
                      e.preventDefault();
                      handleDirectGeocode(searchQuery.trim());
                    }
                  }}
                  className="border-0 shadow-none text-sm font-bold text-sky-500 placeholder:text-sky-400 focus-visible:ring-0 px-0"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeTab === "address" && searchQuery.trim()) {
                    handleDirectGeocode(searchQuery.trim());
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="주소를 위도/경도로 변환"
              >
                <Search className="w-[18px] h-[18px] text-green-600 stroke-2" />
              </button>
            </div>
          </div>

          <div className="flex relative flex-col gap-5 items-start self-stretch gap-y-5 flex-1 overflow-hidden">
            {showResults ? (
              <>
                {error && (
                  <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm text-red-600">{error}</div>
                  </div>
                )}

                {isLoading ? (
                  <div className="w-full flex justify-center py-8">
                    <div className="text-sm text-gray-500">검색 중...</div>
                  </div>
                ) : searchResults.length === 0 && !error ? (
                  <div className="w-full flex justify-center py-8">
                    <div className="text-sm text-gray-500">
                      검색 결과가 없습니다.
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 items-start w-full h-full flex-1 overflow-y-auto scrollbar-hide">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleSelectLocation(result)}
                        className="flex flex-col gap-4 justify-center items-start px-4 py-5 w-full rounded-lg border-gray-200 border-solid bg-zinc-50 border-[1.4px] cursor-pointer hover:bg-zinc-100 transition-colors duration-200 active:bg-zinc-200"
                      >
                        <div className="flex flex-col gap-3 items-start w-full">
                          <div className="flex flex-col gap-2 items-start w-full">
                            <div className="flex justify-between items-center w-full">
                              <Badge
                                className={`${getStatusBadgeStyle(
                                  result.status
                                )} shadow-none`}
                              >
                                {result.status}
                              </Badge>
                              <div className="text-xs text-center text-zinc-600">
                                {result.installDate} 설치
                              </div>
                            </div>
                            <div className="text-base text-zinc-900 max-sm:text-sm w-full">
                              {result.address}
                            </div>
                          </div>
                          <div className="text-xs leading-5 text-stone-500 max-sm:text-xs max-sm:leading-5">
                            <span>코드 : {result.code}</span>
                            <br />
                            <span>
                              현재 수거량 : {result.currentCollection}
                            </span>
                            <br />
                            <span>
                              마지막 수거 :{" "}
                              {new Date(result.lastCollection).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="relative self-stretch text-sm font-bold text-neutral-700 max-sm:text-xs">
                  이전 검색어
                </div>

                {searchHistory.length === 0 ? (
                  <div className="w-full flex justify-center py-8">
                    <div className="text-sm text-gray-500">
                      검색 기록이 없습니다.
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex-1 overflow-y-auto scrollbar-hide">
                    {searchHistory.map((historyItem, index) => (
                      <div
                        key={index}
                        className="flex relative justify-between items-center self-stretch cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                        onClick={() => {
                          setActiveTab(historyItem.type);
                          setSearchQuery(historyItem.query);
                        }}
                      >
                        <div className="flex relative items-center flex-1">
                          <div
                            className={`flex relative gap-2.5 justify-center items-center rounded-[100px] w-[37px] h-[26px] flex-shrink-0 ${
                              historyItem.type === "address"
                                ? "bg-primary text-white"
                                : "border border-primary text-primary"
                            }`}
                          >
                            <div className="relative text-xs font-bold text-center">
                              {historyItem.type === "address" ? "주소" : "코드"}
                            </div>
                          </div>
                          <div className="relative text-base text-neutral-700 text-[16px] flex-1 ml-2 truncate">
                            {historyItem.query}
                          </div>
                        </div>
                        <div className="relative text-[10px] text-center text-zinc-600 flex-shrink-0 ml-2">
                          {historyItem.date.replace(/-/g, ".")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
