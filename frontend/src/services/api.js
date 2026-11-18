// All HTTP lives here - components never call fetch() directly.
// Base URL is relative by default so it works behind nginx (Docker) and the Vite dev proxy.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details; // [{ field, message }]
  }

  /** Map of field name -> message, for inline form errors. */
  get fieldErrors() {
    return Object.fromEntries((this.details || []).filter((d) => d.field).map((d) => [d.field, d.message]));
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection and try again.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) {
    const err = data?.error;
    throw new ApiError(err?.message || `Request failed (${response.status})`, {
      status: response.status,
      code: err?.code,
      details: err?.details,
    });
  }
  return data;
}

export const authApi = {
  register: (payload) => request('/register', { method: 'POST', body: payload }),
  login: (payload) => request('/login', { method: 'POST', body: payload }),
  getUser: (id, token) => request(`/users/${encodeURIComponent(id)}`, { token }),
};

export const aiApi = {
  suggestUsernames: (interests) => request('/suggest-username', { method: 'POST', body: { interests } }),
};
