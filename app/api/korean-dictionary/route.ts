import { NextRequest, NextResponse } from "next/server";

// 표준국어대사전 데이터 요청(json)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get("word");
  console.log("word", word);
  console.log('key',process.env.NEXT_PUBLIC_STDICT_API_KEY);
  const params = new URLSearchParams({
    key: process.env.NEXT_PUBLIC_STDICT_API_KEY!, // 환경변수에 타입 단언 추가
    q: word ?? "", // null 병합 연산자로 기본값 처리
    req_type: "json"
  });
  console.log("params", params);

  const url = `https://stdict.korean.go.kr/api/search.do?${params}`;
  console.log(url);

  try {
    const response = await fetch(url);
    console.log("response", response);
    const data = await response.json();
    console.log("data", data);

    return NextResponse.json(data);
  } catch (error) {
    return console.error("실패:", error);
  }
}