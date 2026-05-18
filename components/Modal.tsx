"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  position?: "center" | "bottom-right";
}

export default function Modal({
  title,
  onClose,
  children,
  footer,
  className,
  contentClassName,
  position = "center",
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const positionClasses =
    position === "bottom-right"
      ? "items-end justify-end"
      : "items-center justify-center";

  const wrapperClasses = className
    ? `w-full rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${className}`
    : "w-full max-w-md rounded-2xl border shadow-2xl flex flex-col overflow-hidden";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${positionClasses} p-4`}
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={wrapperClasses}
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--text-1)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "transparent")
            }
          >
            <X size={14} />
          </button>
        </div>
        <div
          className={`px-5 py-1 overflow-auto ${contentClassName ?? ""}`}
          style={{ flex: 1 }}
        >
          {children}
        </div>
        {footer && (
          <div
            className="px-5 py-4 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
