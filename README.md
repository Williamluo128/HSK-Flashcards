# HSK Flashcards

HSK (Hànyǔ Shuǐpíng Kǎoshì 汉语水平考试) flashcard app to help you memorize Chinese (Mandarin) characters — rewritten as a modern, **fully static** single-page app.

No backend, no database: the word data is bundled as JSON and all progress lives in your browser. Deploy it to any static host (Vercel, Netlify, GitHub Pages, …).

## Features

- Browse cards by **HSK level**, **lesson/chapter**, **part of speech**, or your **review list**
- Per-character **stroke order animation** and a **stroke-writing quiz** (powered by [Hanzi Writer](https://chanind.github.io/hanzi-writer/))
- **Tone-colored pinyin** (and tone-colored hanzi in the list view)
- **Pronunciation** via the browser's built-in speech synthesis (`zh-CN`)
- **Search** by 汉字 / English / toned pinyin / numbered pinyin / `9` wildcard (e.g. `xia9` matches xia1–xia5)
- **Radical lookup**: list every character that contains a given radical
- **Card** and **list** views, **shuffle**, **copy hanzi**, **review** (pin) and **mastered** tracking
- **Progress** panel, **light/dark** theme, **EN/中文** interface, keyboard shortcuts (← → navigate · Space flip · Enter audio)
- Settings persisted in `localStorage`

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4 + Radix UI primitives (shadcn-style components) + [lucide-react](https://lucide.dev/) icons
- [Zustand](https://zustand.docs.pmnd.rs/) for state (with `localStorage` persistence)
- [Framer Motion](https://www.framer.com/motion/) for transitions
- [Hanzi Writer](https://github.com/chanind/hanzi-writer) for stroke order/quiz
- Web Speech API (`SpeechSynthesis`) for audio

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build into dist/
npm run preview    # preview the production build locally
```

## Regenerating the dataset

The app reads `src/data/words.json` and `src/data/radicals.json`, generated from the
original CSVs in [`data/`](data) by a one-time Python script (requires `pypinyin`):

```bash
pip install pypinyin
npm run data       # = python3 scripts/build_dataset.py
```

The script regenerates pinyin (tone marks), numbered pinyin and tone numbers per
character so the front-end's tone coloring and syllable splitting always stay
consistent. The generated JSON is committed, so the running app has **no Python
dependency**.

> Data scope: the bundled dataset currently covers **HSK 1–3** (~680 words) plus the
> radical lists. To add more, drop additional `data/L*.csv` files (same
> `Hanzi | Pinyin | PartOfSpeech | English | HSK | Chapter` format) and re-run `npm run data`.

## Project layout

```
src/
  components/      React components (Flashcard, WordList, Toolbar, dialogs, ui/)
  data/            generated words.json / radicals.json + typed loader
  lib/             filter/search, audio (TTS), i18n, helpers
  store.ts         zustand store + persistence
scripts/
  build_dataset.py CSV -> JSON build step (pypinyin)
data/              original source CSVs (word lists + radical character lists)
legacy/            the original PHP + jQuery + MySQL implementation (archived)
```

## Credits

- Stroke order via the excellent [Hanzi Writer](https://chanind.github.io/hanzi-writer/docs.html) project.
- Original PHP/MySQL version by Stephen McCready (preserved under `legacy/`).
