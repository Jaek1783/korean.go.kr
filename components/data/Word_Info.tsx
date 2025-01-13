"use client";

import React from "react";
import { WordInfo } from "../types/koreanDictionary";

interface Props {
  code: string;
  wordInfo: WordInfo;
  index: number;
}

const WordInfoHorizontalTable: React.FC<Props> = ({
  wordInfo,
  code,
}) => {
  return (
    <tr>
      <td>{code}</td>
      {/* 단어 */}
      <td>{wordInfo.word.replace(/-/g, "")}</td>
      {/* 품사 */}
      <td>{wordInfo.pos_info?.map((pos) => pos.pos).join(" / ") || ""}</td>
      {/* 정의 */}
      <td>
        {wordInfo.pos_info
          ?.flatMap((pos) =>
            pos.comm_pattern_info?.flatMap((comm) =>
              comm.sense_info?.map((sense) => sense.definition)
            )
          )
          .join(" / ") || ""}
      </td>
      {/* 예문 */}
      <td>
        {wordInfo.pos_info
          ?.flatMap((pos) =>
            pos.comm_pattern_info?.flatMap((comm) =>
              comm.sense_info?.flatMap((sense) =>
                sense.example_info?.map((example) => example.example)
              )
            )
          )
          .filter((word) => word && word.trim() !== "") // 빈 문자열 제거
          .join(" / ") || ""}
      </td>
            {/* 동의어 */}
            <td>
        {wordInfo.pos_info
          ?.flatMap((pos) =>
            pos.comm_pattern_info?.flatMap((comm) =>
              comm.sense_info?.flatMap((sense) =>
                sense.lexical_info?.map((lexical) => lexical.word)
              )
            )
          )
          .filter((word) => word && word.trim() !== "") // 빈 문자열 제거
          .join(" / ") || ""}
      </td>
            {/* 원어 정보 */}
            <td>
        {wordInfo.original_language_info?.length
          ? wordInfo.original_language_info.map((info, index) => (
              <span key={index}>
                {info.original_language}
                {index < wordInfo.original_language_info!.length - 1 && " "}
              </span>
            ))
          : ""}
      </td>


      {/* 단어 종류 */}
      {/* <td style={{ border: "1px solid black", padding: "8px" }}>{wordInfo.word_type || "정보 없음"}</td> */}
      {/* 발음 정보 */}

      {/* <td style={{ border: "1px solid black", padding: "8px" }}>
              {wordInfo.pronunciation_info?.length
                ? wordInfo.pronunciation_info.map((info, index) => (
                    <span key={index}>
                      {info.pronunciation}
                      {index < wordInfo.pronunciation_info!.length - 1 && ", "}
                    </span>
                  ))
                : "정보 없음"}
            </td> */}

      {/* 원래 정의 */}
      {/* <td style={{ border: "1px solid black", padding: "8px" }}>
              {wordInfo.pos_info?.flatMap((pos) =>
                pos.comm_pattern_info?.flatMap((comm) =>
                  comm.sense_info?.map((sense) => sense.definition_original)
                )
              ).join(", ") || "원래 정의 없음"}
            </td> */}
    </tr>
  );
};

export default WordInfoHorizontalTable;
