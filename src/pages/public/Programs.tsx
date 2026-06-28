import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap } from 'lucide-react';
import { fetchPublicPrograms } from '../../api/public';
import { resolveUploadedFileUrl } from '../../lib/assetUrl';
import { Button } from '../../components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';

const BRAND = '#4178EF';

export default function Programs() {
  const { data: programs, isPending, isError, refetch } = useQuery({
    queryKey: ['public', 'programs'],
    queryFn: fetchPublicPrograms,
    staleTime: 60_000,
  });

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">برامجنا التعليمية</h1>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
            اكتشف البرامج المصممة لتناسب مختلف الأعمار والمستويات
          </p>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          {isPending && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-slate-200">
                  <Skeleton className="aspect-[16/10] w-full rounded-none" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardFooter>
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <p className="font-bold text-slate-800">تعذر تحميل البرامج.</p>
              <Button type="button" variant="outline" className="mt-4 border-[#4178EF] text-[#4178EF]" onClick={() => refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          )}

          {!isPending && !isError && programs && programs.length === 0 && (
            <p className="text-center font-medium text-slate-500">لا توجد برامج متاحة حالياً.</p>
          )}

          {!isPending && !isError && programs && programs.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((p) => {
                const cover = resolveUploadedFileUrl(p.coverImage);
                const blurb = p.shortDescription ?? p.description;
                return (
                  <Card
                    key={p.id}
                    className="flex h-full flex-col overflow-hidden border-slate-200 transition hover:border-[#4178EF]/35 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      {cover ? (
                        <img src={cover} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4178EF] via-indigo-500 to-violet-600"
                          aria-hidden
                        >
                          <GraduationCap className="h-16 w-16 text-white/90" strokeWidth={1.25} />
                        </div>
                      )}
                      <div className="absolute start-3 top-3 flex flex-wrap gap-2">
                        <Badge className="border-0 bg-white/95 font-black text-slate-800 shadow">
                          {p.minAge}–{p.maxAge} سنوات
                        </Badge>
                        <Badge className="border-0 bg-emerald-600 font-black text-white shadow">{p.trackCount} مسارات</Badge>
                      </div>
                    </div>
                    <CardHeader className="flex-1">
                      <CardTitle className="text-xl text-slate-900">{p.title}</CardTitle>
                      <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">{blurb}</p>
                    </CardHeader>
                    <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                      <div>
                        <span className="text-xl font-black tabular-nums" style={{ color: BRAND }}>
                          {Math.round(p.priceFrom)}
                        </span>
                        <span className="ms-1 text-sm font-semibold text-slate-500">ريال/شهرياً من</span>
                      </div>
                      <Button variant="outline" className="border-2 font-black" style={{ borderColor: BRAND, color: BRAND }} asChild>
                        <Link to={`/ar/programs/${p.id}`}>عرض التفاصيل</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
