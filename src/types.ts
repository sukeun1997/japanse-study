export type CategoryId =
  | "basics" | "restaurant" | "transit" | "convenience"
  | "hotel"  | "shopping"   | "directions" | "numbers"
  | "emergency" | "small-talk";

export const CATEGORIES: { id: CategoryId; label: string; emoji: string }[] = [
  { id: "basics",      label: "인사·기초",   emoji: "👋" },
  { id: "restaurant",  label: "식당",        emoji: "🍜" },
  { id: "transit",     label: "교통",        emoji: "🚆" },
  { id: "convenience", label: "편의점",      emoji: "🏪" },
  { id: "hotel",       label: "호텔",        emoji: "🏨" },
  { id: "shopping",    label: "쇼핑",        emoji: "🛍" },
  { id: "directions",  label: "길 묻기",     emoji: "🗺" },
  { id: "numbers",     label: "숫자·돈",     emoji: "🔢" },
  { id: "emergency",   label: "응급",        emoji: "🚑" },
  { id: "small-talk",  label: "스몰토크",    emoji: "💬" },
];

export type Phrase = {
  id: string;
  ko: string;
  ja: string;
  kana: string;
  romaji: string;
  category: CategoryId;
  priority: 1 | 2 | 3;
  tags?: string[];
};

export type PhraseProgress = {
  status: "new" | "learning" | "known";
  starred: boolean;
  wrongCount: number;
  lastSeenAt: number;
};

export type Settings = {
  showRomaji: boolean;
  ttsRate: 0.8 | 1.0 | 1.2;
  darkMode: "system" | "light" | "dark";
};
