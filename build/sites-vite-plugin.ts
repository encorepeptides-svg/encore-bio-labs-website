import { access, cp, mkdir, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const staticSiteWorker = `const worker = {
  async fetch(request, env) {
    const url = new URL(request.url)
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || (request.method !== 'GET' && request.method !== 'HEAD')) {
      return response
    }

    const acceptsHtml = request.headers.get('accept')?.includes('text/html') ?? false
    if (!acceptsHtml) return response

    const fallbackUrl = new URL('/', request.url)
    const fallback = await env.ASSETS.fetch(new Request(fallbackUrl))
    if (fallback.status === 404) {
      console.error('SPA shell is missing from the Sites asset binding', {
        path: url.pathname,
      })
    }
    return fallback
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
      if (process.env.VERCEL === '1') return
      await stageSitesOutput(root)
    },
  }
}
