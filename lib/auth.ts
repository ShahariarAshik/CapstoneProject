import type { JwtPayload } from "@/lib/types";

// JWT decode — no external library needed; asserts shape via JwtPayload
export function decodeToken(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)auth-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string, expiresIn: number = 86400): void {
  const expires = new Date(Date.now() + expiresIn * 1000);
  document.cookie = `auth-token=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

export function clearToken(): void {
  document.cookie =
    "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}
