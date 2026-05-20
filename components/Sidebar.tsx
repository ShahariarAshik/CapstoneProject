"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Calendar, Trophy, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const menuItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Matches", href: "/matches", icon: Calendar },
  { name: "Leagues", href: "/leagues", icon: Trophy },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex flex-col shrink-0 h-full border-r border-line bg-surface">
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-t3">
          Navigation
        </p>

        {menuItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={name}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 ${
                isActive
                  ? "bg-indigo-subtle text-indigo-on border border-indigo-edge"
                  : "text-t2 hover:bg-hover"
              }`}
            >
              <Icon
                size={15}
                className={isActive ? "text-indigo-on" : "text-t2"}
              />
              {name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-line">
        <p className="text-[10px] text-t3">
          © {new Date().getFullYear()} Dribl Inc.
        </p>
      </div>
    </aside>
  );
}
