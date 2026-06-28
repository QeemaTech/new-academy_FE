import { useQuery } from '@tanstack/react-query';
import { BookOpen, Heart, Lightbulb, Shield, Star, Users } from 'lucide-react';
import { fetchPublicPageBySlug } from '../../api/public';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

const FALLBACK_HTML = `<p>نيو أكاديمي منصة عربية رائدة لتعليم البرمجة للأطفال والناشئين.</p>
<p>نؤمن بأن كل طفل يستطيع أن يصبح مبدعاً رقمياً عندما يحصل على التوجيه الصحيح والمحتوى المناسب لعمره.</p>`;

const stats = [
  { number: '+5000', label: 'طالب وطالبة', Icon: Users },
  { number: '+200', label: 'معلم متخصص', Icon: BookOpen },
  { number: '6+', label: 'برامج تعليمية', Icon: Lightbulb },
  { number: '98%', label: 'رضا أولياء الأمور', Icon: Star },
];

const values = [
  { Icon: Heart, title: 'الشغف', desc: 'نؤمن بقوة التعليم وأثره الإيجابي على مستقبل أطفالنا', color: '#E74C3C' },
  { Icon: Lightbulb, title: 'الابتكار', desc: 'نطور مناهج حديثة وتفاعلية تجعل التعلم ممتعاً وفعالاً', color: '#ECC53E' },
  { Icon: Shield, title: 'الجودة', desc: 'نلتزم بأعلى معايير الجودة في التعليم والخدمة', color: '#46D268' },
  { Icon: Users, title: 'المجتمع', desc: 'نبني مجتمعاً تعليمياً داعماً ومحفزاً للأطفال', color: '#4178EF' },
];

export default function About() {
  const { data: page, isPending } = useQuery({
    queryKey: ['public', 'page', 'about-us'],
    queryFn: () => fetchPublicPageBySlug('about-us'),
    staleTime: 5 * 60_000,
  });

  const title = page?.title ?? 'من نحن';
  const html = page?.content ?? FALLBACK_HTML;

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{title}</h1>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
            نيو أكاديمي — منصة تعليمية متخصصة في تعليم الأطفال والناشئين مهارات البرمجة والتكنولوجيا
          </p>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl">
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : (
            <div className="public-prose rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-10" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/50 px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-2xl font-black text-slate-900 md:text-3xl">قيمنا</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ Icon, title: vt, desc, color }) => (
              <Card key={vt} className="border-slate-200 p-6 text-center shadow-sm">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-lg font-black text-slate-900">{vt}</h3>
                <p className="text-sm font-medium leading-relaxed text-slate-600">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-2xl font-black text-slate-900 md:text-3xl">إحصائياتنا</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ number, label, Icon }) => (
              <Card key={label} className="border-slate-200 p-6 text-center shadow-sm">
                <Icon className="mx-auto mb-3 h-8 w-8 text-[#4178EF]" strokeWidth={2} />
                <div className="text-3xl font-black text-[#4178EF]">{number}</div>
                <div className="mt-1 text-sm font-semibold text-slate-500">{label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
