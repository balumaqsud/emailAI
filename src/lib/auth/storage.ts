const ACCESS_TOKEN_KEY = "email_app_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}

