import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppCard from '../../components/common/AppCard';
import { PrimaryButton } from '../../components/common/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <AppCard className="p-4 p-lg-5 text-center">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
          style={{
            width: 64,
            height: 64,
            background: 'var(--success-green)',
            color: 'white',
            fontSize: 32,
          }}
        >
          <i className="bi bi-check-lg"></i>
        </div>
        <h3 className="mb-2">تم إرسال الرابط!</h3>
        <p className="text-muted-custom mb-4">
          تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.
        </p>
        <Link to="/auth/login" className="btn btn-na-primary">
          العودة لتسجيل الدخول
        </Link>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-4 p-lg-5">
      <div className="text-center mb-4">
        <h2 className="mb-2">نسيت كلمة المرور؟</h2>
        <p className="text-muted-custom">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label fw-600 mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            className="form-control na-input"
            placeholder="example@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <PrimaryButton type="submit" className="w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              جاري الإرسال...
            </>
          ) : (
            <>
              <i className="bi bi-envelope"></i>
              إرسال رابط إعادة التعيين
            </>
          )}
        </PrimaryButton>
      </form>

      <div className="text-center mt-4">
        <Link to="/auth/login" className="text-decoration-none" style={{ fontSize: 14, color: 'var(--primary-blue)' }}>
          <i className="bi bi-arrow-right"></i> العودة لتسجيل الدخول
        </Link>
      </div>
    </AppCard>
  );
}

