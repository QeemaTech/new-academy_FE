import { Link, useLocation } from 'react-router-dom';
import { Globe, LayoutDashboard, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardNavLink, DashboardUserSnippet, RoleDashboardConfig } from './dashboardRoleConfig.types';
import { cn } from '../../lib/cn';

export interface SideNavProps {
  config: Pick<
    RoleDashboardConfig,
    | 'sidebarBgClass'
    | 'sidebarActiveClass'
    | 'sidebarMutedClass'
    | 'roleBadgeLabel'
    | 'brandSubtitle'
    | 'brandAccentClass'
    | 'brandBadgeClass'
    | 'brandAvatarTintClass'
  > & { brandTitle?: string };
  links: DashboardNavLink[];
  user: DashboardUserSnippet;
  collapsed?: boolean;
  languageToggleLabel: string;
  onLanguageToggle: () => void;
  logoutLabel: string;
  onLogout: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function SideNav({
  config,
  links,
  user,
  collapsed = false,
  languageToggleLabel,
  onLanguageToggle,
  logoutLabel,
  onLogout,
  onNavigate,
  className,
}: SideNavProps) {
  const location = useLocation();
  const bg = config.sidebarBgClass ?? 'bg-[#1e293b]';
  const muted = config.sidebarMutedClass ?? 'text-slate-400 hover:bg-white/5 hover:text-slate-100';
  const activeText = config.sidebarActiveClass?.match(/text-[^\s]+/)?.[0] ?? 'text-white';
  const brandAccent = config.brandAccentClass ?? 'text-blue-500';
  const brandBadge = config.brandBadgeClass ?? 'bg-blue-500/20 text-blue-200';
  const avatarTint = config.brandAvatarTintClass ?? 'bg-blue-500/20 text-blue-300';

  const visibleLinks = links.filter((l) => l.visible !== false);

  return (
    <div className={cn('flex h-full flex-col', bg, 'text-slate-100', className)}>
      {/* Brand header (GoKanary-style) */}
      <div className={cn('h-16 border-b border-white/5 transition-all', collapsed ? 'flex items-center justify-center' : 'hidden lg:flex items-center px-6')}>
        {collapsed ? (
          <LayoutDashboard className={cn('h-6 w-6', brandAccent)} aria-hidden />
        ) : (
          <>
            <span className="text-xl font-black uppercase tracking-tighter text-white">
              New<span className={brandAccent}>Academy</span>
            </span>
            <span
              className={cn(
                'ms-3 text-[9px] font-bold rounded-full px-2 py-0.5 uppercase tracking-widest truncate max-w-[120px]',
                brandBadge
              )}
            >
              {config.roleBadgeLabel}
            </span>
          </>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={cn('flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar', collapsed && 'px-2')}>
        {visibleLinks.map((item) => {
          const active = item.exact 
            ? location.pathname === item.path 
            : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;
          return (
<Link
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group overflow-hidden',
                'no-underline outline-none', // 👈 ده السطر اللي هيحل مشكلة الخط الأزرق
                collapsed && 'justify-center px-2',
                active ? cn('bg-white/10 font-bold', activeText) : cn('text-slate-400 hover:no-underline', muted)
              )}
            >
              {/* Active Indicator (GoKanary Style Pill) */}
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-e-full bg-current"
                />
              )}

              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors z-10',
                  active ? 'text-current' : 'text-slate-400 group-hover:text-white'
                )}
              />
              {!collapsed && <span className="truncate z-10 text-inherit hover:no-underline">{item.label}</span>}

              {/* Collapsed tooltip (GoKanary-style) */}
              {collapsed && (
                <div className="absolute start-full ms-3 px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions & Profile */}
      <div className="p-4 mt-auto border-t border-white/5 space-y-2 bg-black/10">
        
        {/* Profile Snippet (Softened) */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-2xl bg-white/5 shadow-sm">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl font-black',
                avatarTint
              )}
            >
              {user.avatarLetter ?? user.fullName?.charAt(0) ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-slate-100">{user.fullName}</div>
              <div className="truncate text-xs font-medium text-slate-400">{user.email}</div>
            </div>
          </div>
        )}

        {/* Language Toggle */}
        <button
          type="button"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-white/5 hover:text-slate-100 group',
            collapsed && 'justify-center px-3'
          )}
          onClick={onLanguageToggle}
        >
          <Globe className="h-5 w-5 shrink-0 transition-transform group-hover:rotate-12" />
          {!collapsed && <span className="text-sm font-medium">{languageToggleLabel}</span>}
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all group',
            collapsed && 'justify-center px-3'
          )}
          type="button"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
          {!collapsed && <span className="text-sm font-medium">{logoutLabel}</span>}
        </button>
      </div>
    </div>
  );
}