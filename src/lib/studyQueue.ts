import type { Phrase, PhraseProgress } from "../types";

export type QueueItem = { phrase: Phrase };

const DAILY_LIMIT = 10;

export function buildQueue(
  phrases: Phrase[],
  progress: Record<string, PhraseProgress>
): QueueItem[] {
  const p1 = phrases.filter((p) => p.priority === 1);
  const unknown = p1.filter((p) => progress[p.id]?.status !== "known");
  const learningFirst = unknown.sort((a, b) => {
    const wa = progress[a.id]?.wrongCount ?? 0;
    const wb = progress[b.id]?.wrongCount ?? 0;
    return wb - wa;
  });
  return learningFirst.slice(0, DAILY_LIMIT).map((phrase) => ({ phrase }));
}
