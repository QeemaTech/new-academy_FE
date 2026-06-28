import { useEffect, useState } from 'react';
import AppCard from '../../components/common/AppCard';
import { PrimaryButton } from '../../components/common/Button';
import { useAuthStore } from '../../store/useAuthStore';

export default function StudentSettings() {
  const user = useAuthStore((s) => s.user);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    setFormData({
      name: user?.fullName || '',
      email: user?.email || '',
    });
  }, [user]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">الإعدادات</h2>
        <p className="text-muted-custom mb-0">إدارة إعدادات حسابك</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <AppCard>
            <h5 className="mb-4">المعلومات الشخصية</h5>
            <div className="d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-600">الاسم</label>
                <input
                  type="text"
                  className="form-control na-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label fw-600">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="form-control na-input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {saved && (
                <div className="alert alert-success d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle"></i>
                  تم حفظ التغييرات بنجاح
                </div>
              )}
              <PrimaryButton onClick={handleSave}>حفظ التغييرات</PrimaryButton>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
}

