import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { ArrowUpRight, Share2, TrendingUp, Minus, FileText } from 'lucide-react';
import { api } from '../../lib/axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { ParentTabEmpty } from '../../components/parent/ParentTabEmpty';
import { cn } from '../../lib/cn';

type ChildBrief = { id: string; fullName: string };

export default function ParentReports() {
  const { t } = useTranslation();

  const childrenQ = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: async () => {
      const res = await api.get<{ data: { children: ChildBrief[] } }>('/parent/children');
      return res.data.data.children;
    },
  });

  const reportQueries = useQueries({
    queries: (childrenQ.data ?? []).map((c) => ({
      queryKey: ['parent', 'child', c.id, 'weekly-reports', 'list'],
      queryFn: async () => {
        const res = await api.get(`/parent/children/${c.id}/weekly-reports?limit=8`);
        return {
          childId: c.id,
          childName: c.fullName,
          reports: res.data.data.reports as Array<{
            id: string;
            weekStartDate: string;
            weekEndDate: string;
            sessionsWatched: number;
            quizzesTaken: number;
            averageScore: number;
            subscription: { package: { name: string } };
          }>,
        };
      },
      enabled: !!childrenQ.data?.length,
    })),
  });

  const loading = childrenQ.isLoading || reportQueries.some((q) => q.isLoading);

  if (loading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  const blocks = reportQueries.map((q) => q.data).filter(Boolean) as Array<{
    childId: string;
    childName: string;
    reports: Array<{
      id: string;
      weekStartDate: string;
      weekEndDate: string;
      sessionsWatched: number;
      quizzesTaken: number;
      averageScore: number;
      subscription: { package: { name: string } };
    }>;
  }>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{t('Parent.reports.title')}</h1>
        <p className="mt-1 font-medium text-slate-500">{t('Parent.reports.subtitle')}</p>
      </div>

      {blocks.length === 0 ? (
        <ParentTabEmpty
          icon={FileText}
          title={t('Parent.reports.empty')}
          description={t('Parent.reports.noneForChild')}
        />
      ) : (
        <div className="space-y-10">
          {blocks.map((b) => (
            <section key={b.childId} className="space-y-3">
              <Card className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.20)]">
                <CardContent className="p-0">
                  <div className="relative bg-linear-to-r from-[#050c1f] via-[#0b2a5c] to-[#06122b] px-5 py-4 text-white">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background:radial-gradient(900px_circle_at_15%_0%,rgba(45,212,191,0.22),transparent_55%)]" />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-black">{b.childName}</h2>
                        <p className="mt-0.5 text-xs font-bold text-white/75">
                          {t('Parent.reports.childHeader', { defaultValue: 'ملخص أداء أسبوعي' })}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-2xl border-white/15 bg-white/8 font-black text-white hover:bg-white/12"
                          onClick={() => {
                            const top = [...b.reports].sort((x, y) => y.averageScore - x.averageScore)[0];
                            const msg = encodeURIComponent(
                              top
                                ? `🏅 تقرير ${b.childName}\nالمسار: ${top.subscription.package.name}\nالمعدل: ${top.averageScore.toFixed(
                                    1
                                  )}%`
                                : `🏅 تقارير ${b.childName}`
                            );
                            window.open(`https://wa.me/?text=${msg}`, '_blank');
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                          {t('Parent.reports.share', { defaultValue: 'شارك الفخر' })}
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="rounded-2xl bg-[#2dd4bf] font-black text-[#06122b] hover:bg-[#22c3b0]"
                        >
                          <Link to={`/parent/children/${b.childId}`}>
                            {t('Parent.reports.viewLearner')}
                            <ArrowUpRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-3 md:grid-cols-2">
                {b.reports.map((r, idx) => {
                  const prev = b.reports[idx + 1];
                  const delta = prev ? r.averageScore - prev.averageScore : 0;
                  const trend =
                    Math.abs(delta) < 2 ? 'steady' : delta > 0 ? 'up' : 'down';
                  return (
                    <Card
                      key={r.id}
                      className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm transition hover:shadow-[0_18px_50px_-36px_rgba(6,18,43,0.22)]"
                    >
                      <CardContent className="p-0">
                        <div className="flex items-start justify-between gap-3 px-5 py-4">
                          <div className="min-w-0">
                            <p className="truncate font-black text-slate-900">{r.subscription.package.name}</p>
                            <p className="mt-1 text-xs font-bold text-slate-500" dir="ltr">
                              {new Date(r.weekStartDate).toLocaleDateString()} —{' '}
                              {new Date(r.weekEndDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ring-1',
                              trend === 'up'
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/70'
                                : trend === 'down'
                                  ? 'bg-rose-50 text-rose-700 ring-rose-200/70'
                                  : 'bg-slate-50 text-slate-700 ring-slate-200/70'
                            )}
                          >
                            {trend === 'up' ? (
                              <>
                                <TrendingUp className="h-4 w-4" />
                                {t('Parent.reports.trendUp', { defaultValue: 'يتحسن' })}
                              </>
                            ) : trend === 'down' ? (
                              <>
                                <TrendingUp className="h-4 w-4 rotate-180" />
                                {t('Parent.reports.trendDown', { defaultValue: 'يتراجع' })}
                              </>
                            ) : (
                              <>
                                <Minus className="h-4 w-4" />
                                {t('Parent.reports.trendSteady', { defaultValue: 'مستقر' })}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 px-5 pb-5">
                          <div className="rounded-2xl bg-slate-50/70 p-3 text-center">
                            <p className="text-[10px] font-black uppercase text-slate-400">
                              {t('Parent.reports.watched')}
                            </p>
                            <p className="mt-1 text-lg font-black text-slate-900">{r.sessionsWatched}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50/70 p-3 text-center">
                            <p className="text-[10px] font-black uppercase text-slate-400">
                              {t('Parent.reports.quizzes')}
                            </p>
                            <p className="mt-1 text-lg font-black text-slate-900">{r.quizzesTaken}</p>
                          </div>
                          <div className="rounded-2xl bg-linear-to-br from-[#06122b]/4 via-white to-[#2dd4bf]/8 p-3 text-center ring-1 ring-[#2dd4bf]/15">
                            <p className="text-[10px] font-black uppercase text-slate-400">
                              {t('Parent.reports.avg')}
                            </p>
                            <p className="mt-1 text-lg font-black text-slate-900">
                              {r.averageScore.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {b.reports.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-600">{t('Parent.reports.noneForChild')}</p>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
