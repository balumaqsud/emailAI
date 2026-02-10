import { AuthUser } from "./types";

type ApiSuccess<T> = {
  ok: true;
  user: AuthUser;
  accessToken: string;
} & T;

type ApiErrorShape = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type RegisterPayload = {
  nickname: string;
  email?: string;
  password: string;
};

type LoginPayload = {
  identifier: string;
  password: string;
};

async function handleJsonResponse<T>(
  res: Response,
): Promise<ApiSuccess<T>> {
  let data: ApiSuccess<T> | ApiErrorShape;
  try {
    data = (await res.json()) as ApiSuccess<T> | ApiErrorShape;
  } catch {
    throw new Error("Unexpected server response.");
  }

  if (!("ok" in data)) {
    throw new Error("Malformed server response.");
  }

  if (!data.ok) {
    const message = data.error?.message ?? "Request failed.";
    throw new Error(message);
  }

  return data as ApiSuccess<T>;
}

export async function register(
  payload: RegisterPayload,
): Promise<{ user: AuthUser; accessToken: string }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await handleJsonResponse<{}>(res);
  return {
    user: data.user,
    accessToken: data.accessToken,
  };
}

export async function login(
  payload: LoginPayload,
): Promise<{ user: AuthUser; accessToken: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await handleJsonResponse<{}>(res);
  return {
    user: data.user,
    accessToken: data.accessToken,
  };
}

export async function me(token: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    // Try to get error message but fall back gracefully.
    try {
      const data = (await res.json()) as ApiErrorShape | ApiSuccess<{}>;
      if ("ok" in data && !data.ok) {
        throw new Error(data.error?.message ?? "Failed to fetch user.");
      }
    } catch {
      // ignore parse errors, fall through
    }
    throw new Error("Failed to fetch user.");
  }

  const data = (await res.json()) as {
    ok: true;
    user: AuthUser;
  };

  if (!data.ok || !data.user) {
    throw new Error("Malformed server response.");
  }

  return data.user;
}

