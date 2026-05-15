// ─── Season ───────────────────────────────────────────────────────────────────

export interface Season {
  season_name: string;
  tenant_name: string;
}

// ─── Competition & League ──────────────────────────────────────────────────────

export interface Competition {
  id: string;
  competition_name: string;
}

export interface League {
  id: string;
  league_name: string;
  competition: Competition;
}

// ─── Venue ────────────────────────────────────────────────────────────────────

export interface FixtureField {
  id: string;
  field_name?: string | null;
  field_code?: string | null;
  parent_field_id?: string | null;
}

export interface Ground {
  ground_id: string;
  ground_name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  field?: FixtureField | null;
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface Teams {
  id: string;
  team_code?: string | null;
  team_name?: string | null;
  full_team_name?: string | null;
  club_name?: string | null;
}

// ─── Result ───────────────────────────────────────────────────────────────────

export interface Result {
  result_id: string;
  home_score: number;
  away_score: number;
  winner_team_id?: string | null;
  winner_team_name?: string | null;
  result_status: string;
  updated_at?: string | null; // ISO 8601 datetime
}

// ─── Roster / Squad ───────────────────────────────────────────────────────────

export interface RosterPlayers {
  member_id: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  federation_number?: string | null;
  dob?: string | null; // ISO date
  gender?: string | null;
  country?: string | null;
  shirt_number?: string | null;
  role_slug: string;
  is_guest?: boolean | null;
}

export interface Roster {
  home_team: RosterPlayers[];
  away_team: RosterPlayers[];
}

// ─── Fixture Events (Timeline) ──────────────────────────────────────────────────

export interface MatchEvent {
  id: string;
  event_type?: string | null;
  event_time?: number | null; // minute
  period?: string | null;
  description?: string | null;
  team_id?: string | null;
  team_name?: string | null;
  player_id?: string | null;
  player_display_name?: string | null;
  created_at?: string | null; // ISO 8601 datetime
}

// ─── Root Response ────────────────────────────────────────────────────────────

export interface FixtureDetailsResponse {
  fixture_id: string;
  event_status?: string | null;
  utc_datetime?: string | null; // ISO 8601 datetime
  local_start_date?: string | null; // ISO date
  local_start_time?: string | null; // ISO time
  duration?: number | null;

  season?: Season | null;
  league?: League | null;
  ground?: Ground | null;
  home_team?: Teams | null;
  away_team?: Teams | null;
  result?: Result | null;
  roster: Roster;
  events: MatchEvent[];
}

// ─── Validation Helper ─────────────────────────────────────────────────────────

/**
 * Type guard to validate that an unknown value conforms to FixtureDetailsResponse
 */
export function isFixtureDetailsResponse(
  value: unknown,
): value is FixtureDetailsResponse {
  if (!value || typeof value !== "object") return false;

  const obj = value as Record<string, unknown>;

  // Required fields
  if (typeof obj.fixture_id !== "string") return false;
  if (!obj.roster || typeof obj.roster !== "object") return false;
  if (!Array.isArray(obj.events)) return false;

  return true;
}
