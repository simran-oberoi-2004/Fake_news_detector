export type AuthResponse = {
  error?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
  };
};

const TOKEN_KEY = "trueverse_token";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function authHeaders(
  extraHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
  const token = getToken();

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}