"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";

type Context = "match" | "league";

const REPORT_TYPES: Record<Context, string[]> = {
  match: ["Pre Match Report", "Post Match Report"],
  league: ["Pre Round League Summary", "Post Round League Summary"],
};

const TONES = ["Professional", "Serious", "Funny"];

interface GenerateReportModalProps {
  context: Context;
  name: string;
  onClose: () => void;
  onGenerate: (reportName: string, reportType: string, tone: string) => Promise<void>;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (triggerRef.current) setTriggerRect(triggerRef.current.getBoundingClientRect());
    setOpen((o) => !o);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const dropdownStyle: React.CSSProperties = triggerRect
    ? {
        position: "fixed",
        top: triggerRect.bottom + 6,
        left: triggerRect.left,
        width: triggerRect.width,
        zIndex: 9999,
      }
    : {};

  return (
    <div>
      <label className="block text-xs font-semibold mb-2 text-t2">{label}</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="w-full h-9 pl-3 pr-8 rounded-xl border border-line text-sm text-left flex items-center transition-colors relative bg-input text-t1 hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
      >
        <span className="flex-1 truncate">{value}</span>
        <ChevronDown
          size={12}
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-150 text-t3 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="rounded-xl border border-line shadow-xl overflow-hidden bg-surface"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors ${
                  opt === value
                    ? "bg-indigo-subtle text-indigo-on"
                    : "text-t1 hover:bg-hover"
                }`}
              >
                {opt}
                {opt === value && <Check size={13} />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default function GenerateReportModal({
  context,
  name,
  onClose,
  onGenerate,
}: GenerateReportModalProps) {
  const [reportName, setReportName] = useState("");
  const [reportNameError, setReportNameError] = useState(false);
  const [reportType, setReportType] = useState(REPORT_TYPES[context][0]);
  const [tone, setTone] = useState(TONES[0]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!reportName.trim()) {
      setReportNameError(true);
      return;
    }
    setGenerating(true);
    try {
      await onGenerate(reportName.trim(), reportType, tone);
      onClose();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal
      title="Generate Report"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="btn-ghost px-4 py-2 rounded-lg text-sm font-medium border"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
          >
            {generating && <Loader2 size={14} className="animate-spin" />}
            {generating ? "Generating…" : "Generate Report"}
          </button>
        </div>
      }
    >
      <div className="space-y-5 py-1">
        <div className="rounded-xl border border-line px-4 py-3 bg-input">
          <p className="text-[11px] font-medium uppercase tracking-wider mb-0.5 text-t3">
            {context === "match" ? "Match" : "League"}
          </p>
          <p className="text-sm font-semibold truncate text-t1">{name}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 text-t2">
            Report Name
          </label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => { setReportName(e.target.value); setReportNameError(false); }}
            placeholder="Enter a name for this report…"
            className={`w-full h-9 px-3 rounded-xl border text-sm transition focus:outline-none focus:ring-2 bg-input text-t1 placeholder:text-t3 ${
              reportNameError
                ? "border-red-edge focus:ring-red-on/40"
                : "border-line focus:ring-indigo-500/60"
            }`}
          />
          {reportNameError && (
            <p className="mt-1.5 text-xs text-red-on">Report name is required.</p>
          )}
        </div>

        <SelectField
          label="Report Type"
          value={reportType}
          options={REPORT_TYPES[context]}
          onChange={setReportType}
        />

        <SelectField
          label="Tone"
          value={tone}
          options={TONES}
          onChange={setTone}
        />
      </div>
    </Modal>
  );
}
