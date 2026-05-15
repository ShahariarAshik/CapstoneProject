"use client";

import Modal from "@/components/Modal";
import type { ValidationReport } from "@/lib/validate";

export default function ApiValidationError({
  report,
  onClose,
}: {
  report: ValidationReport;
  onClose: () => void;
}) {
  if (report.empty) {
    return (
      <Modal title="API Response — No Data" onClose={onClose}>
        <div className="py-2 space-y-4 text-xs">
          <div
            className="rounded-lg px-3 py-2.5"
            style={{
              background: "var(--badge-amber-bg)",
              border: "1px solid var(--badge-amber-border)",
            }}
          >
            <p
              className="font-semibold"
              style={{ color: "var(--badge-amber-text)" }}
            >
              API returned 0 records — field structure cannot be verified
            </p>
            <p
              className="font-mono mt-0.5 opacity-80"
              style={{ color: "var(--badge-amber-text)" }}
            >
              {report.endpoint}
            </p>
          </div>

          <div>
            <p
              className="font-semibold mb-1"
              style={{ color: "var(--text-1)" }}
            >
              Expected fields
            </p>
            <p
              className="font-mono leading-relaxed"
              style={{ color: "var(--text-3)" }}
            >
              {report.requiredFields.join(",  ")}
            </p>
          </div>

          <p style={{ color: "var(--text-3)" }}>
            Verify the endpoint is functioning and has data to return. Once
            records exist, field-level validation will run automatically.
          </p>
        </div>
      </Modal>
    );
  }

  const missingEntries = Object.entries(report.missingByField);
  const affectedCount = missingEntries.reduce(
    (max, [, n]) => Math.max(max, n),
    0,
  );

  return (
    <Modal title="API Validation Error" onClose={onClose}>
      <div className="py-2 space-y-4 text-xs">
        {/* Summary banner */}
        <div
          className="rounded-lg px-3 py-2.5"
          style={{
            background: "var(--badge-red-bg)",
            border: "1px solid var(--badge-red-border)",
          }}
        >
          <p
            className="font-semibold"
            style={{ color: "var(--badge-red-text)" }}
          >
            {report.totalItems === 0
              ? "Response array is missing or not an array"
              : `${affectedCount} of ${report.totalItems} items are missing required fields`}
          </p>
          <p
            className="font-mono mt-0.5 opacity-80"
            style={{ color: "var(--badge-red-text)" }}
          >
            {report.endpoint}
          </p>
        </div>

        {/* Missing fields table */}
        <div>
          <p className="font-semibold mb-2" style={{ color: "var(--text-1)" }}>
            Missing fields
          </p>
          <div
            className="rounded-lg overflow-hidden border"
            style={{ borderColor: "var(--border)" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--bg-thead)" }}>
                  <th
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-3)" }}
                  >
                    Field
                  </th>
                  <th
                    className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-3)" }}
                  >
                    Affected
                  </th>
                </tr>
              </thead>
              <tbody>
                {missingEntries.map(([field, count]) => (
                  <tr
                    key={field}
                    className="border-t"
                    style={{ borderColor: "var(--divider)" }}
                  >
                    <td
                      className="px-3 py-2 font-mono"
                      style={{ color: "var(--badge-red-text)" }}
                    >
                      {field}
                    </td>
                    <td
                      className="px-3 py-2"
                      style={{ color: "var(--text-2)" }}
                    >
                      {count} / {report.totalItems} items
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expected fields */}
        <div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-1)" }}>
            Expected fields
          </p>
          <p
            className="font-mono leading-relaxed"
            style={{ color: "var(--text-3)" }}
          >
            {report.requiredFields.join(",  ")}
          </p>
        </div>

        {/* Sample raw payload */}
        {Object.keys(report.sampleItem).length > 0 && (
          <div>
            <p
              className="font-semibold mb-1"
              style={{ color: "var(--text-1)" }}
            >
              Received (first invalid item)
            </p>
            <pre
              className="rounded-lg px-3 py-2.5 overflow-auto leading-relaxed max-h-60"
              style={{ background: "var(--bg-input)", color: "var(--text-2)" }}
            >
              {JSON.stringify(report.sampleItem, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
