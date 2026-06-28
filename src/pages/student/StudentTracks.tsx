import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Orbit } from 'lucide-react';
import { fetchStudentTracks } from '../../api/student';
import { ProgressRing } from '../../components/student/ProgressRing';
import { SegmentedProgress } from '../../components/student/SegmentedProgress';
import { getMissionVisual } from '../../lib/studentGamify';
import { cn } from '../../lib/cn';

export default function StudentTracks() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['student-tracks'],
    queryFn: fetchStudentTracks,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-[#4178EF]">
        <Orbit className="h-12 w-12 animate-spin" strokeWidth={2.5} />
        <span className="text-lg font-black">نجهّز عوالمك…</span>
      </div>
    );
  }

  if (isError || !data?.tracks) {
    return (
      <div
        className="rounded-[2rem] border-4 border-red-300 bg-red-50 p-8 text-center font-black text-red-800"
        dir="rtl"
      >
        تعذّر تحميل العوالم.
      </div>
    );
  }

  const { tracks } = data;

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border-4 border-[#A855F7]/30 bg-gradient-to-br from-violet-500 to-[#4178EF] text-white shadow-lg">
          <Orbit className="h-9 w-9" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">خريطة العوالم 🗺️</h1>
          <p className="mt-1 text-lg font-bold text-slate-600">كل عالم فيه مهمات — اختر مغامرتك!</p>
        </div>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-[2rem] border-4 border-dashed border-slate-300 bg-white/70 p-14 text-center font-bold text-slate-600">
          لا عوالم بعد! عندما يفعّل ولي الأمر اشتراكك، تظهر هنا كنجوم ✨
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {tracks.map(
            (t: {
              trackId: string;
              title: string;
              description?: string;
              progressPercent: number;
              completedLessons: number;
              totalLessons: number;
            }) => {
              const { Icon, palette } = getMissionVisual(t.trackId);
              return (
                <article
                  key={t.trackId}
                  className={cn(
                    'overflow-hidden rounded-[2rem] border-4 border-slate-900/10 bg-white/95 shadow-[10px_10px_0_0_rgba(65,120,239,0.12)] transition-all duration-200',
                    'hover:-translate-y-1 hover:shadow-2xl'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-between gap-4 border-b-4 border-slate-900/5 px-6 py-5',
                      'bg-gradient-to-l from-white to-slate-50/80'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-20 w-20 items-center justify-center rounded-[1.5rem] text-white shadow-lg ring-4 ring-white',
                        palette.bg,
                        palette.ring
                      )}
                    >
                      <Icon className="h-10 w-10" strokeWidth={2.5} />
                    </div>
                    <ProgressRing
                      percent={t.progressPercent}
                      size={88}
                      stroke={9}
                      label="تقدّم"
                      strokeColor={palette.stroke}
                      trackClassName="text-slate-200"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <h2 className="text-2xl font-black text-slate-900">{t.title}</h2>
                    {t.description ? (
                      <p className="line-clamp-3 font-medium leading-relaxed text-slate-600">{t.description}</p>
                    ) : null}
                    <div className="space-y-2">
                      <SegmentedProgress percent={t.progressPercent} segments={8} />
                      <p className="text-sm font-black text-slate-700">
                        {t.completedLessons} من {t.totalLessons} مراحل مكتملة
                      </p>
                    </div>
                    <Link
                      to={`/student/tracks/${t.trackId}`}
                      className="flex w-full items-center justify-center gap-2 rounded-[1.25rem] border-4 border-slate-900/10 bg-[#4178EF] py-4 text-lg font-black text-white shadow-[6px_6px_0_0_rgba(15,23,42,0.12)] transition-all hover:-translate-y-0.5 hover:bg-[#3568d4] hover:shadow-xl"
                    >
                      ابدأ المهمات
                      <ChevronLeft className="h-5 w-5" strokeWidth={3} />
                    </Link>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
