export type MatchStatus = 'confirmed' | 'ambiguous' | 'unmatched';
export type Band = 'Improved' | 'Stable' | 'Declined';
export type Severity = 'error' | 'warning';

/** Editable cells may hold a string (what an operator types) or a number. */
export type CellValue = string | number | boolean | null;

export interface Totals {
  unique_students: number;
  source_rows: number;
  enrolments: number;
  schools: number;
  confirmed: number;
  ambiguous: number;
  unmatched: number;
  cohort: number;
  issues: number;
  errors: number;
}

export interface ReachRow {
  year_joined: number;
  participations: number;
  new_students: number;
  returning: number;
  unique_students: number;
}

export interface CompletenessRow {
  field: string;
  filled: number;
  total: number;
  pct: number;
}

export interface TermRow {
  term: number;
  mean: number;
  n: number;
  completeness: number;
}

export interface Progress {
  improved: number;
  stable: number;
  declined: number;
  assessed: number;
  cohort: number;
}

export interface BandCounts {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

export interface SubjectRow {
  subject: string;
  n: number;
  term1: number | null;
  term2: number | null;
  term3: number | null;
  improved: number;
  stable: number;
  declined: number;
  pct_improved: number | null;
}

export interface RosterRow {
  uid: string;
  legacy: number | null;
  match: MatchStatus;
  dobFlag: boolean;
  first: CellValue;
  last: CellValue;
  dob: CellValue;
  email: CellValue;
  phone: CellValue;
  school: CellValue;
  father: CellValue;
  mother: CellValue;
  fatherEdu: CellValue;
  fatherEmp: CellValue;
  motherEdu: CellValue;
  motherEmp: CellValue;
  sis: CellValue;
  bro: CellValue;
  consent: CellValue;
  fav: CellValue;
  diff: CellValue;
  car1: CellValue;
  car2: CellValue;
  t1: number | null;
  t2: number | null;
  t3: number | null;
  band: Band | null;
}

export interface IssueSummaryRow {
  severity: Severity;
  field: string;
  n: number;
}

export interface IssueRow {
  entity: string;
  ref: string;
  field: string;
  issue: string;
  action: string;
  severity: Severity;
}

export interface BandByTerm {
  term1: BandCounts;
  term2: BandCounts;
  term3: BandCounts;
}

/* ── Per-page API contracts ────────────────────────────────────────────
   These mirror the endpoint table in before-coding.readme §10. Each payload
   is derivable from `MisData` in UI-only mode; the resource modules in
   `src/lib/api/` document the matching HTTP path. */

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface PageParams {
  page?: number;
  page_size?: number;
}

/** Overview page: headline totals + field completeness gauges. */
export interface OverviewPayload {
  generated: string;
  totals: Totals;
  completeness: CompletenessRow[];
}

/** Reach page: enrolment split by year joined. */
export interface ReachPayload {
  totals: Pick<Totals, 'unique_students' | 'enrolments'>;
  reach: ReachRow[];
}

export interface ReachParams {
  year_from?: number;
  year_to?: number;
  programme?: 'ascg' | 'cbc' | 'prog3';
}

/** ASCG academic page: term means, progress split, bands, subjects. */
export interface AscgAcademicParams {
  cohort?: number;
}

export interface AscgAcademicPayload {
  cohort: number;
  terms: TermRow[];
  progress: Progress;
  performance: Record<string, number>;
  bandByTerm: BandByTerm;
  subjects: SubjectRow[];
}

/* ── Coding Boot Camp ───────────────────────────────────────────────── */

export type CbcTrack = 'full-stack' | 'data' | 'ui-ux' | 'other';

export interface CbcSummary {
  enrolled: number | null;
  completed: number | null;
  employed_6mo: number | null;
  employed_12mo: number | null;
  unemployed_12mo: number | null;
  further_education: number | null;
  engaged_full: number | null;
  engaged_partial: number | null;
  median_months_to_role: number | null;
  response_rate: number | null;
}

export interface CbcGraduate {
  id: string;
  name: string | null;
  track: CbcTrack | null;
  prior_tech_education: string | null;
  prior_tech_experience: string | null;
  completed_programme: boolean | null;
  graduated_at: string | null;
}

export interface CbcOutcome {
  id: string;
  graduate_id: string;
  months_after: 6 | 12;
  outcome: string | null;
  role_title: string | null;
  company: string | null;
  industry: string | null;
  tech_engagement: string | null;
}

export interface CbcGraduateParams extends PageParams {
  track?: CbcTrack;
  outcome?: string;
}

export interface CbcOutcomeParams {
  months_after?: 6 | 12;
}

export type NewCbcGraduate = Partial<Omit<CbcGraduate, 'id'>>;
export type CbcGraduatePatch = Partial<Omit<CbcGraduate, 'id'>>;
export type NewCbcOutcome = Partial<Omit<CbcOutcome, 'id'>>;

/* ── Student register ──────────────────────────────────────────────── */

export interface RegisterFilters extends PageParams {
  q?: string;
  school?: string;
  match?: MatchStatus;
  missing_consent?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export type RegisterPage = Paged<RosterRow>;

export interface RegisterCellPatch {
  uid: string;
  field: string;
  value: string | null;
}

export interface RegisterEditInput {
  uid: string;
  field: string;
  value: string | null;
}

/* ── Data quality ──────────────────────────────────────────────────── */

export interface QualitySummary {
  issues: number;
  errors: number;
  warnings: number;
  ambiguous: number;
  issueSummary: IssueSummaryRow[];
}

export interface QualityIssuesParams extends PageParams {
  severity?: Severity;
  field?: string;
}

/* ── Board summary (aggregate-only by contract) ────────────────────── */

export interface BoardSummaryPayload {
  unique_students: number;
  schools: number;
  improved_pct: number | null;
  assessed: number;
  consent_pct: number | null;
  reach_by_year: ReachRow[];
  outcome_split: Progress;
  terms: TermRow[];
}

export interface ProgrammeSpendParams {
  programme?: string;
  year?: number;
}

export interface ProgrammeSpend {
  programme: string;
  year: number;
  spend: number | null;
  currency: string;
}

/* ── Metrics to add (static today, editable later) ─────────────────── */

export interface MetricProposal {
  metric: string;
  type: string;
  rationale: string;
  status?: 'proposed' | 'planned' | 'live';
}


export interface MisData {
  generated: string;
  totals: Totals;
  reach: ReachRow[];
  completeness: CompletenessRow[];
  terms: TermRow[];
  progress: Progress;
  performance: Record<string, number>;
  bandByTerm: BandByTerm;
  subjects: SubjectRow[];
  roster: RosterRow[];
  issues: IssueRow[];
  issueSummary: IssueSummaryRow[];
  schools: string[];
}
