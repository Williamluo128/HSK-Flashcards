import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import type { Word } from "@/types";
import { words as allWords } from "@/data";
import { searchWords } from "@/lib/filter";
import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";

export function SearchDialog({
  open,
  onOpenChange,
  onResults,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onResults: (label: string, words: Word[]) => void;
}) {
  const lang = useStore((s) => s.settings.lang);
  const [query, setQuery] = useState("");
  const [exact, setExact] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);

  const run = () => {
    const q = query.trim();
    if (!q) return;
    const results = searchWords(allWords, q, { exact, caseSensitive });
    onResults(`${t("search", lang)}: ${q}`, results);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("search", lang)}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex gap-2">
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder", lang)}
              className="h-11 flex-1 rounded-lg border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
            />
            <Button type="submit" size="icon" className="h-11 w-11">
              <SearchIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>{t("exactMatch", lang)}</span>
            <Switch checked={exact} onCheckedChange={setExact} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{t("caseSensitive", lang)}</span>
            <Switch checked={caseSensitive} onCheckedChange={setCaseSensitive} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
