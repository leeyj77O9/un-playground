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
  메타데이터를 갖지 않으므로, `un` 리포지토리의
  `docs/rust-migration/NATIVE_INVENTORY.md`에서 생성한 데이터입니다.
  카탈로그를 갱신하려면 `npm run generate:catalog --prefix web`을 실행하세요
  (un 리포지토리가 `../un`에 있는 기본 경로를 그대로 쓰거나,
  `node web/scripts/gen-native-catalog.mjs <NATIVE_INVENTORY.md> <outPath>`로
  경로를 지정할 수 있습니다).

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
- `web/public/playground.wasm`은 이번 작업에서 `un` 저장소의 Rust 코드도
  함께 수정된(stdin 리플레이/`need_input` 중단 추가: `rust/src/runtime/world.rs`,
  `rust/src/native/io.rs`, `rust/playground/src/lib.rs`) 로컬 빌드 산출물입니다.
  `un`에 커밋/push되지 않으면 다음 예약 빌드가 이 수정을 포함하지 않는
  upstream main에서 산출물을 다시 만들어 대화형 입력이 깨질 수 있습니다.
  **`un`의 변경을 먼저 push한 뒤** `un-playground`를 push하세요.
- 정적 카탈로그는 참조 문서 시점의 표면이므로, `un`에 네이티브 함수를 추가하면
  카탈로그를 다시 생성해 커밋해야 자동완성에 반영됩니다.
- GitHub Actions의 기본 `GITHUB_TOKEN`으로 push한 커밋은 다른 *워크플로*를
  트리거하지 않지만, Vercel 같은 외부 Git 연동에는 정상적으로 전달됩니다.
