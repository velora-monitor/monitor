export type AppConfig = {
  port: number;
  databaseUrl: string | undefined;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  trustProxy: boolean;
  sentryDsn: string | undefined;
};

export function readConfig(env: NodeJS.ProcessEnv): AppConfig {
  return {
    port: readPort(env.PORT),
    databaseUrl: present(env.DATABASE_URL),
    supabaseUrl: present(env.SUPABASE_URL),
    supabaseAnonKey: present(env.SUPABASE_ANON_KEY),
    trustProxy: env.TRUST_PROXY === "true",
    sentryDsn: present(env.SENTRY_DSN),
  };
}

function present(value: string | undefined): string | undefined {
  if (value === undefined || value.length === 0) {
    return undefined;
  }
  return value;
}

function readPort(value: string | undefined): number {
  if (value === undefined || value.length === 0) {
    return 3001;
  }
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("PORT must be an integer from 0 through 65535");
  }
  return port;
}
