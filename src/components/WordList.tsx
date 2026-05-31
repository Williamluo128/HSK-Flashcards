import { Pin, Volume2 } from "lucide-react";
import type { Word } from "@/types";
import { useStore } from "@/store";
import { speak } from "@/lib/audio";
import { t, posLabel } from "@/lib/i18n";
import { Pinyin } from "./Pinyin";
import { cn } from "@/lib/utils";

export function WordList({
  words,
  onSelect,
}: {
  words: Word[];
  onSelect: (index: number) => void;
}) {
  const { settings } = useStore();
  const lang = settings.lang;
  const reviewIds = useStore((s) => s.reviewIds);
  const toggleReview = useStore((s) => s.toggleReview);

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border bg-card">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {words.map((w, i) => {
            const reviewed = reviewIds.includes(w.id);
            return (
              <tr
                key={w.id}
                className="border-b last:border-b-0 transition-colors hover:bg-muted/60"
              >
                <td className="w-14 px-3 py-2.5 text-xs text-muted-foreground tabular-nums">
                  {w.hsk}.{w.chapter}
                </td>
                <td className="w-10 px-1 py-2.5">
                  <button
                    type="button"
                    onClick={() => speak(w.hanzi)}
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={t("playAudio", lang)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </td>
                <td className="px-2 py-2.5">
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    className="font-han text-xl hover:text-primary"
                    lang="zh"
                  >
                    {w.chars.map((c, ci) => (
                      <span key={ci} className={`tone${w.tones[ci] ?? 5}`}>
                        {c}
                      </span>
                    ))}
                  </button>
                </td>
                <td
                  className={cn(
                    "px-2 py-2.5",
                    !settings.showPinyin && "opacity-0",
                  )}
                >
                  <Pinyin word={w} size="sm" />
                </td>
                <td
                  className={cn(
                    "px-2 py-2.5",
                    !settings.showEnglish && "opacity-0",
                  )}
                >
                  <span>{w.english}</span>{" "}
                  <span className="text-xs text-muted-foreground">
                    {w.pos ? posLabel(w.pos, lang) : ""}
                  </span>
                </td>
                <td className="w-10 px-2 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleReview(w.id)}
                    className={cn(
                      "rounded-md p-1.5 transition hover:bg-muted",
                      reviewed ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-label={reviewed ? t("unpin", lang) : t("pin", lang)}
                    aria-pressed={reviewed}
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
