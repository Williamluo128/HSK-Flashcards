export interface Word {
  id: number;
  hanzi: string;
  chars: string[];
  pinyin: string;
  pinyinSyllables: string[];
  pinyinNum: string[];
  tones: number[];
  english: string;
  pos: string;
  hsk: number;
  chapter: number;
}

export interface Radical {
  radical: string;
  pinyin: string;
  meaning: string;
  chars: string[];
}

export type ViewMode = "card" | "list";
export type Lang = "en" | "zh";
