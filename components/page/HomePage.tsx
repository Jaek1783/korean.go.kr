'use client';
import { useState } from "react";
import * as XLSX from "xlsx";
import { DictionaryItem } from "../types/koreanDictionary";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [results, setResults] = useState<DictionaryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      readExcelFile(uploadedFile);
    }
  };
console.log(file);
  const readExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<{ word: string }>(sheet);
        const wordList = json.map((row) => row.word);
        setWords(wordList);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSearch = async () => {
    setError(null);
    setResults(null);

    if (words.length === 0) {
      setError("엑셀 파일에서 단어를 불러오세요.");
      return;
    }

    try {
      const searchResults: DictionaryItem[] = [];
      for (const word of words) {
        const response = await fetch(`/api/korean-dictionary?word='${encodeURIComponent(word)}'`);
        console.log(word);
        console.log(response);
        if (!response.ok) {
          throw new Error("API 요청 실패");
        }

        const data = await response.json();
        if (data.item) {
          searchResults.push(...data.item);
        }
      }
      setResults(searchResults);
    } catch (error) {
      console.error("검색 중 오류:", error);
      setError("단어 검색 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>국립국어원 단어 검색</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {words.length > 0 && (
        <p>
          {words.length}개의 단어를 불러왔습니다. <button onClick={handleSearch}>검색 시작</button>
        </p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {results && (
        <div style={{ marginTop: "20px" }}>
          <h2>검색 결과</h2>
          {results.map((item, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <p><strong>단어:</strong> {item.word}</p>
              <p><strong>한자:</strong> {item.hanja || "한자 없음"}</p>
              <p><strong>정의:</strong> {item.sense[0]?.definition || "정의 없음"}</p>
              <p><strong>예문:</strong> {item.sense[0]?.example || "예문 없음"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
