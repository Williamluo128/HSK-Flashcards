import type { Word } from "@/types";

const HAN = /[\u4e00-\u9fff]/;
const TONE_MARK = /[āēīōūǖáéíóúǘǎěǐǒǔǚàèìòùǜ]/i;

/** Part-of-speech "lesson" categories, mirroring the original lesson buttons. */
export const POS_CATEGORIES = [
  "verb",
  "noun",
  "adjective",
  "adverb",
  "measure word",
  "modal verb",
  "number",
  "particle",
  "pronoun",
  "proper noun",
  "radical",
] as const;

export type PosCategory = (typeof POS_CATEGORIES)[number];

export function isPosCategory(value: string): value is PosCategory {
  return (POS_CATEGORIES as readonly string[]).includes(value);
}

/** Whether a word's part of speech belongs to a (broad) lesson category. */
export function posMatches(category: string, pos: string): boolean {
  switch (category) {
    case "verb":
      return pos === "verb" || pos === "noun/verb" || pos === "modal verb";
    case "noun":
      return pos === "noun" || pos === "noun/verb";
    default:
      return pos === category;
  }
}

export type Lesson = number | "All" | PosCategory | "Review";

export interface DeckSelection {
  hsk: number | "All";
  lesson: Lesson;
}

/**
 * Build the active deck from the HSK level + lesson selection.
 * "Review" is resolved by the caller against the saved review ids.
 */
export function buildDeck(
  source: Word[],
  selection: DeckSelection,
  reviewIds: Set<number>,
): Word[] {
  const { hsk, lesson } = selection;
  let deck = source;

  if (lesson === "Review") {
    deck = deck.filter((w) => reviewIds.has(w.id));
  }
  if (hsk !== "All") {
    deck = deck.filter((w) => w.hsk === hsk);
  }
  if (typeof lesson === "number") {
    deck = deck.filter((w) => w.chapter === lesson);
  } else if (lesson !== "All" && lesson !== "Review") {
    deck = deck.filter((w) => posMatches(lesson, w.pos));
  }
  return deck;
}

export interface SearchOptions {
  exact: boolean;
  caseSensitive: boolean;
}

type SearchKind = "hanzi" | "pinyin" | "pinyinNum" | "fuzzy" | "english";

function classify(q: string): SearchKind {
  if (HAN.test(q)) return "hanzi";
  if (TONE_MARK.test(q)) return "pinyin";
  if (/[0-5]/.test(q)) return "pinyinNum";
  if (/9/.test(q)) return "fuzzy";
  return "english";
}

function cmp(haystack: string, needle: string, exact: boolean): boolean {
  return exact ? haystack === needle : haystack.includes(needle);
}

/**
 * Replicates the original search.php behaviour entirely client-side:
 * detects whether the query is Hanzi / toned pinyin / numbered pinyin /
 * wildcard pinyin (digit 9) / English and matches accordingly.
 */
export function searchWords(
  source: Word[],
  rawQuery: string,
  opts: SearchOptions,
): Word[] {
  const query = rawQuery.trim();
  if (!query) return [];
  const kind = classify(query);

  if (kind === "hanzi") {
    return source.filter((w) => cmp(w.hanzi, query, opts.exact));
  }

  if (kind === "pinyin") {
    const q = query.toLowerCase();
    return source.filter((w) => {
      const spaced = w.pinyin.toLowerCase();
      const tight = spaced.replace(/\s+/g, "");
      return cmp(spaced, q, opts.exact) || cmp(tight, q, opts.exact);
    });
  }

  if (kind === "pinyinNum") {
    const q = query.toLowerCase();
    return source.filter((w) => {
      const spaced = w.pinyinNum.join(" ").toLowerCase();
      const tight = w.pinyinNum.join("").toLowerCase();
      return cmp(spaced, q, opts.exact) || cmp(tight, q, opts.exact);
    });
  }

  if (kind === "fuzzy") {
    const base = query.toLowerCase().replace(/9/g, "");
    if (!base) return [];
    let re: RegExp;
    try {
      re = new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[1-5]`);
    } catch {
      return [];
    }
    return source.filter((w) => re.test(w.pinyinNum.join("").toLowerCase()));
  }

  // english
  const needle = opts.caseSensitive ? query : query.toLowerCase();
  return source.filter((w) => {
    const hay = opts.caseSensitive ? w.english : w.english.toLowerCase();
    return cmp(hay, needle, opts.exact);
  });
}

/** Words whose characters contain a given radical's component characters. */
export function wordsForRadical(source: Word[], radicalChars: string[]): Word[] {
  const set = new Set(radicalChars);
  return source.filter((w) => w.chars.some((c) => set.has(c)));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
