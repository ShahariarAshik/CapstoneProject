"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Trophy,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import type { DashboardStatsResponse, BadgeColor } from "@/lib/types";

interface DashboardCard {
  key: keyof DashboardStatsResponse;
  title: string;
  icon: LucideIcon;
  color: BadgeColor;
  href: string;
}

const CARDS: DashboardCard[] = [
  {
    key: "total_reports",
    title: "Reports Generated",
    icon: FileText,
    color: "indigo",
    href: "/reports",
  },
  {
    key: "total_matches",
    title: "Matches Played",
    icon: Calendar,
    color: "violet",
    href: "/matches",
  },
  {
    key: "total_leagues",
    title: "Leagues",
    icon: Trophy,
    color: "blue",
    href: "/leagues",
  },
  {
    key: "total_jobs",
    title: "Jobs",
    icon: Briefcase,
    color: "purple",
    href: "/jobs",
  },
];

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/stats/get-stats`)
      .then((r) => r.json())
      .then((data: DashboardStatsResponse) => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-1)" }}
        >
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>
          Welcome back — here&apos;s an overview of your platform activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {CARDS.map(({ key, title, icon: Icon, color, href }) => (
          <Link
            key={title}
            href={href}
            className="relative group rounded-2xl p-6 border transition-all duration-200 cursor-pointer"
            style={{
              background: "var(--bg-card)",
              borderColor: `var(--badge-${color}-border)`,
            }}
          >
            <div className="mb-5">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `var(--badge-${color}-bg)` }}
              >
                <Icon
                  size={18}
                  style={{ color: `var(--badge-${color}-text)` }}
                />
              </span>
            </div>

            <p
              className="text-4xl font-bold tracking-tight mb-1"
              style={{ color: "var(--text-1)" }}
            >
              {stats ? (
                stats[key]
              ) : (
                <span
                  className="inline-block w-10 h-8 rounded animate-pulse align-middle"
                  style={{ background: "var(--bg-input)" }}
                />
              )}
            </p>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              {title}
            </p>

            <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ArrowRight
                size={14}
                style={{ color: `var(--badge-${color}-text)` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
