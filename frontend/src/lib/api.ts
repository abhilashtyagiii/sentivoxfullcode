const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Log warning in development if API URL is not set
if (import.meta.env.DEV && !API_BASE_URL) {
  console.warn('⚠️ VITE_API_URL is not set. API calls will fail. Set it in your .env file or Vercel environment variables.');
}

export function getApiUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  
  if (!API_BASE_URL) {
    console.error('❌ VITE_API_URL is not configured. Please set it in Vercel environment variables.');
    throw new Error('API URL is not configured. Please contact support.');
  }
  
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(
  path: string, 
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(path);
  
  const defaultHeaders: HeadersInit = {};
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });
}

export { API_BASE_URL };
