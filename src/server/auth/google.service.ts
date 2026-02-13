import jwt from "jsonwebtoken";

type GoogleIdTokenPayload = {
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
};

export type GoogleProfile = {
  id: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getGoogleClientId(): string {
  // Prefer dedicated client ID but fall back to existing GOOGLE_API_KEY for compatibility.
  return process.env.GOOGLE_CLIENT_ID ?? getRequiredEnv("GOOGLE_API_KEY");
}

export function getGoogleClientSecret(): string {
  return getRequiredEnv("GOOGLE_CLIENT_SECRET");
}

export function getGoogleRedirectUri(): string {
  return getRequiredEnv("GOOGLE_REDIRECT_URI");
}

export function buildGoogleAuthUrl(state?: string): string {
  const clientId = getGoogleClientId();
  const redirectUri = getGoogleRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  if (state) {
    params.set("state", state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
): Promise<{ idToken: string }> {
  const clientId = getGoogleClientId();
  const clientSecret = getGoogleClientSecret();
  const redirectUri = getGoogleRedirectUri();

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to exchange code for tokens: ${text}`);
  }

  const data = (await res.json()) as {
    id_token?: string;
  };

  if (!data.id_token) {
    throw new Error("Google response did not include an id_token.");
  }

  return { idToken: data.id_token };
}

export async function getGoogleProfileFromCode(
  code: string,
): Promise<GoogleProfile> {
  const { idToken } = await exchangeCodeForTokens(code);

  const decoded = jwt.decode(idToken) as GoogleIdTokenPayload | null;
  if (!decoded || !decoded.sub) {
    throw new Error("Invalid Google ID token.");
  }

  return {
    id: decoded.sub,
    email: decoded.email,
    emailVerified:
      decoded.email_verified === true || decoded.email_verified === "true",
    name: decoded.name,
    picture: decoded.picture,
  };
}

