#!/usr/bin/env python3
"""Build the static JSON dataset consumed by the React app.

Inputs (kept from the original project):
  - data/L*.csv          word lists: HanziS | Pinyin | PartofSpeech | English | HSK | Chapter
  - data/rad_*.csv/.cav  per-radical character lists (one char per line)

Outputs:
  - src/data/words.json
  - src/data/radicals.json

Pinyin (tone marks) and PinyinNum (numbered, neutral tone = 5) are regenerated
per character with pypinyin so the syllable segmentation always matches.

Run with:  npm run data   (i.e. python3 scripts/build_dataset.py)
"""
import csv
import glob
import json
import os
import re

from pypinyin import pinyin, Style

CJK = re.compile(r"[\u4e00-\u9fff]")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
OUT = os.path.join(ROOT, "src", "data")

# Radical -> short English meaning, taken from the comments in
# legacy/includes/DBInsertRadicalHanzi.php.
RADICAL_MEANINGS = {
    "氵": "water",
    "讠": "language and speech",
    "钅": "metal",
    "口": "the mouth",
    "辶": "walking",
    "门": "a room or a door",
    "礻": "deity, sacrificial rites, fortune",
    "阝": "a landform or location",
    "亻": "a person",
    "女": "women",
    "饣": "food",
    "日": "time / the sun",
    "目": "the eyes",
    "月": "the body or flesh",
    "扌": "an action of the hand",
    "艹": "grass, trees or plants",
    "宀": "houses",
    "⺩": "jade",
    "⻊": "one's feet",
    "⺮": "bamboo",
    "欠": "movements of the mouth",
    "木": "trees / wood",
    "⺉": "cutters or knives",
    "纟": "silk",
    "⺖": "one's mentality",
    "⼦": "children",
    "广": "buildings",
    "⺨": "animals",
    "⺗": "mental activity and emotions",
    "⼻": "the act of walking",
    "攵": "whipping or beating",
    "ㄡ": "a variety of meanings",
    "⼱": "cotton, silk or textiles",
    "土": "soil, land or buildings",
    "⺣": "fire",
    "⾛": "running or walking",
    "⽳": "holes, caves or houses",
    "疒": "diseases",
    "冫": "ice or coldness",
    "止": "toes",
    "冂": "relations or images of things",
    "⽄": "axes or cutting",
    "⻚": "head or face",
    "⻗": "clouds and rain",
    "⻉": "money or utensils",
    "山": "mountains and islands",
    "大": "people",
    "刂": "knives",
    "犭": "animals",
    "山": "mountains and islands",
}


# Normalise the messy free-text part-of-speech values in the CSVs into a small
# set of canonical categories the UI can filter and translate.
POS_NORMALISE = {
    "": "",
    "a surname": "proper noun",
    "proper noun": "proper noun",
    "proper nount": "proper noun",
    "adj,": "adjective",
    "adjective": "adjective",
    "adverb": "adverb",
    "auxiliary": "auxiliary",
    "conjunction": "conjunction",
    "int.": "interjection",
    "measure word": "measure word",
    "mw": "measure word",
    "numeric measure": "measure word",
    "num mw": "measure word",
    "mod.": "modal verb",
    "modal": "modal verb",
    "modal verb": "modal verb",
    "noun": "noun",
    "noun/verb": "noun/verb",
    "verb / noun": "noun/verb",
    "verb noun": "noun/verb",
    "verb/noun": "noun/verb",
    "num": "number",
    "number": "number",
    "particle": "particle",
    "preposition": "preposition",
    "pronoun": "pronoun",
    "verb": "verb",
    "radical": "radical",
}


def normalise_pos(pos: str) -> str:
    return POS_NORMALISE.get(pos.strip().lower(), pos.strip().lower())


def gen_pinyin(hanzi: str):
    chars = [c for c in hanzi if CJK.match(c)]
    if not chars:
        return "", [], [], []
    s = "".join(chars)
    marked = [x[0] for x in pinyin(s, style=Style.TONE)]
    numbered = [x[0] for x in pinyin(s, style=Style.TONE3, neutral_tone_with_five=True)]
    tones = []
    for tok in numbered:
        m = re.search(r"[1-5]", tok)
        tones.append(int(m.group()) if m else 5)
    return " ".join(marked), marked, numbered, tones


def build_words():
    words = []
    wid = 0
    for path in sorted(glob.glob(os.path.join(DATA, "L*.csv"))):
        with open(path, encoding="utf-8") as f:
            for raw in f:
                raw = raw.rstrip("\n").rstrip("\r")
                if not raw.strip():
                    continue
                parts = raw.split("|")
                if len(parts) < 6:
                    continue
                hanzi = parts[0].strip()
                pos = normalise_pos(parts[2])
                english = "|".join(parts[3:-2]).strip()
                try:
                    hsk = int(parts[-2].strip())
                    chapter = int(parts[-1].strip())
                except ValueError:
                    continue
                marked_join, syllables, numbered, tones = gen_pinyin(hanzi)
                chars = [c for c in hanzi if CJK.match(c)]
                words.append(
                    {
                        "id": wid,
                        "hanzi": hanzi,
                        "chars": chars,
                        "pinyin": marked_join,
                        "pinyinSyllables": syllables,
                        "pinyinNum": numbered,
                        "tones": tones,
                        "english": english,
                        "pos": pos,
                        "hsk": hsk,
                        "chapter": chapter,
                    }
                )
                wid += 1
    return words


def build_radicals():
    radicals = []
    files = sorted(glob.glob(os.path.join(DATA, "rad_*.csv"))) + sorted(
        glob.glob(os.path.join(DATA, "rad_*.cav"))
    )
    for path in files:
        base = os.path.splitext(os.path.basename(path))[0]  # rad_kou3_口
        m = re.match(r"rad_(.+)_(.+)$", base)
        if not m:
            continue
        pinyin_code, radical_char = m.group(1), m.group(2)
        chars = []
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                for c in line:
                    if CJK.match(c) and c not in chars:
                        chars.append(c)
        if not chars:
            continue
        radicals.append(
            {
                "radical": radical_char,
                "pinyin": pinyin_code,
                "meaning": RADICAL_MEANINGS.get(radical_char, ""),
                "chars": chars,
            }
        )
    radicals.sort(key=lambda r: r["radical"])
    return radicals


def main():
    os.makedirs(OUT, exist_ok=True)
    words = build_words()
    radicals = build_radicals()
    with open(os.path.join(OUT, "words.json"), "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=0)
    with open(os.path.join(OUT, "radicals.json"), "w", encoding="utf-8") as f:
        json.dump(radicals, f, ensure_ascii=False, indent=0)
    print(f"words: {len(words)}  radicals: {len(radicals)}")
    hsks = sorted({w['hsk'] for w in words})
    print(f"HSK levels: {hsks}")
    pos = sorted({w['pos'] for w in words})
    print(f"parts of speech: {pos}")


if __name__ == "__main__":
    main()
