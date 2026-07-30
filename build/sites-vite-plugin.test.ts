import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { stageSitesOutput } from './sites-vite-plugin'

let fixture = ''

async function exists(path: string) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

describe('Sites build staging', () => {
  afterEach(async () => {
    if (fixture) await rm(fixture, { recursive: true, force: true })
    fixture = ''
  })

  it('places the Vite app in the client asset directory and emits the worker', async () => {
    fixture = await mkdtemp(resolve(tmpdir(), 'encore-sites-build-'))
    await mkdir(resolve(fixture, 'dist', 'assets'), { recursive: true })
    await mkdir(resolve(fixture, '.openai'), { recursive: true })
    await writeFile(resolve(fixture, 'dist', 'index.html'), '<!doctype html><html><head></head></html>')
    await writeFile(resolve(fixture, 'dist', 'assets', 'app.js'), 'export {}')
    await writeFile(resolve(fixture, '.openai', 'hosting.json'), '{"project_id":"test"}')

    await stageSitesOutput(fixture)

    expect(await exists(resolve(fixture, 'dist', 'index.html'))).toBe(false)
    expect(await readFile(resolve(fixture, 'dist', 'client', 'index.html'), 'utf8')).toContain('<!doctype html>')
    expect(await readFile(resolve(fixture, 'dist', 'client', 'assets', 'app.js'), 'utf8')).toBe('export {}')
    expect(await readFile(resolve(fixture, 'dist', 'server', 'index.js'), 'utf8')).toContain('env.ASSETS.fetch')
    expect(await readFile(resolve(fixture, 'dist', '.openai', 'hosting.json'), 'utf8')).toContain('"test"')
  })
})
