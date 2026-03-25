import assert from 'assert'
import { spawnSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { describe, it } from 'mocha'

const CLI_PATH = path.resolve('cli/index.js')

/**
 * Run the CLI with provided arguments.
 * @param {string[]} args
 * @returns {import('child_process').SpawnSyncReturns<string>}
 */
function runGlad (args) {
  return spawnSync('node', [CLI_PATH, ...args], { encoding: 'utf8' })
}

describe('CLI Exit Codes', function () {
  it('returns 99 when upward dependencies are found without circular dependencies', function () {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glad-upward-'))
    const dotPath = path.join(tempDir, 'upward.dot')
    fs.writeFileSync(dotPath, 'digraph G { "a" -> "b"; "b" -> "c"; "c" -> "a"; }')

    try {
      const result = runGlad([dotPath, '-s'])
      assert.strictEqual(result.status, 99)
    } finally {
      fs.rmSync(tempDir, { force: true, recursive: true })
    }
  })

  it('returns 100 when circular dependencies are found', function () {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glad-circular-'))
    const dotPath = path.join(tempDir, 'circular.dot')
    fs.writeFileSync(dotPath, 'digraph G { "a" -> "b"; "b" -> "a"; }')

    try {
      const result = runGlad([dotPath, '-s'])
      assert.strictEqual(result.status, 100)
    } finally {
      fs.rmSync(tempDir, { force: true, recursive: true })
    }
  })

  it('returns 4 when no input files are found', function () {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glad-empty-'))

    try {
      const result = runGlad([tempDir, '-s'])
      assert.strictEqual(result.status, 4)
    } finally {
      fs.rmSync(tempDir, { force: true, recursive: true })
    }
  })

  it('returns 2 for invalid DOT input', function () {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'glad-invalid-dot-'))
    const dotPath = path.join(tempDir, 'invalid.dot')
    fs.writeFileSync(dotPath, 'not a valid dot graph')

    try {
      const result = runGlad([dotPath, '-s'])
      assert.strictEqual(result.status, 2)
    } finally {
      fs.rmSync(tempDir, { force: true, recursive: true })
    }
  })
})
