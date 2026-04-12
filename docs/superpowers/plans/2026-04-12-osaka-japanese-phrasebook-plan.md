# 오사카 회화 PWA — 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 오사카 3박4일 여행에서 쓸 ~80개 일본어 문장을 TTS로 학습하고 오프라인으로 참조하는 PWA를 18일 안에 배포·사용한다.

**Architecture:** 정적 SPA (Vite+React+TS). 2개 모드(Study/Browse)가 `public/data/phrases.json`을 공유. 진도·설정은 Zustand+localStorage. Service Worker로 오프라인. TTS는 Web Speech API. Vercel 배포.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3, Zustand 4, react-router v6 (HashRouter), lucide-react, vite-plugin-pwa, Web Speech API.

**Spec:** `docs/superpowers/specs/2026-04-12-osaka-japanese-phrasebook-design.md`

**Testing Policy:** 자동화 테스트 없음 (MVP 스코프 컷). 대신 각 태스크마다 **수동 검증 단계** 필수 — 로컬 dev server 브라우저 확인 + Week 1 종료 시 iPhone Safari 실기 검증.

---

## File Structure

```
japanese-study/
├─ docs/superpowers/
│  ├─ specs/2026-04-12-osaka-japanese-phrasebook-design.md
│  └─ plans/2026-04-12-osaka-japanese-phrasebook-plan.md   # 이 파일
├─ public/
│  ├─ data/phrases.json        # Day 2 생성(시드 15개), Week 2에 80개로 확장
│  ├─ icons/                   # Day 7 생성
│  │  ├─ icon-192.png
│  │  ├─ icon-512.png
│  │  └─ icon-maskable.png
│  └─ manifest.webmanifest     # Day 7 생성 (vite-plugin-pwa가 처리)
├─ src/
│  ├─ main.tsx                 # 엔트리. 라우터 마운트.
│  ├─ App.tsx                  # 레이아웃 (BottomNav + Outlet)
│  ├─ routes/
│  │  ├─ Home.tsx              # D-day, 진도바, 이어서 공부 CTA
│  │  ├─ Study.tsx             # 학습 모드 (카드 flip)
│  │  ├─ Browse.tsx            # 여행 모드 (카테고리 + 검색)
│  │  ├─ Favorites.tsx         # 즐겨찾기
│  │  ├─ Settings.tsx          # 로마자/TTS속도/다크/리셋
│  │  └─ Showcase.tsx          # 풀스크린 보여주기 뷰 (route: /showcase/:id)
│  ├─ components/
│  │  ├─ BottomNav.tsx         # 하단 3탭
│  │  ├─ PhraseCard.tsx        # Browse·Favorites 리스트 카드
│  │  ├─ PlayButton.tsx        # 🔊 버튼 (tts.speak 호출)
│  │  ├─ CategoryTabs.tsx      # 가로 스크롤 카테고리 탭
│  │  └─ StudyCard.tsx         # Study 전용 flip 카드
│  ├─ lib/
│  │  ├─ tts.ts                # Web Speech API 래퍼 (iOS 대응)
│  │  ├─ store.ts              # Zustand (progress + settings)
│  │  ├─ studyQueue.ts         # 학습 큐 생성·소비 로직
│  │  └─ phrases.ts            # phrases.json 로더, 카테고리 헬퍼
│  ├─ types.ts                 # Phrase, CategoryId, Progress, Settings
│  └─ styles/globals.css       # Tailwind directives + 폰트/테마 변수
├─ index.html
├─ vite.config.ts
├─ tailwind.config.js
├─ postcss.config.js
├─ tsconfig.json
├─ tsconfig.node.json
├─ package.json
└─ .gitignore
```

---

## Week 1 — Build (4/12 일 ~ 4/18 토)

### Task 1 (Day 1 · 4/12 일 · 오늘): 프로젝트 스캐폴드

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`
- Create: `tailwind.config.js`, `postcss.config.js`, `src/styles/globals.css`

- [ ] **Step 1.1: Vite React-TS 템플릿으로 생성**

```bash
cd /Users/sukeun/IdeaProjects/japanse-study
npm create vite@latest . -- --template react-ts
# 프롬프트: "current directory is not empty" → "Ignore files and continue"
```

Expected: `package.json`, `src/main.tsx`, `src/App.tsx`, `index.html` 생성. 기존 `docs/` 건드리지 않음.

- [ ] **Step 1.2: 의존성 설치**

```bash
npm install
npm install zustand react-router-dom lucide-react
npm install -D tailwindcss@3 postcss autoprefixer vite-plugin-pwa
```

- [ ] **Step 1.3: Tailwind 초기화**

```bash
npx tailwindcss init -p
```

`tailwind.config.js` 내용:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        jp: ['"Noto Sans JP"', '"Hiragino Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 1.4: `src/styles/globals.css` 작성**

기존 `src/index.css`를 덮어쓰기:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root { height: 100%; }
  body {
    @apply bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100;
    font-feature-settings: "palt";
    -webkit-tap-highlight-color: transparent;
  }
  .jp { font-family: theme('fontFamily.jp'); }
}
```

그리고 `src/main.tsx`에서 기존 `import './index.css'`를 `import './styles/globals.css'`로 바꾸고 `src/index.css`·`src/App.css` 삭제.

- [ ] **Step 1.5: `index.html` head 정리 + 뷰포트**

`<head>` 안 `<title>`과 `<meta>`:
```html
<meta charset="UTF-8" />
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
<meta name="theme-color" content="#0ea5e9" />
<title>오사카 회화</title>
```

- [ ] **Step 1.6: 빈 `src/App.tsx` 만들고 dev 서버 실행 확인**

`src/App.tsx`:
```tsx
export default function App() {
  return (
    <main className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">오사카 회화</h1>
        <p className="mt-2 text-sm text-gray-500">D-18 · 2026-04-30</p>
      </div>
    </main>
  );
}
```

Run:
```bash
npm run dev
```
Expected: `http://localhost:5173` 에 "오사카 회화" + "D-18" 표시. 다크모드 OS 설정 따라감.

- [ ] **Step 1.7: `.gitignore` 확인 (Vite 템플릿이 이미 생성) + 커밋**

```bash
git add .
git -c commit.gpgsign=false commit -m "chore: bootstrap Vite+React+TS+Tailwind"
```

---

### Task 2 (Day 1 · 4/12 일): 타입 정의 + 라우팅 + 하단 네비

**Files:**
- Create: `src/types.ts`, `src/routes/Home.tsx`, `src/routes/Study.tsx`, `src/routes/Browse.tsx`, `src/routes/Favorites.tsx`, `src/routes/Settings.tsx`, `src/routes/Showcase.tsx`
- Create: `src/components/BottomNav.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 2.1: `src/types.ts` 작성**

```ts
export type CategoryId =
  | "basics" | "restaurant" | "transit" | "convenience"
  | "hotel"  | "shopping"   | "directions" | "numbers"
  | "emergency" | "kansai";

export const CATEGORIES: { id: CategoryId; label: string; emoji: string }[] = [
  { id: "basics",      label: "인사·기초",   emoji: "👋" },
  { id: "restaurant",  label: "식당",        emoji: "🍜" },
  { id: "transit",     label: "교통",        emoji: "🚆" },
  { id: "convenience", label: "편의점",      emoji: "🏪" },
  { id: "hotel",       label: "호텔",        emoji: "🏨" },
  { id: "shopping",    label: "쇼핑",        emoji: "🛍" },
  { id: "directions",  label: "길 묻기",     emoji: "🗺" },
  { id: "numbers",     label: "숫자",        emoji: "🔢" },
  { id: "emergency",   label: "응급",        emoji: "🚑" },
  { id: "kansai",      label: "칸사이벤",    emoji: "⭐️" },
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
```

- [ ] **Step 2.2: 각 라우트 stub 파일 생성**

`src/routes/Home.tsx`:
```tsx
export default function Home() {
  return <div className="p-4"><h2 className="text-xl font-bold">홈</h2></div>;
}
```

`src/routes/Study.tsx`:
```tsx
export default function Study() {
  return <div className="p-4"><h2 className="text-xl font-bold">학습</h2></div>;
}
```

`src/routes/Browse.tsx`:
```tsx
export default function Browse() {
  return <div className="p-4"><h2 className="text-xl font-bold">여행</h2></div>;
}
```

`src/routes/Favorites.tsx`:
```tsx
export default function Favorites() {
  return <div className="p-4"><h2 className="text-xl font-bold">즐겨찾기</h2></div>;
}
```

`src/routes/Settings.tsx`:
```tsx
export default function Settings() {
  return <div className="p-4"><h2 className="text-xl font-bold">설정</h2></div>;
}
```

`src/routes/Showcase.tsx`:
```tsx
import { useParams, useNavigate } from "react-router-dom";
export default function Showcase() {
  const { id } = useParams();
  const nav = useNavigate();
  return (
    <div className="p-4">
      <button onClick={() => nav(-1)} className="text-sm text-gray-500">← 닫기</button>
      <p className="mt-4 text-4xl jp">{id}</p>
    </div>
  );
}
```

- [ ] **Step 2.3: `src/components/BottomNav.tsx` 작성**

```tsx
import { NavLink } from "react-router-dom";
import { BookOpen, Map, Star } from "lucide-react";

const items = [
  { to: "/study",     icon: BookOpen, label: "학습" },
  { to: "/browse",    icon: Map,      label: "여행" },
  { to: "/favorites", icon: Star,     label: "즐겨찾기" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-gray-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur">
      <ul className="mx-auto flex max-w-lg">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs ${
                  isActive ? "text-sky-600" : "text-gray-500 dark:text-neutral-400"
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2.4: `src/App.tsx` 레이아웃 + 상단 Settings 버튼**

```tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { Settings as SettingsIcon } from "lucide-react";
import BottomNav from "./components/BottomNav";

export default function App() {
  const { pathname } = useLocation();
  const showChrome = !pathname.startsWith("/showcase");
  return (
    <div className="relative mx-auto flex h-full max-w-lg flex-col">
      {showChrome && (
        <header className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-bold">오사카 회화</Link>
          <Link to="/settings" aria-label="설정"><SettingsIcon size={20} /></Link>
        </header>
      )}
      <main className={`flex-1 overflow-y-auto ${showChrome ? "pb-16" : ""}`}>
        <Outlet />
      </main>
      {showChrome && <BottomNav />}
    </div>
  );
}
```

- [ ] **Step 2.5: `src/main.tsx` 라우터 등록**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./routes/Home";
import Study from "./routes/Study";
import Browse from "./routes/Browse";
import Favorites from "./routes/Favorites";
import SettingsPage from "./routes/Settings";
import Showcase from "./routes/Showcase";
import "./styles/globals.css";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "study", element: <Study /> },
      { path: "browse", element: <Browse /> },
      { path: "favorites", element: <Favorites /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "showcase/:id", element: <Showcase /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

- [ ] **Step 2.6: Manual verification**

Run: `npm run dev`
Expected:
- `/`에서 "홈" 헤더
- 하단 탭 3개 (학습/여행/즐겨찾기) 표시, 탭 시 해당 라우트 이동
- 상단 오른쪽 설정 아이콘 클릭 시 `/#/settings` 이동
- `/#/showcase/test` 직접 입력 시 하단 탭과 헤더가 사라지고 "test"가 크게 표시

- [ ] **Step 2.7: 커밋**

```bash
git add .
git -c commit.gpgsign=false commit -m "feat: add route stubs, BottomNav, shared layout"
```

---

### Task 3 (Day 2 · 4/13 월): 문장 시드 JSON + phrases 로더 + Home

**Files:**
- Create: `public/data/phrases.json`
- Create: `src/lib/phrases.ts`
- Modify: `src/routes/Home.tsx`

- [ ] **Step 3.1: `public/data/phrases.json` 시드 15개 작성**

```bash
mkdir -p public/data
```

`public/data/phrases.json`:
```json
[
  { "id": "b-001", "ko": "안녕하세요", "ja": "こんにちは", "kana": "こんにちは", "romaji": "konnichiwa", "category": "basics", "priority": 1 },
  { "id": "b-002", "ko": "감사합니다", "ja": "ありがとうございます", "kana": "ありがとうございます", "romaji": "arigatou gozaimasu", "category": "basics", "priority": 1 },
  { "id": "b-003", "ko": "죄송합니다", "ja": "すみません", "kana": "すみません", "romaji": "sumimasen", "category": "basics", "priority": 1 },
  { "id": "b-004", "ko": "네 / 아니요", "ja": "はい / いいえ", "kana": "はい / いいえ", "romaji": "hai / iie", "category": "basics", "priority": 1 },
  { "id": "r-001", "ko": "두 명이에요", "ja": "二人です", "kana": "ふたりです", "romaji": "futari desu", "category": "restaurant", "priority": 1 },
  { "id": "r-002", "ko": "주문할게요", "ja": "注文お願いします", "kana": "ちゅうもんおねがいします", "romaji": "chuumon onegaishimasu", "category": "restaurant", "priority": 1 },
  { "id": "r-003", "ko": "이거 주세요", "ja": "これをください", "kana": "これをください", "romaji": "kore o kudasai", "category": "restaurant", "priority": 1 },
  { "id": "r-004", "ko": "물 좀 주세요", "ja": "お水をください", "kana": "おみずをください", "romaji": "omizu o kudasai", "category": "restaurant", "priority": 1 },
  { "id": "r-005", "ko": "계산해주세요", "ja": "お会計お願いします", "kana": "おかいけいおねがいします", "romaji": "okaikei onegaishimasu", "category": "restaurant", "priority": 1 },
  { "id": "t-001", "ko": "이거 난바 가나요?", "ja": "これは難波に行きますか?", "kana": "これはなんばにいきますか?", "romaji": "kore wa namba ni ikimasu ka", "category": "transit", "priority": 1 },
  { "id": "t-002", "ko": "표는 어디서 사나요?", "ja": "切符はどこで買えますか?", "kana": "きっぷはどこでかえますか?", "romaji": "kippu wa doko de kaemasu ka", "category": "transit", "priority": 2 },
  { "id": "c-001", "ko": "봉투 필요 없어요", "ja": "袋はいりません", "kana": "ふくろはいりません", "romaji": "fukuro wa irimasen", "category": "convenience", "priority": 1 },
  { "id": "c-002", "ko": "따뜻하게 해주세요", "ja": "温めてください", "kana": "あたためてください", "romaji": "atatamete kudasai", "category": "convenience", "priority": 2 },
  { "id": "h-001", "ko": "체크인 하고 싶어요", "ja": "チェックインお願いします", "kana": "チェックインおねがいします", "romaji": "chekku-in onegaishimasu", "category": "hotel", "priority": 1 },
  { "id": "d-001", "ko": "여기서 사진 찍어 주실래요?", "ja": "ここで写真を撮ってもらえますか?", "kana": "ここでしゃしんをとってもらえますか?", "romaji": "koko de shashin o totte moraemasu ka", "category": "directions", "priority": 2 }
]
```

- [ ] **Step 3.2: `src/lib/phrases.ts` 작성**

```ts
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
```

- [ ] **Step 3.3: `src/routes/Home.tsx` 실제 구현**

```tsx
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
```

- [ ] **Step 3.4: Manual verification**

Run: `npm run dev`
Expected:
- D-day 카드 표시 (4/12 기준 D-18)
- `외운 문장 0 / 10` 표시 (시드 priority=1 문장 10개)
- "이어서 공부" 탭 시 `/#/study` 이동

- [ ] **Step 3.5: 커밋**

```bash
git add public/ src/
git -c commit.gpgsign=false commit -m "feat: seed 15 phrases, phrases loader, Home with D-day"
```

---

### Task 4 (Day 3 · 4/14 화): Browse + CategoryTabs + PhraseCard

**Files:**
- Create: `src/components/CategoryTabs.tsx`, `src/components/PhraseCard.tsx`
- Modify: `src/routes/Browse.tsx`

- [ ] **Step 4.1: `src/components/CategoryTabs.tsx`**

```tsx
import { CATEGORIES, type CategoryId } from "../types";

type Props = { active: CategoryId | "all"; onChange: (c: CategoryId | "all") => void };

export default function CategoryTabs({ active, onChange }: Props) {
  const items: { id: CategoryId | "all"; label: string; emoji: string }[] = [
    { id: "all", label: "전체", emoji: "🌏" },
    ...CATEGORIES,
  ];
  return (
    <div className="sticky top-0 z-10 -mx-4 overflow-x-auto bg-white px-4 py-2 dark:bg-neutral-900">
      <div className="flex gap-2">
        {items.map((i) => (
          <button
            key={i.id}
            onClick={() => onChange(i.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              active === i.id
                ? "bg-sky-500 text-white"
                : "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-200"
            }`}
          >
            <span className="mr-1">{i.emoji}</span>
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4.2: `src/components/PhraseCard.tsx`** (재생·별표 버튼은 stub, Day 4·6에 실배선)

```tsx
import { Link } from "react-router-dom";
import { Star, Volume2 } from "lucide-react";
import type { Phrase } from "../types";

type Props = {
  phrase: Phrase;
  starred?: boolean;
  onStar?: () => void;
  onPlay?: () => void;
  showRomaji?: boolean;
};

export default function PhraseCard({ phrase, starred, onStar, onPlay, showRomaji = true }: Props) {
  return (
    <Link
      to={`/showcase/${phrase.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:active:bg-neutral-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold">{phrase.ko}</p>
          <p className="mt-1 jp text-lg leading-snug">{phrase.ja}</p>
          {showRomaji && (
            <p className="mt-0.5 text-xs text-gray-500">{phrase.romaji}</p>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onPlay?.(); }}
            aria-label="재생"
            className="rounded-full bg-sky-500 p-2 text-white active:bg-sky-600"
          >
            <Volume2 size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onStar?.(); }}
            aria-label="즐겨찾기"
            className={starred ? "text-yellow-500" : "text-gray-400"}
          >
            <Star size={20} fill={starred ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4.3: `src/routes/Browse.tsx` 구현**

```tsx
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import CategoryTabs from "../components/CategoryTabs";
import PhraseCard from "../components/PhraseCard";
import { loadPhrases } from "../lib/phrases";
import type { Phrase, CategoryId } from "../types";

export default function Browse() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [q, setQ] = useState("");

  useEffect(() => { loadPhrases().then(setPhrases); }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return phrases.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!needle) return true;
      return (
        p.ko.toLowerCase().includes(needle) ||
        p.ja.includes(needle) ||
        p.kana.includes(needle) ||
        p.romaji.toLowerCase().includes(needle)
      );
    });
  }, [phrases, cat, q]);

  return (
    <div className="p-4 space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="검색 (한/일/로마자)"
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
        />
      </div>

      <CategoryTabs active={cat} onChange={setCat} />

      <ul className="space-y-2">
        {list.length === 0 && (
          <li className="py-8 text-center text-sm text-gray-500">일치하는 문장이 없어요</li>
        )}
        {list.map((p) => (
          <li key={p.id}>
            <PhraseCard phrase={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4.4: Manual verification**

Run: `npm run dev` → `/#/browse`
Expected:
- 검색 인풋 + 카테고리 탭 가로 스크롤
- "식당" 탭 시 r-* 5개만 노출
- 검색 "みず" 입력 시 "물 좀 주세요" 1개만
- 카드 탭 시 `/#/showcase/{id}` 이동

- [ ] **Step 4.5: 커밋**

```bash
git add src/
git -c commit.gpgsign=false commit -m "feat: Browse with category tabs, search, phrase cards"
```

---

### Task 5 (Day 4 · 4/15 수): Zustand store + 즐겨찾기 + Showcase 실구현

**Files:**
- Create: `src/lib/store.ts`
- Modify: `src/routes/Showcase.tsx`, `src/routes/Browse.tsx`, `src/routes/Favorites.tsx`

- [ ] **Step 5.1: `src/lib/store.ts`**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PhraseProgress, Settings } from "../types";

type State = {
  progress: Record<string, PhraseProgress>;
  settings: Settings;
  toggleStar: (id: string) => void;
  markKnown: (id: string) => void;
  markWrong: (id: string) => void;
  resetProgress: () => void;
  setSettings: (s: Partial<Settings>) => void;
};

const DEFAULT_PROGRESS: PhraseProgress = {
  status: "new",
  starred: false,
  wrongCount: 0,
  lastSeenAt: 0,
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      progress: {},
      settings: { showRomaji: true, ttsRate: 1.0, darkMode: "system" },
      toggleStar: (id) =>
        set((s) => {
          const cur = s.progress[id] ?? DEFAULT_PROGRESS;
          return { progress: { ...s.progress, [id]: { ...cur, starred: !cur.starred } } };
        }),
      markKnown: (id) =>
        set((s) => {
          const cur = s.progress[id] ?? DEFAULT_PROGRESS;
          return {
            progress: {
              ...s.progress,
              [id]: { ...cur, status: "known", lastSeenAt: Date.now() },
            },
          };
        }),
      markWrong: (id) =>
        set((s) => {
          const cur = s.progress[id] ?? DEFAULT_PROGRESS;
          return {
            progress: {
              ...s.progress,
              [id]: {
                ...cur,
                status: "learning",
                wrongCount: cur.wrongCount + 1,
                lastSeenAt: Date.now(),
              },
            },
          };
        }),
      resetProgress: () => set({ progress: {} }),
      setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
    }),
    { name: "osaka-phrasebook-v1" }
  )
);

export const isStarred = (id: string) =>
  useStore.getState().progress[id]?.starred ?? false;
```

- [ ] **Step 5.2: Browse에서 별표 배선**

`src/routes/Browse.tsx` 내 카드 렌더를 수정:
```tsx
import { useStore } from "../lib/store";
// ...
const { progress, toggleStar, settings } = useStore();
// ...
{list.map((p) => (
  <li key={p.id}>
    <PhraseCard
      phrase={p}
      starred={!!progress[p.id]?.starred}
      onStar={() => toggleStar(p.id)}
      showRomaji={settings.showRomaji}
    />
  </li>
))}
```

- [ ] **Step 5.3: `src/routes/Favorites.tsx` 구현**

```tsx
import { useEffect, useMemo, useState } from "react";
import PhraseCard from "../components/PhraseCard";
import { loadPhrases } from "../lib/phrases";
import { useStore } from "../lib/store";
import type { Phrase } from "../types";

export default function Favorites() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const { progress, toggleStar, settings } = useStore();

  useEffect(() => { loadPhrases().then(setPhrases); }, []);

  const list = useMemo(() => {
    return phrases
      .filter((p) => progress[p.id]?.starred)
      .sort((a, b) => (progress[b.id]?.lastSeenAt ?? 0) - (progress[a.id]?.lastSeenAt ?? 0));
  }, [phrases, progress]);

  return (
    <div className="p-4 space-y-2">
      {list.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          여행 모드에서 별표를 누르면 여기에 모여요
        </p>
      ) : (
        list.map((p) => (
          <PhraseCard
            key={p.id}
            phrase={p}
            starred
            onStar={() => toggleStar(p.id)}
            showRomaji={settings.showRomaji}
          />
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 5.4: `src/routes/Showcase.tsx` 실구현 (재생 버튼은 Day 6에 배선)**

```tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Star, Volume2 } from "lucide-react";
import { loadPhrases } from "../lib/phrases";
import { useStore } from "../lib/store";
import type { Phrase } from "../types";

export default function Showcase() {
  const { id } = useParams();
  const nav = useNavigate();
  const [phrase, setPhrase] = useState<Phrase | null>(null);
  const { progress, toggleStar, settings } = useStore();

  useEffect(() => {
    loadPhrases().then((list) => setPhrase(list.find((p) => p.id === id) ?? null));
  }, [id]);

  if (!phrase) return <div className="p-8 text-center text-gray-500">로드 중…</div>;

  const starred = !!progress[phrase.id]?.starred;

  return (
    <div className="flex h-full flex-col bg-white text-gray-900 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => nav(-1)} aria-label="닫기"><X size={24} /></button>
        <button onClick={() => toggleStar(phrase.id)} aria-label="즐겨찾기">
          <Star size={24} fill={starred ? "currentColor" : "none"} className={starred ? "text-yellow-500" : ""} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-sm text-gray-500">{phrase.ko}</p>
        <p className="jp break-keep text-[min(14vw,80px)] font-bold leading-tight">
          {phrase.ja}
        </p>
        {settings.showRomaji && (
          <p className="text-sm text-gray-500">{phrase.romaji}</p>
        )}
      </div>

      <div className="p-6">
        <button
          type="button"
          className="mx-auto flex items-center gap-2 rounded-full bg-sky-500 px-8 py-4 text-lg font-semibold text-white active:bg-sky-600"
          aria-label="재생"
        >
          <Volume2 size={24} />
          재생
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5.5: Manual verification**

Run: `npm run dev`
- `/#/browse` → 별표 탭 → 노란색으로 바뀜. 새로고침해도 유지 (persist 확인).
- `/#/favorites` → 별표한 카드들만 보임.
- 카드 탭 → Showcase에서 일본어가 거대하게 표시. 닫기 시 돌아감.

- [ ] **Step 5.6: 커밋**

```bash
git add src/
git -c commit.gpgsign=false commit -m "feat: zustand store, star toggle, Favorites, Showcase layout"
```

---

### Task 6 (Day 5 · 4/16 목): Study queue + StudyCard + Study 화면

**Files:**
- Create: `src/lib/studyQueue.ts`, `src/components/StudyCard.tsx`
- Modify: `src/routes/Study.tsx`, `src/routes/Home.tsx`

- [ ] **Step 6.1: `src/lib/studyQueue.ts`**

```ts
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
```

- [ ] **Step 6.2: `src/components/StudyCard.tsx`**

```tsx
import { useState } from "react";
import { Volume2 } from "lucide-react";
import type { Phrase } from "../types";

type Props = {
  phrase: Phrase;
  showRomaji: boolean;
  onPlay: () => void;
};

export default function StudyCard({ phrase, showRomaji, onPlay }: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setRevealed((v) => !v)}
      className="flex w-full flex-1 flex-col items-center justify-center gap-6 rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900"
    >
      {!revealed ? (
        <>
          <span className="text-xs text-gray-400">탭하면 일본어가 나옵니다</span>
          <p className="text-2xl font-semibold">{phrase.ko}</p>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-400">{phrase.ko}</p>
          <p className="jp text-[min(12vw,64px)] font-bold leading-tight">{phrase.ja}</p>
          {showRomaji && <p className="text-sm text-gray-500">{phrase.romaji}</p>}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            className="flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-white active:bg-sky-600"
          >
            <Volume2 size={20} /> 재생
          </button>
        </>
      )}
    </button>
  );
}
```

- [ ] **Step 6.3: `src/routes/Study.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudyCard from "../components/StudyCard";
import { loadPhrases } from "../lib/phrases";
import { buildQueue, type QueueItem } from "../lib/studyQueue";
import { useStore } from "../lib/store";

export default function Study() {
  const { progress, settings, markKnown, markWrong } = useStore();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    loadPhrases().then((all) => setQueue(buildQueue(all, progress)));
    // 세션 중 progress 변화로 큐 재계산하지 않음 (세션 시작 시 고정)
  }, []);

  if (queue.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-semibold">오늘 학습 완료 🎉</p>
        <p className="mt-2 text-sm text-gray-500">priority=1 문장 전부 익혔어요.</p>
        <Link to="/browse" className="mt-6 rounded-xl bg-sky-500 px-4 py-2 text-white">여행 모드로 가기</Link>
      </div>
    );
  }

  if (idx >= queue.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-semibold">세션 완료 ✓</p>
        <p className="mt-2 text-sm text-gray-500">{queue.length}장 학습 완료</p>
        <Link to="/" className="mt-6 rounded-xl bg-sky-500 px-4 py-2 text-white">홈으로</Link>
      </div>
    );
  }

  const current = queue[idx].phrase;

  const handleWrong = () => {
    markWrong(current.id);
    setQueue((q) => [...q, { phrase: current }]); // 큐 끝에 재삽입
    setIdx((i) => i + 1);
  };

  const handleKnown = () => {
    markKnown(current.id);
    setIdx((i) => i + 1);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 text-center text-sm text-gray-500">
        {idx + 1} / {queue.length}
      </div>
      <StudyCard phrase={current} showRomaji={settings.showRomaji} onPlay={() => { /* Day 6에 tts 배선 */ }} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={handleWrong}
          className="rounded-xl border border-gray-300 py-3 font-semibold dark:border-neutral-700"
        >
          다시
        </button>
        <button
          onClick={handleKnown}
          className="rounded-xl bg-emerald-500 py-3 font-semibold text-white active:bg-emerald-600"
        >
          알아요
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6.4: Home의 진도 숫자 실제 값 연결**

`src/routes/Home.tsx` 내 기존 state·jsx 수정:
```tsx
import { useStore } from "../lib/store";
// ...
const { progress } = useStore();
// ...
const known = Object.values(progress).filter((p) => p.status === "known").length;
// 진도 바 width: known/10 (오늘 목표 기준)은 별도 추적 없으니 전체 기준으로 간소화
```

바뀐 section 부분만:
```tsx
<section>
  <div className="mb-2 flex items-baseline justify-between">
    <h3 className="text-sm font-semibold">외운 문장</h3>
    <span className="text-xs text-gray-500">{known} / {totalP1 || "—"}</span>
  </div>
  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-neutral-800">
    <div
      className="h-full rounded-full bg-sky-500 transition-all"
      style={{ width: totalP1 ? `${(known / totalP1) * 100}%` : "0%" }}
    />
  </div>
  <Link to="/study" className="mt-4 block rounded-xl bg-sky-500 px-4 py-3 text-center font-semibold text-white active:bg-sky-600">
    ▶ 이어서 공부
  </Link>
</section>
```

- [ ] **Step 6.5: Manual verification**

Run: `npm run dev` → `/#/study`
- 10장(또는 p1 전체)이 큐에 들어감
- 탭 시 flip, "알아요" 시 다음 카드로 (progress에 known 저장)
- "다시" 시 wrongCount++ 되고 큐 끝에 재삽입 (idx는 그대로 +1)
- 새로고침 후 다시 진입 시 known 제외한 큐로 재구성
- Home의 진도바가 "알아요" 누른 만큼 증가

- [ ] **Step 6.6: 커밋**

```bash
git add src/
git -c commit.gpgsign=false commit -m "feat: study queue, flip card, progress wiring"
```

---

### Task 7 (Day 6 · 4/17 금): TTS 래퍼 + 재생 버튼 배선 (⚠ 최대 리스크)

**Files:**
- Create: `src/lib/tts.ts`
- Modify: `src/routes/Showcase.tsx`, `src/routes/Study.tsx`, `src/routes/Browse.tsx`, `src/routes/Favorites.tsx`, `src/App.tsx`

- [ ] **Step 7.1: `src/lib/tts.ts`**

```ts
let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<void> | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  const all = window.speechSynthesis.getVoices();
  const exact = all.find((v) => v.lang === "ja-JP");
  if (exact) return exact;
  const prefix = all.find((v) => v.lang.toLowerCase().startsWith("ja"));
  return prefix ?? null;
}

function waitVoices(): Promise<void> {
  if (voicesReady) return voicesReady;
  voicesReady = new Promise<void>((resolve) => {
    if (window.speechSynthesis.getVoices().length > 0) return resolve();
    const handler = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // 일부 브라우저는 voiceschanged가 발생 안 함 → 1초 후 강제 resolve
    setTimeout(resolve, 1000);
  });
  return voicesReady;
}

/** iOS Safari: 최초 사용자 탭 이벤트 안에서 한 번 호출해서 엔진 깨움 */
export function primeTts() {
  try {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch { /* noop */ }
}

export async function speak(text: string, rate = 1.0) {
  if (!("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis not supported");
    return false;
  }
  await waitVoices();
  if (!cachedVoice) cachedVoice = pickVoice();

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (cachedVoice) {
    u.voice = cachedVoice;
    u.lang = cachedVoice.lang;
  } else {
    u.lang = "ja-JP"; // 폴백
  }
  u.rate = rate;
  u.pitch = 1.0;
  window.speechSynthesis.speak(u);
  return true;
}

export function isTtsAvailable(): boolean {
  return "speechSynthesis" in window;
}
```

- [ ] **Step 7.2: `src/App.tsx`에서 primeTts 최초 탭 hook**

`App.tsx` 상단 수정:
```tsx
import { useEffect } from "react";
import { primeTts } from "./lib/tts";
// ...
useEffect(() => {
  const onFirstTouch = () => {
    primeTts();
    window.removeEventListener("pointerdown", onFirstTouch);
  };
  window.addEventListener("pointerdown", onFirstTouch);
  return () => window.removeEventListener("pointerdown", onFirstTouch);
}, []);
```

- [ ] **Step 7.3: PhraseCard에 onPlay 실제 hook**

Browse.tsx와 Favorites.tsx에서 각각:
```tsx
import { speak } from "../lib/tts";
// ...
<PhraseCard
  phrase={p}
  starred={!!progress[p.id]?.starred}
  onStar={() => toggleStar(p.id)}
  onPlay={() => speak(p.kana, settings.ttsRate)}
  showRomaji={settings.showRomaji}
/>
```

- [ ] **Step 7.4: Showcase 재생 버튼 배선**

`Showcase.tsx` 재생 버튼 onClick:
```tsx
<button
  type="button"
  onClick={() => speak(phrase.kana, settings.ttsRate)}
  // ...
>
```

추가로 화면 진입 시 자동 1회 재생:
```tsx
useEffect(() => {
  if (phrase) speak(phrase.kana, settings.ttsRate);
}, [phrase?.id]);
```

- [ ] **Step 7.5: Study 카드 flip 시 자동 재생**

`Study.tsx`의 `onPlay` prop에 실제 함수 + 카드 reveal 시 자동 재생. `StudyCard`에 `autoPlayOnReveal` prop 추가:

`StudyCard.tsx` 수정:
```tsx
import { useEffect, useState } from "react";
// ...
const [revealed, setRevealed] = useState(false);
useEffect(() => { if (revealed) onPlay(); }, [revealed]);
```

`Study.tsx`:
```tsx
import { speak } from "../lib/tts";
// ...
<StudyCard phrase={current} showRomaji={settings.showRomaji} onPlay={() => speak(current.kana, settings.ttsRate)} />
```

- [ ] **Step 7.6: Settings에서 TTS 속도·로마자 토글 연결**

`src/routes/Settings.tsx` 실구현:
```tsx
import { useStore } from "../lib/store";
import { speak, isTtsAvailable } from "../lib/tts";

export default function Settings() {
  const { settings, setSettings, resetProgress } = useStore();

  return (
    <div className="p-4 space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">표시</h3>
        <label className="flex items-center justify-between">
          <span>로마자 표시</span>
          <input
            type="checkbox"
            checked={settings.showRomaji}
            onChange={(e) => setSettings({ showRomaji: e.target.checked })}
          />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">TTS 속도</h3>
        <div className="flex gap-2">
          {[0.8, 1.0, 1.2].map((r) => (
            <button
              key={r}
              onClick={() => setSettings({ ttsRate: r as 0.8 | 1.0 | 1.2 })}
              className={`flex-1 rounded-xl border py-2 ${
                settings.ttsRate === r ? "border-sky-500 bg-sky-50 dark:bg-sky-950" : "border-gray-300 dark:border-neutral-700"
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
        <button
          onClick={() => speak("これはテストです", settings.ttsRate)}
          disabled={!isTtsAvailable()}
          className="w-full rounded-xl bg-sky-500 py-2 text-white disabled:opacity-50"
        >
          🔊 테스트 재생
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">진도</h3>
        <button
          onClick={() => {
            if (confirm("모든 진도·즐겨찾기를 초기화합니다. 계속할까요?")) resetProgress();
          }}
          className="w-full rounded-xl border border-red-300 py-2 text-red-600"
        >
          진도 리셋
        </button>
      </section>
    </div>
  );
}
```

- [ ] **Step 7.7: Manual verification — 브라우저 (Chrome 먼저)**

Run: `npm run dev`
- Settings → "테스트 재생" → "これはテストです" 일본어 음성 재생
- Browse 카드 🔊 탭 → 해당 문장 일본어 재생
- Showcase 진입 시 자동 1회 재생
- Study 카드 flip 시 자동 재생

- [ ] **Step 7.8: Manual verification — iPhone Safari 실기**

로컬 IP로 iPhone에서 접속:
```bash
npm run dev -- --host
# 콘솔 출력의 Network URL (예: http://192.168.1.10:5173)을 iPhone Safari에서 열기
```
확인:
- 첫 화면에서 아무 곳이나 한 번 탭 (primeTts 트리거)
- 이후 Showcase/Study/Browse에서 재생 버튼 탭 시 일본어 소리 나옴
- **실패 시 폴백**: console에서 `speechSynthesis.getVoices()` 결과 확인 → ja 음성 없으면 Settings에 경고 배지 표시하는 추가 작업. (Week 2 버퍼에서 처리)

- [ ] **Step 7.9: 커밋**

```bash
git add src/
git -c commit.gpgsign=false commit -m "feat: Web Speech TTS with iOS prime, wire play buttons everywhere"
```

---

### Task 8 (Day 7 · 4/18 토): PWA 설정 + Vercel 배포 + iPhone 설치

**Files:**
- Modify: `vite.config.ts`, `index.html`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable.png`
- Create: `vercel.json` (선택)

- [ ] **Step 8.1: 아이콘 생성 (단순 이모지 기반 placeholder)**

간단히 온라인 도구나 로컬 스크립트로 `🗾` 또는 `お` 글자 기반 **192×192**, **512×512**, **512×512 maskable** PNG 3종 제작. 혹은 임시로 단색 배경 + 텍스트:
```bash
# 임시 아이콘: https://realfavicongenerator.net 또는 https://maskable.app/editor 로 생성
# 또는 ChatGPT 이미지 생성: "Minimalist Japanese kana 'お' white on sky-blue #0ea5e9, 512x512"
# 최종 파일 3개를 public/icons/ 에 배치
```

- [ ] **Step 8.2: `vite.config.ts`에 PWA 플러그인 추가**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable.png", "data/phrases.json"],
      manifest: {
        name: "오사카 회화",
        short_name: "오사카",
        description: "오사카 여행 회화 도우미",
        theme_color: "#0ea5e9",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        lang: "ko",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,webmanifest,json}"],
        runtimeCaching: [
          {
            urlPattern: /\/data\/phrases\.json$/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "phrases-data" },
          },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 8.3: 빌드 + 로컬 프리뷰**

```bash
npm run build
npm run preview -- --host
```
Expected:
- `dist/sw.js`, `dist/manifest.webmanifest` 생성
- iPhone에서 프리뷰 URL 접속 → Safari 공유 → "홈 화면에 추가" 동작 확인
- 홈 화면 아이콘 탭 시 주소창 없이 전체 화면으로 앱 실행

- [ ] **Step 8.4: GitHub 레포 생성 + 푸시**

```bash
gh repo create osaka-phrasebook --private --source=. --remote=origin
git push -u origin main
```
(또는 수동: GitHub에서 레포 생성 → `git remote add origin …` → `git push -u origin main`)

- [ ] **Step 8.5: Vercel 배포**

```bash
# Vercel CLI 없으면 설치
npm i -g vercel
vercel --prod
```
옵션: 
- Framework preset: **Vite** 자동 감지
- Root directory: `.`
- Build command: `npm run build` (기본)
- Output directory: `dist` (기본)

배포 URL (예: `https://osaka-phrasebook.vercel.app`) 확인.

- [ ] **Step 8.6: iPhone Safari로 배포 URL 접속 + 홈 화면에 추가**

- [ ] **Step 8.7: 비행기 모드 오프라인 테스트**

iPhone을 비행기 모드 on → 홈 화면 아이콘 실행 → Browse·Study 정상 동작 확인. phrases.json 캐시 검증.

- [ ] **Step 8.8: 커밋 + push**

```bash
git add .
git -c commit.gpgsign=false commit -m "chore: PWA manifest + icons + Service Worker"
git push
```

**Week 1 완료 체크리스트:**
- [ ] iPhone 홈 화면에 아이콘 설치됨
- [ ] 오프라인에서 실행됨
- [ ] 시드 15개 문장 모두 TTS 재생됨
- [ ] 별표·진도가 localStorage에 영속됨
- [ ] Study/Browse/Favorites/Showcase/Settings 5개 라우트 전부 동작

---

## Week 2 — Content + Daily Use (4/19 일 ~ 4/25 토)

### Task 9 (Day 8 · 4/19 일): 80개 컨텐츠 생성 + 검수

- [ ] **Step 9.1: LLM으로 카테고리별 문장 생성**

ChatGPT/Claude에 카테고리별 프롬프트 (10 카테고리 × 목표 수). 예시:
```
한국어 → 일본어(한자) + 가나 + 로마자로, 오사카 3박4일 여행에서 실제 쓸 '식당' 관련 문장 20개 생성.
JSON 배열, 각 항목: { id, ko, ja, kana, romaji, category: "restaurant", priority: 1|2|3 }
priority=1은 20개 중 8개 (꼭 외워야 할 핵심), priority=2는 12개 (필요 시 찾아 쓰기용).
id는 "r-001", "r-002" 식으로 3자리 zero-pad.
```

각 카테고리별로 반복 → 합쳐서 `public/data/phrases.json` 저장.

- [ ] **Step 9.2: 본인 검수**

앱 로컬로 열어두고 전수 재생하며 어색한/필요없는 문장 edit. 컷 기준:
- 일본어가 너무 격식 있거나 어색
- 3박4일에 안 쓸 것 같은 상황
- 비슷한 의미 중복

최종 priority=1 개수가 정확히 30이 되도록 조정.

- [ ] **Step 9.3: 커밋**

```bash
git add public/data/phrases.json
git -c commit.gpgsign=false commit -m "content: full 80 phrases across 10 categories"
git push
```

### Task 10 (Day 9~12 · 4/20~4/23): 매일 학습 + 버그 패치

- [ ] 매일 15~30분 Study 모드 사용
- [ ] 발견한 UX 이슈 당일 커밋 (예: 폰트 크기, 탭 영역, 다크 모드 대비)
- [ ] Week 1 Task 7.8에서 미해결 TTS 이슈 있으면 여기서 처리

### Task 11 (Day 13~14 · 4/24~4/25): 여행 모드 리허설

- [ ] **Step 11.1: 비행기 모드 오프라인 3시간 사용 테스트** — SW 캐시 안정성 확인
- [ ] **Step 11.2: 롤플레이** — 친구와 식당 주문 시뮬레이션, priority=1 30개 체화 점검
- [ ] **Step 11.3: 남은 버그 패치 + 배포** (`git push` → Vercel 자동 배포)

---

## Week 3 — 집중 복습 + 출국 준비 (4/26 일 ~ 4/29 수)

### Task 12 (Day 15~17 · 4/26~4/28): 집중 복습

- [ ] 매일 priority=1 30개 전체 한 번 돌리기 (약 15분)
- [ ] 약한 문장(wrongCount 높은) 따로 드릴
- [ ] 즐겨찾기에 "여행 중 TOP 10" 미리 별표해 두기

### Task 13 (Day 18 · 4/29 수): 출국 전날 체크리스트

- [ ] **Step 13.1: iPhone에서 앱 강제 새로고침** (Settings에 캐시 버전 갱신 버튼 없으면 앱 삭제 후 재설치)
- [ ] **Step 13.2: 비행기 모드 on 상태에서 전 기능 돌리기** — TTS, 별표, Study, Browse 전부 확인
- [ ] **Step 13.3: 백업** — 핵심 문장 10개를 폰 사진첩에 스샷 저장 (앱 문제 대비)
- [ ] **Step 13.4: 폰 배터리·충전 케이블 체크**

---

## Self-Review (플랜 작성 후 점검)

**Spec coverage check:**
- [x] Home/Study/Browse/Favorites/Settings/Showcase 6개 라우트 → Task 2, 3, 4, 5, 6, 7에 매핑
- [x] Phrase/Progress/Settings 타입 → Task 2 (types.ts), Task 5 (store.ts)
- [x] 카테고리 10개·priority 3단계 → types.ts CATEGORIES + 데이터 priority 필드
- [x] Web Speech API TTS (iOS 대응) → Task 7 전체
- [x] Zustand + localStorage → Task 5 store.ts
- [x] Service Worker 오프라인 → Task 8 vite-plugin-pwa
- [x] Vercel 배포 + iPhone 설치 → Task 8 Step 8.5~8.7
- [x] 80개 컨텐츠 → Task 9
- [x] 비행기 모드 검증 → Task 8.7, Task 11.1, Task 13.2
- [x] priority=1 체화 → Task 10~12

**Placeholder scan:** 모든 코드 단계에 실제 코드 포함. "similar to ..." 없음.

**Type consistency check:** `Phrase`, `PhraseProgress`, `Settings`, `CategoryId` 전부 types.ts 단일 출처에서 export. `useStore` 메서드명 (`markKnown`, `markWrong`, `toggleStar`, `resetProgress`, `setSettings`)이 Task 5에서 정의되고 Task 6·7에서 동일 이름으로 사용됨. ✓

**리스크:**
- Task 8.1 아이콘 생성은 외부 도구 의존 — 최악의 경우 단색 PNG로 대체 가능
- Task 7.8 iOS TTS 실패 시 Week 2로 버퍼 이동 (문서화됨)
- Task 9 LLM 생성 품질이 낮으면 priority=2/3 개수 축소

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-12-osaka-japanese-phrasebook-plan.md`.**

**두 가지 실행 옵션:**

**1. Subagent-Driven (recommended)** — Task별로 fresh 서브에이전트 dispatch, 중간 리뷰 포함. 빠른 반복.

**2. Inline Execution** — 이 세션에서 executing-plans로 배치 실행, 체크포인트에서 리뷰.

사용자 요청 "최대한 빨리"를 감안하면 **Inline Execution**이 더 빠를 수 있음 (컨텍스트 재로딩 오버헤드 없음, 연속 커밋 흐름 유지). 다만 Task 7(TTS) 같은 리스크 큰 태스크는 리뷰 게이트 두는 게 안전.
