import './index.css'
import React, { type ChangeEvent, type KeyboardEvent, type UIEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { animate } from 'animejs'
import {
  FileCode2,
  FolderUp,
  Copy,
  Download,
  Play,
  AlertTriangle,
  Keyboard,
  Clock3,
  TerminalSquare,
  Check,
  Square,
  FileText,
} from 'lucide-react'
import { trackEvent } from './lib/analytics'
import {
  applyUnAutocompleteCandidate,
  applyUnPairedCharacterEdit,
  createUnExportFilename,
  extractUnClassNames,
  findUnInlineSyntaxDiagnostic,
  getEditorLineNumbers,
  getUnAutocompleteCandidates,
  getUnAutocompletePreview,
  getUnAutocompleteRange,
  getUnAutocompleteTypeHint,
  getUnFunctionArgumentCandidates,
  getUnObjectMethodCandidates,
  getUsedNativeModuleMap,
  hasUnexportedSourceChanges,
  highlightUnSource,
  NATIVE_TYPE_FOR_MODULE,
  normalizeUnExportFilename,
  parseUnSyntaxDiagnostic,
  PLAYGROUND_DEFAULT_SOURCE,
  PLAYGROUND_STORAGE_KEYS,
  presentExecution,
  restoreSavedSource,
  validateImportedUnFile,
  type UnAutocompleteCandidate,
  type UnSyntaxDiagnostic,
} from './lib/playground'
import { useWasm } from './hooks/useWasm'

const MAX_SOURCE_CHARS = 12_000

type ExecutionResult = {
  status: 'success' | 'error' | 'rejected' | 'timed_out' | 'cancelled'
  stdout: string
  stderr: string
  durationMs: number
  error?: { kind: string; message: string }
}

// minimal useComposition hook (from GOAL)
function useComposition<E extends HTMLElement>(opts: { onKeyDown: (e: KeyboardEvent<E>) => void; onCompositionStart: () => void; onCompositionEnd: () => void }) {
  const composingRef = useRef(false)
  return {
    onCompositionStart: (e: React.CompositionEvent<E>) => { composingRef.current = true; opts.onCompositionStart() },
    onCompositionEnd: (e: React.CompositionEvent<E>) => { composingRef.current = false; opts.onCompositionEnd() },
    onKeyDown: (e: KeyboardEvent<E>) => {
      if ((e.nativeEvent as any).isComposing || composingRef.current) return
      opts.onKeyDown(e)
    },
  } as any
}

function SourceEditor({ source, onChange, onRun, disabled, syntaxDiagnostic, nativeFunctions }: {
  source: string; onChange: (v: string) => void; onRun: () => void; disabled: boolean; syntaxDiagnostic: UnSyntaxDiagnostic | null; nativeFunctions: readonly UnNativeFunctionMetadata[]
}) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const lineGutterContentRef = useRef<HTMLPreElement>(null)
  const highlightContentRef = useRef<HTMLElement>(null)
  const [cursor, setCursor] = useState(0)
  const [scrollPosition, setScrollPosition] = useState({ left: 0, top: 0 })
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [completionOpen, setCompletionOpen] = useState(false)
  const [isComposingInput, setIsComposingInput] = useState(false)
  const lineNumbers = getEditorLineNumbers(source)
  const highlightedSource = useMemo(() => highlightUnSource(source, syntaxDiagnostic), [source, syntaxDiagnostic])
  const completionRange = useMemo(() => getUnAutocompleteRange(source, cursor), [source, cursor])
  const suggestions = useMemo(() => {
    // 문자열(" ' `) 또는 주석(#) 안에서는 자동완성 비활성화
    const isInStringOrComment = (() => {
      let inString: string | null = null
      let inComment = false
      for (let i = 0; i < cursor; i++) {
        const ch = source[i]
        if (inString) {
          if (ch === '\\') { i++; continue }
          if (ch === inString) inString = null
        } else if (inComment) {
          if (ch === '\n') inComment = false
        } else {
          if (ch === '"' || ch === "'" || ch === '`') inString = ch
          else if (ch === '#') inComment = true
        }
      }
      return !!inString || inComment
    })()
    if (isInStringOrComment) return []
    // use <module> 자동완성 — 빈 쿼리(use )와 부분 입력(use i) 모두 처리
    const beforeForUse = source.slice(0, completionRange.start)
    if (/\buse\s*$/.test(beforeForUse)) {
      const mods = ["io","fs","math","iter","re","random","sys","time","http","ws","inspect","flow","builtin"]
      const q = completionRange.query.toLowerCase()
      const filtered = q ? mods.filter(m => m.toLowerCase().startsWith(q)) : mods
      if (filtered.length > 0) return filtered.map(m => ({ label: m, kind: "variable" as const, detail: "module" }))
      // 부분 입력이지만 일치하는 모듈이 없으면 일반 후보로 fallback
      if (q) return []
    }
    if (!completionRange.query) {
      const before = source.slice(0, cursor)
      if (/:\s*$/.test(before)) {
        const types = ["int","str","bool","float","list","dict","set","tuple","json","type","any"]
        const classes = extractUnClassNames(source)
        const allTypes = [...types, ...classes]
        // use한 모듈의 NativeType도 함께 제안 (예: use io → stream)
        const usedMap = getUsedNativeModuleMap(source)
        for (const mod of usedMap.values()) {
          const nativeTypes = NATIVE_TYPE_FOR_MODULE[mod]
          if (nativeTypes) allTypes.push(...nativeTypes)
        }
        const uniqueTypes = [...new Set(allTypes)]
        return uniqueTypes.map(t => ({ label: t, kind: "variable" as const, detail: (["int","str","bool","float","list","dict","set","tuple","json","type","any"] as string[]).includes(t) ? "builtin type" : (NATIVE_TYPE_FOR_MODULE as any)[t] ? "native type" : "class" }))
      }
    }
    const objectMethodCandidates = getUnObjectMethodCandidates(source, cursor, nativeFunctions, 50)
    if (objectMethodCandidates) return objectMethodCandidates.slice(0, 50)
    const candidates = new Map<string, UnAutocompleteCandidate>()
    ;[...getUnFunctionArgumentCandidates(source, cursor, nativeFunctions), ...getUnAutocompleteCandidates(source, completionRange.query, nativeFunctions, 50)].forEach((candidate: any) => {
      if (!candidates.has(candidate.label)) candidates.set(candidate.label, candidate as UnAutocompleteCandidate)
    })
    return Array.from(candidates.values()).slice(0, 50) as any
  }, [completionRange.query, cursor, nativeFunctions, source])
  const showCompletions = !disabled && !isComposingInput && completionOpen && suggestions.length > 0
  const selectedSuggestion = suggestions[Math.min(selectedSuggestionIndex, Math.max(0, suggestions.length - 1))] as any
  const selectedSuggestionPreview = useMemo(() => selectedSuggestion ? getUnAutocompletePreview(source, selectedSuggestion, nativeFunctions) : null, [nativeFunctions, selectedSuggestion, source])
  const selectedSuggestionTypeHint = useMemo(() => selectedSuggestion ? getUnAutocompleteTypeHint(source, selectedSuggestion, nativeFunctions) : null, [nativeFunctions, selectedSuggestion, source])
  const textBeforeCursor = source.slice(0, completionRange.start)
  const cursorLine = textBeforeCursor.split('\n').length - 1
  const cursorColumn = completionRange.start - (textBeforeCursor.lastIndexOf('\n') + 1)
  const rawCompletionTop = 24 + cursorLine * 24 - scrollPosition.top
  const completionHeight = selectedSuggestionPreview ? 272 : 128
  const completionGap = 10
  const completionOpensUpward = rawCompletionTop + 24 + completionHeight > 612 && rawCompletionTop >= completionHeight + completionGap
  const completionPosition = {
    left: Math.max(8, 20 + cursorColumn * 7.83 - scrollPosition.left),
    top: Math.max(8, completionOpensUpward ? rawCompletionTop - completionHeight - completionGap : rawCompletionTop + 24 + completionGap),
  }
  useEffect(() => {
    if (!showCompletions) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    animate('#un-autocomplete-list', { opacity: [0, 1], translateY: [-4, 0], duration: 140, ease: 'outQuad' } as any)
  }, [showCompletions])
  useEffect(() => {
    if (!showCompletions) return
    requestAnimationFrame(() => {
      const el = document.querySelector('#un-autocomplete-list button[aria-selected="true"]') as HTMLElement | null
        || document.getElementById(`un-autocomplete-option-${selectedSuggestionIndex}`) as HTMLElement | null
      const container = document.getElementById('un-autocomplete-list')?.firstElementChild as HTMLElement | null
      if (el && container) {
        const top = (el as HTMLElement).offsetTop
        const target = top - container.clientHeight / 2 + (el as HTMLElement).offsetHeight / 2
        try { container.scrollTo({ top: Math.max(0, target), behavior: 'auto' } as any) } catch { (container as any).scrollTop = Math.max(0, target) }
      } else if (el) {
        el.scrollIntoView({ block: 'nearest' } as any)
      }
    })
  }, [selectedSuggestionIndex, showCompletions])
  const applySuggestion = (suggestion = selectedSuggestion) => {
    if (!suggestion) return
    const completion = applyUnAutocompleteCandidate(source, completionRange, suggestion)
    onChange(completion.source)
    setCursor(completion.cursor)
    setSelectedSuggestionIndex(0)
    setCompletionOpen(false)
    requestAnimationFrame(() => {
      if (editorRef.current) { editorRef.current.focus(); editorRef.current.selectionStart = editorRef.current.selectionEnd = completion.cursor }
    })
  }
  const applyEditorTextEdit = (edit: { source: string; selectionStart: number; selectionEnd: number }) => {
    if (editorRef.current) editorRef.current.value = edit.source
    onChange(edit.source)
    setCursor(edit.selectionStart)
    setSelectedSuggestionIndex(0)
    setCompletionOpen(false)
    requestAnimationFrame(() => {
      if (editorRef.current) { editorRef.current.focus(); editorRef.current.selectionStart = edit.selectionStart; editorRef.current.selectionEnd = edit.selectionEnd }
    })
  }
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); onRun(); return }
    if (showCompletions && event.key === 'ArrowDown') { event.preventDefault(); setSelectedSuggestionIndex((i) => (i + 1) % suggestions.length); return }
    if (showCompletions && event.key === 'ArrowUp') { event.preventDefault(); setSelectedSuggestionIndex((i) => (i - 1 + suggestions.length) % suggestions.length); return }
    if (showCompletions && (event.key === 'Enter' || event.key === 'Tab')) {
      // Enter가 쿼리와 정확히 일치하는 모듈/타입을 선택하려는 경우 줄바꿈을 허용 (예: use io 입력 후 Enter)
      const q = completionRange.query.toLowerCase()
      const sel = (selectedSuggestion as any)?.label?.toLowerCase()
      if (event.key === 'Enter' && q && sel && q === sel) {
        setCompletionOpen(false)
        return
      }
      event.preventDefault(); applySuggestion(); return
    }
    if (showCompletions && event.key === 'Escape') { event.preventDefault(); setCompletionOpen(false); return }
    if (!event.nativeEvent.isComposing) {
      const pairedEdit = applyUnPairedCharacterEdit(source, event.currentTarget.selectionStart, event.currentTarget.selectionEnd, event.key)
      if (pairedEdit) { event.preventDefault(); applyEditorTextEdit(pairedEdit); return }
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const el = event.currentTarget
      const start = el.selectionStart; const end = el.selectionEnd
      const nextValue = `${source.slice(0, start)}    ${source.slice(end)}`
      onChange(nextValue)
      setCursor(start + 4)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 4 })
    }
  }
  const composition = useComposition<HTMLTextAreaElement>({ onKeyDown, onCompositionStart: () => { setIsComposingInput(true); setCompletionOpen(false) }, onCompositionEnd: () => { setIsComposingInput(false); setCompletionOpen(true) } })
  const onScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    const { scrollLeft, scrollTop } = event.currentTarget
    setScrollPosition({ left: scrollLeft, top: scrollTop })
    if (lineGutterContentRef.current) lineGutterContentRef.current.style.transform = `translateY(-${scrollTop}px)`
    if (highlightContentRef.current) highlightContentRef.current.style.transform = `translate(${-scrollLeft}px, -${scrollTop}px)`
  }
  return (
    <div className="flex h-[628px] w-full min-h-0 overflow-hidden bg-[#161616] font-mono text-[13px] leading-6 text-[#e8e8e8]" style={{ backgroundColor: '#161616', width: '100%' }}>
      <div aria-hidden="true" className="code-line-gutter w-14 shrink-0 overflow-hidden border-r border-white/7 bg-[#101010] text-right text-[#747474] select-none" style={{ backgroundColor: '#101010' }}><pre ref={lineGutterContentRef} className="m-0 min-w-full px-4 py-5 will-change-transform">{lineNumbers}</pre></div>
      <div className="relative min-w-0 flex-1 overflow-hidden" style={{ backgroundColor: '#161616', width: '100%' }}>
        <pre aria-hidden="true" className="code-editor-highlight pointer-events-none absolute inset-0 m-0 overflow-hidden px-5 py-5 whitespace-pre" style={{ backgroundColor: '#161616', width: '100%' }}><code ref={highlightContentRef} className="block min-w-max will-change-transform" dangerouslySetInnerHTML={{ __html: highlightedSource }} /></pre>
        <textarea
          ref={editorRef}
          aria-label="UN code editor"
          spellCheck={false}
          wrap="off"
          value={source}
          onChange={(e) => { onChange(e.target.value); setCursor(e.target.selectionStart); setSelectedSuggestionIndex(0); setCompletionOpen(true) }}
          onClick={(e) => { setCursor(e.currentTarget.selectionStart); setSelectedSuggestionIndex(0); setCompletionOpen(true) }}
          onFocus={(e) => { setCursor(e.currentTarget.selectionStart); setCompletionOpen(true) }}
          onBlur={() => setCompletionOpen(false)}
          onCompositionStart={composition.onCompositionStart}
          onCompositionEnd={composition.onCompositionEnd}
          onKeyDown={composition.onKeyDown}
          onScroll={onScroll}
          disabled={disabled}
          className="code-editor-scroll relative z-10 h-full min-h-0 w-full resize-none bg-transparent px-5 py-5 text-transparent caret-[#f3f3f3] outline-none selection:bg-white/20 disabled:cursor-wait"
        />
        {showCompletions && (
          <div id="un-autocomplete-list" role="listbox" className="absolute z-20 flex w-72 max-w-[calc(100%-1rem)] flex-col overflow-hidden rounded-lg border border-white/12 bg-[#242424]/[0.98] py-1 shadow-[0_14px_34px_rgba(0,0,0,0.42)] backdrop-blur-sm max-h-[340px]" style={completionPosition as any}>
            <div className="max-h-[168px] overflow-y-auto overscroll-contain">
              {suggestions.map((suggestion: any, index: number) => (
              <button
                key={`${suggestion.kind}-${suggestion.label}`}
                type="button"
                role="option"
                aria-selected={index === selectedSuggestionIndex}
                onMouseDown={(event) => { event.preventDefault(); applySuggestion(suggestion) }}
                style={{ background: index === selectedSuggestionIndex ? '#3b506f' : 'transparent', color: index === selectedSuggestionIndex ? '#fff' : '#dddddf' }}
                className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left font-mono text-xs"
              >
                <span className={suggestion.kind === 'keyword' ? 'text-[#d4a4f4]' : suggestion.kind === 'function' ? 'text-[#9fc4ff]' : suggestion.kind === 'argument' ? 'text-[#f4c98a]' : 'text-[#dce9f7]'}>{suggestion.label}</span>
                <span className="shrink-0 text-[10px] text-white/45">{suggestion.detail}</span>
              </button>
            ))}
            </div>
            {selectedSuggestionPreview && <div className="mx-2 mt-1.5 rounded-md border border-white/8 bg-black/15 px-2.5 py-2 text-left">
              <p className="m-0 text-[10px] leading-4 text-white/60">{selectedSuggestionPreview.description}</p>
              {selectedSuggestionTypeHint && <p className="m-0 mt-1 font-mono text-[10px] font-semibold text-[#f4c98a]">Expected type · {selectedSuggestionTypeHint}</p>}
              {selectedSuggestionPreview.returnType && <p className="m-0 mt-1 font-mono text-[10px] font-semibold text-[#92d6b4]">Returns · {selectedSuggestionPreview.returnType}</p>}
              <pre className="m-0 mt-1.5 overflow-x-auto font-mono text-[10px] leading-4 text-[#c6dcff]">{selectedSuggestionPreview.example}</pre>
            </div>}
            <div className="mt-1 border-t border-white/8 px-3 pt-1.5 text-[10px] text-white/35"><kbd className="font-mono">↑↓</kbd> navigate · <kbd className="font-mono">Enter</kbd> insert · <kbd className="font-mono">Esc</kbd> close</div>
          </div>
        )}
      </div>
    </div>
  )
}

function EditorPanel({ source, setSource, run, isRunning, syntaxDiagnostic, nativeFunctions }: { source: string; setSource: (v: string) => void; run: () => void; isRunning: boolean; syntaxDiagnostic: UnSyntaxDiagnostic | null; nativeFunctions: readonly UnNativeFunctionMetadata[] }) {
  const lineCount = source.split('\n').length
  return (
    <div className="h-[660px] w-full min-w-0 overflow-hidden border-b border-black/10 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:border-b-0" style={{ width: '100%' }}>
      <SourceEditor source={source} onChange={setSource} onRun={run} disabled={isRunning} syntaxDiagnostic={syntaxDiagnostic} nativeFunctions={nativeFunctions} />
      <div className="flex h-8 items-center justify-between border-t border-black/10 bg-[#fafafa] px-5 text-[11px] leading-none text-[#747474] lg:shrink-0" style={{ backgroundColor: '#fafafa' }}>
        <span className="flex items-center gap-1.5 leading-none"><Keyboard size={13} strokeWidth={2.3} /> <kbd className="font-mono leading-none text-[#444]">Ctrl/⌘ + Enter</kbd> <span className="leading-none">to run</span></span>
        <span className="leading-none">{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
      </div>
    </div>
  )
}

function ResultPanel({ copied, isRunning, onCopy, presentation, result, stdin, setStdin }: { copied: boolean; isRunning: boolean; onCopy: () => void; presentation: ReturnType<typeof presentExecution> | null; result: ExecutionResult | undefined; stdin: string; setStdin: (v: string) => void }) {
  const toneClass = presentation?.tone === 'error' ? 'border-[#6d292d] bg-[#2a1516] text-[#e4aaaa]' : 'border-white/15 bg-white/7 text-white'
  const [inputHeight, setInputHeight] = useState(140)
  const [isDraggingInput, setIsDraggingInput] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = document.querySelector('.result-scroll') as HTMLElement | null
    if (el) animate(el, { opacity: [0.85, 1], duration: 160, ease: 'outQuad' } as any)
  }, [presentation?.label, isRunning])
  useEffect(() => {
    if (!isDraggingInput) return
    const onMove = (e: MouseEvent) => {
      const el = panelRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const fromBottom = rect.bottom - e.clientY
      const clamped = Math.max(130, Math.min(380, fromBottom - 32))
      setInputHeight(clamped)
    }
    const onUp = () => setIsDraggingInput(false)
    const onTouchMove = (e: TouchEvent) => {
      const el = panelRef.current
      if (!el || !e.touches[0]) return
      const rect = el.getBoundingClientRect()
      const fromBottom = rect.bottom - e.touches[0].clientY
      const clamped = Math.max(130, Math.min(380, fromBottom - 32))
      setInputHeight(clamped)
    }
    window.addEventListener('mousemove', onMove as any)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove as any)
    window.addEventListener('touchend', onUp)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'row-resize'
    return () => {
      window.removeEventListener('mousemove', onMove as any)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove as any)
      window.removeEventListener('touchend', onUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDraggingInput])
  return (
    <aside ref={panelRef as any} className="flex h-[660px] w-full min-h-0 flex-col overflow-hidden bg-[#1c1c1c] text-white lg:h-full" style={{ backgroundColor: '#1c1c1c', width: '100%' }}>
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-4 leading-none">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold leading-none"><TerminalSquare size={14} strokeWidth={2.4} className="text-[#d8d8d8]" />Result</div>
        {result && <div className="flex items-center gap-2 leading-none"><span className="flex items-center gap-1 font-mono text-[10px] leading-none text-white/45"><Clock3 size={11} strokeWidth={2.4} />{result.durationMs}ms</span>
          {(result.stdout || result.stderr) && <button onClick={onCopy} title="Copy output" className="rounded-md p-1.5 text-white/45 hover:bg-white/8 hover:text-white">{copied ? <Check size={14} strokeWidth={2.6} /> : <Copy size={14} strokeWidth={2.4} />}</button>}
        </div>}
      </div>
      <div aria-live="polite" className="result-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {isRunning ? (
          <div className="grid h-full place-items-center"><div className="flex items-center gap-2.5 text-xs text-white/50"><span className="running-ring" /><span>Running</span></div></div>
        ) : presentation ? (
          <div className="min-h-0">
            {presentation.tone !== 'success' && <div className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-semibold ${toneClass}`}><AlertTriangle size={14} strokeWidth={2.4} /> {presentation.label}</div>}
            {result?.stdout && <div className="mb-3"><pre className="result-scroll m-0 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/15 p-3 font-mono text-xs leading-6 text-[#f2f2f2]">{result.stdout}</pre></div>}
            {presentation.tone !== 'success' && <div><p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#cb8f8f]">diagnostic</p><pre className="result-scroll m-0 max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[#5c2528] bg-[#241315] p-3 font-mono text-xs leading-6 text-[#e1a5a5]">{presentation.detail.trim()}</pre></div>}
          </div>
        ) : <div className="grid h-full place-items-center text-xs text-white/40">Waiting for output</div>}
      </div>
      <div
        role="separator"
        aria-orientation="horizontal"
        onMouseDown={() => setIsDraggingInput(true)}
        onTouchStart={() => setIsDraggingInput(true)}
        onDoubleClick={() => setInputHeight(140)}
        title="드래그하여 입력창 크기 조절 (더블클릭 리셋)"
        className="h-2 shrink-0 cursor-row-resize bg-transparent hover:bg-white/10"
        style={{ flexShrink: 0 }}
      />
      <div className="shrink-0 border-t border-white/10 bg-[#1c1c1c] flex flex-col" style={{ height: inputHeight }}>
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-4 leading-none">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold leading-none"><FileText size={14} strokeWidth={2.4} className="text-[#d8d8d8]" />Input</div>
        </div>
        <div className="min-h-0 flex-1 p-3">
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder=""
            className="result-input-scroll m-0 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/15 p-3 font-mono text-xs leading-6 text-[#f2f2f2] placeholder:text-white/30 focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
      <div className="flex h-8 shrink-0 items-center border-t border-black/10 px-4 text-[10px] leading-none text-[#5d5d5d]" style={{ backgroundColor: '#fdfcfc' }}>Limits: 12,000 chars · 1.5 sec · 16,000 chars output</div>
    </aside>
  )
}

export default function Home() {
  const [source, setSource] = useState(() => {
    if (typeof window === 'undefined') return PLAYGROUND_DEFAULT_SOURCE
    try { return restoreSavedSource(window.localStorage.getItem(PLAYGROUND_STORAGE_KEYS.source)) } catch { return PLAYGROUND_DEFAULT_SOURCE }
  })
  const [stdin, setStdin] = useState(() => {
    if (typeof window === 'undefined') return ""
    try { return window.localStorage.getItem(PLAYGROUND_STORAGE_KEYS.stdin) ?? "" } catch { return "" }
  })
  const [copied, setCopied] = useState(false)
  const [sourceCopied, setSourceCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ExecutionResult | undefined>(undefined)
  const [lastExecutedSource, setLastExecutedSource] = useState<string | null>(null)
  const [lastExportedSource, setLastExportedSource] = useState(() => {
    if (typeof window === 'undefined') return PLAYGROUND_DEFAULT_SOURCE
    try { return window.localStorage.getItem(PLAYGROUND_STORAGE_KEYS.lastExportedSource) ?? PLAYGROUND_DEFAULT_SOURCE } catch { return PLAYGROUND_DEFAULT_SOURCE }
  })
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [exportTarget, setExportTarget] = useState<string | null>(null)
  const [exportFileName, setExportFileName] = useState('')
  const [exportFileNameError, setExportFileNameError] = useState<string | null>(null)
  const [durationMs, setDurationMs] = useState(0)
  // 중앙 분리선 드래그 리사이징
  const workspaceRef = useRef<HTMLDivElement>(null)
  const [leftPct, setLeftPct] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const { wasmReady, nativeFunctions } = useWasm()

  const presentation = useMemo(() => result ? presentExecution(result as any) : null, [result])

  const parserSyntaxDiagnostic = useMemo(() => result?.error?.kind === 'syntax' && lastExecutedSource === source ? parseUnSyntaxDiagnostic(source, result.error.message) : null, [lastExecutedSource, result, source])
  const syntaxDiagnostic = useMemo(() => parserSyntaxDiagnostic ?? findUnInlineSyntaxDiagnostic(source), [parserSyntaxDiagnostic, source])

  const hasUnexportedChanges = hasUnexportedSourceChanges(source, lastExportedSource)

  useEffect(() => { try { window.localStorage.setItem(PLAYGROUND_STORAGE_KEYS.source, source) } catch {} }, [source])
  useEffect(() => { try { window.localStorage.setItem(PLAYGROUND_STORAGE_KEYS.lastExportedSource, lastExportedSource) } catch {} }, [lastExportedSource])
  useEffect(() => { try { window.localStorage.setItem(PLAYGROUND_STORAGE_KEYS.stdin, stdin) } catch {} }, [stdin])

  useEffect(() => {
    if (!exportTarget) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    animate('[data-export-dialog]', { opacity: [0, 1], scale: [0.96, 1], duration: 180, ease: 'outQuad' } as any)
    animate('[data-export-backdrop]', { opacity: [0, 1], duration: 140, ease: 'outQuad' } as any)
  }, [exportTarget])

  useEffect(() => {
    if (!importError) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    animate('[data-import-error]', { opacity: [0, 1], translateY: [-6, 0], duration: 160, ease: 'outQuad' } as any)
  }, [importError])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 's') return
      e.preventDefault()
      if (exportTarget) return
      const src = source
      setTimeout(() => { setExportTarget(src); setExportFileName(createUnExportFilename().replace(/\.un$/i, '')); setExportFileNameError(null) }, 0)
    }
    window.addEventListener('keydown', h as any)
    return () => window.removeEventListener('keydown', h as any)
  }, [exportTarget, source])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      const el = workspaceRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      const clamped = Math.max(28, Math.min(72, pct))
      setLeftPct(clamped)
    }
    const onUp = () => setIsDragging(false)
    const onTouchMove = (e: TouchEvent) => {
      const el = workspaceRef.current
      if (!el || !e.touches[0]) return
      const rect = el.getBoundingClientRect()
      const pct = ((e.touches[0].clientX - rect.left) / rect.width) * 100
      const clamped = Math.max(28, Math.min(72, pct))
      setLeftPct(clamped)
    }
    window.addEventListener('mousemove', onMove as any)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove as any)
    window.addEventListener('touchend', onUp)
    // 드래그 중 텍스트 선택 방지
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    return () => {
      window.removeEventListener('mousemove', onMove as any)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove as any)
      window.removeEventListener('touchend', onUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging])

  const run = async () => {
    if (isRunning) return
    trackEvent('run', { sourceLength: source.length })
    setIsRunning(true)
    const start = performance.now()
    setLastExecutedSource(source)
    try {
      const fn: any = (window as any).dotnetInvoke
      let data: any
      if (typeof fn === 'function') {
        try { await fn('SetStdin', stdin) } catch {}
        const r: any = await fn('Run', source)
        const stdout = r.stdout ?? r.Stdout ?? ''
        const err = r.error ?? r.Error ?? null
        const timed = r.timedOut ?? r.TimedOut ?? false
        if (timed) {
          data = { status: 'timed_out', stdout, stderr: '', durationMs: Math.round(performance.now() - start), error: { kind: 'timeout', message: err ?? 'execution timed out' } }
        } else if (err) {
          const isSyntax = String(err).toLowerCase().includes('line') || String(err).toLowerCase().includes('syntax') || String(err).includes('Error')
          const kind = String(err).includes('not allowed') ? 'policy' : (String(err).toLowerCase().includes('syntax') || String(err).includes('unexpected') ? 'syntax' : 'runtime')
          data = { status: 'error', stdout, stderr: String(err), durationMs: Math.round(performance.now() - start), error: { kind, message: String(err) } }
        } else {
          data = { status: 'success', stdout, stderr: '', durationMs: Math.round(performance.now() - start) }
        }
      } else {
        // fallback demo when WASM not loaded (e.g. dev without dotnet)
        await new Promise((res) => setTimeout(res, 350))
        if (source.trim().length === 0) {
          data = { status: 'rejected', stdout: '', stderr: '', durationMs: 0, error: { kind: 'validation', message: '코드를 입력하세요.' } }
        } else if (source.length > MAX_SOURCE_CHARS) {
          data = { status: 'rejected', stdout: '', stderr: '', durationMs: 0, error: { kind: 'validation', message: `코드는 ${MAX_SOURCE_CHARS.toLocaleString()}자 이하여야 합니다.` } }
        } else {
          // naive local echo for demo
          data = { status: 'success', stdout: `[WASM 미로드 - 데모 출력]\n${source.slice(0, 200)}`, stderr: '', durationMs: Math.round(performance.now() - start) }
        }
      }
      setResult(data)
      setDurationMs(data.durationMs ?? Math.round(performance.now() - start))
    } catch (e: any) {
      setResult({ status: 'error', stdout: '', stderr: String(e?.message ?? e), durationMs: Math.round(performance.now() - start), error: { kind: 'service', message: String(e?.message ?? e) } })
    } finally {
      setIsRunning(false)
    }
  }

  const cancel = () => { /* WASM has no cancel; just reset */ setIsRunning(false) }

  const copyOutput = async () => {
    const output = [result?.stdout, result?.stderr].filter(Boolean).join('\n')
    if (!output) return
    await navigator.clipboard?.writeText(output)
    setCopied(true); setTimeout(() => setCopied(false), 1400)
  }
  const copySource = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(source)
      else throw new Error()
      setSourceCopied(true); setTimeout(() => setSourceCopied(false), 1400)
    } catch { setImportError('Clipboard access was unavailable.') }
  }
  const downloadSource = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 0)
  }
  const openExport = () => { setExportTarget(source); setExportFileName(createUnExportFilename().replace(/\.un$/i, '')); setExportFileNameError(null) }
  const confirmExport = () => {
    if (!exportTarget) return
    const v = normalizeUnExportFilename(exportFileName)
    if (!v.filename) { setExportFileNameError(v.error ?? 'Enter a valid file name.'); return }
    downloadSource(exportTarget, v.filename); setLastExportedSource(exportTarget); setExportTarget(null)
  }
  const importSource = async (event: ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0]; event.target.value = ''
    if (!f) return
    if (f.size > MAX_SOURCE_CHARS * 4) { setImportError(`The file must be ${MAX_SOURCE_CHARS.toLocaleString()} characters or fewer.`); return }
    try {
      const contents = await f.text()
      const v = validateImportedUnFile(f.name, contents)
      if (!v.source) { setImportError(v.error ?? 'Unable to import this file.'); return }
      setSource(v.source); setImportError(null)
    } catch { setImportError('The selected file could not be read.') }
  }

  // Wrap result with duration for ResultPanel display
  const resultWithDuration = result ? { ...result, durationMs: (result as any).durationMs ?? durationMs } : undefined

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f4f4] text-[#242424]" style={{ backgroundColor: '#f4f4f4' }}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(0,0,0,0.07),transparent_27rem),radial-gradient(circle_at_88%_10%,rgba(0,0,0,0.04),transparent_25rem)]" />
      <main className="relative mx-auto max-w-[1440px] px-5 pb-8 pt-8 sm:px-8 sm:pt-10">
        <section className="relative overflow-auto resize rounded-[18px] border border-black/10 bg-white shadow-[0_22px_65px_rgba(0,0,0,0.11)]" style={{ backgroundColor: '#fff' }}>
          <div className="flex items-center justify-between border-b border-black/10 bg-[#fafafa] px-4 py-3 sm:px-5 leading-none" style={{ backgroundColor: '#fafafa' }}>
            <div className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e9e9e9] text-[#343434] leading-none"><FileCode2 size={15} strokeWidth={2.4} /></span>
              <p className="font-mono text-xs font-semibold leading-none tracking-[-0.01em] text-[#303030]">main.un</p>
              <span className={`hidden items-center border-l border-black/10 pl-3 text-[11px] leading-none sm:inline-flex ${source.length > MAX_SOURCE_CHARS ? 'font-semibold text-black' : 'text-[#777]'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{source.length.toLocaleString()} / {MAX_SOURCE_CHARS.toLocaleString()}</span>
              <span title={wasmReady ? 'WASM ready — Un 실행 준비됨' : 'WASM 로딩 중...'} style={{ width: 8, height: 8, borderRadius: 999, background: wasmReady ? '#30d158' : '#ff9f0a', display: 'inline-block', border: wasmReady ? '1px solid #1d7a33' : '1px solid #a66a00', boxShadow: wasmReady ? '0 0 0 2px rgba(48,209,88,0.2)' : '0 0 0 2px rgba(255,159,10,0.2)' }} />
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <input ref={importInputRef} type="file" accept=".un,text/plain" className="sr-only" onChange={importSource} style={{ display: 'none' }} />
              <div role="group" aria-label="Code file tools" className="flex items-center gap-0.5 rounded-xl bg-black/[0.055] p-1" style={{ display: 'flex', alignItems: 'center', gap: 2, borderRadius: 12, background: 'rgba(0,0,0,0.055)', padding: 4 }}>
                <button onClick={() => importInputRef.current?.click()} onMouseEnter={(e) => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'scale(1.03)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, border: 0, background: 'transparent', padding: '0 10px', fontSize: 12, lineHeight: 1, color: '#414141', cursor: 'pointer', transition: 'background-color 0.14s ease, transform 0.14s ease' }} title="Import .un file"><FolderUp size={14} strokeWidth={2.4} /> <span className="hidden sm:inline">Import</span></button>
                <button onClick={copySource} onMouseEnter={(e) => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'scale(1.03)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, border: 0, background: 'transparent', padding: '0 10px', fontSize: 12, lineHeight: 1, color: '#414141', cursor: 'pointer', transition: 'background-color 0.14s ease, transform 0.14s ease' }} title="Copy all code">{sourceCopied ? <Check size={14} strokeWidth={2.6} /> : <Copy size={14} strokeWidth={2.4} />} <span>{sourceCopied ? 'Copied' : 'Copy'}</span></button>
                <button onClick={openExport} onMouseEnter={(e) => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'scale(1.03)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8, border: 0, background: 'transparent', padding: '0 10px', fontSize: 12, lineHeight: 1, color: '#414141', cursor: 'pointer', transition: 'background-color 0.14s ease, transform 0.14s ease' }} title="Export current code (Ctrl/⌘+S)"><Download size={14} strokeWidth={2.4} /> <span>Export</span>{hasUnexportedChanges && <span style={{ width: 6, height: 6, borderRadius: 999, background: '#444', display: 'inline-block' }} />}</button>
              </div>
              <div style={{ borderLeft: '1px solid rgba(0,0,0,0.15)', paddingLeft: 12 }}>
                {isRunning ? (
                  <button onClick={cancel} style={{ height: 40, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, background: '#353535', color: '#fff', border: 0, padding: '0 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Square size={12} strokeWidth={2.6} fill="currentColor" />{isRunning ? 'Cancel' : 'Cancel'}
                  </button>
                ) : (
                  <button onClick={(e) => { if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) animate(e.currentTarget as any, { scale: [0.96, 1], duration: 140, ease: 'outQuad' } as any); run() }} disabled={source.length > MAX_SOURCE_CHARS} style={{ height: 40, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, background: '#111', color: '#fff', border: 0, padding: '0 16px', fontSize: 12, fontWeight: 600, cursor: source.length > MAX_SOURCE_CHARS ? 'not-allowed' : 'pointer', opacity: source.length > MAX_SOURCE_CHARS ? 0.5 : 1 }}>
                    <Play size={13} strokeWidth={2.6} fill="currentColor" /> Run
                  </button>
                )}
              </div>
            </div>
          </div>
          {importError && <div data-import-error role="status" style={{ position: 'absolute', right: 16, top: 56, zIndex: 20, maxWidth: 'calc(100% - 2rem)', borderRadius: 6, border: '1px solid #8b3a3a', background: '#fff7f7', padding: '8px 12px', fontSize: 12, color: '#762d2d' }}>{importError}</div>}
          <div className="lg:hidden">
            <EditorPanel source={source} setSource={setSource} run={run} isRunning={isRunning} syntaxDiagnostic={syntaxDiagnostic} nativeFunctions={nativeFunctions as any} />
            <ResultPanel copied={copied} isRunning={isRunning} onCopy={copyOutput} presentation={presentation} result={resultWithDuration as any} stdin={stdin} setStdin={setStdin} />
          </div>
          <div className="hidden h-[660px] lg:flex" style={{ display: 'none' } as any}>
            {/* desktop flex fallback without resizable library - use simple 50/50 */}
          </div>
          <div ref={workspaceRef} className="!hidden h-[660px] lg:!flex" style={{ height: 660, display: 'flex' }}>
            <div style={{ flex: `0 0 ${leftPct}%`, minWidth: 0, display: 'flex' }}>
              <EditorPanel source={source} setSource={setSource} run={run} isRunning={isRunning} syntaxDiagnostic={syntaxDiagnostic} nativeFunctions={nativeFunctions as any} />
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-valuenow={Math.round(leftPct)}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              onDoubleClick={() => setLeftPct(50)}
              title="드래그하여 크기 조절 (더블클릭 리셋)"
              style={{
                width: 8,
                cursor: 'col-resize',
                flexShrink: 0,
                background: 'transparent',
                margin: '0 -4px',
                zIndex: 20,
                position: 'relative',
              } as any}
            />
            <div style={{ flex: `0 0 ${100 - leftPct}%`, minWidth: 0, display: 'flex' }}>
              <ResultPanel copied={copied} isRunning={isRunning} onCopy={copyOutput} presentation={presentation} result={resultWithDuration as any} stdin={stdin} setStdin={setStdin} />
            </div>
          </div>
        </section>
        {exportTarget !== null && (
          <div data-export-backdrop style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', padding: 16 }} onClick={() => setExportTarget(null)}>
            <div data-export-dialog onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', padding: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#292929' }}>Export UN code</h3>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>Choose a file name. The <code style={{ fontFamily: 'DM Mono, monospace', color: '#4b4b4b' }}>.un</code> extension is added automatically.</p>
              <form onSubmit={(e) => { e.preventDefault(); confirmExport() }} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 500, color: '#333' }}>File name
                  <input autoFocus value={exportFileName} onChange={(e) => { setExportFileName(e.target.value); setExportFileNameError(null) }} style={{ height: 40, borderRadius: 6, border: `1px solid ${exportFileNameError ? '#8b3030' : 'rgba(0,0,0,0.15)'}`, padding: '0 12px', fontFamily: 'DM Mono, monospace', fontSize: 14, outline: 'none' }} placeholder="my-program" />
                </label>
                {exportFileNameError && <p style={{ margin: 0, fontSize: 12, color: '#8b3030' }}>{exportFileNameError}</p>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={() => setExportTarget(null)} style={{ height: 36, borderRadius: 6, border: '1px solid rgba(0,0,0,0.12)', background: '#fff', padding: '0 14px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ height: 36, borderRadius: 6, border: 0, background: '#1d1d1d', color: '#fff', padding: '0 14px', fontSize: 12, cursor: 'pointer' }}>Download</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// mount
const container = document.getElementById('root')
if (container) {
  createRoot(container).render(<Home />)
}
