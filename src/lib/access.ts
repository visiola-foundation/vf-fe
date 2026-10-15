export type Role = 'admin' | 'staff' | 'board';

export type PageId =
  | 'overview'
  | 'reach'
  | 'ascg'
  | 'cbc'
  | 'sc'
  | 'register'
  | 'quality'
  | 'board'
  | 'proposed';

export interface RoleDef {
  id: Role;
  label: string;
  /** How the role is described in the footer of every page. */
  footer: string;
}

export interface PageDef {
  id: PageId;
  label: string;
  group: string;
}

/* ── Access model. Mirrors the SQL grants; the database is what enforces
      it for real, this only decides what the interface offers. ─────── */
export const ACCESS: Record<Role, PageId[]> = {
  admin: ['overview', 'reach', 'ascg', 'cbc', 'sc', 'register', 'quality', 'board', 'proposed'],
  staff: ['overview', 'reach', 'ascg', 'cbc', 'sc', 'quality', 'proposed'],
  board: ['board'],
};

export const ROLES: RoleDef[] = [
  { id: 'admin', label: 'Key staff', footer: 'key staff' },
  { id: 'staff', label: 'Programme staff', footer: 'programme staff' },
  { id: 'board', label: 'Board', footer: 'Board member' },
];

export const PAGES: PageDef[] = [
  { id: 'overview', label: 'Overview', group: 'Programmes' },
  { id: 'reach', label: 'Reach and enrolment', group: 'Programmes' },
  { id: 'ascg', label: 'ASCG academic', group: 'Programmes' },
  { id: 'cbc', label: 'Coding Boot Camp', group: 'Programmes' },
  { id: 'sc', label: 'STEM Camp', group: 'Programmes' },
  { id: 'register', label: 'Student register', group: 'Records' },
  { id: 'quality', label: 'Data quality', group: 'Records' },
  { id: 'board', label: 'Board summary', group: 'Governance' },
  { id: 'proposed', label: 'Metrics to add', group: 'Governance' },
];

export const DEFAULT_ROLE: Role = 'admin';

export function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'staff' || value === 'board';
}

export function isPage(value: unknown): value is PageId {
  return PAGES.some((p) => p.id === value);
}

export function canAccess(role: Role, page: PageId): boolean {
  return ACCESS[role].includes(page);
}

export function firstAllowedPage(role: Role): PageId {
  return ACCESS[role][0];
}

export function roleLabel(role: Role): string {
  return ROLES.find((r) => r.id === role)?.footer ?? role;
}

/**
 * Role-based menu: only the pages this role may actually open.
 * Keeps the `PAGES` ordering so groups stay in the same order.
 */
export function pagesForRole(role: Role): PageDef[] {
  const allowed = ACCESS[role];
  return PAGES.filter((p) => allowed.includes(p.id));
}
