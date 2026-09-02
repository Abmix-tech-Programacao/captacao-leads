import { ReplitConnectors } from "@replit/connectors-sdk";

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

export async function supabaseRequest<T>(
  path: string,
  options: SupabaseRequestOptions = {},
): Promise<T> {
  const connectors = new ReplitConnectors();
  const response = await connectors.proxy("supabase", `/rest/v1/${path}`, {
    method: options.method,
    body: options.body,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
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