import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Lock, Loader2, CheckCircle2, Circle, Flag, Sparkles, Infinity as InfinityIcon, CalendarDays } from 'lucide-react';
import { fetchStudentTrack } from '../../api/student';
import { ProgressRing } from '../../components/student/ProgressRing';
import { SegmentedProgress } from '../../components/student/SegmentedProgress';
import { getMissionVisual } from '../../lib/studentGamify';
import { cn } from '../../lib/cn';

function weekIndexFrom(enrolledAtIso: string | null | undefined, estimatedWeeks: number) {
  if (!enrolledAtIso) return { weekIndex: 1, estimatedWeeks: Math.max(1, estimatedWeeks || 4) };
  const start = new Date(enrolledAtIso);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  const total = Math.max(1, estimatedWeeks || 4);
  if (!Number.isFinite(diff) || diff <= 0) return { weekIndex: 1, estimatedWeeks: total };
  const w = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return { weekIndex: Math.min(total, Math.max(1, w)), estimatedWeeks: total };
}

export default function TrackView() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-track', id],
    queryFn: () => fetchStudentTrack(id!),
    enabled: !!id,
    retry: false,
  });

  const { Icon, palette } = id ? getMissionVisual(id) : getMissionVisual('x');

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-[#4178EF]">
        <Sparkles className="h-10 w-10 animate-pulse" />
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-lg font-black">نرسم مسار المهمات…</span>
      </div>
    );
  }

  if (isAxiosError(error) && error.response?.status === 403) {
    return (
      <div
        className="mx-auto max-w-lg rounded-[2rem] border-4 border-amber-400 bg-gradient-to-br from-amber-100 to-white p-10 text-center shadow-[10px_10px_0_0_rgba(245,158,11,0.25)]"
        dir="rtl"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-amber-400 text-white shadow-lg">
          <Lock className="h-10 w-10" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">هذا العالم مقفول! 🔒</h2>
        <p className="mt-3 text-lg font-bold leading-relaxed text-slate-700">
          اطلب من ولي أمرك الاشتراك في هذا المسار لفتحه!
        </p>
        <Link
          to="/student/tracks"
          className="mt-8 inline-flex rounded-[1.25rem] bg-[#4178EF] px-8 py-4 font-black text-white shadow-[6px_6px_0_0_rgba(15,23,42,0.12)] transition-all hover:-translate-y-1 hover:shadow-xl"
        >
          عودة لخريطة العوالم
        </Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[2rem] border-4 border-red-300 bg-red-50 p-8 text-center font-black text-red-800" dir="rtl">
        تعذّر تحميل العالم.
      </div>
    );
  }

  const { track, lessons, progressPercent, completedLessons, totalLessons, enrollment } = data as any;
  const pace = weekIndexFrom(enrollment?.enrolledAt, track?.estimatedWeeks);

  return (
    <div className="space-y-10" dir="rtl">
      <section className="overflow-hidden rounded-[2rem] border-4 border-slate-900/10 bg-white/90 shadow-[12px_12px_0_0_rgba(65,120,239,0.12)]">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-5">
            <div
              className={cn(
                'flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] text-white shadow-xl ring-4 ring-white',
                palette.bg,
                palette.ring
              )}
            >
              <Icon className="h-11 w-11" strokeWidth={2.5} />
            </div>
            <div>
              <p className="inline-flex items-center gap-1 rounded-full bg-[#FFD100]/35 px-3 py-1 text-sm font-black text-amber-900">
                <Flag className="h-4 w-4" />
                عالم نشط
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/15 px-3 py-1 text-xs font-black text-emerald-800 ring-1 ring-emerald-600/20">
                  <InfinityIcon className="h-4 w-4" />
                  وصول مدى الحياة
                </span>
                {track?.estimatedWeeks ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-800 ring-1 ring-slate-200">
                    <CalendarDays className="h-4 w-4 text-[#4178EF]" />
                    <span dir="ltr" className="tabular-nums">
                      Week {pace.weekIndex} of {pace.estimatedWeeks}
                    </span>
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">{track.title}</h1>
              {track.program ? (
                <p className="mt-1 font-black text-[#4178EF]">{track.program.title}</p>
              ) : null}
              <p className="mt-4 max-w-3xl font-medium leading-relaxed text-slate-600">{track.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <ProgressRing
              percent={progressPercent}
              size={104}
              stroke={10}
              label="المستوى"
              strokeColor={palette.stroke}
              trackClassName="text-slate-200"
            />
            <div className="w-full min-w-[180px] space-y-2">
              <SegmentedProgress percent={progressPercent} segments={10} />
              <p className="text-center text-sm font-black text-slate-700">
                {completedLessons} / {totalLessons} مراحل
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-slate-900">
          <span className="rounded-[1rem] bg-emerald-400 px-2 py-1 text-lg">🎯</span>
          مسار المهمات
        </h2>
        <div className="relative me-6 border-e-4 border-dashed border-[#4178EF]/40 pe-8 md:me-10">
          {lessons.map(
            (
              lesson: {
                id: string;
                title: string;
                order: number;
                isCompleted: boolean;
                learningPathTitle: string | null;
              },
              idx: number
            ) => (
              <div key={lesson.id} className="relative mb-10 last:mb-2">
                <div
                  className={cn(
                    'absolute -end-[14px] top-5 h-5 w-5 rounded-full border-4 border-white shadow-md',
                    lesson.isCompleted ? 'bg-emerald-500 ring-4 ring-emerald-200' : 'bg-[#FFD100] ring-4 ring-amber-100'
                  )}
                />
                <div
                  className={cn(
                    'rounded-[2rem] border-4 border-slate-900/10 bg-white/95 p-5 shadow-[6px_6px_0_0_rgba(15,23,42,0.06)] transition-all',
                    'hover:-translate-y-1 hover:shadow-xl'
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      {lesson.isCompleted ? (
                        <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-emerald-500" strokeWidth={2.5} />
                      ) : (
                        <Circle className="mt-1 h-8 w-8 shrink-0 text-[#4178EF]/35" strokeWidth={2.5} />
                      )}
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-violet-600">
                          مرحلة {idx + 1}
                          {lesson.learningPathTitle ? ` · ${lesson.learningPathTitle}` : ''}
                        </p>
                        <p className="text-xl font-black text-slate-900">{lesson.title}</p>
                      </div>
                    </div>
                    <Link
                      to={`/student/lessons/${lesson.id}`}
                      className={cn(
                        'inline-flex shrink-0 items-center justify-center rounded-[1.25rem] px-8 py-3.5 text-base font-black shadow-[4px_4px_0_0_rgba(15,23,42,0.1)] transition-all hover:-translate-y-0.5',
                        lesson.isCompleted
                          ? 'border-4 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-[#4178EF] text-white hover:bg-[#3568d4] hover:shadow-lg'
                      )}
                    >
                      {lesson.isCompleted ? 'مراجعة 🔄' : 'ابدأ ⚡'}
                    </Link>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
