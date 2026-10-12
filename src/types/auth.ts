import type { Role } from '../lib/access';

/** The signed-in user. `role` is the single source of truth for the menu. */
export interface AuthUser {
  email: string;
  name: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}
