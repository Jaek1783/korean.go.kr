import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "단어를 제공해야 합니다." }, { status: 400 });
  }

  const API_KEY = process.env.KOREAN_DICT_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const BASE_URL = "https://krdict.korean.go.kr/api/search";

  try {
    const response = await fetch(
      `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(word)}&part=word&type_search=json`
    );

    if (!response.ok) {
      console.error(`API 호출 실패: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: "API 호출 실패" }, { status: response.status });
    }

    const data = await response.json();
console.log(data);
    if (!data || !data.item) {
      return NextResponse.json({ error: "API 응답 데이터가 올바르지 않습니다." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API 요청 오류:", error);
    return NextResponse.json({ error: "API 요청 중 오류가 발생했습니다." }, { status: 500 });
  }
}
