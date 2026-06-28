import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  PlayCircle,
  Sparkles,
  Calendar,
  Clock,
} from 'lucide-react';
import { fetchPublicProgramById } from '../../api/public';
import type { PublicLesson } from '../../api/public';
import { resolveUploadedFileUrl } from '../../lib/assetUrl';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';

const BRAND = '#4178EF';

function lessonIcon(type: string) {
  const cls = 'h-4 w-4 shrink-0';
  switch (type) {
    case 'VIDEO':
      return <PlayCircle className={cn(cls, 'text-[#4178EF]')} strokeWidth={2} />;
    case 'PDF':
      return <FileText className={cn(cls, 'text-rose-500')} strokeWidth={2} />;
    case 'TEXT':
      return <BookOpen className={cn(cls, 'text-emerald-600')} strokeWidth={2} />;
    default:
      return <Sparkles className={cn(cls, 'text-violet-500')} strokeWidth={2} />;
  }
}

function formatLessonMeta(lesson: PublicLesson) {
  const parts: string[] = [];
  if (lesson.duration != null) parts.push(`${lesson.duration} دقيقة`);
  const typeAr: Record<string, string> = {
    VIDEO: 'فيديو',
    PDF: 'ملف',
    TEXT: 'نص',
    MIXED: 'متنوع',
  };
  parts.push(typeAr[lesson.contentType] ?? lesson.contentType);
  return parts.join(' · ');
}

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: program, isPending, isError, error, refetch } = useQuery({
    queryKey: ['public', 'program', id],
    queryFn: () => fetchPublicProgramById(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
    retry: false,
  });

  const notFound = isError && isAxiosError(error) && error.response?.status === 404;

  if (!id) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="font-bold text-slate-800">معرّف البرنامج غير صالح.</p>
        <Button asChild className="mt-4 bg-[#4178EF] font-bold text-white hover:bg-[#3264D6]">
          <Link to="/ar/programs">العودة للبرامج</Link>
        </Button>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="font-bold text-slate-800">البرنامج غير موجود.</p>
        <Button asChild className="mt-4 bg-[#4178EF] font-bold text-white hover:bg-[#3264D6]">
          <Link to="/ar/programs">العودة للبرامج</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {isPending && (
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <Skeleton className="mb-6 h-8 w-40" />
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div>
              <Skeleton className="aspect-[21/9] w-full rounded-3xl" />
              <Skeleton className="mt-8 h-10 w-2/3" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
            <Skeleton className="hidden h-64 rounded-2xl lg:block" />
          </div>
        </div>
      )}

      {isError && !notFound && (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <p className="font-bold text-slate-800">تعذر تحميل البرنامج.</p>
          <Button type="button" variant="outline" className="mt-4 border-[#4178EF] text-[#4178EF]" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {program && (
        <>
          <section className="border-b border-slate-100 px-4 pb-10 pt-8 md:px-8 md:pb-14 md:pt-10">
            <div className="mx-auto max-w-7xl">
              <Link
                to="/ar/programs"
                className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#4178EF] hover:underline"
              >
                <ArrowRight className="h-4 w-4" />
                العودة للبرامج
              </Link>

              <div className="grid items-start gap-10 lg:grid-cols-[1fr_300px]">
                <div>
                  <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 shadow-sm">
                    <div className="aspect-[21/9] w-full md:aspect-[2.4/1]">
                      {resolveUploadedFileUrl(program.coverImage) ? (
                        <img
                          src={resolveUploadedFileUrl(program.coverImage) ?? ''}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4178EF] via-indigo-500 to-violet-700"
                          aria-hidden
                        >
                          <GraduationCap className="h-24 w-24 text-white/90" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-2">
                    <Badge className="rounded-full border-0 bg-[#4178EF]/12 px-3 py-1 text-xs font-black text-[#4178EF]">
                      {program.ageLabel}
                    </Badge>
                    <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700">
                      <Layers className="me-1 inline h-3.5 w-3.5" />
                      {program.totalTracks} مسارات
                    </Badge>
                    <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700">
                      <BookOpen className="me-1 inline h-3.5 w-3.5" />
                      {program.totalLessons} درساً
                    </Badge>
                    <Badge className="rounded-full border-0 bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                      من {Math.round(program.priceFrom)} ريال / شهر
                    </Badge>
                  </div>

                  <h1 className="mt-6 text-3xl font-black text-slate-900 md:text-4xl">{program.title}</h1>
                  <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-slate-600 md:text-lg">
                    {program.shortDescription ?? program.description}
                  </p>
                </div>

                <Card className="sticky top-24 hidden border-[#4178EF]/20 shadow-lg shadow-[#4178EF]/10 lg:block">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-slate-900">ابدأ الآن</CardTitle>
                    <p className="text-sm font-medium text-slate-500">اشترك في البرنامج وافتح كامل المسارات والدروس.</p>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="h-12 w-full rounded-xl bg-[#4178EF] text-base font-black text-white hover:bg-[#3264D6]">
                      <Link to="/ar/pricing">اشترك الآن</Link>
                    </Button>
                    <Button asChild variant="outline" className="mt-3 h-11 w-full rounded-xl border-2 font-bold" style={{ borderColor: BRAND, color: BRAND }}>
                      <Link to="/ar/free-trial">احجز تجربة مجانية</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="px-4 py-14 md:px-8 md:py-20">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-center text-2xl font-black text-slate-900 md:text-3xl">المنهج الدراسي</h2>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {program.tracks.map((track) => (
                  <AccordionItem
                    key={track.id}
                    value={track.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <AccordionTrigger className="px-4 py-4 text-start hover:no-underline md:px-6">
                      <div className="flex flex-col items-start gap-1 text-start">
                        <span className="text-base font-black text-slate-900 md:text-lg">{track.title}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {track.ageLabel} · {track.lessonCount} درساً
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-slate-100 px-4 pb-4 pt-4 md:px-6">
                      <p className="mb-4 text-sm leading-relaxed text-slate-600">{track.description}</p>
                      
                      {(track as any).schedules && (track as any).schedules.length > 0 && (
                        <div className="mb-6 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100/50">
                          <div className="mb-3 flex items-center gap-2 text-indigo-700">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-black">مواعيد الحصص المباشرة (أسبوعياً)</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(track as any).schedules.map((s: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 shadow-sm border border-indigo-100">
                                <span className="text-xs font-bold text-slate-700">
                                  {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][s.dayOfWeek]}
                                </span>
                                <span className="text-xs font-black text-indigo-600 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {s.startTime}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <ul className="space-y-2">
                        {track.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                          >
                            {lessonIcon(lesson.contentType)}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900">{lesson.title}</p>
                              <p className="text-xs font-medium text-slate-500">{formatLessonMeta(lesson)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Mobile sticky CTA */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
            <div className="pointer-events-auto mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md">
              <Button asChild className="h-12 w-full rounded-xl bg-[#4178EF] text-base font-black text-white shadow-lg shadow-[#4178EF]/25">
                <Link to="/ar/pricing">اشترك الآن</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
