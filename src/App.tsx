import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import type { Radical, Word } from "@/types";
import { words } from "@/data";
import { useStore } from "@/store";
import { buildDeck, shuffle, wordsForRadical } from "@/lib/filter";
import { speak } from "@/lib/audio";
import { t } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toolbar } from "@/components/Toolbar";
import { Flashcard } from "@/components/Flashcard";
import { WordList } from "@/components/WordList";
import { SearchDialog } from "@/components/SearchDialog";
import { RadicalDialog } from "@/components/RadicalDialog";

interface Override {
  label: string;
  words: Word[];
}

export default function App() {
  const { hsk, lesson, random, viewMode, settings } = useStore();
  const lang = settings.lang;
  const reviewIds = useStore((s) => s.reviewIds);
  const setViewMode = useStore((s) => s.setViewMode);
  const toggleMastered = useStore((s) => s.toggleMastered);

  const [override, setOverride] = useState<Override | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [radicalsOpen, setRadicalsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [hideAnswer, setHideAnswer] = useState(false);

  // Apply theme + interface language to <html>.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    document.documentElement.classList.toggle("light", settings.theme === "light");
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [settings.theme, lang]);

  // Only re-key the base deck on review changes when actually viewing Review.
  const reviewKey = lesson === "Review" ? reviewIds.join(",") : "na";
  const baseDeck = useMemo(
    () => buildDeck(words, { hsk, lesson }, new Set(reviewIds)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hsk, lesson, reviewKey],
  );

  const rawDeck = override ? override.words : baseDeck;
  const orderedDeck = useMemo(
    () => (random ? shuffle(rawDeck) : rawDeck),
    [rawDeck, random],
  );

  // Reset position when the deck changes.
  useEffect(() => {
    setIndex(0);
    setHideAnswer(false);
  }, [orderedDeck]);

  const clampIndex = useCallback(
    (i: number) => Math.max(0, Math.min(i, orderedDeck.length - 1)),
    [orderedDeck.length],
  );

  const nav = useCallback(
    (action: "first" | "prev" | "next" | "last") => {
      setHideAnswer(false);
      setIndex((i) => {
        switch (action) {
          case "first":
            return 0;
          case "last":
            return orderedDeck.length - 1;
          case "prev":
            return clampIndex(i - 1);
          case "next":
            return clampIndex(i + 1);
        }
      });
    },
    [orderedDeck.length, clampIndex],
  );

  const current = orderedDeck[clampIndex(index)];

  const onKnown = useCallback(() => {
    if (!current) return;
    toggleMastered(current.id);
    nav("next");
  }, [current, toggleMastered, nav]);

  const onRadicalLookup = useCallback(
    (word: Word) => {
      const matches = wordsForRadical(words, word.chars);
      setOverride({ label: `${word.hanzi} → ${t("radicals", lang)}`, words: matches });
    },
    [lang],
  );

  const onRadicalPick = useCallback(
    (r: Radical) => {
      const matches = wordsForRadical(words, r.chars);
      setOverride({ label: `${r.radical} (${matches.length})`, words: matches });
      setViewMode("list");
    },
    [setViewMode],
  );

  // Keyboard shortcuts (ignored while typing or when a dialog is open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (searchOpen || radicalsOpen) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (viewMode !== "card") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        nav("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nav("next");
      } else if (e.key === " ") {
        e.preventDefault();
        setHideAnswer((v) => !v);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (current) speak(current.hanzi);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav, current, viewMode, searchOpen, radicalsOpen]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-full flex-col">
        <Toolbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenRadicals={() => setRadicalsOpen(true)}
          onClearOverride={() => setOverride(null)}
          overrideLabel={override?.label ?? null}
        />

        <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-4 sm:py-8">
          {orderedDeck.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
              {override ? t("noResults", lang) : t("noCards", lang)}
            </div>
          ) : viewMode === "card" ? (
            current && (
              <Flashcard
                word={current}
                index={clampIndex(index)}
                total={orderedDeck.length}
                hideAnswer={hideAnswer}
                onNav={nav}
                onKnown={onKnown}
                onRadicalLookup={onRadicalLookup}
              />
            )
          ) : (
            <WordList
              words={orderedDeck}
              onSelect={(i) => {
                setIndex(i);
                setViewMode("card");
              }}
            />
          )}

          {viewMode === "card" && orderedDeck.length > 0 && (
            <p className="mt-8 text-center text-xs text-muted-foreground">
              {t("shortcuts", lang)}
            </p>
          )}
        </main>
      </div>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onResults={(label, results) => setOverride({ label, words: results })}
      />
      <RadicalDialog
        open={radicalsOpen}
        onOpenChange={setRadicalsOpen}
        onPick={onRadicalPick}
      />

      <Toaster position="bottom-center" theme={settings.theme} richColors />
    </TooltipProvider>
  );
}
