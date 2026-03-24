/**
 * Nequi token management
 *
 * Strategy (in priority order):
 * 1. NEQUI_CLIENT_ID + NEQUI_CLIENT_SECRET → OAuth2 auto-refresh (recommended for production)
 * 2. NEQUI_ACCESS_TOKEN → static token (you manage rotation every ~1h)
 *
 * In-memory cache works for warm Vercel invocations; on cold start it re-fetches.
 * TTL margin: token is renewed 5 minutes before it expires.
 */

const NEQUI_API_URL = process.env.NEQUI_API_URL || 'https://api.nequi.com.co'

// ─── In-process token cache ──────────────────────────────────────
let _cached: { token: string; expiresAt: number } | null = null

async function fetchOAuthToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(`${NEQUI_API_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Nequi OAuth2 failed ${res.status}: ${body}`)
  }

  const data = await res.json()
  const expiresIn: number = data.expires_in ?? 3600
  const token: string = data.access_token

  // Cache with 5-minute safety margin
  _cached = { token, expiresAt: Date.now() + (expiresIn - 300) * 1000 }

  return token
}

/**
 * Returns a valid Nequi Bearer token.
 * Throws if no credentials are configured.
 */
export async function getNequiToken(): Promise<string> {
  const clientId = process.env.NEQUI_CLIENT_ID
  const clientSecret = process.env.NEQUI_CLIENT_SECRET
  const staticToken = process.env.NEQUI_ACCESS_TOKEN

  // Priority 1: OAuth2 with auto-refresh
  if (clientId && clientSecret) {
    if (_cached && Date.now() < _cached.expiresAt) {
      return _cached.token
    }
    return fetchOAuthToken(clientId, clientSecret)
  }

  // Priority 2: static token (manual rotation every ~1h)
  if (staticToken) {
    return staticToken
  }

  throw new Error('No Nequi credentials configured. Set NEQUI_CLIENT_ID+NEQUI_CLIENT_SECRET or NEQUI_ACCESS_TOKEN.')
}

/**
 * Returns true if any Nequi credential is configured.
 */
export function hasNequiCredentials(): boolean {
  return !!(
    (process.env.NEQUI_CLIENT_ID && process.env.NEQUI_CLIENT_SECRET) ||
    process.env.NEQUI_ACCESS_TOKEN
  )
}

export { NEQUI_API_URL }
