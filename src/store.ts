import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang, ViewMode } from "@/types";
import type { Lesson } from "@/lib/filter";

interface Settings {
  lang: Lang;
  theme: "dark" | "light";
  showPinyin: boolean;
  showEnglish: boolean;
  audioOnly: boolean;
  strokeQuiz: boolean;
  showOutline: boolean;
  hintAfterMisses: number;
}

interface FlashState {
  // selection
  hsk: number | "All";
  lesson: Lesson;
  viewMode: ViewMode;
  random: boolean;

  // persisted user data
  reviewIds: number[];
  masteredIds: number[];
  settings: Settings;

  // actions
  setHsk: (hsk: number | "All") => void;
  setLesson: (lesson: Lesson) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  setRandom: (v: boolean) => void;

  toggleReview: (id: number) => void;
  isReviewed: (id: number) => boolean;
  toggleMastered: (id: number) => void;
  isMastered: (id: number) => boolean;
  resetProgress: () => void;

  updateSettings: (patch: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  lang: "en",
  theme: "dark",
  showPinyin: true,
  showEnglish: true,
  audioOnly: false,
  strokeQuiz: false,
  showOutline: true,
  hintAfterMisses: 3,
};

export const useStore = create<FlashState>()(
  persist(
    (set, get) => ({
      hsk: 1,
      lesson: 1,
      viewMode: "card",
      random: false,

      reviewIds: [],
      masteredIds: [],
      settings: defaultSettings,

      setHsk: (hsk) => set({ hsk }),
      setLesson: (lesson) => set({ lesson }),
      setViewMode: (viewMode) => set({ viewMode }),
      toggleViewMode: () =>
        set({ viewMode: get().viewMode === "card" ? "list" : "card" }),
      setRandom: (random) => set({ random }),

      toggleReview: (id) =>
        set((s) => ({
          reviewIds: s.reviewIds.includes(id)
            ? s.reviewIds.filter((x) => x !== id)
            : [...s.reviewIds, id],
        })),
      isReviewed: (id) => get().reviewIds.includes(id),
      toggleMastered: (id) =>
        set((s) => ({
          masteredIds: s.masteredIds.includes(id)
            ? s.masteredIds.filter((x) => x !== id)
            : [...s.masteredIds, id],
        })),
      isMastered: (id) => get().masteredIds.includes(id),
      resetProgress: () => set({ masteredIds: [], reviewIds: [] }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "hsk-flashcards",
      partialize: (s) => ({
        hsk: s.hsk,
        lesson: s.lesson,
        viewMode: s.viewMode,
        reviewIds: s.reviewIds,
        masteredIds: s.masteredIds,
        settings: s.settings,
      }),
    },
  ),
);
