"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { DictionaryItem, NullWord } from "../types/koreanDictionary";
import classes from "./DetailPage.module.css";
import { useRouter } from "next/navigation";

export default function DetailPage() {
  const [words, setWords] = useState<string[]>([]);
  const [results, setResults] = useState<DictionaryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [nonResults, setNonResults] = useState<NullWord[] | null>(null);
  const searchResults: DictionaryItem[] = [];
  const searchNonResults: NullWord[] = [];
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      readExcelFile(uploadedFile);
    }
  };

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
  const detailPage = ()=>{
    router.push('/detail');
  }
  const handleSearch = async () => {
    setError(null);
    setResults(null);
    setIsSearching(true);
    abortControllerRef.current = new AbortController();

    if (words.length === 0) {
      setError("엑셀 파일에서 단어를 불러오세요.");
      setIsSearching(false);
      return;
    }

    try {
      for (const word of words) {
        const response = await fetch(
          `/api/korean-dictionary?word=${encodeURIComponent(word)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error("API 요청 실패");
        }

        const data = await response.json();
console.log(data);
        if (Array.isArray(data.channel?.item)) {
          searchResults.push(...data.channel.item);
        }
        if (!Array.isArray(data.channel?.item)) {
          searchNonResults.push({ word, message: data.message || "결과 없음" });
        }
      }
      setNonResults(searchNonResults);
      setResults(searchResults);
    } catch (error) {
      if (abortControllerRef.current.signal.aborted) {
        console.log("검색이 취소되었습니다.");
      } else {
        console.error("검색 중 오류:", error);
        setError("단어 검색 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancelSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsSearching(false);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.contents}>
      <h1>국립국어원 단어 검색</h1>
      <button onClick={detailPage}>사전 내용 검색하기</button>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {words.length > 0 && (
        <p>
          {words.length - 1}개의 단어를 불러왔습니다.
          {!isSearching ? (
            <button onClick={handleSearch}>검색 시작</button>
          ) : (
            <button onClick={handleCancelSearch}>검색 취소</button>
          )}
        </p>
      )}

      {isSearching && <p>검색 중입니다...</p>}
      {isSearching && <span className={classes.loader}></span>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 동음이의어 정보 출력 */}

      <table
        style={{
          border: "1px solid black",
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        {results && (
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                단어
              </th>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                정의
              </th>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                링크
              </th>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                품사
              </th>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                Target
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {results &&
            results.map((item, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {item.word}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {item.sense?.definition || "정의 없음"}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {item.sense?.link ? (
                    <a
                      href={item.sense.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.sense?.link}
                    </a>
                  ) : (
                    "링크 없음"
                  )}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {item.pos || "품사 없음"}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {item.target_code || "N/A"}
                </td>
              </tr>
            ))}
          {nonResults &&
            nonResults.map((item, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {item.word}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {item.message || "품사 없음"}
                </td>
                {/* <td style={{ border: "1px solid black", padding: "8px" }}>
                  {item.target_code || "N/A"}
                </td> */}
              </tr>
            ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
