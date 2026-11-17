import type { Context } from "hono";
import { getConnInfo } from "@hono/node-server/conninfo";

export function clientIp(c: Context, trustProxy: boolean): string {
  if (trustProxy) {
    const forwarded = c.req.header("x-forwarded-for");
    const first = forwarded?.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  try {
    const address = getConnInfo(c).remote.address;
    if (address) {
      return address;
    }
  } catch {
    return "unknown";
  }

  return "unknown";
}
