"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, isTokenExpired, clearToken } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    function check() {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        clearToken();
        router.push("/login");
      }
    }

    check();

    // Re-check whenever the tab becomes visible again (handles long idle sessions)
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, [router]);

  return <>{children}</>;
}
