"use client";

import { useState, useEffect, useMemo } from "react";
import { Download, Eye, Info, Pencil } from "lucide-react";
import Modal from "@/components/Modal";
import ApiValidationError from "@/components/ApiValidationError";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Badge from "@/components/Badge";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { validateItems } from "@/lib/validate";
import type { ValidationReport } from "@/lib/validate";
import type {
  Report,
  ReportItem,
  GetReportsResponse,
  BadgeColor,
} from "@/lib/types";

const REQUIRED_FIELDS: (keyof ReportItem)[] = [
  "id",
  "name",
  "type",
  "created_at",
  "tone",
];

const COLS = ["Report Name", "Report Type", "Tone"];
const PER_PAGE = 10;

const typeColor: Record<ReportItem["type"], BadgeColor> = {
  "Post Match Report": "blue",
  "Pre Match Report": "purple",
  "League Summary Report": "cyan",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState(COLS[0]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [validationError, setValidationError] =
    useState<ValidationReport | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/reports/get-reports`)
      .then((r) => r.json())
      .then((data: GetReportsResponse) => {
        const report = validateItems(
          data.reports,
          REQUIRED_FIELDS,
          "/api/reports/get-reports",
        );
        if (!report.valid) {
          setValidationError(report);
          return;
        }
        if (report.empty) {
          setValidationError(report);
        }

        setReports(
          data.reports.map((item: ReportItem, i: number) => {
            const d = new Date(item.created_at);
            return {
              id: i + 1,
              name: item.name,
              type: item.type,
              createdAt: isNaN(d.getTime())
                ? item.created_at
                : d.toLocaleString(),
              tone: item.tone === "comedy" ? "Comedy" : "Serious",
            };
          }),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return reports;
    const q = query.toLowerCase();
    return reports.filter((r) => {
      switch (column) {
        case "Report Name":
          return r.name.toLowerCase().includes(q);
        case "Report Type":
          return r.type.toLowerCase().includes(q);
        case "Tone":
          return r.tone.toLowerCase().includes(q);
        default:
          return true;
      }
    });
  }, [query, column, reports]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const handleSearch = (q: string, col: string) => {
    setQuery(q);
    setColumn(col);
    setPage(1);
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: "var(--text-1)" }}
        >
          Reports
        </h1>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>
          View, edit, and download generated match and league reports.
        </p>
      </div>

      <div className="mb-4">
        <SearchBar columns={COLS} onSearch={handleSearch} />
      </div>

      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="px-5 py-3.5 border-b"
          style={{
            background: "var(--bg-thead)",
            borderColor: "var(--border)",
          }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-2)" }}
          >
            {loading
              ? "Loading…"
              : `${filtered.length} ${filtered.length === reports.length ? "total" : "matching"} reports`}
          </span>
        </div>

        <div
          className="overflow-x-auto"
          style={{ background: "var(--bg-card)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                {[
                  "#",
                  "Report Name",
                  "Report Type",
                  "Created At",
                  "Tone",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--text-3)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr
                    key={i}
                    className="border-t"
                    style={{ borderColor: "var(--divider)" }}
                  >
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div
                          className="h-3 rounded animate-pulse w-20"
                          style={{ background: "var(--bg-input)" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: "var(--text-3)" }}
                  >
                    No reports match your search.
                  </td>
                </tr>
              ) : (
                rows.map((report) => (
                  <tr
                    key={report.id}
                    className="transition-colors border-t"
                    style={{ borderColor: "var(--divider)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "transparent")
                    }
                  >
                    <td
                      className="px-5 py-4 text-xs font-mono"
                      style={{ color: "var(--text-3)" }}
                    >
                      {report.id}
                    </td>
                    <td
                      className="px-5 py-4 font-medium"
                      style={{ color: "var(--text-1)" }}
                    >
                      {report.name}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={typeColor[report.type] ?? "blue"}>
                        {report.type}
                      </Badge>
                    </td>
                    <td
                      className="px-5 py-4 text-xs font-mono whitespace-nowrap"
                      style={{ color: "var(--text-2)" }}
                    >
                      {report.createdAt}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        color={report.tone === "Comedy" ? "amber" : "indigo"}
                      >
                        {report.tone}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(report)}
                          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border"
                        >
                          <Info size={12} /> Details
                        </button>
                        <button className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border">
                          <Eye size={12} /> View
                        </button>
                        <button className="btn-indigo flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border">
                          <Pencil size={12} /> Edit
                        </button>
                        <button className="btn-violet flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border">
                          <Download size={12} /> Download
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

      {selected && (
        <Modal title="Report Details" onClose={() => setSelected(null)}>
          {(
            [
              ["Report Name", selected.name],
              ["Type", selected.type],
              ["Created At", selected.createdAt],
              ["Tone", selected.tone],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex items-start py-2.5 border-b last:border-0"
              style={{ borderColor: "var(--divider)" }}
            >
              <span
                className="w-28 shrink-0 text-xs font-medium"
                style={{ color: "var(--text-3)" }}
              >
                {label}
              </span>
              <span className="text-xs" style={{ color: "var(--text-1)" }}>
                {value}
              </span>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
