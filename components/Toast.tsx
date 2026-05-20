"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, type = "success", onDismiss, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  const isError = type === "error";

  return (
    <div
      className={`toast-enter fixed top-5 right-5 z-[200] flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl max-w-xs w-full bg-surface ${
        isError ? "border-red-edge" : "border-emerald-edge"
      }`}
    >
      {isError
        ? <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-on" />
        : <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-on" />}
      <p className="flex-1 text-sm leading-snug text-t1">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 mt-0.5 transition-colors text-t3 hover:text-t1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
