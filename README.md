# Visiola Foundation — MIS Dashboard (React port)

A React port of the original single-file `VF_MIS_Dashboard.html`. Same nine pages,
data, copy, access rules and hand-drawn SVG charts — rebuilt as a componentised SPA.

## Stack

- **React 18 + TypeScript** (Vite)
- **React Router v7** — navigation; session guard, role from the session, page as path param, register filters as search params
- **TanStack Query v5** — the data snapshot and all register edits live in the query cache
- **Tailwind CSS v4** — brand tokens defined with `@theme`; the rest is utility classes

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit && vite build
npm run preview  # serve the production build
```

## How the data is wired

The original dashboard carried a ~520 KB `const DATA = {…}` blob inline. That is
extracted once into a static asset the app fetches at runtime:

```bash
npm run extract-data   # reads VF_MIS_Dashboard.html -> public/data/mis-dashboard.json + public/logo.jpg
```

- `public/data/mis-dashboard.json` — the whole dataset (totals, reach, roster, issues…)
- `public/logo.jpg` — decoded from the base64 data-url that used to sit in `DATA.logo`

`useMisData()` (`src/queries/useMisData.ts`) fetches it. In UI-only mode it is cached
forever (the snapshot is static); once a backend is configured it behaves like a normal
server query (60 s staleness, refetch on focus, retries).

## Backend integration

The app is written so a backend drops in **without touching any component**:

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
2. That is it. With the variable set, `isBackendConfigured` becomes true and every call
   routes through the HTTP client instead of the local snapshot.

The data layer is a small, swappable module:

```
src/lib/api/
├─ config.ts   API_BASE_URL + isBackendConfigured (the on/off switch)
├─ client.ts   token store + ApiError + apiRequest() — the single fetch wrapper
│              (Bearer header, 401 handling, interceptors…)
├─ auth.ts     login / restoreSession / logout (demo personas in UI-only mode)
├─ shared.ts   snapshot loader + withParams + getOrFallback
├─ overview.ts reach.ts ascg.ts cbc.ts register.ts quality.ts board.ts
│              one resource module per page-group (see header comments)
└─ index.ts    barrel
```

Each resource documents its HTTP contract in a header comment and derives the
same payload from the bundled snapshot in UI-only mode. Write functions are
local no-ops in UI-only mode. Point each function at its real path
(e.g. `GET /mis/dashboard`, `PATCH /mis/students/:uid/fields/:field`, `POST /mis/students`)
— the query/mutation wiring, optimistic updates, rollback and caching already expect that
shape.

### Expected backend contract (suggested)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/mis/dashboard` | v0 monolith (whole `MisData` shape) — pages migrate off it one by one |
| `GET` | `/mis/overview` | Overview KPIs + completeness → `OverviewPayload` |
| `GET` | `/mis/reach?year_from=&year_to=&programme=` | Enrolment series → `ReachPayload` |
| `GET` | `/mis/ascg/academic?cohort=` | Terms, progress, bands, subjects → `AscgAcademicPayload` |
| `GET` | `/mis/cbc/summary` | CBC aggregates → `CbcSummary` (empty until records exist) |
| `GET` | `/mis/cbc/graduates?track=&outcome=&page=` | Graduate list → `Paged<CbcGraduate>` |
| `GET/POST/PATCH` | `/mis/cbc/graduates…` | Graduate detail / create / patch |
| `GET/POST` | `/mis/cbc/outcomes…` | Outcomes (`months_after=6\|12`) |
| `GET` | `/mis/schools` | School names for register filters |
| `GET` | `/mis/students?q=&school=&match=&missing_consent=&page=&page_size=` | Paginated register → `Paged<RosterRow>` |
| `GET` | `/mis/students/:uid` | One student → `RosterRow` |
| `PATCH` | `/mis/students/:uid/fields/:field` | Update one register cell `{ value }` |
| `POST` | `/mis/students` | Create a blank student; returns `{ uid }` |
| `POST` | `/mis/students/export` | Export session edits `{ edits }` → CSV download |
| `GET` | `/mis/quality/summary` | Issue/error counts → `QualitySummary` |
| `GET` | `/mis/quality/issues?severity=&field=&page=` | Issue log → `Paged<IssueRow>` |
| `PATCH` | `/mis/quality/issues/:id/resolve` | Mark resolved `{ resolved }` |
| `GET` | `/mis/board-summary` | Aggregate-only board figures → `BoardSummaryPayload` |
| `GET` | `/mis/finance/spend?programme=&year=` | Programme spend (empty until finance data exists) |
| `GET` | `/mis/metrics-proposals` | Metrics backlog (static today) |
| `POST` | `/auth/login` | Sign in `{ email, password }` → `{ token, user: { email, name, role } }` |
| `GET` | `/auth/me` | Revalidate the session (Bearer token) → `{ email, name, role }` |
| `POST` | `/auth/logout` | Sign out (best-effort) → `204` |

Per-page hooks already wrap these (`src/queries/usePages.ts`,
`useSchools`/`useRegisterPage`/`useExportRegisterEdits` in
`src/queries/useRegister.ts`, CBC/quality mutations) with UI-only fallbacks —
pages migrate from `useMisData()` to them one by one. Keys live in
`src/queries/keys.ts` (`['mis', …]` per resource).

### Loading, error and saving states

- **Loading** — `PageSkeleton` (`src/components/ui/skeleton.tsx`) mirrors a page's shape
  (title, KPI row, chart, table) while the payload is in flight, with `role="status"` /
  `aria-busy` for assistive tech.
- **Background refetch** — a thin indeterminate bar (`FetchIndicator`) shows above the page
  while `isFetching` is true after the first load.
- **Error** — `ErrorPanel` renders the message with a **Try again** button wired to
  `query.refetch()`.
- **Saving** — register writes are optimistic; the stat line shows *Saving…* and the
  Add/Export buttons disable while a mutation is pending. If a backend rejects a write the
  optimistic change is **rolled back** and a notice explains why.

These states all work against the bundled snapshot too: throttle the network or block
`/data/mis-dashboard.json` to see the skeleton and error panel.


### Register edits (TanStack Query as state)

The student register is the only interactive data page. Edits are **session only**, just
like the original:

- `useSaveCell()` and `useAddStudent()` (`src/queries/useRegister.ts`) apply optimistic
  updates straight into the `['mis-data']` cache via `queryClient.setQueryData`.
- A separate `['register-edits']` cache entry holds the set of `uid|field` pairs that were
  touched; it drives the "N edited" counter and the CSV export.
- "Export changes as CSV" writes a CSV of only the touched rows, in the original column
  order (`src/lib/csv.ts`).

## Auth & routing

`/login` is public. Everything else sits behind `RequireAuth`
(`src/pages/RequireAuth.tsx`), which restores the session (`useSession` /
`restoreSession`), shows a branded `SessionSplash` while restoring, and sends
signed-out users to `/login` remembering where they were headed (`state.from`).

The role comes from the session — never from the URL:

| URL | Behaviour |
| --- | --- |
| `/login` | sign-in form; signed-in users bounce to their home page |
| `/` | requires auth → redirects to the session role's first allowed page |
| `/:page` | `page` one of the nine pages; disallowed for the session role → redirects to that role's first allowed page |
| anything else | requires auth; `/login` when signed out |

`Login` (`src/pages/Login.tsx`) posts email + password through `useLogin()`. In
UI-only mode any password works against three demo personas picked with a role
switcher (`key.staff@visiola.local`, `programme.staff@visiola.local`,
`board@visiola.local`); the picker disappears once a backend is configured and
the server assigns the role from the credentials. The `TopBar` shows the signed-in
name/role and a **Sign out** button (`useLogout()` clears the session,
dashboard and register-edit caches so no data leaks between users).

Register filters are kept in the URL (`?q=&school=&match=&missing=1`) so they are
shareable and the back button works.

## Access model

Defined once in `src/lib/access.ts` and shared by the rail and the router guard:

```
admin : overview reach ascg cbc prog3 register quality board proposed
staff : overview reach ascg cbc prog3          quality        proposed
board :                                                       board
```

Disallowed pages are hidden from the rail entirely — each role only sees the
pages it can actually open. Guessing a disallowed URL still redirects to the
session role's first allowed page. The old role-switcher pill in the header is
gone: switching users means signing out and signing back in, so backend
sessions stay honest.

## Project layout

```
src/
├─ components/
│  ├─ layout/   AppLayout, TopBar, Rail, Footer
│  ├─ register/ RegisterControls, RegisterTable, EditableCell
│  └─ ui/       primitives (Card, Kpi, Gauge, Pill, Notice, EmptyState, Cell/Blank),
│               layout (headings, grids, Legend), table, charts
├─ lib/         access, format, csv, api, registerColumns
├─ pages/       one file per page + Login + RequireAuth
├─ queries/     useSession, useMisData, useRegister
├─ types/       mis.ts (typed dataset), auth.ts (session user)
├─ routes.tsx   createBrowserRouter config
└─ main.tsx     QueryClientProvider + RouterProvider
```

## Notes on fidelity

- Blank values render as a hatched `<Blank/>`, never as a zero or dash.
- The three SVG charts (`BarChart`, `LineChart`, `StackBar`) keep the original layout
  maths and need no charting library, so the app works offline.
- Grades/GPA, pills, notices, gauges and "Add student" all match the source behaviour.
- The `age` column is still derived live from date of birth at read time.
