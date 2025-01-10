"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { ResultDetail } from "../types/koreanDictionary";
import WordInfoComponent from "../data/Word_Info";
import classes from "./DetailPage.module.css";

export default function DetailPage() {
  const [codes, setCodes] = useState<string[]>([]);
  const [results, setResults] = useState<ResultDetail[] | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchResults: ResultDetail[] | { message: string; word?: string } = [];
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
        const json = XLSX.utils.sheet_to_json<{ Target: string }>(sheet); // Target 열 읽기
        const targetList = json.map((row) => row.Target); // Target 열에서 데이터 추출
        setCodes(targetList);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSearch = async () => {
    setError(null);
    // setResults(null);
    setIsSearching(true);
    abortControllerRef.current = new AbortController();

    if (codes.length === 0) {
      setError("엑셀 파일에서 단어를 불러오세요.");
      setIsSearching(false);
      return;
    }

    try {
      for (const code of codes) {
        const response = await fetch(
          `/api/dictionary-code?code=${encodeURIComponent(code)}`,
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
        if (data.channel?.item) {
          const item = data.channel.item;
          searchResults.push(item); // 객체를 바로 추가
        } else {
          console.log(data)
        }
      }
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
    <div className={classes.allWrap}>
      <h1>국립국어원 사전내용 검색</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {codes.length > 0 && (
        <p>
          {codes.length - 1}개의 단어를 불러왔습니다.
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
      <div>
        <table className={classes.result}>
          <thead>
            <tr>
              <th style={{ width: "100px" }}>넘버</th>
              <th style={{ width: "100px" }}>타겟코드</th>
              <th style={{ width: "100px" }}>단어</th>
              <th style={{ width: "100px" }}>품사</th>
              <th style={{ width: "800px" }}>정의</th>
              <th style={{ width: "800px" }}>예문</th>
              <th style={{ width: "200px" }}>동의어</th>
              {/* <th style={{ border: "1px solid black", padding: "8px" }}>단어 종류</th> */}
              {/* <th style={{ border: "1px solid black", padding: "8px" }}>발음 정보</th> */}
              <th style={{ width: "200px" }}>한자</th>

              {/* <th style={{ border: "1px solid black", padding: "8px" }}>원래 정의</th> */}
            </tr>
          </thead>
          <tbody>
            {results?.map(
              (info, index) => (
                (
                  <WordInfoComponent
                    key={index}
                    wordInfo={info.word_info}
                    index={index}
                    code={info.target_code}
                  />
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
