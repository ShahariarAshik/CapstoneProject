// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  expires_in: number; // seconds
}

export interface RegisterRequest {
  full_name: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  access_token?: string;
  expires_in?: number;
}

export interface JwtPayload {
  sub?: string;
  email?: string;
  full_name?: string;
  username?: string;
  exp?: number; // unix timestamp (seconds) — optional per JWT spec
}

// ─── API Errors ───────────────────────────────────────────────────────────────

export interface FastApiFieldError {
  loc: string[];
  msg: string;
  type: string;
}

export interface ApiErrorResponse {
  detail: string | FastApiFieldError[];
}

// ─── Leagues ──────────────────────────────────────────────────────────────────

export interface LeagueItem {
  id: string;
  league_name: string;
  competition_name: string;
  season: string;
  matches: number;
  status: "pending" | "completed";
}

export interface GetLeaguesResponse {
  leagues: LeagueItem[];
}

export interface League {
  id: number;
  name: string;
  leagueId: string;
  competition_name: string;
  season: string | number;
  matches: number | string;
  status: "Pending" | "Completed" | "No Data";
}

// ─── Fixtures / Matches ───────────────────────────────────────────────────────

export interface FixtureItem {
  home_team_id: string;
  home_team_name: string;
  away_team_id: string;
  away_team_name: string;
  ground_id?: string;
  ground_name?: string;
  utc_datetime?: string; // ISO 8601
  event_status?: "pending" | "complete"; // | "completed" | "cancelled";
  duration?: number;
  home_score?: number;
  away_score?: number;
}

export interface GetFixturesResponse {
  fixtures: FixtureItem[];
}

export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  location: string;
  date: string;
  time: string;
  status: "Pending" | "Completed" | "No Data";
  homeScore: number | null;
  awayScore: number | null;
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export interface JobItem {
  id: string | number;
  name: string;
  report_type: string;
  tone: "serious" | "comedy";
  start_time: string; // ISO 8601
  status: "pending" | "completed";
  progress: number; // 0-100
}

export interface GetJobsResponse {
  jobs: JobItem[];
}

export interface Job {
  id: number;
  name: string;
  reportType: string;
  tone: "Serious" | "Comedy";
  startTime: string;
  status: "Pending" | "Completed";
  progress: number;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface ReportItem {
  id: string | number;
  name: string;
  type: "Post Match Report" | "Pre Match Report" | "League Summary Report";
  created_at: string; // ISO 8601
  tone: "serious" | "comedy";
  content?: string;
}

export interface GetReportsResponse {
  reports: ReportItem[];
}

export interface Report {
  id: number;
  name: string;
  type: ReportItem["type"];
  createdAt: string;
  tone: "Serious" | "Comedy";
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStatsResponse {
  total_reports: number;
  total_matches: number;
  total_leagues: number;
  total_jobs: number;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export type BadgeColor =
  | "emerald"
  | "amber"
  | "red"
  | "indigo"
  | "violet"
  | "blue"
  | "cyan"
  | "purple"
  | "gray";
