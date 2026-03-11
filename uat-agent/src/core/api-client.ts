import type { ApiClient, ApiResponse } from './types.js';

export function createApiClient(baseUrl: string): ApiClient {
  let authToken: string | null = null;

  function buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extra,
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  async function request(
    method: string,
    path: string,
    body?: any,
    options?: { headers?: Record<string, string> }
  ): Promise<ApiResponse> {
    const url = `${baseUrl}${path}`;
    const fetchOptions: RequestInit = {
      method,
      headers: buildHeaders(options?.headers),
    };
    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    let data: any;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: response.status,
      ok: response.ok,
      data,
      headers,
    };
  }

  return {
    get: (path, options) => request('GET', path, undefined, options),
    post: (path, body, options) => request('POST', path, body, options),
    put: (path, body, options) => request('PUT', path, body, options),
    patch: (path, body, options) => request('PATCH', path, body, options),
    delete: (path, options) => request('DELETE', path, undefined, options),
    setToken: (token: string) => {
      authToken = token;
    },
  };
}
