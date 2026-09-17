export class SupabaseRestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "SupabaseRestError";
  }
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  );
}

export async function selectFromSupabase<T>(
  table: "categories" | "products",
  query: Record<string, string>
): Promise<T[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!baseUrl || !apiKey) {
    throw new SupabaseRestError("Supabase configuration is missing.", 0);
  }

  const endpoint = new URL(`/rest/v1/${table}`, baseUrl);
  for (const [key, value] of Object.entries(query)) {
    endpoint.searchParams.set(key, value);
  }

  const response = await fetch(endpoint, {
    headers: { apikey: apiKey },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new SupabaseRestError("Supabase request failed.", response.status);
  }

  return (await response.json()) as T[];
}
