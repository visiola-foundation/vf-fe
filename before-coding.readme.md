# Visiola Foundation — MIS Dashboard: Before-Coding Brief

> Read this first. It explains what this project is, why it exists, what has
> been built so far, and how the backend will plug in later.
> Companion doc: `README.md` (how to run / build / integrate).

---

## 1. What this project is all about

### 1.1 The organisation
The Visiola Foundation runs education programmes for girls (After-School
Clubs — ASCG, Coding Boot Camp — CBC, and others). Staff need one trusted
place to see **reach/enrolment, academic outcomes, data quality, and the
student register** — that place is the Management Information System (MIS).

### 1.2 The starting point
A single self-contained file, `VF_MIS_Dashboard.html` (~520 KB inline
`const DATA = {...}` blob + inline CSS + inline render script), with:

- 9 pages: **Overview, Reach and enrolment, ASCG academic, Coding Boot Camp,
  Programme 3, Student register, Data quality, Board summary, Metrics to add**
- Brand tokens sampled from the Foundation logo
  (`--vf-blue #00A3DA`, `--vf-green #9EC83E`, `--vf-red #D8232A`,
  `--vf-purple #958EB8`)
- Signature elements: KPI cards with coloured left accents, fill **gauges**,
  hatched `Blank` (means *"we do not have this data"* — never a zero/dash),
  pills, notices, sticky tables, hand-drawn SVG charts
- A role switcher pill (Key staff / Programme staff / Board) driving a
  role-based menu
- An editable student register with dirty-cell tracking and CSV export

### 1.3 Why a React port
The single file cannot grow: no routing, no data-fetching story, no auth
story, no component reuse, no tests, painful to connect to a real backend.
The React port keeps **pixel/copy/behaviour fidelity** while giving us:

- **React Router** for navigation (deep-linkable, back-button-safe URLs)
- **TanStack Query** for server state (loading / error / refetch / optimistic
  mutations / cache invalidation)
- **Tailwind CSS v4** for styling (brand tokens as `@theme`, utilities
  everywhere else)
- A **backend-ready data layer** that runs UI-only today and switches to HTTP
  with one env var, touching zero components
- A **real login page** where the signed-in user's role drives the menu
  (the old header role-switcher is gone by design)

### 1.4 Non-goals (for now)
No backend implementation, no real user store, no pagination/virtualisation
on the register, no chart library, no test suite. UI-only with clean seams
for all of the above.

---

## 2. Stack and conventions

| Choice | Version | Notes |
| --- | --- | --- |
| React + TypeScript (Vite) | React 18, TS 5.7 | `npm run build` = `tsc --noEmit && vite build` |
| React Router | v7 (`react-router-dom`) | `/:page` under a session guard; register filters as search params |
| TanStack Query | v5 | `['session']`, `['mis-data']`, `['register-edits']` keys in `src/queries/keys.ts` |
| Tailwind CSS | v4 (+ `@tailwindcss/vite`) | tokens in `@theme` (`src/index.css`); `hatch` utility; `fetch-bar` keyframes |
| No chart lib | — | `BarChart` / `LineChart` / `StackBar` replicate the original SVG maths, work offline |

Conventions: one file per page under `src/pages/`; layout in
`src/components/layout/`; register widgets in `src/components/register/`;
shared UI in `src/components/ui/`; domain helpers in `src/lib/`; server state
only in `src/queries/`; typed dataset in `src/types/mis.ts`, session user in
`src/types/auth.ts`. No placeholders — every shipped component renders.

---

## 3. Access model (single source of truth)

Defined once in `src/lib/access.ts`, shared by the rail and the router guard.
Mirrors the intended SQL grants — the database enforces for real, this only
decides what the interface offers.

```
admin (Key staff)       : overview reach ascg cbc prog3 register quality board proposed  (9)
staff (Programme staff) : overview reach ascg cbc prog3         quality        proposed  (7)
board (Board)           :                                              board              (1)
```

- `pagesForRole(role)` renders the rail menu (group headers only when the
  role has pages in that group: Programmes / Records / Governance).
- `canAccess(role, page)` + `firstAllowedPage(role)` drive the router guard.
- Disallowed pages are **hidden**, not disabled; guessing a URL redirects to
  the session role's first allowed page.
- Board accounts see aggregate figures only — never individual records.

---

## 4. All work done so far (chronological)

### Phase 1 — React + Router + Query + Tailwind scaffold
- Initialised Vite React-TS app (`vf-mis-dashboard` 1.0.0), added
  `react-router-dom@7`, `@tanstack/react-query@5`, `tailwindcss@4`.
- Extracted the inline `DATA` blob from `VF_MIS_Dashboard.html` into
  `public/data/mis-dashboard.json` via `scripts/extract-data.mjs`
  (`npm run extract-data`); copied logo to `public/logo.jpg`.
- Typed the whole dataset in `src/types/mis.ts`
  (totals, reach, completeness, terms, progress, performance, bandByTerm,
  subjects, roster, cbc, prog3, quality, boardSummary, proposed).
- Built shared UI: `primitives.tsx` (Kpi, Gauge, Notice, Pill, Blank, Legend,
  Eyebrow…), `table.tsx`, `layout.tsx`, `charts.tsx` (Bar/Line/StackBar),
  `skeleton.tsx` (PageSkeleton, ErrorPanel).

### Phase 2 — Nine pages, copy-faithful
- `src/pages/Overview.tsx` — headline KPIs, completeness gauges, term means.
- `src/pages/Reach.tsx` — enrolment by year joined (new vs returning), table.
- `src/pages/Ascg.tsx` — term means, progress Improved/Stable/Declined,
  band-by-term stacks, subject table with trend arrows.
- `src/pages/Cbc.tsx`, `src/pages/Prog3.tsx` — boot-camp / programme-3 views.
- `src/pages/Register.tsx` + `components/register/*` — searchable, filterable
  student register; contentEditable cells (`EditableCell`); locked derived
  columns; missing-data toggle; dirty tracking; CSV export of touched rows
  (`src/lib/csv.ts`); mutations via `src/queries/useRegister.ts`
  (`useSaveCell`, `useAddStudent`) with optimistic updates + rollback.
- `src/pages/Quality.tsx` — completeness table, match-status breakdown,
  issue counts.
- `src/pages/Board.tsx` — aggregate-only summary (no individual records).
- `src/pages/Proposed.tsx` — metrics-to-add backlog.
- Hatch rule enforced everywhere: missing ⇒ hatched `Blank`, never `0`/`—`.

### Phase 3 — Role-based menu (no login yet)
- Centralised `ACCESS` map in `src/lib/access.ts`; added
  `pagesForRole()`; `Rail` rendered only the URL role's pages; route guard
  redirected disallowed pages to the role's first page.

### Phase 4 — Login page; session drives everything (current)
- New: `src/types/auth.ts` (`AuthUser`, `LoginInput`).
- New: `src/lib/api/auth.ts` — `login()`, `restoreSession()`, `logout()`,
  demo users, documented `/auth/*` contract; session persisted to
  localStorage (`vf-mis.session`).
- `src/lib/api/client.ts` — token store (`vf-mis.token`, memory + storage),
  `Authorization: Bearer` injection, 401 handling (drop token, force
  re-login), JSON `{message}` error surfacing.
- New: `src/queries/useSession.ts` — `useSession()` (`['session']`),
  `useLogin()`, `useLogout()` (clears session + dashboard + register-edits
  so no data leaks between users).
- New: `src/pages/Login.tsx` (`/login`, email+password, demo-role picker
  that vanishes when a backend exists, error `Notice`, pending state,
  `state.from` redirect) and `src/pages/RequireAuth.tsx` (`RequireAuth`
  guard + branded `SessionSplash`).
- Routes changed `/:role/:page` → `/:page` under the guard; `/` → session
  role's first page. `AppLayout` reads role from session, `Rail` takes a
  `role` prop, `TopBar` shows `name · role` + Sign out (old role-switcher
  pill deleted). `Footer` shows signed-in role; "session only" wording kept.
- Verified: `tsc --noEmit` exit 0, `vite build` 120 modules green, bundle
  contains all auth strings.

---

## 5. Project layout (what lives where)

```
public/data/mis-dashboard.json  bundled snapshot (stand-in for GET /mis/dashboard)
public/logo.jpg                  header / login / splash logo
scripts/extract-data.mjs         re-extract snapshot from the original HTML
src/main.tsx                     QueryClient + RouterProvider bootstrap
src/routes.tsx                   /login (public); / and /:page under RequireAuth
src/types/mis.ts                 dataset types
src/types/auth.ts                AuthUser / LoginInput
src/lib/access.ts                Role, PageId, ACCESS, ROLES, PAGES + helpers
src/lib/api/config.ts            VITE_API_BASE_URL switch (isBackendConfigured)
src/lib/api/client.ts            token store, ApiError, apiRequest() wrapper
src/lib/api/auth.ts              login / restoreSession / logout + contract docs
src/lib/api/shared.ts            snapshot loader, withParams, getOrFallback
src/lib/api/overview.ts          fetchOverview
src/lib/api/reach.ts             fetchReach
src/lib/api/ascg.ts              fetchAscgAcademic
src/lib/api/cbc.ts               CBC summary / graduates / outcomes
src/lib/api/register.ts          fetchDashboard (v0) + schools / students / export
src/lib/api/quality.ts           quality summary / issues / resolve
src/lib/api/board.ts             board summary / spend / metric proposals
src/lib/api/index.ts             barrel
src/lib/format.ts                number/date formatting
src/lib/csv.ts                   register CSV export
src/lib/registerColumns.ts       column defs (which are editable)
src/queries/keys.ts              ['session'] + per-resource ['mis', …] keys
src/queries/useMisData.ts        v0 monolith query (pages migrate off it)
src/queries/usePages.ts          useOverview/useReach/useAscgAcademic/useCbc*/…
src/queries/useRegister.ts       schools / register page / cell save + add-student…
src/queries/useSession.ts        session query + login/logout mutations
src/components/ui/*              primitives, table, layout, charts, skeleton
src/components/layout/*         AppLayout, RequireAuth-adjacent TopBar/Rail/Footer
src/components/register/*        EditableCell, RegisterTable, RegisterControls
src/pages/*                      9 pages + Login + RequireAuth
src/index.css                    Tailwind v4 tokens, hatch, fetch-bar
.env.example                     VITE_API_BASE_URL (empty = UI-only demo)
```

---

## 6. Backend provisions (UI-only today, zero component changes later)

Set `VITE_API_BASE_URL` (see `.env.example`); `isBackendConfigured`
(`src/lib/api/config.ts`) flips every resource from snapshot to HTTP:

| Function | UI-only | Backend |
| --- | --- | --- |
| `fetchDashboard(signal)` (v0 monolith, `api/register.ts`) | `public/data/mis-dashboard.json` | `GET /mis/dashboard` → `MisData` |
| `fetchOverview(signal)` | derived from snapshot | `GET /mis/overview` → `OverviewPayload` |
| `fetchReach(params, signal)` | filtered snapshot (`programme !== 'ascg'` → `[]`) | `GET /mis/reach?…` → `ReachPayload` |
| `fetchAscgAcademic(params, signal)` | snapshot terms/progress/bands/subjects | `GET /mis/ascg/academic?cohort=` → `AscgAcademicPayload` |
| `fetchCbcSummary` / `fetchCbcGraduates` / `fetchCbcGraduate` / `createCbcGraduate` / `patchCbcGraduate` / `fetchCbcOutcomes` / `createCbcOutcome` | empty summary/lists (never carried-over data) | `GET/POST/PATCH /mis/cbc/*` → `CbcSummary`, `Paged<CbcGraduate>`, `CbcGraduate`, `CbcOutcome[]`, `CbcOutcome` |
| `fetchSchools` / `fetchRegisterPage(filters)` / `fetchStudent` | filtered + paginated snapshot | `GET /mis/schools`, `GET /mis/students?…` → `string[]`, `Paged<RosterRow>`, `RosterRow` |
| `saveRegisterCell({uid, field, value})` | no-op (local optimistic only) | `PATCH /mis/students/:uid/fields/:field {value}` |
| `createRegisterStudent()` | local blank row | `POST /mis/students {}` → `{uid?}` |
| `exportRegisterEdits(edits, localRows)` | local CSV Blob | `POST /mis/students/export {edits}` → CSV download |
| `fetchQualitySummary` / `fetchQualityIssues` / `resolveQualityIssue` | derived snapshot / no-op | `GET /mis/quality/summary`, `GET /mis/quality/issues?…`, `PATCH /mis/quality/issues/:id/resolve` |
| `fetchBoardSummary` (aggregate-only) / `fetchProgrammeSpend` / `fetchMetricProposals` | snapshot aggregates / `[]` | `GET /mis/board-summary`, `GET /mis/finance/spend?…`, `GET /mis/metrics-proposals` |
| `login({email, password})` | demo users, any password | `POST /auth/login` → `{token, user}` |
| `restoreSession()` | stored demo user | stored user revalidated via `GET /auth/me` |
| `logout()` | clear local | `POST /auth/logout` (best-effort) then clear local |

Auth details: token in `vf-mis.token` (memory + localStorage), sent as
`Authorization: Bearer`; 401 clears it and forces `/login`. Session user in
`vf-mis.session`. Add refresh-token / interceptors once in
`apiRequest()` — every resource follows. When the payload grows, split the
dashboard into per-resource queries using the key factory in
`src/queries/keys.ts`. Backend owns role assignment and enforcement; the
frontend `ACCESS` map only decides what the interface offers.

Demo accounts (UI-only; unknown emails are rejected with a helpful error):
`key.staff@visiola.local` → admin, `programme.staff@visiola.local` → staff,
`board@visiola.local` → board.

## 7. Loading / error / saving states

All live today, including against the bundled snapshot:

- `PageSkeleton` (`role="status"`, `aria-busy`) — KPI row + chart + table
  shape on first load of any page.
- `FetchIndicator` — thin indeterminate bar during background refetch after
  first load (`query.isFetching`).
- `ErrorPanel` — message + **Try again** → `query.refetch()` (test by blocking
  `/data/mis-dashboard.json` or throttling the network).
- `SessionSplash` — logo + progress bar while the session restores; `null`
  (no flash of app chrome) for signed-in users hitting `/login`.
- Login: `Signing in…` disabled state; failures surface in an `err Notice`.
- Register: `Saving…`, Add/Export disabled while pending, optimistic updates,
  server rejection rolls back with an `err Notice`.
- `useMisData`: `staleTime: Infinity`, no refocus/refetch UI-only; 60 s +
  refetch-on-focus + 2 retries once a backend exists.

## 8. How to run

```bash
npm install
npm run dev        # UI-only demo, start at /login
npm run build      # tsc --noEmit && vite build
npm run extract-data  # re-extract snapshot from VF_MIS_Dashboard.html
```

Login demo: pick a role chip (fills the demo email), any password → lands on
that role's home page with its menu; refresh keeps the session; Sign out →
`/login`. Deep-linking a protected page while signed out returns there after
login via `state.from`.

## 9. What's next (not started)

1. Point `VITE_API_BASE_URL` at the real backend; confirm `/auth/*` +
   `/mis/*` paths match `src/lib/api/*` (adjust paths only).
2. Backend assigns/enforces roles; frontend keeps the `ACCESS` mirror.
3. Split dashboard query per resource when the payload grows.
4. Register: pagination/virtualisation, server search, real persistence.
5. Tests, refresh-token rotation, role-aware analytics/audit as needed.


