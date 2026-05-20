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
        <h1 className="text-3xl font-bold mb-1 text-t1">Jobs</h1>
        <p className="text-sm text-t2">
          Track report generation jobs and their progress.
        </p>
      </div>

      <div className="mb-4">
        <SearchBar columns={COLS} onSearch={handleSearch} />
      </div>

      <div className="rounded-2xl overflow-hidden border border-line">
        <div className="px-5 py-3.5 border-b border-line bg-thead">
          <span className="text-xs font-medium text-t2">
            {loading
              ? "Loading…"
              : `${filtered.length} ${filtered.length === jobs.length ? "total" : "matching"} jobs`}
          </span>
        </div>

        <div className="overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-thead">
                {[
                  "#",
                  "Job Name",
                  "Report Type",
                  "Tone",
                  "Start Time",
                  "Status",
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
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse w-20 bg-input" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-t3"
                  >
                    No jobs match your search.
                  </td>
                </tr>
              ) : (
                rows.map((job) => (
                  <tr
                    key={job.id}
                    className="transition-colors border-t border-divider hover:bg-hover"
                  >
                    <td className="px-5 py-4 text-xs font-mono text-t3">
                      {job.id}
                    </td>
                    <td className="px-5 py-4 font-medium whitespace-nowrap text-t1">
                      {job.name}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-t2">
                      {job.reportType}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={toneColor(job.tone)}>{job.tone}</Badge>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-t2">
                      {job.startTime}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={statusColor(job.status)} dot>
                        {job.status}
                      </Badge>
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
