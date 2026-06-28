import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { isAdminPanelUser } from '../../lib/permissions';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { cn } from '../../lib/cn';

export default function AppHeader() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);

  const navLinks = [
    { i18nKey: 'Nav.home', path: '/ar' },
    { i18nKey: 'Nav.programs', path: '/ar/programs' },
    { i18nKey: 'Nav.pricing', path: '/ar/pricing' },
    { i18nKey: 'Nav.competitions', path: '/ar/competitions' },
    { i18nKey: 'Nav.blog', path: '/ar/blog' },
    { i18nKey: 'Nav.about', path: '/ar/about' },
    { i18nKey: 'Nav.contact', path: '/ar/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

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
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/ar" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-extrabold">
            NA
          </div>
          <span className="text-base font-extrabold text-foreground">New-Academy</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              {t(link.i18nKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="outline" onClick={handleDashboard}>
                {t('Header.dashboard')}
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                {t('Header.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/auth/login">{t('Header.login')}</Link>
              </Button>
              <Button variant="primary" asChild>
                <Link to="/ar/free-trial">{t('Header.freeTrial')}</Link>
              </Button>
            </>
          )}
        </div>

        <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="fixed inset-y-0 inset-e-0 w-[min(92vw,360px)] translate-x-0 translate-y-0 left-auto top-auto rounded-none border-0 border-s border-border p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-extrabold text-foreground">New-Academy</div>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-4">
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                  )}
                >
                  {t(link.i18nKey)}
                </Link>
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              {user ? (
                <>
                  <Button variant="primary" onClick={() => { setMenuOpen(false); handleDashboard(); }}>
                    {t('Header.dashboard')}
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    {t('Header.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/auth/login" onClick={() => setMenuOpen(false)}>
                      {t('Header.login')}
                    </Link>
                  </Button>
                  <Button variant="primary" asChild>
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
