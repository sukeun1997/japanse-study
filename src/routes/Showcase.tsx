import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Phrase } from "../types";
import { loadPhrases } from "../lib/phrases";
import { useStore } from "../lib/store";

export default function Showcase() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [phrase, setPhrase] = useState<Phrase | null | undefined>(undefined);

  const progress = useStore((s) => s.progress);
  const toggleStar = useStore((s) => s.toggleStar);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    loadPhrases().then((all) => {
      const found = all.find((p) => p.id === id);
      setPhrase(found ?? null);
    });
  }, [id]);

  if (phrase === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">로드 중…</p>
      </div>
    );
  }

  if (phrase === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">로드 중…</p>
      </div>
    );
  }

  const starred = !!progress[phrase.id]?.starred;

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-white px-6 dark:bg-gray-950">
      {/* 상단 좌: 닫기 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={() => nav(-1)}
        className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
      >
        ✕
      </button>

      {/* 상단 우: 별표 */}
      <button
        type="button"
        aria-label={starred ? "즐겨찾기 해제" : "즐겨찾기"}
        onClick={() => toggleStar(phrase.id)}
        className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-xl transition-colors ${
          starred
            ? "bg-yellow-50 text-yellow-500 dark:bg-yellow-900/30"
            : "bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500"
        }`}
      >
        {starred ? "★" : "☆"}
      </button>

      {/* 본문 */}
      <div className="flex w-full flex-col items-center gap-4 text-center">
        {/* 한국어 */}
        <p className="text-base text-gray-500 dark:text-gray-400">{phrase.ko}</p>

        {/* 일본어 — 거대 */}
        <p
          className="jp font-bold leading-tight text-gray-900 dark:text-gray-50"
          style={{ fontSize: "min(14vw, 80px)" }}
        >
          {phrase.ja}
        </p>

        {/* 가나 (한자와 다를 때) */}
        {phrase.ja !== phrase.kana && (
          <p className="text-lg text-gray-600 dark:text-gray-300">{phrase.kana}</p>
        )}

        {/* 로마자 */}
        {settings.showRomaji && (
          <p className="text-base italic text-gray-400 dark:text-gray-500">
            {phrase.romaji}
          </p>
        )}

        {/* 재생 버튼 — Day 6에 onClick 배선 */}
        <button
          type="button"
          aria-label="재생"
          className="mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 text-2xl text-white shadow-lg transition-colors hover:bg-sky-600 active:scale-95"
        >
          🔊
        </button>
      </div>
    </div>
  );
}
