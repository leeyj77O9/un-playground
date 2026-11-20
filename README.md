# un-playground

`un` 인터프리터를 브라우저에서 실행하는 플레이그라운드입니다.
Rust로 포팅된 `unvm` 런타임(`un/rust`)의 플레이그라운드 크레이트
`un/rust/playground`를 `wasm32-unknown-unknown`으로 빌드한 단일 파일
`web/public/playground.wasm`이 배포 산출물이고,
`web`이 Vite + React 프론트엔드를 빌드합니다.

프론트엔드는 `/playground.wasm`을 런타임에 로드해 `playground_*` C ABI를
직접 호출합니다(`web/src/lib/wasmClient.ts`). .NET/Blazor는 더 이상
사용하지 않습니다.

## 동작 방식

- `io.read()` 대화형 입력은 **리플레이** 방식입니다. 지금까지 입력된 줄을
  stdin으로 남기고 전체 스크립트를 처음부터 다시 실행하다가, 입력이
  부족해지면 WASM이 `needsInput: true`로 중단하고, 프론트엔드가 다음 줄을
  받아 다시 실행합니다. `allowEof`를 켜면 stdin이 비었을 때 `read()`가
  빈 문자열을 반환합니다.
- 에디터 자동완성/시그니처 도움말은 **정적 카탈로그**
  (`web/src/lib/nativeCatalog.ts`)를 사용합니다. Rust VM은 리플렉션
  메타데이터를 갖지 않으므로, 카탈로그는 한 번 생성되어 이 저장소에
  커밋된 데이터입니다. (생성 원본이던 인벤토리 문서는 `un` 리포지토리의
  마이그레이션 문서와 함께 제거되었습니다.) 카탈로그를 직접 고치려면
  `web/src/lib/nativeCatalog.ts`를 수정하세요. 인벤토리 파일이 있다면
  `node web/scripts/gen-native-catalog.mjs <inventory.md> <outPath>`로
  다시 생성할 수 있습니다.

## 타입 추론 / 타입 체크

에디터는 WASM의 `playground_check` ABI로 `un`의 실제 `typeck` 검사기를 실행합니다
(`un/rust/src/lsp.rs`의 진단 방식과 동일). 소스 변경 후 180ms 디바운스로 검사합니다.

에디터 상단 툴바에서 **실행**, 실행 취소/다시 실행, 복사, 잘라내기, 모두 선택,
기본 코드로 초기화를 버튼으로 누를 수 있습니다. 같은 툴바의 **타입 검사**
아이콘 버튼으로 컴파일 모드(정적 검사)를 켜고 끌 수 있습니다(눌린 상태가 켜짐).
인터프리터 실행(VM)은 항상 동작하며, 버튼을 끄면 검사만 비활성화됩니다
(`un` LSP의 `un/compileMode`와 같은 개념). 선택은 브라우저에 저장됩니다.

- 타입 오류는 코드에 빨간 물결 밑줄로 표시되고, 그 위에 마우스를 올리면
  `줄:열`과 오류 메시지 툴팁이 뜹니다.
- 오류가 아닌 식별자 위에 마우스를 올리면 `lsp.rs`의 `infer_types` 로직으로
  얻은 추론 타입 툴팁이 뜹니다.
- `playground_check`가 없는 구버전 WASM이면 조용히 건너뛰며, 기존 JS
  자동완성/시그니처 도움말은 그대로 동작합니다.

## WASM 자동 갱신

`.github/workflows/update-wasm.yml`이 10분마다 `un`의 `main`을 확인합니다.
`un`의 커밋이 바뀌면 다음을 자동으로 수행합니다.

1. Rust stable 툴체인과 `wasm32-unknown-unknown` 타깃으로 `un/rust`
   워크스페이스를 테스트합니다 (`cargo test --workspace`).
2. `unvm-playground`를 Release로 빌드하고 `playground/smoke.mjs`로
   `playground_*` ABI 스모크 테스트를 실행합니다.
3. `un/rust/target/wasm32-unknown-unknown/release/unvm_playground.wasm`을
   `web/public/playground.wasm`으로 복사합니다.
4. `.wasm-source-sha`와 함께 커밋하고 push합니다.

push가 발생하면 Vercel이 자동으로 배포합니다. `un`이 바뀌지 않았으면
아무 작업도 하지 않습니다.

> 저장소의 **Settings → Actions → General → Workflow permissions**에서
> **Read and write permissions**가 선택되어 있어야 커밋을 push할 수 있습니다.

수동으로 최신 상태를 반영하려면 GitHub Actions에서 **Update WASM**
워크플로를 실행하면 됩니다. 소스 SHA가 같아도 강제로 다시 빌드하려면
`force`를 켜세요.

## 즉시 반영 (선택)

기본은 10분 주기입니다. `un`에 push한 즉시 반영하고 싶다면:

1. GitHub에서 fine-grained PAT를 만듭니다.
   - Repository access: `leeyj77O9/un-playground`
   - Permissions: `Contents: Read and write`
2. `un` 저장소의 Settings → Secrets and variables → Actions에
   `PLAYGROUND_DISPATCH_TOKEN` 이름으로 추가합니다.
3. `un`의 `.github/workflows/dispatch-playground.yml`이 push 시
   `un-playground`에 `repository_dispatch`를 보냅니다.

토큰이 없으면 dispatch 단계는 조용히 건너뛰고, 10분 주기 자동 갱신만
동작합니다.

## 로컬 빌드

`un`과 `un-playground`가 같은 부모 디렉터리에 있어야 합니다.

```powershell
# 1. Rust 타깃 설치 (최초 1회)
rustup target add wasm32-unknown-unknown

# 2. WASM 빌드
cargo build --release --manifest-path ..\un\rust\Cargo.toml `
  --target wasm32-unknown-unknown -p unvm-playground

# 3. playground.wasm 복사
Copy-Item ..\un\rust\target\wasm32-unknown-unknown\release\unvm_playground.wasm `
  .\web\public\playground.wasm -Force

# 4. 스모크 테스트 (선택)
node ..\un\rust\playground\smoke.mjs

# 5. 프론트엔드 (선택)
npm install --prefix web
npm run build --prefix web

# 6. 빌드한 un 커밋 기록
git -C ..\un rev-parse HEAD | Set-Content .wasm-source-sha
```

## 참고

- `web/public/playground.wasm`은 저장소에 커밋되는 생성물입니다. 직접 수정하지 마세요.
- `.wasm-source-sha`는 마지막으로 빌드한 `un` 커밋을 기록합니다.
- `playground.wasm`은 커밋마다 바뀌므로 Vercel은 `Cache-Control: max-age=0, must-revalidate`로
  서빙합니다 (`vercel.json`).
- `web/public/playground.wasm`은 GitHub Actions가 `un`의 커밋된 `main`에서
  빌드한 산출물이며, `.wasm-source-sha`가 그 커밋을 가리킵니다. stdin
  리플레이/`need_input` 중단에 사용된 Rust 코드(`rust/src/runtime/world.rs`,
  `rust/src/native/io.rs`, `rust/playground/src/lib.rs`)도 `un`에 커밋되어
  있어 예약 빌드가 다시 만들어도 대화형 입력이 유지됩니다. 로컬 `un` 작업
  트리의 미커밋 변경을 반영하려면 먼저 `un`에 커밋/push해야 합니다.
- 정적 카탈로그는 참조 문서 시점의 표면이므로, `un`에 네이티브 함수를 추가하면
  카탈로그를 다시 생성해 커밋해야 자동완성에 반영됩니다. 인벤토리 문서가
  제거된 뒤 추가된 `types` 모듈(`un@0b49450`)과 `builtin`에서 `codes`로
  옮겨진 `bin`/`oct`/`hex`/`chr`/`ord`/`ascii`는 `nativeCatalog.ts`에 직접
  반영되어 있습니다.
- `codes`와 `types`는 플레이그라운드의 기본 허용 모듈에도 포함되어 있어
  `use codes { chr }` / `use types`로 사용할 수 있습니다. `codes`의 함수는
  `use codes`만으로는 노출되지 않고 `codes.chr(...)` 또는 명시적 바인딩이
  필요합니다.
- 현재 `web/public/playground.wasm`은 `un`의 `playground_check` ABI와
  `codes`/`types` 허용 변경을 포함해 로컬에서 다시 빌드한 산출물입니다.
  `un`의 해당 커밋이 아직 push되지 않았으므로, `un` main이 갱신되면 예약
  빌드가 이 변경들을 빠뜨릴 수 있습니다. `un` 변경을 먼저 push하세요.
- GitHub Actions의 기본 `GITHUB_TOKEN`으로 push한 커밋은 다른 *워크플로*를
  트리거하지 않지만, Vercel 같은 외부 Git 연동에는 정상적으로 전달됩니다.
