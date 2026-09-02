export class SupabaseRequestError extends Error {
  constructor(
    message: string,
    public readonly providerStatus: number,
    public readonly providerBody: unknown,
  ) {
    super(message);
    this.name = "SupabaseRequestError";
  }
}

export function isSupabasePermissionError(
  error: unknown,
): error is SupabaseRequestError {
  if (!(error instanceof SupabaseRequestError)) return false;
  if (error.providerStatus !== 401 && error.providerStatus !== 403) return false;

  return (
    typeof error.providerBody === "object" &&
    error.providerBody !== null &&
    "code" in error.providerBody &&
    (error.providerBody as { code?: unknown }).code === "42501"
  );
}

type SupabaseRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new SupabaseRequestError(
      "Supabase server credentials are not configured",
      503,
      { code: "SUPABASE_NOT_CONFIGURED" },
    );
  }

  return { url, secretKey };
}

export async function supabaseRequest<T>(
  path: string,
  options: SupabaseRequestOptions = {},
): Promise<T> {
  const { url, secretKey } = getSupabaseConfig();
  const normalizedPath = path.replace(/^\//, "");

  const response = await fetch(`${url}/rest/v1/${normalizedPath}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    throw new SupabaseRequestError(
      "Supabase request failed",
      response.status,
      body,
    );
  }

  return body as T;
}
