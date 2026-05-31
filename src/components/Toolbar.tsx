import { useMemo } from "react";
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  LayoutGrid,
  List as ListIcon,
  BarChart3,
  ListTree,
  X,
} from "lucide-react";
import { useStore } from "@/store";
import { chaptersByHsk, hskLevels } from "@/data";
import { POS_CATEGORIES, isPosCategory, type Lesson } from "@/lib/filter";
import { t, posLabel } from "@/lib/i18n";
import { Button } from "./ui/button";
import { Tip } from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SettingsDialog } from "./SettingsDialog";
import { ProgressDialog } from "./ProgressDialog";

function lessonToValue(lesson: Lesson): string {
  if (lesson === "All") return "All";
  if (lesson === "Review") return "Review";
  if (typeof lesson === "number") return `c:${lesson}`;
  return `p:${lesson}`;
}

function valueToLesson(value: string): Lesson {
  if (value === "All") return "All";
  if (value === "Review") return "Review";
  if (value.startsWith("c:")) return Number(value.slice(2));
  const p = value.slice(2);
  return isPosCategory(p) ? p : "All";
}

export function Toolbar({
  onOpenSearch,
  onOpenRadicals,
  onClearOverride,
  overrideLabel,
}: {
  onOpenSearch: () => void;
  onOpenRadicals: () => void;
  onClearOverride: () => void;
  overrideLabel: string | null;
}) {
  const { hsk, lesson, viewMode, settings } = useStore();
  const lang = settings.lang;
  const setHsk = useStore((s) => s.setHsk);
  const setLesson = useStore((s) => s.setLesson);
  const setViewMode = useStore((s) => s.setViewMode);

  const chapters = useMemo(() => {
    if (hsk === "All") {
      const all = new Set<number>();
      Object.values(chaptersByHsk).forEach((cs) => cs.forEach((c) => all.add(c)));
      return [...all].sort((a, b) => a - b);
    }
    return chaptersByHsk[hsk] ?? [];
  }, [hsk]);

  const changeHsk = (value: string) => {
    onClearOverride();
    setHsk(value === "All" ? "All" : Number(value));
  };
  const changeLesson = (value: string) => {
    onClearOverride();
    setLesson(valueToLesson(value));
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-[color:var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
        <div className="mr-1 flex items-center gap-2">
          <span className="font-han text-xl font-bold text-primary" lang="zh">
            汉
          </span>
          <span className="hidden text-sm font-semibold sm:inline">
            {t("appTitle", lang)}
          </span>
        </div>

        {/* HSK */}
        <Select value={String(hsk)} onValueChange={changeHsk}>
          <SelectTrigger className="h-9 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hskLevels.map((l) => (
              <SelectItem key={l} value={String(l)}>
                HSK {l}
              </SelectItem>
            ))}
            <SelectItem value="All">HSK · {t("all", lang)}</SelectItem>
          </SelectContent>
        </Select>

        {/* Lesson */}
        <Select value={lessonToValue(lesson)} onValueChange={changeLesson}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t("lesson", lang)} · {t("all", lang)}</SelectItem>
            <SelectItem value="Review">{t("review", lang)}</SelectItem>
            {chapters.map((c) => (
              <SelectItem key={`c:${c}`} value={`c:${c}`}>
                {t("lesson", lang)} {c}
              </SelectItem>
            ))}
            {POS_CATEGORIES.map((p) => (
              <SelectItem key={`p:${p}`} value={`p:${p}`}>
                {posLabel(p, lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1.5">
          {overrideLabel && (
            <button
              type="button"
              onClick={onClearOverride}
              className="flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs text-primary"
            >
              <span className="max-w-32 truncate">{overrideLabel}</span>
              <X className="h-3 w-3" />
            </button>
          )}

          <Tip label={viewMode === "card" ? t("listView", lang) : t("cardView", lang)}>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
            >
              {viewMode === "card" ? (
                <ListIcon className="h-4 w-4" />
              ) : (
                <LayoutGrid className="h-4 w-4" />
              )}
            </Button>
          </Tip>

          <Tip label={t("search", lang)}>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={onOpenSearch}>
              <SearchIcon className="h-4 w-4" />
            </Button>
          </Tip>

          <Tip label={t("radicals", lang)}>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={onOpenRadicals}>
              <ListTree className="h-4 w-4" />
            </Button>
          </Tip>

          <ProgressDialog
            trigger={
              <Button variant="outline" size="icon" className="h-9 w-9">
                <BarChart3 className="h-4 w-4" />
              </Button>
            }
          />

          <SettingsDialog
            trigger={
              <Button variant="outline" size="icon" className="h-9 w-9">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
}
