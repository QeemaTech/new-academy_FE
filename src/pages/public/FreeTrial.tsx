import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionWrapper from '../../components/common/SectionWrapper';
import AppCard from '../../components/common/AppCard';
import { programs } from '../../data/programs';
import { PrimaryButton } from '../../components/common/Button';

const TRIAL_LS_KEY = 'na_trial_bookings';

export default function FreeTrial() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    parentName: '',
    childName: '',
    childAge: '',
    email: '',
    phone: '',
    programId: '',
    preferredDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));
    try {
      const prev = JSON.parse(localStorage.getItem(TRIAL_LS_KEY) || '[]') as unknown[];
      const row = {
        id: `trial-${Date.now()}`,
        parentName: formData.parentName,
        childName: formData.childName,
        childAge: parseInt(formData.childAge, 10),
        email: formData.email,
        phone: formData.phone,
        programId: formData.programId,
        preferredDate: formData.preferredDate,
        status: 'pending' as const,
      };
      localStorage.setItem(TRIAL_LS_KEY, JSON.stringify([...prev, row]));
    } catch {
      /* ignore storage errors */
    }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SectionWrapper>
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <AppCard className="text-center p-5">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                style={{
                  width: 80,
                  height: 80,
                  background: 'var(--success-green)',
                  color: 'white',
                  fontSize: 40,
                }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
              <h3 className="mb-2">تم إرسال طلبك بنجاح!</h3>
              <p className="text-muted-custom mb-4">
                سنتواصل معك قريباً لتأكيد موعد الحصة التجريبية المجانية
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <PrimaryButton onClick={() => navigate('/ar')}>العودة للرئيسية</PrimaryButton>
                <PrimaryButton variant="outline" onClick={() => setSubmitted(false)}>
                  حجز تجربة أخرى
                </PrimaryButton>
              </div>
            </AppCard>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-sky section-padding-sm">
        <div className="container text-center">
          <h1 className="mb-3">احجز تجربة مجانية</h1>
          <p style={{ fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            جرب منصة نيو أكاديمي مجاناً واكتشف كيف يمكن لطفلك أن يتعلم البرمجة بطريقة ممتعة
          </p>
        </div>
      </section>

      <SectionWrapper>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <AppCard className="p-4 p-lg-5">
              <h4 className="mb-4">معلومات الحجز</h4>
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-600">اسم ولي الأمر</label>
                    <input
                      type="text"
                      className="form-control na-input"
                      value={formData.parentName}
                      onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600">اسم الطفل</label>
                    <input
                      type="text"
                      className="form-control na-input"
                      value={formData.childName}
                      onChange={e => setFormData({ ...formData, childName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-600">عمر الطفل</label>
                    <input
                      type="number"
                      className="form-control na-input"
                      min="5"
                      max="17"
                      value={formData.childAge}
                      onChange={e => setFormData({ ...formData, childAge: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600">البريد الإلكتروني</label>
                    <input
                      type="email"
                      className="form-control na-input"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-600">رقم الهاتف</label>
                    <input
                      type="tel"
                      className="form-control na-input"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600">البرنامج المفضل</label>
                    <select
                      className="form-select na-input"
                      value={formData.programId}
                      onChange={e => setFormData({ ...formData, programId: e.target.value })}
                      required
                    >
                      <option value="">اختر برنامج</option>
                      {programs.map(prog => (
                        <option key={prog.id} value={prog.id}>
                          {prog.title} ({prog.ageRange})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600">التاريخ المفضل</label>
                  <input
                    type="date"
                    className="form-control na-input"
                    value={formData.preferredDate}
                    onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <PrimaryButton type="submit" className="w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      جاري الحجز...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-check"></i>
                      احجز تجربة مجانية
                    </>
                  )}
                </PrimaryButton>
              </form>
            </AppCard>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}

