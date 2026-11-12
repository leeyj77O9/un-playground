// Generates web/src/lib/nativeCatalog.ts from the Un native-inventory document.
//
// The inventory is the record of the reference's native surface: every
// [Native]/[BuiltinModule]/[BuiltinType]/[NativeType] method with its
// description and example. The Rust playground has no reflection metadata, so
// the playground ships this catalog as static data for editor autocomplete.
//
// Usage (from the un-playground repo root):
//   node web/scripts/gen-native-catalog.mjs [path/to/NATIVE_INVENTORY.md] [outPath]
// Defaults:
//   inventory = ../un/docs/rust-migration/NATIVE_INVENTORY.md
//   out       = web/src/lib/nativeCatalog.ts

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const inventoryPath = resolve(process.argv[2] ?? join(repoRoot, '..', 'un', 'docs', 'rust-migration', 'NATIVE_INVENTORY.md'))
const outPath = resolve(process.argv[3] ?? join(repoRoot, 'web', 'src', 'lib', 'nativeCatalog.ts'))

const MODULE_KINDS = new Set(['BuiltinModule', 'NativeModule'])
const TYPE_KINDS = new Set(['BuiltinType', 'NativeType'])

function unescapeText(text) {
  // the inventory dumps the reference's C# string literals raw: \" -> ", \\ -> \
  // anything else (\n, \d, ...) stays as written
  return text.replace(/\\(.)/g, (match, ch) => {
    if (ch === '\\') return '\\'
    if (ch === '"') return '"'
    return match
  })
}

function unbacktick(text) {
  const trimmed = text.trim()
  return trimmed.startsWith('`') && trimmed.endsWith('`') ? trimmed.slice(1, -1) : trimmed
}

// split cells on pipes that are not escaped with a backslash, then unescape `\|`
function splitCells(line) {
  return line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim().replace(/\\\|/g, '|'))
}

// `int | float int | float` -> ['int | float', 'int | float'], `str str str` -> ['str', 'str', 'str']
function parseArgTypes(cell) {
  const trimmed = unbacktick(cell.trim())
  if (trimmed === '') return []
  const tokens = trimmed.split(/\s+/)
  const types = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '|') continue
    if (i >= 2 && tokens[i - 1] === '|') {
      types[types.length - 1] += ' | ' + token
      continue
    }
    types.push(token)
  }
  return types
}

function parseParams(cell) {
  const segments = cell.split(';').map((s) => s.trim()).filter(Boolean)
  const params = []
  for (const segment of segments) {
    const brace = segment.indexOf('{')
    if (brace === -1) continue
    const decl = segment.slice(0, brace).trim()
    const flags = segment.slice(brace + 1, segment.lastIndexOf('}')).trim()

    if (/SELF/.test(flags)) continue // the receiver is not an argument

    // `Obj values` / `Obj? index = null` / `Obj code = null!` — drop the default then take the last token
    const nameToken = (decl.split('=')[0].trim().split(/\s+/).pop() ?? '').replace(/^@/, '')
    const argsName = /Name\s*=\s*"([^"]+)"/.exec(flags)?.[1]
    params.push({
      name: argsName ?? nameToken,
      flags,
    })
  }
  return params
}

const lines = readFileSync(inventoryPath, 'utf8').split(/\r?\n/)

/** @type {Array<{name: string, module: string, description: string, example: string, returnType: string, parameters: Array<{name: string, expectedType: string, essential: boolean, optional: boolean, positional: boolean}>}>} */
const catalog = []
const skipped = []
let currentKinds = []

function moduleTargets(hasSelf) {
  const modules = currentKinds.filter((k) => MODULE_KINDS.has(k.kind)).map((k) => k.name)
  const types = currentKinds.filter((k) => TYPE_KINDS.has(k.kind)).map((k) => `type:${k.name}`)
  if (hasSelf) return types.length > 0 ? types : modules
  return modules.length > 0 ? modules : types
}

for (const line of lines) {
  const section = /^### `[^`]+`\s+--\s+(.+)$/.exec(line)
  if (section) {
    currentKinds = []
    const kindPattern = /(BuiltinModule|NativeModule|BuiltinType|NativeType):\s*([A-Za-z0-9_]+)/g
    let match
    while ((match = kindPattern.exec(section[1])) !== null) {
      currentKinds.push({ kind: match[1], name: match[2] })
    }
    continue
  }
  if (/^### /.test(line)) {
    currentKinds = []
    continue
  }
  if (currentKinds.length === 0 || !line.startsWith('| `')) continue

  const cells = splitCells(line)
  if (cells.length !== 6) {
    skipped.push(`bad cell count (${cells.length}): ${line}`)
    continue
  }
  const [fnCell, retCell, argTypesCell, paramsCell, descCell, exampleCell] = cells

  const targets = moduleTargets(/SELF/.test(paramsCell))
  if (targets.length === 0) {
    skipped.push(`no module target: ${line}`)
    continue
  }

  const argTypes = parseArgTypes(argTypesCell)
  const params = parseParams(paramsCell).map((param, index) => ({
    name: param.name,
    expectedType: argTypes[index] ?? 'any',
    essential: /Essential\s*=\s*true/.test(param.flags),
    optional: /Optional\s*=\s*true/.test(param.flags),
    positional: /Positional\s*=\s*true/.test(param.flags),
  }))

  for (const module of targets) {
    catalog.push({
      name: unbacktick(fnCell),
      module,
      description: unescapeText(descCell.trim()),
      example: unescapeText(unbacktick(exampleCell).trim()),
      returnType: unbacktick(retCell),
      parameters: params,
    })
  }
}

const seen = new Set()
const deduped = catalog.filter((entry) => {
  const key = `${entry.module}:${entry.name}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

const header = `// Generated from un/docs/rust-migration/NATIVE_INVENTORY.md by web/scripts/gen-native-catalog.mjs.
// Do not edit by hand — regenerate after the inventory changes.
// The Rust playground ships no reflection metadata, so this static catalog is
// what the editor uses for autocomplete and signature help.
import type { UnNativeFunctionMetadata } from './playground'

export const NATIVE_FUNCTION_CATALOG: UnNativeFunctionMetadata[] = `

const body = JSON.stringify(deduped, null, 2).replace(/"([^"]+)": /g, (_, key) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? `${key}: ` : `"${key}": `))
const output = `${header}${body}\n`

writeFileSync(outPath, output, 'utf8')
console.log(`wrote ${outPath}: ${deduped.length} entries`)
if (skipped.length > 0) {
  console.log(`${skipped.length} rows skipped:`)
  for (const row of skipped) console.log(`  ${row}`)
}
