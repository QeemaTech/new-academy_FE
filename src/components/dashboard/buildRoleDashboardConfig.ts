import type { TFunction } from 'i18next';
import type { ComponentType } from 'react';
import type { RoleDashboardConfig, DashboardNavLink } from './dashboardRoleConfig.types';

export interface BuildNavSourceItem {
  id: string;
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  visible?: boolean;
}

const themes: Record<
  'super_admin' | 'parent' | 'child' | 'custom' | 'teacher',
  Pick<RoleDashboardConfig, 'themeColorClass' | 'headerBorderClass' | 'sidebarActiveClass'> & {
    brandSubtitleKey?: string;
    sidebarBgClass?: string;
    sidebarMutedClass?: string;
    brandAccentClass?: string;
    brandBadgeClass?: string;
    brandAvatarTintClass?: string;
  }
> = {
  super_admin: {
    themeColorClass: 'bg-blue-600',
    headerBorderClass: 'border-blue-700/30',
    sidebarActiveClass: 'bg-blue-600/20 text-blue-200',
    brandSubtitleKey: 'Admin.shell.brandSubtitle',
  },
  parent: {
    themeColorClass:
      'bg-gradient-to-r from-[#06122b] from-[8%] via-[#0b2a5c] to-[#0f766e]',
    headerBorderClass: 'border-[#2dd4bf]/18',
    sidebarActiveClass: 'bg-white/10 text-white ring-1 ring-white/10',
    brandSubtitleKey: undefined,
    sidebarBgClass:
      'bg-gradient-to-b from-[#050c1f] via-[#071a3c] to-[#062a2a]',
    sidebarMutedClass: 'text-slate-100/75 hover:bg-white/8 hover:text-white',
    brandAccentClass: 'text-[#2dd4bf]',
    brandBadgeClass: 'border border-white/10 bg-white/7 text-white/90',
    brandAvatarTintClass: 'bg-white/10 text-white',
  },
  child: {
    themeColorClass: 'bg-[#4178EF]',
    headerBorderClass: 'border-[#3264D6]/35',
    sidebarActiveClass: 'bg-white/18 text-white',
    brandSubtitleKey: undefined,
    sidebarBgClass: 'bg-gradient-to-b from-[#5a8af5] to-[#3568d4]',
    sidebarMutedClass: 'text-white/75 hover:bg-white/12 hover:text-white',
  },
  custom: {
    themeColorClass: 'bg-slate-700',
    headerBorderClass: 'border-slate-800/30',
    sidebarActiveClass: 'bg-slate-600/25 text-slate-100',
    brandSubtitleKey: undefined,
  },
  teacher: {
    themeColorClass:
      'bg-gradient-to-r from-slate-900 from-[8%] via-emerald-950 to-emerald-800',
    headerBorderClass: 'border-emerald-900/35',
    sidebarActiveClass: 'bg-white/12 text-white ring-1 ring-white/10',
    brandSubtitleKey: undefined,
    sidebarBgClass:
      'bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950',
    sidebarMutedClass: 'text-emerald-50/75 hover:bg-white/8 hover:text-white',
    brandAccentClass: 'text-emerald-400',
    brandBadgeClass: 'border border-emerald-500/25 bg-emerald-500/15 text-emerald-100',
    brandAvatarTintClass: 'bg-emerald-500/20 text-emerald-200',
  },
};

/**
 * Builds a {@link RoleDashboardConfig} from the authenticated panel role and resolved nav items.
 * Theme tokens are resolved from {@link themes} below.
 */
export function buildRoleDashboardConfig(
  panelRole: 'super_admin' | 'parent' | 'child' | 'custom' | 'teacher',
  params: {
    t: TFunction;
    roleBadgeLabel: string;
    /** Optional subtitle under logo; falls back to role badge when omitted. */
    brandSubtitle?: string;
    searchPlaceholder: string;
    links: BuildNavSourceItem[];
  }
): RoleDashboardConfig {
  const th = themes[panelRole];
  const links: DashboardNavLink[] = params.links.map((l) => ({
    id: l.id,
    path: l.path,
    label: l.label,
    icon: l.icon,
    visible: l.visible,
  }));

  const brandSubtitle =
    params.brandSubtitle ??
    (th.brandSubtitleKey ? params.t(th.brandSubtitleKey) : params.roleBadgeLabel);

  return {
    id: panelRole,
    roleName: panelRole,
    roleBadgeLabel: params.roleBadgeLabel,
    themeColorClass: th.themeColorClass,
    headerBorderClass: th.headerBorderClass,
    headerForegroundClass: 'text-white',
    sidebarBgClass: th.sidebarBgClass ?? 'bg-slate-800',
    sidebarActiveClass: th.sidebarActiveClass,
    sidebarMutedClass: th.sidebarMutedClass ?? 'text-slate-300 hover:bg-slate-700/50 hover:text-white',
    brandSubtitle,
    searchPlaceholder: params.searchPlaceholder,
    brandAccentClass: th.brandAccentClass,
    brandBadgeClass: th.brandBadgeClass,
    brandAvatarTintClass: th.brandAvatarTintClass,
    links,
  };
}
