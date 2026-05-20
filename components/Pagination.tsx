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
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");

  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages);
  const from = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const to =
    itemsPerPage && totalItems
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : undefined;

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

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-input border border-line text-t2 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
        >
          ← Prev
        </button>

        {/* Page numbers */}
        {pages.map((page, i) =>
          page === "…" ? (
            <span
              key={`el-${i}`}
              className="w-8 h-8 flex items-center justify-center text-sm select-none text-t3"
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => go(page as number)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 ${
                currentPage === page
                  ? "bg-indigo-600 text-white border border-transparent"
                  : "bg-input border border-line text-t2 hover:bg-hover"
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-input border border-line text-t2 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
        >
          Next →
        </button>

        {/* Divider */}
        <span className="mx-1 h-4 w-px bg-line" />

        {/* Jump to page */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-t3">Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            placeholder="…"
            className="w-14 h-8 px-2 rounded-lg text-xs text-center border border-line focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none bg-input text-t2"
          />
          <button
            onClick={handleJump}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white border border-transparent hover:bg-indigo-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
          >
            Go
          </button>
        </div>
      </div>

      {/* Count below */}
      {from && to && totalItems && (
        <p className="text-xs text-t3">
          Showing {from}-{to} of {totalItems}
        </p>
      )}
    </div>
  );
}
