import type { User } from '../store/useAuthStore';
import { isAdminPanelUser } from './permissions';

type BackendUser = {
  id: string;
  fullName: string;
  email?: string;
  username?: string;
  role: string;
  customRole?: { permissions: unknown } | null;
};

function normalizePermissions(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((p): p is string => typeof p === 'string');
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Maps `/api/auth/login` user payload into the Zustand `User` shape. */
export function mapBackendUserToStore(u: BackendUser): User {
  const roleLower = u.role.toLowerCase();
  let permissions = normalizePermissions(u.customRole?.permissions);

  const roleUpper = u.role.toUpperCase();
  if (roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN') {
    // Admin/Super Admin bypass is handled via role checks in hasPermission()
    // No need to populate a static permission array in the store.
    permissions = [];
  }

  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: roleLower,
    permissions,
  };
}
