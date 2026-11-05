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
  type ConsolePresentation,
  type ExecutionSnapshot,
} from './lib/playground'
import { useWasm } from './hooks/useWasm'

type Phase = 'idle' | 'running' | 'waiting' | 'done'

type InputInsertion = { at: number; value: string; kind: 'input' | 'output' }

/* ── Source Editor ──────────────────────────────────────────────────── */
function SourceEditor({
  value,
  onChange,
  onRun,
}: {
  value: string
  onChange: (next: string) => void
  onRun: () => void
}) {
  const highlightRef = useRef<HTMLElement>(null)
  const gutterRef = useRef<HTMLPreElement>(null)

  const highlighted = useMemo(() => highlightUnSource(value), [value])
  const lineNumbers = useMemo(() => getEditorLineNumbers(value), [value])

  const syncScroll = (el: HTMLTextAreaElement) => {
    if (gutterRef.current) {
      gutterRef.current.style.transform = `translateY(-${el.scrollTop}px)`
    }
    if (highlightRef.current) {
      highlightRef.current.style.transform = `translate(${-el.scrollLeft}px, -${el.scrollTop}px)`
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      onRun()
      return
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
    <div className="code-editor">
      <div className="code-gutter" aria-hidden="true">
        <pre ref={gutterRef}>{lineNumbers}</pre>
      </div>
      <div className="code-surface">
        <pre aria-hidden="true" className="code-highlight">
          <code ref={highlightRef} dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
        <textarea
          className="code-input"
          aria-label="Un source code"
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            syncScroll(event.target)
          }}
          onScroll={(event) => syncScroll(event.currentTarget)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
        />
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

  const { wasmReady } = useWasm()

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

  const renderTranscript = (stdout: string) => {
    const insertions = insertionsRef.current
    if (insertions.length === 0) return stdout

    const ordered = [...insertions].sort((a, b) => a.at - b.at)
    let out = ''
    let cursor = 0
    for (const insertion of ordered) {
      if (insertion.at < cursor || insertion.at > stdout.length) continue
      out += stdout.slice(cursor, insertion.at)
      out += insertion.value
      out += '\n'
      cursor = insertion.at
    }
    out += stdout.slice(cursor)
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

    if (sourceValue.length > MAX_SOURCE) {
      setResult({
        status: 'rejected',
        stdout: '',
        stderr: '',
        durationMs: 0,
        error: { kind: 'validation', message: `Code must be ${MAX_SOURCE.toLocaleString()} characters or fewer.` },
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
    const invoke = window.dotnetInvoke

    if (typeof invoke !== 'function') {
      setResult({
        status: 'error',
        stdout: '',
        stderr: '',
        durationMs: Math.round(performance.now() - started),
        error: { kind: 'service', message: 'The WASM runtime is still loading. Try again in a moment.' },
      })
      changePhase('done')
      return
    }

    try {
      try {
        await invoke('SetStdin', inputs.join('\n'))
      } catch {
        /* stdin is optional */
      }

      const raw: any = await invoke('Run', sourceValue)
      const stdout = String(raw?.stdout ?? raw?.Stdout ?? '')
      const error = raw?.error ?? raw?.Error ?? null
      const timedOut = raw?.timedOut ?? raw?.TimedOut ?? false
      const needsInput = Boolean(raw?.needsInput ?? raw?.NeedsInput)
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
        stdout: transcript,
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
          <SourceEditor value={source} onChange={setSource} onRun={handleRunShortcut} />
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
