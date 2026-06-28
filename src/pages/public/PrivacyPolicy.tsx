import { Link } from 'react-router-dom';
import SectionWrapper from '../../components/common/SectionWrapper';
import AppCard from '../../components/common/AppCard';

export default function PrivacyPolicy() {
  return (
    <>
      <section className="bg-sky section-padding-sm">
        <div className="container">
          <Link to="/ar" className="text-decoration-none mb-3 d-inline-flex align-items-center gap-2">
            <i className="bi bi-arrow-right"></i>
            <span style={{ color: 'var(--primary-blue)' }}>العودة للرئيسية</span>
          </Link>
          <h1 className="mb-3">سياسة الخصوصية</h1>
        </div>
      </section>

      <SectionWrapper>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <AppCard className="p-4 p-lg-5">
              <div style={{ lineHeight: 1.9, fontSize: 15 }}>
                <h3 className="mb-3">1. جمع المعلومات</h3>
                <p className="mb-4">
                  نجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل أو استخدام خدماتنا، بما في ذلك الاسم والبريد
                  الإلكتروني ورقم الهاتف.
                </p>

                <h3 className="mb-3">2. استخدام المعلومات</h3>
                <p className="mb-4">
                  نستخدم المعلومات التي نجمعها لتقديم وتحسين خدماتنا التعليمية، والتواصل معك، وإرسال التحديثات
                  والتقارير.
                </p>

                <h3 className="mb-3">3. حماية المعلومات</h3>
                <p className="mb-4">
                  نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف.
                </p>

                <h3 className="mb-3">4. مشاركة المعلومات</h3>
                <p className="mb-4">
                  لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلومات محدودة مع شركاء موثوقين فقط لتقديم
                  خدماتنا.
                </p>

                <h3 className="mb-3">5. حقوقك</h3>
                <p className="mb-4">
                  لديك الحق في الوصول إلى معلوماتك الشخصية وتحديثها أو حذفها في أي وقت. يمكنك التواصل معنا لطلب
                  ذلك.
                </p>

                <p style={{ fontSize: 13, color: 'var(--muted-text)', marginTop: 40 }}>
                  آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
            </AppCard>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}

