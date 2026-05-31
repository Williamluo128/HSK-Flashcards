import type { Radical } from "@/types";
import { usableRadicals } from "@/data";
import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

export function RadicalDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (radical: Radical) => void;
}) {
  const lang = useStore((s) => s.settings.lang);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("radicals", lang)}</DialogTitle>
          <DialogDescription>{t("radicalLookup", lang)}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {usableRadicals.map((r) => (
            <button
              key={`${r.radical}-${r.pinyin}`}
              type="button"
              onClick={() => {
                onPick(r);
                onOpenChange(false);
              }}
              className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition hover:border-[color:var(--ring)] hover:bg-muted"
            >
              <span className="font-han text-2xl leading-none" lang="zh">
                {r.radical}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs text-muted-foreground">
                  {r.pinyin.replace(/[0-9_]+$/, "")}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {r.meaning}
                </span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
