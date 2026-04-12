import { Link } from "react-router-dom";
import type { Phrase } from "../types";

interface PhraseCardProps {
  phrase: Phrase;
  showRomaji?: boolean;
  starred?: boolean;
  onPlay?: () => void;
  onStar?: () => void;
}

export default function PhraseCard({
  phrase,
  showRomaji = true,
  starred = false,
  onPlay,
  onStar,
}: PhraseCardProps) {
  return (
    <Link
      to={`/showcase/${phrase.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {phrase.ko}
          </p>
          <p className="mt-1 text-lg font-medium text-gray-700 dark:text-gray-300">
            {phrase.ja}
          </p>
          {phrase.ja !== phrase.kana && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {phrase.kana}
            </p>
          )}
          {showRomaji && (
            <p className="mt-0.5 text-sm italic text-gray-400 dark:text-gray-500">
              {phrase.romaji}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2">
          <button
            aria-label="재생"
            onClick={(e) => {
              e.preventDefault();
              onPlay?.();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600 transition-colors hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400"
          >
            🔊
          </button>
          <button
            aria-label={starred ? "즐겨찾기 해제" : "즐겨찾기"}
            onClick={(e) => {
              e.preventDefault();
              onStar?.();
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              starred
                ? "bg-yellow-50 text-yellow-500 dark:bg-yellow-900/30"
                : "bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-500"
            }`}
          >
            {starred ? "★" : "☆"}
          </button>
        </div>
      </div>
    </Link>
  );
}
