import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  BookOpen,
  Bot,
  Code,
  Cpu,
  Gamepad2,
  Globe,
  GraduationCap,
  Laptop,
  Lightbulb,
  MessageCircle,
  PlayCircle,
  Puzzle,
  Quote,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { fetchPublicFaqs, fetchPublicProjects, fetchPublicTracks } from '../../api/public';
import { resolveUploadedFileUrl } from '../../lib/assetUrl';
import { cn } from '../../lib/cn';
import { testimonials } from '../../data/testimonials';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';

const BRAND = '#4178EF';

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhySection />
      <SkillsSection />
      <TracksSection />
      <ProjectsSection />
      <TestimonialsSection />
      <FAQSection />
    </>
  );
}

/* ============ HERO (keep — brand #4178EF) ============ */
function HeroSection() {
  const techIcons = [
    { Icon: Cpu, label: 'CPU' },
    { Icon: Globe, label: 'Web' },
    { Icon: Bot, label: 'AI' },
    { Icon: Gamepad2, label: 'Games' },
    { Icon: Code, label: 'Code' },
  ];

  const stats = [
    { Icon: Users, value: '+5000', label: 'طالب', iconWrap: 'bg-[#4178EF]/15 text-[#4178EF]' },
    { Icon: GraduationCap, value: '200+', label: 'مدرسة', iconWrap: 'bg-emerald-500/15 text-emerald-600' },
    { Icon: Star, value: '98%', label: 'رضا', iconWrap: 'bg-amber-400/20 text-amber-600' },
  ];

  return (
    <section className="relative overflow-hidden px-4 py-16 md:px-8 md:py-20 lg:px-16">
      <div className="mx-auto grid min-h-[min(80vh,880px)] max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 flex flex-col justify-center lg:order-1">
          <div
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black md:text-sm"
            style={{ borderColor: `${BRAND}33`, backgroundColor: `${BRAND}14`, color: BRAND }}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" strokeWidth={2.5} />
            المنصة الأولى لتعليم البرمجة للأطفال
          </div>

          <h1 className="mb-5 text-4xl font-black leading-[1.15] tracking-tight text-slate-900 md:text-5xl lg:text-[3.25rem]">
            نبني مبرمجين <span style={{ color: BRAND }}>المستقبل</span> من اليوم
          </h1>

          <p className="mb-8 max-w-xl text-base font-medium leading-relaxed text-slate-500 md:text-lg">
            منصة تعليمية تفاعلية تقدم دورات برمجة مصممة خصيصاً للأطفال والناشئين من عمر 5 إلى 17 سنة، مع معلمين
            متخصصين ومناهج عربية احترافية.
          </p>

          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/ar/free-trial"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black text-white shadow-xl transition hover:opacity-95 md:h-14 md:px-8 md:text-base"
              style={{ backgroundColor: BRAND, boxShadow: `${BRAND}4d 0 20px 0` }}
            >
              <Rocket className="h-5 w-5 shrink-0" strokeWidth={2.25} />
              ابدأ تجربة مجانية
            </Link>
            <Link
              to="/ar/programs"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 bg-white px-6 text-sm font-black transition hover:bg-slate-50 md:h-14 md:px-8 md:text-base"
              style={{ borderColor: BRAND, color: BRAND }}
            >
              <PlayCircle className="h-5 w-5 shrink-0" strokeWidth={2.25} />
              تصفح البرامج
            </Link>
          </div>

          <div className="flex flex-wrap items-stretch gap-6 border-t border-slate-100 pt-8 md:gap-10">
            {stats.map(({ Icon, value, label, iconWrap }) => (
              <div
                key={label}
                className="flex min-w-[100px] flex-col items-center text-center sm:items-start sm:text-start"
              >
                <div
                  className={cn(
                    'mb-2 flex h-12 w-12 items-center justify-center rounded-2xl md:h-14 md:w-14',
                    iconWrap
                  )}
                >
                  <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={2} />
                </div>
                <span className="text-xl font-black tabular-nums text-slate-900 md:text-2xl">{value}</span>
                <span className="text-xs font-bold text-slate-500 md:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div
            className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl md:p-10"
            style={{ backgroundColor: BRAND, boxShadow: `0 25px 50px -12px ${BRAND}59` }}
          >
            <div className="pointer-events-none absolute -start-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 end-0 h-48 w-48 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute bottom-1/4 start-1/4 h-24 w-24 rounded-full bg-white/10" />

            <div className="absolute start-4 top-4 z-10 md:start-6 md:top-6">
              <div className="flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-black text-slate-800 shadow-lg md:text-sm">
                <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                <span>4.9</span>
                <span className="text-slate-500">تقييم</span>
              </div>
            </div>

            <div className="relative z-[1] flex flex-col items-center pt-10 text-center">
              <div className="relative mb-8">
                <Laptop className="mx-auto h-28 w-28 text-white/90 md:h-36 md:w-36" strokeWidth={1.25} />
                <div className="absolute inset-0 flex items-center justify-center pt-4">
                  <span className="font-mono text-2xl font-black text-white/95 md:text-3xl">&lt;/&gt;</span>
                </div>
              </div>

              <div className="mb-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {techIcons.map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30 md:h-14 md:w-14"
                    title={label}
                  >
                    <Icon className="h-6 w-6 text-white md:h-7 md:w-7" strokeWidth={2} />
                  </div>
                ))}
              </div>

              <h3 className="mb-2 text-xl font-black md:text-2xl">تعلّم، ابتكر، وانطلق!</h3>
              <p className="max-w-sm text-sm font-semibold text-white/90 md:text-base">بيئة تعليمية ممتعة وآمنة لأطفالك</p>
            </div>

            <div className="relative z-10 mt-8 flex justify-center md:mt-10">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black text-emerald-700 shadow-lg md:text-sm">
                <span className="text-lg leading-none text-emerald-500">✓</span>
                <span>50+ مشروع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ FEATURES ============ */
function WhySection() {
  const features = [
    { Icon: BookOpen, title: 'مناهج عربية', desc: 'محتوى تعليمي مصمم باللغة العربية يناسب ثقافة أطفالنا' },
    { Icon: Users, title: 'معلمون متخصصون', desc: 'فريق من المعلمين المؤهلين وذوي الخبرة في تعليم الأطفال' },
    { Icon: Laptop, title: 'تعلم تفاعلي', desc: 'حصص مباشرة أونلاين مع تطبيق عملي ومشاريع حقيقية' },
    { Icon: Shield, title: 'بيئة آمنة', desc: 'منصة آمنة ومراقبة لضمان سلامة وخصوصية أطفالك' },
    { Icon: BarChart3, title: 'تقارير دورية', desc: 'متابعة مستمرة وتقارير أداء أسبوعية لولي الأمر' },
    { Icon: Trophy, title: 'مسابقات وجوائز', desc: 'مسابقات دورية تحفز الأطفال وتنمي روح المنافسة الإيجابية' },
  ];

  return (
    <section className="border-t border-slate-100 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">لماذا نيو أكاديمي؟</h2>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
            نقدم تجربة تعليمية متكاملة ومميزة تجمع بين المتعة والفائدة
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-[#4178EF]/25 hover:shadow-md"
            >
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${BRAND}18`, color: BRAND }}
              >
                <Icon className="h-7 w-7" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-black text-slate-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ SKILLS ============ */
function SkillsSection() {
  const skills = [
    { Icon: Lightbulb, label: 'التفكير الإبداعي' },
    { Icon: Puzzle, label: 'التفكير المنطقي' },
    { Icon: Target, label: 'حل المشكلات' },
    { Icon: Users, label: 'العمل الجماعي' },
    { Icon: Rocket, label: 'الابتكار' },
    { Icon: MessageCircle, label: 'التواصل' },
    { Icon: GraduationCap, label: 'إدارة الوقت' },
    { Icon: Star, label: 'التركيز' },
  ];

  return (
    <section className="bg-slate-50/90 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">مهارات المستقبل</h2>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
            نطور مهارات أطفالك الأساسية من خلال تعلم البرمجة
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map(({ Icon, label }) => (
            <Badge
              key={label}
              variant="outline"
              className="h-auto gap-2 rounded-full border-[#4178EF]/25 bg-[#4178EF]/8 px-4 py-2 text-sm font-bold text-[#4178EF]"
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDurationMonths(n: number) {
  if (n === 1) return 'شهر واحد';
  if (n === 2) return 'شهرين';
  if (n >= 3 && n <= 10) return `${n} أشهر`;
  return `${n} شهراً`;
}

function formatStudentLine(name: string, age: number | null) {
  if (age == null) return name;
  return `${name}، ${age} ${age === 1 ? 'سنة' : 'سنوات'}`;
}

/* ============ TRACKS (dynamic) ============ */
function TracksSection() {
  const { data: tracks, isPending, isError, refetch } = useQuery({
    queryKey: ['public', 'tracks'],
    queryFn: fetchPublicTracks,
    staleTime: 60_000,
  });

  return (
    <section className="border-t border-slate-100 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">مسارات التعلم</h2>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
            برامج متنوعة تناسب جميع الأعمار والمستويات
          </p>
        </div>

        {isPending && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-slate-200">
                <Skeleton className="h-40 w-full rounded-none" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-[85%] max-w-[240px]" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-[90%]" />
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </CardContent>
                <CardFooter className="justify-between">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-10 w-24 rounded-lg" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="font-bold text-slate-800">تعذر تحميل المسارات. تحقق من الاتصال بالخادم.</p>
            <Button type="button" variant="outline" className="mt-4 border-[#4178EF] text-[#4178EF]" onClick={() => refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!isPending && !isError && tracks && tracks.length === 0 && (
          <p className="text-center font-medium text-slate-500">لا توجد مسارات متاحة حالياً.</p>
        )}

        {!isPending && !isError && tracks && tracks.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tracks.map((t) => (
                <Card
                  key={t.id}
                  className="flex h-full flex-col overflow-hidden border-slate-200 transition hover:border-[#4178EF]/30 hover:shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    {t.thumbnail ? (
                      <img
                        src={resolveUploadedFileUrl(t.thumbnail) ?? ''}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4178EF] via-indigo-500 to-violet-600"
                        aria-hidden
                      >
                        <GraduationCap className="h-16 w-16 text-white/90" strokeWidth={1.25} />
                      </div>
                    )}
                    <div className="absolute start-3 top-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-black text-slate-800 shadow">
                        {t.minAge}-{t.maxAge} سنوات
                      </span>
                      <span className="rounded-full bg-emerald-600/95 px-2.5 py-0.5 text-xs font-black text-white shadow">
                        {formatDurationMonths(t.durationMonths)}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="text-xl text-slate-900">{t.title}</CardTitle>
                    <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">{t.description}</p>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 pt-0">
                    {t.tags.slice(0, 6).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </CardContent>
                  <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <div>
                      <span className="text-2xl font-black tabular-nums" style={{ color: BRAND }}>
                        {Math.round(t.price)}
                      </span>
                      <span className="ms-1 text-sm font-semibold text-slate-500">ريال/شهرياً</span>
                    </div>
                    <Button
                      variant="outline"
                      size="md"
                      className="border-2 font-black"
                      style={{ borderColor: BRAND, color: BRAND }}
                      asChild
                    >
                      <Link to={t.programId ? `/ar/programs/${t.programId}` : '/ar/programs'}>التفاصيل</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button variant="outline" className="border-2 font-black" style={{ borderColor: BRAND, color: BRAND }} asChild>
                <Link to="/ar/programs">عرض جميع البرامج</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ============ PROJECTS (dynamic) ============ */
function ProjectsSection() {
  const { data: projects, isPending, isError, refetch } = useQuery({
    queryKey: ['public', 'projects'],
    queryFn: fetchPublicProjects,
    staleTime: 60_000,
  });

  const gradients = [
    'from-[#4178EF] to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-violet-500 to-purple-700',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
  ];

  return (
    <section className="bg-slate-50/90 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">مشاريع طلابنا</h2>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
            نفخر بما يبتكره طلابنا من مشاريع مميزة
          </p>
        </div>

        {isPending && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="font-bold text-slate-800">تعذر تحميل المشاريع.</p>
            <Button type="button" variant="outline" className="mt-4 border-[#4178EF] text-[#4178EF]" onClick={() => refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!isPending && !isError && projects && projects.length === 0 && (
          <p className="text-center font-medium text-slate-500">لا توجد مشاريع منشورة بعد.</p>
        )}

        {!isPending && !isError && projects && projects.length > 0 && (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {projects.map((p, idx) => {
              const img = resolveUploadedFileUrl(p.imageUrl);
              const g = gradients[idx % gradients.length];
              return (
                <div key={p.id} className="mb-4 break-inside-avoid">
                  <div className="group relative overflow-hidden rounded-2xl shadow-md">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-200">
                      {img ? (
                        <img src={img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div
                          className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br', g)}
                          aria-hidden
                        >
                          <Code className="h-14 w-14 text-white/90" strokeWidth={1.25} />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-3 backdrop-blur-sm">
                        <p className="text-sm font-black text-white">{p.title}</p>
                        <p className="text-xs font-semibold text-white/85">{formatStudentLine(p.studentName, p.age)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ TESTIMONIALS (static) ============ */
function TestimonialsSection() {
  const list = testimonials.slice(0, 3);

  return (
    <section className="border-t border-slate-100 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">ماذا يقول أولياء الأمور؟</h2>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
            آراء حقيقية من أسر سعيدة بتجربة أطفالها مع نيو أكاديمي
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {list.map((t) => (
            <Card key={t.id} className="flex h-full flex-col border-slate-200 p-6 shadow-sm">
              <Quote className="mb-4 h-10 w-10 text-[#4178EF]/40" strokeWidth={1.5} />
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-900">{t.name}</p>
                  <p className="text-xs font-medium text-slate-500">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ FAQ (dynamic + accordion) ============ */
function FAQSection() {
  const { data: faqs, isPending, isError, refetch } = useQuery({
    queryKey: ['public', 'faqs'],
    queryFn: fetchPublicFaqs,
    staleTime: 60_000,
  });

  return (
    <section className="bg-slate-50/90 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <h2 className="text-3xl font-black text-slate-900 md:text-4xl">الأسئلة الشائعة</h2>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">إجابات على أكثر الأسئلة تكراراً</p>
        </div>

        {isPending && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="font-bold text-slate-800">تعذر تحميل الأسئلة الشائعة.</p>
            <Button type="button" variant="outline" className="mt-4 border-[#4178EF] text-[#4178EF]" onClick={() => refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!isPending && !isError && faqs && faqs.length === 0 && (
          <p className="text-center font-medium text-slate-500">لا توجد أسئلة مضافة بعد.</p>
        )}

        {!isPending && !isError && faqs && faqs.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-2 shadow-sm md:px-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-slate-100">
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </section>
  );
}
