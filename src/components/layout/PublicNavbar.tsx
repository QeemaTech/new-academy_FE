import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { isAdminPanelUser } from '../../lib/permissions';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { cn } from '../../lib/cn';

const BRAND = '#4178EF';

const navLinks = [
  { i18nKey: 'Nav.home', path: '/ar' },
  { i18nKey: 'Nav.programs', path: '/ar/programs' },
  { i18nKey: 'Nav.pricing', path: '/ar/pricing' },
  { i18nKey: 'Nav.blog', path: '/ar/blog' },
  { i18nKey: 'Nav.about', path: '/ar/about' },
  { i18nKey: 'Nav.contact', path: '/ar/contact' },
];

function pathIsActive(pathname: string, path: string) {
  if (path === '/ar') return pathname === '/ar' || pathname === '/ar/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * RTL-first public site header: logo (inline-end), centered nav, actions (inline-start).
 */
export default function PublicNavbar() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);

  const handleDashboard = () => {
    if (!user) return;
    const r = user.role.toLowerCase();
    if (r === 'parent') navigate('/parent/dashboard');
    else if (r === 'student') navigate('/student/dashboard');
    else if (isAdminPanelUser(r)) navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    logoutStore();
    navigate('/ar');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-[4.25rem] md:px-8">
        <div className="flex min-w-0 flex-1 justify-start">
          <Link to="/ar" className="flex items-center gap-2.5 no-underline">
            <span className="text-lg font-black tracking-tight text-slate-900 md:text-xl">New-Academy</span>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-sm md:h-10 md:w-10"
              style={{ backgroundColor: BRAND }}
            >
              NA
            </span>
          </Link>
        </div>

        <nav className="hidden flex-none items-center gap-0.5 md:flex" aria-label="Main">
          {navLinks.map((link) => {
            const active = pathIsActive(location.pathname, link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'whitespace-nowrap border-b-2 px-2 py-2 text-sm font-bold transition-colors md:px-2.5',
                  active
                    ? 'border-[#4178EF] text-[#4178EF]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                )}
              >
                {t(link.i18nKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                <Button variant="outline" size="md" onClick={handleDashboard} className="font-bold">
                  {t('Header.dashboard')}
                </Button>
                <Button variant="ghost" size="md" onClick={handleLogout} className="font-bold">
                  <LogOut className="h-4 w-4" />
                  {t('Header.logout')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  asChild
                  className="border-[#4178EF] bg-transparent font-bold text-[#4178EF] hover:bg-[#4178EF]/5"
                >
                  <Link to="/auth/login">{t('Header.login')}</Link>
                </Button>
                <Button
                  size="md"
                  asChild
                  className="rounded-full bg-[#4178EF] px-5 font-bold text-white shadow-md shadow-[#4178EF]/25 hover:bg-[#3264D6]"
                >
                  <Link to="/ar/free-trial">{t('Header.freeTrial')}</Link>
                </Button>
              </>
            )}
          </div>

          <Button
            className="lg:hidden"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile / tablet drawer */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="fixed inset-y-0 inset-e-0 z-50 h-full w-[min(92vw,360px)] max-w-none translate-x-0 translate-y-0 rounded-none border-0 border-s border-slate-200 bg-white p-0 shadow-xl left-auto top-auto">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">New-Academy</span>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white"
                style={{ backgroundColor: BRAND }}
              >
                NA
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => {
              const active = pathIsActive(location.pathname, link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'rounded-xl px-3 py-3 text-sm font-bold transition-colors',
                    active ? 'bg-[#4178EF]/10 text-[#4178EF]' : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {t(link.i18nKey)}
                </Link>
              );
            })}
            <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
              {user ? (
                <>
                  <Button
                    className="w-full rounded-xl bg-[#4178EF] font-bold"
                    onClick={() => {
                      setMenuOpen(false);
                      handleDashboard();
                    }}
                  >
                    {t('Header.dashboard')}
                  </Button>
                  <Button variant="ghost" className="w-full font-bold" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    {t('Header.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full border-[#4178EF] font-bold text-[#4178EF]">
                    <Link to="/auth/login" onClick={() => setMenuOpen(false)}>
                      {t('Header.login')}
                    </Link>
                  </Button>
                  <Button asChild className="w-full rounded-full bg-[#4178EF] font-bold text-white">
                    <Link to="/ar/free-trial" onClick={() => setMenuOpen(false)}>
                      {t('Header.freeTrial')}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
