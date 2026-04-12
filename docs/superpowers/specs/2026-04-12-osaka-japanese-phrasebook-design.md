# 오사카 여행 회화 PWA — 설계 스펙

- **작성일**: 2026-04-12
- **출발일**: 2026-04-30 (D-18)
- **컨텍스트**: 친구 1명과 오사카 3박 4일. 일본어 제로 베이스. 파파고로 읽기 해결, 앱은 "듣고 말하기" 전용.
- **저장소**: `/Users/sukeun/IdeaProjects/japanse-study`

## 1. 한 줄 정의

오사카 3박 4일 여행에서 실제로 쓸 ~80개 문장을 **탭 → 일본어 TTS 재생**으로 반복 학습하고, 여행 중에도 오프라인으로 상황별로 꺼내 쓰는 PWA.

## 2. 목표와 성공 기준

### 학습 목표 (4/30 출발 시점)
- `priority=1` 30개는 앱 안 보고 입으로 나옴 (최소 70%, 21개 이상)
- 나머지 50개는 앱에서 **3초 내 찾아 재생** 가능
- 비행기 모드에서 완전 동작 (SW precache 검증 완료)

### 산출물 기준
- 본인 iPhone Safari에서 "홈 화면에 추가" 후 앱 아이콘으로 실행
- 80개 문장 모두 `ja-JP` TTS 재생 (혹은 확정된 폴백 동작)
- 즐겨찾기·진도 상태가 `localStorage`에 영속

## 3. 범위

### 포함
- 2개 모드: 학습(Study) / 여행(Browse)
- 풀스크린 보여주기 뷰(Showcase) — 점원에게 화면 내미는 용
- 즐겨찾기 (별표)
- 로마자 표시 토글, TTS 속도 조절, 다크 모드
- 오프라인 동작 (Service Worker + localStorage)
- Vercel 배포

### 제외
- 백엔드 서버, DB, 계정 시스템
- 음성 인식·발음 평가
- 사전 녹음 mp3 번들 (Web TTS로 충분, 실패 시 비상안으로만)
- 한자 학습, 문법 설명
- 다국어 (한국어만)
- 커뮤니티·공유
- 자동화 테스트 (MVP 스코프 컷)

## 4. 데이터 모델

### 4.1 Phrase (정적 번들 — `public/data/phrases.json`)

```ts
type Phrase = {
  id: string;              // 안정 ID. "rest-001" 같은 형식
  ko: string;              // "물 좀 주세요"
  ja: string;              // "お水をください" (한자 있으면 그대로)
  kana: string;            // "おみずをください" (TTS 및 읽기용)
  romaji: string;          // "omizu o kudasai"
  category: CategoryId;
  priority: 1 | 2 | 3;
  tags?: string[];
};

type CategoryId =
  | "basics" | "restaurant" | "transit" | "convenience"
  | "hotel"  | "shopping"   | "directions" | "numbers"
  | "emergency" | "kansai";
```

### 4.2 카테고리 구성 (목표치)

| ID | 이름 | 대략 문장 수 |
|---|---|---|
| basics | 인사·기초 | ~8 |
| restaurant | 식당 | ~20 |
| transit | 지하철·JR·택시 | ~12 |
| convenience | 편의점·카페 | ~10 |
| hotel | 호텔 체크인/아웃 | ~6 |
| shopping | 쇼핑·계산 | ~8 |
| directions | 길 묻기·관광 | ~8 |
| numbers | 숫자·금액·시간 | ~6 |
| emergency | 응급·곤란 | ~4 |
| kansai | 칸사이벤 보너스 | ~4 |

합계 목표 **~86개**, 최소 50개 (컨텐츠 지연 시 축소).

### 4.3 Priority 분포 (카테고리와 독립 축)
- **priority=1 (30개 고정)**: 학습 모드 큐의 기본 집합. "무조건 외운다."
- **priority=2 (~46개, 유동)**: 학습 모드 제외, 여행 모드에서만 접근.
- **priority=3 (~10개)**: 보너스·재미 (칸사이벤 등).

Priority는 카테고리와 독립. 예: `restaurant` 카테고리 20개 중 priority=1이 8개, priority=2가 12개일 수 있음. 4.2의 카테고리별 문장 수와 priority 분포는 별개의 축이며, 컨텐츠 생성 단계(4/19)에서 최종 조정.

### 4.4 Progress (사용자 로컬 — `localStorage`)

```ts
type Progress = {
  [phraseId: string]: {
    status: "new" | "learning" | "known";
    starred: boolean;
    wrongCount: number;
    lastSeenAt: number; // Unix ms
  }
};

type Settings = {
  showRomaji: boolean;
  ttsRate: 0.8 | 1.0 | 1.2;
  darkMode: "system" | "light" | "dark";
};
```

## 5. 화면 구조

### 5.1 네비게이션
- 하단 탭 3개: **학습 / 여행 / 즐겨찾기**
- 상단 오른쪽: 설정 아이콘

### 5.2 Home (앱 최초 진입)
- 오사카까지 D-day 카운트다운
- 오늘의 학습 진도 바 (오늘 목표: priority=1 중 10장)
- `[이어서 공부]` CTA
- 전체 진도 (외운 문장 N / 30)

### 5.3 Study (학습 모드)
- 풀스크린 카드 한 장
- 앞면: 한국어. 탭 시 뒤집기 → 일본어(가나) 큰 글씨 + 로마자 + 재생 버튼
- 카드 진입 시 TTS 자동 1회 재생 (설정에서 off 가능)
- 하단 버튼 2개: **[다시]** (큐 재삽입, wrongCount++) / **[알아요]** (known 처리)
- 상단 진도: "3 / 10"
- 큐 소진 시 "오늘 학습 완료" 화면

### 5.4 Browse (여행 모드)
- 상단: 검색 바 + 즐겨찾기 필터 토글
- 가로 스크롤 카테고리 탭
- 카드 리스트: 한국어(크게) / 일본어(중간) / 로마자(작게) / 🔊 / ☆
- 카드 탭 → Showcase 뷰로 확장

### 5.5 Showcase (보여주기 — 여행 필살기)
- 풀스크린, 흰 배경
- 일본어를 화면 폭 ~70%로 거대하게 (60pt+)
- 한국어 작게 상단, 로마자 작게 하단, 큰 재생 버튼 중앙 하단
- 목표: "이 화면을 점원에게 그대로 내밀어도 뜻 전달"

### 5.6 Favorites
- 별표한 문장만. 카테고리 무시, 최근 별표 순 정렬.

### 5.7 Settings
- 로마자 표시 on/off
- TTS 속도 (0.8x / 1.0x / 1.2x)
- 다크 모드 (시스템/라이트/다크)
- 진도 리셋 (확인 다이얼로그)
- 앱 버전 / 캐시 강제 갱신

## 6. 기술 스택

| 영역 | 선택 | 근거 |
|---|---|---|
| 번들러·프레임워크 | Vite + React 18 + TypeScript | 정적 PWA, Next.js 과함 |
| 스타일 | Tailwind CSS | 모바일 유틸 |
| UI 프리미티브 | Radix Primitives (Dialog·Tabs만 선택적) | 필요 시만 |
| 상태 관리 | Zustand + persist 미들웨어 | localStorage 자동 동기화 |
| 라우팅 | react-router v6 (HashRouter) | 정적 호스팅 404 이슈 회피 |
| 아이콘 | lucide-react | 가벼움 |
| PWA | vite-plugin-pwa (Workbox) | manifest + SW precache |
| TTS | Web Speech API | 네이티브, 라이브러리 없음 |
| 데이터 | `public/data/phrases.json` | SW precache |
| 배포 | Vercel | 1-click, 무료 |

### 의존성 크기 (대략)
- 런타임 gzip ~50KB + 문장 JSON ~16KB = 총 **~70KB**

## 7. 디렉토리 구조

```
japanese-study/
├─ docs/superpowers/
│  ├─ specs/2026-04-12-osaka-japanese-phrasebook-design.md
│  └─ plans/2026-04-12-osaka-japanese-phrasebook-plan.md   # (writing-plans에서 생성)
├─ public/
│  ├─ data/phrases.json
│  ├─ icons/             # 192/512/maskable
│  └─ manifest.webmanifest
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ routes/
│  │  ├─ Home.tsx
│  │  ├─ Study.tsx
│  │  ├─ Browse.tsx
│  │  ├─ Favorites.tsx
│  │  └─ Settings.tsx
│  ├─ components/
│  │  ├─ PhraseCard.tsx
│  │  ├─ ShowcaseView.tsx
│  │  ├─ PlayButton.tsx
│  │  ├─ CategoryTabs.tsx
│  │  └─ BottomNav.tsx
│  ├─ lib/
│  │  ├─ tts.ts           # SpeechSynthesis 래퍼
│  │  ├─ store.ts         # zustand (progress + settings)
│  │  ├─ studyQueue.ts    # 학습 큐 로직
│  │  └─ phrases.ts       # 정적 JSON 로더
│  ├─ types.ts
│  └─ styles/globals.css
├─ index.html
├─ vite.config.ts
├─ tailwind.config.js
├─ tsconfig.json
└─ package.json
```

## 8. 핵심 유틸 계약

### 8.1 `lib/tts.ts`
- 앱 마운트 + 사용자 최초 탭 시 "빈 utterance" 말해서 iOS Safari 음성 엔진 깨움
- `speechSynthesis.getVoices()`는 비동기 → `onvoiceschanged` 리스너로 `ja-JP` 음성 선택
- `ja-JP` 없으면 `ja` prefix로 폴백, 둘 다 없으면 토스트로 경고 + 재생 버튼 비활성화
- `speak(text, rate)` 공용 API. `rate`는 Settings에서 주입.

### 8.2 `lib/studyQueue.ts`
- 초기 큐: `phrases.filter(p => p.priority === 1 && progress[p.id]?.status !== "known")`
- `[다시]` 호출 시 큐 끝에 재삽입, wrongCount++
- `[알아요]` 호출 시 큐에서 제거, status=known, lastSeenAt 갱신
- 한 세션 기본 10장 (다 비우면 "오늘 완료")

### 8.3 `lib/store.ts` (Zustand)
- `progress: Progress` + `markKnown(id)`, `markWrong(id)`, `toggleStar(id)`, `resetAll()`
- `settings: Settings` + setter
- `persist` 미들웨어로 `localStorage` key `osaka-phrasebook-v1` 에 저장

## 9. 일정 (18일)

| 기간 | 구간 | 핵심 산출물 |
|---|---|---|
| 4/12 일 ~ 4/18 토 | **Week 1: Build** | 배포된 PWA, iPhone 설치, 시드 문장 15개로 E2E 동작 |
| 4/19 일 ~ 4/25 토 | **Week 2: Content + Study** | 80개 확정, 매일 학습 루프, 오프라인 검증 |
| 4/26 일 ~ 4/29 수 | **Week 3: 집중 복습 + 출국 준비** | priority=1 체화, 출국 체크리스트 |

### Week 1 세부
- 4/12 (오늘): Vite 스캐폴드, Tailwind, 라우팅 stub, 타입 정의
- 4/13: 시드 문장 15개, Home, BottomNav
- 4/14: Browse + CategoryTabs + PhraseCard
- 4/15: Showcase + 별표 + Zustand store
- 4/16: Study + studyQueue + 카드 flip
- 4/17: `lib/tts.ts` + 재생 버튼 배선 (**최대 리스크**)
- 4/18: PWA manifest/SW, Vercel 배포, iPhone 설치 테스트

### Week 2 세부
- 4/19: LLM으로 80개 생성, 1차 검수
- 4/20: 음성으로 전수 재생하며 어색한 표현 수정
- 4/21~4/25: 일 15~30분 학습 모드 사용, 버그 발견 즉시 패치

### Week 3 세부
- 4/26~4/28: priority=1 집중, 친구와 롤플레이
- 4/29: 출국 체크리스트 — 비행기 모드 확인, 폰 준비, SW 최신화, 스샷 백업

## 10. 리스크와 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| iOS Safari TTS 동작 불안정 | 치명 | Day 6 전체를 버퍼로. 실패 시 폴백 1) 사전 녹음 mp3 번들 2) TTS 없이 화면만 보여주기로 전환 |
| 80개 컨텐츠 생성 지연 | 중 | 50개로 축소, 여행 중 부족분 추가 |
| 학습 시간 부족 (평일 바쁨) | 중 | priority=1 30 → 20개로 컷. 체화가 핵심, 숫자 아님 |
| Web TTS 음질 부자연 | 저 | 실사용 테스트 후 필요 시 Azure/ElevenLabs mp3 사전 생성 (v2) |
| Service Worker 캐시 버그 | 중 | 4/29에 버전 강제 갱신 한 번, Settings에 "캐시 지우기" 버튼 |

## 11. 완료 정의 (DoD)

- [ ] iPhone 홈 화면에서 오프라인 실행
- [ ] 80개 문장 (또는 축소 버전) 모두 TTS 또는 폴백으로 재생
- [ ] priority=1의 70%+ 를 앱 없이 말할 수 있음
- [ ] 즐겨찾기 10개 이상 설정
- [ ] 비행기 모드에서 전체 기능 동작 검증

## 12. 결정 로그

- **플랫폼**: PWA (Vite+React) — 스택 익숙함, 배포 즉시, 오프라인 SW
- **TTS**: Web Speech API 우선, mp3 번들은 비상안
- **학습 알고리즘**: SRS 대신 단순 큐 (priority=1 + wrongCount 재삽입) — 18일 스코프
- **컨텐츠 생성**: LLM 일괄 생성 + 본인 검수 (B안)
- **한자 처리**: 표시만, 학습 대상 아님 (파파고가 읽기 담당)
- **저장소**: localStorage만 (IndexedDB 불필요, 예상 <10KB)
- **정렬 정책**: priority=1 → 학습 큐 / 여행 모드 카테고리 내 ID 순 / 즐겨찾기 최근순
