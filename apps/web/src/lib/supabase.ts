import { createClient, type Session } from "@supabase/supabase-js";
import type { AuthGateway, AuthSession } from "@/lib/auth-gateway";

function toAuthSession(session: Session): AuthSession | null {
  const email = session.user.email;
  if (email === undefined || email.length === 0) {
    return null;
  }

  return {
    accessToken: session.access_token,
    user: {
      id: session.user.id,
      email,
    },
  };
}

export function createSupabaseGateway(url: string, anonKey: string): AuthGateway {
  const client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
    },
  });

  return {
    async currentSession() {
      const { data, error } = await client.auth.getSession();
      if (error) {
        throw new Error(error.message);
      }
      if (!data.session) {
        return null;
      }
      return toAuthSession(data.session);
    },
    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message);
      }
      if (!data.session) {
        throw new Error("Sign-in failed");
      }
      const session = toAuthSession(data.session);
      if (!session) {
        throw new Error("Sign-in failed");
      }
      return session;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
  };
}
