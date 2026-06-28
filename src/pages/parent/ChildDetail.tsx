import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Award, BarChart3, ClipboardList, Download, FileText, Share2, Sparkles } from 'lucide-react';
import { api } from '../../lib/axios';
import { resolveUploadedFileUrl } from '../../lib/assetUrl';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { ParentTabEmpty } from '../../components/parent/ParentTabEmpty';
import { cn } from '../../lib/cn';

export default function ParentChildDetail() {
  const { t } = useTranslation();
  const { childId = '' } = useParams();

  const dashboardQ = useQuery({
    queryKey: ['parent', 'dashboard', 'scoped', 'child', childId],
    queryFn: async () => {
      const res = await api.get('/parent/dashboard', { params: { childId } });
      return res.data.data as {
        nextStepRecommendations?: Array<{
          childId: string;
          childName: string;
          fromTrackTitle: string;
          percent: number;
          nextTrackTitle: string;
        }>;
      };
    },
    enabled: !!childId,
    staleTime: 20_000,
  });

  const progressQ = useQuery({
    queryKey: ['parent', 'child', childId, 'progress'],
    queryFn: async () => {
      const res = await api.get(`/parent/children/${childId}/progress`);
      return res.data.data as {
        enrollments: Array<{
          track: { title: string };
          progressPercent: number;
          sessionsCompleted: number;
          sessionsTotal: number;
          enrolledAt: string;
        }>;
      };
    },
    enabled: !!childId,
  });

  const quizzesQ = useQuery({
    queryKey: ['parent', 'child', childId, 'quizzes'],
    queryFn: async () => {
      const res = await api.get(`/parent/children/${childId}/quiz-attempts?limit=15`);
      return res.data.data as {
        attempts: Array<{
          id: string;
          score: number;
          isPassed: boolean;
          completedAt: string;
          quiz: { title: string; track: { title: string | null } | null };
        }>;
      };
    },
    enabled: !!childId,
  });

  const certsQ = useQuery({
    queryKey: ['parent', 'child', childId, 'certs'],
    queryFn: async () => {
      const res = await api.get(`/parent/children/${childId}/certificates`);
      return res.data.data.certificates as Array<{
        id: string;
        type: string;
        certificateUrl: string | null;
        issuedAt: string;
        track: { title: string };
        verificationCode: string;
      }>;
    },
    enabled: !!childId,
  });

  const reportsQ = useQuery({
    queryKey: ['parent', 'child', childId, 'reports'],
    queryFn: async () => {
      const res = await api.get(`/parent/children/${childId}/weekly-reports?limit=12`);
      return res.data.data.reports as Array<{
        id: string;
        weekStartDate: string;
        weekEndDate: string;
        sessionsWatched: number;
        quizzesTaken: number;
        averageScore: number;
        subscription: { package: { name: string } };
      }>;
    },
    enabled: !!childId,
  });

  const loading = progressQ.isLoading;

  if (progressQ.isError) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-8 text-center text-slate-600">{t('Parent.childDetail.notFound')}</CardContent>
      </Card>
    );
  }

  const enrollments = progressQ.data?.enrollments ?? [];
  const attempts = quizzesQ.data?.attempts ?? [];
  const certs = certsQ.data ?? [];
  const reports = reportsQ.data ?? [];

  const topEnrollment =
    [...enrollments].sort((a, b) => (b.progressPercent ?? 0) - (a.progressPercent ?? 0))[0] ?? null;

  const nextUp =
    (dashboardQ.data?.nextStepRecommendations ?? []).find((r) => r.childId === childId) ??
    (dashboardQ.data?.nextStepRecommendations ?? [])[0] ??
    null;

  const latestReport = reports[0] ?? null;
  const prevReport = reports[1] ?? null;
  const deltaAvg = latestReport && prevReport ? latestReport.averageScore - prevReport.averageScore : 0;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.20)]">
        <CardContent className="p-0">
          <div className="relative bg-linear-to-r from-[#050c1f] via-[#0b2a5c] to-[#06122b] px-5 py-5 text-white">
            <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background:radial-gradient(900px_circle_at_15%_0%,rgba(45,212,191,0.22),transparent_55%)]" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-sm font-black text-white/85">
                <Link to="/parent/children" className="hover:text-white">
                  {t('Parent.childDetail.back')}
                </Link>
                <ArrowRight className="h-4 w-4 rtl:rotate-180 opacity-90" />
                <span className="text-white">{t('Parent.childDetail.title')}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black ring-1 ring-white/10">
                <Sparkles className="h-4 w-4 text-[#2dd4bf]" aria-hidden />
                {t('Parent.childDetail.premium', { defaultValue: 'ملف المتعلم (Premium)' })}
              </div>
            </div>

            {/* Value-add smart widget */}
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 ring-1 ring-white/10">
                <p className="text-xs font-black uppercase tracking-wide text-white/70">
                  {t('Parent.childDetail.nextUp', { defaultValue: 'التحدي القادم' })}
                </p>
                <p className="mt-2 text-sm font-black text-white">
                  {nextUp
                    ? t('Parent.childDetail.nextUpHeadline', {
                        defaultValue: 'بطلنا أوشك على إنهاء {{track}} ({{p}}%)',
                        track: nextUp.fromTrackTitle,
                        p: nextUp.percent,
                      })
                    : topEnrollment
                      ? t('Parent.childDetail.nextUpFallback', {
                          defaultValue: 'اقتربنا من نهاية {{track}} — جهّزوا الخطوة التالية!',
                          track: topEnrollment.track.title,
                        })
                      : t('Parent.childDetail.nextUpEmpty', {
                          defaultValue: 'ابدأ بمسار واحد لتظهر لك اقتراحات ذكية.',
                        })}
                </p>
                <p className="mt-1 text-sm font-bold text-white/75">
                  {nextUp
                    ? t('Parent.childDetail.nextUpBody', {
                        defaultValue: 'ننصح بـ: {{next}}',
                        next: nextUp.nextTrackTitle,
                      })
                    : t('Parent.childDetail.nextUpBodyEmpty', { defaultValue: '—' })}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" className="rounded-2xl bg-[#2dd4bf] font-black text-[#06122b] hover:bg-[#22c3b0]">
                    <Link to="/parent/checkout">
                      {t('Parent.childDetail.reserveSeat', { defaultValue: 'احجز مقعد البطل' })}
                      <ArrowUpRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-2xl border-white/15 bg-white/8 font-black text-white hover:bg-white/12">
                    <Link to="/ar/programs">{t('Parent.childDetail.browseTracks', { defaultValue: 'تصفح المسارات' })}</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 ring-1 ring-white/10">
                <p className="text-xs font-black uppercase tracking-wide text-white/70">
                  {t('Parent.childDetail.strengths', { defaultValue: 'نقاط القوة' })}
                </p>
                <p className="mt-2 text-sm font-black text-white">
                  {latestReport
                    ? t('Parent.childDetail.strengthsHeadline', {
                        defaultValue: 'متوسط الأسبوع: {{avg}}% · مشاهدة: {{w}} · اختبارات: {{q}}',
                        avg: latestReport.averageScore.toFixed(1),
                        w: latestReport.sessionsWatched,
                        q: latestReport.quizzesTaken,
                      })
                    : t('Parent.childDetail.strengthsEmpty', { defaultValue: 'لا توجد تقارير كافية بعد.' })}
                </p>
                <p className="mt-1 text-sm font-bold text-white/75" dir="ltr">
                  {latestReport
                    ? `${deltaAvg >= 0 ? '+' : ''}${deltaAvg.toFixed(1)} vs prev`
                    : '—'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-2xl border-white/15 bg-white/8 font-black text-white hover:bg-white/12"
                    onClick={() => {
                      const msg = encodeURIComponent(
                        latestReport
                          ? `🏅 أداء الأسبوع\nالمعدل: ${latestReport.averageScore.toFixed(1)}%\nمشاهدة: ${latestReport.sessionsWatched}\nاختبارات: ${latestReport.quizzesTaken}`
                          : '🏅 ملف المتعلم'
                      );
                      window.open(`https://wa.me/?text=${msg}`, '_blank');
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    {t('Parent.childDetail.sharePride', { defaultValue: 'شارك الفخر' })}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : (
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="flex w-full flex-wrap gap-1 rounded-3xl border border-slate-200/60 bg-white/80 p-1 shadow-sm">
            <TabsTrigger value="progress" className="flex-1 rounded-2xl data-[state=active]:bg-[#06122b] data-[state=active]:text-white">
              {t('Parent.childDetail.tabProgress')}
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex-1 rounded-2xl data-[state=active]:bg-[#06122b] data-[state=active]:text-white">
              {t('Parent.childDetail.tabQuizzes')}
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex-1 rounded-2xl data-[state=active]:bg-[#06122b] data-[state=active]:text-white">
              {t('Parent.childDetail.tabCerts')}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 rounded-2xl data-[state=active]:bg-[#06122b] data-[state=active]:text-white">
              {t('Parent.childDetail.tabReports')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            {enrollments.length === 0 ? (
              <ParentTabEmpty
                icon={BarChart3}
                title={t('Parent.childDetail.emptyProgressTitle')}
                description={t('Parent.childDetail.emptyProgressDesc')}
              />
            ) : (
              <div className="grid gap-4">
                {enrollments.map((e) => (
                  <Card key={e.track.title + e.enrolledAt} className="rounded-3xl border border-slate-200/60 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-black text-slate-900">{e.track.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>
                          {e.sessionsCompleted}/{e.sessionsTotal} {t('Parent.childDetail.sessions')}
                        </span>
                        <span dir="ltr">{e.progressPercent}%</span>
                      </div>
                      <div className="rounded-full bg-slate-100 p-1">
                        <Progress value={e.progressPercent} className="h-2 rounded-full bg-slate-100 [&>div]:bg-[#2dd4bf]" />
                      </div>
                      {e.progressPercent >= 80 ? (
                        <div className="rounded-2xl border border-[#2dd4bf]/20 bg-linear-to-br from-[#06122b]/4 via-white to-[#2dd4bf]/10 px-3 py-2 text-xs font-bold text-slate-700">
                          {t('Parent.childDetail.nearFinish', { defaultValue: 'قريب من الإنهاء — جاهزون للمرحلة القادمة' })}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes">
            {attempts.length === 0 ? (
              <ParentTabEmpty
                icon={ClipboardList}
                title={t('Parent.childDetail.emptyQuizTitle')}
                description={t('Parent.childDetail.emptyQuizDesc')}
              />
            ) : (
              <Card className="rounded-3xl border border-slate-200/60 bg-white shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200/60">
                        <TableHead>{t('Parent.childDetail.quizCol')}</TableHead>
                        <TableHead>{t('Parent.childDetail.scoreCol')}</TableHead>
                        <TableHead>{t('Parent.childDetail.dateCol')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((a) => (
                        <TableRow key={a.id} className="border-slate-200/50 hover:bg-slate-50/70">
                          <TableCell className="font-semibold">{a.quiz.title}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-xs font-bold',
                                a.isPassed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              )}
                            >
                              {a.score}%
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm">
                            {new Date(a.completedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="certificates" className="space-y-3">
            {certs.length === 0 ? (
              <ParentTabEmpty
                icon={Award}
                title={t('Parent.childDetail.emptyCertsTitle')}
                description={t('Parent.childDetail.emptyCertsDesc')}
              />
            ) : (
              certs.map((c) => {
                const url = resolveUploadedFileUrl(c.certificateUrl);
                return (
                  <Card key={c.id} className="rounded-3xl border border-slate-200/60 bg-white shadow-sm">
                    <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-slate-900">{c.track.title}</p>
                        <p className="text-xs font-bold uppercase text-slate-400">{c.type}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(c.issuedAt).toLocaleDateString()} · {c.verificationCode.slice(0, 8)}
                        </p>
                      </div>
                      {url ? (
                        <Button asChild variant="outline" className="rounded-2xl border-[#2dd4bf]/30 font-bold text-[#0b2a5c] hover:bg-[#2dd4bf]/10">
                          <a href={url} target="_blank" rel="noreferrer">
                            <Download className="me-2 h-4 w-4" />
                            {t('Parent.childDetail.download')}
                          </a>
                        </Button>
                      ) : (
                        <span className="text-sm text-slate-400">{t('Parent.childDetail.noPdf')}</span>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="reports">
            {reports.length === 0 ? (
              <ParentTabEmpty
                icon={FileText}
                title={t('Parent.childDetail.emptyReportsTitle')}
                description={t('Parent.childDetail.emptyReportsDesc')}
              />
            ) : (
              <div className="grid gap-3">
                {reports.map((r) => (
                  <Card key={r.id} className="rounded-3xl border border-slate-200/60 bg-white shadow-sm">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div>
                        <p className="font-black text-slate-900">{r.subscription.package.name}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(r.weekStartDate).toLocaleDateString()} —{' '}
                          {new Date(r.weekEndDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                        <span>
                          {t('Parent.childDetail.watched')}: {r.sessionsWatched}
                        </span>
                        <span>
                          {t('Parent.childDetail.quizzesShort')}: {r.quizzesTaken}
                        </span>
                        <span>
                          {t('Parent.childDetail.avg')}: {r.averageScore.toFixed(1)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
