import { NextApiResponse } from "next";
import cookie from "cookie";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getRefreshCookieName(): string {
  return getRequiredEnv("COOKIE_NAME_REFRESH");
}

function isSecureCookie(): boolean {
  return (process.env.COOKIE_SECURE ?? "false").toLowerCase() === "true";
}

function getCookieDomain(): string | undefined {
  const domain = process.env.COOKIE_DOMAIN;
  return domain && domain.length > 0 ? domain : undefined;
}

export function setRefreshCookie(
  res: NextApiResponse,
  token: string,
  expiresAt: Date,
): void {
  const name = getRefreshCookieName();
  const maxAgeSeconds = Math.max(
    0,
    Math.floor((expiresAt.getTime() - Date.now()) / 1000),
  );

  const serialized = cookie.serialize(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: maxAgeSeconds,
    domain: getCookieDomain(),
  });

  res.setHeader("Set-Cookie", serialized);
}

export function clearRefreshCookie(res: NextApiResponse): void {
  const name = getRefreshCookieName();
  const serialized = cookie.serialize(name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 0,
    domain: getCookieDomain(),
  });

  res.setHeader("Set-Cookie", serialized);
}

