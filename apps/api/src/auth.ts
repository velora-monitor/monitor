import { createClient } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
};

export type AuthClient = {
  auth: {
    getUser: (jwt: string) => Promise<{
      data: { user: AuthUser | null };
      error: { message: string } | null;
    }>;
  };
};

export function createAuthClient(url: string, anonKey: string): AuthClient {
  const supabase = createClient(url, anonKey);
  return {
    auth: {
      async getUser(jwt) {
        const result = await supabase.auth.getUser(jwt);
        const user = result.data.user;
        return {
          data: { user: user ? { id: user.id } : null },
          error: result.error ? { message: result.error.message } : null,
        };
      },
    },
  };
}

export function unconfiguredAuth(): AuthClient {
  return {
    auth: {
      async getUser() {
        return {
          data: { user: null },
          error: { message: "Supabase is not configured" },
        };
      },
    },
  };
}

export function readBearerToken(header: string | undefined): string | undefined {
  if (!header) {
    return undefined;
  }
  const match = /^Bearer (\S+)$/.exec(header);
  return match?.[1];
}
