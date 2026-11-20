import './index.css'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { createRoot } from 'react-dom/client'
import {
  getEditorLineNumbers,
  highlightUnSource,
  MAX_PLAYGROUND_SOURCE_CHARS,
  PLAYGROUND_DEFAULT_SOURCE,
  PLAYGROUND_STORAGE_KEYS,
  presentExecution,
  restoreSavedSource,
  restoreTypeCheckPreference,
  applyUnAutocompleteCandidate,
  getUnObjectMethodCandidates,
  getUnAutocompleteCandidates,
  getUnAutocompleteRange,
  isUnInsideString,
  getUnSignatureHelp,
  type ConsolePresentation,
  type ExecutionSnapshot,
  type UnAutocompleteCandidate,
  type UnNativeFunctionMetadata,
  type UnSignatureHelp,
} from './lib/playground'
import type { UnCheckResult } from './lib/wasmClient'
import { useWasm } from './hooks/useWasm'
import { runUnScript } from './lib/wasmClient'

type Phase = 'idle' | 'running' | 'waiting' | 'done'

type InputInsertion = { at: number; value: string; kind: 'input' | 'output' }

type HoverInfo =
  | { kind: 'error'; message: string; line: number; column: number; top: number; left: number }
  | { kind: 'type'; word: string; type: string; top: number; left: number }

const KIND_LABEL: Record<UnAutocompleteCandidate['kind'], string> = {
  keyword: 'kw',
  function: 'fn',
  method: 'mt',
  property: 'prop',
  variable: 'var',
  argument: 'arg',
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

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
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const [sigHelp, setSigHelp] = useState<UnSignatureHelp | null>(null)
  const [sigPos, setSigPos] = useState({ top: 0, left: 0 })
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (checkResult === null) setHover(null)
  }, [checkResult])

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
    void copyText(value.slice(start, end))
    onChange(value.slice(0, start) + value.slice(end))
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

  const highlighted = useMemo(
    () => highlightUnSource(value, checkResult?.diagnostics ?? []),
    [value, checkResult],
  )
  const lineNumbers = useMemo(() => getEditorLineNumbers(value), [value])

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
    const acHeight = acCount > 0 ? 8 + 26 * acCount + 4 : 0
    setSigPos({ top: caret.top + acHeight, left: caret.left })
  }

  const updateSignatureHelp = (el: HTMLTextAreaElement | null, text: string, acCount = 0) => {
    if (!el) return
    const cursor = el.selectionStart ?? text.length
    setSigHelp(getUnSignatureHelp(text, cursor, nativeFunctions))
    positionPopups(el, cursor, text, acCount)
  }

  const refreshAutocomplete = (text: string, cursor: number): number => {
    if (isUnInsideString(text, cursor)) {
      setAcVisible(false)
      return 0
    }
    // io. / math. 같은 dot 컨텍스트가 우선
    const dotCandidates = getUnObjectMethodCandidates(text, cursor, nativeFunctions)
    const range = getUnAutocompleteRange(text, cursor)
    const next = dotCandidates !== null
      ? dotCandidates
      : range.query.length > 0
        ? getUnAutocompleteCandidates(text, range.query, nativeFunctions)
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
    const cursor = el?.selectionStart ?? value.length
    const range = getUnAutocompleteRange(value, cursor)
    const applied = applyUnAutocompleteCandidate(value, range, candidate)
    onChange(applied.source)
    setAcVisible(false)
    requestAnimationFrame(() => {
      const target = textareaRef.current
      if (target) {
        target.selectionStart = target.selectionEnd = applied.cursor
        target.focus()
        updateSignatureHelp(target, applied.source, 0)
      }
    })
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value
    onChange(text)
    syncScroll(event.target)
    const cursor = event.target.selectionStart ?? text.length
    const acCount = refreshAutocomplete(text, cursor)
    setSigHelp(getUnSignatureHelp(text, cursor, nativeFunctions))
    positionPopups(event.target, cursor, text, acCount)
  }

  const syncScroll = (el: HTMLTextAreaElement) => {
    if (gutterRef.current) {
      gutterRef.current.style.transform = `translateY(-${el.scrollTop}px)`
    }
    if (highlightRef.current) {
      highlightRef.current.style.transform = `translate(${-el.scrollLeft}px, -${el.scrollTop}px)`
    }
  }

  // 빨간 밑줄(진단) 위에서는 오류 메시지를, 그 외에는 추론 타입을 표시
  const handleMouseMove = (event: MouseEvent<HTMLTextAreaElement>) => {
    if (!checkResult) {
      setHover(null)
      return
    }
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
    const lines = value.split('\n')
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
    const top = event.clientY - rect.top + 14
    const left = event.clientX - rect.left + 12

    // 1) 진단 범위(빨간 물결 밑줄)에 마우스가 있으면 오류 메시지 우선
    const diagnostic = checkResult.diagnostics.find(
      (item) => offset >= item.start && offset < item.start + item.length,
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

    // 2) 그 밖의 식별자는 WASM 추론 타입
    let word: string | null = null
    const identifier = /[A-Za-z_][A-Za-z0-9_]*/g
    let match: RegExpExecArray | null
    while ((match = identifier.exec(line)) !== null) {
      if (column >= match.index && column <= match.index + match[0].length) {
        word = match[0]
        break
      }
    }
    if (!word) {
      setHover(null)
      return
    }
    const type =
      checkResult.vars.find(([name]) => name === word)?.[1] ??
      checkResult.fnReturns.find(([name]) => name === word)?.[1] ??
      null
    setHover(type ? { kind: 'type', word, type, top, left } : null)
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
      requestAnimationFrame(() => updateSignatureHelp(textareaRef.current, value, 0))
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
      onChange(`${value.slice(0, start)}    ${value.slice(end)}`)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4
      })
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
        <div className="code-gutter" aria-hidden="true">
        <pre ref={gutterRef}>{lineNumbers}</pre>
      </div>
      <div className="code-surface">
        <pre aria-hidden="true" className="code-highlight">
          <code ref={highlightRef} dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
        <textarea
          ref={textareaRef}
          className="code-input"
          aria-label="Un source code"
          value={value}
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
                value,
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
        {hover && (
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
            <div className="signature-help-signature">
              <span className="signature-help-name">{sigHelp.displayName}</span>
              <span className="signature-help-parens">(</span>
              {sigHelp.parameters.map((parameter, index) => (
                <span key={`${parameter.name}-${index}`}>
                  <span className={`signature-help-param${index === sigHelp.activeIndex ? ' active' : ''}`}>
                    {parameter.positional ? '...' : ''}{parameter.name}{parameter.optional ? '?' : ''}: {parameter.expectedType}
                  </span>
                  {index < sigHelp.parameters.length - 1 && <span className="signature-help-sep">, </span>}
                </span>
              ))}
              <span className="signature-help-parens">) → </span>
              <span className="signature-help-return">{sigHelp.returnType}</span>
            </div>
            {sigHelp.description && (
              <div className="signature-help-description">{sigHelp.description}</div>
            )}
            {sigHelp.example && (
              <code className="signature-help-example">{sigHelp.example}</code>
            )}
          </div>
        )}
        {acVisible && acCandidates.length > 0 && (
          <ul
            className="autocomplete-dropdown"
            role="listbox"
            aria-label="Autocomplete suggestions"
            style={{ top: dropPos.top, left: dropPos.left }}
          >
            {acCandidates.map((candidate, index) => (
              <li
                key={`${candidate.label}-${index}`}
                role="option"
                aria-selected={index === acSelected}
                className={`autocomplete-item${index === acSelected ? ' selected' : ''}`}
                onMouseDown={(event) => {
                  event.preventDefault()
                  applyCandidate(candidate)
                }}
                onMouseEnter={() => setAcSelected(index)}
              >
                <span className="ac-kind">{KIND_LABEL[candidate.kind]}</span>
                <span className="ac-label">{candidate.label}</span>
              </li>
            ))}
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
  onStart,
  onContinue,
  onFinish,
}: {
  phase: Phase
  result: ExecutionSnapshot | null
  presentation: ConsolePresentation | null
  transcript: string
  onStart: (stdinOverride?: string) => void
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
      if (phase === 'waiting') {
        if (draft.length > 0) onContinue(draft, true)
        else onFinish()
        setDraft('')
        return
      }
      if (phase === 'running') return
      setDraft('')
      onStart()
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (phase === 'running') return
      if (phase === 'waiting') {
        onContinue(draft, false)
        setDraft('')
        return
      }
      setDraft('')
      onStart()
      return
    }

    if (phase !== 'waiting') {
      event.preventDefault()
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

        {draft.length > 0 && <div className="terminal-separator" />}

        <div className="terminal-line terminal-input-line" data-waiting={phase === 'waiting'}>
          <input
            ref={inputRef}
            className="terminal-input"
            value={draft}
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
            disabled={phase !== 'waiting'}
            placeholder={phase === 'waiting' ? 'input' : undefined}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
          />
        </div>
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
          onStart={startRun}
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
