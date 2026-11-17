export type WebEnv = {
  apiUrl: string;
  supabaseAnonKey: string | undefined;
  supabaseUrl: string | undefined;
};

function present(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  return trimmed;
}

export function readWebEnv(source: ImportMetaEnv): WebEnv {
  return {
    apiUrl: present(source.VITE_API_URL) ?? "http://127.0.0.1:3001",
    supabaseAnonKey: present(source.VITE_SUPABASE_ANON_KEY),
    supabaseUrl: present(source.VITE_SUPABASE_URL),
  };
}

export const webEnv = readWebEnv(import.meta.env);
