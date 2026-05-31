import type { Radical, Word } from "@/types";
import wordsRaw from "./words.json";
import radicalsRaw from "./radicals.json";

export const words: Word[] = wordsRaw as Word[];
export const radicals: Radical[] = radicalsRaw as Radical[];

export const wordById = new Map<number, Word>(words.map((w) => [w.id, w]));

/** HSK levels that actually have data, ascending. */
export const hskLevels: number[] = [...new Set(words.map((w) => w.hsk))].sort(
  (a, b) => a - b,
);

/** Chapters available per HSK level, ascending. */
export const chaptersByHsk: Record<number, number[]> = (() => {
  const map: Record<number, Set<number>> = {};
  for (const w of words) {
    (map[w.hsk] ??= new Set()).add(w.chapter);
  }
  const out: Record<number, number[]> = {};
  for (const [hsk, set] of Object.entries(map)) {
    out[Number(hsk)] = [...set].sort((a, b) => a - b);
  }
  return out;
})();

/** Distinct, non-empty parts of speech present in the data. */
export const posList: string[] = [
  ...new Set(words.map((w) => w.pos).filter(Boolean)),
].sort();

/** Only radicals that match at least one word in the dataset. */
export const usableRadicals: Radical[] = (() => {
  return radicals
    .map((r) => {
      const set = new Set(r.chars);
      const matches = words.filter((w) => w.chars.some((c) => set.has(c)));
      return { radical: r, count: matches.length };
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((x) => x.radical);
})();
