import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  Sparkles,
  ClipboardList,
  Clapperboard,
} from 'lucide-react';
import {
  fetchStudentLesson,
  postLessonComplete,
  fetchStudentQuiz,
  submitStudentQuiz,
} from '../../api/student';
import { resolveUploadedFileUrl } from '../../lib/assetUrl';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/cn';
import toast from 'react-hot-toast';

function getYoutubeEmbedUrl(raw: string): string | null {
  try {
    const url = raw.includes('http') ? raw : `https://${raw}`;
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;
    const parts = u.pathname.split('/').filter(Boolean);
    const embedIdx = parts.indexOf('embed');
    if (embedIdx >= 0 && parts[embedIdx + 1]) return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
  } catch {
    return null;
  }
  return null;
}

export default function LearningRoom() {
  const { id: sessionId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);

  const lessonQuery = useQuery({
    queryKey: ['student-lesson', sessionId],
    queryFn: () => fetchStudentLesson(sessionId!),
    enabled: !!sessionId,
    retry: false,
  });

  const quizDetailQuery = useQuery({
    queryKey: ['student-quiz', quizId],
    queryFn: () => fetchStudentQuiz(quizId!),
    enabled: !!quizId && quizOpen,
  });

  const completeMutation = useMutation({
    mutationFn: () => postLessonComplete(sessionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-lesson', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['student-tracks'] });
      toast.success('مستوى جديد! 🎉');
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: () => {
      const q = quizDetailQuery.data;
      if (!q?.questions) throw new Error('No quiz');
      const payload = {
        answers: q.questions.map((qn: { id: string }) => ({
          questionId: qn.id,
          selectedOptionId: answers[qn.id] || null,
        })),
      };
      return submitStudentQuiz(quizId!, payload);
    },
    onSuccess: (res: { score?: number; isPassed?: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['student-quiz', quizId] });
      setQuizOpen(false);
      setAnswers({});
      toast.success(
        res?.isPassed
          ? `أسطورة! نجحت — ${res?.score ?? ''}%`
          : `تم الإرسال — ${res?.score ?? ''}%`
      );
    },
    onError: (e: unknown) => {
      const msg = isAxiosError(e) ? (e.response?.data as { message?: string })?.message : undefined;
      toast.error(msg || 'تعذّر إرسال الاختبار');
    },
  });

  const videoEmbed = useMemo(() => {
    const url = lessonQuery.data?.lesson?.videoUrl;
    if (!url) return null;
    return getYoutubeEmbedUrl(url);
  }, [lessonQuery.data?.lesson?.videoUrl]);

  const pdfHref = useMemo(
    () => resolveUploadedFileUrl(lessonQuery.data?.lesson?.pdfUrl),
    [lessonQuery.data?.lesson?.pdfUrl]
  );

  if (lessonQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-[#4178EF]">
        <Clapperboard className="h-12 w-12 animate-bounce" />
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-lg font-black">نجهّز العرض…</span>
      </div>
    );
  }

  if (isAxiosError(lessonQuery.error) && lessonQuery.error.response?.status === 403) {
    return (
      <div
        className="mx-auto max-w-lg rounded-[2rem] border-4 border-amber-400 bg-amber-50/80 p-10 text-center shadow-lg"
        dir="rtl"
      >
        <Lock className="mx-auto h-12 w-12 text-amber-700" />
        <h2 className="mt-4 text-2xl font-black text-slate-900">الدرس مقفول</h2>
        <p className="mt-2 font-bold text-slate-700">اطلب من ولي أمرك الاشتراك في هذا المسار لفتحه!</p>
        <Link
          to="/student/tracks"
          className="mt-6 inline-flex rounded-[1.25rem] bg-[#4178EF] px-8 py-4 font-black text-white shadow-lg"
        >
          عوالمي
        </Link>
      </div>
    );
  }

  if (lessonQuery.error || !lessonQuery.data) {
    return (
      <div className="rounded-[2rem] border-4 border-red-300 bg-red-50 p-8 text-center font-black text-red-800" dir="rtl">
        تعذّر تحميل الدرس.
      </div>
    );
  }

  const { lesson, track, progress, quizzes } = lessonQuery.data;
  const primaryQuiz = quizzes?.[0];

  return (
    <div className="space-y-10" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-[#4178EF]">{track.title}</p>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{lesson.title}</h1>
        </div>
        <Link
          to={`/student/tracks/${track.id}`}
          className="inline-flex items-center gap-2 rounded-[1.25rem] border-4 border-slate-200 bg-white px-5 py-3 font-black text-slate-800 shadow-[4px_4px_0_0_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          خريطة العالم
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {/* Theater mode */}
          <div
            className="overflow-hidden rounded-[2rem] border-4 border-slate-900/15 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(65,120,239,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
            style={{ boxShadow: '0 25px 60px -15px rgba(65,120,239,0.35), 0 0 40px -10px rgba(168,85,247,0.25)' }}
          >
            <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-2">
              <Clapperboard className="h-4 w-4 text-[#FFD100]" />
              <span className="text-xs font-black uppercase tracking-widest text-white/70">وضع السينما</span>
            </div>
            <div className="aspect-video w-full bg-black">
              {videoEmbed ? (
                <iframe
                  title={lesson.title}
                  src={videoEmbed}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : lesson.videoUrl ? (
                <video
                  src={resolveUploadedFileUrl(lesson.videoUrl) || undefined}
                  controls
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-bold text-white/60">لا فيديو بعد 🎬</div>
              )}
            </div>
          </div>

          {primaryQuiz && (
            <Card className="rounded-[2rem] border-4 border-violet-300/50 bg-gradient-to-br from-violet-50/90 to-white shadow-[8px_8px_0_0_rgba(139,92,246,0.15)]">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <ClipboardList className="h-6 w-6 text-violet-600" strokeWidth={2.5} />
                  تحدي الدرس
                </CardTitle>
                <Button
                  type="button"
                  className="rounded-[1rem] border-4 border-violet-200 bg-violet-600 py-6 font-black text-white shadow-[4px_4px_0_0_rgba(15,23,42,0.12)] hover:bg-violet-700"
                  onClick={() => {
                    setQuizId(primaryQuiz.id);
                    setQuizOpen(true);
                  }}
                >
                  ابدأ التحدي!
                </Button>
              </CardHeader>
              {quizOpen && quizId && (
                <CardContent className="space-y-6 border-t-4 border-dashed border-violet-100 pt-6">
                  {quizDetailQuery.isLoading && (
                    <div className="flex items-center gap-2 font-black text-violet-600">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      تحميل الأسئلة…
                    </div>
                  )}
                  {quizDetailQuery.data?.questions?.map(
                    (q: {
                      id: string;
                      text: string;
                      options: { id: string; text: string }[];
                    }) => (
                      <div
                        key={q.id}
                        className="rounded-[1.5rem] border-4 border-slate-100 bg-white p-5 shadow-sm"
                      >
                        <p className="mb-4 text-lg font-black text-slate-900">{q.text}</p>
                        <RadioGroup
                          value={answers[q.id] ?? ''}
                          onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                          className="gap-3"
                        >
                          {q.options.map((o) => (
                            <div
                              key={o.id}
                              className={cn(
                                'flex items-center gap-3 rounded-[1.25rem] border-4 border-transparent bg-slate-50 px-4 py-3 transition-all',
                                answers[q.id] === o.id &&
                                  'border-[#4178EF]/40 bg-[#4178EF]/10 shadow-[3px_3px_0_0_rgba(65,120,239,0.2)]'
                              )}
                            >
                              <RadioGroupItem value={o.id} id={`${q.id}-${o.id}`} />
                              <Label htmlFor={`${q.id}-${o.id}`} className="flex-1 cursor-pointer font-bold">
                                {o.text}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )
                  )}
                  {quizDetailQuery.data && (
                    <button
                      type="button"
                      disabled={submitQuizMutation.isPending}
                      className="w-full rounded-[1.5rem] border-4 border-emerald-700 bg-emerald-500 py-5 text-lg font-black text-white shadow-[8px_8px_0_0_rgba(21,128,61,0.35)] transition-all hover:-translate-y-0.5 hover:bg-emerald-600 disabled:opacity-60"
                      onClick={() => submitQuizMutation.mutate()}
                    >
                      {submitQuizMutation.isPending ? 'جاري الإرسال…' : 'إرسال الإجابات ✓'}
                    </button>
                  )}
                </CardContent>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-[2rem] border-4 border-slate-900/10 bg-white/90 shadow-[8px_8px_0_0_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <Sparkles className="h-6 w-6 text-[#FFD100]" strokeWidth={2.5} />
                كنز الدرس
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-medium leading-relaxed text-slate-700">
              {lesson.description ? <p>{lesson.description}</p> : <p className="text-slate-500">لا يوجد وصف إضافي.</p>}
              {lesson.textContent ? (
                <div className="rounded-[1.25rem] border-4 border-slate-100 bg-slate-50 p-4 text-sm whitespace-pre-wrap">
                  {lesson.textContent}
                </div>
              ) : null}
              {pdfHref ? (
                <a
                  href={pdfHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-[1.25rem] border-4 border-[#4178EF]/30 bg-[#4178EF]/10 px-5 py-4 font-black text-[#4178EF] transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <FileText className="h-5 w-5" strokeWidth={2.5} />
                  فتح PDF
                </a>
              ) : null}
            </CardContent>
          </Card>

          {/* Level-up button */}
          <div className="rounded-[2rem] border-4 border-emerald-500/40 bg-gradient-to-br from-emerald-100 via-white to-emerald-50 p-6 shadow-[0_0_24px_rgba(34,197,94,0.25)]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-200">
                <CheckCircle2 className="h-11 w-11" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">
                  {progress?.isCompleted ? 'أكملت المرحلة! 🏆' : 'هل انتهيت من المشاهدة؟'}
                </p>
                <p className="mt-1 font-bold text-slate-600">اضغط لترقية تقدّمك وتفتح المرحلة التالية!</p>
              </div>
              <button
                type="button"
                disabled={completeMutation.isPending || progress?.isCompleted}
                onClick={() => completeMutation.mutate()}
                className={cn(
                  'flex w-full max-w-sm items-center justify-center gap-3 rounded-[2rem] border-4 border-emerald-800 py-6 text-xl font-black shadow-[10px_10px_0_0_rgba(21,128,61,0.35)] transition-all',
                  progress?.isCompleted
                    ? 'cursor-default border-slate-200 bg-slate-200 text-slate-500 shadow-none'
                    : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white hover:-translate-y-1 hover:shadow-2xl active:translate-y-0'
                )}
              >
                <CheckCircle2 className="h-8 w-8" strokeWidth={2.5} />
                {progress?.isCompleted ? 'مكتمل!' : completeMutation.isPending ? 'جاري الحفظ…' : 'ترقية! إكمال المرحلة'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
