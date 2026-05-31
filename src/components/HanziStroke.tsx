import { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

function toneColor(tone: number): string {
  if (typeof window === "undefined") return "#888";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(`--tone${tone || 5}`)
    .trim();
  return v || "#888";
}

interface Props {
  char: string;
  tone: number;
  size: number;
  quiz: boolean;
  showOutline: boolean;
  hintAfterMisses: number;
  /** Changing this number re-keys the writer (e.g. theme change). */
  themeKey: string;
  showAnimateButton?: boolean;
  onQuizComplete?: () => void;
}

export function HanziStroke({
  char,
  tone,
  size,
  quiz,
  showOutline,
  hintAfterMisses,
  themeKey,
  showAnimateButton = true,
  onQuizComplete,
}: Props) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<ReturnType<typeof HanziWriter.create> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!targetRef.current) return;
    setFailed(false);
    targetRef.current.innerHTML = "";
    const color = toneColor(tone);

    const writer = HanziWriter.create(targetRef.current, char, {
      width: size,
      height: size,
      padding: 2,
      delayBetweenStrokes: 60,
      strokeAnimationSpeed: 1.2,
      showHintAfterMisses: hintAfterMisses,
      strokeColor: color,
      outlineColor: "rgba(128,128,128,0.28)",
      drawingColor: color,
      showCharacter: !quiz,
      showOutline: quiz ? showOutline : true,
      onLoadCharDataError: () => setFailed(true),
    });
    writerRef.current = writer;

    if (quiz) {
      writer.hideCharacter();
      writer.quiz({
        showHintAfterMisses: hintAfterMisses,
        onComplete: () => onQuizComplete?.(),
      });
    }

    return () => {
      try {
        writerRef.current = null;
        writer.cancelQuiz();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char, size, quiz, showOutline, hintAfterMisses, themeKey]);

  const animate = () => {
    writerRef.current?.animateCharacter();
  };

  if (failed) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span
          className="font-han leading-none"
          style={{ fontSize: size * 0.8, color: toneColor(tone) }}
          lang="zh"
        >
          {char}
        </span>
        <span className="mt-1 text-[10px] text-muted-foreground">
          no stroke data
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={targetRef}
        className={cn("rounded-md", quiz && "ring-1 ring-[color:var(--border)]")}
        style={{ width: size, height: size }}
        lang="zh"
      />
      {showAnimateButton && (
        <button
          type="button"
          onClick={animate}
          className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Animate strokes"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
