import { hasRawPermission } from './permissions';

/**
 * Determines the default entry point for an Administrative user (Admin/Staff)
 * based on their specific functional permissions.
 */
export function getDefaultAdminRoute(user: { role: string; permissions?: string[] } | null | undefined): string {
  if (!user) return '/auth/login';

  const role = user.role.toUpperCase();

  // Super Admins and Admins have full access, so they go to Dashboard by default
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return '/admin/dashboard';
  }

  // Staff members follow the permission hierarchy
  if (hasRawPermission(user, 'VIEW_ANALYTICS')) return '/admin/dashboard';
  if (hasRawPermission(user, 'MANAGE_USERS')) return '/admin/users';
  if (hasRawPermission(user, 'MANAGE_CONTENT')) return '/admin/sessions'; // Tracks/Lessons
  if (hasRawPermission(user, 'MANAGE_PACKAGES')) return '/admin/bundles';
  if (hasRawPermission(user, 'MANAGE_TICKETS')) return '/admin/support';
  if (hasRawPermission(user, 'MANAGE_QUIZZES')) return '/admin/quizzes';
  if (hasRawPermission(user, 'MANAGE_CERTIFICATES')) return '/admin/certificates';
  if (hasRawPermission(user, 'MANAGE_ROLES')) return '/admin/roles';
  if (hasRawPermission(user, 'MANAGE_SETTINGS')) return '/admin/settings';

  // Absolute fallback
  return '/admin/profile';
}
