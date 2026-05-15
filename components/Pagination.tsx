"use client";

import { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

function getPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4)         return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function Pagination({
  currentPage, totalPages, onPageChange, totalItems, itemsPerPage,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");

  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages);
  const from  = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const to    = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

  const go = (p: number) => {
    onPageChange(p);
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJump = () => {
    const p = parseInt(jumpValue, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      go(p);
      setJumpValue("");
    }
  };

  const btnBase: React.CSSProperties = {
    background:  "var(--bg-input)",
    borderColor: "var(--border)",
    color:       "var(--text-2)",
    border:      "1px solid var(--border)",
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-2">

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={btnBase}
        >
          ← Prev
        </button>

        {/* Page numbers */}
        {pages.map((page, i) =>
          page === "…" ? (
            <span key={`el-${i}`} className="w-8 h-8 flex items-center justify-center text-sm select-none" style={{ color: "var(--text-3)" }}>
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => go(page as number)}
              className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              style={
                currentPage === page
                  ? { background: "#4f46e5", color: "#ffffff", border: "1px solid transparent" }
                  : btnBase
              }
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={btnBase}
        >
          Next →
        </button>

        {/* Divider */}
        <span className="mx-1 h-4 w-px" style={{ background: "var(--border)" }} />

        {/* Jump to page */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--text-3)" }}>Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            placeholder="…"
            className="w-14 h-8 px-2 rounded-lg text-xs text-center border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={btnBase}
          />
          <button
            onClick={handleJump}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "#4f46e5", color: "#fff", border: "1px solid transparent" }}
          >
            Go
          </button>
        </div>
      </div>

      {/* Count below */}
      {from && to && totalItems && (
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          Showing {from}–{to} of {totalItems}
        </p>
      )}

    </div>
  );
}
