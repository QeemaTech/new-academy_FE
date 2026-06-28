import { useQuery } from '@tanstack/react-query';
import { Award, Download, Loader2, Crown } from 'lucide-react';
import { fetchStudentCertificates } from '../../api/student';
import { resolveUploadedFileUrl } from '../../lib/assetUrl';
import { cn } from '../../lib/cn';

const glowColors = [
  'shadow-[0_0_28px_rgba(65,120,239,0.45)]',
  'shadow-[0_0_28px_rgba(255,209,0,0.5)]',
  'shadow-[0_0_28px_rgba(168,85,247,0.45)]',
  'shadow-[0_0_28px_rgba(34,197,94,0.4)]',
];

export default function Achievements() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['student-certificates'],
    queryFn: fetchStudentCertificates,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-[#4178EF]">
        <Crown className="h-12 w-12 animate-bounce text-[#FFD100]" strokeWidth={2.5} />
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-lg font-black">نفتح قاعة الأبطال…</span>
      </div>
    );
  }

  if (isError || !data?.certificates) {
    return (
      <div className="rounded-[2rem] border-4 border-red-300 bg-red-50 p-8 text-center font-black text-red-800" dir="rtl">
        تعذّر تحميل الجوائز.
      </div>
    );
  }

  const { certificates } = data;

  return (
    <div className="space-y-10" dir="rtl">
      <div className="flex flex-wrap items-end gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-[1.5rem] bg-[#FFD100]/40 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] border-4 border-[#FFD100] bg-gradient-to-br from-[#FFD100] to-amber-500 text-white shadow-lg">
            <Award className="h-10 w-10" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <h1 className="bg-gradient-to-l from-[#4178EF] via-violet-600 to-[#FFD100] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
            قاعة الكؤوس 🏛️
          </h1>
          <p className="mt-1 text-lg font-bold text-slate-600">كل شهادة قصة فوز — اجمعهم كلهم!</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-[2rem] border-4 border-dashed border-violet-300 bg-violet-50/50 p-14 text-center font-bold text-slate-600">
          لا جوائز بعد… أكمل عوالمك لتضيء أول كأس هنا! ✨
        </div>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 xl:columns-3">
          {certificates.map(
            (
              c: {
                id: string;
                type: string;
                certificateUrl: string | null;
                issuedAt: string;
                track: { title: string };
                verificationCode: string;
                grade: number | null;
              },
              i: number
            ) => {
              const href = resolveUploadedFileUrl(c.certificateUrl);
              const glow = glowColors[i % glowColors.length];
              return (
                <article
                  key={c.id}
                  className={cn(
                    'mb-6 break-inside-avoid rounded-[2rem] border-4 border-slate-900/10 bg-white transition-all duration-300',
                    'hover:-translate-y-1 hover:shadow-2xl',
                    glow
                  )}
                >
                  <div className="rounded-t-[1.75rem] border-b-4 border-amber-200/60 bg-gradient-to-l from-[#4178EF]/15 via-violet-500/10 to-[#FFD100]/20 px-6 py-5">
                    <p className="text-xs font-black uppercase tracking-wider text-violet-700">كأس مميز</p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">{c.track.title}</h2>
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      {new Date(c.issuedAt).toLocaleDateString('ar-SA')} · {c.type}
                    </p>
                    {c.grade != null ? (
                      <p className="mt-3 inline-flex rounded-full bg-[#FFD100]/40 px-3 py-1 text-sm font-black text-amber-950">
                        ⭐ {c.grade}%
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-4 p-6">
                    <p className="text-[11px] font-bold text-slate-400">رمز التحقق: {c.verificationCode}</p>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="flex w-full items-center justify-center gap-2 rounded-[1.25rem] border-4 border-slate-900/10 bg-[#4178EF] py-4 font-black text-white shadow-[6px_6px_0_0_rgba(15,23,42,0.12)] transition-all hover:-translate-y-0.5 hover:bg-[#3568d4] hover:shadow-xl"
                      >
                        <Download className="h-5 w-5" strokeWidth={2.5} />
                        تنزيل الشهادة
                      </a>
                    ) : (
                      <p className="text-center text-sm font-bold text-amber-800">الملف غير جاهز بعد</p>
                    )}
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
