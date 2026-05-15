import { getToken } from "@/lib/auth";
import type { FastApiFieldError } from "@/lib/types";

export function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export function parseApiError(data: unknown, fallback: string): string[] {
  if (!data || typeof data !== "object") return [fallback];
  const d = data as Record<string, unknown>;

  if (Array.isArray(d.detail)) {
    const msgs = (d.detail as FastApiFieldError[]).map((e) => {
      const field = e.loc?.slice(1).join(" → ") ?? "field";
      return `${field}: ${e.msg ?? "invalid"}`;
    });
    return msgs.length ? msgs : [fallback];
  }

  const msg = d.detail ?? d.error ?? d.message;
  if (typeof msg === "string" && msg.trim()) return [msg.trim()];

  return [fallback];
}
