# PROJECT_CLEANUP_REPORT

> 작업일: 2026-11-10
> 대상: `un-playground` 저장소 (Un Playground — 브라우저 내 Un 인터프리터 플레이그라운드)
> 브랜치: `main` (작업 시작 시 미커밋 변경분 선행 존재: 자동완성·시그니처 도움말·WASM 재빌드)
> 커밋: 하지 않음 — 모든 변경은 워킹트리에 미스테이징 상태로 남겨두었습니다. 검토 후 직접 커밋하세요.

---

## 1. 프로젝트 현황

### 기존 구조
- `Un.Playground.Wasm/` — Blazor WebAssembly 호스트. JS↔.NET interop(`[JSExport]`)로 Un 인터프리터를 브라우저에 노출. 배포 산출물(`_framework`)을 `web/public/_framework/`에 커밋해 Vercel에서 dotnet 빌드 없이 서빙하는 구조.
- `web/` — Vite + React 18 프런트엔드. 왼쪽 코드 에디터 / 오른쪽 터미널 분할 UI, `@tailwindcss/vite` 사용.
- `vercel.json` — `npm run build --prefix web` → `web/dist` 배포.

### 주요 문제점
- `_framework`에 **RC 시절 빌드 잔여물 414파일(36MB)** 이 커밋되어 있고, 최소 호스트화 이후 정말 필요한 파일은 102파일(13MB).
- Blazor **템플릿 기본 앱**(Counter/Weather/NavMenu/샘플 데이터 등)이 실제 사용 없이 남아 있음. interop 전용 최소 호스트로 축소 가능.
- **사용되지 않는 WASM interop API**(`GetHoverInfo`, `GetModuleMembers`, `GetVersion`, `GetBuiltinTypes`, `Diagnose`)가 JS에 호출되지 않은 채 유지됨 (자동완성/진단 기능 제거 후 잔재).
- `playground.ts`에 **미사용 export 약 20개 이상** — API 브라우저·인자 후보·페어 자동닫기·구문 진단 등 이전 기능의 잔재. (`UnNativeApiModule`, `searchUnNativeFunctions`, `KEYWORD_PREVIEWS`, `applyUnPairedCharacterEdit`, `findUnInlineSyntaxDiagnostic` 등, 전체 목록은 §2 참조)
- 미사용 npm 패키지(animejs, lucide-react, tailwindcss, @tailwindcss/vite, tw-animate-css) — Tailwind는 유틸리티 클래스 사용 **0건**인데 전체 CSS 파이프라인에 포함.
- `.vs/` IDE 캐시, 빌드 로그, `.DS_Store`, `dist/` 잔재 등이 추적/잔존.
- **버그**: 인터랙티브 입력 EOF 종료(⌘/Ctrl+Enter)가 동작하지 않음 (`SetAllowEof` interop을 JS가 호출하지 않음).
- **버그/보안**: 프로그램 출력과 사용자 입력이 `dangerouslySetInnerHTML`에 **이스케이프 없이** 주입됨 (`write("<b>x</b>")` → 실제 `<b>` 요소 생성). 또한 입력 줄 dim 처리가 누락되어 입력/출력 구분 요건 미충족.

### 개선 방향
- 배포 페이로드 최소화(빌드 산출물만 유지) → 저장소 크기·배포 시간 단축.
- interop 표면(JS→WASM)과 TS 라이브러리 API 표면을 **실제 호출되는 것만** 유지.
- 죽은 코드/스타일/의존성 제거, 명백한 버그 수정, 기능 동작 보존.

---

## 2. 제거된 항목

### 파일 및 폴더 (추적 해제/삭제, 335개)
| 항목 | 이유 |
|---|---|
| `Un.Playground.Wasm/App.razor`, `_Imports.razor`, `Layout/{MainLayout,NavMenu}.razor(.css)`, `Pages/{Counter,Home,Weather,NotFound}.razor`, `wwwroot/{index.html,favicon.png,icon-192.png,css/app.css,sample-data/weather.json}` | Blazor 템플릿 기본 앱. 이 프로젝트는 Blazor **UI 없이** `[JSExport]` interop만 사용 (웹앱은 자체 `index.html`을 로드). `Program.cs`를 interop 최소 호스트로 축소하고 publish 검증 완료 |
| `Un.Playground.Wasm/.vs/**` (5파일) | Visual Studio 로컬 캐시(`.suo`, `.dtbcache`, vsidx 등). 사용자 작업물이 아닌 IDE 생성물 |
| `web/build.log`, `web/build_output.txt`, `web/vite.log` | 빌드 로그. `*.log`는 `.gitignore` 대상이었으나 추적/잔존해 있던 것 |
| `web/dist/` (로컬 산출물, 미추적, 삭제) | gitignore 대상, 재생성 가능 |
| `.DS_Store` ×2 | OS 부산물. `.gitignore`에 `.DS_Store` 추가 |
| `web/public/_framework/{Un,Un.Playground.Wasm}.pdb(.gz)`, `dotnet.js.map(.gz)`, `dotnet.runtime.js.map(.gz)` | 릴리스 배포에 불필요한 디버그 심볼/소스맵 |
| `web/public/_framework/*` 312파일 (414→102) | **RC/로컬 publish 잔재**. 최소 호스트로 재빌드 후 실제 필요한 102파일(13MB)만 유지. vercel이 dotnet을 빌드하지 않아 `web/public/_framework`는 배포 산출물이므로 저장소에 유지 |

### 코드 (TypeScript — `web/src/lib/playground.ts`, 1221→1075줄)
| 항목 | 이유 |
|---|---|
| `createUnExportFilename`, `hasUnexportedSourceChanges`, `normalizeUnExportFilename`, `validateImportedUnFile` | 파일 내보내기/가져오기 기능 제거 후 잔재. 외부 참조 0건 |
| `UnNativeApiModule`, `formatUnNativeModule`, `getUnNativeApiModules`, `searchUnNativeFunctions` | 네이티브 API 브라우저 UI용 잔재. 참조 0건 |
| `KEYWORD_PREVIEWS`, `getUnAutocompletePreview`, `getUnAutocompleteTypeHint`, `getUnNativeCandidate`, `BUILTIN_TYPE_INFO`, `setBuiltinTypeInfo` | 이전 툴팁/문서 프리뷰 후보군 구현 잔재. 외부 참조 0건 (프리뷰 패널 미구현/제거) |
| `extractUnFunctionParameters`, `getUnFunctionArgumentCandidates` | 인자 자동완성 잔재 (인자 후보는 시그니처 도움말이 대체). 참조 0건 |
| `getUnCallContext` (래퍼) | 호출부 0건 (내부는 `findUnCallContext`만 사용). 타입 `UnCallContext`는 유지 |
| `getUsedNativeModules` | `getUnObjectMethodCandidates` 등이 `getUsedNativeModuleMap`을 직접 사용. 호출 0건 |
| `UnEditorTextEdit`, `PAIR_CLOSERS`, `CLOSING_CHARACTERS`, `applyUnPairedCharacterEdit` | 괄호 자동닫기 잔재. 참조 0건 |
| `UnSyntaxDiagnostic`, `createUnSyntaxDiagnostic`, `findUnInlineSyntaxDiagnostic`, `parseUnSyntaxDiagnostic` + `highlightUnSource`의 `syntaxDiagnostic` 매개변수 + `.un-syntax-error` CSS | 에디터 내 인라인 오류 밑줄 기능 잔재. 전달하는 호출부 0건 |
| `PLAYGROUND_STORAGE_KEYS.lastExportedSource`, `.stdin` | 사용 0건. `.source`만 유지 |

내부 전용 헬퍼(`getUsedNativeModuleMap`, `getBareImportMap`, `getUnSignatureHelpContext`, `getUnExpressionType`, `getUnSimpleExpressionType`, `getUnInferredSymbolTypes`, `extractUnFunctionSignatures`, `extractUnFunctionReturnTypes`, `extractUnSourceSymbols`, `extractUnClassNames`, `extractUnClassMethods`, `tokenizeUnSource`, `getUnCallContext`, `UnSignatureHelpContext`, `NATIVE_TYPE_FOR_MODULE` 등)는 `export` 제거로 모듈 외부 API 표면 최소화.

### 코드 (C# — `Un.Playground.Wasm/UnInterop.cs`, 318→172줄)
| 항목 | 이유 |
|---|---|
| `GetHoverInfo`, `GetModuleMembers`, `FindBuiltinType` | 호버/멤버 정보 API — 프런트엔드에서 호출 0건 (자동완성 제거 후 잔재) |
| `GetBuiltinTypes` | 소비처인 `setBuiltinTypeInfo`(playground.ts) 제거. JS에서 호출 0건 |
| `Diagnose` | 에디터 내 진단 기능 잔재. 호출 0건 |
| `GetVersion` | 버전 문자열 interop. 호출 0건 |

### 코드 (CSS — `web/src/index.css`, 11,098→9,811 bytes / 빌드 CSS 12.82KB→6.66KB)
- `.un-syntax-error`, `.terminal-stdin-line`, `.un-syntax-bracket`(bare) — 참조 0건.
- `@import "tailwindcss"` + tailwind preflight 제거. 유틸리티 클래스 사용 0건 확인.
- 나머지 클래스(`.autocomplete-item`, `.signature-help-*`, `.un-syntax-*`)는 실제 사용 확인 후 유지.

### npm 패키지 (web)
| 제거 | 여유 용량/이유 |
|---|---|
| `animejs` | import 0건 |
| `lucide-react` | import 0건 (아이콘 UI 제거 후 잔재) |
| `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css` | 유틸리티 클래스 사용 0건 |

→ `dependencies`: react, react-dom만 유지 / `devDependencies`: vite, typescript, @vitejs/plugin-react, @types/*.

### interop 버그 수정 (동작 복구)
`web/src/main.tsx`의 `executeRun`이 `allowEof=true`를 받아도 WASM의 `SetAllowEof`를 호출하지 않아, 입력 대기 중 ⌘/Ctrl+Enter로 EOF 종료(종료 신호)를 보낼 수 없었음. `SetAllowEof(allowEof ? 'true' : 'false')`를 `Run` 이전에 호출하도록 수정.
검증: EOF 비허용 → `io.read()`가 `needsInput:true` 반환(입력 대기 유지), EOF 허용 → `needsInput:false`로 정상 종료 확인.

### 보안/요구사항 수정
`renderTranscript`가 프로그램 출력과 사용자 입력을 **이스케이프 없이** `dangerouslySetInnerHTML`에 주입 → 임의 HTML 실행(자기 XSS) 가능. `escapeHtml` 도입, 출력/입력 모두 이스케이프. 입력 줄은 `<span class="terminal-transcript-input">` (dim)로 렌더해 입력/출력 구분 요건 충족.
검증: `io.write("<b>not-bold</b>")` → `<b>` 요소 0개 생성, 리터럴 텍스트로 표시. 입력 `<b>kim</b>` → dim span 안에 `&lt;b&gt;kim&lt;/b&gt;`로 표시.

### 부수 버그
- `main.tsx` 서비스 에러 경로에서 `stdout: transcript`(stale state) → `stdout: ''`.
- `playground.ts` `highlightUnSource` — 제거한 `offset` 잔여 참조로 빌드 오류 → 정리.

---

## 3. 통합된 항목

| 통합 전 | 통합 후 | 비고 |
|---|---|---|
| `getCallContext` 래퍼(`getUnCallContext`) + 내부(`findUnCallContext`) | `findUnCallContext` 하나만 남기고 외부 래퍼 제거, `getUnSignatureHelpContext`는 `{functionName, argumentIndex, qualifier}`를 한 번에 반환 | 중복 경로 1개 축소 |
| 문자열 내부 판정 2회 구현 가능성(콤마 마스크 / prefix 판정) | `isUnInsideString(source, cursor)`로 단일화. `buildUnStringMask`는 괄호/콤마 계산용으로만 유지 | 자동완성·시그니처 도움말·dot completion이 같은 판정 사용 |
| `applyUnAutocompleteCandidate` + 드롭다운 삽입 로직(인라인 슬라이스) | 후보 수락 경로를 `applyUnAutocompleteCandidate`로 일원화 (기존에도 공유했으나 드롭다운 렌더러와 직접 결합되어 있던 부분 정리) | `handleTextChange` → `refreshAutocomplete` 단일 진입점 |
| `updateSignatureHelp` / `applyCandidate` 내 캐럿 위치 계산 중복 | `measureCaret` → `positionPopups`(드롭다운/도움말 스택 배치) → `updateSignatureHelp`로 일원화 | 스크롤/키보드 이동/수락 후 재계산이 동일 경로 |

---

## 4. 구조 개선

### WASM 호스트 (`Un.Playground.Wasm/`)
- Blazor 템플릿 앱 → **`[JSExport]` interop 전용 최소 호스트**로 전환. `Program.cs`는 `WebAssemblyHostBuilder`만 실행.
- interop 표면 10개 → 5개: `InitPromptHandler`, `SetAllowEof`, `GetAllNativeFunctions`, `SetStdin`, `Run`.
- 배포 페이로드: `_framework` **414파일/36MB → 102파일/13MB** (출처: `bin/Release/net8.0/publish/wwwroot/_framework`, `.br` 제외 — `.gz`는 기존 배포와 동일하게 유지).

### TS 라이브러리 (`web/src/lib/playground.ts`)
- 세 가지 책임만 남음: (a) 소스 토큰화/하이라이트, (b) 분석(자동완성·시그니처 도움말·타입 추론), (c) 실행 결과 표현(`presentExecution`).
- 파일 입출력/진단/엔진용 죽은 층 제거. 내부 전용 함수는 `export` 제거로 API 표면 최소화.

### 정리된 모듈 책임
- `useWasm.ts` — WASM 로딩 + 네이티브 카탈로그 주입만 담당. 디버그용 `GetBuiltinTypes` 제거, `wasmReady` 반환값 제거(`window.wasmReady`로 충분, 미사용).
- `main.tsx` — 에디터/터미널/분할 UI만. 문자열 마스크 도입 이후 **파이프라인 진입점이 `handleTextChange` 하나**로 수렴.

### 제거된 불필요한 추상화
- "export 된 것 ≠ 외부 사용" 패턴 — 인라인/내부 전용 export 약 22개 제거.
- `syntaxDiagnostic` 옵셔널 매개변수(호출부 0건) → `highlightUnSource(source)`로 단순화.

---

## 5. 성능 및 유지보수 개선

| 항목 | 변경 전 | 변경 후 | 효과 |
|---|---|---|---|
| `_framework` 배포 크기 | 36MB / 414파일 | 13MB / 102파일 | Vercel 업로드·CDN cold start 단축 |
| 빌드된 CSS | 12.82KB (gzip 3.72KB) | 6.66KB (gzip 2.11KB) | Tailwind preflight 제거 |
| `playground.ts` | 1,221줄 / export 52개 | 1,075줄 / export 21개 | 탐색 비용 감소 |
| `UnInterop.cs` | 318줄 / JSExport 10개 | 172줄 / 5개 | interop 표면 축소 |
| npm 패키지 | deps 4 / devDeps 8 | deps 2 / devDeps 4 | 설치 시간·공급망 표면 축소 |
| git 추적 파일 | 456개 | (이 변경 커밋 시) 약 121개 | 추적 크기 대폭 감소 |

실측: `vscode --diff` 없이 토큰 단위 공통 문자열 사용 — 기능 동작 동일(아래 §6).

---

## 6. 검증 결과

### 빌드/타입
- `cargo`/컴파일러 대응: `dotnet publish -c Release` → **성공** (경고만, error 0)
- `tsc --noEmit` → **통과**
- `npm run build` → **통과** (`dist` gitignore 확인)

### 브라우저 회귀 (`http://127.0.0.1:5173/`, 콘솔 에러 0건)
- 기본 실행: `io.write("Hello, World!")` → 출력 확인 (최소 호스트 WASM도 정상 실행)
- 인터랙티브 입력: `io.read()` 대기 → `kim` 입력 → dim span으로 반영 → `io.write(name)` → `kim` 출력
- 입력 줄 dim + HTML 이스케이프: `<b>kim</b>` 입력 → `&lt;b&gt;kim&lt;/b&gt;`로 렌더, `.terminal-transcript-input` 존재
- 출력 XSS: `io.write("<b>not-bold</b>")` → `<b>` 요소 0개, 리터럴 표시
- 자동완성: `io.wr` → `write` 후보 표시 (WASM 로딩 후 실제 카탈로그 사용)
- 시그니처 도움말: `io.write("a", ` → `sep?: str` 활성, 나머지 파라미터 표시
- SetAllowEof 인터롭: EOF 차단 상태 `needsInput:true` / EOF 허용 상태 `needsInput:false, error:null` 확인

### 발생/해결한 문제
| 문제 | 조치 |
|---|---|
| `playground.ts: offset` 미정의 오류 (빌드 실패) | 잔여 참조 제거 후 재빌드 |
| `git rm` 거절 — `_framework` 파일이 이번 세션 재빌드로 수정됨 | 재빌드로 재생성 가능한 생성물이므로 디스크 삭제 + `git add -u`로 인덱스 정리 |
| 에디터 내용을 테스트 중 덮어씀 | 테스트 후 원래 내용(`use io\nio.write("Hello, World!")\na = 1\na`)으로 복원 완료 |
| 타이밍: WASM 로딩 전 자동완성/도움말은 fallback 카탈로그 사용 | 의도된 동작 (로딩 전 최소 카탈로그로 동작, 로딩 후 345개 카탈로그로 교체) |

### 해결하지 못한 문제
- `template-runtime.html`(Blazor `wwwroot/index.html`)은 publish 산출물에서 제외되지 않지만, 런타임에 필요 없음(웹앱이 자체 페이지 사용). 삭제했으므로 해당 없음.
- `web/public/_framework`는 여전히 **배포 산출물을 git 추적**하는 형태 (vercel.json의 dotnet 미빌드 제약 때문). 정상적 개선은 CI에서 dotnet publish → 업로드이나, 이번 범위 외로 유지.

---

## 7. 추가 개선 권장 사항

1. **`web/public/_framework` git 추적 해소** — CI/CD에서 `dotnet publish` 후 Vercel에 업로드하거나, `web/public/_framework` 대신 `vercel.json`에 dotnet 설치 단계 추가를 고려. 현재는 `git push`마다 수 MB의 산출물 diff 발생.
2. **E2E 테스트 부재** — 이번 세션의 브라우저 수동 검증(⌘/Ctrl+Enter 실행, io.read 대기, Esc 닫기, EOF 종료)을 Playwright로 고정하면 회귀를 초기에 잡을 수 있음. 루트 `package.json`의 `playwright` 의존성은 이런 용도로 추정되어 **보존**했습니다.
3. **`un` 언어 리포지토리**(`/Users/user/Desktop/dev/un`)가 로컬에 재클론(HEAD `fe05894`)되어 있습니다. 이전 세션의 `367f97c`에서 상위로 많이 변경되었으므로, 인터프리터 동작 차이가 있다면 upstream을 확인하거나 버전을 pinning할 것.
4. `web/dist/`와 `dist/`는 gitignore 대상이지만, 워킹트리에 stale `dist/`가 수시로 쌓입니다. `.gitignore`에는 이미 포함되어 무해.
5. `state/`(빈 디렉터리) — 용도 불명이나 외부 에이전트/도구 소유로 추정되어 **보존**. 내용을 확인 후 삭제 여부를 결정하세요.
6. Google Analytics 태그(`G-03FFJJEQPH`)가 `web/index.html`에 포함되어 있습니다. 의도된 것으로 보아 유지했으나, 공개 저장소에 GA ID가 노출되지 않아야 한다면 환경변수로 분리할 것.

### 보존한 항목 (삭제 근거 부족/외부 영향)
- `web/public/_framework` 추적 유지 — vercel.json 빌드 명령이 dotnet을 포함하지 않아 배포에 필요.
- 루트 `package.json`의 `playwright` — 자동화 테스트 가능성, 사용처 확인 불가.
- `web/index.html`의 GA 스니펫 — 사용자 분석 도구로 추정.
- `state/` 빈 디렉터리 — 에이전트/도구 소유 가능성.
- `web/public/_framework` 내 `.br` 제외 동기화 (기존 배포 구성과 동일하게 `.gz`+평문만 유지).
