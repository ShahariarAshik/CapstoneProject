"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Toast from "@/components/Toast";
import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/config";

interface NotificationContextValue {
  startJobPolling: (jobId: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  startJobPolling: () => {},
});

export function useNotification() {
  return useContext(NotificationContext);
}

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1_000; // give up after 5 minutes

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const startedAt = useRef<number>(0);

  const startJobPolling = useCallback((jobId: string) => {
    startedAt.current = Date.now();
    setPendingJobId(jobId);
  }, []);

  useEffect(() => {
    if (!pendingJobId) return;

    const interval = setInterval(async () => {
      if (Date.now() - startedAt.current > POLL_TIMEOUT_MS) {
        setPendingJobId(null);
        return;
      }

      try {
        const res = await apiFetch(
          `${API_URL}/api/report-requests/get-report-request/${pendingJobId}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data?.status === "completed") {
          setPendingJobId(null);
          setMessage("Report ready — view it in the Reports tab.");
        }
      } catch {
        // ignore transient network errors, keep polling
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pendingJobId]);

  return (
    <NotificationContext.Provider value={{ startJobPolling }}>
      {children}
      {message && (
        <Toast
          type="success"
          message={message}
          duration={8000}
          onDismiss={() => setMessage(null)}
        />
      )}
    </NotificationContext.Provider>
  );
}
