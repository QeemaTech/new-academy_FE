import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock } from 'lucide-react';
import { fetchPublicArticleBySlug } from '../../api/public';
import { resolveUploadedFileUrl } from '../../lib/assetUrl';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isPending, isError, isSuccess, refetch } = useQuery({
    queryKey: ['public', 'article', slug],
    queryFn: () => fetchPublicArticleBySlug(slug as string),
    enabled: Boolean(slug),
    retry: false,
  });

  if (!slug) {
    return <Navigate to="/ar/blog" replace />;
  }

  if (isSuccess && post === null) {
    return <Navigate to="/ar/blog" replace />;
  }

  const img = post?.image ? resolveUploadedFileUrl(post.image) : null;
  const dateStr = post?.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ar-SA') : null;

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/ar/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#4178EF] hover:underline"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للمدونة
          </Link>

          {isPending && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="font-bold">تعذر تحميل المقال.</p>
              <Button type="button" variant="outline" className="mt-4 border-[#4178EF] text-[#4178EF]" onClick={() => refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          )}

          {post && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-[#4178EF]/12 font-bold text-[#4178EF]">{post.category}</Badge>
                {post.readTime != null && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
                    <Clock className="h-4 w-4" />
                    {post.readTime} دقيقة قراءة
                  </span>
                )}
                {dateStr && <span className="text-sm font-medium text-slate-400">{dateStr}</span>}
              </div>
              <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl">{post.title}</h1>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4178EF] text-lg font-black text-white">
                  {post.authorName.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-900">{post.authorName}</p>
                  <p className="text-xs font-medium text-slate-500">كاتب المقال</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {post && (
        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-3xl">
            {img && (
              <div className="mb-10 overflow-hidden rounded-3xl border border-slate-100 shadow-md">
                <img src={img} alt="" className="max-h-[420px] w-full object-cover" />
              </div>
            )}
            <div className="public-prose rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-10">
              {/<[a-z][\s\S]*>/i.test(post.content) ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                <div className="whitespace-pre-wrap">{post.content}</div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
