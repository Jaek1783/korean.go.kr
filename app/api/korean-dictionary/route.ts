import { NextRequest, NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

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

    const contentType = response.headers.get("content-type");

    let data;
    if (contentType?.includes("application/json")) {
      // JSON 응답 처리
      data = await response.json();
    } else if (contentType?.includes("application/xml") || contentType?.includes("text/xml")) {
      // XML 응답 처리
      const xmlText = await response.text();
      data = await parseStringPromise(xmlText, { explicitArray: false });
    } else {
      throw new Error("지원되지 않는 응답 형식입니다.");
    }

    if (!data || !data.channel?.item) {
      return NextResponse.json({ error: "API 응답 데이터가 올바르지 않습니다." }, { status: 500 });
    }

    return NextResponse.json(data.channel.item);
  } catch (error) {
    console.error("API 요청 오류:", error);
    return NextResponse.json({ error: "API 요청 중 오류가 발생했습니다." }, { status: 500 });
  }
}
