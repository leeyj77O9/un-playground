# un-playground

`un` 인터프리터를 브라우저에서 실행하는 플레이그라운드입니다.
`Un.Playground.Wasm`이 `../un/Un.csproj`를 참조해 Blazor WASM 번들을 만들고,
`web`이 Vite + React 프론트엔드를 빌드합니다.

## WASM 자동 갱신

`.github/workflows/update-wasm.yml`이 10분마다 `un`의 `main`을 확인합니다.
`un`의 커밋이 바뀌면 다음을 자동으로 수행합니다.

1. .NET 8을 설치하고 `un` 테스트 스위트를 실행합니다.
2. `wasm-tools` 워크로드를 설치하고 `Un.Playground.Wasm`을 Release로 빌드합니다.
3. `_framework`를 `web/public/_framework`로 복사합니다.
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
# 1. WASM 빌드
dotnet build .\Un.Playground.Wasm\Un.Playground.Wasm.csproj -c Release

# 2. _framework 복사
Remove-Item .\web\public\_framework -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory .\web\public\_framework | Out-Null
Copy-Item .\Un.Playground.Wasm\bin\Release\net8.0\wwwroot\_framework\* `
    .\web\public\_framework -Recurse -Force

# 3. 프론트엔드 빌드 (선택)
npm install --prefix web
npm run build --prefix web

# 4. 빌드한 un 커밋 기록 (선택)
git -C ..\un rev-parse HEAD | Set-Content .wasm-source-sha
```

## 참고

- `web/public/_framework`는 저장소에 커밋되는 생성물입니다. 직접 수정하지 마세요.
- `.wasm-source-sha`는 마지막으로 빌드한 `un` 커밋을 기록합니다.
- `_framework`를 매번 커밋하므로 `un` 변경이 잦으면 저장소가 커집니다. 장기적으로는
  GitHub Release 아티팩트나 별도 브랜치로 분리하는 편이 좋습니다.
- 봇 커밋으로 Vercel 배포가 트리거되지 않으면 Vercel 프로젝트의
  **Settings → Git → Deploy Hooks**로 훅을 만들고, 워크플로 마지막에
  `curl -X POST "$VERCEL_DEPLOY_HOOK"`을 추가하면 됩니다.
- GitHub Actions의 기본 `GITHUB_TOKEN`으로 push한 커밋은 다른 *워크플로*를
  트리거하지 않지만, Vercel 같은 외부 Git 연동에는 정상적으로 전달됩니다.
