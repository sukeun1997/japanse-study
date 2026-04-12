import { useEffect, useState } from "react";
import type { Phrase } from "../types";
import type { CategoryId } from "../types";
import { loadPhrases } from "../lib/phrases";
import { useStore } from "../lib/store";
import CategoryTabs from "../components/CategoryTabs";
import PhraseCard from "../components/PhraseCard";
import { speak } from "../lib/tts";

type AllOrCategory = "all" | CategoryId;

export default function Browse() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AllOrCategory>("all");
  const [loading, setLoading] = useState(true);
  const progress = useStore((s) => s.progress);
  const toggleStar = useStore((s) => s.toggleStar);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    loadPhrases()
      .then(setPhrases)
      .finally(() => setLoading(false));
  }, []);

  const filtered = phrases.filter((p) => {
    const matchCategory =
      activeCategory === "all" || p.category === activeCategory;

    if (!matchCategory) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase();
    return (
      p.ko.toLowerCase().includes(q) ||
      p.ja.toLowerCase().includes(q) ||
      p.kana.toLowerCase().includes(q) ||
      p.romaji.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-0">
      {/* 검색 인풋 */}
      <div className="px-4 pt-4 pb-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="한국어, 일본어, 가나, 로마자 검색..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-sky-500"
        />
      </div>

      {/* 카테고리 탭 */}
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

      {/* 문장 리스트 */}
      <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
        {loading && (
          <p className="py-8 text-center text-sm text-gray-400">불러오는 중...</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            일치하는 문장이 없어요
          </p>
        )}

        {filtered.map((p) => (
          <PhraseCard
            key={p.id}
            phrase={p}
            starred={!!progress[p.id]?.starred}
            onStar={() => toggleStar(p.id)}
            onPlay={() => speak(p.kana, settings.ttsRate)}
            showRomaji={settings.showRomaji}
          />
        ))}
      </div>
    </div>
  );
}
