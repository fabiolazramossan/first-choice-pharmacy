export class SupabaseRestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "SupabaseRestError";
  }
}

const DEFAULT_SUPABASE_URL = "https://vhwpotmsdmaqizkvgowl.supabase.co";
// Publishable keys are safe for public clients; Row Level Security remains the
// authorization boundary. The environment variable takes priority for rotation.
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ADL4siUI9pYrQvRl5cJ-0A_Fesfjez1";

function cleanEnvironmentValue(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getSupabaseConfig() {
  const configuredUrl = cleanEnvironmentValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const configuredKey = cleanEnvironmentValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  return {
    url: configuredUrl || DEFAULT_SUPABASE_URL,
    keys: [...new Set([configuredKey, DEFAULT_SUPABASE_PUBLISHABLE_KEY].filter(Boolean))],
  };
}

export function hasSupabaseConfig(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.keys.length);
}

export async function selectFromSupabase<T>(
  table: "categories" | "products",
  query: Record<string, string>
): Promise<T[]> {
  const { url: baseUrl, keys } = getSupabaseConfig();

  if (!baseUrl || !keys.length) {
    throw new SupabaseRestError("Supabase configuration is missing.", 0);
  }

  const endpoint = new URL(`/rest/v1/${table}`, baseUrl);
  for (const [key, value] of Object.entries(query)) {
    endpoint.searchParams.set(key, value);
  }

  for (const [index, apiKey] of keys.entries()) {
    const response = await fetch(endpoint, {
      headers: { apikey: apiKey },
      cache: "no-store",
    });

    if (response.ok) {
      return (await response.json()) as T[];
    }

    const canRetryWithFallback =
      response.status === 401 && index < keys.length - 1;
    if (!canRetryWithFallback) {
      throw new SupabaseRestError("Supabase request failed.", response.status);
    }
  }

  throw new SupabaseRestError("Supabase request failed.", 401);
}
