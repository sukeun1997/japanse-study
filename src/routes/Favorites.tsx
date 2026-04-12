import { useEffect, useState } from "react";
import type { Phrase } from "../types";
import { loadPhrases } from "../lib/phrases";
import { useStore } from "../lib/store";
import PhraseCard from "../components/PhraseCard";

export default function Favorites() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const progress = useStore((s) => s.progress);
  const toggleStar = useStore((s) => s.toggleStar);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    loadPhrases().then(setPhrases);
  }, []);

  const starred = phrases
    .filter((p) => progress[p.id]?.starred)
    .sort((a, b) => (progress[b.id]?.lastSeenAt ?? 0) - (progress[a.id]?.lastSeenAt ?? 0));

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-4">
      {starred.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <span className="text-4xl">☆</span>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            별표한 문장이 없어요
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            목록에서 ☆를 눌러 즐겨찾기에 추가하세요
          </p>
        </div>
      ) : (
        starred.map((phrase) => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            starred={!!progress[phrase.id]?.starred}
            onStar={() => toggleStar(phrase.id)}
            showRomaji={settings.showRomaji}
          />
        ))
      )}
    </div>
  );
}
