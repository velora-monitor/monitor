import type { WebEnv } from "@/env";
import { createSupabaseGateway } from "@/lib/supabase";
import { useSessionStore } from "@/stores/session";

export function connectSession(env: WebEnv): void {
  const session = useSessionStore();
  if (env.supabaseUrl !== undefined && env.supabaseAnonKey !== undefined) {
    session.setGateway(createSupabaseGateway(env.supabaseUrl, env.supabaseAnonKey));
    return;
  }
  session.setGateway(null);
}
