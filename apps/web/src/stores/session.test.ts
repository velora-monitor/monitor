import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import type { AuthGateway } from "@/lib/auth-gateway";
import { useSessionStore } from "@/stores/session";

function fakeGateway(calls: { count: number }): AuthGateway {
  return {
    async currentSession() {
      calls.count += 1;
      return null;
    },
    async signIn() {
      calls.count += 1;
      return {
        accessToken: "token",
        user: {
          id: "user-1",
          email: "ada@example.com",
        },
      };
    },
    async signOut() {
      calls.count += 1;
    },
  };
}

describe("session store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("does not call auth when Supabase is not configured", async () => {
    const calls = { count: 0 };
    const store = useSessionStore();
    store.setGateway(fakeGateway(calls));
    store.setGateway(null);

    await expect(store.signIn("ada@example.com", "password123")).resolves.toBe("unconfigured");
    expect(store.configured).toBe(false);
    expect(store.authenticated).toBe(false);
    expect(calls.count).toBe(0);
  });

  it("stores the session returned by the gateway", async () => {
    const store = useSessionStore();
    store.setGateway(fakeGateway({ count: 0 }));

    await expect(store.signIn("ada@example.com", "password123")).resolves.toBe("signed-in");
    expect(store.user).toEqual({
      id: "user-1",
      email: "ada@example.com",
    });
    expect(store.accessToken).toBe("token");
    expect(store.authenticated).toBe(true);
  });
});
