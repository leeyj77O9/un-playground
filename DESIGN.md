## Overview

Un Playground GOAL은 단일 목적의 웹 IDE다 — Un 코드를 작성하고 `Ctrl/⌘+Enter`로 실행한 뒤 결과를 즉시 확인하는 루프 전체가 하나의 카드 안에 담긴다. 페이지는 밝은 뉴트럴 그레이(`#f4f4f4`에 `radial-gradient` 은은한 명암)로 비워두고, 중앙의 `1440px` 화이트 카드(`rounded-[18px]`, `border-black/10`, `shadow 0 22px 65px rgba(0,0,0,0.11)`)만이 떠 있는 구조다. 카드 내부는 상단 헤더(`#fafafa`), 중앙 워크스페이스(좌: 어두운 에디터 `#161616`, 우: 어두운 리절트 `#1c1c1c`), 하단 리미트 바로 구성된다. 이 대비가 곧 브랜드다: 바깥은 종이처럼 밝고, 코드는 어두운 터미널에 갇힌다.

타이포그래피는 이중 체계다. UI 크롬은 `Manrope` 산세리프로 조용히, 코드와 파일명은 `DM Mono` 모노스페이스로 정밀하게. 에디터의 구터·하이라이트·오토컴플리트가 내부에서 미세한 색을 내고, 바깥 크롬은 최대한 절제된 회색·블랙으로 물러난다.

**Key Characteristics:**
- 밝은 페이지(`#f4f4f4` + 2개 radial) 위에 뜬 단일 `18px` 라운드 화이트 카드 — 모든 상호작용은 카드 안에서만 발생
- 헤더 `#fafafa` / 에디터 `#161616`+거터 `#101010` / 리절트 `#1c1c1c` / 리미트 `#fdfcfc` 4-톤 서피스
- `DM Mono` 13px/1.5rem 코드 + `Manrope` UI의 이중 폰트 시스템
- 커스텀 textarea + `highlightUnSource` 오버레이 하이라이트 — 에디터 자체는 `text-transparent caret-[#f3f3f3]`
- `rounded-xl` pill 액션 그룹(`bg-black/[0.055]`)과 단독 `API`, 프라이머리 `Run(#111)`의 3단 헤더 액션 계층
- `ResizablePanelGroup` 660px 워크스페이스, 모바일에서는 에디터/리절트가 세로 스택으로 전환

## Colors

> **Source:** `GOAL.zip` → `client/src/pages/Home.tsx` + `client/src/index.css` + `client/src/lib/playground.ts`

### Page & Card
- **Page** (`{colors.page}` — `#f4f4f4`): 전체 배경. 고정 `radial-gradient(circle at 16% 0%, rgba(0,0,0,0.07), transparent 27rem)` + `radial-gradient(circle at 88% 10%, rgba(0,0,0,0.04), transparent 25rem)` 오버레이.
- **Card** (`{colors.card}` — `#ffffff`): 중앙 컨테이너. `border 1px solid rgba(0,0,0,0.10)`, `rounded 18px`, `shadow 0 22px 65px rgba(0,0,0,0.11)`.
- **Header** (`{colors.header}` — `#fafafa`): 카드 상단 바. `border-b rgba(0,0,0,0.10)`.
- **Header File Icon** (`{colors.fileIconBg}` — `#e9e9e9`, `{colors.fileIconFg}` — `#343434`): 28×28 `rounded-lg` 파일 아이콘 배경.

### Editor
- **Editor Bg** (`{colors.editorBg}` — `#161616`): 좌측 워크스페이스 전체.
- **Gutter Bg** (`{colors.gutterBg}` — `#101010`): 56px 라인넘버 컬럼. `border-r rgba(255,255,255,0.07)`, 텍스트 `#747474`.
- **Editor Text** (`{colors.editorFg}` — `#e8e8e8`): 기본 코드 색.
- **Caret** (`{colors.caret}` — `#f3f3f3`): textarea caret.
- **Selection** (`{colors.selection}` — `rgba(255,255,255,0.20)`): 선택 영역.

### Syntax Highlight (Un)
- **Keyword** (`{colors.syntaxKeyword}` — `#c792ea` bold): `fn, class, use, if, elif, else, match, for, while, break, skip, return, in, is, and, or, xor, not, go, wait, defer, using, try, none, _, true, false` (`{typography.mono}` 13px)
- **Function** (`{colors.syntaxFunction}` — `#82aaff` semibold 600): `fn` 뒤 정의명 + `(` 앞 식별자.
- **Variable** (`{colors.syntaxVariable}` — `#d6deeb`): 일반 식별자.
- **String** (`{colors.syntaxString}` — `#c3e88d`): `"`/`'`/`\`` 감싼 문자열.
- **Number** (`{colors.syntaxNumber}` — `#f78c6c`): 정수/실수.
- **Comment** (`{colors.syntaxComment}` — `#7f8792` italic): `#` 이후.
- **Error Overlay** (`{colors.syntaxErrorBg}` — `rgba(224,83,83,0.14)`, `{colors.syntaxErrorFg}` — `#ffc3c3`, `{colors.syntaxErrorUnderline}` — `#ef6262` wavy 1.5px): 인라인 `findUnInlineSyntaxDiagnostic` / `parseUnSyntaxDiagnostic` 범위.

### Result
- **Result Bg** (`{colors.resultBg}` — `#1c1c1c`): 우측 패널 전체. `text-white`.
- **Result Header** (`{colors.resultHeaderBorder}` — `rgba(255,255,255,0.10)`): 44px 헤더.
- **Result Empty** (`{colors.resultEmpty}` — `rgba(255,255,255,0.40)`): `Waiting for output`.
- **Stdout** (`{colors.stdoutBg}` — `rgba(0,0,0,0.15)`, `{colors.stdoutFg}` — `#f2f2f2`): `rounded-lg p-3 font-mono text-xs`.
- **Diagnostic Label** (`{colors.diagnosticLabel}` — `#cb8f8f` 10px uppercase tracking 0.12em): `diagnostic`.
- **Diagnostic Body** (`{colors.diagnosticBg}` — `#241315`, `{colors.diagnosticBorder}` — `#5c2528`, `{colors.diagnosticFg}` — `#e1a5a5`): 에러 본문.

### Console Tones
- **Success** (`{colors.toneSuccess}` — `border-white/15 bg-white/7`): `Result` 실행 완료 배너 없음, `stdout`만 표시.
- **Error** (`{colors.toneError}` — `border-[#6d292d] bg-[#2a1516] text-[#e4aaaa]`): `⚠ {label}` 배너.
- **Warning/Timeout**는 동일 에러 톤을 재사용, `timed_out`도 `warning`으로 매핑.

### Accent & Status
- **Primary Run** (`{colors.runBg}` — `#111`, `{colors.runBgHover}` — `#303030`, `{colors.runShadow}` — `0 4px 0 rgba(0,0,0,0.22)`): 헤더 프라이머리 CTA. 실행 중 `Cancel`은 `bg-[#353535]`.
- **API Ghost** (`{colors.apiFg}` — `#414141`, `hover:bg-black/[0.055]`): 세컨더리 액션.
- **Pill Group Bg** (`{colors.pillBg}` — `rgba(0,0,0,0.055)`): `Import/Copy/Export` 3개를 감싸는 `rounded-xl p-1` 컨테이너. 내부 버튼은 `hover:bg-white`.
- **Limits Bar** (`{colors.limitsBg}` — `#fdfcfc`, `{colors.limitsFg}` — `#5d5d5d`): 카드 최하단 `h-8` 보더.
- **Status Subtle** (`{colors.muted}` — `#747474`): `Ctrl + Enter` 힌트, 라인 카운트.
- **Warning Char Count** (`{colors.charCountWarning}` — `#000` semibold): `>12,000` 시 `text-black`.

## Typography

### Font Family
- **UI Sans** — `Manrope`, `ui-sans-serif`, `system-ui` : 헤더, 버튼, 리절트, 다이얼로그. weights 400/500/600/700.
- **Mono** — `DM Mono`, `ui-monospace`, `SFMono-Regular`, `Menlo`, `monospace` : 코드 에디터, 파일명, 라인넘버, 오토컴플리트, 진단, 콘솔. weights 400/500.
- **Serif** (`{typography.serif}`) — `DM Serif Display`, `Georgia`, `serif` : 현재 미사용, 향후 마케팅 헤드라인 예약.

### Hierarchy
| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `{typography.mono12}` | 12px | 400 | 1.5rem (24px) | 에디터 본문, 거터, 오토컴플리트 라벨·프리뷰 |
| `{typography.mono11}` | 11px | 400/600 | 1.2 | 헤더 char count, `diagnostic` 라벨, 오토컴플리트 detail |
| `{typography.mono10}` | 10px | 400/600 | 1.2 | 오토컴플리트 타입 힌트 `Expected type ·`, `Returns ·`, `→ returnType` |
| `{typography.sans12}` | 12px | 500 | 1 | 헤더 버튼 `Import/Copy/Export/API`, 타이틀 `main.un` |
| `{typography.sans11}` | 11px | 400 | 1 | `Ctrl + Enter` 힌트, 파일 아이콘 캡션 |
| `{typography.status10}` | 10px | 400 | 1 | 리미트 바 `Limits: ...` |
| `{typography.result12}` | 12px | 400 | 1.5rem | 리절트 stdout/diagnostic 프리 `text-xs leading-6` |
| `{typography.buttonRun}` | 12px | 600 | 1 | `Run` / `Cancel` — `h-10 px-4 rounded-xl` |

### Principles
UI는 `Manrope`가 조용히, 코드는 `DM Mono`가 정밀하게. 에디터는 `text-transparent` textarea 위에 `code-editor-highlight` 프리뷰를 겹쳐 `white-space:pre`로 동일한 줄바꿈을 유지한다. 키워드는 보라+bold로 가장 강하게, 함수는 파랑+semibold로 두 번째, 변수·문자열·숫자는 낮은 채도로 구분한다. 에러는 배경 하이라이트 + wavy underline으로 코드 위에서 직접 터진다.

## Layout

### Spacing System
- **Base unit:** 4px (Tailwind 기본). 카드 내부 패딩은 16px(`p-4`) / 20px(`px-5 py-3`) 단위.
- **Tokens:** `px-5`(20px) 페이지 좌우, `pt-8`(32px) 상단, `pb-8`(32px) 하단, `gap-3`(12px) 헤더 액션, `gap-0.5`(2px) pill 내부, `p-1`(4px) pill 패딩, `h-7`(28px) 파일 아이콘, `h-8`(32px) 에디터 하단 바, `h-11`(44px) 리절트 헤더, `h-[628px]` 에디터 본체, `h-[660px]` 패널 전체.

### Grid & Container
- **Outer:** `min-h-screen bg-[#f4f4f4]` + 고정 radial 레이어. 콘텐츠는 `mx-auto max-w-[1440px] px-5 sm:px-8`.
- **Card:** 단일 섹션. 데스크톱에서 `ResizablePanelGroup` 50:50 (`min 28 / max 70` vs `min 30 / max 72`), 핸들 6px `#e8e8e8`.
- **Mobile:** `lg:hidden` 스택 — 상단 `EditorPanel` 660px + `border-b`, 하단 `ResultPanel` 660px. `ResizablePanelGroup`은 `!hidden lg:!flex`로 숨김.

### Whitespace Philosophy
바깥은 넉넉한 회색 여백으로 카드를 띄우고, 카드 안은 빽빽한 코드 밀도로 채운다. 에디터 패딩 `px-5 py-5`, 거터 `px-4 py-5`, 리절트 `p-4`로 동일한 20px 리듬을 유지. 헤더와 워크스페이스 사이에는 `border` 한 줄만으로 구분한다.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Page | `bg-[#f4f4f4]` + 2 radial gradients (transparent) | 페이지 배경 — 깊이 없음 |
| 1 — Card | `bg-white border-black/10 rounded-[18px] shadow 0 22px 65px rgba(0,0,0,0.11)` | Playground 컨테이너 — 유일하게 떠 있는 서피스 |
| 2 — Header | `bg-[#fafafa] border-b black/10` | 카드 내부 상단 바 — 카드보다 한 톤 어두워 구분 |
| 3 — Editor | `bg-[#161616]` | 좌측 코드 영역 — 카드 안에서 가장 깊게 꺼진 서피스 |
| 4 — Result | `bg-[#1c1c1c]` | 우측 콘솔 — 에디터와 동일 톤이지만 헤더/보더로 분리 |
| 5 — Overlay | `bg-[#242424]/0.98 border-white/12 shadow 0 14px 34px rgba(0,0,0,0.42) backdrop-blur-sm` | 오토컴플리트 드롭다운 — 카드 위로 뜨는 유일한 오버레이 |

그림자는 카드 하나에만 사용한다. 그 외 깊이는 배경 명도 차이와 `1px border`로만 표현한다.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.card}` | 18px | 카드 컨테이너 |
| `{rounded.pill}` | 12px (`rounded-xl`) | `Import/Copy/Export` pill 그룹, `Run` 버튼 |
| `{rounded.icon}` | 8px (`rounded-lg`) | 파일 아이콘 28×28 |
| `{rounded.input}` | 8px (`rounded-lg`) | API Sheet 검색 인풋, 오토컴플리트 컨테이너 |
| `{rounded.dialog}` | 12px | Export 다이얼로그 |
| `{rounded.console}` | 8px (`rounded-lg`) | 리절트 stdout/diagnostic 프리, 오토컴플리트 프리뷰 |

`rounded-full`은 사용하지 않는다.

## Components

### Header
- **Container:** `flex justify-between border-b bg-[#fafafa] px-4 sm:px-5 py-3`. 좌측: `📄` 아이콘 + `main.un` mono 12px semibold `#303030` + `12,000` char count 11px `#777` (over-limit 시 `text-black` semibold). 우측: pill 그룹 + `API` ghost + `Run` primary.
- **Pill Group:** `flex gap-0.5 rounded-xl bg-black/[0.055] p-1` 내부 `h-8 px-2.5 text-xs #414141` 버튼 3개. hover 시 `bg-white`.
- **Run:** `h-10 px-4 rounded-xl bg-[#111] text-white text-xs font-semibold shadow 0 4px 0 rgba(0,0,0,0.22)` + `hover:bg-[#303030]` + `active:translate-y-px scale-[0.98] shadow-none` + `▶` 아이콘. `disabled: opacity 0.5 cursor-not-allowed` (over-limit). `Cancel`은 `bg-[#353535]`.

### SourceEditor
- **Layout:** `flex h-[628px] bg-[#161616] font-mono text-[13px] leading-6` — 좌 56px 거터 + 우 에디터.
- **Gutter:** `w-14 border-r border-white/7 bg-[#101010] text-right text-[#747474] select-none overflow-hidden` + `pre px-4 py-5` + `translateY(-scrollTop)` 싱크.
- **Highlight:** `absolute inset-0 px-5 py-5 whitespace-pre` + `code`에 `dangerouslySetInnerHTML`로 `highlightUnSource` 주입. 스크롤 시 `translate(-scrollLeft, -scrollTop)` 싱크.
- **Textarea:** `absolute z-10 w-full h-full bg-transparent px-5 py-5 text-transparent caret-[#f3f3f3] outline-none selection:bg-white/20` + `tabSize 4` + `wrap off`. `disabled:cursor-wait`.
- **Autocomplete:** `absolute z-20 w-72 rounded-lg border-white/12 bg-[#242424]/0.98 py-1 shadow backdrop-blur` — `left/top`은 `cursorColumn*7.83 - scrollLeft +20` / `cursorLine*24 - scrollTop +24`로 계산, 상단 공간 부족 시 위로 열림. 각 옵션은 `keyword:#d4a4f4 / function:#9fc4ff / argument:#f4c98a / variable:#dce9f7` 색, 선택 시 `bg-[#3b506f]`. 프리뷰 박스 `bg-black/15`에 `description`, `Expected type ·`, `Returns ·`, `example` 표시.

### EditorPanel
- **Wrapper:** `h-[660px] lg:h-full flex-col border-b lg:border-b-0`. 상단 `SourceEditor` + 하단 바 `flex h-8 justify-between border-t bg-[#fafafa] px-5 text-[11px] text-[#747474]` — 좌 `⌨ Ctrl/⌘+Enter to run`, 우 `N lines`.

### ResultPanel
- **Container:** `grid grid-rows-[44px_minmax(0,1fr)_32px] bg-[#1c1c1c] text-white h-[660px] lg:h-full`.
- **Header:** `flex h-11 justify-between border-b border-white/10 px-4` — 좌 `▣ Result text-xs font-semibold`, 우 `⏱ durationMs` + `⧉ Copy` (`copied ? ✓ : ⧉`).
- **Body:** `overflow-y-auto p-4` — `isRunning` 시 `running-ring` 스피너 + `Running`, `cancelled` 시 `Execution cancelled`, `presentation` 시 `⚠ label` 배너(`border-[#6d292d] bg-[#2a1516]`) + `stdout` 프리 + `diagnostic` 섹션, 빈 상태 `Waiting for output` (`text-white/40`).
- **Limits:** `flex h-8 border-t bg-[#fdfcfc] px-4 text-[10px] text-[#5d5d5d]` — `Limits: 12,000 chars · 1.5 sec · 16,000 chars output`.

### ApiSearchPanel (Sheet)
- **Overlay:** `fixed inset-0 bg-black/25 flex justify-end z-50`.
- **Sheet:** `w-full max-w-[440px] bg-[#f8f8f8] border-l flex-col`. 헤더 `bg-white p-5 border-b`, 타이틀 `📖 Native API`, 설명 12px `#696969`, 검색 `h-10 rounded-lg border-black/12 bg-[#fafafa] px-3` + `⌕` + `input mono text-xs`.
- **Body:** 좌 `nav w-[132px] bg-[#f1f1f1] border-r p-3` — `All APIs` + 모듈 버튼들 (`bg-white` 선택). 우 `p-3` — 선택 함수 `ApiFunctionDetails`(`bg-[#222] rounded-xl p-4` + `returns` 배지), `N results` 라벨, 함수 카드 `rounded-lg border p-3` (선택 시 `bg-[#eaf0fa] border-[#8da7d0]`).

### Export Dialog
- **Overlay:** `fixed inset-0 bg-black/35 grid place-items-center p-4 z-50`.
- **Content:** `max-w-md bg-white rounded-xl border-black/10 p-5` — 타이틀 16px semibold, 설명 12px, `File name` 라벨 + `h-10 rounded-md border px-3 font-mono` 인풋, 에러 12px `#8b3030`, 푸터 `Cancel` outline + `Download` `bg-[#1d1d1d]`.

## Do's and Don'ts

### Do
- 외부는 `#f4f4f4` 한 톤으로 비워두고 카드 하나에만 그림자를 준다.
- 에디터는 `#161616` + `#101010` 거터로 가장 어둡게, 코드는 `DM Mono`로만 렌더한다.
- 키워드 보라/bold, 함수 파랑/semibold, 변수/문자열/숫자는 낮은 채도로 구분한다.
- `Import/Copy/Export`는 반드시 `rounded-xl` pill로 묶고 `API`는 분리한다.
- `Run`은 `#111` 다크 프라이머리로, 다른 버튼과 즉시 구분되게 한다.
- 오토컴플리트는 `w-72` 다크 카드로 에디터 위에 띄우고, 키보드 `↑↓ Enter Esc`로 조작 가능하게 한다.
- 에러는 코드 위에 `wavy underline` + 리절트 `diagnostic` 박스로 구조화한다.

### Don't
- 페이지 배경에 강한 그라데이션/블러/노이즈를 넣지 않는다 — radial은 7% / 4% 투명으로만.
- 카드에 18px 이외의 라운드를 섞지 않는다.
- 에디터 배경을 `#000` 순수 블랙으로 만들지 않는다.
- 모든 버튼을 프라이머리처럼 보이게 하지 않는다 — pill 그룹은 고스트로 유지한다.
- 리절트를 밝게 만들거나 에디터보다 시각적으로 지배하게 하지 않는다.
- 사스 대시보드처럼 카드·차트·아이콘을 남발하지 않는다.

## Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| mobile | <1024px | 카드 `ResizablePanelGroup` 숨김(`!hidden`), 대신 `lg:hidden` 스택 — 에디터 660px + 리절트 660px 세로로 쌓임 |
| desktop | 1024px+ | `ResizablePanelGroup` 50:50 (`min 28/30 max 70/72`) + 6px 핸들, `!flex` |

### Collapsing Strategy
- **Header:** `sm:inline`으로 `char count`/`Import` 라벨이 좁은 화면에서 숨김 (아이콘만 남음).
- **Pill Group:** `gap-0.5 p-1` 유지, 모바일에서도 3개 버튼 유지.
- **Editor:** `px-5` 유지, 거터 `w-14` 고정.
- **Fonts:** `Manrope`/`DM Mono` 모두 시스템 폴백 후 로드.

## Iteration Guide

1. 헤더 → 에디터 → 리절트 순으로 한 컴포넌트씩 완성한다.
2. 토큰/컴포넌트 이름은 코드와 `playground.ts`(`highlightUnSource`, `getUnAutocompleteCandidates` 등)와 1:1로 매칭한다. 파라프레이즈하지 않는다.
3. 새 컴포넌트 추가 전 기존 `rounded-xl` + `bg-[#161616]` + `DM Mono` 어휘로 표현 가능한지 검토한다.
4. `un-syntax-*` 클래스의 색상은 `index.css`에서만 관리한다.

## Known Gaps

- `monaco-editor` 기반 VS Code 스타일 에디터(이전 구현)와 현재 `textarea + highlight` 에디터는 시각적으로 동등하나 내부 구현이 다름 — 전자는 `occurrencesHighlight`/`bracketPairColorization`을 네이티브로 제공하고, 후자는 `tokenizeUnSource` 수동 토크나이징을 사용한다.
- `ResizableHandle`의 `withHandle` 드래그 시각 효과는 현재 `div` 핸들로 단순화됨 — 원본 `shadcn/resizable`의 `data-resize-handle-state` 연동은 생략.
- `Native API` 카탈로그는 정적 `STATIC_NATIVE_FUNCTIONS` 하드코딩 — GOAL의 `trpc.nativeCatalog` 동적 조회와 달리 런타임에 추가된 모듈은 반영되지 않음.

