import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlayCircle, Loader2, Map, CalendarDays, Radio, Video } from 'lucide-react';
import { fetchStudentCalendar, fetchStudentDashboard } from '../../api/student';
import { ProgressRing } from '../../components/student/ProgressRing';
import { SegmentedProgress } from '../../components/student/SegmentedProgress';
import { getMissionVisual } from '../../lib/studentGamify';
import { cn } from '../../lib/cn';

export default function StudentDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: fetchStudentDashboard,
  });

  const calQ = useQuery({
    queryKey: ['student-calendar', 'today-glance'],
    queryFn: () => fetchStudentCalendar(),
    staleTime: 30_000,
  });

  const todaySummary = useMemo(() => {
    const events = calQ.data?.events ?? [];
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    const isToday = (dt: Date) => dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;

    let live = 0;
    let recorded = 0;
    for (const e of events) {
      const start = new Date(e.startAt);
      if (!isToday(start)) continue;
      if (e.kind === 'LIVE') live++;
      else recorded++;
    }
    return { live, recorded, total: live + recorded };
  }, [calQ.data?.events]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-[#4178EF]">
        <div className="h-14 w-14 animate-bounce rounded-[1.5rem] border-4 border-[#4178EF]/30 bg-white shadow-lg" />
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-lg font-black">نحمّل عوالمك…</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="rounded-[2rem] border-4 border-red-300 bg-red-50 p-8 text-center font-black text-red-800 shadow-[6px_6px_0_0_rgba(220,38,38,0.2)]"
        dir="rtl"
      >
        تعذّر تحميل البيانات. حاول مرة أخرى!
      </div>
    );
  }

  const { overallProgressPercent, tracks, lastLessonWatched } = data;

  return (
    <div className="space-y-10" dir="rtl">
      {/* XP-style overall progress */}
      <section className="rounded-[2rem] border-4 border-slate-900/10 bg-white/80 p-6 shadow-[8px_8px_0_0_rgba(65,120,239,0.15)] backdrop-blur-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FFD100]/30 px-3 py-1 text-sm font-black text-amber-900">
              <Map className="h-4 w-4" />
              مستواك في كل العوالم
            </p>
            <p className="text-2xl font-black text-slate-900 md:text-3xl">شريط القوة الكلي ⚡</p>
            <p className="mt-1 font-bold text-slate-600">كل درس يملأ شريطك!</p>
          </div>
          <div className="flex items-center gap-5">
            <ProgressRing percent={overallProgressPercent} size={100} stroke={10} label="XP" strokeColor="#4178EF" />
            <div className="min-w-0 flex-1 space-y-3 md:min-w-[200px]">
              <SegmentedProgress percent={overallProgressPercent} segments={12} />
              <p className="text-center text-sm font-black text-slate-700">{overallProgressPercent}% مكتمل</p>
            </div>
          </div>
        </div>
      </section>

      {lastLessonWatched && (
        <section className="overflow-hidden rounded-[2rem] border-4 border-[#4178EF]/25 bg-gradient-to-br from-[#4178EF]/15 via-white to-[#FFD100]/10 p-1 shadow-[10px_10px_0_0_rgba(65,120,239,0.2)]">
          <div className="rounded-[1.75rem] bg-white/90 p-6 md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <p className="text-sm font-black text-[#4178EF]">🎬 مهمتك الحالية</p>
              <p className="mt-2 text-xl font-black text-slate-900 md:text-2xl">{lastLessonWatched.sessionTitle}</p>
              <p className="mt-1 font-bold text-slate-600">{lastLessonWatched.trackTitle}</p>
            </div>
            <Link
              to={`/student/lessons/${lastLessonWatched.sessionId}`}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-[#FFD100] px-8 py-4 text-lg font-black text-slate-900 shadow-[6px_6px_0_0_rgba(15,23,42,0.15)] transition-all hover:-translate-y-1 hover:shadow-xl md:mt-0"
            >
              <PlayCircle className="h-6 w-6" strokeWidth={2.5} />
              أكمل المغامرة
            </Link>
          </div>
        </section>
      )}

      {/* Quick Planner widget */}
      <section className="overflow-hidden rounded-[2rem] border-4 border-emerald-600/20 bg-gradient-to-br from-emerald-500/12 via-white to-[#4178EF]/10 p-1 shadow-[10px_10px_0_0_rgba(16,185,129,0.16)]">
        <div className="rounded-[1.75rem] bg-white/90 p-6 md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-black text-emerald-900">
              <CalendarDays className="h-4 w-4" strokeWidth={2.5} />
              جدول المهمات اليوم
            </p>
            <p className="mt-3 text-xl font-black text-slate-900 md:text-2xl">
              {todaySummary.total === 0
                ? 'ما عندك مهمات مجدولة اليوم ✨'
                : `عندك ${todaySummary.live} مهمة مباشرة و ${todaySummary.recorded} مهمة للتقدم اليوم`}
            </p>
            <p className="mt-2 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1">
                <Radio className="h-4 w-4 text-emerald-700" strokeWidth={2.5} />
                مباشر: {todaySummary.live}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#4178EF]/10 px-3 py-1">
                <Video className="h-4 w-4 text-[#4178EF]" strokeWidth={2.5} />
                مسجل/اختبار: {todaySummary.recorded}
              </span>
            </p>
          </div>

          <Link
            to="/student/planner"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-emerald-600 px-8 py-4 text-lg font-black text-white shadow-[6px_6px_0_0_rgba(15,23,42,0.12)] transition-all hover:-translate-y-1 hover:shadow-xl md:mt-0"
          >
            افتح جدول المهمات
            <PlayCircle className="h-6 w-6" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-slate-900 md:text-3xl">
          <span className="rounded-[1rem] bg-violet-500 px-3 py-1 text-lg text-white">🌍</span>
          عوالمك ومهماتك
        </h2>

        {tracks.length === 0 ? (
          <div className="rounded-[2rem] border-4 border-dashed border-slate-300 bg-white/60 p-12 text-center font-bold text-slate-600">
            لا توجد عوالم مفعّلة بعد — اطلب من بطلك في البيت (ولي الأمر) تفعيل اشتراك!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {tracks.map(
              (t: {
                trackId: string;
                title: string;
                progressPercent: number;
                completedLessons: number;
                totalLessons: number;
              }) => {
                const { Icon, palette } = getMissionVisual(t.trackId);
                return (
                  <Link
                    key={t.trackId}
                    to={`/student/tracks/${t.trackId}`}
                    className={cn(
                      'group block rounded-[2rem] border-4 border-slate-900/10 bg-white/90 p-6 shadow-[8px_8px_0_0_rgba(15,23,42,0.08)] transition-all duration-200',
                      'hover:-translate-y-1 hover:border-[#4178EF]/30 hover:shadow-xl'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          'flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] text-white shadow-lg ring-4',
                          palette.bg,
                          palette.ring,
                          palette.shadow
                        )}
                      >
                        <Icon className="h-8 w-8" strokeWidth={2.5} />
                      </div>
                      <ProgressRing
                        percent={t.progressPercent}
                        size={76}
                        stroke={8}
                        strokeColor={palette.stroke}
                        trackClassName="text-slate-200"
                      />
                    </div>
                    <h3 className="mt-4 text-xl font-black leading-snug text-slate-900 group-hover:text-[#4178EF]">
                      {t.title}
                    </h3>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      {t.completedLessons} / {t.totalLessons} مراحل مكتملة
                    </p>
                    <span className="mt-4 inline-flex rounded-[1rem] bg-[#4178EF]/10 px-3 py-1.5 text-sm font-black text-[#4178EF]">
                      ادخل العالم ←
                    </span>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}
