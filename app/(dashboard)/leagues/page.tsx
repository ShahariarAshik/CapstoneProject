"use client";

import { useState, useEffect, useMemo } from "react";
import { Info } from "lucide-react";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import ApiValidationError from "@/components/ApiValidationError";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { validateItems } from "@/lib/validate";
import type { ValidationReport } from "@/lib/validate";
import type { League, LeagueItem, GetLeaguesResponse, BadgeColor } from "@/lib/types";

const REQUIRED_FIELDS: (keyof LeagueItem)[] = [
  "id", "league_name", "season", "matches", "status",
];

const COLS = ["League Name", "League ID", "Season", "Status"];
const PER_PAGE = 10;

export default function LeaguesPage() {
  const [leagues, setLeagues]               = useState<League[]>([]);
  const [page, setPage]                     = useState(1);
  const [loading, setLoading]               = useState(true);
  const [query, setQuery]                   = useState("");
  const [column, setColumn]                 = useState(COLS[0]);
  const [selected, setSelected]             = useState<League | null>(null);
  const [validationError, setValidationError] = useState<ValidationReport | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/leagues/get-leagues`)
      .then((r) => r.json())
      .then((data: GetLeaguesResponse) => {
        const report = validateItems(data.leagues, REQUIRED_FIELDS, "/api/leagues/get-leagues");
        if (!report.valid) { setValidationError(report); return; }
        if (report.empty)  { setValidationError(report); }

        setLeagues(
          data.leagues.map((item: LeagueItem, i: number) => ({
            id:       i + 1,
            name:     item.league_name,
            leagueId: item.id,
            season:   item.season,
            matches:  item.matches,
            status:   item.status === "completed" ? "Completed" : "Ongoing",
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return leagues;
    const q = query.toLowerCase();
    return leagues.filter((l) => {
      switch (column) {
        case "League Name": return l.name.toLowerCase().includes(q);
        case "League ID":   return l.leagueId.toLowerCase().includes(q);
        case "Season":      return String(l.season).toLowerCase().includes(q);
        case "Status":      return l.status.toLowerCase().includes(q);
        default:            return true;
      }
    });
  }, [query, column, leagues]);

  const totalPages   = Math.ceil(filtered.length / PER_PAGE);
  const rows         = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const handleSearch = (q: string, col: string) => { setQuery(q); setColumn(col); setPage(1); };

  const statusColor = (s: League["status"]): BadgeColor =>
    s === "Completed" ? "emerald" : s === "Ongoing" ? "amber" : "gray";

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-1)" }}>Leagues</h1>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>Browse and manage all active leagues.</p>
      </div>

      <div className="mb-4"><SearchBar columns={COLS} onSearch={handleSearch} /></div>

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-3.5 border-b" style={{ background: "var(--bg-thead)", borderColor: "var(--border)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
            {loading ? "Loading…" : `${filtered.length} leagues`}
          </span>
        </div>

        <div className="overflow-x-auto" style={{ background: "var(--bg-card)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                {["#", "League Name", "League ID", "Season", "Matches", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--divider)" }}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 rounded animate-pulse w-20" style={{ background: "var(--bg-input)" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.length === 0
                ? <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-3)" }}>No leagues match your search.</td></tr>
                : rows.map((league) => (
                    <tr
                      key={league.id}
                      className="transition-colors border-t"
                      style={{ borderColor: "var(--divider)" }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td className="px-5 py-4 text-xs font-mono" style={{ color: "var(--text-3)" }}>{league.id}</td>
                      <td className="px-5 py-4 font-medium" style={{ color: "var(--text-1)" }}>{league.name}</td>
                      <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--text-2)" }}>{league.leagueId}</td>
                      <td className="px-5 py-4" style={{ color: "var(--text-2)" }}>{league.season}</td>
                      <td className="px-5 py-4" style={{ color: "var(--text-2)" }}>{league.matches}</td>
                      <td className="px-5 py-4"><Badge color={statusColor(league.status)} dot>{league.status}</Badge></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(league)}
                            className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border"
                          >
                            <Info size={12} /> Details
                          </button>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition whitespace-nowrap">
                            Generate Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={PER_PAGE} onPageChange={setPage} />

      {validationError && (
        <ApiValidationError report={validationError} onClose={() => setValidationError(null)} />
      )}

      {selected && (
        <Modal title="League Details" onClose={() => setSelected(null)}>
          {(
            [
              ["League Name", selected.name],
              ["League ID",   selected.leagueId],
              ["Season",      String(selected.season)],
              ["Matches",     String(selected.matches)],
              ["Status",      selected.status],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start py-2.5 border-b last:border-0" style={{ borderColor: "var(--divider)" }}>
              <span className="w-28 shrink-0 text-xs font-medium" style={{ color: "var(--text-3)" }}>{label}</span>
              <span className="text-xs" style={{ color: "var(--text-1)" }}>{value}</span>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
