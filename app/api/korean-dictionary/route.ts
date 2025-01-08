import { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { word } = req.query;

  if (!word || typeof word !== "string") {
    return res.status(400).json({ error: "단어를 제공해야 합니다." });
  }

  const API_KEY = process.env.KOREAN_DICT_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "API 키가 설정되지 않았습니다." });
  }

  const BASE_URL = "https://krdict.korean.go.kr/api/search";

  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(word)}&part=word`);

    if (!response.ok) {
      console.error(`API 호출 실패: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: "API 호출 실패" });
    }

    const data = await response.json();

    // 응답 데이터 검증
    if (!data || !data.item) {
      return res.status(500).json({ error: "API 응답 데이터가 올바르지 않습니다." });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("API 요청 오류:", error);
    res.status(500).json({ error: "API 요청 중 오류가 발생했습니다." });
  }
}
