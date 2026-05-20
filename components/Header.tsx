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
    <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 shrink-0 border-b border-line bg-surface">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold tracking-tight select-none">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
          Dri
        </span>
        <span className="text-t1">bl</span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          suppressHydrationWarning
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-input border border-line text-t2 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            aria-label="User menu"
            aria-expanded={dropdownOpen}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-colors bg-input border border-line hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
          >
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </span>
            <span
              className="text-xs font-medium hidden sm:block text-t2"
              suppressHydrationWarning
            >
              {userName}
            </span>
            <ChevronDown
              size={11}
              className={`text-t3 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden shadow-lg border border-line z-50 bg-surface">
              <div className="px-4 py-3 border-b border-divider">
                <p className="text-xs font-semibold text-t1">{userName}</p>
                <p className="text-xs truncate mt-0.5 text-t3">{userEmail}</p>
              </div>

              <div className="p-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left text-t2 hover:bg-hover">
                  <User size={13} className="text-t3" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left text-red-on hover:bg-red-subtle"
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
