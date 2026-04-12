import { useState } from "react";
import type { Phrase } from "../types";
import { useStore } from "../lib/store";

interface StudyCardProps {
  phrase: Phrase;
  onPlay: () => void;
}

export default function StudyCard({ phrase, onPlay }: StudyCardProps) {
  const [revealed, setRevealed] = useState(false);
  const showRomaji = useStore((s) => s.settings.showRomaji);

  return (
    <div
      className="relative w-full min-h-[320px] rounded-2xl bg-white dark:bg-neutral-800 shadow-lg cursor-pointer select-none flex flex-col items-center justify-center p-6 gap-4"
      onClick={() => setRevealed(true)}
    >
      {!revealed ? (
        <>
          <p className="text-xs text-gray-400 dark:text-gray-500">탭하면 일본어가 나옵니다</p>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
            {phrase.ko}
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-400 dark:text-gray-500">{phrase.ko}</p>
          <p
            className="font-bold text-gray-900 dark:text-gray-50 text-center leading-tight"
            style={{ fontSize: "min(12vw, 64px)" }}
          >
            {phrase.ja}
          </p>
          {showRomaji && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{phrase.romaji}</p>
          )}
          <button
            className="mt-2 rounded-full bg-sky-100 dark:bg-sky-900 px-5 py-2 text-sm font-medium text-sky-700 dark:text-sky-300 active:bg-sky-200"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            ▶ 재생
          </button>
        </>
      )}
    </div>
  );
}
