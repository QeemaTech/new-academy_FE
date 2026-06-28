import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { loginPathForCheckout, subscriptionCheckoutPath } from '../../lib/checkoutLinks';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Coins,
  GraduationCap,
  Headphones,
  PauseCircle,
  Rocket,
  Sparkles,
  Telescope,
  Trophy,
  Users,
} from 'lucide-react';
import { fetchPublicPackages, type PublicPackage } from '../../api/public';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/cn';

const BRAND = '#4178EF';

/** Approximate total sessions for display (months × ~4 weeks × weekly sessions). */
function estimatedSessions(pkg: PublicPackage) {
  return Math.max(1, Math.round(pkg.durationMonths * 4 * pkg.sessionsPerWeek));
}

function pricePerSession(pkg: PublicPackage) {
  const n = estimatedSessions(pkg);
  return Math.round(pkg.price / n);
}

/** Sort by price, then move the highlighted package to the end (featured card on the outer side like the reference). */
function orderPackages(packages: PublicPackage[]) {
  const sorted = [...packages].sort((a, b) => a.price - b.price);
  const featured = sorted.find((p) => p.highlighted);
  if (!featured) return sorted;
  const rest = sorted.filter((p) => p.id !== featured.id);
  return [...rest, featured];
}

const tierArt = [
  { Icon: Telescope, artClass: 'text-[#4178EF]' },
  { Icon: Sparkles, artClass: 'text-amber-500' },
  { Icon: Rocket, artClass: 'text-[#4178EF]' },
] as const;

const featureLineIcons = [GraduationCap, PauseCircle, Calendar, Headphones, Users, Trophy, Coins] as const;

function FeatureRow({ text, index }: { text: string; index: number }) {
  const Icon = featureLineIcons[index % featureLineIcons.length];
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4178EF]/10">
        <Icon className="h-4 w-4 text-[#4178EF]" strokeWidth={2.25} />
      </span>
      <span className="pt-1 text-sm font-semibold leading-snug text-slate-600">{text}</span>
    </li>
  );
}

export default function Pricing() {
  const user = useAuthStore((s) => s.user);
  const isParent = user?.role?.toLowerCase() === 'parent';

  const { data: packages, isPending, isError, refetch } = useQuery({
    queryKey: ['public', 'packages'],
    queryFn: fetchPublicPackages,
    staleTime: 60_000,
  });

  const ordered = useMemo(() => (packages?.length ? orderPackages(packages) : []), [packages]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 via-slate-50/80 to-white">
      <section className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Section header — reference: icon + title + subtitle */}
          <div className="mb-10 flex flex-col items-center justify-center gap-3 text-center md:mb-12 md:flex-row md:gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4178EF]/12 shadow-sm shadow-[#4178EF]/10">
              <Users className="h-7 w-7 text-[#4178EF]" strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#4178EF] md:text-3xl">الحصص الخاصة</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500 md:text-base">(معلّم واحد وطالب واحد)</p>
            </div>
          </div>

          {isPending && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <Skeleton className="mx-auto mb-6 h-20 w-20 rounded-2xl" />
                  <Skeleton className="mx-auto mb-4 h-8 w-32" />
                  <Skeleton className="mb-2 h-10 w-full" />
                  <Skeleton className="mb-6 h-8 w-full rounded-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <p className="font-bold text-slate-800">تعذر تحميل الأسعار.</p>
              <Button type="button" variant="outline" className="mt-4 border-[#4178EF] text-[#4178EF]" onClick={() => refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          )}

          {!isPending && !isError && ordered.length === 0 && (
            <p className="text-center font-medium text-slate-500">لا توجد باقات متاحة حالياً.</p>
          )}

          {!isPending && !isError && ordered.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
              {ordered.map((pkg, idx) => {
                const popular = pkg.highlighted;
                const sessions = estimatedSessions(pkg);
                const perSession = pricePerSession(pkg);
                const art = tierArt[Math.min(idx, tierArt.length - 1)];
                const TierIllustration = art.Icon;
                const subscribeHref = isParent ? subscriptionCheckoutPath(pkg.id) : loginPathForCheckout(pkg.id);

                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      'relative flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-white shadow-sm transition',
                      popular ? 'z-[1] border-[#4178EF] shadow-lg shadow-[#4178EF]/12 md:scale-[1.02]' : 'border-slate-200/90'
                    )}
                  >
                    {popular && (
                      <div className="absolute end-3 top-3 z-10 rounded-full bg-gradient-to-l from-orange-500 to-red-500 px-3 py-1 text-[11px] font-black text-white shadow-md">
                        أفضل قيمة
                      </div>
                    )}

                    <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center">
                      <div
                        className={cn(
                          'mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-50',
                          popular && 'ring-2 ring-[#4178EF]/20'
                        )}
                      >
                        <TierIllustration className={cn('h-14 w-14', art.artClass)} strokeWidth={1.15} />
                      </div>

                      <h2 className="text-lg font-black text-slate-900 md:text-xl">{pkg.name}</h2>

                      <div className="mt-4 flex flex-wrap items-end justify-center gap-1">
                        <span className="text-4xl font-black tabular-nums leading-none" style={{ color: BRAND }}>
                          {Math.round(pkg.price).toLocaleString('ar-SA')}
                        </span>
                        <span className="pb-1 text-base font-bold text-slate-500">ريال</span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-400">
                        ≈ {perSession.toLocaleString('ar-SA')} ريال / حصة
                      </p>

                      <div className="mt-4 inline-flex rounded-full bg-[#4178EF]/10 px-4 py-2">
                        <span className="text-xs font-black text-[#4178EF]">
                          {pkg.durationMonths} {pkg.durationMonths === 1 ? 'شهر' : 'أشهر'} — {sessions} حصة مباشرة
                        </span>
                      </div>
                    </div>

                    <div className="mx-6 border-t border-slate-100" />

                    <ul className="flex flex-1 flex-col gap-3 px-6 py-6">
                      {pkg.features.map((f, i) => (
                        <FeatureRow key={`${pkg.id}-${i}`} text={f} index={i} />
                      ))}
                    </ul>

                    <div className="px-6 pb-8 pt-0">
                      <Button
                        asChild
                        className="h-12 w-full rounded-xl bg-[#4178EF] text-base font-black text-white shadow-md shadow-[#4178EF]/25 hover:bg-[#3264D6]"
                      >
                        <Link to={subscribeHref}>اشترك الآن</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-slate-200/80 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm md:mt-16">
            <h3 className="text-base font-black text-slate-900">هل تحتاج خطة مخصصة؟</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">تواصل معنا لنصمم معك تجربة تناسب احتياجات طفلك.</p>
            <Button asChild variant="outline" className="mt-5 border-[#4178EF] font-bold text-[#4178EF] hover:bg-[#4178EF]/5">
              <Link to="/ar/contact">تواصل معنا</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
