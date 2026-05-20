"use client";

import { useRef, useEffect, useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";

interface SearchBarProps {
  columns: string[];
  onSearch: (query: string, column: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  columns,
  onSearch,
  placeholder,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedCol, setSelectedCol] = useState(columns[0]);
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleQuery = (q: string) => {
    setQuery(q);
    onSearch(q, selectedCol);
  };
  const handleCol = (c: string) => {
    setSelectedCol(c);
    setOpen(false);
    onSearch(query, c);
  };
  const clear = () => {
    setQuery("");
    onSearch("", selectedCol);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Column dropdown */}
      <div className="relative shrink-0" ref={dropRef}>
        <button
          onClick={() => setOpen(!open)}
          aria-label={`Search by ${selectedCol}`}
          aria-expanded={open}
          className="h-9 flex items-center gap-1.5 px-3 rounded-xl text-xs font-medium whitespace-nowrap border border-line transition-colors bg-input text-t1 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
        >
          {selectedCol}
          <ChevronDown
            size={11}
            className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1.5 z-30 min-w-[160px] rounded-xl overflow-hidden shadow-xl border border-line bg-surface">
            {columns.map((col) => (
              <button
                key={col}
                onClick={() => handleCol(col)}
                className={`block w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                  selectedCol === col
                    ? "bg-indigo-subtle text-indigo-on"
                    : "text-t2 hover:bg-hover"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search input */}
      <div className="relative flex-1 min-w-0">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-t3"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder={placeholder ?? `Search by ${selectedCol}…`}
          className="w-full h-9 pl-9 pr-8 text-sm rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition placeholder:text-t3 bg-input text-t1"
        />
        {query && (
          <button
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors text-t3 hover:text-t1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 rounded"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
