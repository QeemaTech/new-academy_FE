import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Award, ClipboardList, Sparkles, Users, UserPlus } from 'lucide-react';
import { api } from '../../lib/axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { AddLearnerDialog } from '../../components/parent/AddLearnerDialog';
import { cn } from '../../lib/cn';

type ChildRow = {
  id: string;
  fullName: string;
  username: string;
  age: number | null;
  gradeLevel?: string | null;
  avatar: string | null;
  isActive: boolean;
  stats: {
    enrollmentsCount: number;
    certificatesCount: number;
    quizAttemptsCount: number;
  };
  subscriptions: Array<{ status: string; package: { name: string } }>;
};

export default function ParentChildren() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [addLearnerOpen, setAddLearnerOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('openAdd') === '1') {
      setAddLearnerOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: async () => {
      const res = await api.get<{ data: { children: ChildRow[] } }>('/parent/children');
      return res.data.data.children;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }

  const list = data ?? [];

  return (
    <div className="space-y-6">
      <AddLearnerDialog open={addLearnerOpen} onOpenChange={setAddLearnerOpen} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{t('Parent.children.title')}</h1>
          <p className="mt-1 font-medium text-slate-500">{t('Parent.children.subtitle')}</p>
        </div>
        <Button
          type="button"
          onClick={() => setAddLearnerOpen(true)}
          className="rounded-2xl bg-[#06122b] font-bold shadow-lg shadow-[#06122b]/20 hover:bg-[#050c1f] sm:self-start"
        >
          <UserPlus className="me-2 h-4 w-4" />
          {t('Parent.addLearner.openButton')}
        </Button>
      </div>

      {list.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-slate-200 bg-linear-to-b from-slate-50/90 to-white">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4178EF]/10 shadow-inner">
              <Users className="h-8 w-8 text-[#4178EF]" strokeWidth={1.75} />
            </div>
            <p className="max-w-md font-bold text-slate-800">{t('Parent.children.empty')}</p>
            <p className="max-w-lg text-sm font-medium text-slate-500">{t('Parent.children.emptyHint')}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                onClick={() => setAddLearnerOpen(true)}
                className="rounded-xl bg-[#4178EF] font-bold shadow-md shadow-[#4178EF]/20 hover:bg-[#3264D6]"
              >
                <UserPlus className="me-2 h-4 w-4" />
                {t('Parent.addLearner.openButton')}
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-[#4178EF]/40 font-bold text-[#4178EF]"
              >
                <Link to="/parent/support">{t('Parent.children.emptyCta')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const active = c.subscriptions.some((s) => s.status === 'ACTIVE');
            // Premium gamification bridge (mocked): stable per-child values without backend wiring yet.
            const xp = 250 + c.stats.enrollmentsCount * 180 + c.stats.quizAttemptsCount * 35 + c.stats.certificatesCount * 120;
            const level = Math.max(1, Math.min(20, Math.floor(xp / 500) + 1));
            const strength =
              c.stats.certificatesCount > 0
                ? t('Parent.children.insight.strength.certs', { defaultValue: 'نقطة قوة: إنجازات وشهادات' })
                : c.stats.quizAttemptsCount > 3
                  ? t('Parent.children.insight.strength.quizzes', { defaultValue: 'نقطة قوة: التزام بالاختبارات' })
                  : t('Parent.children.insight.strength.consistency', { defaultValue: 'نقطة قوة: انتظام في التعلم' });
            const focus =
              c.stats.quizAttemptsCount === 0
                ? t('Parent.children.insight.focus.quizzes', { defaultValue: 'فرصة تطوير: اختبارات أكثر هذا الأسبوع' })
                : c.stats.certificatesCount === 0
                  ? t('Parent.children.insight.focus.finish', { defaultValue: 'فرصة تطوير: إنهاء مسار للحصول على شهادة' })
                  : t('Parent.children.insight.focus.next', { defaultValue: 'فرصة تطوير: تحدٍ جديد بمستوى أعلى' });
            return (
              <Card
                key={c.id}
                className="group overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.22)] transition hover:shadow-[0_26px_70px_-40px_rgba(6,18,43,0.35)]"
              >
                <CardContent className="p-0">
                  <div className="relative bg-linear-to-br from-[#050c1f] via-[#0b2a5c] to-[#06122b] px-5 py-6 text-white">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background:radial-gradient(900px_circle_at_20%_0%,rgba(45,212,191,0.22),transparent_55%)]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-2xl font-black ring-1 ring-white/10">
                        {c.fullName.charAt(0)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1',
                            active
                              ? 'bg-[#2dd4bf]/15 text-white ring-white/10'
                              : 'bg-white/8 text-white/80 ring-white/10'
                          )}
                        >
                          {active ? t('Parent.children.active') : t('Parent.children.inactive')}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black ring-1 ring-white/10">
                          <Sparkles className="h-3.5 w-3.5 text-[#2dd4bf]" aria-hidden />
                          {t('Parent.children.gamification', {
                            defaultValue: 'Level {{level}} · XP {{xp}}',
                            level,
                            xp,
                          })}
                        </span>
                      </div>
                    </div>
                    <h2 className="mt-4 text-xl font-black leading-tight">{c.fullName}</h2>
                    <p className="mt-1 text-sm font-medium text-white/80">
                      @{c.username}
                      {c.age != null ? ` · ${t('Parent.children.age', { age: c.age })}` : ''}
                      {c.gradeLevel ? ` · ${c.gradeLevel}` : ''}
                    </p>
                  </div>
                  <div className="space-y-3 px-5 py-4">
                    {/* Value-add insight */}
                    <div className="rounded-3xl border border-[#2dd4bf]/20 bg-linear-to-br from-[#06122b]/4 via-white to-[#2dd4bf]/8 p-3">
                      <p className="text-xs font-black text-slate-900">{strength}</p>
                      <p className="mt-1 text-xs font-bold text-slate-600">{focus}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-slate-50 py-2">
                        <BookOpen className="mx-auto h-4 w-4 text-[#0b2a5c]" />
                        <p className="mt-1 text-lg font-black text-slate-900">{c.stats.enrollmentsCount}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">{t('Parent.children.tracks')}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 py-2">
                        <ClipboardList className="mx-auto h-4 w-4 text-[#0b2a5c]" />
                        <p className="mt-1 text-lg font-black text-slate-900">{c.stats.quizAttemptsCount}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">{t('Parent.children.quizzes')}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 py-2">
                        <Award className="mx-auto h-4 w-4 text-[#0b2a5c]" />
                        <p className="mt-1 text-lg font-black text-slate-900">{c.stats.certificatesCount}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">{t('Parent.children.certs')}</p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full rounded-2xl bg-[#06122b] font-bold shadow-md shadow-[#06122b]/15 hover:bg-[#050c1f]"
                    >
                      <Link to={`/parent/children/${c.id}`}>
                        {t('Parent.children.viewProgress')}
                        <ArrowLeft className="ms-2 h-4 w-4 rtl:rotate-180" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
