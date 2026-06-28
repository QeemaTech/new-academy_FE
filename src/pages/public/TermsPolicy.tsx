import { Link } from 'react-router-dom';
import SectionWrapper from '../../components/common/SectionWrapper';
import AppCard from '../../components/common/AppCard';

export default function TermsPolicy() {
  return (
    <>
      <section className="bg-sky section-padding-sm">
        <div className="container">
          <Link to="/ar" className="text-decoration-none mb-3 d-inline-flex align-items-center gap-2">
            <i className="bi bi-arrow-right"></i>
            <span style={{ color: 'var(--primary-blue)' }}>العودة للرئيسية</span>
          </Link>
          <h1 className="mb-3">الشروط والأحكام</h1>
        </div>
      </section>

      <SectionWrapper>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <AppCard className="p-4 p-lg-5">
              <div style={{ lineHeight: 1.9, fontSize: 15 }}>
                <h3 className="mb-3">1. القبول</h3>
                <p className="mb-4">
                  باستخدام منصة نيو أكاديمي، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق، يرجى
                  عدم استخدام خدماتنا.
                </p>

                <h3 className="mb-3">2. الاستخدام</h3>
                <p className="mb-4">
                  يجب استخدام منصة نيو أكاديمي للأغراض التعليمية فقط. يُمنع استخدام المنصة لأي أغراض غير قانونية أو
                  ضارة.
                </p>

                <h3 className="mb-3">3. الحسابات</h3>
                <p className="mb-4">
                  أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. يجب إبلاغنا فوراً عن أي استخدام غير
                  مصرح به.
                </p>

                <h3 className="mb-3">4. المدفوعات</h3>
                <p className="mb-4">
                  جميع المدفوعات غير قابلة للاسترداد إلا في حالات محددة. يرجى مراجعة سياسة الاسترداد قبل إتمام
                  الدفع.
                </p>

                <h3 className="mb-3">5. الملكية الفكرية</h3>
                <p className="mb-4">
                  جميع المحتويات التعليمية والمواد المقدمة في المنصة محمية بحقوق الطبع والنشر. يُمنع نسخ أو توزيع
                  هذه المواد دون إذن.
                </p>

                <h3 className="mb-3">6. الإلغاء</h3>
                <p className="mb-4">
                  يحق لنا إلغاء أو تعليق حسابك في حالة انتهاك هذه الشروط أو أي سلوك غير مناسب.
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

