import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadPhrases, priorityOne } from "../lib/phrases";

const TRIP_START = new Date("2026-04-30T00:00:00+09:00");

function daysUntil(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function Home() {
  const [totalP1, setTotalP1] = useState(0);
  useEffect(() => { loadPhrases().then((p) => setTotalP1(priorityOne(p).length)); }, []);

  const dLeft = daysUntil(TRIP_START);

  return (
    <div className="p-4 space-y-6">
      <section className="rounded-2xl bg-sky-50 dark:bg-sky-950 p-5">
        <div className="text-xs text-sky-700 dark:text-sky-300">오사카까지</div>
        <div className="mt-1 text-4xl font-bold text-sky-700 dark:text-sky-300">D-{dLeft}</div>
        <div className="mt-1 text-xs text-sky-600 dark:text-sky-400">2026-04-30 🛫</div>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">오늘의 학습</h3>
          <span className="text-xs text-gray-500">0 / 10장</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-neutral-800">
          <div className="h-full w-0 rounded-full bg-sky-500 transition-all" />
        </div>
        <Link
          to="/study"
          className="mt-4 block rounded-xl bg-sky-500 px-4 py-3 text-center font-semibold text-white active:bg-sky-600"
        >
          ▶ 이어서 공부
        </Link>
      </section>

      <section>
        <div className="text-sm">외운 문장 <span className="font-bold">0</span> / {totalP1 || "—"}</div>
      </section>
    </div>
  );
}
