"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { NullWord, ResultDetail, UrimalViewData } from "../types/koreanDictionary";
import WordInfoComponent from "../data/Word_Info";

import classes from './HomePage.module.css';
import Image from "next/image";

export default function Home() {
  const [words, setWords] = useState<string[]>([]);
  const [results, setResults] = useState<ResultDetail[] | null>(null);
  const [nonResults, setNonResults] = useState<NullWord[] | null>(null);
  const [urimalResults, setUrimalResults] = useState<UrimalViewData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
    
    const searchNonResults: NullWord[] = [];
  const searchResults: ResultDetail[] | { message: string; word?: string } = [];
  const urimalSearchResults: UrimalViewData[] | { message: string; word?: string } = [];
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

  const handleSearch = async () => {
    setError(null);
    // setResults(null);
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
        
        if (Array.isArray(data)) {
          // data가 배열일 때
          data.forEach((item) => {
            if (item.channel?.item) {
              searchResults.push(...(Array.isArray(item.channel.item) ? item.channel.item : [item.channel.item]));
            } 
          });
        } else if (data.channel?.item) {
          // data가 배열이 아닐 때 (단일 객체)
          if (Array.isArray(data.channel.item)) {
            searchResults.push(...data.channel.item);
          } else {
            searchResults.push(data.channel.item);
          }
        } else {
          const response = await fetch(
            `/api/urimalsam?word=${encodeURIComponent(word)}`,
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
  
          if (Array.isArray(data)) {
            data.forEach((items)=>{
              urimalSearchResults.push(items);
            })
               
          } else {
            searchNonResults.push({ word, message: data.message || "결과 없음" });
          }
        }
          setUrimalResults(urimalSearchResults);
          setResults(searchResults);
          setNonResults(searchNonResults);
          
      }        
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
     <div className={classes.logo}>
     <h1><Image src='/logo_big.png' alt='로고' width={300} height={80}/></h1>
     <span>- 국립국어원 사전내용 검색 -</span>
     </div>
     <div>
      
     </div>
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
      <div>
        <table className={classes.result}>
        {results &&    <thead>
            <tr>
              <th style={{ width: "100px" }}>넘버</th>
              <th style={{ width: "100px" }}>타겟코드</th>
              <th style={{ width: "100px" }}>단어</th>
              <th style={{ width: "100px" }}>품사</th>
              <th style={{ width: "800px" }}>정의</th>
              <th style={{ width: "800px" }}>예문</th>
              <th style={{ width: "200px" }}>동의어</th>
              <th style={{ width: "200px" }}>한자</th>
            </tr>
          </thead>}
          <tbody>
            {results && results?.map(
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
            {urimalResults &&
            urimalResults.map((items, index) => (
              items.sense?.map((item)=>{
                
               return( <tr key={index}>
                <td>
                  {index+1}
                </td>
                <td>
                  {item.target_code}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {items.word}
                </td>
                <td>
                  {item.pos}
                </td>
                <td>
                  {item.definition}
                </td>
                <td></td>
                <td></td>
                <td>{item.origin}</td>
              </tr>
               )
              })
            ))}
              {nonResults &&
            nonResults.map((item, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid black", padding: "8px" }}>
                  {item.word}
                </td>
                <td style={{ border: "1px solid black", padding: "8px" }} colSpan={8}>
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
