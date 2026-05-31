import type { ReactNode } from "react";
import { words } from "@/data";
import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card px-4 py-3">
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function ProgressDialog({ trigger }: { trigger: ReactNode }) {
  const lang = useStore((s) => s.settings.lang);
  const reviewIds = useStore((s) => s.reviewIds);
  const masteredIds = useStore((s) => s.masteredIds);
  const resetProgress = useStore((s) => s.resetProgress);

  const total = words.length;
  const mastered = masteredIds.length;
  const pct = total ? Math.round((mastered / total) * 100) : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("progress", lang)}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          <Stat value={total} label={t("words", lang)} />
          <Stat value={reviewIds.length} label={t("toReview", lang)} />
          <Stat value={mastered} label={t("mastered", lang)} />
        </div>

        <div className="mt-2">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{t("mastered", lang)}</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-tone2 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button variant="danger" size="sm" onClick={resetProgress}>
            {t("clearProgress", lang)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
