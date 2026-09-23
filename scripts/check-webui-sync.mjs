#!/usr/bin/env node
// Check that the shared dependencies stay in sync with the Trino web UI.
//
// The query editor is embedded into the Trino web UI, which supplies the shared
// React, Emotion, MUI, and Monaco libraries at runtime. Those must match so the
// embed ships a single instance of each, and the build toolchain is kept close
// for consistency. This script fetches the web UI manifest from the Trino
// default branch and compares the shared packages against the local
// package.json. It exits non-zero when a runtime library drifts, and only warns
// on the build toolchain, which does not affect the embed at runtime.
//
// Run locally with `npm run sync:check`. CI runs it on every pull request and
// on a weekly schedule.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const WEBUI_MANIFEST_URL =
  'https://raw.githubusercontent.com/trinodb/trino/master/core/trino-web-ui/src/main/resources/webapp/package.json'

// Runtime libraries shared with the web UI at runtime. Drift here breaks the
// embed, so a mismatch fails the check.
const RUNTIME = [
  'react',
  'react-dom',
  '@emotion/react',
  '@emotion/styled',
  '@mui/material',
  '@mui/icons-material',
  '@monaco-editor/react',
  'monaco-editor',
]

// Build toolchain shared with the web UI. Drift is reported but does not fail
// the check, because it does not affect the runtime embed. The React type
// declarations live here rather than in RUNTIME: they gate type checking at
// build time but are not shipped into the runtime embed.
const TOOLCHAIN = [
  '@types/react',
  '@types/react-dom',
  'eslint',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-refresh',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'typescript',
  '@vitejs/plugin-react',
  'prettier',
]

const here = dirname(fileURLToPath(import.meta.url))
const local = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8'))

const localVersion = (name) =>
  local.dependencies?.[name] ??
  local.devDependencies?.[name] ??
  local.peerDependencies?.[name]

// Reduce a version range to a comparable base version. Only exact versions and
// caret (`^`) or tilde (`~`) ranges are supported, since those are what the
// query editor and the web UI actually use. Any other range syntax — `<`, `>`,
// `>=`, `<=`, `x` wildcards, hyphen ranges, or `||` unions — cannot be reduced
// to a single comparable version without guessing, so it is rejected with a
// clear error rather than silently stripped into a false match. Also unwraps an
// npm alias such as `npm:rolldown-vite@^7.3.1`.
const SUPPORTED_RANGE = /^[\^~]?(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)$/
const baseVersion = (source, name, spec) => {
  if (!spec) return undefined
  const aliased = spec.startsWith('npm:') ? spec.split('@').pop() : spec
  const match = aliased.match(SUPPORTED_RANGE)
  if (!match) {
    console.error(
      `Unsupported version range for ${name} in the ${source} manifest: "${spec}". ` +
        'Only exact versions and caret (^) or tilde (~) ranges are supported.'
    )
    process.exit(2)
  }
  return match[1]
}

const response = await fetch(WEBUI_MANIFEST_URL)
if (!response.ok) {
  console.error(
    `Failed to fetch the Trino web UI manifest: ${response.status} ${response.statusText}`
  )
  process.exit(2)
}
const webui = await response.json()
const webuiVersion = (name) =>
  webui.dependencies?.[name] ?? webui.devDependencies?.[name]

const compare = (names) => {
  const rows = []
  for (const name of names) {
    const ours = baseVersion('local', name, localVersion(name))
    const theirs = baseVersion('web UI', name, webuiVersion(name))
    if (!theirs) continue // the web UI does not use this package
    rows.push({ name, ours, theirs, drift: ours !== theirs })
  }
  return rows
}

const report = (title, rows) => {
  console.log(`\n${title}`)
  for (const { name, ours, theirs, drift } of rows) {
    const mark = drift ? 'DRIFT' : 'ok'
    console.log(
      `  [${mark}] ${name}: local ${ours ?? 'missing'} vs web UI ${theirs}`
    )
  }
}

const runtime = compare(RUNTIME)
const toolchain = compare(TOOLCHAIN)

report('Runtime libraries (must match)', runtime)
report('Build toolchain (advisory)', toolchain)

const runtimeDrift = runtime.filter((r) => r.drift)
const toolchainDrift = toolchain.filter((r) => r.drift)

if (toolchainDrift.length > 0) {
  console.log(
    `\nToolchain drift on ${toolchainDrift.length} package(s). This is advisory and does not fail the check.`
  )
}

if (runtimeDrift.length > 0) {
  console.error(
    `\nRuntime drift on ${runtimeDrift.length} package(s). Align package.json with the Trino web UI, or bump the web UI first.`
  )
  process.exit(1)
}

console.log('\nShared runtime libraries are in sync with the Trino web UI.')
