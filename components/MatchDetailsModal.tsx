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

// Returns Tabler icon class + Tailwind color classes
type EventStyle = { iconClass: string; colorClass: string };
function eventStyle(type: string | null | undefined): EventStyle {
  const t = (type ?? "").toLowerCase();
  if (t.includes("goal"))
    return { iconClass: "ti ti-ball-football", colorClass: "bg-emerald-subtle text-emerald-on" };
  if (t.includes("yellow"))
    return { iconClass: "ti ti-square-rounded-filled", colorClass: "bg-amber-subtle text-amber-on" };
  if (t.includes("red"))
    return { iconClass: "ti ti-square-rounded-filled", colorClass: "bg-red-subtle text-red-on" };
  if (t.includes("substitute"))
    return { iconClass: "ti ti-arrows-exchange", colorClass: "bg-blue-subtle text-blue-on" };
  return { iconClass: "ti ti-circle-dot", colorClass: "bg-input text-t2" };
}

// Returns label + Tailwind color classes for a status pill
type BadgeStyle = { label: string; colorClass: string };
function statusStyle(s: string | null | undefined): BadgeStyle {
  const v = (s ?? "").toLowerCase();
  if (v === "complete" || v === "completed")
    return { label: "Complete", colorClass: "bg-emerald-subtle text-emerald-on" };
  if (v === "in_progress" || v === "live")
    return { label: "Live", colorClass: "bg-red-subtle text-red-on" };
  if (v === "scheduled" || v === "upcoming")
    return { label: "Upcoming", colorClass: "bg-blue-subtle text-blue-on" };
  if (v === "pending")
    return { label: "Pending", colorClass: "bg-amber-subtle text-amber-on" };
  return { label: s ?? "—", colorClass: "bg-input text-t2" };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function TeamBlock({
  name,
  club,
  isWinner,
  side,
}: {
  name: string | null | undefined;
  club: string | null | undefined;
  isWinner: boolean;
  side: "home" | "away";
}) {
  const avatarClass =
    side === "home"
      ? "bg-blue-subtle text-blue-on"
      : "bg-amber-subtle text-amber-on";

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div
        className={`size-14 rounded-full border-2 border-line flex items-center justify-center text-base font-bold shrink-0 ${avatarClass}`}
      >
        {name ? initials(club ?? name) : "?"}
      </div>
      <div className="text-center">
        <div className="text-[13px] font-semibold text-t1 leading-[1.3]">
          {name ?? "TBD"}
        </div>
        {club && <div className="text-[11px] text-t2 mt-0.5">{club}</div>}
      </div>
      {isWinner && (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-[3px] rounded-full bg-amber-subtle text-amber-on border border-amber-edge">
          <i className="ti ti-trophy text-[11px]" />
          Winner
        </span>
      )}
    </div>
  );
}

function HeroSection({ data }: { data: FixtureDetailsResponse }) {
  const badge = statusStyle(data.event_status);
  const home = data.home_team;
  const away = data.away_team;
  const result = data.result;
  const isHomeWinner = result?.winner_team_id === home?.id;
  const isAwayWinner = result?.winner_team_id === away?.id;

  return (
    <div className="bg-thead border border-line rounded-2xl py-5 px-6 mb-4">
      {/* Context row */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex flex-col gap-1.5">
          <span
            className={`self-start inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-[3px] rounded-full ${badge.colorClass}`}
          >
            {badge.label === "Live" && (
              <span className="size-1.5 rounded-full bg-current inline-block" />
            )}
            {badge.label}
          </span>
          <span className="text-xs text-t2">
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
          <span className="flex items-center gap-1.5 text-xs text-t2 bg-input px-2.5 py-1 rounded-lg border border-line">
            <i className="ti ti-clock text-[13px]" />
            {data.duration} min
          </span>
        )}
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between gap-3">
        <TeamBlock
          name={home?.team_name}
          club={home?.club_name}
          isWinner={isHomeWinner}
          side="home"
        />

        {/* Score */}
        <div className="flex flex-col items-center gap-1 min-w-[120px] px-4 py-3.5 bg-card rounded-[14px] border border-line shrink-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-bold tracking-[-2px] text-t1 leading-none tabular-nums">
              {result?.home_score ?? "–"}
            </span>
            <span className="text-2xl text-t3 leading-none">:</span>
            <span className="text-5xl font-bold tracking-[-2px] text-t1 leading-none tabular-nums">
              {result?.away_score ?? "–"}
            </span>
          </div>
          <div className="text-[10px] tracking-[0.1em] font-semibold text-t3 uppercase">
            Full Time
          </div>
        </div>

        <TeamBlock
          name={away?.team_name}
          club={away?.club_name}
          isWinner={isAwayWinner}
          side="away"
        />
      </div>

      {/* Meta bar */}
      <div className="flex flex-wrap gap-y-1.5 gap-x-5 mt-[18px] pt-4 border-t border-line">
        <span className="flex items-center gap-1.5 text-xs text-t2">
          <i className="ti ti-calendar text-sm shrink-0" />
          {formatLocalDate(data.local_start_date)}
          {data.local_start_time
            ? ` · ${formatLocalTime(data.local_start_time)}`
            : ""}
        </span>
        {data.ground && (
          <span className="flex items-center gap-1.5 text-xs text-t2">
            <i className="ti ti-map-pin text-sm shrink-0" />
            {data.ground.field?.field_name ?? data.ground.ground_name}
          </span>
        )}
        {data.ground?.address && (
          <span className="flex items-center gap-1.5 text-xs text-t2">
            <i className="ti ti-map-2 text-sm shrink-0" />
            {data.ground.address}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "events", label: "Timeline", icon: "ti-timeline" },
  { id: "roster", label: "Rosters", icon: "ti-users" },
  { id: "venue", label: "Venue", icon: "ti-building-stadium" },
];

function Tabs({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="flex gap-1 bg-input rounded-[10px] p-1 mb-4 border border-line">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-[7px] text-xs font-medium rounded-[7px] border-none cursor-pointer transition-all ${
            active === t.id
              ? "bg-surface text-t1 shadow-sm"
              : "text-t2 hover:bg-hover bg-transparent"
          }`}
        >
          <i className={`ti ${t.icon} text-sm`} />
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Events tab ───────────────────────────────────────────────────────────────

function EventRow({
  ev,
  homeTeamId,
}: {
  ev: MatchEvent;
  homeTeamId: string | null | undefined;
}) {
  const es = eventStyle(ev.event_type);
  const isHome = ev.team_id === homeTeamId;
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors hover:bg-hover">
      <span className="min-w-8 text-right text-[11px] font-semibold text-t3 tabular-nums shrink-0">
        {ev.event_time != null ? `${ev.event_time}'` : "—"}
      </span>
      <span
        className={`size-[30px] rounded-full shrink-0 flex items-center justify-center text-[15px] ${es.colorClass}`}
      >
        <i className={es.iconClass} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-t1 truncate">
          {ev.player_display_name ?? "Unknown player"}
        </div>
        {ev.description && ev.description !== ev.event_type && (
          <div className="text-[11px] text-t2">{ev.description}</div>
        )}
      </div>
      <span
        className={`text-[10px] font-medium shrink-0 px-2 py-0.5 rounded ${
          isHome
            ? "bg-blue-subtle text-blue-on"
            : "bg-amber-subtle text-amber-on"
        }`}
      >
        {isHome ? "Home" : "Away"}
      </span>
    </div>
  );
}

function PeriodColumn({
  label,
  events,
  homeTeamId,
}: {
  label: string;
  events: MatchEvent[];
  homeTeamId: string | null | undefined;
}) {
  return (
    <div className="flex-1 min-w-0">
      {/* Period header */}
      <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-input rounded-[10px] border border-line">
        <i className="ti ti-circle-half-2 text-sm text-t3" />
        <span className="text-xs font-semibold text-t1">{label}</span>
        <span className="ml-auto text-[11px] text-t3">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
      </div>
      {/* Events list */}
      <div className="bg-card border border-line rounded-[10px] p-1">
        {events.length ? (
          events.map((ev) => (
            <EventRow key={ev.id} ev={ev} homeTeamId={homeTeamId} />
          ))
        ) : (
          <div className="py-4 px-2 text-center text-xs text-t3">
            No events.
          </div>
        )}
      </div>
    </div>
  );
}

function EventsPanel({ data }: { data: FixtureDetailsResponse }) {
  const sorted = [...data.events].sort(
    (a, b) =>
      periodOrder(a.period) - periodOrder(b.period) ||
      (a.event_time ?? 0) - (b.event_time ?? 0),
  );

  const grouped: { label: string; order: number; events: MatchEvent[] }[] = [];
  for (const ev of sorted) {
    const label = periodLabel(ev.period);
    const order = periodOrder(ev.period);
    const last = grouped[grouped.length - 1];
    if (!last || last.label !== label)
      grouped.push({ label, order, events: [ev] });
    else last.events.push(ev);
  }

  if (!sorted.length) {
    return (
      <div className="py-12 text-center flex flex-col items-center gap-2.5 text-t3">
        <i className="ti ti-timeline-event-exclamation text-[36px]" />
        <span className="text-[13px]">No match events recorded.</span>
      </div>
    );
  }

  const firstHalf = grouped.find((g) => g.order === 1);
  const secondHalf = grouped.find((g) => g.order === 2);
  const extraPeriods = grouped.filter((g) => g.order > 2);
  const homeTeamId = data.home_team?.id;

  return (
    <div className="flex flex-col gap-3">
      {/* First half | Second half — two columns */}
      <div className="flex gap-3 items-start">
        <PeriodColumn
          label={firstHalf?.label ?? "First Half"}
          events={firstHalf?.events ?? []}
          homeTeamId={homeTeamId}
        />
        <PeriodColumn
          label={secondHalf?.label ?? "Second Half"}
          events={secondHalf?.events ?? []}
          homeTeamId={homeTeamId}
        />
      </div>
      {/* Extra time, penalties etc. — full width */}
      {extraPeriods.map((g) => (
        <PeriodColumn
          key={g.label}
          label={g.label}
          events={g.events}
          homeTeamId={homeTeamId}
        />
      ))}
    </div>
  );
}

// ─── Roster tab ───────────────────────────────────────────────────────────────

function PlayerRow({ p }: { p: RosterPlayers }) {
  const isCoach = p.role_slug === "coach" || p.role_slug === "manager";
  const name =
    p.display_name ??
    (`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unknown");

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-hover">
      <span className="text-[10px] font-semibold min-w-6 text-right text-t3 tabular-nums shrink-0">
        {p.shirt_number ? `#${p.shirt_number}` : "—"}
      </span>
      <div
        className={`size-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold border border-line ${
          isCoach ? "bg-violet-subtle text-violet-on" : "bg-input text-t2"
        }`}
      >
        {initials(name)}
      </div>
      <span className="flex-1 text-xs font-medium text-t1 truncate">{name}</span>
      <span
        className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${
          isCoach
            ? "bg-violet-subtle text-violet-on border-violet-edge"
            : "bg-input text-t2 border-line"
        }`}
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
  side,
}: {
  teamName: string | null | undefined;
  clubName: string | null | undefined;
  players: RosterPlayers[];
  side: "home" | "away";
}) {
  const headerBg = side === "home" ? "bg-blue-subtle" : "bg-amber-subtle";
  const avatarBg = side === "home" ? "bg-blue-on" : "bg-amber-on";

  return (
    <div className="flex-1 min-w-0">
      {/* Team header */}
      <div
        className={`flex items-center gap-2 mb-2 px-3 py-2.5 rounded-[10px] border border-line ${headerBg}`}
      >
        <div
          className={`size-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${avatarBg}`}
        >
          {initials(teamName ?? "T")}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-t1 truncate">
            {teamName ?? "Team"}
          </div>
          {clubName && (
            <div className="text-[11px] text-t2 truncate">{clubName}</div>
          )}
        </div>
      </div>

      {/* Player list */}
      <div className="bg-card border border-line rounded-[10px] p-1">
        {players.length ? (
          players.map((p) => (
            <PlayerRow
              key={`${p.member_id}-${p.shirt_number}-${p.role_slug}`}
              p={p}
            />
          ))
        ) : (
          <div className="py-4 px-2 text-center text-xs text-t3">
            No players listed.
          </div>
        )}
      </div>
    </div>
  );
}

function RosterPanel({ data }: { data: FixtureDetailsResponse }) {
  return (
    <div className="flex gap-3 items-start">
      <TeamColumn
        teamName={data.home_team?.team_name}
        clubName={data.home_team?.club_name}
        players={data.roster.home_team}
        side="home"
      />
      <TeamColumn
        teamName={data.away_team?.team_name}
        clubName={data.away_team?.club_name}
        players={data.roster.away_team}
        side="away"
      />
    </div>
  );
}

// ─── Venue tab ────────────────────────────────────────────────────────────────

function VenueField({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-input rounded-lg border border-line">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-t3 uppercase tracking-[0.05em]">
        <i className={`ti ${icon} text-[12px]`} />
        {label}
      </div>
      <span
        className={`text-[13px] font-medium ${value ? "text-t1" : "text-t3"}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function VenuePanel({ data }: { data: FixtureDetailsResponse }) {
  const g = data.ground;
  if (!g)
    return (
      <div className="py-12 text-center flex flex-col items-center gap-2.5 text-t3">
        <i className="ti ti-building-off text-[36px]" />
        <span className="text-[13px]">No venue information.</span>
      </div>
    );

  const fieldVal = g.field
    ? `${g.field.field_name} (${g.field.field_code})`
    : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Stadium header */}
      <div className="flex items-center gap-3.5 px-[18px] py-4 bg-thead border border-line rounded-[14px]">
        <div className="size-11 rounded-[10px] bg-blue-subtle border border-line flex items-center justify-center text-blue-on text-[22px] shrink-0">
          <i className="ti ti-building-stadium" />
        </div>
        <div>
          <div className="font-semibold text-[15px] text-t1">{g.ground_name}</div>
          {g.field && (
            <div className="text-xs text-t2 mt-[3px]">
              {g.field.field_name} · {g.field.field_code}
            </div>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-3 gap-2">
        <VenueField icon="ti-layout-grid" label="Field" value={fieldVal} />
        <VenueField icon="ti-map-pin" label="Address" value={g.address} />
        <VenueField icon="ti-clock" label="Timezone" value={g.timezone} />
        <VenueField
          icon="ti-compass"
          label="Latitude"
          value={g.latitude?.toString()}
        />
        <VenueField
          icon="ti-compass"
          label="Longitude"
          value={g.longitude?.toString()}
        />
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="h-[200px] rounded-2xl bg-thead border border-line" />
      <div className="h-11 rounded-[10px] bg-input border border-line" />
      {[90, 75, 85, 60, 80].map((w, i) => (
        <div
          key={i}
          className="h-11 rounded-lg bg-input"
          style={{ width: `${w}%` }}
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
      .catch(() => {
        if (!ctrl.signal.aborted)
          setError("Unable to load fixture details. Please try again.");
      });
    return () => ctrl.abort();
  }, [fixtureId]);

  return (
    <Modal
      title="Match Details"
      onClose={onClose}
      className="h-[85vh] w-[80vw] max-h-[85vh] max-w-[900px]"
    >
      {error ? (
        <div className="py-10 text-center flex flex-col items-center gap-2.5">
          <i className="ti ti-alert-circle text-[36px] text-red-on" />
          <p className="text-[13px] text-t2">{error}</p>
        </div>
      ) : !data ? (
        <Skeleton />
      ) : (
        <div className="text-t1">
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
