import { CATEGORIES, type CategoryId } from "../types";

type AllOrCategory = "all" | CategoryId;

interface CategoryTabsProps {
  active: AllOrCategory;
  onChange: (id: AllOrCategory) => void;
}

const ALL_TAB = { id: "all" as const, label: "전체", emoji: "🗾" };

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const tabs = [ALL_TAB, ...CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id as AllOrCategory)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-sky-500 text-white"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
