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
    ? `w-full rounded-2xl border border-line shadow-2xl flex flex-col overflow-hidden bg-surface ${className}`
    : "w-full max-w-md rounded-2xl border border-line shadow-2xl flex flex-col overflow-hidden bg-surface";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${positionClasses} p-4 bg-black/55`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={wrapperClasses}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-sm font-semibold text-t1">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-t3 hover:bg-hover"
          >
            <X size={14} />
          </button>
        </div>
        <div
          className={`px-5 py-4 overflow-y-auto ${contentClassName ?? ""}`}
          style={{ flex: 1 }}
        >
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 border-t border-line">{footer}</div>
        )}
      </div>
    </div>
  );
}
