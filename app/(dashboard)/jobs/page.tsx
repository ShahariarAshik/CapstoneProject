"use client";

import { useState, useEffect, useMemo } from "react";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import Badge from "@/components/Badge";
import ApiValidationError from "@/components/ApiValidationError";
import { API_URL } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { validateItems } from "@/lib/validate";
import type { ValidationReport } from "@/lib/validate";
import type { Job, JobItem, GetJobsResponse, BadgeColor } from "@/lib/types";

const toneColor = (t: Job["tone"]): BadgeColor =>
  t === "Serious" ? "indigo" : "amber";
const statusColor = (s: Job["status"]): BadgeColor =>
  s === "Completed" ? "emerald" : "amber";

const REQUIRED_FIELDS: (keyof JobItem)[] = [
  "id",
  "name",
  "report_type",
  "tone",
  "start_time",
  "status",
  "progress",
];

const COLS = ["Job Name", "Report Type", "Tone", "Status"];
const PER_PAGE = 10;

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState(COLS[0]);
  const [validationError, setValidationError] =
    useState<ValidationReport | null>(null);

  useEffect(() => {
    apiFetch(`${API_URL}/api/report-requests/get-report-requests`)
      .then((r) => r.json())
      .then((data: GetJobsResponse) => {
        const report = validateItems(
          data.jobs,
          REQUIRED_FIELDS,
          "/api/report-requests/get-report-requests",
        );
        if (!report.valid) {
          setValidationError(report);
          return;
        }
        if (report.empty) {
          setValidationError(report);
        }

        setJobs(
          data.jobs.map((item: JobItem, i: number) => {
            const d = new Date(item.start_time);
            return {
              id: i + 1,
              name: item.name,
              reportType: item.report_type,
              tone: item.tone === "comedy" ? "Comedy" : "Serious",
              startTime: isNaN(d.getTime())
                ? item.start_time
                : d.toLocaleString(),
              status: item.status === "completed" ? "Completed" : "Pending",
              progress: item.progress,
            };
          }),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return jobs;
    const q = query.toLowerCase();
    return jobs.filter((j) => {
      switch (column) {
        case "Job Name":
          return j.name.toLowerCase().includes(q);
        case "Report Type":
          return j.reportType.toLowerCase().includes(q);
        case "Tone":
          return j.tone.toLowerCase().includes(q);
        case "Status":
          return j.status.toLowerCase().includes(q);
        default:
          return true;
      }
    });
  }, [query, column, jobs]);

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
          Jobs
        </h1>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>
          Track report generation jobs and their progress.
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
              : `${filtered.length} ${filtered.length === jobs.length ? "total" : "matching"} jobs`}
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
                  "Job Name",
                  "Report Type",
                  "Tone",
                  "Start Time",
                  "Status",
                  "Progress",
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
                    {[...Array(7)].map((_, j) => (
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
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: "var(--text-3)" }}
                  >
                    No jobs match your search.
                  </td>
                </tr>
              ) : (
                rows.map((job) => (
                  <tr
                    key={job.id}
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
                      {job.id}
                    </td>
                    <td
                      className="px-5 py-4 font-medium whitespace-nowrap"
                      style={{ color: "var(--text-1)" }}
                    >
                      {job.name}
                    </td>
                    <td
                      className="px-5 py-4 whitespace-nowrap"
                      style={{ color: "var(--text-2)" }}
                    >
                      {job.reportType}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={toneColor(job.tone)}>{job.tone}</Badge>
                    </td>
                    <td
                      className="px-5 py-4 whitespace-nowrap text-xs font-mono"
                      style={{ color: "var(--text-2)" }}
                    >
                      {job.startTime}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={statusColor(job.status)} dot>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-24 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "var(--divider)" }}
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium w-8 text-right"
                          style={{ color: "var(--text-2)" }}
                        >
                          {job.progress}%
                        </span>
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
    </div>
  );
}
