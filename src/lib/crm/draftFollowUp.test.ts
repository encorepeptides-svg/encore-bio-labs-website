import { beforeEach, describe, expect, it, vi } from 'vitest'

const supabaseMocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  getSession: vi.fn(),
}))

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: { getSession: supabaseMocks.getSession },
    functions: { invoke: supabaseMocks.invoke },
  },
  isSupabaseConfigured: true,
}))

const { draftFollowUp } = await import('./draftFollowUp')

// Mirrors @supabase/functions-js: `context` is a Response only for
// FunctionsHttpError. Building the errors by hand keeps the test honest about
// the shapes the SDK actually hands back.
function httpError(status: number, body: unknown, contentType = 'application/json') {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  const error = new Error('Edge Function returned a non-2xx status code')
  error.name = 'FunctionsHttpError'
  Object.assign(error, { context: new Response(payload, { status, headers: { 'content-type': contentType } }) })
  return error
}

function fetchError(cause: Error) {
  const error = new Error('Failed to send a request to the Edge Function')
  error.name = 'FunctionsFetchError'
  Object.assign(error, { context: cause })
  return error
}

// Asserting on several parts of one message reads better than chaining
// `rejects.toThrow` matchers, and this keeps the caught value typed as Error.
async function rejection(run: () => Promise<unknown>): Promise<Error> {
  let caught: unknown
  try {
    await run()
  } catch (error) {
    caught = error
  }
  expect(caught).toBeInstanceOf(Error)
  return caught as Error
}

beforeEach(() => {
  supabaseMocks.invoke.mockReset()
  supabaseMocks.getSession.mockReset()
  supabaseMocks.getSession.mockResolvedValue({ data: { session: { access_token: 'admin-jwt' } }, error: null })
})

describe('draftFollowUp success path', () => {
  it('returns the draft, locale, and channel the function replied with', async () => {
    supabaseMocks.invoke.mockResolvedValue({
      data: { draft: 'Hola Ana, gracias por tu consulta de investigación.', locale: 'es', channel: 'whatsapp' },
      error: null,
    })

    await expect(draftFollowUp('a3f1c2d4-1111-4222-8333-444455556666', 'whatsapp')).resolves.toEqual({
      draft: 'Hola Ana, gracias por tu consulta de investigación.',
      locale: 'es',
      channel: 'whatsapp',
    })

    expect(supabaseMocks.invoke).toHaveBeenCalledWith('draft-followup', {
      body: { leadId: 'a3f1c2d4-1111-4222-8333-444455556666', channel: 'whatsapp' },
    })
  })

  it('refuses to invoke the function at all when there is no signed-in session', async () => {
    supabaseMocks.getSession.mockResolvedValue({ data: { session: null }, error: null })

    await expect(draftFollowUp('lead-1', 'email')).rejects.toThrow(/not signed in/i)
    expect(supabaseMocks.invoke).not.toHaveBeenCalled()
  })
})

describe('draftFollowUp FunctionsHttpError handling', () => {
  it('surfaces the function\'s own JSON error message together with the status', async () => {
    supabaseMocks.invoke.mockResolvedValue({
      data: null,
      error: httpError(502, { error: 'The drafting service returned 429.', code: 'openai_http_429' }),
    })

    await expect(draftFollowUp('lead-1', 'whatsapp')).rejects.toThrow('The drafting service returned 429. (HTTP 502)')
  })

  it('appends the upstream detail when the function includes one', async () => {
    supabaseMocks.invoke.mockResolvedValue({
      data: null,
      error: httpError(502, { error: 'The drafting service returned 401.', detail: 'Incorrect API key provided' }),
    })

    await expect(draftFollowUp('lead-1', 'whatsapp')).rejects.toThrow(/Incorrect API key provided/)
  })

  it('reads the gateway\'s `message` field, not just this function\'s `error` field', async () => {
    // What the Supabase gateway returns when verify_jwt rejects the request
    // before the function ever runs.
    supabaseMocks.invoke.mockResolvedValue({
      data: null,
      error: httpError(401, { code: 'UNAUTHORIZED_NO_AUTH_HEADER', message: 'Missing authorization header' }),
    })

    const failure = await rejection(() => draftFollowUp('lead-1', 'whatsapp'))
    expect(failure.message).toContain('401')
    expect(failure.message).toContain('Missing authorization header')
    expect(failure.message).toMatch(/sign in again/i)
  })

  it('explains a 403 as an authorization problem rather than a generic failure', async () => {
    supabaseMocks.invoke.mockResolvedValue({
      data: null,
      error: httpError(403, { error: 'You are signed in, but this account is not a CRM administrator.' }),
    })

    await expect(draftFollowUp('lead-1', 'whatsapp')).rejects.toThrow(/Access denied \(403\).*not a CRM administrator/)
  })

  it('passes through a non-JSON body instead of throwing a parse error', async () => {
    supabaseMocks.invoke.mockResolvedValue({
      data: null,
      error: httpError(500, 'Internal Server Error', 'text/plain'),
    })

    await expect(draftFollowUp('lead-1', 'whatsapp')).rejects.toThrow('Internal Server Error (HTTP 500)')
  })

  it('still reports the status when the body is empty', async () => {
    supabaseMocks.invoke.mockResolvedValue({ data: null, error: httpError(500, '', 'text/plain') })

    await expect(draftFollowUp('lead-1', 'whatsapp')).rejects.toThrow(/HTTP 500 and gave no reason/)
  })

  it('names a missing deployment when the platform returns a bare 404', async () => {
    supabaseMocks.invoke.mockResolvedValue({ data: null, error: httpError(404, '', 'text/plain') })

    await expect(draftFollowUp('lead-1', 'whatsapp')).rejects.toThrow(/not deployed \(404\)/)
  })
})

describe('draftFollowUp errors whose context is not a Response', () => {
  // The regression that produced "e.json is not a function" in production: the
  // handler assumed `context` was always a Response and called `.json()` on a
  // TypeError.
  it('explains a blocked or failed request instead of throwing a raw JS exception', async () => {
    supabaseMocks.invoke.mockResolvedValue({
      data: null,
      error: fetchError(new TypeError('Failed to fetch')),
    })

    const failure = await rejection(() => draftFollowUp('lead-1', 'whatsapp'))
    expect(failure.message).toContain('could not be reached')
    expect(failure.message).toContain('Failed to fetch')
    expect(failure.message).toMatch(/CORS/i)
    expect(failure.message).not.toMatch(/is not a function/)
  })

  it('handles an error with no context at all', async () => {
    supabaseMocks.invoke.mockResolvedValue({ data: null, error: new Error('boom') })

    await expect(draftFollowUp('lead-1', 'whatsapp')).rejects.toThrow(/could not be reached/)
  })

  it('handles a context that is a plain object with no Response methods', async () => {
    const error = new Error('Relay Error invoking the Edge Function')
    error.name = 'FunctionsRelayError'
    Object.assign(error, { context: { region: 'us-east-1' } })
    supabaseMocks.invoke.mockResolvedValue({ data: null, error })

    const failure = await rejection(() => draftFollowUp('lead-1', 'whatsapp'))
    expect(failure.message).toMatch(/could not route the request/)
  })
})

describe('draftFollowUp empty and refused responses', () => {
  it('rejects when the function returns no data and no error', async () => {
    supabaseMocks.invoke.mockResolvedValue({ data: null, error: null })

    await expect(draftFollowUp('lead-1', 'whatsapp')).rejects.toThrow(/empty response/i)
  })

  it('rejects when the body carries an error field on a 200', async () => {
    supabaseMocks.invoke.mockResolvedValue({
      data: { error: 'The generated draft crossed the research-use-only boundary and was discarded.', blocked: true },
      error: null,
    })

    await expect(draftFollowUp('lead-1', 'whatsapp')).rejects.toThrow(/research-use-only boundary/)
  })

  it('rejects when the draft text is empty', async () => {
    supabaseMocks.invoke.mockResolvedValue({ data: { draft: '', locale: 'en', channel: 'email' }, error: null })

    await expect(draftFollowUp('lead-1', 'email')).rejects.toThrow(/no message text/i)
  })
})
