import { Bell, ChevronDown, Globe, PanelRightClose, PanelRightOpen, Search, Settings, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RoleDashboardConfig } from './dashboardRoleConfig.types';
import type { DashboardUserSnippet } from './dashboardRoleConfig.types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/cn';

export interface HeaderNavProps {
  config: Pick<
    RoleDashboardConfig,
    'themeColorClass' | 'headerBorderClass' | 'headerForegroundClass' | 'searchPlaceholder'
  >;
  /** Shown at inline-start (e.g. "لوحة التحكم"). */
  shellTitle: string;
  /** Current section / module name next to the title. */
  activeModuleName: string;
  user: DashboardUserSnippet;
  notificationsLabel: string;
  onNotificationsClick?: () => void;
  notificationComponent?: React.ReactNode;
  onLanguageToggle: () => void;
  /** Desktop sidebar collapse (optional). */
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  collapseExpandAriaLabel: string;
  className?: string;
  /** Account menu — profile / settings destination. */
  profileSettingsPath?: string;
  /** When false, hides the header user avatar/name dropdown (e.g. parent portal keeps profile in sidebar only). */
  showHeaderProfileMenu?: boolean;
}

export function HeaderNav({
  config,
  shellTitle,
  activeModuleName,
  user,
  notificationsLabel,
  onNotificationsClick,
  notificationComponent,
  onLanguageToggle,
  sidebarCollapsed,
  onToggleSidebar,
  collapseExpandAriaLabel,
  className,
  profileSettingsPath = '/admin/profile',
  showHeaderProfileMenu = true,
}: HeaderNavProps) {
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header
      className={cn(
        'h-16 border-b z-40 transition-colors duration-300',
        config.headerBorderClass ?? 'border-white/10',
        config.themeColorClass,
        'text-white',
        className
      )}
    >
      <div className="h-16 flex items-center justify-between px-6 gap-4">
        {/* RTL start: title + active module */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleSidebar && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex text-white hover:bg-white/10 rounded-lg"
              aria-label={collapseExpandAriaLabel}
              onClick={onToggleSidebar}
            >
              {sidebarCollapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
            </Button>
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold opacity-90">{shellTitle}</div>
            <div className="truncate text-base font-black leading-tight">{activeModuleName}</div>
          </div>
        </div>

        {/* Center: search (doesn't affect header height) */}
        <div className="relative hidden sm:block flex-1 max-w-xl">
          <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-white/70" size={16} />
          <Input
            type="text"
            readOnly
            tabIndex={-1}
            placeholder={config.searchPlaceholder}
            aria-label={config.searchPlaceholder}
            className="ps-10 pe-4 py-2 h-10 w-full border border-white/20 rounded-xl text-sm focus:outline-none focus-visible:ring-2 transition-all bg-white/10 text-white placeholder-white focus-visible:ring-white/30"
          />
        </div>

        {/* RTL end: actions + avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {notificationComponent ? (
            notificationComponent
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-lg relative"
              aria-label={notificationsLabel}
              onClick={onNotificationsClick}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 inset-e-2 w-2 h-2 rounded-full border-2 bg-blue-600 border-white/70" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-lg"
            onClick={onLanguageToggle}
            aria-label={t('Admin.shell.toggleLanguage')}
          >
            <Globe className="h-5 w-5" />
          </Button>

          {showHeaderProfileMenu && <div className="h-8 w-px bg-white/20 mx-1 hidden sm:block" />}

          {showHeaderProfileMenu && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-2 ps-2 cursor-pointer group p-1 rounded-xl transition-all border border-transparent shadow-sm hover:shadow-md bg-white/10"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold border shadow-sm transition-transform group-hover:scale-105 bg-white/20 text-white border-white/20">
                  {user.avatarLetter ?? user.fullName?.charAt(0) ?? 'U'}
                </div>
                <div className="hidden lg:flex flex-col items-start leading-tight min-w-0">
                  <span className="text-sm font-bold truncate text-white">{user.fullName}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 truncate">{shellTitle}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={cn('text-white/80 transition-transform duration-300', showProfileMenu ? 'rotate-180' : '')}
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute inset-e-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                          {t('Admin.shell.accountMenu')}
                        </p>
                        <p className="text-sm font-bold text-gray-700 truncate">{user.fullName}</p>
                      </div>

                      <Link
                        to={profileSettingsPath}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors group text-start"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                          <Settings size={16} />
                        </div>
                        <span className="font-semibold">{t('Admin.shell.profileSettings')}</span>
                      </Link>

                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors group text-start"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="p-1.5 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                          <LogOut size={16} />
                        </div>
                        <span className="font-semibold">{t('Auth.logout')}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
