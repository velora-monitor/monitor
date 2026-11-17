import { serve } from "@hono/node-server";
import { createRuntime } from "./runtime.js";

const runtime = createRuntime(process.env);

serve({ fetch: runtime.app.fetch, port: runtime.port }, (info) => {
  runtime.logger.info({ port: info.port }, "api listening");
});
