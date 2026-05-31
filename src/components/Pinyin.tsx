import type { Word } from "@/types";
import { cn } from "@/lib/utils";

/** Renders the pinyin syllables, each colored by its tone. */
export function Pinyin({
  word,
  className,
  size = "md",
}: {
  word: Word;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeCls =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
        ? "text-sm"
        : "text-lg";
  return (
    <span className={cn("inline-flex flex-wrap gap-x-1.5", sizeCls, className)}>
      {word.pinyinSyllables.map((syl, i) => (
        <span key={i} className={`tone${word.tones[i] ?? 5} font-medium`}>
          {syl}
        </span>
      ))}
    </span>
  );
}
