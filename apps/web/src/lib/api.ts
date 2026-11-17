import type { Health, Incident, Monitor } from "@velora/contracts";
import type { AppType } from "@velora/api";
import { healthSchema, incidentSchema, monitorSchema } from "@velora/contracts";
import { hc } from "hono/client";

export function createApiClient(baseUrl: string, accessToken?: string) {
  if (accessToken !== undefined) {
    return hc<AppType>(baseUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return hc<AppType>(baseUrl);
}

export async function fetchHealth(baseUrl: string): Promise<Health> {
  const response = await createApiClient(baseUrl).health.$get();
  if (!response.ok) {
    throw new Error(`Health request failed with status ${String(response.status)}`);
  }
  return healthSchema.parse(await response.json());
}

export async function fetchMonitors(baseUrl: string, accessToken: string): Promise<Monitor[]> {
  const response = await createApiClient(baseUrl, accessToken).v1.monitors.$get();
  if (!response.ok) {
    throw new Error(`Monitor request failed with status ${String(response.status)}`);
  }
  return monitorSchema.array().parse(await response.json());
}

export async function fetchIncidents(baseUrl: string, accessToken: string): Promise<Incident[]> {
  const response = await createApiClient(baseUrl, accessToken).v1.incidents.$get({
    query: {},
  });
  if (!response.ok) {
    throw new Error(`Incident request failed with status ${String(response.status)}`);
  }
  return incidentSchema.array().parse(await response.json());
}
