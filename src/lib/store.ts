import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PhraseProgress, Settings } from "../types";

interface StoreState {
  progress: Record<string, PhraseProgress>;
  settings: Settings;
  toggleStar: (id: string) => void;
  markKnown: (id: string) => void;
  markWrong: (id: string) => void;
  resetProgress: () => void;
  setSettings: (partial: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  showRomaji: true,
  ttsRate: 1.0,
  darkMode: "system",
};

function getOrInit(
  progress: Record<string, PhraseProgress>,
  id: string
): PhraseProgress {
  return (
    progress[id] ?? {
      status: "new",
      starred: false,
      wrongCount: 0,
      lastSeenAt: Date.now(),
    }
  );
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      progress: {},
      settings: defaultSettings,

      toggleStar(id) {
        const current = getOrInit(get().progress, id);
        set((s) => ({
          progress: {
            ...s.progress,
            [id]: {
              ...current,
              starred: !current.starred,
              lastSeenAt: Date.now(),
            },
          },
        }));
      },

      markKnown(id) {
        const current = getOrInit(get().progress, id);
        set((s) => ({
          progress: {
            ...s.progress,
            [id]: {
              ...current,
              status: "known",
              lastSeenAt: Date.now(),
            },
          },
        }));
      },

      markWrong(id) {
        const current = getOrInit(get().progress, id);
        set((s) => ({
          progress: {
            ...s.progress,
            [id]: {
              ...current,
              status: "learning",
              wrongCount: current.wrongCount + 1,
              lastSeenAt: Date.now(),
            },
          },
        }));
      },

      resetProgress() {
        set({ progress: {} });
      },

      setSettings(partial) {
        set((s) => ({ settings: { ...s.settings, ...partial } }));
      },
    }),
    { name: "osaka-phrasebook-v1" }
  )
);

export function isStarred(id: string): boolean {
  return !!useStore.getState().progress[id]?.starred;
}
