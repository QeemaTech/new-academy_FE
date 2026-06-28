import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, FileText } from 'lucide-react';
import { fetchPublicArticles } from '../../api/public';
import { resolveUploadedFileUrl } from '../../lib/assetUrl';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export default function Blog() {
  const { data: posts, isPending, isError, refetch } = useQuery({
    queryKey: ['public', 'articles'],
    queryFn: fetchPublicArticles,
    staleTime: 60_000,
  });

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">المدونة</h1>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
            مقالات ونصائح حول تعليم البرمجة للأطفال ومهارات المستقبل
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
                  <CardContent className="p-5">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-3 h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <p className="font-bold text-slate-800">تعذر تحميل المقالات.</p>
              <Button type="button" variant="outline" className="mt-4 border-[#4178EF] text-[#4178EF]" onClick={() => refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          )}

          {!isPending && !isError && posts && posts.length === 0 && (
            <p className="text-center font-medium text-slate-500">لا توجد مقالات منشورة بعد.</p>
          )}

          {!isPending && !isError && posts && posts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const img = resolveUploadedFileUrl(post.image);
                const dateStr = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('ar-SA')
                  : null;
                return (
                  <Card
                    key={post.id}
                    className="group flex h-full flex-col overflow-hidden border-slate-200 transition hover:border-[#4178EF]/30 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      {img ? (
                        <img src={img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                          <FileText className="h-12 w-12 opacity-50" strokeWidth={1.25} />
                        </div>
                      )}
                    </div>
                    <CardContent className="flex flex-1 flex-col p-5">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-[#4178EF]/30 bg-[#4178EF]/8 font-bold text-[#4178EF]">
                          {post.category}
                        </Badge>
                        {post.readTime != null && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            {post.readTime} د
                          </span>
                        )}
                        {dateStr && <span className="text-xs font-medium text-slate-400">{dateStr}</span>}
                      </div>
                      <h2 className="text-lg font-black text-slate-900 group-hover:text-[#4178EF]">{post.title}</h2>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm font-medium leading-relaxed text-slate-600">{post.excerpt}</p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                      <span className="text-xs font-bold text-slate-500">{post.authorName}</span>
                      <Link
                        to={`/ar/blog/${post.slug}`}
                        className="text-sm font-black text-[#4178EF] hover:underline"
                      >
                        اقرأ المزيد
                      </Link>
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
