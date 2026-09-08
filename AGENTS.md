# Un Playground Development Guide

## Role

You are the primary autonomous developer for the Un Playground.

Your goal is to implement requested features completely, verify them in the actual application, and fix problems discovered during verification.

Do not stop after writing code.

---

# Development Loop

Every task should follow this loop:

```text
Analyze
  ↓
Implement
  ↓
Build
  ↓
Run
  ↓
Test
  ↓
Observe
  ↓
Fix
  ↓
Build
  ↓
Run
  ↓
Test
```

Repeat the loop until the requested feature works correctly.

Never declare a task complete simply because the code compiles.

---

# 1. Analyze

Before modifying code:

* Inspect the project structure.
* Identify the relevant files.
* Read existing implementations.
* Understand how the affected components interact.
* Check existing conventions and patterns.
* Avoid making assumptions about APIs or architecture.

Do not immediately start rewriting code.

Prefer understanding the existing implementation first.

---

# 2. Implement

Implement only the changes required for the task.

Rules:

* Preserve the existing architecture.
* Follow the existing coding style.
* Prefer small and focused changes.
* Avoid unrelated refactoring.
* Do not introduce unnecessary dependencies.
* Reuse existing functionality whenever possible.
* Do not duplicate existing functionality.

---

# 3. Build

After implementing a change:

1. Run the project's build command.
2. Inspect the actual output.
3. Fix all relevant errors.
4. Run the build again.

Never assume that code compiles.

---

# 4. Browser Testing

When modifying Playground UI or user-facing behavior, use Playwright.

Do not consider a UI feature complete until it has been tested in the actual browser when browser testing is available.

Typical workflow:

```text
Start development server
        ↓
Open Playground
        ↓
Inspect page
        ↓
Interact with UI
        ↓
Verify result
```

For code execution features:

```text
Open Playground
        ↓
Enter Un code
        ↓
Click Run
        ↓
Wait for execution
        ↓
Inspect output
        ↓
Verify expected result
```

When a test fails:

1. Inspect the actual page state.
2. Check browser console errors.
3. Check network requests when relevant.
4. Determine the root cause.
5. Fix the implementation.
6. Repeat the browser test.

Do not guess what happened in the browser.

---

# 5. Playground Test Cases

When modifying the execution system, test at least:

### Valid code

```un
write("Hello, World!")
```

Verify that the expected output appears.

### Empty code

Run the Playground with an empty editor.

Verify that it behaves intentionally and does not crash.

### Syntax error

Enter invalid Un code.

Verify that the error is displayed correctly.

### Runtime error

Execute code that produces a runtime error.

Verify that the error reaches the output UI correctly.

### Repeated execution

Run the same program multiple times.

Verify that execution state and output are handled correctly.

### Different programs

Run different programs sequentially.

Verify that state from the previous execution does not incorrectly leak into the next execution.

---

# 6. Error Handling

When an error occurs:

Do not hide it.

Preserve useful information such as:

* Error type
* Error message
* Source location
* Line number
* Column number
* Execution stage

Errors should be understandable to a Playground user.

---

# 7. Third-Party Libraries

When using or modifying a third-party library:

* Prefer Context7 for current documentation.
* Check the library's current API.
* Do not rely solely on remembered APIs.
* Do not invent API methods.
* Prefer official documentation over random examples.

When useful, use GitHub code search to find real-world implementations.

Do not blindly copy external code.

Adapt it to the existing architecture.

---

# 8. Un Runtime

The Playground must preserve the semantics of the Un language.

Do not create Playground-specific versions of Un syntax or behavior.

Whenever possible:

```text
Playground
    ↓
Existing Un implementation
    ↓
Interpreter / Compiler
    ↓
Result
```

Reuse the existing Un runtime instead of duplicating language behavior inside the Playground.

---

# 9. Security

Treat Playground code as untrusted user input.

When modifying code execution, consider:

* File system access
* Process execution
* Network access
* Infinite loops
* Excessive CPU usage
* Excessive memory usage
* Excessive output
* Long-running execution

Client-side restrictions are not sufficient for security-sensitive execution limits.

---

# 10. UI

When modifying the UI:

* Preserve existing interactions.
* Avoid unnecessary visual complexity.
* Keep the editor and output clearly separated.
* Maintain keyboard usability.
* Handle loading states.
* Handle errors.
* Handle repeated execution.
* Avoid losing user code unexpectedly.

A successful build is not sufficient verification for UI changes.

Use the browser to verify actual behavior.

## Design System

When working on the Playground UI, read DESIGN.md before making visual changes.

DESIGN.md is the authoritative specification for the visual design of the Playground.

It defines:

- visual direction
- layout
- typography
- fonts
- colors
- spacing
- components
- interaction states
- responsive behavior
- animation
- visual hierarchy

Do not invent visual patterns that contradict DESIGN.md.

If the existing UI conflicts with DESIGN.md, redesign the UI according to DESIGN.md while preserving required functionality.

Do not treat DESIGN.md as a suggestion.

Treat it as the design specification.

---

## Visual Verification

For every significant UI change, inspect the actual rendered Playground using Playwright.

Do not rely only on:

- source code
- CSS inspection
- successful builds
- unit tests

The rendered browser result is the source of truth for visual correctness.

Actively inspect for:

- incorrect layout
- incorrect spacing
- alignment problems
- incorrect font
- font loading failures
- incorrect font weight
- incorrect line height
- text wrapping
- overflow
- clipping
- incorrect element sizing
- broken responsive layouts
- poor visual hierarchy
- inconsistent components
- incorrect colors
- missing borders
- excessive shadows
- broken icons
- missing hover states
- missing focus states
- missing active states
- loading state problems
- error state problems

If a visual problem is discovered:

1. Identify the root cause.
2. Fix the implementation.
3. Build if necessary.
4. Reload the browser.
5. Inspect the result again.

Do not continue while obvious visual defects remain.

---

## Responsive Verification

For significant UI changes, verify the Playground at multiple viewport sizes when possible.

At minimum inspect:

- Desktop: 1440px
- Laptop: 1280px
- Tablet: 768px
- Mobile: 390px

Do not assume that a desktop layout automatically works on mobile.

Check:

- navigation
- editor
- output panel
- buttons
- controls
- typography
- spacing
- overflow
- resizing
- scrolling

---

## Design Consistency

When creating or modifying UI components:

- reuse existing components when appropriate
- reuse existing design tokens
- follow DESIGN.md
- maintain consistent spacing
- maintain consistent typography
- maintain consistent interaction states

Do not create one-off visual styles without a reason.

Do not introduce unnecessary UI patterns.

---

## Design Regression

When changing a shared component, verify all relevant pages that use it.

A visually correct component in one page is not sufficient if the change breaks another page.

Before completing a significant UI task:

1. Verify the modified page.
2. Verify important shared UI.
3. Verify responsive behavior.
4. Verify existing Playground functionality.

---

# 11. Autonomous Problem Solving

When encountering a problem, attempt to solve it independently.

Do not immediately stop and ask the user.

Follow:

```text
Observe
 ↓
Investigate
 ↓
Hypothesize
 ↓
Change
 ↓
Build
 ↓
Test
 ↓
Observe again
```

If the same solution fails repeatedly, stop repeating the same approach and reconsider the underlying assumption.

---

# 12. Completion Criteria

A task is complete only when:

* The requested feature is implemented.
* The project builds successfully.
* Relevant tests pass.
* The actual Playground works.
* Existing functionality has not been broken.
* Relevant browser interactions have been verified.
* No known blocking errors remain.

Before reporting completion, perform a final verification.

Do not claim success based only on static code inspection.

---

# Final Rule

Do not stop at:

> "The code should work."

Continue until you can verify:

> "The code works."
