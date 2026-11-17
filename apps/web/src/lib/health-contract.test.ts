import { healthSchema } from "@velora/contracts";
import { describe, expect, it } from "vitest";

describe("healthSchema", () => {
  it("parses an unconfigured health payload", () => {
    expect(healthSchema.parse({ status: "ok", database: "unconfigured" })).toEqual({
      status: "ok",
      database: "unconfigured",
    });
  });
});
