import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import type { RoleDashboardConfig } from './dashboardRoleConfig.types';
import type { DashboardUserSnippet } from './dashboardRoleConfig.types';
import { SideNav } from './SideNav';
import { HeaderNav } from './HeaderNav';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { cn } from '../../lib/cn';

export interface DashboardLayoutProps {
  roleConfig: RoleDashboardConfig;
  children: ReactNode;
  user: DashboardUserSnippet;
  /*
  */
  shellTitle: string;
  /** Current page title derived from route / nav. */
  activeModuleName: string;
  languageToggleLabel: string;
  onLanguageToggle: () => void;
  logoutLabel: string;
  onLogout: () => void;
  notificationsLabel: string;
  onNotificationsClick?: () => void;
  notificationComponent?: ReactNode;
  collapseExpandAriaLabel: string;
  /** Enable desktop sidebar collapse + offset animation. */
  enableSidebarCollapse?: boolean;
  /** Optional class for `<main>` (e.g. parent portal warm canvas). */
  mainClassName?: string;
  /** Profile / settings link in header menu. */
  profileSettingsPath?: string;
  /** Show avatar/name dropdown in header (sidebar may still show profile). */
  showHeaderProfileMenu?: boolean;
}

import { DashboardFooter } from '../admin/DashboardFooter';

/**
 * Modular RTL-first dashboard shell: fixed **inline-start** sidenav (physical right in `dir="rtl"`),
 * themed header, soft main canvas.
 */
export function DashboardLayout({
  roleConfig,
  children,
  user,
  shellTitle,
  activeModuleName,
  languageToggleLabel,
  onLanguageToggle,
  logoutLabel,
  onLogout,
  notificationsLabel,
  onNotificationsClick,
  notificationComponent,
  collapseExpandAriaLabel,
  enableSidebarCollapse = true,
  mainClassName,
  profileSettingsPath = '/admin/profile',
  showHeaderProfileMenu = true,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidthClass = collapsed ? 'lg:w-20' : 'lg:w-72';
  const mainOffsetClass = collapsed ? 'lg:ms-20' : 'lg:ms-72';

  const sideConfig = {
    sidebarBgClass: roleConfig.sidebarBgClass,
    sidebarActiveClass: roleConfig.sidebarActiveClass,
    sidebarMutedClass: roleConfig.sidebarMutedClass,
    roleBadgeLabel: roleConfig.roleBadgeLabel,
    brandSubtitle: roleConfig.brandSubtitle,
    brandAccentClass: roleConfig.brandAccentClass,
    brandBadgeClass: roleConfig.brandBadgeClass,
    brandAvatarTintClass: roleConfig.brandAvatarTintClass,
  };

  const drawerSideNav = (
    <SideNav
      config={sideConfig}
      links={roleConfig.links}
      user={user}
      collapsed={false}
      languageToggleLabel={languageToggleLabel}
      onLanguageToggle={() => {
        onLanguageToggle();
        setMobileOpen(false);
      }}
      logoutLabel={logoutLabel}
      onLogout={() => {
        onLogout();
        setMobileOpen(false);
      }}
      onNavigate={() => setMobileOpen(false)}
    />
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop: fixed sidenav on inline-start (RTL → visual right) */}
      <aside
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:start-0 lg:z-40 lg:flex lg:flex-col lg:border-e lg:border-white/10',
          sidebarWidthClass,
          'transition-all duration-300'
        )}
      >
        <SideNav
          config={sideConfig}
          links={roleConfig.links}
          user={user}
          collapsed={enableSidebarCollapse && collapsed}
          languageToggleLabel={languageToggleLabel}
          onLanguageToggle={onLanguageToggle}
          logoutLabel={logoutLabel}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile top strip */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="truncate text-sm font-extrabold text-slate-800">New-Academy</span>
        <Button variant="ghost" size="icon" onClick={onLanguageToggle} aria-label={languageToggleLabel}>
          <span className="text-xs font-bold">{languageToggleLabel}</span>
        </Button>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          className={cn(
            'fixed inset-y-0 inset-s-0 w-[min(92vw,320px)] translate-x-0 translate-y-0 rounded-none border-0 border-e border-white/10 p-0',
            roleConfig.sidebarBgClass ?? 'bg-slate-900'
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
            <span className="text-sm font-extrabold">New-Academy</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </Button>
          </div>
          {drawerSideNav}
        </DialogContent>
      </Dialog>

      <div className={cn('min-h-screen flex flex-col transition-all duration-300', mainOffsetClass)}>
        <HeaderNav
          config={roleConfig}
          shellTitle={shellTitle}
          activeModuleName={activeModuleName}
          user={user}
          notificationsLabel={notificationsLabel}
          onNotificationsClick={onNotificationsClick}
          notificationComponent={notificationComponent}
          onLanguageToggle={onLanguageToggle}
          sidebarCollapsed={collapsed}
          onToggleSidebar={enableSidebarCollapse ? () => setCollapsed((c) => !c) : undefined}
          collapseExpandAriaLabel={collapseExpandAriaLabel}
          profileSettingsPath={profileSettingsPath}
          showHeaderProfileMenu={showHeaderProfileMenu}
        />
        <main
          className={cn(
            'flex-1 p-6 transition-colors duration-300',
            mainClassName ?? 'bg-slate-50'
          )}
        >
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
