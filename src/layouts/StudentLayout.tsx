import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Castle,
  CalendarDays,
  Globe2,
  LogOut,
  Settings,
  Sparkles,
  Languages,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/cn';
import { LiveNotificationBell } from '../components/notifications/LiveNotificationBell';
import { DashboardFooter } from '../components/admin/DashboardFooter';

const dockNav = [
  { to: '/student/dashboard', label: 'الرئيسية', short: '🏠', icon: Castle },
  { to: '/student/tracks', label: 'عوالمي', short: '🌍', icon: Globe2 },
  { to: '/student/planner', label: 'جدول المهمات', short: '🗓️', icon: CalendarDays },
  { to: '/student/certificates', label: 'الجوائز', short: '🏆', icon: Award },
];

function NavButton({
  to,
  label,
  icon: Icon,
  mobile,
}: {
  to: string;
  label: string;
  icon: typeof Castle;
  mobile?: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-[1.25rem] border-4 px-4 py-3 font-black transition-all duration-200',
          mobile ? 'min-h-[3.25rem] flex-1 flex-col justify-center gap-1 py-2 text-[10px]' : 'text-base',
          isActive
            ? 'border-slate-900/15 bg-[#4178EF] text-white shadow-[6px_6px_0_0_rgba(15,23,42,0.12)] -translate-y-0.5'
            : 'border-transparent bg-white/60 text-slate-700 hover:border-[#4178EF]/25 hover:bg-white hover:shadow-md'
        )
      }
    >
      <Icon className={cn('shrink-0', mobile ? 'h-6 w-6' : 'h-6 w-6')} strokeWidth={2.5} />
      {!mobile && <span>{label}</span>}
      {mobile && <span className="max-w-[4.5rem] truncate font-black leading-tight">{label}</span>}
    </NavLink>
  );
}

/**
 * Gamified learner shell — floating dock (mobile) + curved “play” sidebar (desktop).
 * Not the admin dashboard pattern.
 */
export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, logout: logoutStore } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    const r = user.role.toLowerCase();
    if (r !== 'student' && r !== 'child') navigate('/auth/login');
  }, [user, navigate]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = () => {
    logoutStore();
    try {
      localStorage.removeItem('na_current_user');
    } catch {
      /* ignore */
    }
    navigate('/auth/login');
  };

  if (!user) return null;

  const firstName = (user.fullName || 'بطل').split(/\s+/)[0];

  const isLesson = location.pathname.includes('/student/lessons/');

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50" dir="rtl">
      {/* Soft blobs + dot pattern */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 start-0 h-96 w-96 rounded-full bg-[#4178EF]/25 blur-3xl" />
        <div className="absolute top-1/3 -end-16 h-72 w-72 rounded-full bg-[#FFD100]/20 blur-3xl" />
        <div className="absolute bottom-0 start-1/4 h-80 w-80 rounded-full bg-[#A855F7]/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle at center, #94a3b8 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Desktop: playful curved sidebar */}
        <aside className="relative hidden w-full max-w-[20rem] shrink-0 flex-col gap-6 p-6 lg:flex">
          <div className="rounded-[2rem] border-4 border-slate-900/10 bg-white/75 p-6 shadow-[12px_12px_0_0_rgba(65,120,239,0.12)] backdrop-blur-md">
            <div className="mb-8 flex items-center gap-3 rounded-[1.5rem] bg-gradient-to-l from-[#4178EF] to-[#6366F1] p-4 text-white shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black">
                {user.fullName?.charAt(0) || '🎮'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white/80">لاعب</p>
                <p className="truncate text-lg font-black">{user.fullName || 'بطل'}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {dockNav.map((item) => (
                <NavButton key={item.to} to={item.to} label={item.label} icon={item.icon} />
              ))}
            </nav>

            <div className="mt-8 flex flex-col gap-2 border-t-4 border-dashed border-slate-200 pt-6">
              <NavLink
                to="/student/settings"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-[1rem] px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100',
                    isActive && 'bg-slate-100'
                  )
                }
              >
                <Settings className="h-4 w-4" />
                الإعدادات
              </NavLink>
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-2 rounded-[1rem] px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                <Languages className="h-4 w-4" />
                {i18n.language === 'ar' ? 'English' : 'عربي'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-[1rem] px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                {t('Auth.logout', 'خروج')}
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="relative flex min-h-screen flex-1 flex-col px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10">
          {/* Welcome header — gradient “hero” title */}
          <header
            className={cn(
              'mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between',
              isLesson && 'mb-6'
            )}
          >
            <div className="text-center lg:text-start">
              <div className="inline-flex items-center gap-2 rounded-full border-4 border-[#FFD100]/40 bg-[#FFD100]/20 px-4 py-1.5 text-sm font-black text-amber-900 shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-600" />
                بوابة البطل
              </div>
              <h1
                className={cn(
                  'mt-4 bg-gradient-to-l from-[#4178EF] via-violet-600 to-[#FFD100] bg-clip-text font-black text-transparent drop-shadow-sm',
                  isLesson ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl'
                )}
                style={{ WebkitBackgroundClip: 'text' }}
              >
                مرحباً يا بطل!🚀
              </h1>

              {!isLesson && (
                <p className="mt-2 text-lg font-bold text-slate-600 md:text-xl">
                  {firstName}، جاهز لمغامرة جديدة اليوم؟
                </p>
              )}
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <LiveNotificationBell isStudentView={true} />
            </div>
          </header>

          <div className="flex-1">
            <Outlet />
          </div>
          <div className="mt-8">
            <DashboardFooter />
          </div>
        </main>
      </div>

      {/* Mobile floating dock */}
      <nav
        className="fixed bottom-0 start-0 end-0 z-50 border-t-4 border-slate-900/10 bg-white/90 px-3 py-3 backdrop-blur-xl lg:hidden"
        aria-label="التنقل الرئيسي"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-center gap-2 rounded-[2rem] border-4 border-slate-900/10 bg-gradient-to-b from-white to-slate-50 p-2 shadow-[0_-8px_30px_rgba(65,120,239,0.15)]">
          {dockNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-[1.25rem] border-4 px-1 py-1 text-[10px] font-black transition-all',
                  isActive
                    ? 'border-[#4178EF]/30 bg-[#4178EF] text-white shadow-[4px_4px_0_0_rgba(15,23,42,0.12)]'
                    : 'border-transparent text-slate-600 hover:bg-slate-100'
                )
              }
            >
              <item.icon className="h-6 w-6" strokeWidth={2.5} />
              <span className="leading-none">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
