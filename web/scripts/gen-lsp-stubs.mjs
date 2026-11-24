// Generates web/src/lib/lspStubs.ts from un/rust/lsp-stubs/*.un.
// The stubs are the source of truth for LSP hover docs and signature labels
// (see the `docs` module in un/rust/src/lsp.rs), so the playground mirrors them
// instead of inventing its own descriptions.
//
// Usage (from the un-playground repo root):
//   node web/scripts/gen-lsp-stubs.mjs <un/rust/lsp-stubs> [outPath]
// Defaults:
//   stubDir = required argument
//   out     = web/src/lib/lspStubs.ts

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
if (!process.argv[2]) {
  console.error('usage: node web/scripts/gen-lsp-stubs.mjs <un/rust/lsp-stubs> [outPath]')
  process.exit(1)
}
const stubDir = resolve(process.argv[2])
const outPath = resolve(process.argv[3] ?? join(repoRoot, 'web', 'src', 'lib', 'lspStubs.ts'))

const entries = {}
for (const file of readdirSync(stubDir).filter((name) => name.endsWith('.un')).sort()) {
  entries[basename(file, '.un')] = readFileSync(join(stubDir, file), 'utf8')
}

const header = `// Generated from un/rust/lsp-stubs/*.un — mirrors the \`docs\` module in lsp.rs.
// Regenerate with: node web/scripts/gen-lsp-stubs.mjs <un/rust/lsp-stubs> <outPath>
// Do not edit by hand.

export const LSP_STUB_TEXT: Record<string, string> = `
writeFileSync(outPath, `${header}${JSON.stringify(entries, null, 2)}\n`, 'utf8')
console.log(`wrote ${outPath}: ${Object.keys(entries).length} stub modules`)
