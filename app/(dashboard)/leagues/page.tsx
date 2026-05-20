"use client";

import { useState, useEffect, useMemo } from "react";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Badge from "@/components/Badge";
import GenerateReportModal from "@/components/GenerateReportModal";
import Toast from "@/components/Toast";
import ApiValidationError from "@/components/ApiValidationError";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { validateItems } from "@/lib/validate";
import type { ValidationReport } from "@/lib/validate";
import type {
  League,
  LeagueItem,
  GetLeaguesResponse,
  BadgeColor,
} from "@/lib/types";

const REQUIRED_FIELDS: (keyof LeagueItem)[] = [
  "id",
  "league_name",
  "season",
  "matches",
  "status",
];

const COLS = ["League Name", "Competition", "Season", "Status"];
const PER_PAGE = 10;

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState(COLS[0]);
  const [generateFor, setGenerateFor] = useState<League | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [validationError, setValidationError] =
    useState<ValidationReport | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/leagues/get-leagues`)
      .then((r) => r.json())
      .then((data: GetLeaguesResponse) => {
        const report = validateItems(
          data.leagues,
          REQUIRED_FIELDS,
          "/api/leagues/get-leagues",
        );
        if (!report.valid) {
          setValidationError(report);
          return;
        }
        if (report.empty) {
          setValidationError(report);
        }

        setLeagues(
          data.leagues.map((item: LeagueItem, i: number) => ({
            id: i + 1,
            name: item.league_name,
            leagueId: item.id,
            competition_name: item.competition_name,
            season: item.season,
            matches: item.matches,
            status: item.status === "completed" ? "Completed" : "Pending",
          })),
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
        case "League Name":
          return l.name.toLowerCase().includes(q);
        case "Competition":
          return l.competition_name.toLowerCase().includes(q);
        case "Season":
          return String(l.season).toLowerCase().includes(q);
        case "Status":
          return l.status.toLowerCase().includes(q);
        default:
          return true;
      }
    });
  }, [query, column, leagues]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const handleSearch = (q: string, col: string) => {
    setQuery(q);
    setColumn(col);
    setPage(1);
  };

  const statusColor = (s: League["status"]): BadgeColor =>
    s === "Completed" ? "emerald" : s === "Pending" ? "amber" : "gray";

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-t1">Leagues</h1>
        <p className="text-sm text-t2">
          Browse leagues and generate league summary.
        </p>
      </div>

      <div className="mb-4">
        <SearchBar columns={COLS} onSearch={handleSearch} />
      </div>

      <div className="rounded-2xl overflow-hidden border border-line">
        <div className="px-5 py-3.5 border-b border-line bg-thead">
          <span className="text-xs font-medium text-t2">
            {loading ? "Loading…" : `${filtered.length} leagues`}
          </span>
        </div>

        <div className="overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-thead">
                {[
                  "#",
                  "League Name",
                  "Competition",
                  "Season",
                  "Matches",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-t3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-divider">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse w-20 bg-input" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-t3"
                  >
                    No leagues match your search.
                  </td>
                </tr>
              ) : (
                rows.map((league) => (
                  <tr
                    key={league.id}
                    className="transition-colors border-t border-divider hover:bg-hover"
                  >
                    <td className="px-5 py-4 text-xs font-mono text-t3">
                      {league.id}
                    </td>
                    <td className="px-5 py-4 font-medium text-t1">
                      {league.name}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-t2">
                      {league.competition_name}
                    </td>
                    <td className="px-5 py-4 text-t2">{league.season}</td>
                    <td className="px-5 py-4 text-t2">{league.matches}</td>
                    <td className="px-5 py-4">
                      <Badge color={statusColor(league.status)} dot>
                        {league.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setGenerateFor(league)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                        >
                          Generate Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        itemsPerPage={PER_PAGE}
        onPageChange={setPage}
      />

      {validationError && (
        <ApiValidationError
          report={validationError}
          onClose={() => setValidationError(null)}
        />
      )}

      {generateFor && (
        <GenerateReportModal
          context="league"
          name={`${generateFor.name} — ${generateFor.season}`}
          onClose={() => setGenerateFor(null)}
          onGenerate={async () => {
            // TODO: wire league report endpoints when available
            setToast({ type: "success", message: "Report Generation Request Created. Please check the Jobs tab to track the progress." });
          }}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
