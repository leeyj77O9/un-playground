a# Un Playground — UI/UX Design Specification

첨부된 레퍼런스 이미지를 기준으로 전체 UI를 디자인하고 구현한다.

목표는 단순히 비슷하게 보이는 UI를 만드는 것이 아니라,
레퍼런스 이미지의 디자인 언어, 레이아웃, 시각적 계층, 여백, 정보 밀도,
색상, 컴포넌트 스타일, 사용자 흐름을 최대한 정확하게 재현하는 것이다.

이 애플리케이션은 Un 프로그래밍 언어를 위한 웹 기반 Playground다.

핵심 사용자 흐름은 매우 단순하다.

    Write Code → Run → View Result → Edit → Run Again

따라서 모든 디자인과 UX 결정은 이 흐름을 방해하지 않는 방향으로 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. DESIGN PHILOSOPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

전체적인 디자인은 다음 키워드를 따른다.

- Minimal
- Modern
- Professional
- Calm
- Precise
- Developer-oriented
- High information density
- Low visual noise

일반적인 SaaS 대시보드처럼 디자인하지 않는다.

특히 다음과 같은 AI 생성 UI의 전형적인 패턴을 피한다.

- 과도한 Glassmorphism
- 과도한 Gradient
- 보라색/파란색 Gradient 남발
- 거대한 제목
- 지나치게 둥근 카드
- 모든 요소를 카드로 감싸는 디자인
- 과도한 Shadow
- 장식용 아이콘 남발
- 불필요한 애니메이션
- 과도한 색상
- 지나치게 큰 버튼
- 불필요한 설명문
- Dashboard 스타일의 카드 레이아웃

이 UI는 "예쁜 웹사이트"가 아니라
"잘 만든 개발 도구"처럼 보여야 한다.

가장 중요한 디자인 원칙은 다음과 같다.

    The interface should disappear while the user is coding,
    and become clear when the user needs it.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. OVERALL COMPOSITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

화면 전체는 중앙에 위치한 하나의 Playground Container로 구성한다.

배경은 밝은 neutral/light gray 계열이다.

Playground Container는 화면 중앙에 떠 있는 형태이며,
주변에 충분한 여백을 둔다.

Container는:

- 거의 흰색에 가까운 Header
- 어두운 Code/Result Workspace
- 얇은 Bottom Status Bar

로 구성한다.

전체적인 구조는 다음과 같다.

┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
├──────────────────────────────────────┬───────────────────────┤
│                                      │                       │
│                                      │                       │
│              Code Editor             │        Result         │
│                                      │                       │
│                                      │                       │
│                                      │                       │
├──────────────────────────────────────┤                       │
│ Editor Status / Shortcut             │                       │
├──────────────────────────────────────┴───────────────────────┤
│ Global Status / Limits                                      │
└──────────────────────────────────────────────────────────────┘

왼쪽 Editor가 주요 작업 영역이다.

오른쪽 Result는 항상 존재하지만 Editor보다 시각적으로 덜 중요한
보조 작업 영역이다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. OUTER PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

브라우저 전체 배경은 밝은 회색/neutral 계열을 사용한다.

Playground Container가 배경 위에 떠 있는 느낌을 준다.

Container에는:

- 큰 border-radius
- 매우 subtle한 shadow
- 얇고 거의 보이지 않는 border

를 사용한다.

Shadow는 장식적인 강한 그림자가 아니라
Container와 페이지 배경을 구분하는 정도로만 사용한다.

페이지 전체를 꽉 채우지 않는다.

데스크톱에서는 화면 주변에 충분한 margin을 둔다.

Container의 모서리는 둥글지만 내부 UI 요소까지 모두
강하게 둥글게 만들지는 않는다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. HEADER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Header는 밝은 배경을 사용한다.

높이는 compact하게 유지한다.

Header는 크게 두 영역으로 나눈다.

LEFT:

    [File Icon] main.un    |    67 / 12,000

RIGHT:

    [Import] [Copy] [Export]    |    [API]    |    [Run]

Header는 기능을 많이 보여주는 Navigation Bar가 아니다.

현재 파일과 핵심 작업만 표시한다.

Header의 정보 밀도는 높지만 시각적으로 조용해야 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. FILE INDICATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

왼쪽에는 현재 Playground 파일을 표시한다.

예:

    [document icon]  main.un

파일 아이콘은 작고 subtle하게 표시한다.

파일명은 명확하게 읽을 수 있어야 한다.

파일명 오른쪽에는 세로 구분선을 두고
현재 코드 문자 수를 표시한다.

예:

    main.un | 67 / 12,000

문자 수는 주요 정보가 아니므로 파일명보다 낮은 visual weight를 사용한다.

문자 제한에 가까워질 경우 자연스럽게 warning 상태를 표현할 수 있도록 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. HEADER ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Header 오른쪽에는 주요 작업을 배치한다.

    Import
    Copy
    Export
    API
    Run

Import / Copy / Export는 하나의 시각적인 action group처럼 보이게 한다.

이 action group은 별도의 subtle background을 사용할 수 있다.

API는 다른 기능 그룹과 분리한다.

Run은 가장 중요한 Primary Action이다.

Run 버튼은:

- dark background
- white/light text
- 명확한 play icon
- compact한 크기
- 약간의 rounded corner

를 사용한다.

Run만 지나치게 크거나 화려하게 만들지 않는다.

하지만 다른 버튼과 비교했을 때
가장 중요한 행동이라는 것은 즉시 알 수 있어야 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. CODE EDITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Editor는 화면의 가장 중요한 영역이다.

배경은 매우 어두운 neutral tone을 사용한다.

순수한 #000000보다는 약간 밝은 dark tone을 사용하는 것을 권장한다.

Editor에는 불필요한 UI를 추가하지 않는다.

코드가 화면의 중심이다.

다음 요소를 지원한다.

- Line numbers
- Syntax highlighting
- Current line indication
- Selection
- Cursor
- Indentation
- Code completion
- Error / Warning markers
- Code folding
- Hover information

하지만 이러한 요소들은 필요할 때만 시각적으로 강조한다.

Editor UI가 코드보다 눈에 띄면 안 된다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. EDITOR TYPOGRAPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

코드에는 monospace font를 사용한다.

코드의 line-height는 읽기 편하도록 충분히 확보한다.

너무 큰 font를 사용하지 않는다.

레퍼런스처럼 compact하면서도 읽기 쉬운 코드 밀도를 유지한다.

Line number는 코드보다 낮은 contrast를 사용한다.

예:

    1
    2
    3

Line number가 코드보다 시선을 끌면 안 된다.

Syntax highlighting은 색상을 제한한다.

각 token에 강한 색상을 무분별하게 사용하지 않는다.

전체적으로 dark editor + restrained syntax color 조합을 사용한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. SYNTAX HIGHLIGHTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Un 코드의 syntax highlighting은 전문적인 IDE 수준으로 디자인한다.

예를 들어:

- Keyword
- Function
- String
- Number
- Boolean
- Comment
- Variable
- Type
- Operator

를 구분한다.

하지만 모든 token이 서로 다른 밝은 색을 갖게 만들지 않는다.

색상은 제한된 palette를 사용한다.

코드를 읽을 때 가장 중요한 것은
syntax color가 아니라 코드 구조와 텍스트 자체여야 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. RESULT PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Editor 오른쪽에는 Result Panel을 둔다.

Editor와 Result는 같은 dark workspace에 속하지만
명확한 경계를 가져야 한다.

두 영역 사이에는 subtle vertical divider를 사용한다.

Result Panel의 상단에는 작은 header가 있다.

    [terminal/output icon]  Result

Header는 매우 compact하다.

Result라는 텍스트는 명확하지만 과도하게 강조하지 않는다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. RESULT EMPTY STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

아직 코드를 실행하지 않은 상태에서는
Result 영역 중앙에 다음과 같은 상태를 표시한다.

    Waiting for output

이 메시지는 매우 낮은 contrast를 사용한다.

빈 공간을 채우기 위한 큰 일러스트나 아이콘을 사용하지 않는다.

다음과 같은 디자인은 사용하지 않는다.

- 큰 empty-state illustration
- 거대한 아이콘
- 설명 문단
- "Get Started" 같은 큰 CTA

Playground의 Result Panel은 조용해야 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12. RESULT STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Result는 상태에 따라 명확하게 변화한다.

상태:

1. Waiting
2. Running
3. Success
4. Error

Running 상태에서는 사용자가 프로그램이 실행되고 있음을 알 수 있어야 한다.

Success 상태에서는 출력 결과가 가장 중요한 정보다.

Error 상태에서는 단순히 전체 화면을 빨간색으로 만들지 않는다.

오류 메시지와 오류 위치를 명확하게 보여준다.

가능하다면:

    Error
    Line 12
    Unexpected token

처럼 구조화한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
13. SPLIT LAYOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Editor와 Result 사이의 비율은 Editor가 더 넓도록 한다.

기본적으로 약:

    Editor 65~70%
    Result 30~35%

정도의 비율을 사용한다.

단, 사용자가 필요하면 divider를 드래그하여 크기를 조절할 수 있도록 한다.

Divider는 평소에는 거의 보이지 않아야 한다.

Hover 시에만 interaction 가능하다는 것을 subtle하게 알려준다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14. BOTTOM STATUS BAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

화면 하단에는 compact status bar를 둔다.

왼쪽에는 실행 단축키를 표시한다.

예:

    [keyboard icon] Ctrl / ⌘ + Enter to run

오른쪽에는 Playground 제한을 표시한다.

예:

    Limits: 12,000 chars · 1.5 sec · 16,000 chars output

이 정보는 작고 낮은 contrast를 사용한다.

하지만 사용자가 언제든 확인할 수 있어야 한다.

Status Bar가 Editor의 일부처럼 자연스럽게 연결되도록 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
15. INFORMATION HIERARCHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UI의 visual hierarchy는 다음 순서를 따른다.

1. Code
2. Run
3. Result
4. Current file
5. Important state
6. Secondary actions
7. Metadata / limits

사용자가 화면을 바라봤을 때
가장 먼저 코드와 현재 작업 영역이 눈에 들어와야 한다.

Import / Copy / Export보다 Run이 더 중요해 보여야 한다.

Limits와 문자 수는 존재하지만 시선을 끌면 안 된다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
16. COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

전체 색상은 제한된 palette를 사용한다.

PAGE:

    Light neutral gray

CONTAINER:

    Warm/neutral white

HEADER:

    Near-white

EDITOR:

    Very dark neutral

RESULT:

    Same or slightly different dark neutral

TEXT:

    High contrast for primary text
    Medium contrast for secondary text
    Low contrast for metadata

ACCENT:

    최소한으로 사용

ERROR:

    restrained red

WARNING:

    restrained yellow/orange

SUCCESS:

    restrained green

색상으로 모든 것을 강조하지 않는다.

특히 Accent Color를 버튼, 아이콘, 텍스트, border에
무분별하게 적용하지 않는다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
17. BORDER & DIVIDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Border는 최소화한다.

영역을 구분하기 위해 다음 우선순위를 사용한다.

1. Layout
2. Spacing
3. Background difference
4. Subtle border

모든 버튼과 요소에 border를 추가하지 않는다.

Editor / Result 사이에는 subtle divider를 사용한다.

Header와 Editor 사이에도 아주 얇은 구분선을 사용할 수 있다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18. RADIUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Container는 충분히 rounded되어 있다.

하지만 내부 UI는 상대적으로 restrained하다.

다음처럼 모든 것을 pill 형태로 만들지 않는다.

BAD:

    ( Import )
    ( Copy )
    ( Export )
    ( Run )

GOOD:

    [ Import ]
    [ Copy ]
    [ Export ]        [ Run ]

Run 버튼에는 약간 더 강한 radius를 사용할 수 있지만
전체 디자인과 일관성을 유지한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
19. INTERACTION STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

모든 interactive element는 상태를 명확하게 가져야 한다.

필수 상태:

- Default
- Hover
- Active
- Focus
- Disabled

Hover는 너무 강하게 변하지 않는다.

Focus는 keyboard navigation에서도 명확하게 보여야 한다.

Active state는 현재 선택된 요소라는 것을 확실히 알려줘야 한다.

Disabled state는 단순히 opacity를 낮추는 것에만 의존하지 않는다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
20. UX — KEYBOARD FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이 애플리케이션은 개발자용 도구이므로
Keyboard-first UX를 우선한다.

가장 중요한 단축키:

    Ctrl / Cmd + Enter
    Run

사용자가 버튼을 찾지 않아도 빠르게 실행할 수 있어야 한다.

향후 확장 가능한 Command Palette UX도 고려한다.

예:

    Run
    Format
    Copy
    Export
    Open API
    Clear Result

등의 작업을 command 기반으로 실행할 수 있는 구조를 고려한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
21. UX — FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

모든 중요한 사용자 행동에는 적절한 feedback이 있어야 한다.

예:

Copy:

    Copied

Run:

    Running...

Success:

    Execution completed

Error:

    Execution failed

단, 모든 행동에 거대한 Toast를 띄우지 않는다.

간단한 행동에는 subtle feedback을 사용한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
22. UX — ERROR HANDLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

오류는 사용자에게 겁을 주는 방식으로 표시하지 않는다.

전체 Result Panel을 빨간색으로 만드는 식의 디자인은 사용하지 않는다.

오류를 해결하기 위한 정보를 제공한다.

가능한 경우:

    Error
    Line 12, Column 8

    Unexpected token ')'

    [Go to error]

처럼 표시한다.

오류의 위치를 클릭하면 Editor의 해당 위치로 이동할 수 있도록 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
23. UX — RUNNING STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run을 클릭하면 즉시 실행 상태를 보여준다.

예:

    Run → Running

Result:

    Waiting for output → Running...

실행 중에는 중복 실행을 방지하거나
현재 실행을 취소할 수 있는 UX를 고려한다.

실행이 끝나면:

    Running → Run

으로 자연스럽게 돌아온다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
24. UX — EMPTY / INITIAL STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

처음 들어왔을 때 사용자가 무엇을 해야 하는지
UI 자체만으로 이해할 수 있어야 한다.

하지만 불필요한 onboarding modal을 띄우지 않는다.

코드가 바로 보이고 바로 수정 가능해야 한다.

Playground는 가능한 한 "zero friction"이어야 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
25. RESPONSIVE DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Desktop을 primary target으로 한다.

하지만 화면이 좁아지면 단순히 UI를 압축하지 않는다.

우선순위가 낮은 요소부터 줄인다.

우선순위:

    Code
    Result
    Run
    File
    Secondary actions
    Metadata

좁은 화면에서는 Editor와 Result가 vertical layout으로 전환되는 것도 고려한다.

모바일에서 모든 Desktop UI를 억지로 유지하지 않는다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
26. MICRO INTERACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Animation은 최소한으로 사용한다.

Animation은 장식이 아니라 상태 변화를 설명하는 데 사용한다.

적절한 예:

- Panel resize
- Result appearing
- Tooltip
- Dropdown
- Button feedback
- Running state

부적절한 예:

- 계속 움직이는 background
- gradient animation
- bouncing button
- 과도한 hover animation
- decorative animation

전체 UI는 정적이고 안정적인 느낌을 유지해야 한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
27. ACCESSIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

디자인 단계부터 accessibility를 고려한다.

- 충분한 text contrast
- keyboard navigation
- 명확한 focus state
- 색상만으로 상태를 전달하지 않기
- 충분한 click target
- tooltip
- semantic labeling

특히 Error / Warning / Success는 색상뿐 아니라
아이콘이나 텍스트로도 의미를 전달한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
28. WHAT NOT TO DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

다음과 같은 방향으로 디자인을 변경하지 않는다.

❌ SaaS dashboard

❌ Landing page

❌ Excessive glassmorphism

❌ Excessive gradients

❌ Huge rounded cards

❌ Giant headings

❌ Excessive purple/blue accent

❌ Excessive shadows

❌ Excessive animations

❌ Too many icons

❌ Too many panels

❌ Permanent AI chat sidebar

❌ Excessive toolbars

❌ Code area becoming secondary

❌ Result area becoming visually dominant

❌ Every element having a card/background

❌ Every button looking like a primary CTA


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
29. DESIGN REFERENCE PRIORITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

첨부된 레퍼런스 이미지가 최우선 디자인 기준이다.

이미지에서 다음을 적극적으로 분석하고 재현한다.

- Overall proportions
- Container size
- Header height
- Editor/Result ratio
- Padding
- Spacing
- Typography scale
- Border radius
- Border thickness
- Shadow softness
- Background colors
- Button dimensions
- Icon size
- Alignment
- Visual hierarchy
- Information density

단순히 동일한 색상을 사용하는 것으로 끝내지 않는다.

레퍼런스가 전달하는 "느낌"과 "밀도"를 재현한다.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
30. FINAL UX PRINCIPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이 Playground의 UX는 다음 하나의 원칙으로 요약한다.

    Code is the product.
    Everything else supports the code.

사용자가 화면에 들어오면
설명이나 장식보다 코드가 먼저 보여야 한다.

코드를 작성한다.

    ↓

Ctrl/Cmd + Enter 또는 Run

    ↓

Result를 확인한다.

    ↓

오류가 있다면 해당 위치로 이동한다.

    ↓

코드를 수정한다.

    ↓

다시 실행한다.

이 루프가 최대한 빠르고 자연스럽게 반복되어야 한다.

최종 결과물은 "예쁜 웹 UI"가 아니라
"실제로 매일 사용할 수 있을 것 같은 현대적인 코드 Playground"처럼 느껴져야 한다.