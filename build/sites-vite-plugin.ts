import { access, cp, mkdir, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const staticSiteWorker = `async function withRuntimeConfig(response, env) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) return response

  const config = {
    supabaseUrl: env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || '',
  }
  const serialized = JSON.stringify(config).replace(/</g, '\\\\u003c')
  const script = '<script>window.__ENCORE_RUNTIME_CONFIG__=' + serialized + '</script>'
  const html = (await response.text()).replace('</head>', script + '</head>')
  const headers = new Headers(response.headers)
  headers.delete('content-length')
  headers.delete('etag')
  return new Response(html, { status: response.status, statusText: response.statusText, headers })
}

const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || (request.method !== 'GET' && request.method !== 'HEAD')) {
      return withRuntimeConfig(response, env)
    }

    const acceptsHtml = request.headers.get('accept')?.includes('text/html') ?? false
    if (!acceptsHtml) return response

    const fallbackUrl = new URL('/index.html', request.url)
    const fallback = await env.ASSETS.fetch(new Request(fallbackUrl))
    if (fallback.status === 404) {
      console.error('SPA shell is missing from the Sites asset binding', {
        path: new URL(request.url).pathname,
      })
    }
    return withRuntimeConfig(fallback, env)
  },
}

export default worker
`

async function exists(path: string) {
  try {
    await access(path)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

export async function stageSitesOutput(root: string) {
  const outputDirectory = resolve(root, 'dist')
  const clientDirectory = resolve(outputDirectory, 'client')
  const metadataDirectory = resolve(outputDirectory, '.openai')
  const serverDirectory = resolve(outputDirectory, 'server')
  const hostingConfig = resolve(root, '.openai', 'hosting.json')

  await rm(clientDirectory, { recursive: true, force: true })
  await mkdir(clientDirectory, { recursive: true })

  for (const entry of await readdir(outputDirectory)) {
    if (entry === 'client' || entry === 'server' || entry === '.openai') continue
    await rename(resolve(outputDirectory, entry), resolve(clientDirectory, entry))
  }

  await rm(metadataDirectory, { recursive: true, force: true })
  await mkdir(metadataDirectory, { recursive: true })
  await mkdir(serverDirectory, { recursive: true })

  if (await exists(hostingConfig)) {
    await cp(hostingConfig, resolve(metadataDirectory, 'hosting.json'))
  }

  await writeFile(resolve(serverDirectory, 'index.js'), staticSiteWorker, 'utf8')
}

/** Adds the metadata and Worker entrypoint required by OpenAI Sites. */
export function sites(): Plugin {
  let root = process.cwd()

  return {
    name: 'sites',
    apply: 'build',
    configResolved(config) {
      root = config.root
    },
    async closeBundle() {
      await stageSitesOutput(root)
    },
  }
}
