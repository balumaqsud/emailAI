import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AuthUser } from "./types";
import * as authApi from "./api";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./storage";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (params: { user: AuthUser; accessToken: string }) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial load: check for token and validate via /me
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const storedToken = getAccessToken();
      if (!storedToken) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const meUser = await authApi.me(storedToken);
        if (!isMounted) return;

        setUser(meUser);
        setTokenState(storedToken);
      } catch {
        if (!isMounted) return;
        clearAccessToken();
        setUser(null);
        setTokenState(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(
    (params: { user: AuthUser; accessToken: string }) => {
      setUser(params.user);
      setTokenState(params.accessToken);
      setAccessToken(params.accessToken);
    },
    [],
  );

  const signOut = useCallback(() => {
    setUser(null);
    setTokenState(null);
    clearAccessToken();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      signIn,
      signOut,
    }),
    [user, accessToken, loading, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

