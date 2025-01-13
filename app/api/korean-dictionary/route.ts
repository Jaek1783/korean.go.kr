import { NextRequest, NextResponse } from "next/server";
import {
  DictionaryResponse,
  DictionaryItem,
  NullWord,
} from "@/components/types/koreanDictionary";

// 표준국어대사전 데이터 요청(json)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get("word");
  const viewData:DictionaryResponse[] | { message: string; word?: string } = [];
  if (!word) {
    return NextResponse.json({ message: "검색어가 제공되지 않았습니다." }, { status: 400 });
  }

  // URL 파라미터 구성
  const params = new URLSearchParams({
    key: process.env.NEXT_PUBLIC_STDICT_API_KEY!,
    q: word,
    req_type: "json",
  });

  const searchUrl = `https://stdict.korean.go.kr/api/search.do?${params}`;

  try {
    // 1단계: 검색 결과 요청
    const response = await fetch(searchUrl);
    const text = await response.text();

    if (!text.trim()) {
      return NextResponse.json({ word, message: "결과 없음" } as NullWord);
    }

    const data: DictionaryResponse = JSON.parse(text);

    if (!data.channel?.item?.length) {
      return NextResponse.json({ word, message: "결과 없음" } as NullWord);
    }

    // 2단계: target_code 기반 추가 정보 요청
  await Promise.all(
      data.channel.item.map(async (item: DictionaryItem) => {
        const targetCode = item.target_code;

        if (targetCode) {
          const viewParams = new URLSearchParams({
            key: process.env.NEXT_PUBLIC_STDICT_API_KEY!,
            req_type: "json",
            method: "target_code",
            q: targetCode,
            type_search: "view",
          });

          const viewUrl = `https://stdict.korean.go.kr/api/view.do?${viewParams}`;
          const viewResponse = await fetch(viewUrl);
          const viewText = await viewResponse.text();

          if (viewText.trim()) {
            // const viewData: { channel: { item: TargetResponse[] } } = JSON.parse(text); // 타입 명시
           viewData.push(JSON.parse(viewText));
            
          }
        }

        return null;
      })
    );
    // console.log(viewData)
    return NextResponse.json(viewData);
  } catch (error) {
    console.error("요청 실패:", error);
    return NextResponse.json({ message: "서버 요청 실패" }, { status: 500 });
  }
}
