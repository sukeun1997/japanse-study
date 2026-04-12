import type { Phrase, CategoryId } from "../types";

let cache: Phrase[] | null = null;

export async function loadPhrases(): Promise<Phrase[]> {
  if (cache) return cache;
  const res = await fetch("/data/phrases.json", { cache: "force-cache" });
  if (!res.ok) throw new Error(`phrases.json load failed: ${res.status}`);
  cache = (await res.json()) as Phrase[];
  return cache;
}

export function filterByCategory(phrases: Phrase[], cat: CategoryId) {
  return phrases.filter((p) => p.category === cat);
}

export function priorityOne(phrases: Phrase[]) {
  return phrases.filter((p) => p.priority === 1);
}
