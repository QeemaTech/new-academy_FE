import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BookOpen,
  Clock,
  CreditCard,
  GraduationCap,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import { api } from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { ParentTabEmpty } from '../../components/parent/ParentTabEmpty';
import { cn } from '../../lib/cn';

type SubscriptionAlert = {
  childId: string;
  fullName: string;
  alertType: 'EXPIRED' | 'EXPIRING_SOON';
  packageName: string | null;
  endDate: string;
  daysRemaining?: number;
};

type DashboardPayload = {
  summary: {
    childrenCount: number;
    activeSubscriptionsCount: number;
    pendingPaymentsCount: number;
    unreadNotifications: number;
  };
  latestNotification?: null | {
    id: string;
    type: string;
    title: string;
    body: string;
    createdAt: string;
    child: { id: string; fullName: string } | null;
  };
  childrenPreview: Array<{
    id: string;
    fullName: string;
    age: number | null;
    enrollmentsCount: number;
    hasActiveSubscription: boolean;
    activePackageName: string | null;
    avatar?: string | null;
  }>;
  subscriptionAlerts: SubscriptionAlert[];
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
    subscription: {
      child: { id: string; fullName: string };
      package: { name: string };
    } | null;
  }>;
  upcomingLiveSessions?: Array<{
    id: string;
    title: string;
    scheduledAt: string | null;
    track: { id: string; title: string } | null;
  }>;
  pride?: Array<{
    id: string;
    type: string;
    issuedAt: string;
    certificateUrl: string | null;
    verificationCode: string;
    child: { id: string; fullName: string };
    track: { id: string; title: string };
  }>;
  latestAlert?: { childId: string; childName: string; message: string } | null;
  nextStepRecommendations?: Array<{
    childId: string;
    childName: string;
    fromTrackId: string;
    fromTrackTitle: string;
    percent: number;
    nextTrackId: string;
    nextTrackTitle: string;
  }>;
};

export default function ParentDashboard() {
  const { t, i18n } = useTranslation();
  const [activeChildId, setActiveChildId] = useState<string>('__all__');

  const childId = activeChildId === '__all__' ? undefined : activeChildId;

  // Always fetch the family list for the visual tabs (unscoped).
  const familyQ = useQuery({
    queryKey: ['parent', 'dashboard', 'family'],
    queryFn: async () => {
      const res = await api.get<{ data: DashboardPayload }>('/parent/dashboard');
      return res.data.data;
    },
    staleTime: 20_000,
  });

  // Fetch scoped widgets when a child is selected.
  const scopedQ = useQuery({
    queryKey: ['parent', 'dashboard', 'scoped', activeChildId],
    queryFn: async () => {
      const res = await api.get<{ data: DashboardPayload }>('/parent/dashboard', {
        params: childId ? { childId } : undefined,
      });
      return res.data.data;
    },
    enabled: familyQ.isSuccess,
    staleTime: 20_000,
  });

  const isLoading = familyQ.isLoading || scopedQ.isLoading;
  const isError = familyQ.isError || scopedQ.isError;
  const data = scopedQ.data ?? familyQ.data;

  const childrenPreview = familyQ.data?.childrenPreview ?? [];
  const childTabs = useMemo(() => {
    const all = {
      id: '__all__',
      fullName: t('Parent.childStrip.placeholder', 'اختر ابناً'),
      age: null as number | null,
    };
    return [all, ...childrenPreview.map((c) => ({ id: c.id, fullName: c.fullName, age: c.age }))];
  }, [childrenPreview, t]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="rounded-2xl border-red-100 bg-white shadow-sm">
        <CardContent className="p-6 text-center text-slate-600">{t('Parent.dashboard.loadError')}</CardContent>
      </Card>
    );
  }

  const { summary, recentPayments, subscriptionAlerts } = data;
  const upcoming = data.upcomingLiveSessions ?? [];
  const pride = data.pride ?? [];
  const recs = data.nextStepRecommendations ?? [];
  const latestN = data.latestNotification ?? null;

  const formatPlanDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const statCards = [
    {
      label: t('Parent.dashboard.stats.children'),
      value: childId ? 1 : summary.childrenCount,
      sub:
        childrenPreview.length > 1
          ? t('Parent.dashboard.stats.childrenSub', 'تابع كل الأبناء من هنا')
          : t('Parent.dashboard.stats.childrenSubSingle', 'ملف طالب واحد نشط'),
      icon: Users,
      tone:
        'from-[#050c1f] via-[#0b2a5c] to-[#0f766e] [background-position:0%_0%] bg-[length:140%_140%]',
    },
    {
      label: t('Parent.dashboard.stats.subscriptions'),
      value: summary.activeSubscriptionsCount,
      sub:
        summary.activeSubscriptionsCount > 0
          ? t('Parent.dashboard.stats.subscriptionsSub', 'الاشتراكات فعّالة وجاهزة')
          : t('Parent.dashboard.stats.subscriptionsSubEmpty', 'لا يوجد اشتراك فعّال الآن'),
      icon: GraduationCap,
      tone:
        'from-[#06122b] via-[#0b2a5c] to-[#1b6a9c] [background-position:40%_0%] bg-[length:140%_140%]',
    },
    {
      label: t('Parent.dashboard.stats.pendingPayments'),
      value: summary.pendingPaymentsCount,
      sub:
        summary.pendingPaymentsCount > 0
          ? t('Parent.dashboard.stats.pendingPaymentsSub', 'آخر فاتورة تحتاج إجراء')
          : t('Parent.dashboard.stats.pendingPaymentsSubOk', 'لا توجد فواتير معلّقة'),
      icon: CreditCard,
      tone:
        'from-[#050c1f] via-[#144a88] to-[#2dd4bf] [background-position:0%_60%] bg-[length:140%_140%]',
    },
    {
      label: t('Parent.dashboard.stats.notifications'),
      value: summary.unreadNotifications,
      sub: latestN
        ? t('Parent.dashboard.stats.notificationsLatest', {
            defaultValue: 'آخر إشعار: {{title}}',
            title: latestN.title,
          })
        : t('Parent.dashboard.stats.notificationsSubEmpty', 'آخر إشعار: اضغط للمراجعة'),
      icon: Bell,
      tone:
        'from-[#06122b] via-[#0f2f66] to-[#0f766e] [background-position:70%_40%] bg-[length:140%_140%]',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0f2f66]/10 px-3 py-1 text-xs font-bold text-[#0f2f66]">
            <Sparkles className="h-3.5 w-3.5" />
            {t('Parent.dashboard.badge')}
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {t('Parent.dashboard.title')}
          </h1>
          <p className="text-slate-500 font-medium">{t('Parent.dashboard.subtitle')}</p>
        </div>
        <Button
          asChild
          className="rounded-2xl bg-[#0f2f66] font-bold shadow-lg shadow-[#0f2f66]/25 hover:bg-[#0b1b3a]"
        >
          <Link to="/parent/children">{t('Parent.dashboard.viewChildren')}</Link>
        </Button>
      </div>

      {/* Child Tabs (visual) */}
      {childrenPreview.length > 0 && (
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-2 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.25)] backdrop-blur">
          <div className="flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {childTabs.map((c) => {
              const active = c.id === activeChildId;
              const initials = c.id === '__all__' ? '∞' : c.fullName.trim().charAt(0);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveChildId(c.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-3 rounded-3xl border px-4 py-3 text-start transition-all',
                    active
                      ? 'border-[#2dd4bf]/40 bg-linear-to-br from-[#0f2f66] to-[#144a88] text-white shadow-[0_18px_40px_-22px_rgba(15,47,102,0.45)]'
                      : 'border-slate-200/80 bg-white/80 text-slate-800 hover:border-[#0f2f66]/20 hover:bg-white'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-3xl font-black',
                      active ? 'bg-white/15 text-white' : 'bg-[#0f2f66]/10 text-[#0f2f66]'
                    )}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className={cn('truncate text-sm font-black', active ? 'text-white' : 'text-slate-900')}>
                      {c.id === '__all__' ? t('Parent.childStrip.label', 'متابعة') : c.fullName}
                    </div>
                    <div className={cn('text-[11px] font-bold', active ? 'text-white/80' : 'text-slate-500')}>
                      {c.id === '__all__'
                        ? t('Parent.dashboard.all', 'الكل')
                        : c.age != null
                          ? t('Parent.dashboard.ageYears', { age: c.age })
                          : '—'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {summary.childrenCount === 0 && (
        <ParentTabEmpty
          icon={Users}
          title={t('Parent.dashboard.emptyFamily.title')}
          description={t('Parent.dashboard.emptyFamily.body')}
          action={
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                className="rounded-xl bg-[#4178EF] font-bold shadow-md shadow-[#4178EF]/20 hover:bg-[#3264D6]"
              >
                <Link to="/parent/children?openAdd=1">{t('Parent.addLearner.openButton')}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-[#4178EF]/40 font-bold text-[#4178EF]">
                <Link to="/parent/children">{t('Parent.dashboard.emptyFamily.cta')}</Link>
              </Button>
            </div>
          }
        />
      )}

      {summary.childrenCount > 0 && summary.activeSubscriptionsCount === 0 && (
        <Alert className="border-[#4178EF]/20 bg-white shadow-md shadow-slate-200/40">
          <BookOpen className="h-5 w-5 text-[#4178EF]" />
          <AlertTitle className="ps-1 text-slate-900">{t('Parent.dashboard.subscribeBanner.title')}</AlertTitle>
          <AlertDescription className="ps-1 pt-2 text-slate-600">
            <p className="mb-3 font-medium">{t('Parent.dashboard.subscribeBanner.subtitle')}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                className="rounded-xl bg-[#4178EF] font-bold shadow-md shadow-[#4178EF]/20 hover:bg-[#3264D6]"
              >
                <Link to="/ar/programs">{t('Parent.dashboard.subscribeBanner.catalogCta')}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-[#4178EF]/40 font-bold text-[#4178EF]">
                <Link to="/parent/payments">{t('Parent.dashboard.subscribeBanner.billingCta')}</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {subscriptionAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            {t('Parent.dashboard.subscriptionAlerts.title')}
          </h2>
          <div className="grid gap-3">
            {subscriptionAlerts.map((a) => {
              const plan = a.packageName ?? t('Parent.dashboard.activePlan');
              const dateStr = formatPlanDate(a.endDate);
              const isExpired = a.alertType === 'EXPIRED';
              return (
                <Alert key={`${a.childId}-${a.alertType}-${a.endDate}`} variant={isExpired ? 'destructive' : 'warning'}>
                  {isExpired ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  <AlertTitle className="ps-1">
                    {isExpired
                      ? t('Parent.dashboard.subscriptionAlerts.expired', {
                          name: a.fullName,
                          plan,
                          date: dateStr,
                        })
                      : t('Parent.dashboard.subscriptionAlerts.expiringSoon', {
                          name: a.fullName,
                          plan,
                          days: a.daysRemaining ?? 0,
                          date: dateStr,
                        })}
                  </AlertTitle>
                  <AlertDescription className="ps-1 pt-1">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={cn(
                        'mt-2 rounded-lg font-bold',
                        isExpired
                          ? 'border-rose-300 text-rose-900 hover:bg-rose-100'
                          : 'border-amber-300 text-amber-950 hover:bg-amber-100'
                      )}
                    >
                      <Link to={`/parent/children/${a.childId}`}>
                        {t('Parent.dashboard.subscriptionAlerts.viewLearner')}
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className="overflow-hidden rounded-3xl border border-slate-200/60 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.28)]"
          >
            <CardContent className="p-0">
              <div
                className={cn(
                  'flex items-center justify-between bg-linear-to-br px-5 py-4 text-white',
                  s.tone
                )}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-white/85">{s.label}</p>
                  <p className="mt-1 text-3xl font-black tabular-nums">{s.value}</p>
                  {'sub' in s && s.sub ? (
                    <p className="mt-1 max-w-[22ch] text-[11px] font-bold leading-snug text-white/80">
                      {s.sub}
                    </p>
                  ) : null}
                </div>
                <s.icon className="h-10 w-10 opacity-90" strokeWidth={1.75} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium widgets grid */}
      <div
        className={cn(
          'grid gap-6',
          summary.childrenCount > 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
        )}
      >
        {/* Upcoming LIVE sessions (agenda) */}
        <Card className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-black text-slate-900">
              {t('Parent.dashboard.upcomingLive', 'Upcoming live sessions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center text-sm font-bold text-slate-600">
                {t('Parent.dashboard.upcomingEmpty', 'No upcoming live sessions.')}
              </div>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-900">{s.title}</p>
                      <p className="mt-0.5 text-xs font-bold text-slate-500">{s.track?.title ?? '—'}</p>
                    </div>
                    <div className="shrink-0 text-end text-xs font-bold text-slate-700" dir="ltr">
                      {s.scheduledAt ? formatPlanDate(s.scheduledAt) : '—'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Pride & Sharing */}
        <Card className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-black text-slate-900">
              {t('Parent.dashboard.pride', 'Pride & sharing')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pride.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center text-sm font-bold text-slate-600">
                {t('Parent.dashboard.prideEmpty', 'No achievements yet.')}
              </div>
            ) : (
              <ul className="space-y-2">
                {pride.map((c) => (
                  <li key={c.id} className="rounded-2xl border border-slate-100 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-900">{c.track.title}</p>
                        <p className="mt-0.5 text-xs font-bold text-slate-500">
                          {c.child.fullName} · {formatPlanDate(c.issuedAt)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-[#2dd4bf]/35 font-bold text-[#0f2f66]"
                        onClick={() => {
                          const msg = encodeURIComponent(
                            `🎉 إنجاز جديد!\n${c.child.fullName} أكمل ${c.track.title}.\nرمز التحقق: ${c.verificationCode}`
                          );
                          window.open(`https://wa.me/?text=${msg}`, '_blank');
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                        {t('Parent.dashboard.share', 'Share')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {summary.childrenCount > 0 && (
          <Card className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-black text-slate-900">{t('Parent.dashboard.learners')}</CardTitle>
              <Link
                to="/parent/children"
                className="text-sm font-bold text-[#4178EF] hover:underline inline-flex items-center gap-1"
              >
                {t('Parent.dashboard.all')}
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {childrenPreview.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to={`/parent/children/${c.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-[#4178EF]/30 hover:bg-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4178EF]/12 text-lg font-black text-[#4178EF]">
                    {c.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{c.fullName}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {c.age != null ? t('Parent.dashboard.ageYears', { age: c.age }) : '—'} ·{' '}
                      {c.hasActiveSubscription
                        ? c.activePackageName ?? t('Parent.dashboard.activePlan')
                        : t('Parent.dashboard.noActiveSub')}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-[#4178EF] shadow-sm">
                    {c.enrollmentsCount} {t('Parent.dashboard.tracks')}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-black text-slate-900">
              {t('Parent.dashboard.recentPayments')}
            </CardTitle>
            <Link
              to="/parent/payments"
              className="text-sm font-bold text-[#4178EF] hover:underline inline-flex items-center gap-1"
            >
              {t('Parent.dashboard.all')}
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
                <CreditCard className="mx-auto h-10 w-10 text-[#4178EF]/70" strokeWidth={1.5} />
                <p className="mt-3 font-bold text-slate-800">{t('Parent.dashboard.noPayments')}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{t('Parent.payments.emptyHint')}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentPayments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {p.subscription?.package.name ?? '—'}
                      </p>
                      <p className="text-xs text-slate-500">{p.subscription?.child.fullName}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-black text-slate-900">
                        {p.amount} {p.currency}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-slate-400">{p.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next step recommendations */}
      {recs.length > 0 && (
        <Card className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black text-slate-900">
              {t('Parent.dashboard.nextStep', 'اقتراحات التطوير')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {recs.slice(0, 4).map((r) => (
              <div key={`${r.childId}-${r.fromTrackId}-${r.nextTrackId}`} className="rounded-3xl border border-[#2dd4bf]/25 bg-linear-to-br from-[#0f2f66]/6 via-white to-[#2dd4bf]/10 p-4">
                <p className="text-sm font-black text-slate-900">
                  {t('Parent.dashboard.upsellHeadline', {
                    defaultValue: 'بطلنا أوشك على إنهاء {{track}}!',
                    track: r.fromTrackTitle,
                  })}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {t('Parent.dashboard.upsellBody', {
                    defaultValue: 'استثمر في مستقبله واحجز مقعده في التحدي القادم: {{next}}',
                    next: r.nextTrackTitle,
                  })}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild className="rounded-2xl bg-[#06122b] font-bold shadow-lg shadow-[#06122b]/20 hover:bg-[#050c1f]">
                    <Link to="/ar/programs">
                      {t('Parent.dashboard.enrollNow', 'تصفح المسار')}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
