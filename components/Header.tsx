"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun, Moon, ChevronDown, LogOut, User } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { clearToken, getToken, decodeToken } from "@/lib/auth";

export default function Header() {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userName] = useState(() => {
    try {
      const token = getToken();
      if (token) {
        const payload = decodeToken(token);
        return payload?.full_name || "";
      }
    } catch {
      // Silently fail during SSR
    }
    return "";
  });
  const [userEmail] = useState(() => {
    try {
      const token = getToken();
      if (token) {
        const payload = decodeToken(token);
        return payload?.email || "Email not available";
      }
    } catch {
      // Silently fail during SSR
    }
    return "Email not available";
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <header
      className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 shrink-0 border-b"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <Link href="/" className="text-xl font-bold tracking-tight select-none">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
          Dri
        </span>
        <span style={{ color: "var(--text-1)" }}>bl</span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            color: "var(--text-2)",
          }}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-colors"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
            }}
          >
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </span>
            <span
              className="text-xs font-medium hidden sm:block"
              style={{ color: "var(--text-2)" }}
              suppressHydrationWarning
            >
              {userName}
            </span>
            <ChevronDown
              size={11}
              style={{
                color: "var(--text-3)",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
              }}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden shadow-lg border z-50"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--divider)" }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--text-1)" }}
                >
                  {userName}
                </p>
                <p
                  className="text-xs truncate mt-0.5"
                  style={{ color: "var(--text-3)" }}
                >
                  {userEmail}
                </p>
              </div>

              <div className="p-1">
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left"
                  style={{ color: "var(--text-2)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "transparent")
                  }
                >
                  <User size={13} style={{ color: "var(--text-3)" }} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left"
                  style={{ color: "var(--badge-red-text)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "var(--badge-red-bg)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "transparent")
                  }
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
