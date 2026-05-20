"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Download, Eye, Pencil, Check } from "lucide-react";
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

function downloadAsText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [column, setColumn] = useState(COLS[0]);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
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
              reportId: item.id.toString(),
              name: item.name,
              type: item.type,
              createdAt: isNaN(d.getTime())
                ? item.created_at
                : d.toLocaleString(),
              tone: item.tone === "comedy" ? "Comedy" : "Serious",
              content: item.content,
            };
          }),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (viewReport && editorRef.current) {
      editorRef.current.innerText = viewReport.content ?? "";
    }
    if (!viewReport) setEditing(false);
  }, [viewReport]);

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
        <h1 className="text-3xl font-bold mb-1 text-t1">Reports</h1>
        <p className="text-sm text-t2">
          View, edit, and download generated match and league reports.
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
              : `${filtered.length} ${filtered.length === reports.length ? "total" : "matching"} reports`}
          </span>
        </div>

        <div className="overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-thead">
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
                    No reports match your search.
                  </td>
                </tr>
              ) : (
                rows.map((report) => (
                  <tr
                    key={report.id}
                    className="transition-colors border-t border-divider hover:bg-hover"
                  >
                    <td className="px-5 py-4 text-xs font-mono text-t3">
                      {report.id}
                    </td>
                    <td className="px-5 py-4 font-medium text-t1">
                      {report.name}
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={typeColor[report.type] ?? "blue"}>
                        {report.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono whitespace-nowrap text-t2">
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
                          onClick={() => setViewReport(report)}
                          className="btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          onClick={() =>
                            downloadAsText(report.name, report.content ?? "")
                          }
                          className="btn-violet flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                        >
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

      {viewReport && (
        <Modal
          title={viewReport.name}
          onClose={() => setViewReport(null)}
          className="h-[85vh] w-[80vw] max-h-[85vh] max-w-[800px]"
          footer={
            <div className="flex items-center justify-between">
              <button
                disabled={saving}
                onClick={async () => {
                  if (editing && viewReport) {
                    if (!viewReport.reportId) return;
                    const newContent = editorRef.current?.innerText ?? "";
                    setSaving(true);
                    try {
                      await apiFetch(
                        `${API_URL}/api/reports/update-report/${viewReport.reportId}`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ content: newContent }),
                        },
                      );
                      setReports((prev) =>
                        prev.map((r) =>
                          r.reportId === viewReport.reportId
                            ? { ...r, content: newContent }
                            : r,
                        ),
                      );
                      setViewReport((prev) =>
                        prev ? { ...prev, content: newContent } : prev,
                      );
                    } catch {
                      // keep editing open on failure
                      setSaving(false);
                      return;
                    }
                    setSaving(false);
                    setEditing(false);
                  } else {
                    setEditing(true);
                    setTimeout(() => editorRef.current?.focus(), 50);
                  }
                }}
                className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 disabled:opacity-50"
              >
                {saving ? (
                  "Saving…"
                ) : editing ? (
                  <>
                    <Check size={12} /> Done Editing
                  </>
                ) : (
                  <>
                    <Pencil size={12} /> Edit
                  </>
                )}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    downloadAsText(
                      viewReport.name,
                      editorRef.current?.innerText ?? "",
                    )
                  }
                  className="btn-violet flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                >
                  <Download size={12} /> Download
                </button>
                <button
                  onClick={() => setViewReport(null)}
                  className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center gap-3 flex-wrap pb-3 border-b border-line">
              <Badge color={typeColor[viewReport.type] ?? "blue"}>
                {viewReport.type}
              </Badge>
              <Badge color={viewReport.tone === "Comedy" ? "amber" : "indigo"}>
                {viewReport.tone}
              </Badge>
              <span className="text-xs font-mono text-t3">
                {viewReport.createdAt}
              </span>
            </div>

            {editing && (
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { cmd: "bold", label: "B", cls: "font-bold" },
                    { cmd: "italic", label: "I", cls: "italic" },
                    { cmd: "underline", label: "U", cls: "underline" },
                  ] as { cmd: string; label: string; cls: string }[]
                ).map(({ cmd, label, cls }) => (
                  <button
                    key={cmd}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      document.execCommand(cmd);
                    }}
                    className={`w-7 h-7 rounded border border-line text-xs btn-ghost ${cls} focus-visible:outline-none`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div
              ref={editorRef}
              contentEditable={editing}
              suppressContentEditableWarning
              spellCheck={editing}
              className={`flex-1 text-sm leading-7 text-t1 whitespace-pre-wrap ${
                editing
                  ? "focus:outline-none rounded-xl border border-line p-3 bg-input"
                  : "select-text cursor-default"
              }`}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
