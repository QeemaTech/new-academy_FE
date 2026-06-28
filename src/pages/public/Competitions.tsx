import { Link } from 'react-router-dom';
import SectionWrapper from '../../components/common/SectionWrapper';
import AppCard from '../../components/common/AppCard';
import { competitions } from '../../data/competitions';
import { PrimaryButton } from '../../components/common/Button';

export default function Competitions() {
  const getStatusBadge = (status: string) => {
    if (status === 'active') return { label: 'جارية', class: 'na-badge--success' };
    if (status === 'upcoming') return { label: 'قادمة', class: 'na-badge--primary' };
    return { label: 'منتهية', class: 'na-badge--warning' };
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-sky section-padding-sm">
        <div className="container text-center">
          <h1 className="mb-3">المسابقات والمنافسات</h1>
          <p style={{ fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            شارك في مسابقاتنا المثيرة واربح جوائز قيمة وفرص تعليمية مميزة
          </p>
        </div>
      </section>

      <SectionWrapper>
        <div className="row g-4">
          {competitions.map(comp => {
            const statusBadge = getStatusBadge(comp.status);
            return (
              <div key={comp.id} className="col-md-6 col-lg-4">
                <AppCard className="h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 56,
                        height: 56,
                        background: 'var(--primary-blue-light)',
                        color: 'var(--primary-blue)',
                        fontSize: 28,
                      }}
                    >
                      <i className={`bi ${comp.icon}`}></i>
                    </div>
                    <span className={`na-badge ${statusBadge.class}`}>{statusBadge.label}</span>
                  </div>
                  <h5 className="mb-2">{comp.title}</h5>
                  <p className="mb-3" style={{ fontSize: 14, color: 'var(--muted-text)' }}>
                    {comp.description}
                  </p>
                  <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: 13 }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-calendar" style={{ color: 'var(--primary-blue)' }}></i>
                      <span>تاريخ المسابقة: {new Date(comp.date).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-clock" style={{ color: 'var(--primary-blue)' }}></i>
                      <span>آخر موعد للتسجيل: {new Date(comp.deadline).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-people" style={{ color: 'var(--primary-blue)' }}></i>
                      <span>الفئة العمرية: {comp.ageRange}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-check" style={{ color: 'var(--primary-blue)' }}></i>
                      <span>{comp.participants} مشارك</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="fw-bold mb-2" style={{ fontSize: 13 }}>الجوائز:</div>
                    <ul className="list-unstyled mb-0" style={{ fontSize: 12, color: 'var(--muted-text)' }}>
                      {comp.prizes.map((prize, i) => (
                        <li key={i} className="mb-1">
                          <i className="bi bi-trophy-fill me-1" style={{ color: 'var(--accent-yellow)' }}></i>
                          {prize}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {comp.status !== 'completed' && (
                    <Link to="/ar/free-trial" className="w-100 d-block">
                      <PrimaryButton className="w-100" size="sm">
                        سجل الآن
                      </PrimaryButton>
                    </Link>
                  )}
                </AppCard>
              </div>
            );
          })}
        </div>
      </SectionWrapper>
    </>
  );
}

