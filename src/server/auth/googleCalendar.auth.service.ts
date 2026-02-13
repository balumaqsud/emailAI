type GoogleCalendarTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getGoogleCalendarClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID ?? getRequiredEnv("GOOGLE_API_KEY")
  );
}

export function getGoogleCalendarClientSecret(): string {
  return getRequiredEnv("GOOGLE_CLIENT_SECRET");
}

export function getGoogleCalendarRedirectUri(): string {
  return getRequiredEnv("GOOGLE_CALENDAR_REDIRECT_URI");
}

const CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar.events openid email profile";

export function buildGoogleCalendarAuthUrl(state?: string): string {
  const clientId = getGoogleCalendarClientId();
  const redirectUri = getGoogleCalendarRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: CALENDAR_SCOPE,
    access_type: "offline",
    prompt: "consent",
  });

  if (state) {
    params.set("state", state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForGoogleCalendarTokens(
  code: string,
): Promise<GoogleCalendarTokens> {
  const clientId = getGoogleCalendarClientId();
  const clientSecret = getGoogleCalendarClientSecret();
  const redirectUri = getGoogleCalendarRedirectUri();

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
    throw new Error(
      `Failed to exchange Google Calendar code for tokens: ${text}`,
    );
  }

  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!data.access_token || !data.refresh_token || !data.expires_in) {
    throw new Error("Google Calendar token response missing required fields.");
  }

  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
  };
}

export async function refreshGoogleCalendarAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const clientId = getGoogleCalendarClientId();
  const clientSecret = getGoogleCalendarClientSecret();

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
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
    throw new Error(
      `Failed to refresh Google Calendar access token: ${text}`,
    );
  }

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token || !data.expires_in) {
    throw new Error(
      "Google Calendar refresh response missing required fields.",
    );
  }

  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  return {
    accessToken: data.access_token,
    expiresAt,
  };
}
