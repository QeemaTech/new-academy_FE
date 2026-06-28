import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  BookOpen,
  CreditCard,
  FileBarChart2,
  Headphones,
  LayoutGrid,
  CalendarDays,
  Settings,
  Users,
  Video,
  Award,
  Folder,
  ClipboardCheck,
  LayoutList,
  RefreshCcw,
  CheckSquare,
  Tag,
  FileText,
  ListVideo,
  Shield,
  User,
  Map,
  ShoppingBag,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { hasRawPermission, isAdminPanelUser } from '../lib/permissions';
import { DashboardLayout as ModularDashboardLayout } from '../components/dashboard';
import { buildRoleDashboardConfig } from '../components/dashboard/buildRoleDashboardConfig';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { LiveNotificationBell } from '../components/notifications/LiveNotificationBell';

interface NavItem {
  label: string;
  path: string;
  permission?: string;
  i18nKey?: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface Props {
  role: 'parent' | 'student' | 'admin' | 'teacher';
}

const navConfig: Record<string, NavItem[]> = {
  parent: [
    { icon: LayoutGrid, label: 'لوحة التحكم', path: '/parent/dashboard', i18nKey: 'Parent.nav.dashboard' },
    { icon: ShoppingBag, label: 'المتجر', path: '/parent/store', i18nKey: 'Parent.nav.store' },
    { icon: Users, label: 'الأبناء', path: '/parent/children', i18nKey: 'Parent.nav.children' },
    { icon: FileBarChart2, label: 'التقارير', path: '/parent/reports', i18nKey: 'Parent.nav.reports' },
    { icon: CreditCard, label: 'المدفوعات', path: '/parent/payments', i18nKey: 'Parent.nav.payments' },
    { icon: Headphones, label: 'الدعم', path: '/parent/support', i18nKey: 'Parent.nav.support' },
    { icon: Settings, label: 'الإعدادات', path: '/parent/settings', i18nKey: 'Parent.nav.settings' },
  ],
  student: [
    { icon: LayoutGrid, label: 'لوحة التحكم', path: '/student/dashboard', i18nKey: 'Student.nav.dashboard' },
    { icon: CalendarDays, label: 'المخطط', path: '/student/planner', i18nKey: 'Student.nav.planner' },
    { icon: Video, label: 'الحصص', path: '/student/classes' },
    { icon: ClipboardCheck, label: 'الواجبات', path: '/student/assignments' },
    { icon: Folder, label: 'المشاريع', path: '/student/projects' },
    { icon: Award, label: 'الشارات', path: '/student/badges' },
    { icon: Settings, label: 'الإعدادات', path: '/student/settings' },
  ],
  teacher: [
    { icon: LayoutGrid, label: 'الرئيسية', path: '/teacher/dashboard', i18nKey: 'Teacher.nav.dashboard', exact: true },
    { icon: Map, label: 'مساراتي', path: '/teacher/tracks', i18nKey: 'Teacher.nav.tracks' },
    { icon: Users, label: 'طلابي', path: '/teacher/students', i18nKey: 'Teacher.nav.myStudents' },
    { icon: CalendarDays, label: 'أوقات التوفر', path: '/teacher/availability', i18nKey: 'Teacher.nav.availability' },
    { icon: Settings, label: 'الإعدادات', path: '/teacher/settings', i18nKey: 'Teacher.nav.settings' },
  ],
  admin: [
    { icon: BarChart3, label: 'لوحة التحكم', path: '/admin/dashboard', permission: 'VIEW_ANALYTICS', i18nKey: 'Admin.nav.dashboard' },
    { icon: Users, label: 'المستخدمون', path: '/admin/users', permission: 'MANAGE_USERS', i18nKey: 'Admin.nav.users' },
    { icon: Users, label: "ربط الأبناء والطلاب", path: '/admin/children', permission: 'MANAGE_USERS', i18nKey: 'Admin.nav.children' },
    { icon: BookOpen, label: 'البرامج', path: '/admin/programs', permission: 'MANAGE_CONTENT', i18nKey: 'Admin.nav.programs' },
    { icon: ListVideo, label: 'الدروس والمسارات', path: '/admin/sessions', permission: 'MANAGE_CONTENT', i18nKey: 'Admin.nav.sessions' },
    { icon: LayoutGrid, label: 'الفئات', path: '/admin/categories', permission: 'MANAGE_PACKAGES', i18nKey: 'Admin.nav.categories' },
    { icon: ShoppingBag, label: 'العروض المجمعة', path: '/admin/bundles', permission: 'MANAGE_PACKAGES', i18nKey: 'Admin.nav.bundles' },
    { icon: CreditCard, label: 'المدفوعات', path: '/admin/payments', permission: 'VIEW_FINANCIALS', i18nKey: 'Admin.nav.payments' },
    { icon: RefreshCcw, label: 'الاشتراكات', path: '/admin/subscriptions', permission: 'VIEW_FINANCIALS', i18nKey: 'Admin.nav.subscriptions' },
    { icon: FileBarChart2, label: 'التقارير', path: '/admin/reports', permission: 'VIEW_ANALYTICS', i18nKey: 'Admin.nav.reports', exact: true },
    { icon: CheckSquare, label: 'التقييمات', path: '/admin/assessments', permission: 'MANAGE_CONTENT', i18nKey: 'Admin.nav.assessments' },
    { icon: Tag, label: 'الكوبونات', path: '/admin/coupons', permission: 'MANAGE_COUPONS', i18nKey: 'Admin.nav.coupons' },
    { icon: FileText, label: 'إدارة المحتوى', path: '/admin/content', permission: 'MANAGE_CONTENT', i18nKey: 'Admin.nav.content' },
    { icon: Headphones, label: 'الدعم', path: '/admin/support', permission: 'MANAGE_TICKETS', i18nKey: 'Admin.nav.support' },
    { icon: ClipboardCheck, label: 'الاختبارات', path: '/admin/quizzes', permission: 'MANAGE_QUIZZES', i18nKey: 'Admin.nav.quizzes' },
    { icon: Award, label: 'الشهادات', path: '/admin/certificates', permission: 'MANAGE_CERTIFICATES', i18nKey: 'Admin.nav.certificates' },
    { icon: Shield, label: 'الأدوار والصلاحيات', path: '/admin/roles', permission: 'MANAGE_ROLES', i18nKey: 'Admin.nav.roles' },
    { icon: User, label: 'الملف الشخصي', path: '/admin/profile', i18nKey: 'Admin.nav.profile' },
    { icon: Settings, label: 'الإعدادات', path: '/admin/settings', permission: 'MANAGE_SETTINGS', i18nKey: 'Admin.nav.settings' },
  ],
};

const roleLabels: Record<string, string> = {
  parent: 'ولي الأمر',
  student: 'الطالب',
  teacher: 'المعلم',
  admin: 'لوحة الإدارة',
  staff: 'موظف',
  super_admin: 'مدير المنصة',
};

export default function DashboardLayout({ role }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout: logoutStore } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    const r = user.role.toLowerCase();
    if (role === 'admin') {
      if (!isAdminPanelUser(r)) navigate('/auth/login');
    } else if (role === 'student') {
      if (r !== 'student' && r !== 'child') navigate('/auth/login');
    } else if (role === 'teacher') {
      if (r !== 'teacher') navigate('/auth/login');
    } else if (r !== role.toLowerCase()) {
      navigate('/auth/login');
    }
  }, [user, role, navigate]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const navItems = useMemo(
    () =>
      navConfig[role]?.filter((item) => {
        if (role === 'admin' && item.permission) {
          return hasRawPermission(user, item.permission);
        }
        return true;
      }) || [],
    [role, user]
  );

  const roleLabel = useMemo(() => {
    const r = user?.role?.toLowerCase();
    return t(`Roles.${r}`, (r && roleLabels[r]) || roleLabels[role]);
  }, [role, t, user?.role]);

  const panelRole = useMemo(() => {
    if (role === 'admin') {
      return user?.role?.toLowerCase() === 'super_admin' ? 'super_admin' : 'custom';
    }
    if (role === 'student') return 'child';
    if (role === 'teacher') return 'teacher';
    return 'parent';
  }, [role, user?.role]);

  const searchPlaceholder = useMemo(() => {
    if (role === 'admin') return t('Admin.shell.searchPlaceholder');
    if (role === 'parent') return t('Parent.shell.searchPlaceholder');
    if (role === 'teacher') return t('Teacher.shell.searchPlaceholder', 'Search your tracks…');
    return t('DashboardLayout.searchPlaceholder');
  }, [role, t]);

  const roleConfig = useMemo(
    () =>
      buildRoleDashboardConfig(panelRole, {
        t,
        roleBadgeLabel: roleLabel,
        brandSubtitle: role === 'admin' ? undefined : roleLabel,
        searchPlaceholder,
        links: navItems.map((item) => ({
          id: item.path,
          path: item.path,
          label: item.i18nKey ? t(item.i18nKey) : item.label,
          icon: item.icon,
          exact: item.exact,
        })),
      }),
    [navItems, panelRole, role, roleLabel, searchPlaceholder, t]
  );

  const activeModuleName = useMemo(() => {
    const item = navItems.find((i) => location.pathname === i.path || location.pathname.startsWith(`${i.path}/`));
    if (item) return item.i18nKey ? t(item.i18nKey) : item.label;
    return t('Header.dashboard');
  }, [location.pathname, navItems, t]);

  const shellTitle = t('Header.dashboard');

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

  const userSnippet = {
    fullName: user.fullName || '',
    email: user.email || '',
    avatarLetter: user.fullName?.charAt(0) || 'U',
  };

  const profileSettingsPath =
    role === 'parent'
      ? '/parent/settings'
      : role === 'student'
        ? '/student/settings'
        : role === 'teacher'
          ? '/teacher/settings'
          : '/admin/profile';

  const parentMainClass =
    role === 'parent'
      ? 'bg-[#f4f7fd]'
      : role === 'teacher'
        ? 'teacher-dashboard-shell min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-indigo-50/20 animate-gradient'
        : undefined;

  return (
    <ModularDashboardLayout
      roleConfig={roleConfig}
      user={userSnippet}
      shellTitle={shellTitle}
      activeModuleName={activeModuleName}
      languageToggleLabel={i18n.language === 'ar' ? 'English' : 'عربي'}
      onLanguageToggle={toggleLanguage}
      logoutLabel={t('Auth.logout', 'تسجيل الخروج')}
      onLogout={handleLogout}
      notificationsLabel={t('Admin.shell.notifications', 'الإشعارات')}
      notificationComponent={role === 'parent' ? <LiveNotificationBell /> : <NotificationBell />}
      collapseExpandAriaLabel={
        t('Admin.shell.collapseSidebar', 'طي القائمة') +
        ' / ' +
        t('Admin.shell.expandSidebar', 'توسيع القائمة')
      }
      mainClassName={parentMainClass}
      profileSettingsPath={profileSettingsPath}
      showHeaderProfileMenu={role !== 'parent'}
    >
      <Outlet />
    </ModularDashboardLayout>
  );
}
