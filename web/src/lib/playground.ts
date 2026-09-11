export const PLAYGROUND_DEFAULT_SOURCE = `use io
io.write("Hello, World!")`;
export const MAX_PLAYGROUND_SOURCE_CHARS = 12_000;
export const PLAYGROUND_STORAGE_KEYS = {
  source: "un-playground-source-v1",
  lastExportedSource: "un-playground-last-exported-source-v1",
  stdin: "un-playground-stdin-v1",
} as const;

export type ExecutionStatus = "success" | "error" | "rejected" | "timed_out" | "cancelled";

export type ExecutionSnapshot = {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  durationMs: number;
  error?: { kind: string; message: string };
};

export function restoreSavedSource(savedSource: string | null): string {
  if (savedSource === null || savedSource.length > MAX_PLAYGROUND_SOURCE_CHARS) return PLAYGROUND_DEFAULT_SOURCE;
  return savedSource;
}

export function createUnExportFilename(): string {
  return "un-current-code.un";
}

export function hasUnexportedSourceChanges(source: string, lastExportedSource: string): boolean {
  return source !== lastExportedSource;
}

export function normalizeUnExportFilename(value: string): { filename?: string; error?: string } {
  const basename = value.trim().replace(/\.un$/i, "");
  if (!basename) return { error: "Enter a file name." };
  if (basename.length > 64) return { error: "Use a file name with 64 characters or fewer." };
  if (basename === "." || basename === ".." || /[\\/:*?"<>|\u0000-\u001f]/.test(basename)) {
    return { error: "The file name contains unsupported characters." };
  }
  return { filename: `${basename}.un` };
}

export function validateImportedUnFile(fileName: string, contents: string): { source?: string; error?: string } {
  if (!fileName.toLowerCase().endsWith(".un")) return { error: "Choose a .un file." };
  if (contents.length > MAX_PLAYGROUND_SOURCE_CHARS) return { error: `The file must be ${MAX_PLAYGROUND_SOURCE_CHARS.toLocaleString()} characters or fewer.` };
  return { source: contents };
}

export function getEditorLineNumbers(source: string): string {
  const lineCount = source.split("\n").length;
  return Array.from({ length: lineCount }, (_, index) => index + 1).join("\n");
}

type HighlightTokenType = "plain" | "keyword" | "function" | "variable" | "string" | "number" | "comment" | "type" | "module" | "bracket";

type HighlightToken = {
  type: HighlightTokenType;
  value: string;
};

const UN_KEYWORDS = new Set([
  "fn", "class", "enum", "use", "using", "if", "elif", "else", "match", "for", "while", "break", "skip",
  "in", "is", "as", "and", "or", "xor", "not", "go", "wait", "try", "defer", "none", "_", "true", "false",
]);

const UN_BUILTIN_TYPES = new Set([
  "int", "str", "bool", "float", "list", "dict", "set", "tuple", "json", "type", "any",
]);

export const NATIVE_TYPE_FOR_MODULE: Record<string, string[]> = {
  io: ["stream"],
  flow: ["pool", "lock"],
  iter: ["range", "counter", "reverse", "repeat"],
  http: ["http"],
  ws: ["websocket"],
  random: ["random"],
};

const UN_MODULES = new Set([
  "io", "fs", "math", "iter", "re", "random", "sys", "time", "http", "ws", "inspect", "flow", "builtin",
]);

const BUILTIN_TYPE_INFO = new Map<string, { description: string; example: string }>();
export function setBuiltinTypeInfo(list: Array<{ name: string; description: string; example: string }>) {
  BUILTIN_TYPE_INFO.clear();
  for (const e of list) BUILTIN_TYPE_INFO.set(e.name, { description: e.description, example: e.example });
}

export function extractUnClassNames(source: string): string[] {
  const names: string[] = []
  const re = /^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) names.push(m[1])
  return [...new Set(names)]
}

export function extractUnClassMethods(source: string): Record<string, string[]> {
  const lines = source.split('\n')
  const result: Record<string, string[]> = {}
  let currentClass: string | null = null
  let classIndent = -1
  for (const line of lines) {
    const classMatch = line.match(/^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)/)
    if (classMatch) {
      currentClass = classMatch[1]
      classIndent = line.search(/\S|$/)
      if (!result[currentClass]) result[currentClass] = []
      continue
    }
    if (currentClass !== null) {
      const indent = line.search(/\S|$/)
      if (line.trim() === '') continue
      if (indent <= classIndent) { currentClass = null; classIndent = -1; continue }
      const fnMatch = line.match(/^\s*fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/)
      if (fnMatch) {
        const fnName = fnMatch[1]
        if (!result[currentClass]!.includes(fnName)) result[currentClass]!.push(fnName)
      }
    }
  }
  return result
}

export type UnAutocompleteKind = "keyword" | "function" | "method" | "property" | "variable" | "argument";

export type UnAutocompleteCandidate = {
  label: string;
  kind: UnAutocompleteKind;
  detail: string;
};

export type UnAutocompleteRange = {
  start: number;
  end: number;
  query: string;
};

export type UnNativeFunctionMetadata = {
  name: string;
  module: string;
  description: string;
  example: string;
  returnType: string;
  parameters: Array<{
    name: string;
    expectedType: string;
    essential: boolean;
    optional: boolean;
    positional: boolean;
  }>;
};

export type UnNativeApiModule = {
  id: string;
  label: string;
  count: number;
};

export function formatUnNativeModule(module: string): string {
  return module.startsWith("type:") ? `${module.slice("type:".length)} methods` : module;
}

export function getUnNativeApiModules(nativeFunctions: readonly UnNativeFunctionMetadata[]): UnNativeApiModule[] {
  const modules = new Map<string, number>();

  nativeFunctions.forEach((entry) => modules.set(entry.module, (modules.get(entry.module) ?? 0) + 1));

  return Array.from(modules, ([id, count]) => ({ id, label: formatUnNativeModule(id), count }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function searchUnNativeFunctions(nativeFunctions: readonly UnNativeFunctionMetadata[], query = "", module = "all"): UnNativeFunctionMetadata[] {
  const normalizedQuery = query.trim().toLowerCase();

  return nativeFunctions
    .filter((entry) => module === "all" || entry.module === module)
    .filter((entry) => {
      if (!normalizedQuery) return true;
      const searchable = [entry.name, entry.module, entry.description, entry.example, entry.returnType, ...entry.parameters.map((parameter) => `${parameter.name} ${parameter.expectedType}`)]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    })
    .sort((left, right) => left.module.localeCompare(right.module) || left.name.localeCompare(right.name));
}

const IDENTIFIER_CHARACTER = /[A-Za-z0-9_]/;
const IDENTIFIER_START = /^[A-Za-z_][A-Za-z0-9_]*$/;
const FUNCTION_DECLARATION_PATTERN = /^\s*fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*(?::\s*([A-Za-z_][A-Za-z0-9_]*))?/gm;
const KEYWORD_PREVIEWS: Record<string, { description: string; example: string }> = {
  fn: { description: "Defines a reusable function.", example: "fn greet(name)\n    write(name)" },
  if: { description: "Runs an indented block when the condition is true.", example: "if score >= 60\n    write(\"pass\")" },
  for: { description: "Iterates over values from an iterable.", example: "for item in items\n    write(item)" },
  while: { description: "Repeats an indented block while the condition is true.", example: "while count < 3\n    count += 1" },
  "->": { description: "Returns a value from the current function.", example: "fn add(a, b) -> a + b" },
  write: { description: "Writes values to standard output.", example: "write(\"Hello\", \"UN\")" },
  range: { description: "Creates a sequence of numbers.", example: "for index in range(0, 3)\n    write(index)" },
  len: { description: "Returns the number of items in a value.", example: "write(len(items))" },
  map: { description: "Transforms every value in an iterable.", example: "doubled = map(double, values)" },
  filter: { description: "Keeps iterable values that satisfy a predicate.", example: "positives = filter(is_positive, values)" },
};

function addUnSourceSymbol(symbols: Map<string, UnAutocompleteKind>, label: string, kind: UnAutocompleteKind) {
  if (!IDENTIFIER_START.test(label) || UN_KEYWORDS.has(label)) return;
  symbols.set(label, kind);
}

export function extractUnSourceSymbols(source: string): UnAutocompleteCandidate[] {
  const symbols = new Map<string, UnAutocompleteKind>();
  const detailMap = new Map<string, string>()
  const classMethods = extractUnClassMethods(source)
  const methodNames = new Set<string>(Object.values(classMethods).flat())
  const lines = source.split('\n')
  let currentClass: string | null = null
  let classIndent = -1
  // line-aware function detection for method vs function
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const indent = line.search(/\S|$/)
    if (line.trim() === '') continue
    const classMatch = line.match(/^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)/)
    if (classMatch) {
      currentClass = classMatch[1]
      classIndent = indent
      continue
    }
    if (currentClass !== null && indent <= classIndent) {
      currentClass = null
      classIndent = -1
    }
    const fnMatch = line.match(/^\s*fn\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/)
    if (fnMatch) {
      const fnName = fnMatch[1]
      const isMethod = currentClass !== null
      const kind: UnAutocompleteKind = isMethod ? "method" : "function"
      const detail = isMethod ? `method of ${currentClass}` : "defined function"
      if (!symbols.has(fnName)) {
        symbols.set(fnName, kind)
        detailMap.set(fnName, detail)
      } else if (symbols.get(fnName) === "function" && kind === "method") {
        // keep method detail if conflict, prefer method
        symbols.set(fnName, kind)
        detailMap.set(fnName, detail)
      }
      continue
    }
  }
  // fallback: also handle any fn not caught due to multi-line (use regex for remaining)
  const functionPattern = new RegExp(FUNCTION_DECLARATION_PATTERN.source, "gm");
  let match: RegExpExecArray | null;
  while ((match = functionPattern.exec(source)) !== null) {
    const fnName = match[1] ?? ""
    if (!fnName || symbols.has(fnName)) continue
    const isFallbackMethod = methodNames.has(fnName)
    // if this fn was not classified via lines, treat as function unless it's known method
    if (isFallbackMethod) {
      symbols.set(fnName, "method")
      // find owning class for detail
      const owner = Object.entries(classMethods).find(([, ms]) => ms.includes(fnName))?.[0]
      detailMap.set(fnName, owner ? `method of ${owner}` : "class method")
    } else {
      addUnSourceSymbol(symbols, fnName, "function")
      if (!detailMap.has(fnName)) detailMap.set(fnName, "defined function")
    }
  }

  // 클래스 멤버 변수는 자동완성에 포함하지 않음 — 클래스 내부 들여쓰기 블록에서는 변수/using/for 제외
  {
    const lines2 = source.split('\n')
    let curClass: string | null = null
    let curIndent = -1
    for (const line of lines2) {
      const trimmed = line.trim()
      if (trimmed === '') continue
      const indent = line.search(/\S|$/)
      const cm = line.match(/^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)/)
      if (cm) {
        curClass = cm[1]
        curIndent = indent
        continue
      }
      if (curClass !== null && indent <= curIndent) {
        curClass = null
        curIndent = -1
      }
      if (curClass !== null) continue // 클래스 내부 → 변수 제안 제외
      const am = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:=|\+=|-=|\*=|\/=|%=)/)
      if (am) addUnSourceSymbol(symbols, am[1] ?? "", "variable")
      const um = line.match(/^\s*using\s+([A-Za-z_][A-Za-z0-9_]*)/)
      if (um) addUnSourceSymbol(symbols, um[1] ?? "", "variable")
      const lm = line.match(/^\s*for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\b/)
      if (lm) addUnSourceSymbol(symbols, lm[1] ?? "", "variable")
    }
  }

  return Array.from(symbols.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, kind]) => ({ label, kind, detail: detailMap.get(label) ?? (kind === "function" ? "defined function" : kind === "method" ? "class method" : "defined variable") }));
}

export function extractUnFunctionParameters(source: string): Record<string, string[]> {
  return Object.fromEntries(Object.entries(extractUnFunctionSignatures(source)).map(([name, signature]) => [name, signature.parameters]));
}

export type UnFunctionSignature = {
  parameters: string[];
  returnType: string;
};

export function extractUnFunctionSignatures(source: string): Record<string, UnFunctionSignature> {
  const signatures: Record<string, UnFunctionSignature> = {};
  const functionPattern = new RegExp(FUNCTION_DECLARATION_PATTERN.source, "gm");
  let match: RegExpExecArray | null;

  while ((match = functionPattern.exec(source)) !== null) {
    const functionName = match[1] ?? "";
    const parameters = (match[2] ?? "")
      .split(",")
      .map((parameter) => parameter.trim().replace(/^\*{0,2}/, "").split("=")[0]?.trim() ?? "")
      .filter((parameter) => IDENTIFIER_START.test(parameter));

    signatures[functionName] = {
      parameters,
      returnType: match[3] ?? "any",
    };
  }

  return signatures;
}

export function extractUnFunctionReturnTypes(source: string): Record<string, string> {
  return Object.fromEntries(Object.entries(extractUnFunctionSignatures(source)).map(([name, signature]) => [name, signature.returnType]));
}

export type UnCallContext = {
  functionName: string;
  argumentIndex: number;
};

export function getUnCallContext(source: string, cursor: number): UnCallContext | null {
  const end = Math.max(0, Math.min(cursor, source.length));
  let nestedDepth = 0;

  for (let index = end - 1; index >= 0; index--) {
    const character = source[index];
    if (character === ")" || character === "]" || character === "}") {
      nestedDepth++;
      continue;
    }
    if (character !== "(" && character !== "[" && character !== "{") continue;
    if (nestedDepth > 0) {
      nestedDepth--;
      continue;
    }
    if (character !== "(") return null;

    let functionStart = index;
    while (functionStart > 0 && IDENTIFIER_CHARACTER.test(source[functionStart - 1] ?? "")) functionStart--;
    const functionName = source.slice(functionStart, index);
    if (!IDENTIFIER_START.test(functionName)) return null;

    const lineStart = source.lastIndexOf("\n", functionStart - 1) + 1;
    if (/^\s*fn\s*$/.test(source.slice(lineStart, functionStart))) return null;

    let argumentIndex = 0;
    let argumentDepth = 0;
    for (let argumentPosition = index + 1; argumentPosition < end; argumentPosition++) {
      const argumentCharacter = source[argumentPosition];
      if (argumentCharacter === "(" || argumentCharacter === "[" || argumentCharacter === "{") argumentDepth++;
      else if (argumentCharacter === ")" || argumentCharacter === "]" || argumentCharacter === "}") argumentDepth = Math.max(0, argumentDepth - 1);
      else if (argumentCharacter === "," && argumentDepth === 0) argumentIndex++;
    }

    return { functionName, argumentIndex };
  }

  return null;
}

export function getUnFunctionArgumentCandidates(source: string, cursor: number, nativeFunctions: readonly UnNativeFunctionMetadata[] = []): UnAutocompleteCandidate[] {
  const context = getUnCallContext(source, cursor);
  if (!context) return [];

  const declaredParameters = extractUnFunctionParameters(source)[context.functionName];
  let nativeFunction = nativeFunctions.find((entry) => entry.name === context.functionName);
  // use 하지 않은 패키지의 네이티브 함수 인자는 제안하지 않음
  if (nativeFunction && nativeFunction.module !== "builtin" && !nativeFunction.module.startsWith("type:")) {
    const used = getUsedNativeModules(source.slice(0, cursor));
    if (!used.has(nativeFunction.module)) nativeFunction = undefined;
  }
  const parameter = declaredParameters?.[context.argumentIndex] ?? nativeFunction?.parameters[context.argumentIndex]?.name;
  const query = getUnAutocompleteRange(source, cursor).query.toLowerCase();

  if (!parameter || (query && !parameter.toLowerCase().startsWith(query))) return [];
  return [{ label: parameter, kind: "argument", detail: `argument of ${context.functionName}` }];
}

export function getUnAutocompleteTypeHint(source: string, candidate: UnAutocompleteCandidate, nativeFunctions: readonly UnNativeFunctionMetadata[] = []): string | null {
  if (candidate.kind !== "argument") return null;

  const functionName = candidate.detail.replace(/^argument of\s+/, "");
  const nativeHint = nativeFunctions.find((entry) => entry.name === functionName)?.parameters.find((parameter) => parameter.name === candidate.label)?.expectedType;
  if (nativeHint) return nativeHint;

  const parameterNames = extractUnFunctionParameters(source)[functionName];
  if (!parameterNames?.includes(candidate.label)) return "any";

  const lowerName = candidate.label.toLowerCase();
  if (/^(is_|has_|can_|should_|enabled|visible|reverse)/.test(lowerName)) return "boolean";
  if (/(count|index|size|limit|offset|step|age|year|total)$/.test(lowerName)) return "integer";
  if (/(name|title|text|message|label|path|prompt|greeting|suffix|prefix)$/.test(lowerName)) return "string";
  if (/(items|values|entries|list|tuple|args)$/.test(lowerName)) return "iterable";
  if (/(callback|handler|predicate|transform|function)$/.test(lowerName)) return "function";
  return "any";
}

export function getUsedNativeModuleMap(source: string): Map<string, string> {
  const map = new Map<string, string>();
  // use io / use io as mio / use math as m / use re { test } / use fs.path 등
  // use io { write, read as r, * } / use io { write } as mio 도 지원 — { }가 as보다 먼저 옴 (Parser 순서)
  const pattern = /^\s*use\s+([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)(?:\s*\{\s*([^}]*)\s*\})?(?:\s+as\s+([A-Za-z_][A-Za-z0-9_]*))?/gm;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(source)) !== null) {
    const full = m[1] ?? "";
    const alias = m[3] ?? "";
    const base = full.split(".")[0] ?? "";
    if (!base) continue;
    const key = alias || base;
    map.set(key, base);
  }
  return map;
}

export function getBareImportMap(source: string): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  // use io { write, read as r, * } / use io { write } as mio — { }가 as보다 먼저
  const pattern = /^\s*use\s+([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\s*\{\s*([^}]*)\s*\}(?:\s+as\s+[A-Za-z_][A-Za-z0-9_]*)?/gm;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(source)) !== null) {
    const full = m[1] ?? "";
    const importsRaw = m[2] ?? "";
    const base = full.split(".")[0] ?? "";
    if (!base || !importsRaw) continue;
    const set = map.get(base) ?? new Set<string>();
    for (const part of importsRaw.split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed === '*') { set.add('*'); continue; }
      const asMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+as\s+([A-Za-z_][A-Za-z0-9_]*)$/);
      if (asMatch) {
        // write as w → w가 bare로 노출
        set.add(asMatch[2]);
      } else {
        const nameMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)$/);
        if (nameMatch) set.add(nameMatch[1]);
      }
    }
    map.set(base, set);
  }
  return map;
}

export function getUsedNativeModules(source: string): Set<string> {
  return new Set(getUsedNativeModuleMap(source).values());
}

export function getUnAutocompleteRange(source: string, cursor: number): UnAutocompleteRange {
  const end = Math.max(0, Math.min(cursor, source.length));
  let start = end;

  while (start > 0 && IDENTIFIER_CHARACTER.test(source[start - 1] ?? "")) start--;

  return { start, end, query: source.slice(start, end) };
}

export function getUnAutocompleteCandidates(source: string, query: string, nativeFunctions: readonly UnNativeFunctionMetadata[] = [], limit = 8): UnAutocompleteCandidate[] {
  const normalizedQuery = query.toLowerCase();
  if (!normalizedQuery) {
    // 타입 위치에서는 빈 쿼리에도 타입/클래스 제안 (예: x: |, fn foo(a: |))
    // cursor 위치는 호출부에서 source+cursor로 판단해야 하므로 여기서는 빈 쿼리 시에도 타입을 제안하려면 호출자가 cursor를 넘겨야 함
    // 현재 함수는 query만 받으므로 빈 쿼리 시 타입 제안을 위해선 별도 함수가 필요하나, 간단히 빈 쿼리 때도 타입을 포함하되 상위에서 필터링하도록 함
    // 여기서는 빈 쿼리 시에도 타입/클래스를 포함하지 않고, 상위 호출에서 type position일 때 별도 처리하도록 둠
    return [];
  }

  const candidates = new Map<string, UnAutocompleteCandidate>();
  const addCandidates = (labels: string[], kind: UnAutocompleteKind, detail: string) => {
    labels.forEach((label) => {
      if (!label.toLowerCase().startsWith(normalizedQuery) || candidates.has(label)) return;
      candidates.set(label, { label, kind, detail });
    });
  };

  const sourceSymbols = extractUnSourceSymbols(source);
  addCandidates(sourceSymbols.filter((candidate) => candidate.kind === "function").map((candidate) => candidate.label), "function", "defined function");
  addCandidates(sourceSymbols.filter((candidate) => candidate.kind === "variable").map((candidate) => candidate.label), "variable", "defined variable");
  const usedMap = getUsedNativeModuleMap(source);
  // use한 모듈 자체를 변수로 제안 (io, math, fs 등 — alias 포함)
  addCandidates(Array.from(usedMap.keys()), "variable", "module");
  // use한 모듈의 NativeType도 함께 제안 (예: use io → stream)
  for (const mod of new Set(usedMap.values())) {
    const nativeTypes = NATIVE_TYPE_FOR_MODULE[mod];
    if (nativeTypes) addCandidates(nativeTypes, "variable", "native type");
  }
  const bareMap = getBareImportMap(source);
  nativeFunctions.forEach((entry) => {
    if (entry.module.startsWith("type:")) return;
    if (UN_KEYWORDS.has(entry.name)) return;
    if (entry.module === "builtin") {
      addCandidates([entry.name], "function", `native ${entry.module} function`);
      return;
    }
    const bareSet = bareMap.get(entry.module);
    if (!bareSet) return;
    if (bareSet.has('*') || bareSet.has(entry.name)) {
      addCandidates([entry.name], "function", `native ${entry.module} function`);
    }
  });
  // alias bare import: use io { write as w } → w 제안
  for (const [mod, bareSet] of bareMap.entries()) {
    for (const bareName of bareSet) {
      if (bareName === '*') continue;
      if (candidates.has(bareName)) continue;
      if (!bareName.toLowerCase().startsWith(normalizedQuery)) continue;
      const isAlias = !nativeFunctions.some(e => e.module === mod && e.name === bareName);
      if (isAlias) {
        candidates.set(bareName, { label: bareName, kind: "function", detail: `native ${mod} function` });
      }
    }
  }
  addCandidates(Array.from(UN_BUILTIN_TYPES), "variable", "builtin type");
  addCandidates(extractUnClassNames(source), "variable", "class");
  addCandidates(Array.from(UN_KEYWORDS), "keyword", "keyword");

  return Array.from(candidates.values()).slice(0, Math.max(0, limit));
}

function findUnLastTopLevelDot(text: string): number {
  let lastDot = -1;
  let quote: string | null = null;
  let depth = 0;

  for (let index = 0; index < text.length; index++) {
    const character = text[index] ?? "";
    if (quote) {
      if (character === "\\") index++;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }
    if (character === "(" || character === "[" || character === "{") {
      depth++;
      continue;
    }
    if (character === ")" || character === "]" || character === "}") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (character === "." && depth === 0 && !(/\d/.test(text[index - 1] ?? "") && /\d/.test(text[index + 1] ?? ""))) lastDot = index;
  }

  return lastDot;
}

function findUnLastPropertyDot(text: string): number {
  let lastDot = -1;
  let quote: string | null = null;

  for (let index = 0; index < text.length; index++) {
    const character = text[index] ?? "";
    if (quote) {
      if (character === "\\") index++;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }
    if (character === "." && !(/\d/.test(text[index - 1] ?? "") && /\d/.test(text[index + 1] ?? ""))) lastDot = index;
  }

  return lastDot;
}

function getUnEnclosingExpressionStart(text: string, end: number): number {
  const openings: number[] = [];
  let quote: string | null = null;

  for (let index = 0; index < end; index++) {
    const character = text[index] ?? "";
    if (quote) {
      if (character === "\\") index++;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "\"" || character === "'") {
      quote = character;
      continue;
    }
    if (character === "(" || character === "[" || character === "{") openings.push(index);
    else if (character === ")" || character === "]" || character === "}") openings.pop();
  }

  return (openings.at(-1) ?? -1) + 1;
}

function unwrapUnOuterGrouping(expression: string): string {
  let value = expression.trim();

  while (value.startsWith("(") && value.endsWith(")")) {
    let depth = 0;
    let quote: string | null = null;
    let closesAtEnd = false;

    for (let index = 0; index < value.length; index++) {
      const character = value[index] ?? "";
      if (quote) {
        if (character === "\\") index++;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === "\"" || character === "'") {
        quote = character;
        continue;
      }
      if (character === "(") depth++;
      else if (character === ")" && --depth === 0) {
        closesAtEnd = index === value.length - 1;
        break;
      }
    }

    if (!closesAtEnd) break;
    value = value.slice(1, -1).trim();
  }

  return value;
}

function splitUnTopLevelChain(expression: string): string[] {
  const segments: string[] = [];
  let remainder = expression;
  let dot = findUnLastTopLevelDot(remainder);

  while (dot >= 0) {
    segments.unshift(remainder.slice(dot + 1).trim());
    remainder = remainder.slice(0, dot);
    dot = findUnLastTopLevelDot(remainder);
  }

  segments.unshift(remainder.trim());
  return segments;
}

function getUnStatementExpression(line: string): string {
  const assignmentIndex = line.lastIndexOf("=");
  if (assignmentIndex >= 0 && !/[=!<>]$/.test(line.slice(0, assignmentIndex))) return line.slice(assignmentIndex + 1).trim();
  return line.trim().replace(/^return\s+/, "");
}

export function getUnSimpleExpressionType(expression: string, symbols: Readonly<Record<string, string>>, declaredReturnTypes: Readonly<Record<string, string>>, nativeFunctions: readonly UnNativeFunctionMetadata[]): string | undefined {
  if (/^["']/.test(expression)) return "str";
  if (/^-?\d+\.\d+\b/.test(expression)) return "float";
  if (/^-?\d+\b/.test(expression)) return "int";
  if (/^\[/.test(expression)) return "list";
  if (/^\{/.test(expression)) return "dict";

  const identifier = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*$/)?.[1];
  if (identifier) return symbols[identifier];

  // Qualified call like io.open("...") or t.read("..."); check module.function
  const qualifiedCall = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
  if (qualifiedCall) {
    const mod = qualifiedCall[1];
    const func = qualifiedCall[2];
    // Try direct module
    let native = nativeFunctions.find((e) => e.module === mod && e.name === func);
    if (native) return native.returnType;
    // Try alias: if mod is alias, find base (need source context — fallback to any module with func)
    // For now, search any module with that func name that is a native module (io, fs, etc.)
    native = nativeFunctions.find((e) => !e.module.startsWith("type:") && e.name === func);
    if (native) return native.returnType;
    return declaredReturnTypes[func];
  }

  const functionCall = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/)?.[1];
  if (!functionCall) return undefined;

  return nativeFunctions.find((entry) => !entry.module.startsWith("type:") && entry.name === functionCall)?.returnType ?? declaredReturnTypes[functionCall];
}

export function getUnExpressionType(expression: string, symbols: Readonly<Record<string, string>>, declaredReturnTypes: Readonly<Record<string, string>>, nativeFunctions: readonly UnNativeFunctionMetadata[]): string | undefined {
  const segments = splitUnTopLevelChain(unwrapUnOuterGrouping(expression));
  let currentType = getUnSimpleExpressionType(segments[0] ?? "", symbols, declaredReturnTypes, nativeFunctions);

  for (const segment of segments.slice(1)) {
    const methodName = segment.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/)?.[1];
    if (!currentType || !methodName) return undefined;
    currentType = nativeFunctions.find((entry) => entry.module === `type:${currentType}` && entry.name === methodName)?.returnType;
  }

  return currentType;
}

export function getUnInferredSymbolTypes(source: string, nativeFunctions: readonly UnNativeFunctionMetadata[]): Record<string, string> {
  const symbols: Record<string, string> = {};
  const declaredReturnTypes = extractUnFunctionReturnTypes(source);
  const classNames = extractUnClassNames(source)
  const assignments = Array.from(source.matchAll(/^\s*(?:using\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*[A-Za-z_][A-Za-z0-9_<>,\s|]*\s*)?=\s*([^\n#]+)/gm));

  for (const assignment of assignments) {
    const name = assignment[1] ?? "";
    const expression = (assignment[2] ?? "").trim();
    // 직접 클래스 인스턴스화: p = Point() / p = Point(1,2)
    const instMatch = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/)
    if (instMatch && classNames.includes(instMatch[1])) {
      symbols[name] = instMatch[1]
      continue
    }
    const inferredType = getUnExpressionType(expression, symbols, declaredReturnTypes, nativeFunctions) ?? getUnSimpleExpressionType(expression, symbols, declaredReturnTypes, nativeFunctions);

    if (inferredType && inferredType !== "any" && inferredType !== "none") symbols[name] = inferredType;
  }

  return symbols;
}

export function getUnObjectMethodCandidates(source: string, cursor: number, nativeFunctions: readonly UnNativeFunctionMetadata[] = [], limit = 8): UnAutocompleteCandidate[] | null {
  const range = getUnAutocompleteRange(source, cursor);
  const precedingSource = source.slice(0, range.start);
  const lineStart = precedingSource.lastIndexOf("\n") + 1;
  const lineBeforeCompletion = precedingSource.slice(lineStart);
  const dot = findUnLastPropertyDot(lineBeforeCompletion);
  if (dot < 0) return null;

  // 붙여넣기 등으로 완성된 호출 뒤에 자동추천이 뜨는 것 방지
  // 예: a.add(1) 붙여넣기 후 커서가 ) 뒤에 있으면 dot은 a.의 것이지만 add(1)에 )가 포함되어 있으므로 dot 컨텍스트가 아님
  const afterDot = lineBeforeCompletion.slice(dot + 1)
  if (afterDot.includes(')') || afterDot.includes(']') || afterDot.includes('}') || afterDot.includes('(') || afterDot.includes('[') || afterDot.includes('{')) {
    // afterDot에 괄호가 있으면 이미 닫혔거나 호출 인수 안에 있음 — 예: a.add(1) / io.write(value,  → 차단
    // a.add(1). -> dot이 마지막이므로 afterDot="" => 허용
    return null
  }

  const receiverStart = getUnEnclosingExpressionStart(lineBeforeCompletion, dot);
  const receiverExpression = getUnStatementExpression(lineBeforeCompletion.slice(Math.max(0, receiverStart), dot));
  const query = range.query.toLowerCase();
  // 모듈 닷: use io -> io., use math as m -> m. 등 (use한 모듈만)
  const usedMap = getUsedNativeModuleMap(precedingSource);
  // precedingSource에 없는 경우 전체 소스에서도 확인 (커서 앞 use만 있어야 하지만 입력 중일 수 있어 전체도 체크)
  if (!usedMap.has(receiverExpression)) {
    const fullMap = getUsedNativeModuleMap(source);
    if (fullMap.has(receiverExpression)) {
      // 전체 소스에 use가 있으면 허용 (타이핑 중 아직 preceding에 없을 수 있음)
      usedMap.set(receiverExpression, fullMap.get(receiverExpression)!);
    }
  }
  if (usedMap.has(receiverExpression)) {
    const targetModule = usedMap.get(receiverExpression)!;
    const moduleCandidates = nativeFunctions
      .filter((entry) => entry.module === targetModule && entry.name.toLowerCase().startsWith(query))
      .slice(0, Math.max(0, limit))
      .map((entry) => ({ label: entry.name, kind: "function" as const, detail: `native ${entry.module} function` }));
    return moduleCandidates;
  }

  const receiverType = getUnExpressionType(
    receiverExpression,
    getUnInferredSymbolTypes(precedingSource, nativeFunctions),
    extractUnFunctionReturnTypes(precedingSource),
    nativeFunctions,
  );
  if (!receiverType) return [];
  // 1) 네이티브 타입 메서드
  const nativeCandidates = nativeFunctions
    .filter((entry) => entry.module === `type:${receiverType}` && entry.name.toLowerCase().startsWith(query))
    .slice(0, Math.max(0, limit))
    .map((entry) => ({ label: entry.name, kind: "method" as const, detail: `native ${entry.module} method` }));
  if (nativeCandidates.length > 0) return nativeCandidates;

  // 2) 사용자 클래스 메서드 (class Point { fn greet ... } -> p = Point(); p.)
  const classMethods = extractUnClassMethods(source)
  const userMethods = classMethods[receiverType]
  if (userMethods) {
    return userMethods
      .filter((m) => m.toLowerCase().startsWith(query))
      .slice(0, Math.max(0, limit))
      .map((m) => ({ label: m, kind: "method" as const, detail: `method of ${receiverType}` }));
  }

  return [];
}

function getUnNativeCandidate(candidate: UnAutocompleteCandidate, nativeFunctions: readonly UnNativeFunctionMetadata[]) {
  if (candidate.kind === "argument") return undefined;
  const memberModule = candidate.kind === "method" || candidate.kind === "property"
    ? candidate.detail.match(/^native\s+(.+)\s+(?:method|property)$/)?.[1]
    : null;
  return nativeFunctions.find((entry) => entry.name === candidate.label && (memberModule ? entry.module === memberModule : !entry.module.startsWith("type:")));
}

export function getUnAutocompletePreview(source: string, candidate: UnAutocompleteCandidate, nativeFunctions: readonly UnNativeFunctionMetadata[] = []): { description: string; example: string; returnType?: string } {
  if (candidate.kind === "argument") {
    const functionName = candidate.detail.replace(/^argument of\s+/, "");
    const typeHint = getUnAutocompleteTypeHint(source, candidate, nativeFunctions) ?? "any";
    return { description: `Parameter for ${functionName}. Expected type: ${typeHint}.`, example: `${functionName}(${candidate.label})` };
  }
  if (candidate.detail === "builtin type") {
    const info = BUILTIN_TYPE_INFO.get(candidate.label);
    if (info?.description || info?.example) return { description: info.description || `Builtin type ${candidate.label}.`, example: info.example || `x: ${candidate.label}` };
    return { description: `Builtin type ${candidate.label}.`, example: `x: ${candidate.label}` };
  }
  if (candidate.detail === "class") return { description: `Class ${candidate.label} defined in current source.`, example: `${candidate.label}()` };
  const nativeFunction = getUnNativeCandidate(candidate, nativeFunctions);
  if (nativeFunction) return { description: nativeFunction.description, example: nativeFunction.example, returnType: nativeFunction.returnType };

  if (candidate.kind === "method" && candidate.detail.startsWith("method of ")) {
    const className = candidate.detail.replace("method of ", "")
    return { description: `Method of class ${className}. Defined in current source.`, example: `${candidate.label}()` }
  }

  const keywordPreview = KEYWORD_PREVIEWS[candidate.label];
  if (keywordPreview) return keywordPreview;

  if (candidate.kind === "function") {
    const signature = extractUnFunctionSignatures(source)[candidate.label];
    const parameters = signature?.parameters ?? [];
    const returnType = signature?.returnType;
    return {
      description: returnType && returnType !== "any" ? `Function available in the current source. Declared return type: ${returnType}.` : "Function available in the current source.",
      example: `${candidate.label}(${parameters.join(", ")})`,
      ...(returnType && returnType !== "any" ? { returnType } : {}),
    };
  }

  if (candidate.detail === "builtin type") {
    const info2 = BUILTIN_TYPE_INFO.get(candidate.label);
    if (info2?.description || info2?.example) return { description: info2.description || `Builtin type ${candidate.label}.`, example: info2.example || `x: ${candidate.label}` };
    return { description: `Builtin type ${candidate.label}.`, example: `x: ${candidate.label}` };
  }
  if (candidate.detail === "class") return { description: `Class ${candidate.label} defined in current source.`, example: `${candidate.label}()` };
  if (candidate.kind === "variable") return { description: "Variable declared in the current source.", example: `write(${candidate.label})` };
  return { description: `UN keyword: ${candidate.label}.`, example: `${candidate.label} …` };
}

export function applyUnAutocompleteCandidate(source: string, range: UnAutocompleteRange, candidate: UnAutocompleteCandidate): { source: string; cursor: number } {
  const nextSource = `${source.slice(0, range.start)}${candidate.label}${source.slice(range.end)}`;
  return { source: nextSource, cursor: range.start + candidate.label.length };
}

export type UnEditorTextEdit = {
  source: string;
  selectionStart: number;
  selectionEnd: number;
};

const PAIR_CLOSERS: Record<string, string> = { "(": ")", "[": "]", "{": "}", "\"": "\"", "'": "'" };
const CLOSING_CHARACTERS = new Set(Object.values(PAIR_CLOSERS));

export function applyUnPairedCharacterEdit(source: string, selectionStart: number, selectionEnd: number, key: string): UnEditorTextEdit | null {
  const start = Math.max(0, Math.min(selectionStart, source.length));
  const end = Math.max(start, Math.min(selectionEnd, source.length));
  const closingCharacter = PAIR_CLOSERS[key];

  if (CLOSING_CHARACTERS.has(key) && start === end && source[start] === key) {
    return { source, selectionStart: start + 1, selectionEnd: start + 1 };
  }

  if (closingCharacter) {
    const selectedText = source.slice(start, end);
    const nextSource = `${source.slice(0, start)}${key}${selectedText}${closingCharacter}${source.slice(end)}`;
    const cursor = start + 1 + selectedText.length;
    return { source: nextSource, selectionStart: cursor, selectionEnd: cursor };
  }

  if (key === "Backspace" && start === end && start > 0 && PAIR_CLOSERS[source[start - 1] ?? ""] === source[start]) {
    const nextSource = `${source.slice(0, start - 1)}${source.slice(start + 1)}`;
    return { source: nextSource, selectionStart: start - 1, selectionEnd: start - 1 };
  }

  return null;
}

export type UnSyntaxDiagnostic = {
  start: number;
  end: number;
  line: number;
  column: number;
};

function createUnSyntaxDiagnostic(source: string, start: number, end = start + 1): UnSyntaxDiagnostic | null {
  if (source.length === 0) return null;
  const boundedStart = Math.max(0, Math.min(start, source.length - 1));
  const boundedEnd = Math.max(boundedStart + 1, Math.min(end, source.length));
  const beforeStart = source.slice(0, boundedStart);
  const line = beforeStart.split("\n").length;
  const column = boundedStart - (beforeStart.lastIndexOf("\n") + 1) + 1;

  return { start: boundedStart, end: boundedEnd, line, column };
}

export function findUnInlineSyntaxDiagnostic(source: string): UnSyntaxDiagnostic | null {
  const openingPairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  const closingPairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: Array<{ character: string; index: number }> = [];
  let quote: "\"" | "'" | null = null;
  let quoteStart = -1;

  for (let index = 0; index < source.length; index++) {
    const character = source[index] ?? "";

    if (quote) {
      if (character === "\\") {
        index++;
        continue;
      }
      if (character === quote) quote = null;
      continue;
    }

    if (character === "#") {
      const nextLine = source.indexOf("\n", index);
      index = nextLine === -1 ? source.length : nextLine;
      continue;
    }

    if (character === "\"" || character === "'") {
      quote = character;
      quoteStart = index;
      continue;
    }

    if (openingPairs[character]) {
      stack.push({ character, index });
      continue;
    }

    if (closingPairs[character]) {
      const opener = stack.at(-1);
      if (!opener || opener.character !== closingPairs[character]) return createUnSyntaxDiagnostic(source, index);
      stack.pop();
    }
  }

  if (quote) return createUnSyntaxDiagnostic(source, quoteStart);
  if (stack.length > 0) return createUnSyntaxDiagnostic(source, stack.at(-1)?.index ?? 0);

  const incompleteAssignment = /(?:^|\n)\s*[A-Za-z_][A-Za-z0-9_]*\s*(?:=|\+=|-=|\*=|\/=|%=)\s*$/m.exec(source);
  if (incompleteAssignment) {
    const equalsOffset = incompleteAssignment[0].lastIndexOf("=");
    const assignmentStart = incompleteAssignment.index + Math.max(0, equalsOffset);
    return createUnSyntaxDiagnostic(source, assignmentStart);
  }

  return null;
}

export function parseUnSyntaxDiagnostic(source: string, message: string): UnSyntaxDiagnostic | null {
  const position = message.match(/<[^>]+>,\s*line\s*\[(\d+)\],\s*column\s*\[(\d+)\]/i);
  if (!position || source.length === 0) return null;

  const line = Number(position[1]);
  const column = Number(position[2]);
  if (!Number.isInteger(line) || !Number.isInteger(column) || line < 1 || column < 1) return null;

  const lines = source.split("\n");
  if (line > lines.length) return null;

  const lineStart = lines.slice(0, line - 1).reduce((offset, value) => offset + value.length + 1, 0);
  const requestedStart = lineStart + column - 1;
  let start = Math.max(0, Math.min(requestedStart, source.length - 1));
  if (/\s/.test(source[start] ?? "")) {
    const visibleLineStart = source.lastIndexOf("\n", start - 1) + 1;
    while (start > visibleLineStart && /\s/.test(source[start] ?? "")) start--;
  }
  const caretLength = message.match(/^\s*(\^+)\s*$/m)?.[1]?.length ?? 1;
  const end = Math.max(start + 1, Math.min(source.length, start + caretLength));

  return { start, end, line, column };
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

export function tokenizeUnSource(source: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  const push = (type: HighlightTokenType, value: string) => tokens.push({ type, value });
  // 사용자 정의 클래스: `class Name`으로 선언된 이름만 타입으로 하이라이팅
  const userClasses = new Set<string>()
  const classDeclRe = /^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)/gm
  let classMatch: RegExpExecArray | null
  while ((classMatch = classDeclRe.exec(source)) !== null) {
    userClasses.add(classMatch[1])
  }
  // 사용자 정의 함수/변수 — 하이라이팅에서 타입보다 우선 (같은 이름 섀도잉)
  const userSymbols = extractUnSourceSymbols(source)
  const userFunctions = new Set(userSymbols.filter(s => s.kind === "function" || s.kind === "method").map(s => s.label))
  const userVariables = new Set(userSymbols.filter(s => s.kind === "variable").map(s => s.label))
  // use로 가져온 모듈(alias 포함) — io, mio 등
  const usedMap = getUsedNativeModuleMap(source)
  const aliasedBases = new Set<string>()
  for (const [k, v] of usedMap.entries()) if (k !== v) aliasedBases.add(v)
  let afterUseOrAs = false
  let afterAt = false
  let braceDepth = 0
  const getCurrentLine = (pos: number) => {
    const lastNl = source.lastIndexOf("\n", pos - 1)
    const lineStart = lastNl + 1
    const nextNl = source.indexOf("\n", pos)
    const lineEnd = nextNl === -1 ? source.length : nextNl
    return source.slice(lineStart, lineEnd).trim()
  }
  let index = 0;

  while (index < source.length) {
    const current = source[index] ?? "";

    if (current === "#") {
      const end = source.indexOf("\n", index);
      const nextIndex = end === -1 ? source.length : end;
      push("comment", source.slice(index, nextIndex));
      index = nextIndex;
      continue;
    }

    if (current === '"' || current === "'") {
      const quote = current;
      let end = index + 1;
      while (end < source.length) {
        if (source[end] === "\\") {
          end += 2;
          continue;
        }
        if (source[end] === quote) {
          end += 1;
          break;
        }
        end += 1;
      }
      push("string", source.slice(index, end));
      index = end;
      continue;
    }

    if (/\d/.test(current)) {
      if (current === "0" && index + 1 < source.length) {
        const next = source[index + 1];
        if (next === "x" || next === "X") {
          const hexMatch = source.slice(index).match(/^0[xX][0-9a-fA-F_]+/);
          if (hexMatch) {
            push("number", hexMatch[0]);
            index += hexMatch[0].length;
            continue;
          }
        } else if (next === "b" || next === "B") {
          const binMatch = source.slice(index).match(/^0[bB][01_]+/);
          if (binMatch) {
            push("number", binMatch[0]);
            index += binMatch[0].length;
            continue;
          }
        }
      }
      const match = source.slice(index).match(/^\d+(?:\.\d+)?/);
      const value = match?.[0] ?? current;
      push("number", value);
      index += value.length;
      continue;
    }

    if ("()[]{}*".includes(current)) {
      // * in use io { * } — wildcard import, highlight as bracket (gold/vivid)
      if (current === "{") braceDepth++
      else if (current === "}") braceDepth = Math.max(0, braceDepth - 1)
      // * should be highlighted even outside use — treat as bracket/operator
      if (current === "*") {
        // check if next char is * or = for ** or *=
        const next = source[index + 1];
        if (next === "*") {
          push("bracket", "**");
          index += 2;
          continue;
        } else if (next === "=") {
          push("bracket", "*=");
          index += 2;
          continue;
        }
      }
      push("bracket", current);
      index += 1;
      continue;
    }

    if (source.slice(index, index + 2) === "->") {
      push("keyword", "->");
      index += 2;
      continue;
    }

    if (current === "@") {
      push("keyword", "@");
      afterAt = true;
      index += 1;
      continue;
    }

    if (/[A-Za-z_]/.test(current)) {
      const match = source.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      const value = match?.[0] ?? current;
      const nextNonWhitespace = source.slice(index + value.length).match(/^\s*(.)/)?.[1];
      let type: HighlightTokenType
      if (UN_KEYWORDS.has(value)) {
        type = "keyword"
        afterUseOrAs = (value === "use" || value === "as")
      } else if (afterAt) {
        type = "function"
        afterAt = false
      } else if (afterUseOrAs) {
        if (braceDepth > 0) type = "variable"
        else type = "module"
        afterUseOrAs = false
      } else if (usedMap.has(value)) type = "module"
      else if (userFunctions.has(value)) type = "function"
      else if (userVariables.has(value)) type = "variable"
      else if (userClasses.has(value)) type = "type"
      else if (nextNonWhitespace === "(") type = "function"
      else if (UN_MODULES.has(value)) type = "variable"
      else if (UN_BUILTIN_TYPES.has(value)) type = "type"
      else type = "variable"
      push(type, value);
      index += value.length;
      continue;
    }

    push("plain", current);
    index += 1;
  }

  return tokens;
}

export function highlightUnSource(source: string, syntaxDiagnostic?: UnSyntaxDiagnostic | null): string {
  let offset = 0;
  let depth = 0;

  return tokenizeUnSource(source)
    .map(({ type, value }) => {
      let displayType: string = type;
      if (type === "bracket") {
        if ("({[".includes(value)) {
          displayType = `bracket-${depth % 3}`;
          depth++;
        } else {
          depth = Math.max(0, depth - 1);
          displayType = `bracket-${depth % 3}`;
        }
      }
      const start = offset;
      offset += value.length;
      const token = displayType === "plain" ? escapeHtml(value) : `<span class="un-syntax-${displayType}">${escapeHtml(value)}</span>`;
      const overlapsDiagnostic = syntaxDiagnostic && start < syntaxDiagnostic.end && offset > syntaxDiagnostic.start;
      return overlapsDiagnostic ? `<span class="un-syntax-error">${token}</span>` : token;
    })
    .join("");
}

export type ConsolePresentation = {
  label: string;
  tone: "success" | "error" | "warning" | "neutral";
  detail: string;
};

export function presentExecution(result: ExecutionSnapshot): ConsolePresentation {
  if (result.status === "success") {
    return {
      label: "실행 완료",
      tone: "success",
      detail: result.stdout || "출력이 없습니다.",
    };
  }

  if (result.status === "cancelled") {
    return {
      label: "Cancelled",
      tone: "neutral",
      detail: "Execution cancelled.",
    };
  }

  const typeLabels: Record<string, string> = {
    validation: "입력 확인",
    policy: "실행 정책",
    syntax: "문법 오류",
    runtime: "런타임 오류",
    timeout: "시간 제한",
    output_limit: "출력 제한",
    service: "실행 환경",
  };

  return {
    label: typeLabels[result.error?.kind ?? "service"] ?? "실행 오류",
    tone: result.status === "timed_out" ? "warning" : "error",
    detail: result.error?.message || result.stderr || "실행 결과를 확인할 수 없습니다.",
  };
}
