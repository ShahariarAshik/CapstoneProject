"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/config";
import type {
  FixtureDetailsResponse,
  MatchEvent,
  RosterPlayers,
} from "@/lib/matchdetail_types";
import { isFixtureDetailsResponse } from "@/lib/matchdetail_types";

interface MatchDetailsModalProps {
  fixtureId: string | number;
  onClose: () => void;
}

type Tab = "events" | "roster" | "venue";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatLocalDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLocalTime(t: string | null | undefined): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
}

function periodLabel(p: string | null | undefined): string {
  const map: Record<string, string> = {
    "ft-first-half": "First Half",
    first_half: "First Half",
    "ft-second-half": "Second Half",
    second_half: "Second Half",
    extra_time: "Extra Time",
    penalties: "Penalties",
  };
  return p ? (map[p] ?? p.replace(/[-_]/g, " ")) : "Other";
}

function periodOrder(p: string | null | undefined): number {
  const o: Record<string, number> = {
    "ft-first-half": 1,
    first_half: 1,
    "ft-second-half": 2,
    second_half: 2,
    extra_time: 3,
    penalties: 4,
  };
  return o[p ?? ""] ?? 99;
}

type EventStyle = { icon: string; bg: string; color: string };
function eventStyle(type: string | null | undefined): EventStyle {
  const t = (type ?? "").toLowerCase();
  if (t.includes("goal"))
    return {
      icon: "⚽",
      bg: "var(--color-background-success)",
      color: "var(--color-text-success)",
    };
  if (t.includes("yellow"))
    return { icon: "🟨", bg: "#FAEEDA", color: "#854F0B" };
  if (t.includes("red"))
    return {
      icon: "🟥",
      bg: "var(--color-background-danger)",
      color: "var(--color-text-danger)",
    };
  if (t.includes("substitute"))
    return {
      icon: "🔄",
      bg: "var(--color-background-info)",
      color: "var(--color-text-info)",
    };
  return {
    icon: "•",
    bg: "var(--color-background-secondary)",
    color: "var(--color-text-secondary)",
  };
}

type BadgeStyle = { label: string; bg: string; color: string };
function statusStyle(s: string | null | undefined): BadgeStyle {
  const v = (s ?? "").toLowerCase();
  if (v === "complete" || v === "completed")
    return {
      label: "Complete",
      bg: "var(--color-background-success)",
      color: "var(--color-text-success)",
    };
  if (v === "in_progress" || v === "live")
    return {
      label: "Live",
      bg: "var(--color-background-danger)",
      color: "var(--color-text-danger)",
    };
  if (v === "scheduled" || v === "upcoming")
    return {
      label: "Upcoming",
      bg: "var(--color-background-info)",
      color: "var(--color-text-info)",
    };
  return {
    label: s ?? "—",
    bg: "var(--color-background-secondary)",
    color: "var(--color-text-secondary)",
  };
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "0.5px solid var(--color-border-tertiary)",
  borderRadius: 12,
  padding: "10px 12px",
};

const pill = (bg: string, color: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 11,
  padding: "3px 10px",
  borderRadius: 999,
  background: bg,
  color,
});

const metaItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  color: "var(--color-text-secondary)",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--color-text-tertiary)",
  margin: "14px 0 6px",
};

const avatar = (bg: string, color: string, size = 44): React.CSSProperties => ({
  width: size,
  height: size,
  borderRadius: "50%",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: size > 32 ? 14 : 11,
  fontWeight: 500,
  background: bg,
  color,
});

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ data }: { data: FixtureDetailsResponse }) {
  const badge = statusStyle(data.event_status);
  const home = data.home_team;
  const away = data.away_team;
  const result = data.result;
  const isHomeWinner = result?.winner_team_id === home?.id;
  const isAwayWinner = result?.winner_team_id === away?.id;

  return (
    <div
      style={{
        background: "var(--color-background-secondary)",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 16,
      }}
    >
      {/* Context row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <span style={pill(badge.bg, badge.color)}>{badge.label}</span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {[
              data.league?.league_name,
              data.league?.competition?.competition_name,
              data.season?.season_name,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
        {data.duration && (
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            ⏱ {data.duration} min
          </span>
        )}
      </div>

      {/* Score row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        {/* Home team */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            flex: 1,
          }}
        >
          <div style={avatar("#E6F1FB", "#185FA5")}>
            {home ? initials(home.club_name ?? home.team_name ?? "H") : "H"}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              textAlign: "center",
              color: "var(--color-text-primary)",
              lineHeight: 1.3,
            }}
          >
            {home?.team_name ?? "Home Team"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              textAlign: "center",
            }}
          >
            {home?.club_name}
          </div>
          {isHomeWinner && (
            <span
              style={pill(
                "var(--color-background-success)",
                "var(--color-text-success)",
              )}
            >
              🏆 Winner
            </span>
          )}
        </div>

        {/* Score */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            minWidth: 110,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span
              style={{
                fontSize: 40,
                fontWeight: 500,
                letterSpacing: -1,
                color: "var(--color-text-primary)",
              }}
            >
              {result?.home_score ?? "–"}
            </span>
            <span
              style={{
                fontSize: 26,
                color: "var(--color-text-tertiary)",
                margin: "0 5px",
              }}
            >
              –
            </span>
            <span
              style={{
                fontSize: 40,
                fontWeight: 500,
                letterSpacing: -1,
                color: "var(--color-text-primary)",
              }}
            >
              {result?.away_score ?? "–"}
            </span>
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "var(--color-text-tertiary)",
            }}
          >
            FT
          </div>
        </div>

        {/* Away team */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            flex: 1,
          }}
        >
          <div style={avatar("#FAEEDA", "#854F0B")}>
            {away ? initials(away.club_name ?? away.team_name ?? "A") : "A"}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              textAlign: "center",
              color: "var(--color-text-primary)",
              lineHeight: 1.3,
            }}
          >
            {away?.team_name ?? "Away Team"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              textAlign: "center",
            }}
          >
            {away?.club_name}
          </div>
          {isAwayWinner && (
            <span
              style={pill(
                "var(--color-background-success)",
                "var(--color-text-success)",
              )}
            >
              🏆 Winner
            </span>
          )}
        </div>
      </div>

      {/* Meta bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 16px",
          marginTop: 14,
          paddingTop: 14,
          borderTop: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <span style={metaItem}>
          📅 {formatLocalDate(data.local_start_date)}
          {data.local_start_time
            ? ` · ${formatLocalTime(data.local_start_time)}`
            : ""}
        </span>
        {data.ground && (
          <span style={metaItem}>
            📍 {data.ground.field?.field_name ?? data.ground.ground_name}
          </span>
        )}
        {data.ground?.address && (
          <span style={metaItem}>🗺 {data.ground.address}</span>
        )}
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "events", label: "Timeline" },
  { id: "roster", label: "Rosters" },
  { id: "venue", label: "Venue" },
];

function Tabs({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        marginBottom: 14,
      }}
    >
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            background: "none",
            marginBottom: -1,
            borderBottom: `2px solid ${active === t.id ? "var(--color-text-primary)" : "transparent"}`,
            color:
              active === t.id
                ? "var(--color-text-primary)"
                : "var(--color-text-secondary)",
            fontWeight: active === t.id ? 500 : 400,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Events tab ───────────────────────────────────────────────────────────────

function EventsPanel({ data }: { data: FixtureDetailsResponse }) {
  const sorted = [...data.events].sort(
    (a, b) =>
      periodOrder(a.period) - periodOrder(b.period) ||
      (a.event_time ?? 0) - (b.event_time ?? 0),
  );

  const grouped: { label: string; events: MatchEvent[] }[] = [];
  for (const ev of sorted) {
    const label = periodLabel(ev.period);
    const last = grouped[grouped.length - 1];
    if (!last || last.label !== label) grouped.push({ label, events: [ev] });
    else last.events.push(ev);
  }

  if (!sorted.length) {
    return (
      <div
        style={{
          padding: "32px 0",
          textAlign: "center",
          fontSize: 13,
          color: "var(--color-text-tertiary)",
        }}
      >
        No match events recorded.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        flexWrap: "wrap", // Falls back to stacked if container width is too narrow
      }}
    >
      {grouped.map((group) => (
        <div
          key={group.label}
          style={{
            flex: "1 1 300px", // Allows columns to split 50/50 but wraps if below 300px
            minWidth: 0,
          }}
        >
          {/* Period divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "10px 0 4px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "0.5px",
                background: "var(--color-border-tertiary)",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-text-tertiary)",
              }}
            >
              {group.label}
            </span>
            <div
              style={{
                flex: 1,
                height: "0.5px",
                background: "var(--color-border-tertiary)",
              }}
            />
          </div>

          {group.events.map((ev) => {
            const es = eventStyle(ev.event_type);
            const isHome = ev.team_id === data.home_team?.id;
            return (
              <div
                key={ev.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 10px",
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    minWidth: 28,
                    textAlign: "right",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  {ev.event_time != null ? `${ev.event_time}'` : "—"}
                </span>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    background: es.bg,
                    color: es.color,
                  }}
                >
                  {es.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ev.player_display_name ?? "Unknown player"}
                  </div>
                  {ev.description && ev.description !== ev.event_type && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {ev.description}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    flexShrink: 0,
                    color: isHome ? "#185FA5" : "#854F0B",
                  }}
                >
                  {isHome ? "Home" : "Away"}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Roster tab ───────────────────────────────────────────────────────────────

function PlayerRow({ p }: { p: RosterPlayers }) {
  const isCoach = p.role_slug === "coach" || p.role_slug === "manager";
  const name =
    p.display_name ?? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 6px",
        borderRadius: 6,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          minWidth: 26,
          textAlign: "right",
          color: "var(--color-text-secondary)",
        }}
      >
        {p.shirt_number ? `#${p.shirt_number}` : "—"}
      </span>
      <div
        style={avatar(
          isCoach
            ? "var(--color-background-info)"
            : "var(--color-background-secondary)",
          isCoach ? "var(--color-text-info)" : "var(--color-text-secondary)",
          28,
        )}
      >
        {initials(name || "?")}
      </div>
      <span
        style={{
          flex: 1,
          fontSize: 12,
          color: "var(--color-text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </span>
      <span
        style={pill(
          isCoach
            ? "var(--color-background-info)"
            : "var(--color-background-secondary)",
          isCoach ? "var(--color-text-info)" : "var(--color-text-secondary)",
        )}
      >
        {p.role_slug}
      </span>
    </div>
  );
}

function TeamColumn({
  teamName,
  clubName,
  players,
  dotColor,
  avatarBg,
  avatarColor,
}: {
  teamName: string | null | undefined;
  clubName: string | null | undefined;
  players: RosterPlayers[];
  dotColor: string;
  avatarBg: string;
  avatarColor: string;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Team header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {teamName ?? "Team"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {clubName}
          </div>
        </div>
      </div>

      {/* Player list */}
      <div style={{ ...card, padding: "6px" }}>
        {players.length ? (
          players.map((p) => (
            <PlayerRow
              key={`${p.member_id}-${p.shirt_number}-${p.role_slug}`}
              p={p}
            />
          ))
        ) : (
          <div
            style={{
              padding: "12px 8px",
              textAlign: "center",
              fontSize: 12,
              color: "var(--color-text-tertiary)",
            }}
          >
            No players listed.
          </div>
        )}
      </div>
    </div>
  );
}

function RosterPanel({ data }: { data: FixtureDetailsResponse }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <TeamColumn
        teamName={data.home_team?.team_name}
        clubName={data.home_team?.club_name}
        players={data.roster.home_team}
        dotColor="#185FA5"
        avatarBg="#E6F1FB"
        avatarColor="#185FA5"
      />
      {/* Divider */}
      <div
        style={{
          width: "0.5px",
          background: "var(--color-border-tertiary)",
          alignSelf: "stretch",
          flexShrink: 0,
          marginTop: 30,
        }}
      />
      <TeamColumn
        teamName={data.away_team?.team_name}
        clubName={data.away_team?.club_name}
        players={data.roster.away_team}
        dotColor="#854F0B"
        avatarBg="#FAEEDA"
        avatarColor="#854F0B"
      />
    </div>
  );
}

// ─── Venue tab ────────────────────────────────────────────────────────────────

function VenuePanel({ data }: { data: FixtureDetailsResponse }) {
  const g = data.ground;
  if (!g)
    return (
      <div
        style={{
          padding: "32px 0",
          textAlign: "center",
          fontSize: 13,
          color: "var(--color-text-tertiary)",
        }}
      >
        No venue information.
      </div>
    );

  const fieldVal = g.field
    ? `${g.field.field_name} (${g.field.field_code})`
    : null;

  return (
    <div style={card}>
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "var(--color-background-info)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          🏟
        </div>
        <div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 14,
              color: "var(--color-text-primary)",
            }}
          >
            {g.ground_name}
          </div>
          {g.field && (
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              {g.field.field_name} · {g.field.field_code}
            </div>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          paddingTop: 12,
          borderTop: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        {/* Row 1: Field, Address, Timezone (3 Columns) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
              Field
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {fieldVal || "—"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
              Address
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {g.address || "—"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
              Timezone
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {g.timezone || "—"}
            </span>
          </div>
        </div>

        {/* Row 2: Latitude, Longitude, Empty Cell (3 Columns) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
              Latitude
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {g.latitude?.toString() || "—"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
              Longitude
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {g.longitude?.toString() || "—"}
            </span>
          </div>
          {/* Explicitly empty 3rd column to maintain symmetry with row 1 */}
          <div></div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "8px 0",
      }}
    >
      {[80, 100, 60, 90, 70].map((w, i) => (
        <div
          key={i}
          style={{
            height: 12,
            borderRadius: 6,
            background: "var(--color-background-secondary)",
            width: `${w}%`,
            animation: "pulse 1.5s infinite",
          }}
        />
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function MatchDetailsModal({
  fixtureId,
  onClose,
}: MatchDetailsModalProps) {
  const [data, setData] = useState<FixtureDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("events");

  useEffect(() => {
    const ctrl = new AbortController();
    apiFetch(`${API_URL}/api/fixture-details/${fixtureId}`, {
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => null);
          throw new Error(
            d?.detail ?? d?.message ?? `Failed to load fixture ${fixtureId}`,
          );
        }
        return res.json();
      })
      .then((raw: unknown) => {
        if (!isFixtureDetailsResponse(raw))
          throw new Error("Unexpected API response shape");
        setData(raw);
      })
      .catch((e) => {
        if (!ctrl.signal.aborted)
          setError("Unable to load fixture details. Please try again.");
      });
    return () => ctrl.abort();
  }, [fixtureId]);

  return (
    <Modal
      title="Match Details"
      onClose={onClose}
      className="h-[80vh] w-[80vw] max-h-[80vh] max-w-[80vw]"
      contentClassName="px-5 py-4 overflow-y-auto"
    >
      {error ? (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            padding: "16px 0",
          }}
        >
          {error}
        </p>
      ) : !data ? (
        <Skeleton />
      ) : (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-primary)",
          }}
        >
          <HeroSection data={data} />
          <Tabs active={tab} onChange={setTab} />
          {tab === "events" && <EventsPanel data={data} />}
          {tab === "roster" && <RosterPanel data={data} />}
          {tab === "venue" && <VenuePanel data={data} />}
        </div>
      )}
    </Modal>
  );
}
