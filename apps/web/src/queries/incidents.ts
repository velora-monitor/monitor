import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { webEnv } from "@/env";
import { fetchIncidents } from "@/lib/api";
import { useSessionStore } from "@/stores/session";

export function useIncidentsQuery() {
  const session = useSessionStore();

  return useQuery({
    queryKey: computed(() => ["incidents", session.accessToken] as const),
    enabled: computed(() => session.accessToken !== null),
    queryFn: () => {
      const token = session.accessToken;
      if (token === null) {
        throw new Error("Missing session");
      }
      return fetchIncidents(webEnv.apiUrl, token);
    },
  });
}
