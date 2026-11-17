import { useQuery } from "@tanstack/vue-query";
import { webEnv } from "@/env";
import { fetchHealth } from "@/lib/api";

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health", webEnv.apiUrl] as const,
    queryFn: () => fetchHealth(webEnv.apiUrl),
  });
}
