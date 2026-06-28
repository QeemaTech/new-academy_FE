import type { ComponentType } from 'react';

/** Single navigation entry (icon + path + label). */
export interface DashboardNavLink {
  id: string;
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Optional: hide link when false (e.g. permission gate). */
  visible?: boolean;
  /** Optional: only match strictly (no prefix matching). */
  exact?: boolean;
}

/** Logged-in user snippet for header / sidebar footer. */
export interface DashboardUserSnippet {
  fullName: string;
  email: string;
  avatarLetter?: string;
}

/**
 * Full dynamic configuration for the role-based dashboard shell.
 * `themeColorClass` drives the header gradient / accents (Tailwind classes).
 * `sidebarActiveClass` is applied to the active nav item (subtle tint of the theme).
 */
export interface RoleDashboardConfig {
  id: string;
  roleName: string;
  /** Shown on the role badge in the sidebar (e.g. "مدير المنصة"). */
  roleBadgeLabel: string;
  /** Tailwind classes for the top header bar background (e.g. `bg-blue-600` or gradient). */
  themeColorClass: string;
  /** Optional border under header. */
  headerBorderClass?: string;
  /** Text color on header (default: white). */
  headerForegroundClass?: string;
  /** Sidebar surface (default dark slate). */
  sidebarBgClass?: string;
  /** Active nav item background (should harmonize with theme). */
  sidebarActiveClass: string;
  /** Muted nav text + hover. */
  sidebarMutedClass?: string;
  /** Brand row under logo. */
  brandSubtitle?: string;
  links: DashboardNavLink[];
  /** i18n or static placeholder for the unified search field. */
  searchPlaceholder: string;
  /** Optional brand accent (e.g. `text-emerald-400`) for logo + sidebar avatar tint. */
  brandAccentClass?: string;
  /** Role pill next to logo. */
  brandBadgeClass?: string;
  /** Sidebar profile avatar circle (e.g. `bg-emerald-500/20 text-emerald-200`). */
  brandAvatarTintClass?: string;
}
