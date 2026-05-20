"use client";

import { useState, useEffect, useMemo } from "react";
import { Info } from "lucide-react";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Badge from "@/components/Badge";
import MatchDetailsModal from "@/components/MatchDetailsModal";
import GenerateReportModal from "@/components/GenerateReportModal";
import Toast from "@/components/Toast";
import ApiValidationError from "@/components/ApiValidationError";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { validateItems } from "@/lib/validate";
import { useNotification } from "@/lib/notification-context";
import type { ValidationReport } from "@/lib/validate";
import type {
  Match,
  FixtureItem,
  GetFixturesResponse,
  BadgeColor,
} from "@/lib/types";

type DetailedMatch = Match & { fixtureId: string | number };

const REQUIRED_FIELDS: (keyof FixtureItem)[] = [
  "home_team_id",
  "home_team_name",
  "away_team_id",
  "away_team_name",
];

const COLS = ["Home Team", "Away Team", "Field", "Status"];
const PER_PAGE = 10;

export default function MatchesPage() {
  const [matches, setMatches] = useState<DetailedMatch[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState(COLS[0]);
  const [selectedFixtureId, setSelectedFixtureId] = useState<
    string | number | null
  >(null);
  const [generateFor, setGenerateFor] = useState<DetailedMatch | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const { startJobPolling } = useNotification();

  const TONE_MAP: Record<string, string> = {
    Professional: "professional",
    Serious: "serious",
    Funny: "funny",
  };
  const [validationError, setValidationError] =
    useState<ValidationReport | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/fixtures/get-fixtures`)
      .then((r) => r.json())
      .then((data: GetFixturesResponse) => {
        const report = validateItems(
          data.fixtures,
          REQUIRED_FIELDS,
          "/api/fixtures/get-fixtures",
        );
        if (!report.valid) {
          setValidationError(report);
          return;
        }
        if (report.empty) {
          setValidationError(report);
        }

        const mapped = data.fixtures
          .map((item: FixtureItem, i: number) => {
            const d = new Date(item.utc_datetime ?? "");
            if (isNaN(d.getTime())) return null;
            const record = item as unknown as Record<string, unknown>;
            return {
              id: i + 1,
              fixtureId: record.fixture_id ?? record.id ?? i + 1,
              homeTeam: item.home_team_name,
              awayTeam: item.away_team_name,
              field: item.ground_name ?? "",
              date: d.toLocaleDateString(),
              time:
                item.duration != null
                  ? `${d.toLocaleTimeString()} (${item.duration} mins)`
                  : d.toLocaleTimeString(),
              status:
                item.event_status === "complete"
                  ? "Completed"
                  : item.event_status === "pending"
                    ? "Pending"
                    : "No Data",
              homeScore: item.home_score ?? null,
              awayScore: item.away_score ?? null,
            } as DetailedMatch;
          })
          .filter((m): m is DetailedMatch => m !== null);
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
        case "Home Team":
          return m.homeTeam.toLowerCase().includes(q);
        case "Away Team":
          return m.awayTeam.toLowerCase().includes(q);
        case "Field":
          return (m.field ?? "").toLowerCase().includes(q);
        case "Status":
          return m.status.toLowerCase().includes(q);
        default:
          return true;
      }
    });
  }, [query, column, matches]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const handleSearch = (q: string, col: string) => {
    setQuery(q);
    setColumn(col);
    setPage(1);
  };

  const statusColor = (s: Match["status"]): BadgeColor =>
    s === "Completed" ? "emerald" : s === "Pending" ? "amber" : "gray";

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 text-t1">Matches</h1>
        <p className="text-sm text-t2">
          View all matches and generate match reports.
        </p>
      </div>

      <div className="mb-4">
        <SearchBar columns={COLS} onSearch={handleSearch} />
      </div>

      <div className="rounded-2xl overflow-hidden border border-line">
        <div className="px-5 py-3.5 border-b border-line bg-thead">
          <span className="text-xs font-medium text-t2">
            {loading ? "Loading…" : `${filtered.length} fixtures`}
          </span>
        </div>

        <div className="overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-thead">
                {[
                  "#",
                  "Home Team",
                  "Score",
                  "Away Team",
                  "Field",
                  "Date & Time",
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
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-t border-divider">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse w-20 bg-input" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-sm text-t3"
                  >
                    No matches found.
                  </td>
                </tr>
              ) : (
                rows.map((match) => (
                  <tr
                    key={match.id}
                    className="transition-colors border-t border-divider hover:bg-hover"
                  >
                    <td className="px-5 py-4 text-xs font-mono text-t3">
                      {match.id}
                    </td>
                    <td className="px-5 py-4 font-medium whitespace-nowrap text-t1">
                      {match.homeTeam}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono font-semibold text-sm text-t1">
                      {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-t2">
                      {match.awayTeam}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-t2">
                      {match.field}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-xs font-medium text-t1">
                        {match.date}
                      </p>
                      <p className="text-xs mt-0.5 text-t3">{match.time}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={statusColor(match.status)} dot>
                        {match.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedFixtureId(match.fixtureId)}
                          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                        >
                          <Info size={12} /> Details
                        </button>
                        <button
                          onClick={() => setGenerateFor(match)}
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

      {selectedFixtureId !== null && (
        <MatchDetailsModal
          key={selectedFixtureId}
          fixtureId={selectedFixtureId}
          onClose={() => setSelectedFixtureId(null)}
        />
      )}

      {generateFor && (
        <GenerateReportModal
          context="match"
          name={`${generateFor.homeTeam} vs ${generateFor.awayTeam}`}
          onClose={() => setGenerateFor(null)}
          onGenerate={async (reportName, reportType, tone) => {
            const REPORT_TYPE_MAP: Record<string, string> = {
              "Pre Match Report": "pre_match",
              "Post Match Report": "post_match",
            };
            const apiReportType = REPORT_TYPE_MAP[reportType];
            if (!apiReportType) {
              setToast({ type: "error", message: "Unsupported report type." });
              return;
            }
            const params = new URLSearchParams({
              fixture_id: String(generateFor.fixtureId),
              report_type: apiReportType,
              tone: TONE_MAP[tone] ?? tone.toLowerCase(),
              report_name: reportName,
            });
            const res = await apiFetch(
              `${API_URL}/api/report-generation/queue/match?${params}`,
            );
            const data = await res.json();
            if (!res.ok || data?.error || data?.message) {
              setToast({
                type: "error",
                message: data?.error ?? data?.message ?? `Failed to queue report (${res.status}).`,
              });
              return;
            }
            startJobPolling(data.report_request_id);
            setToast({
              type: "success",
              message: "Report request created — check the Jobs tab for progress.",
            });
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
