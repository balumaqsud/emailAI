type GmailTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export type GmailProfile = {
  emailAddress: string;
  historyId?: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getGmailClientId(): string {
  return getRequiredEnv("GMAIL_CLIENT_ID");
}

export function getGmailClientSecret(): string {
  return getRequiredEnv("GMAIL_CLIENT_SECRET");
}

export function getGmailRedirectUri(): string {
  return getRequiredEnv("GMAIL_REDIRECT_URI");
}

export function buildGmailAuthUrl(state?: string): string {
  const clientId = getGmailClientId();
  const redirectUri = getGmailRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "openid",
      "email",
      "profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  if (state) {
    params.set("state", state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForGmailTokens(
  code: string,
): Promise<GmailTokens> {
  const clientId = getGmailClientId();
  const clientSecret = getGmailClientSecret();
  const redirectUri = getGmailRedirectUri();

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
    throw new Error(`Failed to exchange Gmail code for tokens: ${text}`);
  }

  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!data.access_token || !data.refresh_token || !data.expires_in) {
    throw new Error("Gmail token response missing required fields.");
  }

  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
  };
}

export async function refreshGmailAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: Date }> {
  const clientId = getGmailClientId();
  const clientSecret = getGmailClientSecret();

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
    throw new Error(`Failed to refresh Gmail access token: ${text}`);
  }

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token || !data.expires_in) {
    throw new Error("Gmail refresh response missing required fields.");
  }

  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  return {
    accessToken: data.access_token,
    expiresAt,
  };
}

export async function getGmailProfile(
  accessToken: string,
): Promise<GmailProfile> {
  const res = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/profile",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch Gmail profile: ${text}`);
  }

  const data = (await res.json()) as {
    emailAddress?: string;
    historyId?: string;
  };

  if (!data.emailAddress) {
    throw new Error("Gmail profile missing emailAddress.");
  }

  return {
    emailAddress: data.emailAddress,
    historyId: data.historyId,
  };
}

