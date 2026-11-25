import './index.css'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { createRoot } from 'react-dom/client'
import {
  highlightUnSource,
  MAX_PLAYGROUND_SOURCE_CHARS,
  PLAYGROUND_DEFAULT_SOURCE,
  PLAYGROUND_STORAGE_KEYS,
  presentExecution,
  restoreSavedSource,
  restoreTypeCheckPreference,
  applyUnAutocompleteCandidate,
  applyUnFoldedViewChange,
  buildUnFoldedView,
  getUnFoldRanges,
  getUnObjectMethodCandidates,
  getUnAutocompleteCandidates,
  getUnAutocompleteRange,
  getLspSignature,
  getLspHoverDoc,
  getUnHoverType,
  isUnInsideComment,
  isUnInsideString,
  getUnSignatureHelp,
  type ConsolePresentation,
  type ExecutionSnapshot,
  type UnAutocompleteCandidate,
  type UnFoldRange,
  type UnNativeFunctionMetadata,
  type UnSignatureHelp,
} from './lib/playground'
import type { UnCheckResult, UnDiagnostic } from './lib/wasmClient'
import { useWasm } from './hooks/useWasm'
import { runUnScript } from './lib/wasmClient'

type Phase = 'idle' | 'running' | 'waiting' | 'done'

type InputInsertion = { at: number; value: string; kind: 'input' | 'output' }

type HoverInfo =
  | { kind: 'error'; message: string; line: number; column: number; top: number; left: number }
  | { kind: 'type'; word: string; type: string; top: number; left: number }
  | { kind: 'doc'; label: string; doc: string; top: number; left: number }
  | { kind: 'signature'; signature: UnSignatureHelp; top: number; left: number }

type CompletionKind = UnAutocompleteCandidate['kind']

const KIND_TITLE: Record<CompletionKind, string> = {
  keyword: '키워드',
  function: '함수',
  method: '메서드',
  property: '프로퍼티',
  variable: '변수',
  argument: '인자',
}

// 함수/메서드는 오른쪽에 표시할 시그니처를 만든다 (예: add(x, y))
const completionSignature = (
  candidate: UnAutocompleteCandidate,
  nativeFunctions: readonly UnNativeFunctionMetadata[],
  checkResult: UnCheckResult | null,
): string | null => {
  if (candidate.kind !== 'function' && candidate.kind !== 'method') return null

  // User-defined functions/methods already carry their LSP-style label in detail.
  if (candidate.detail.startsWith(`${candidate.label}(`)) return candidate.detail

  const match = /^native\s+(.+)\s+(function|method)$/.exec(candidate.detail)
  const stub = getLspSignature(match?.[1] ?? null, candidate.label, candidate.kind === 'method')
  if (stub) return stub.label

  const inferred = checkResult?.fnParams.find(([name]) => name === candidate.label)?.[1]
  if (inferred) return `${candidate.label}(${inferred.map(([name]) => name).join(', ')})`

  const entry = nativeFunctions.find(
    (item) => item.name === candidate.label && (!match || item.module === match[1]),
  )
  const parameters = entry?.parameters.map(
    (parameter) => `${parameter.positional ? '...' : ''}${parameter.name}${parameter.optional ? '?' : ''}`,
  )
  return `${candidate.label}(${parameters?.join(', ') ?? ''})`
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

// 진단 위치도 접힌 줄이 제거된 표시용 텍스트 기준으로 옮긴다
const remapDiagnostics = (diagnostics: readonly UnDiagnostic[], sourceToView: Int32Array): UnDiagnostic[] =>
  diagnostics
    .map((diagnostic) => {
      const start = sourceToView[Math.min(diagnostic.start, sourceToView.length - 1)] ?? 0
      const end = sourceToView[Math.min(diagnostic.start + diagnostic.length, sourceToView.length - 1)] ?? start
      if (end <= start) return null
      return { ...diagnostic, start, length: end - start }
    })
    .filter((diagnostic): diagnostic is UnDiagnostic => diagnostic !== null)

// 팝업 위치 계산용 텍스트 폭 측정 — 글자폭을 추정하지 않고 실제 렌더링 폭 사용
let measureCtx: CanvasRenderingContext2D | null = null
const measureTextWidth = (text: string, font: string) => {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d')
  if (!measureCtx) return text.length * 8
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

type ToolbarIconName = 'play' | 'undo' | 'redo' | 'copy' | 'check' | 'cut' | 'select' | 'reset' | 'typecheck'

function ToolbarIcon({ name }: { name: ToolbarIconName }) {
  const svg = {
    width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'play':
      return <svg {...svg}><path d="M4.6 2.9 12.6 8l-8 5.1V2.9Z" fill="currentColor" stroke="none" /></svg>
    case 'undo':
      return <svg {...svg}><path d="M6.2 4 3 7.2l3.2 3.2" /><path d="M3 7.2h6.2a3.8 3.8 0 0 1 0 7.6H6" /></svg>
    case 'redo':
      return <svg {...svg}><path d="M9.8 4 13 7.2l-3.2 3.2" /><path d="M13 7.2H6.8a3.8 3.8 0 0 0 0 7.6H10" /></svg>
    case 'copy':
      return <svg {...svg}><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 3.5h-7a1 1 0 0 0-1 1v7" /></svg>
    case 'check':
      return <svg {...svg}><path d="M3 8.4 6.2 11.6 13 4.7" /></svg>
    case 'cut':
      return <svg {...svg}><circle cx="4" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><path d="M5.4 10.7 12 3M10.6 10.7 4 3" /></svg>
    case 'select':
      return <svg {...svg}><rect x="2.8" y="2.8" width="10.4" height="10.4" rx="1.5" strokeDasharray="2.5 2.2" /></svg>
    case 'reset':
      return <svg {...svg}><path d="M2.8 8A5.2 5.2 0 1 0 4.6 4.1" /><path d="M2.8 3.6v3.6h3.6" /></svg>
    case 'typecheck':
      return <svg {...svg}><circle cx="8" cy="8" r="5.6" /><path d="M5.5 8.1 7.3 9.9 10.7 6.2" /></svg>
  }
}

function CompletionKindIcon({ kind }: { kind: CompletionKind }) {
  const svg = {
    width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (kind) {
    case 'keyword':
      return <svg {...svg}><path d="M2.6 7.2V3.4a.8.8 0 0 1 .8-.8h3.8c.21 0 .42.08.57.24l6 6a.8.8 0 0 1 0 1.13l-3.8 3.8a.8.8 0 0 1-1.13 0l-6-6A.8.8 0 0 1 2.6 7.2Z" /><circle cx="5.2" cy="5.2" r=".8" fill="currentColor" stroke="none" /></svg>
    case 'function':
      return <svg {...svg}><circle cx="8" cy="8" r="5.2" /><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" /></svg>
    case 'method':
      return <svg {...svg}><path d="M8 2.4 13.6 8 8 13.6 2.4 8 8 2.4Z" /><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" /></svg>
    case 'property':
      return <svg {...svg}><rect x="2.6" y="4.4" width="10.8" height="7.2" rx="1.6" /><path d="M5.4 8h3.4" /></svg>
    case 'variable':
      return <svg {...svg}><path d="M8 2.5 13.2 5.3v5.4L8 13.5 2.8 10.7V5.3L8 2.5Z" /><path d="M2.8 5.3 8 8l5.2-2.7M8 8v5.5" /></svg>
    case 'argument':
      return <svg {...svg}><path d="M6.2 4.4 2.8 8l3.4 3.6M9.8 4.4 13.2 8l-3.4 3.6" /></svg>
  }
}

function SignatureLabel({ label, activeIndex = -1 }: { label: string; activeIndex?: number }) {
  const open = label.indexOf('(')
  const close = label.lastIndexOf(')')
  if (open < 0 || close <= open) return <>{label}</>
  const parameters = label.slice(open + 1, close).split(/,\s*/)
  return (
    <>
      {label.slice(0, open + 1)}
      {parameters.map((parameter, index) => (
        <span key={`${parameter}-${index}`}>
          {index > 0 && <span className="signature-help-sep">, </span>}
          <span className={index === activeIndex ? 'signature-help-param active' : 'signature-help-param'}>
            {parameter}
          </span>
        </span>
      ))}
      {label.slice(close)}
    </>
  )
}

// lsp.rs 의 hover markdown 과 같은 순서: 문서 → ```un 시그니처 코드 블록
function SignatureHelpBody({
  label,
  doc,
  example,
  activeIndex = -1,
  docFirst = false,
}: {
  label: string
  doc: string
  example?: string
  activeIndex?: number
  docFirst?: boolean
}) {
  const docBlock = doc && (
    <div className={`signature-help-description${docFirst ? ' doc-first' : ''}`}>{doc}</div>
  )
  const signature = (
    <div className="signature-help-signature signature-help-label">
      <SignatureLabel label={label} activeIndex={activeIndex} />
    </div>
  )
  const exampleBlock = example && <code className="signature-help-example">{example}</code>
  return docFirst ? <>{docBlock}{signature}{exampleBlock}</> : <>{signature}{docBlock}{exampleBlock}</>
}

/* ── Source Editor ──────────────────────────────────────────────────── */
function SourceEditor({
  value,
  onChange,
  onRun,
  nativeFunctions,
  checkResult,
  onUndo,
  onRedo,
  onReset,
  typeCheckEnabled,
  onToggleTypeCheck,
}: {
  value: string
  onChange: (next: string) => void
  onRun: () => void
  nativeFunctions: UnNativeFunctionMetadata[]
  checkResult: UnCheckResult | null
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  typeCheckEnabled: boolean
  onToggleTypeCheck: (enabled: boolean) => void
}) {
  const highlightRef = useRef<HTMLElement>(null)
  const gutterRef = useRef<HTMLPreElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [acVisible, setAcVisible] = useState(false)
  const [acCandidates, setAcCandidates] = useState<UnAutocompleteCandidate[]>([])
  const [acSelected, setAcSelected] = useState(0)
  const acListRef = useRef<HTMLUListElement>(null)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const [sigHelp, setSigHelp] = useState<UnSignatureHelp | null>(null)
  const [sigPos, setSigPos] = useState({ top: 0, left: 0 })
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<number | null>(null)

  // 코드 접기: 접힌 선언의 key를 기억하고, 보이는 텍스트(view)만 편집기에 보여준다
  const [foldedKeys, setFoldedKeys] = useState<Set<string>>(() => new Set())
  const [scrollOffset, setScrollOffset] = useState({ top: 0, left: 0 })
  const pendingViewCursorRef = useRef<number | null>(null)

  useEffect(() => {
    if (checkResult === null) setHover(null)
  }, [checkResult])

  // 후보가 드롭다운 높이보다 많을 수 있으므로 화살표 이동 시 선택 항목을 목록 안에서 스크롤
  useEffect(() => {
    if (!acVisible || acCandidates.length === 0) return
    const list = acListRef.current
    const item = list?.children[acSelected] as HTMLElement | undefined
    if (!list || !item) return
    const itemTop = item.offsetTop
    const itemBottom = itemTop + item.offsetHeight
    if (itemTop < list.scrollTop) list.scrollTop = itemTop
    else if (itemBottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = itemBottom - list.clientHeight
    }
  }, [acVisible, acCandidates, acSelected])

  useEffect(() => () => {
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
  }, [])

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = textareaRef.current
      if (el) {
        el.focus()
        el.select()
        document.execCommand('copy')
      }
    }
    setCopied(true)
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1200)
  }

  const selectionRange = () => {
    const el = textareaRef.current
    return el ? { start: el.selectionStart, end: el.selectionEnd } : { start: 0, end: 0 }
  }

  const handleRun = () => {
    setAcVisible(false)
    setSigHelp(null)
    setHover(null)
    onRun()
  }

  const handleCopy = () => { void copyText(value) }

  const handleCut = () => {
    const { start, end } = selectionRange()
    if (start === end) return
    void copyText(view.slice(start, end))
    const nextView = view.slice(0, start) + view.slice(end)
    pendingViewCursorRef.current = start
    onChange(applyUnFoldedViewChange(view, nextView, viewToSource, value))
  }

  const handleSelectAll = () => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.select()
  }

  const handleReset = () => {
    setAcVisible(false)
    setSigHelp(null)
    setHover(null)
    onReset()
  }

  // 접기 구간 계산 → 접힌 줄 제외한 보기 텍스트와 위치 매핑 생성
  const foldRanges = useMemo(() => getUnFoldRanges(value), [value])
  const hiddenLines = useMemo(() => {
    const hidden = new Set<number>()
    for (const range of foldRanges) {
      if (!foldedKeys.has(range.key)) continue
      for (let line = range.startLine + 1; line <= range.endLine; line++) hidden.add(line)
    }
    return hidden
  }, [foldRanges, foldedKeys])
  const { view, viewToSource, sourceToView, visibleSourceLines } = useMemo(
    () => buildUnFoldedView(value, hiddenLines),
    [value, hiddenLines],
  )
  const viewLines = useMemo(() => view.split('\n'), [view])
  const foldByViewLine = useMemo(() => {
    const map = new Map<number, UnFoldRange>()
    visibleSourceLines.forEach((sourceLine, viewLine) => {
      const range = foldRanges.find((item) => item.startLine === sourceLine)
      if (range) map.set(viewLine, range)
    })
    return map
  }, [visibleSourceLines, foldRanges])

  // 접힌 선언 뒤에 표시할 미트볼 위치 (텍스트 영역과 같은 오프셋 사용)
  const foldHints = useMemo(() => {
    const el = textareaRef.current
    const cs = el ? window.getComputedStyle(el) : null
    const lineHeight = Number.parseFloat(cs?.lineHeight ?? '') || 22.75
    const padLeft = Number.parseFloat(cs?.paddingLeft ?? '') || 22
    const padTop = Number.parseFloat(cs?.paddingTop ?? '') || 18
    const hints: { key: string; top: number; left: number }[] = []
    visibleSourceLines.forEach((_, viewLine) => {
      const range = foldByViewLine.get(viewLine)
      if (!range || !foldedKeys.has(range.key)) return
      hints.push({
        key: range.key,
        // 선언 줄 끝에 붙이고, 점 세 개가 본문 글자와 시각적으로 같은 높이가 되도록 보정
        top: padTop + viewLine * lineHeight - scrollOffset.top + 2,
        left: padLeft + measureTextWidth(viewLines[viewLine] ?? '', cs?.font ?? '') - scrollOffset.left + 10,
      })
    })
    return hints
  }, [viewLines, visibleSourceLines, foldByViewLine, foldedKeys, scrollOffset])

  const diagnostics = useMemo(
    () => remapDiagnostics(checkResult?.diagnostics ?? [], sourceToView),
    [checkResult, sourceToView],
  )
  const highlighted = useMemo(() => highlightUnSource(view, diagnostics), [view, diagnostics])

  const toggleFold = (range: UnFoldRange) => {
    setFoldedKeys((previous) => {
      const next = new Set(previous)
      if (next.has(range.key)) next.delete(range.key)
      else next.add(range.key)
      return next
    })
  }

  const sourceLines = useMemo(() => value.split('\n'), [value])
  const pendingFoldCaretRef = useRef<number | null>(null)

  const sourceLineAtOffset = (offset: number) => {
    let pos = 0
    for (let line = 0; line < sourceLines.length; line++) {
      const lineEnd = pos + sourceLines[line].length
      if (offset <= lineEnd) return line
      pos = lineEnd + 1
    }
    return sourceLines.length - 1
  }

  // 커서가 속한 가장 안쪽 접기 구간
  const foldRangeAtCaret = () => {
    const el = textareaRef.current
    if (!el) return null
    const line = sourceLineAtOffset(viewToSource[el.selectionStart ?? 0] ?? 0)
    let best: UnFoldRange | null = null
    for (const range of foldRanges) {
      if (range.startLine > line || range.endLine < line) continue
      if (!best || range.endLine - range.startLine < best.endLine - best.startLine) best = range
    }
    return best
  }

  const foldAtCaret = (wantFold: boolean) => {
    const range = foldRangeAtCaret()
    if (!range) return
    if (foldedKeys.has(range.key) === wantFold) return
    toggleFold(range)
    pendingFoldCaretRef.current = range.startLine
  }

  // 접기 토글 후 새 표시 텍스트가 적용되면 선언 줄 시작으로 커서를 되돌린다
  useLayoutEffect(() => {
    const line = pendingFoldCaretRef.current
    if (line === null) return
    pendingFoldCaretRef.current = null
    const el = textareaRef.current
    if (!el) return
    let offset = 0
    for (let i = 0; i < line; i++) offset += sourceLines[i].length + 1
    const viewOffset = sourceToView[offset] ?? 0
    el.focus()
    el.selectionStart = el.selectionEnd = viewOffset
  }, [view, sourceLines, sourceToView])

  // 펼친 줄의 wrappers가 그대로 보이도록 편집 후 커서를 표시용 텍스트 기준으로 복원
  useLayoutEffect(() => {
    const cursor = pendingViewCursorRef.current
    if (cursor === null) return
    const el = textareaRef.current
    if (el) {
      el.selectionStart = el.selectionEnd = Math.min(cursor, el.value.length)
      el.focus()
    }
    pendingViewCursorRef.current = null
  }, [view])

  // 케어 위치(.code-surface 기준) — 팝업이 현재 라인 바로 아래에 뜨도록
  // 한글 등 글자폭이 다른 문자도 정확히 따라가도록 캔버스로 실제 폭을 측정
  const measureCaret = (el: HTMLTextAreaElement, cursor: number, text: string) => {
    const before = text.slice(0, cursor)
    const lineIndex = before.split('\n').length - 1
    const lineStart = before.lastIndexOf('\n') + 1
    const lineText = before.slice(lineStart)
    const cs = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(cs.lineHeight) || 22.75
    const padLeft = Number.parseFloat(cs.paddingLeft) || 0
    const padTop = Number.parseFloat(cs.paddingTop) || 0
    return {
      top: padTop + (lineIndex + 1) * lineHeight - el.scrollTop + 4,
      left: padLeft + measureTextWidth(lineText, cs.font) - el.scrollLeft,
    }
  }

  // 자동완성 드롭다운(위) → 시그니처 도움말(아래) 순으로 배치
  const positionPopups = (el: HTMLTextAreaElement, cursor: number, text: string, acCount: number) => {
    const caret = measureCaret(el, cursor, text)
    setDropPos({ top: caret.top, left: caret.left })
    // CSS의 max-height(224px)와 같은 값으로 제한해 시그니처 도움말이 너무 아래로 밀리지 않게
    const acHeight = acCount > 0 ? Math.min(224, 8 + 26 * acCount) + 4 : 0
    setSigPos({ top: caret.top + acHeight, left: caret.left })
  }

  const updateSignatureHelp = (el: HTMLTextAreaElement | null, text: string, acCount = 0) => {
    if (!el) return
    const cursor = el.selectionStart ?? text.length
    setSigHelp(getUnSignatureHelp(text, cursor, nativeFunctions, checkResult))
    positionPopups(el, cursor, text, acCount)
  }

  const refreshAutocomplete = (text: string, cursor: number): number => {
    if (isUnInsideString(text, cursor) || isUnInsideComment(text, cursor)) {
      setAcVisible(false)
      return 0
    }
    // io. / math. 같은 dot 컨텍스트가 우선
    const dotCandidates = getUnObjectMethodCandidates(text, cursor, nativeFunctions, checkResult)
    const range = getUnAutocompleteRange(text, cursor)
    const next = dotCandidates !== null
      ? dotCandidates
      : range.query.length > 0
        ? getUnAutocompleteCandidates(text, range.query, nativeFunctions, checkResult)
        : []
    if (next.length === 0) {
      setAcVisible(false)
      return 0
    }
    setAcCandidates(next)
    setAcSelected(0)
    setAcVisible(true)
    return next.length
  }

  const applyCandidate = (candidate: UnAutocompleteCandidate) => {
    const el = textareaRef.current
    const cursor = el?.selectionStart ?? view.length
    const range = getUnAutocompleteRange(view, cursor)
    const applied = applyUnAutocompleteCandidate(view, range, candidate)
    pendingViewCursorRef.current = applied.cursor
    onChange(applyUnFoldedViewChange(view, applied.source, viewToSource, value))
    setAcVisible(false)
    requestAnimationFrame(() => {
      const target = textareaRef.current
      if (target) updateSignatureHelp(target, target.value, 0)
    })
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextView = event.target.value
    const cursor = event.target.selectionStart ?? nextView.length
    setHover(null)
    pendingViewCursorRef.current = cursor
    onChange(applyUnFoldedViewChange(view, nextView, viewToSource, value))
    syncScroll(event.target)
    const acCount = refreshAutocomplete(nextView, cursor)
    setSigHelp(getUnSignatureHelp(nextView, cursor, nativeFunctions, checkResult))
    positionPopups(event.target, cursor, nextView, acCount)
  }

  // 추론 결과가 도착하면 현재 커서 기준으로 제안/시그니처를 다시 계산
  useEffect(() => {
    const el = textareaRef.current
    if (!el || !acVisible) return
    const cursor = el.selectionStart ?? view.length
    const acCount = refreshAutocomplete(view, cursor)
    updateSignatureHelp(el, view, acCount)
  }, [checkResult])

  const syncScroll = (el: HTMLTextAreaElement) => {
    if (gutterRef.current) {
      gutterRef.current.style.transform = `translateY(-${el.scrollTop}px)`
    }
    if (highlightRef.current) {
      highlightRef.current.style.transform = `translate(${-el.scrollLeft}px, -${el.scrollTop}px)`
    }
    setScrollOffset({ top: el.scrollTop, left: el.scrollLeft })
  }

  // 진단 위에서는 오류를, 호출 위에서는 시그니처를, 그 외에는 추론 타입을 표시
  const handleMouseMove = (event: MouseEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget
    const style = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(style.lineHeight) || 22.75
    const padLeft = Number.parseFloat(style.paddingLeft) || 0
    const padTop = Number.parseFloat(style.paddingTop) || 0
    const rect = el.getBoundingClientRect()
    const x = event.clientX - rect.left + el.scrollLeft - padLeft
    const y = event.clientY - rect.top + el.scrollTop - padTop
    if (x < 0 || y < 0) {
      setHover(null)
      return
    }
    const lines = viewLines
    const lineIndex = Math.floor(y / lineHeight)
    const line = lines[lineIndex]
    if (line === undefined) {
      setHover(null)
      return
    }
    let width = 0
    let column = line.length
    for (let i = 0; i < line.length; i++) {
      const charWidth = measureTextWidth(line[i], style.font)
      // 마우스가 글자의 절반을 넘기면 다음 글자가 아닌 현재 글자로 처리
      if (width + charWidth / 2 >= x) {
        column = i
        break
      }
      width += charWidth
    }
    const lineStart = lines.slice(0, lineIndex).reduce((sum, text) => sum + text.length + 1, 0)
    const offset = lineStart + column
    const sourceOffset = viewToSource[offset] ?? offset
    const top = event.clientY - rect.top + 14
    const left = event.clientX - rect.left + 12

    // 1) 진단 범위(빨간 물결 밑줄)에 마우스가 있으면 오류 메시지 우선
    const diagnostic = checkResult?.diagnostics.find(
      (item) => sourceOffset >= item.start && sourceOffset < item.start + item.length,
    )
    if (diagnostic) {
      setHover({
        kind: 'error',
        message: diagnostic.message,
        line: diagnostic.line,
        column: diagnostic.column,
        top,
        left,
      })
      return
    }

    // 2) 마우스 아래 식별자
    let identStart = column
    let identEnd = column
    while (identStart > 0 && /[A-Za-z0-9_]/.test(line[identStart - 1] ?? '')) identStart--
    while (identEnd < line.length && /[A-Za-z0-9_]/.test(line[identEnd] ?? '')) identEnd++
    const name = line.slice(identStart, identEnd)
    if (!/^[A-Za-z_]/.test(name)) {
      setHover(null)
      return
    }

    // 3) 호출이면 괄호 바로 뒤 커서로 기존 시그니처 해석을 재사용
    let callCursor = identEnd
    while (callCursor < line.length && /\s/.test(line[callCursor] ?? '')) callCursor++
    if (line[callCursor] === '(') {
      const signature = getUnSignatureHelp(view, lineStart + callCursor + 1, nativeFunctions, checkResult)
      if (signature) {
        setHover({ kind: 'signature', signature, top, left })
        return
      }
    }

    // 4) 모듈·빌트인·네이티브 멤버는 lsp.rs hover 와 같은 문서 + 시그니처 라벨
    const qualifier = line[identStart - 1] === '.'
      ? line.slice(0, identStart).match(/[A-Za-z_][A-Za-z0-9_]*\s*$/)?.[0] ?? null
      : null
    const qualifierType = qualifier ? getUnHoverType(view, qualifier, nativeFunctions, checkResult) : null
    const doc = getLspHoverDoc(value, qualifier ?? null, name, qualifierType ?? null)
    if (doc) {
      setHover({ kind: 'doc', label: doc.label, doc: doc.doc, top, left })
      return
    }

    // 5) 그 밖의 식별자는 WASM 추론 결과가 없으면 JS 추론으로 타입 표시
    const type = getUnHoverType(view, name, nativeFunctions, checkResult)
    setHover(type ? { kind: 'type', word: name, type, top, left } : null)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      setAcVisible(false)
      setSigHelp(null)
      onRun()
      return
    }

    // 코드 접기 단축키 (VS Code 계열): Alt+Z 토글, Ctrl+Shift+[ / ] 접기·펼치기
    if (event.altKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      foldAtCaret(!foldedKeys.has(foldRangeAtCaret()?.key ?? ''))
      return
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === '[' || event.key === ']')) {
      event.preventDefault()
      foldAtCaret(event.key === '[')
      return
    }
    if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      setFoldedKeys(new Set(foldRanges.map((range) => range.key)))
      return
    }
    if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'j') {
      event.preventDefault()
      setFoldedKeys(new Set())
      return
    }

    // 자동완성이 열려 있을 때 키 처리
    if (acVisible && acCandidates.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setAcSelected((i) => (i + 1) % acCandidates.length)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setAcSelected((i) => (i - 1 + acCandidates.length) % acCandidates.length)
        return
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        const selected = acCandidates[acSelected]
        if (selected) applyCandidate(selected)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        setAcVisible(false)
        setSigHelp(null)
        return
      }
    }

    if (event.key === 'Escape') {
      setAcVisible(false)
      setSigHelp(null)
      return
    }

    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      setAcVisible(false)
      requestAnimationFrame(() => updateSignatureHelp(textareaRef.current, view, 0))
    }

    // undo/redo — 팝업 계열 UI도 함께 닫기
    if ((event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === 'z' || event.key.toLowerCase() === 'y')) {
      setAcVisible(false)
      setSigHelp(null)
    }

    if (event.key === 'Tab') {
      event.preventDefault()
      const el = event.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const nextView = `${view.slice(0, start)}    ${view.slice(end)}`
      pendingViewCursorRef.current = start + 4
      onChange(applyUnFoldedViewChange(view, nextView, viewToSource, value))
    }
  }

  return (
    <div className="editor-pane">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={handleRun} title="실행 (Ctrl+Enter)" aria-label="실행">
            <ToolbarIcon name="play" />
          </button>
        </div>
        <span className="toolbar-divider" />
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={onUndo} title="실행 취소 (Ctrl+Z)" aria-label="실행 취소">
            <ToolbarIcon name="undo" />
          </button>
          <button className="toolbar-btn" onClick={onRedo} title="다시 실행 (Ctrl+Y)" aria-label="다시 실행">
            <ToolbarIcon name="redo" />
          </button>
        </div>
        <span className="toolbar-divider" />
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={handleCopy} title="코드 복사" aria-label={copied ? '복사됨' : '코드 복사'}>
            <ToolbarIcon name={copied ? 'check' : 'copy'} />
          </button>
          <button className="toolbar-btn" onClick={handleCut} title="선택 영역 잘라내기 (Ctrl+X)" aria-label="잘라내기">
            <ToolbarIcon name="cut" />
          </button>
          <button className="toolbar-btn" onClick={handleSelectAll} title="모두 선택 (Ctrl+A)" aria-label="모두 선택">
            <ToolbarIcon name="select" />
          </button>
          <button className="toolbar-btn" onClick={handleReset} title="기본 코드로 초기화" aria-label="기본 코드로 초기화">
            <ToolbarIcon name="reset" />
          </button>
        </div>
        <div className="toolbar-tail">
          <div className="toolbar-group">
            <button
              className="toolbar-btn"
              data-active={typeCheckEnabled}
              onClick={() => onToggleTypeCheck(!typeCheckEnabled)}
              title={typeCheckEnabled ? '타입 검사 켜짐 · 정적 검사 + 실행' : '타입 검사 꺼짐 · 실행만'}
              aria-label="타입 검사"
              aria-pressed={typeCheckEnabled}
            >
              <ToolbarIcon name="typecheck" />
            </button>
          </div>
        </div>
      </div>
      <div className="code-editor">
        <div className="code-gutter">
        <pre ref={gutterRef}>
          {viewLines.map((_, viewLine) => {
            const range = foldByViewLine.get(viewLine)
            const folded = range ? foldedKeys.has(range.key) : false
            return (
              <div className="gutter-line" key={visibleSourceLines[viewLine]}>
                {range && (
                  <button
                    type="button"
                    className="fold-toggle"
                    data-folded={folded}
                    title={folded ? '펼치기 (Alt+Z · Ctrl+Shift+])' : '접기 (Alt+Z · Ctrl+Shift+[)'}
                    aria-label={`${range.label} ${folded ? '펼치기' : '접기'}`}
                    onClick={() => toggleFold(range)}
                  >
                    <svg viewBox="0 0 10 10" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d={folded ? 'M3.6 2.4 6.2 5 3.6 7.6' : 'M2.4 3.6 5 6.2 7.6 3.6'} />
                    </svg>
                  </button>
                )}
                <span className="gutter-number">{visibleSourceLines[viewLine] + 1}</span>
              </div>
            )
          })}
        </pre>
      </div>
      <div className="code-surface">
        <pre aria-hidden="true" className="code-highlight">
          <code ref={highlightRef} dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
        {foldHints.map((hint) => (
          <svg
            key={hint.key}
            className="fold-hint"
            aria-hidden="true"
            viewBox="0 0 18 14"
            style={{ top: hint.top, left: hint.left }}
          >
            <circle cx="3" cy="7" r="1.3" fill="currentColor" />
            <circle cx="9" cy="7" r="1.3" fill="currentColor" />
            <circle cx="15" cy="7" r="1.3" fill="currentColor" />
          </svg>
        ))}
        <textarea
          ref={textareaRef}
          className="code-input"
          aria-label="Un source code"
          value={view}
          onChange={handleTextChange}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHover(null)}
          onScroll={(event) => {
            syncScroll(event.currentTarget)
            setHover(null)
            if (acVisible || sigHelp) {
              positionPopups(
                event.currentTarget,
                event.currentTarget.selectionStart ?? 0,
                view,
                acVisible ? acCandidates.length : 0,
              )
            }
          }}
          onBlur={() => {
            setAcVisible(false)
            setSigHelp(null)
            setHover(null)
          }}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
        />
        {hover && hover.kind === 'signature' ? (
          <div
            className="signature-help"
            role="tooltip"
            style={{ top: hover.top, left: hover.left }}
          >
            <SignatureHelpBody
              label={hover.signature.label}
              doc={hover.signature.description}
              example={hover.signature.example}
              activeIndex={hover.signature.activeIndex}
              docFirst
            />
          </div>
        ) : hover && hover.kind === 'doc' ? (
          <div
            className="signature-help"
            role="tooltip"
            style={{ top: hover.top, left: hover.left }}
          >
            <SignatureHelpBody label={hover.label} doc={hover.doc} docFirst />
          </div>
        ) : hover && (
          <div
            className={`type-hover${hover.kind === 'error' ? ' error' : ''}`}
            role="tooltip"
            style={{ top: hover.top, left: hover.left }}
          >
            {hover.kind === 'error' ? (
              <>
                <span className="type-hover-pos">{hover.line + 1}:{hover.column + 1}</span>
                <span className="type-hover-message">{hover.message}</span>
              </>
            ) : (
              <>
                <span className="type-hover-name">{hover.word}</span>
                <span className="type-hover-colon">: </span>
                <span className="type-hover-type">{hover.type}</span>
              </>
            )}
          </div>
        )}
        {sigHelp && (
          <div
            className="signature-help"
            role="tooltip"
            style={{ top: sigPos.top, left: sigPos.left }}
          >
            <SignatureHelpBody
              label={sigHelp.label}
              doc={sigHelp.description}
              example={sigHelp.example}
              activeIndex={sigHelp.activeIndex}
            />
          </div>
        )}
        {acVisible && acCandidates.length > 0 && (
          <ul
            ref={acListRef}
            className="autocomplete-dropdown"
            role="listbox"
            aria-label="Autocomplete suggestions"
            style={{ top: dropPos.top, left: dropPos.left }}
          >
            {acCandidates.map((candidate, index) => {
              const signature = completionSignature(candidate, nativeFunctions, checkResult)
              return (
                <li
                  key={`${candidate.label}-${index}`}
                  role="option"
                  aria-selected={index === acSelected}
                  data-kind={candidate.kind}
                  className={`autocomplete-item${index === acSelected ? ' selected' : ''}`}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    applyCandidate(candidate)
                  }}
                  onMouseEnter={() => setAcSelected(index)}
                >
                  <span className="ac-kind" role="img" aria-label={KIND_TITLE[candidate.kind]} title={KIND_TITLE[candidate.kind]}>
                    <CompletionKindIcon kind={candidate.kind} />
                  </span>
                  <span className="ac-label">{candidate.label}</span>
                  {signature && <span className="ac-detail">{signature}</span>}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      </div>
    </div>
  )
}

function TerminalPanel({
  phase,
  result,
  presentation,
  transcript,
  onContinue,
  onFinish,
}: {
  phase: Phase
  result: ExecutionSnapshot | null
  presentation: ConsolePresentation | null
  transcript: string
  onContinue: (value: string, allowEof?: boolean) => void
  onFinish: () => void
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [phase, result, transcript, draft])

  useEffect(() => {
    if (phase === 'waiting') inputRef.current?.focus()
  }, [phase])

  const shownTranscript = transcript.replace(/\n+$/, '')

  const focusInput = () => {
    if (window.getSelection()?.toString()) return
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      if (draft.length > 0) onContinue(draft, true)
      else onFinish()
      setDraft('')
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      onContinue(draft, false)
      setDraft('')
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing) return
    setDraft(event.target.value)
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false)
    setDraft((event.target as HTMLInputElement).value)
  }

  return (
    <aside className="pane pane-terminal">
      <div ref={bodyRef} className="terminal-body" aria-live="polite" onClick={focusInput}>
        {phase === 'idle' && (
          <div className="terminal-line">
            <span className="terminal-prompt">❯</span>
            <span className="terminal-hint">⌘/Ctrl + Enter to run · ⌘/Ctrl + K to clear</span>
          </div>
        )}

        {phase === 'running' && !shownTranscript && (
          <div className="terminal-line">
            <span className="terminal-prompt">❯</span>
            <span className="terminal-hint">running…</span>
          </div>
        )}

        {shownTranscript && (
          <div className="terminal-out" dangerouslySetInnerHTML={{ __html: shownTranscript }} />
        )}

        {phase === 'running' && shownTranscript && (
          <div className="terminal-running">
            <span className="spinner" aria-hidden="true" />
          </div>
        )}

        {phase === 'done' && result && presentation && presentation.tone !== 'success' && (
          <pre className="terminal-err">{presentation.detail.trim()}</pre>
        )}

        {phase === 'done' && result && presentation?.tone === 'success' && !shownTranscript && (
          <div className="terminal-hint">(no output)</div>
        )}

        {phase === 'waiting' && (
          <>
            {draft.length > 0 && <div className="terminal-separator" />}
            <div className="terminal-line terminal-input-line" data-waiting="true">
              <input
                ref={inputRef}
                className="terminal-input"
                value={draft}
                onChange={handleChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onKeyDown={handleKeyDown}
                placeholder="input"
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal input"
              />
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

export default function Home() {
  const [source, setSource] = useState(() => {
    if (typeof window === 'undefined') return PLAYGROUND_DEFAULT_SOURCE
    try {
      const saved = window.localStorage.getItem(PLAYGROUND_STORAGE_KEYS.source)
      return restoreSavedSource(saved && saved.trim().length > 0 ? saved : null)
    } catch {
      return PLAYGROUND_DEFAULT_SOURCE
    }
  })
  const [typeCheckEnabled, setTypeCheckEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      return restoreTypeCheckPreference(window.localStorage.getItem(PLAYGROUND_STORAGE_KEYS.typeCheck))
    } catch {
      return true
    }
  })
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<ExecutionSnapshot | null>(null)
  const [transcript, setTranscript] = useState('')

  const workspaceRef = useRef<HTMLElement>(null)
  const [leftPct, setLeftPct] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const sourceRef = useRef(source)
  sourceRef.current = source
  const phaseRef = useRef<Phase>(phase)
  const sessionInputsRef = useRef<string[]>([])
  const insertionsRef = useRef<InputInsertion[]>([])
  const lastStdoutRef = useRef('')
  const runSourceRef = useRef('')

  // Undo/Redo history
  const historyRef = useRef<string[]>([source])
  const historyIndexRef = useRef(0)

  const { nativeFunctions, checkResult: rawCheckResult } = useWasm(source, typeCheckEnabled)
  const checkResult = typeCheckEnabled ? rawCheckResult : null

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PLAYGROUND_STORAGE_KEYS.typeCheck,
        typeCheckEnabled ? 'on' : 'off',
      )
    } catch {
      /* storage unavailable */
    }
  }, [typeCheckEnabled])

  const changePhase = (next: Phase) => {
    phaseRef.current = next
    setPhase(next)
  }

  // Source history for undo/redo
  const addToHistory = (next: string) => {
    if (historyRef.current[historyIndexRef.current] === next) return
    // Remove any forward history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(next)
    historyIndexRef.current = historyRef.current.length - 1
  }

  const doUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1
      isRestoringRef.current = true
      const prev = historyRef.current[historyIndexRef.current]
      setSource(prev)
    }
  }

  const doRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1
      isRestoringRef.current = true
      const next = historyRef.current[historyIndexRef.current]
      setSource(next)
    }
  }

  const resetSource = () => {
    addToHistory(PLAYGROUND_DEFAULT_SOURCE)
    setSource(PLAYGROUND_DEFAULT_SOURCE)
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(PLAYGROUND_STORAGE_KEYS.source, source)
    } catch {
      /* storage unavailable */
    }
  }, [source])

  // Track source changes for history (skip when we're setting from undo/redo)
  const isRestoringRef = useRef(false)

  useEffect(() => {
    if (isRestoringRef.current) {
      isRestoringRef.current = false
      return
    }
    addToHistory(source)
  }, [source])

  useEffect(() => {
    if (!isDragging) return

    const update = (clientX: number) => {
      const el = workspaceRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0) return
      const pct = ((clientX - rect.left) / rect.width) * 100
      setLeftPct(Math.min(76, Math.max(24, pct)))
    }

    const onMove = (event: MouseEvent) => update(event.clientX)
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches[0]) update(event.touches[0].clientX)
    }
    const stop = () => setIsDragging(false)

    window.addEventListener('mousemove', onMove as unknown as EventListener)
    window.addEventListener('mouseup', stop)
    window.addEventListener('touchmove', onTouchMove as unknown as EventListener)
    window.addEventListener('touchend', stop)

    const previousUserSelect = document.body.style.userSelect
    const previousCursor = document.body.style.cursor
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    return () => {
      window.removeEventListener('mousemove', onMove as unknown as EventListener)
      window.removeEventListener('mouseup', stop)
      window.removeEventListener('touchmove', onTouchMove as unknown as EventListener)
      window.removeEventListener('touchend', stop)
      document.body.style.userSelect = previousUserSelect
      document.body.style.cursor = previousCursor
    }
  }, [isDragging])

  const presentation = useMemo(() => (result ? presentExecution(result) : null), [result])

  // 입력한 줄은 dimmed span으로, 나머지 출력은 이스케이프한 뒤 그대로 이어 붙인다
  const renderTranscript = (stdout: string) => {
    const insertions = insertionsRef.current
    if (insertions.length === 0) return escapeHtml(stdout)

    const ordered = [...insertions].sort((a, b) => a.at - b.at)
    let out = ''
    let cursor = 0
    for (const insertion of ordered) {
      if (insertion.at < cursor || insertion.at > stdout.length) continue
      out += escapeHtml(stdout.slice(cursor, insertion.at))
      out += `<span class="terminal-transcript-input">${escapeHtml(insertion.value)}</span>\n`
      cursor = insertion.at
    }
    out += escapeHtml(stdout.slice(cursor))
    return out
  }

  const executeRun = async (inputs: string[], allowEof: boolean, isContinuation: boolean) => {
    if (phaseRef.current === 'running') return

    const sourceValue = sourceRef.current

    if (!sourceValue.trim()) {
      setResult({
        status: 'rejected',
        stdout: '',
        stderr: '',
        durationMs: 0,
        error: { kind: 'validation', message: 'Write some code first.' },
      })
      changePhase('done')
      return
    }

    if (sourceValue.length > MAX_PLAYGROUND_SOURCE_CHARS) {
      setResult({
        status: 'rejected',
        stdout: '',
        stderr: '',
        durationMs: 0,
        error: { kind: 'validation', message: `Code must be ${MAX_PLAYGROUND_SOURCE_CHARS.toLocaleString()} characters or fewer.` },
      })
      changePhase('done')
      return
    }

    if (!isContinuation) {
      insertionsRef.current = []
      lastStdoutRef.current = ''
      runSourceRef.current = sourceValue
      setTranscript('')
      setResult(null)
    }

    changePhase('running')
    const started = performance.now()

    try {
      const raw = await runUnScript(sourceValue, inputs, allowEof)
      const stdout = String(raw?.stdout ?? '')
      const error = raw?.error ?? null
      const timedOut = Boolean(raw?.timedOut)
      const needsInput = Boolean(raw?.needsInput)
      const durationMs = Math.round(performance.now() - started)

      if (isContinuation && !stdout.startsWith(lastStdoutRef.current)) {
        insertionsRef.current = []
      }

      lastStdoutRef.current = stdout
      const display = renderTranscript(stdout)
      setTranscript(display)

      if (needsInput && !timedOut) {
        setResult(null)
        changePhase('waiting')
        return
      }

      if (timedOut) {
        setResult({
          status: 'timed_out',
          stdout: display,
          stderr: '',
          durationMs,
          error: { kind: 'timeout', message: error ?? 'Execution timed out.' },
        })
      } else if (error) {
        const message = String(error)
        const kind = /not allowed/i.test(message)
          ? 'policy'
          : /\b(syntax|expected|unexpected|invalid)\b/i.test(message)
            ? 'syntax'
            : 'runtime'
        setResult({ status: 'error', stdout: display, stderr: message, durationMs, error: { kind, message } })
      } else {
        setResult({ status: 'success', stdout: display, stderr: '', durationMs })
      }

      changePhase('done')
    } catch (error: any) {
      const message = String(error?.message ?? error)
      setResult({
        status: 'error',
        stdout: '',
        stderr: message,
        durationMs: Math.round(performance.now() - started),
        error: { kind: 'service', message },
      })
      changePhase('done')
    }
  }

  const startRun = () => {
    if (phaseRef.current === 'running') return
    sessionInputsRef.current = []
    void executeRun([], false, false)
  }

  const continueRun = (value: string, allowEof = false) => {
    if (phaseRef.current !== 'waiting') return
    if (runSourceRef.current !== sourceRef.current) {
      insertionsRef.current = []
      lastStdoutRef.current = ''
      setTranscript('')
      runSourceRef.current = sourceRef.current
    }
    const at = lastStdoutRef.current.length
    insertionsRef.current = [...insertionsRef.current, { at, value, kind: 'input' }]
    const inputs = [...sessionInputsRef.current, value]
    sessionInputsRef.current = inputs
    void executeRun(inputs, allowEof, true)
  }

  const finishRun = () => {
    if (phaseRef.current !== 'waiting') return
    void executeRun(sessionInputsRef.current, true, true)
  }

  const handleRunShortcut = () => {
    if (phaseRef.current === 'running') return
    if (phaseRef.current === 'waiting') {
      finishRun()
      return
    }
    startRun()
  }

  const runRef = useRef(handleRunShortcut)
  useEffect(() => {
    runRef.current = handleRunShortcut
  })

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.isComposing) return
      if (!(event.metaKey || event.ctrlKey)) return

      if (event.key === 'Enter') {
        event.preventDefault()
        runRef.current()
        return
      }

      if (event.key.toLowerCase() === 'z') {
        event.preventDefault()
        doUndo()
        return
      }

      if (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey)) {
        event.preventDefault()
        doRedo()
        return
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="app">
      <main
        ref={workspaceRef}
        className="workspace"
        style={{ '--editor-width': `${leftPct}%` } as CSSProperties}
      >
        <section className="pane pane-editor">
          <SourceEditor
            value={source}
            onChange={setSource}
            onRun={handleRunShortcut}
            nativeFunctions={nativeFunctions}
            checkResult={checkResult}
            onUndo={doUndo}
            onRedo={doRedo}
            onReset={resetSource}
            typeCheckEnabled={typeCheckEnabled}
            onToggleTypeCheck={setTypeCheckEnabled}
          />
        </section>

        <div
          className="resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panes"
          aria-valuenow={Math.round(leftPct)}
          aria-valuemin={24}
          aria-valuemax={76}
          data-dragging={isDragging}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onDoubleClick={() => setLeftPct(50)}
        />

        <TerminalPanel
          phase={phase}
          result={result}
          presentation={presentation}
          transcript={transcript}
          onContinue={continueRun}
          onFinish={finishRun}
        />
      </main>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Home />)
  if (import.meta.hot) {
    import.meta.hot.dispose(() => root.unmount())
  }
}
