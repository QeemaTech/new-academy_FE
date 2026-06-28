import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Twitter, Instagram, Youtube, Facebook } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchPublicSettings, PublicSettings } from '../../api/public';


const BRAND = '#4178EF';

export default function AppFooter() {
  const [settings, setSettings] = useState<PublicSettings>({});

  useEffect(() => {
    fetchPublicSettings().then(setSettings).catch(console.error);
  }, []);

  return (
    <>
      <section className="w-full bg-[#4178EF] py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="text-2xl font-black md:text-3xl">ابدأ رحلة طفلك التعليمية اليوم!</h2>
          <p className="mt-3 text-base font-medium text-white/90">
            احجز حصة تجريبية مجانية واكتشف عالم البرمجة مع نيو أكاديمي
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/ar/free-trial"
              className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-white px-8 text-base font-black shadow-lg transition hover:bg-white/95"
              style={{ color: BRAND }}
            >
              احجز تجربة مجانية
            </Link>
            <Link
              to="/ar/contact"
              className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full border-2 border-white/90 bg-transparent px-6 text-base font-bold text-white transition hover:bg-white/10"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[#1a1f36] pb-8 pt-14 text-[rgba(255,255,255,0.72)] md:pt-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  NA
                </span>
                <span className="text-lg font-black text-white">New-Academy</span>
              </div>
              <p className="text-sm leading-relaxed">
                منصة عربية لتعليم البرمجة للأطفال والناشئين بأسلوب تفاعلي وآمن.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings.youtube_url && (
                  <a
                    href={settings.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
                {settings.twitter_url && (
                  <a
                    href={settings.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-black text-white">روابط سريعة</h3>
              <ul className="space-y-2 text-sm font-semibold">
                {[
                  { label: 'الرئيسية', path: '/ar' },
                  { label: 'البرامج', path: '/ar/programs' },
                  { label: 'الأسعار', path: '/ar/pricing' },
                  { label: 'من نحن', path: '/ar/about' },
                  { label: 'المدونة', path: '/ar/blog' },
                ].map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-black text-white">المسارات</h3>
              <ul className="space-y-2 text-sm font-semibold">
                <li>
                  <Link to="/ar/programs" className="transition hover:text-white">
                    تصفح كل المسارات
                  </Link>
                </li>
                <li>
                  <Link to="/ar/free-trial" className="transition hover:text-white">
                    تجربة مجانية
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-black text-white">تواصل معنا</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/90" aria-hidden />
                  <a href={`mailto:${settings.contact_email || 'info@new-academy.com'}`} className="break-all font-medium hover:text-white">
                    {settings.contact_email || 'info@new-academy.com'}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/90" aria-hidden />
                  <span className="font-mono text-[13px] font-medium" dir="ltr">
                    {settings.support_phone || '+966 50 123 4567'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/90" aria-hidden />
                  <span>{settings.site_location || 'الرياض، المملكة العربية السعودية'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-around w-full gap-4 border-t border-white/10 pt-8 text-xs ">
            <div className="flex flex-col gap-1">
              <span>© {new Date().getFullYear()} New-Academy. جميع الحقوق محفوظة.</span>
              <a 
                href="https://www.qeematech.net/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity justify-center"
              >
                <span className="text-[10px]">Powered by</span>
                <img 
                  src="/qeema letters.svg" 
                  alt="Qeema Tech" 
                  className="h-4 w-auto brightness-0 invert px-2" 
                />
                <span className="font-bold tracking-tight text-white ml-2">
                  قيمة تك
                </span>
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/ar/policies/privacy" className="text-white/50 transition hover:text-white/80">
                سياسة الخصوصية
              </Link>
              <Link to="/ar/policies/terms" className="text-white/50 transition hover:text-white/80">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
