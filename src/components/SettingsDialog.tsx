import type { ReactNode } from "react";
import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

export function SettingsDialog({ trigger }: { trigger: ReactNode }) {
  const { settings, updateSettings } = useStore();
  const lang = settings.lang;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings", lang)}</DialogTitle>
        </DialogHeader>

        <div className="divide-y">
          <Row label={t("interfaceLang", lang)}>
            <div className="flex rounded-lg border p-0.5">
              <Button
                size="sm"
                variant={lang === "en" ? "default" : "ghost"}
                onClick={() => updateSettings({ lang: "en" })}
              >
                EN
              </Button>
              <Button
                size="sm"
                variant={lang === "zh" ? "default" : "ghost"}
                onClick={() => updateSettings({ lang: "zh" })}
              >
                中文
              </Button>
            </div>
          </Row>

          <Row label={t("theme", lang)}>
            <div className="flex rounded-lg border p-0.5">
              <Button
                size="sm"
                variant={settings.theme === "light" ? "default" : "ghost"}
                onClick={() => updateSettings({ theme: "light" })}
              >
                {t("light", lang)}
              </Button>
              <Button
                size="sm"
                variant={settings.theme === "dark" ? "default" : "ghost"}
                onClick={() => updateSettings({ theme: "dark" })}
              >
                {t("dark", lang)}
              </Button>
            </div>
          </Row>

          <Row label={t("showPinyin", lang)}>
            <Switch
              checked={settings.showPinyin}
              onCheckedChange={(v) => updateSettings({ showPinyin: v })}
            />
          </Row>

          <Row label={t("showEnglish", lang)}>
            <Switch
              checked={settings.showEnglish}
              onCheckedChange={(v) => updateSettings({ showEnglish: v })}
            />
          </Row>

          <Row label={t("audioOnly", lang)}>
            <Switch
              checked={settings.audioOnly}
              onCheckedChange={(v) => updateSettings({ audioOnly: v })}
            />
          </Row>

          <Row label={t("strokeQuiz", lang)}>
            <Switch
              checked={settings.strokeQuiz}
              onCheckedChange={(v) => updateSettings({ strokeQuiz: v })}
            />
          </Row>

          <Row label={t("showOutline", lang)}>
            <Switch
              checked={settings.showOutline}
              onCheckedChange={(v) => updateSettings({ showOutline: v })}
            />
          </Row>

          <Row label={t("hintAfter", lang)}>
            <Select
              value={String(settings.hintAfterMisses)}
              onValueChange={(v) =>
                updateSettings({ hintAfterMisses: Number(v) })
              }
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </div>
      </DialogContent>
    </Dialog>
  );
}
