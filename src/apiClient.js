// Base path for all API requests — assumes the backend is served under /api
const API_BASE = '/api'

// Core request helper used by all HTTP methods below.
// Sends a fetch request with JSON headers, throws an error on non-2xx responses,
// and parses the response body as JSON on success.
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options, // allows overriding method/body/headers per call
  })

  if (!res.ok) {
    // Try to read the error response body for more detail; fall back to empty string if that fails
    const text = await res.text().catch(() => '')
    throw new Error(`API error (${res.status}): ${text}`)
  }

  return res.json()
}

// Simple wrapper exposing REST-style methods, so callers can do
// api.get('/users'), api.post('/users', data), etc. without repeating fetch boilerplate
export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }), // "del" avoids clashing with the reserved word "delete"
}