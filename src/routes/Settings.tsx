import { useStore } from "../lib/store";
import { speak } from "../lib/tts";

const TTS_RATES: { label: string; value: number }[] = [
  { label: "느리게 (0.8×)", value: 0.8 },
  { label: "보통 (1.0×)", value: 1.0 },
  { label: "빠르게 (1.2×)", value: 1.2 },
];

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const resetProgress = useStore((s) => s.resetProgress);

  function handleReset() {
    if (window.confirm("정말 진도를 리셋할까요? 별표·학습 기록이 모두 삭제됩니다.")) {
      resetProgress();
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">설정</h2>

      {/* 로마자 표시 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          표시
        </h3>
        <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">로마자 표시</span>
          <input
            type="checkbox"
            checked={settings.showRomaji}
            onChange={(e) => setSettings({ showRomaji: e.target.checked })}
            className="h-5 w-5 rounded accent-sky-500"
          />
        </label>
      </section>

      {/* TTS 속도 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          TTS 재생 속도
        </h3>
        <div className="flex gap-2">
          {TTS_RATES.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSettings({ ttsRate: value })}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                settings.ttsRate === value
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => speak("これはテストです", settings.ttsRate)}
          className="w-full rounded-xl border border-sky-200 bg-sky-50 py-3 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 active:bg-sky-200 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-400 dark:hover:bg-sky-900/40"
        >
          🔊 테스트 재생
        </button>
      </section>

      {/* 진도 리셋 */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          데이터
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 active:bg-red-200 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          진도 리셋
        </button>
      </section>
    </div>
  );
}
