"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/config";
import type { FixtureDetailsResponse } from "@/lib/matchdetail_types";
import { isFixtureDetailsResponse } from "@/lib/matchdetail_types";

interface MatchDetailsModalProps {
  fixtureId: string | number;
  onClose: () => void;
}

export default function MatchDetailsModal({
  fixtureId,
  onClose,
}: MatchDetailsModalProps) {
  const [modalHasContent, setModalHasContent] =
    useState<FixtureDetailsResponse | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    apiFetch(`${API_URL}/api/fixture-details/${fixtureId}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            (errorData && (errorData.detail || errorData.message)) ??
              `Failed to load fixture ${fixtureId}`,
          );
        }

        return response.json();
      })
      .then((data: unknown) => {
        if (!isFixtureDetailsResponse(data)) {
          throw new Error(
            "API response does not match expected fixture details structure",
          );
        }
        setModalHasContent(data);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setModalError("Unable to load fixture details. Please try again.");
      });

    return () => controller.abort();
  }, [fixtureId]);

  return (
    <Modal
      title={
        modalError
          ? "Match Details"
          : modalHasContent === null
            ? "Loading details…"
            : "Match Details"
      }
      onClose={onClose}
      className="h-[80vh] w-[80vw] max-w-[80vw] max-h-[80vh]"
      contentClassName="px-5 py-4"
    >
      {modalError ? (
        <div className="py-4 text-sm" style={{ color: "var(--text-1)" }}>
          {modalError}
        </div>
      ) : modalHasContent === null ? (
        <div className="space-y-3 py-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-3 rounded animate-pulse"
              style={{
                background: "var(--bg-input)",
                width: `${70 + index * 10}%`,
              }}
            />
          ))}
        </div>
      ) : (
        <pre
          className="text-[11px] whitespace-pre-wrap break-words"
          style={{ color: "var(--text-1)" }}
        >
          {JSON.stringify(modalHasContent, null, 2)}
        </pre>
      )}
    </Modal>
  );
}
