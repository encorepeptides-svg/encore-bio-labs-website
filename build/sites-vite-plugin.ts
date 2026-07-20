import { access, cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const staticSiteWorker = `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || (request.method !== 'GET' && request.method !== 'HEAD')) {
      return response
    }

    const acceptsHtml = request.headers.get('accept')?.includes('text/html') ?? false
    if (!acceptsHtml) return response

    const fallbackUrl = new URL('/index.html', request.url)
    return env.ASSETS.fetch(new Request(fallbackUrl, request))
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
      const outputDirectory = resolve(root, 'dist')
      const metadataDirectory = resolve(outputDirectory, '.openai')
      const serverDirectory = resolve(outputDirectory, 'server')
      const hostingConfig = resolve(root, '.openai', 'hosting.json')

      await rm(metadataDirectory, { recursive: true, force: true })
      await mkdir(metadataDirectory, { recursive: true })
      await mkdir(serverDirectory, { recursive: true })

      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(metadataDirectory, 'hosting.json'))
      }

      await writeFile(resolve(serverDirectory, 'index.js'), staticSiteWorker, 'utf8')
    },
  }
}
