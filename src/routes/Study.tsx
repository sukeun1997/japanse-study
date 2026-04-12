import { useEffect, useState } from "react";
import { loadPhrases } from "../lib/phrases";
import { buildQueue, type QueueItem } from "../lib/studyQueue";
import { useStore } from "../lib/store";
import StudyCard from "../components/StudyCard";
import { speak } from "../lib/tts";

export default function Study() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const progress = useStore((s) => s.progress);
  const markKnown = useStore((s) => s.markKnown);
  const markWrong = useStore((s) => s.markWrong);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    loadPhrases().then((all) => {
      setQueue(buildQueue(all, useStore.getState().progress));
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded) {
    return <div className="p-4 text-center text-gray-400">불러오는 중…</div>;
  }

  if (queue.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center gap-4 mt-12">
        <p className="text-4xl">🎉</p>
        <p className="text-xl font-bold">오늘 학습 완료</p>
        <p className="text-sm text-gray-500">이미 모든 문장을 외웠어요!</p>
      </div>
    );
  }

  if (idx >= queue.length) {
    return (
      <div className="p-4 flex flex-col items-center gap-4 mt-12">
        <p className="text-4xl">✓</p>
        <p className="text-xl font-bold">세션 완료</p>
        <p className="text-sm text-gray-500">{queue.length}장 학습했어요</p>
      </div>
    );
  }

  const current = queue[idx];

  function handleKnown() {
    markKnown(current.phrase.id);
    setIdx((i) => i + 1);
  }

  function handleWrong() {
    markWrong(current.phrase.id);
    setQueue((q) => [...q, { phrase: current.phrase }]);
    setIdx((i) => i + 1);
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{idx + 1} / {queue.length}</span>
        <span>오늘의 학습</span>
      </div>

      <StudyCard
        key={`${current.phrase.id}-${idx}`}
        phrase={current.phrase}
        onPlay={() => speak(current.phrase.kana, settings.ttsRate)}
      />

      <div className="flex gap-3 mt-2">
        <button
          className="flex-1 rounded-xl border-2 border-gray-300 dark:border-neutral-600 py-3 font-semibold text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-neutral-700"
          onClick={handleWrong}
        >
          다시
        </button>
        <button
          className="flex-1 rounded-xl bg-sky-500 py-3 font-semibold text-white active:bg-sky-600"
          onClick={handleKnown}
        >
          알아요
        </button>
      </div>
    </div>
  );
}
