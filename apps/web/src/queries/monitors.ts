import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { webEnv } from "@/env";
import { fetchMonitors } from "@/lib/api";
import { useSessionStore } from "@/stores/session";

export function useMonitorsQuery() {
  const session = useSessionStore();

  return useQuery({
    queryKey: computed(() => ["monitors", session.accessToken] as const),
    enabled: computed(() => session.accessToken !== null),
    queryFn: () => {
      const token = session.accessToken;
      if (token === null) {
        throw new Error("Missing session");
      }
      return fetchMonitors(webEnv.apiUrl, token);
    },
  });
}
