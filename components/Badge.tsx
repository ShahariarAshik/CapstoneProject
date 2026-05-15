import type { BadgeColor } from "@/lib/types";

interface BadgeProps {
  color: BadgeColor;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  color,
  dot,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      style={{
        background: `var(--badge-${color}-bg)`,
        color: `var(--badge-${color}-text)`,
        borderColor: `var(--badge-${color}-border)`,
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: `var(--badge-${color}-text)` }}
        />
      )}
      {children}
    </span>
  );
}
