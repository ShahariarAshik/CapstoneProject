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
import type { Match, FixtureItem, GetFixturesResponse, BadgeColor } from "@/lib/types";

const REQUIRED_FIELDS: (keyof FixtureItem)[] = [
  "home_team_id", "home_team_name",
  "away_team_id", "away_team_name",
  "ground_id",    "ground_name",
  "utc_datetime",
];

const COLS = ["Home Team", "Away Team", "Location", "Status"];
const PER_PAGE = 10;

export default function MatchesPage() {
  const [matches, setMatches]           = useState<Match[]>([]);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [query, setQuery]               = useState("");
  const [column, setColumn]             = useState(COLS[0]);
  const [selected, setSelected]         = useState<Match | null>(null);
  const [validationError, setValidationError] = useState<ValidationReport | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/fixtures/get-fixtures`)
      .then((r) => r.json())
      .then((data: GetFixturesResponse) => {
        const report = validateItems(data.fixtures, REQUIRED_FIELDS, "/api/fixtures/get-fixtures");
        if (!report.valid) { setValidationError(report); return; }
        if (report.empty)  { setValidationError(report); }

        const mapped = data.fixtures
          .map((item: FixtureItem, i: number) => {
            const d = new Date(item.utc_datetime);
            if (isNaN(d.getTime())) return null;
            return {
              id:        i + 1,
              homeTeam:  item.home_team_name,
              awayTeam:  item.away_team_name,
              location:  item.ground_name,
              date:      d.toLocaleDateString(),
              time:      item.duration != null
                ? `${d.toLocaleTimeString()} (${item.duration} mins)`
                : d.toLocaleTimeString(),
              status:    item.event_status === "completed" ? "Completed"
                       : item.event_status === "ongoing"   ? "Ongoing"
                       : item.event_status === "cancelled" ? "Cancelled"
                       : "No Data",
              homeScore: item.home_score ?? null,
              awayScore: item.away_score ?? null,
            } as Match;
          })
          .filter((m): m is Match => m !== null);
        setMatches(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return matches;
    const q = query.toLowerCase();
    return matches.filter((m) => {
      switch (column) {
        case "Home Team": return m.homeTeam.toLowerCase().includes(q);
        case "Away Team": return m.awayTeam.toLowerCase().includes(q);
        case "Location":  return m.location.toLowerCase().includes(q);
        case "Status":    return m.status.toLowerCase().includes(q);
        default:          return true;
      }
    });
  }, [query, column, matches]);

  const totalPages   = Math.ceil(filtered.length / PER_PAGE);
  const rows         = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const handleSearch = (q: string, col: string) => { setQuery(q); setColumn(col); setPage(1); };

  const statusColor = (s: Match["status"]): BadgeColor =>
    s === "Completed" ? "emerald" : s === "Ongoing" ? "amber" : s === "Cancelled" ? "red" : "gray";

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-1)" }}>Matches</h1>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>View all fixtures and generate post-match reports.</p>
      </div>

      <div className="mb-4"><SearchBar columns={COLS} onSearch={handleSearch} /></div>

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-3.5 border-b" style={{ background: "var(--bg-thead)", borderColor: "var(--border)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
            {loading ? "Loading…" : `${filtered.length} fixtures`}
          </span>
        </div>

        <div className="overflow-x-auto" style={{ background: "var(--bg-card)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                {["#", "Home Team", "Away Team", "Location", "Score", "Date & Time", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--divider)" }}>
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 rounded animate-pulse w-20" style={{ background: "var(--bg-input)" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.length === 0
                ? <tr><td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-3)" }}>No matches found.</td></tr>
                : rows.map((match) => (
                    <tr
                      key={match.id}
                      className="transition-colors border-t"
                      style={{ borderColor: "var(--divider)" }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td className="px-5 py-4 text-xs font-mono" style={{ color: "var(--text-3)" }}>{match.id}</td>
                      <td className="px-5 py-4 font-medium whitespace-nowrap" style={{ color: "var(--text-1)" }}>{match.homeTeam}</td>
                      <td className="px-5 py-4 whitespace-nowrap" style={{ color: "var(--text-2)" }}>{match.awayTeam}</td>
                      <td className="px-5 py-4 whitespace-nowrap" style={{ color: "var(--text-2)" }}>{match.location}</td>
                      <td className="px-5 py-4 whitespace-nowrap font-mono font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                        {match.homeScore ?? "–"} : {match.awayScore ?? "–"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-xs font-medium" style={{ color: "var(--text-1)" }}>{match.date}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{match.time}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge color={statusColor(match.status)} dot>{match.status}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(match)}
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
        <Modal title="Match Details" onClose={() => setSelected(null)}>
          {(
            [
              ["Home Team", selected.homeTeam],
              ["Away Team", selected.awayTeam],
              ["Location",  selected.location],
              ["Date",      selected.date],
              ["Time",      selected.time],
              ["Score",     `${selected.homeScore ?? "–"} : ${selected.awayScore ?? "–"}`],
              ["Status",    selected.status],
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
