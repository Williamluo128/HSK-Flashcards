import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Pin,
  Volume2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Shuffle,
  ListTree,
} from "lucide-react";
import type { Word } from "@/types";
import { useStore } from "@/store";
import { speak, hasChineseVoice } from "@/lib/audio";
import { t, posLabel } from "@/lib/i18n";
import { useWindowWidth } from "@/lib/useWindowWidth";
import { cn } from "@/lib/utils";
import { Pinyin } from "./Pinyin";
import { HanziStroke } from "./HanziStroke";
import { Button } from "./ui/button";
import { Tip } from "./ui/tooltip";
import { toast } from "sonner";

interface Props {
  word: Word;
  index: number;
  total: number;
  hideAnswer?: boolean;
  onNav: (action: "first" | "prev" | "next" | "last") => void;
  onKnown: () => void;
  onRadicalLookup?: (word: Word) => void;
}

export function Flashcard({
  word,
  index,
  total,
  hideAnswer = false,
  onNav,
  onKnown,
  onRadicalLookup,
}: Props) {
  const { settings, random, setRandom } = useStore();
  const lang = settings.lang;
  const showPinyin = settings.showPinyin && !hideAnswer;
  const showEnglish = settings.showEnglish && !hideAnswer;
  const isReviewed = useStore((s) => s.reviewIds.includes(word.id));
  const isMastered = useStore((s) => s.masteredIds.includes(word.id));
  const toggleReview = useStore((s) => s.toggleReview);

  const width = useWindowWidth();
  const charSize = useMemo(() => {
    const n = Math.max(1, word.chars.length);
    const base = width < 480 ? 320 : width < 768 ? 460 : 560;
    return Math.min(150, Math.floor((base - (n - 1) * 12) / n));
  }, [width, word.chars.length]);

  const quizDoneRef = useRef(0);
  useEffect(() => {
    quizDoneRef.current = 0;
  }, [word.id, settings.strokeQuiz]);

  const onAudio = () => {
    const ok = speak(word.hanzi);
    if (!ok || !hasChineseVoice()) {
      toast.message(t("noAudioVoice", lang));
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(word.hanzi);
      toast.success(t("copied", lang));
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5">
      {/* quick actions */}
      <div className="flex w-full items-center justify-between">
        <Tip label={t("random", lang)}>
          <Button
            variant={random ? "default" : "outline"}
            size="iconsm"
            onClick={() => setRandom(!random)}
            aria-pressed={random}
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </Tip>
        <div className="flex items-center gap-2">
          <Tip label={t("copy", lang)}>
            <Button variant="outline" size="iconsm" onClick={onCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </Tip>
          <Tip label={isReviewed ? t("unpin", lang) : t("pin", lang)}>
            <Button
              variant={isReviewed ? "default" : "outline"}
              size="iconsm"
              onClick={() => toggleReview(word.id)}
              aria-pressed={isReviewed}
            >
              <Pin className="h-4 w-4" />
            </Button>
          </Tip>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.985 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full rounded-3xl border bg-card p-5 shadow-xl sm:p-8"
        >
          {/* strokes */}
          {!settings.audioOnly && (
            <div className="flex flex-wrap items-start justify-center gap-3">
              {word.chars.map((c, i) => (
                <HanziStroke
                  key={`${word.id}-${i}-${settings.strokeQuiz}`}
                  char={c}
                  tone={word.tones[i] ?? 5}
                  size={charSize}
                  quiz={settings.strokeQuiz}
                  showOutline={settings.showOutline}
                  hintAfterMisses={settings.hintAfterMisses}
                  themeKey={settings.theme}
                  onQuizComplete={() => {
                    quizDoneRef.current += 1;
                    if (quizDoneRef.current >= word.chars.length) {
                      toast.success("✓ " + word.hanzi);
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* audio */}
          <div className="mt-5 flex justify-center">
            <Button variant="secondary" size="md" onClick={onAudio}>
              <Volume2 className="h-4 w-4" />
              {word.hanzi}
            </Button>
          </div>

          {/* pinyin */}
          <div className="mt-4 text-center">
            {showPinyin ? (
              <Pinyin word={word} size="lg" />
            ) : (
              <span className="text-2xl text-muted-foreground">···</span>
            )}
          </div>

          {/* pos + radical lookup */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {word.pos && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {posLabel(word.pos, lang)}
              </span>
            )}
            {word.chars.length === 1 && onRadicalLookup && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRadicalLookup(word)}
              >
                <ListTree className="h-3.5 w-3.5" />
                {t("radicalLookup", lang)}
              </Button>
            )}
          </div>

          {/* english */}
          <div className="mt-3 min-h-7 text-center text-lg">
            {showEnglish ? (
              <span>{word.english}</span>
            ) : (
              <span className="text-muted-foreground">···</span>
            )}
          </div>

          {/* meta */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-0.5">
              HSK {word.hsk} · {word.chapter}
            </span>
            {isMastered && (
              <span className="rounded-md bg-tone2/15 px-2 py-0.5 text-tone2">
                {t("mastered", lang)}
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* nav */}
      <div className="flex w-full items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onNav("first")}>
          <ChevronsLeft className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onNav("prev")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="min-w-24 text-center text-sm tabular-nums text-muted-foreground">
          {index + 1} / {total}
        </span>
        <Button variant="outline" size="icon" onClick={() => onNav("next")}>
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onNav("last")}>
          <ChevronsRight className="h-5 w-5" />
        </Button>
      </div>

      {/* mastered control */}
      <div className="flex items-center gap-3">
        <Button
          variant={isMastered ? "default" : "outline"}
          size="md"
          onClick={onKnown}
          className={cn(isMastered && "bg-tone2 text-white")}
        >
          <Check className="h-4 w-4" />
          {t("known", lang)}
        </Button>
      </div>
    </div>
  );
}
