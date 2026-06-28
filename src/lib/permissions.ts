/** 
 * Standardized Permission Matrix for the Academy LMS Platform.
 * Mirrors the backend logic.
 */

export const PERMISSION_GROUPS = {
  USERS: {
    label: 'إدارة المستخدمين',
    permissions: [
      { key: 'MANAGE_USERS', label: 'إدارة الحسابات (إضافة/تعديل/حذف)' },
      { key: 'VIEW_USERS', label: 'عرض قائمة المستخدمين فقط' },
      { key: 'MANAGE_TICKETS', label: 'إدارة تذاكر الدعم الفني' },
    ],
  },
  CONTENT: {
    label: 'المحتوى الأكاديمي',
    permissions: [
      { key: 'MANAGE_CONTENT', label: 'إدارة المسارات والدروس (CMS)' },
      { key: 'MANAGE_QUIZZES', label: 'إدارة الاختبارات والتقييمات' },
      { key: 'MANAGE_CERTIFICATES', label: 'إدارة الشهادات والجوائز' },
    ],
  },
  SALES: {
    label: 'المبيعات والماليات',
    permissions: [
      { key: 'MANAGE_PACKAGES', label: 'إدارة الباقات والعروض المجمعة' },
      { key: 'MANAGE_COUPONS', label: 'إدارة كوبونات الخصم' },
      { key: 'VIEW_FINANCIALS', label: 'عرض المدفوعات والاشتراكات' },
    ],
  },
  SYSTEM: {
    label: 'إدارة النظام',
    permissions: [
      { key: 'MANAGE_ROLES', label: 'إدارة الأدوار والصلاحيات (RBAC)' },
      { key: 'MANAGE_SETTINGS', label: 'إدارة إعدادات النظام العامة' },
      { key: 'VIEW_ANALYTICS', label: 'عرض لوحة البيانات والتقارير' },
    ],
  },
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flatMap((group) =>
  group.permissions.map((p) => p.key)
);

export type PermissionKey = typeof ALL_PERMISSIONS[number];

/** Permission Key Builder */
export const buildPermission = (op: string, resource?: string): string =>
  resource ? `${op}_${resource}` : op;

/** Checks if a user has a specific granular permission */
export function hasPermission(
  user: { role: string; permissions?: string[] } | null | undefined,
  operation: string,
  resource?: string
): boolean {
  if (!user) return false;
  
  const role = user.role?.toUpperCase();
  
  // [Bypass] Admin and Super Admin roles ignore all matrix checks
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return true;
  }
  
  // [Staff Check] Staff users are gated by their permissions array
  if (role === 'STAFF') {
    const perm = buildPermission(operation, resource);
    return !!user.permissions?.includes(perm);
  }
  
  return false;
}

/** Legacy support for single-string checks if needed during migration */
export function hasRawPermission(
  user: { role: string; permissions?: string[] } | null | undefined,
  permission: string
): boolean {
  if (!user) return false;
  const role = user.role?.toUpperCase();
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;
  return !!user.permissions?.includes(permission);
}

/** Helper to identify administrative users */
export function isAdminPanelUser(role: string) {
  const r = role?.toUpperCase();
  return r === 'ADMIN' || r === 'STAFF' || r === 'SUPER_ADMIN';
}
