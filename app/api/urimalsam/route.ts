import { NextRequest, NextResponse } from "next/server";
import {
  NullWord,
  UrimalResponse,
  UrimalViewData,
} from "@/components/types/koreanDictionary";

// 표준국어대사전 데이터 요청(json)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get("word");
  const viewData:UrimalViewData[] | { message: string; word?: string } = [];
  if (!word) {
    return NextResponse.json({ message: "검색어가 제공되지 않았습니다." }, { status: 400 });
  }

  // URL 파라미터 구성
  const params = new URLSearchParams({
    key: process.env.NEXT_PUBLIC_STDICT_API_KEY!,
    q: word,
    req_type: "json",
  });

  const searchUrl = `https://opendict.korean.go.kr/api/search?${params}`;

  try {
    // 1단계: 검색 결과 요청
    const response = await fetch(searchUrl);
    const text = await response.text();

    if (!text.trim()) {
      console.log('없는결과',response)
      return NextResponse.json({ word, message: "결과 있음" } as NullWord);
    }

    const data: UrimalResponse = JSON.parse(text);
    if (!data.channel?.item?.length) {
      return NextResponse.json({ word, message: "결과 없음" } as NullWord);
    }
if(data.channel.item){
  data.channel.item.map(async (item) => {
          viewData.push(item);

  });
}
    return NextResponse.json(viewData);
  } catch (error) {
    console.error("요청 실패:", error);
    return NextResponse.json({ message: "서버 요청 실패" }, { status: 500 });
  }
}
