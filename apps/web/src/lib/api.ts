// Empty string means "same origin, relative /api/* paths" — correct behind
// the nginx compose base. docker-compose.local.yml bakes in an absolute
// http://localhost:8000 at build time (NEXT_PUBLIC_* vars are inlined by
// `next build`, not read at container runtime) since the browser hits the
// API's published port directly there, not through a shared-origin proxy.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const detail = await res
      .json()
      .then((data) => data.detail)
      .catch(() => null);
    throw new ApiError(
      res.status,
      typeof detail === "string" ? detail : `Request failed (${res.status})`
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
