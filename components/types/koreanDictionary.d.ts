export interface Sense {
  definition: string;
  example?: string;
}

export interface DictionaryItem {
  word: string;
  hanja?: string;
  sense: Sense[];
}

export interface DictionaryResponse {
  item: DictionaryItem[];
}
