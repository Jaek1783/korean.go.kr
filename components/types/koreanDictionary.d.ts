export interface Sense {
  definition: string;
  example?: string;
  link?: string;
  type?: string;
}


export interface DictionaryItem {
  sup_no: string; // 순번
  word: string; // 단어
  pos: string; // 품사
  sense: Sense; // Sense 객체
  target_code: string; // 검색 대상 (예: 1 ~ 11)
}

interface DictionaryResponse {
  channel: {
    total: number; // 총 검색 결과 수
    num: number; // 한 페이지에 표시되는 결과 수
    title: string; // 제목
    start: number; // 시작 인덱스
    description: string; // 설명
    item: DictionaryItem[]; // 검색 결과 배열
    link: string; // 링크
    lastbuilddate: string; // 마지막 빌드 날짜
    target_code?:string;
  };
}

export interface TargetResponse {
    item: {
      target_code: string;
      word_info: {
        pronunciation_info: {
          pronunciation: string;
        }[];
        word_unit: string;
        word: string;
        original_language_info: {
          original_language: string;
          language_type: string;
        }[];
        word_type: string;
        pos_info: {
          pos_code: string;
          comm_pattern_info: {
            comm_pattern_code: string;
            sense_info: {
              definition: string;
              type: string;
              example_info: {
                example: string;
              }[];
              definition_original: string;
              sense_code: number;
              lexical_info: {
                unit: string;
                link_target_code: string;
                link: string;
                word: string;
                type: string;
              }[];
            }[];
          }[];
          pos: string;
        }[];
      };
    };
    link: string;
    lastbuilddate: string;
};
export interface ResultDetail {
  target_code:string,
  word_info:WordInfo
};

export interface WordInfo {
  lexical_info?: {
    word: string;
    link_target_code: string;
    link: string;
  }[];
  word: string;
  word_unit: string;
  pronunciation_info?: { pronunciation: string }[];
  original_language_info?: { original_language: string; language_type: string }[];
  word_type?: string;
  pos_info?: {
    pos: string;
    pos_code: string;
    comm_pattern_info?: {
      comm_pattern_code: string;
      sense_info?: {
        definition?: string;
        definition_original?: string;
        example_info?: { example: string }[];
        lexical_info?: {
          word: string;
          type: string;
          link: string;
        }[];
      }[];
    }[];
  }[];
}

export interface NullWord {
  message:string;
  word:string;
  viewData?:DictionaryResponse[];
}

export interface UrimalSense {
  syntacticArgument: string,
  syntacticAnnotation: string,
  cat: string,
  definition: string,
  link: string,
  origin: string,
  sense_no: string,
  target_code: string,
  type: string,
  pos: string
}

export interface UrimalItem {
  sup_no: string; // 순번
  word: string; // 단어
  pos: string; // 품사
  sense:UrimalSense[]; // Sense 객체
  target_code: string; // 검색 대상 (예: 1 ~ 11)
}

export interface UrimalResponse {
  channel: {
    item: UrimalItem[];
  }
}

export interface UrimalViewData {
  word?: string;
  sense?: UrimalSense[]; // UrimalViewData 배열로 수정
}