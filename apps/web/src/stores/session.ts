import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import type { AuthGateway, AuthSession, SessionUser } from "@/lib/auth-gateway";

export type SignInResult = "rejected" | "signed-in" | "unconfigured";

export const useSessionStore = defineStore("session", () => {
  const gateway = shallowRef<AuthGateway | null>(null);
  const user = ref<SessionUser | null>(null);
  const accessToken = ref<string | null>(null);

  const configured = computed(() => gateway.value !== null);
  const authenticated = computed(() => user.value !== null);

  function applySession(session: AuthSession | null): void {
    user.value = session?.user ?? null;
    accessToken.value = session?.accessToken ?? null;
  }

  function setGateway(next: AuthGateway | null): void {
    gateway.value = next;
    if (!next) {
      applySession(null);
    }
  }

  async function refresh(): Promise<void> {
    const current = gateway.value;
    if (!current) {
      applySession(null);
      return;
    }

    try {
      applySession(await current.currentSession());
    } catch {
      applySession(null);
    }
  }

  async function signIn(email: string, password: string): Promise<SignInResult> {
    const current = gateway.value;
    if (!current) {
      return "unconfigured";
    }

    try {
      applySession(await current.signIn(email, password));
      return "signed-in";
    } catch {
      return "rejected";
    }
  }

  async function signOut(): Promise<void> {
    const current = gateway.value;
    try {
      if (current) {
        await current.signOut();
      }
    } finally {
      applySession(null);
    }
  }

  return {
    accessToken,
    authenticated,
    configured,
    refresh,
    setGateway,
    signIn,
    signOut,
    user,
  };
});
