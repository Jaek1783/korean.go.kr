import { TargetResponse } from "@/components/types/koreanDictionary";
import { NextRequest, NextResponse } from "next/server";

// 표준국어대사전 데이터 요청(json)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  
  // URL 파라미터 구성
  const params = new URLSearchParams({
    key: process.env.NEXT_PUBLIC_STDICT_API_KEY!,
    req_type: "json",
    method:"target_code",
    q: code ?? "",
    type_search: "view",
  });

  const url = `https://stdict.korean.go.kr/api/view.do?${params}`;
  try {
    const response = await fetch(url);

    // 빈 응답 처리
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      console.log("결과 없음: 빈 응답");
      return NextResponse.json({message: "결과 없음", code:code });
    }

    // JSON 파싱 및 데이터 반환
    try {
      const data: { channel: { item: TargetResponse[] } } = JSON.parse(text); // 타입 명시
      if (!data.channel?.item || data.channel.item.length === 0) {
        console.log("결과 없음: 데이터 없음");
        return NextResponse.json({ message: "결과 없음",code:code });
      }

      // 각 결과 출력
      // data.channel.item.forEach((item: DictionaryResponse, index: number) => {
      //   console.log(`결과 ${index + 1}:`, JSON.stringify(item, null, 2)); // JSON 포맷으로 출력
      // });
      return NextResponse.json(data);
    } catch (jsonError) {
      console.log("JSON 파싱 실패", jsonError);
      return NextResponse.json({ message: "응답 데이터 파싱 실패" }, { status: 500 });
    }
  } catch (error) {
    console.error("실패:", error);
    return NextResponse.json({ message: "서버 요청 실패" }, { status: 500 });
  }
}
