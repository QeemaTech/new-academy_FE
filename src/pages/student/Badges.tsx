import AppCard from '../../components/common/AppCard';

export default function StudentBadges() {
  const badges = [
    { id: '1', title: 'مبتدئ البرمجة', icon: 'bi-star', color: '#ECC53E', earned: true, date: '2026-01-15' },
    { id: '2', title: 'صانع الألعاب', icon: 'bi-controller', color: '#366DEC', earned: true, date: '2026-02-01' },
    { id: '3', title: 'مطور الويب', icon: 'bi-globe', color: '#46D268', earned: false },
    { id: '4', title: 'خبير بايثون', icon: 'bi-code-slash', color: '#E39D6F', earned: false },
    { id: '5', title: 'مبتكر الروبوتات', icon: 'bi-robot', color: '#9B59B6', earned: false },
    { id: '6', title: 'قائد الفريق', icon: 'bi-people', color: '#E74C3C', earned: true, date: '2026-02-20' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">الشارات</h2>
        <p className="text-muted-custom mb-0">شاراتك وإنجازاتك</p>
      </div>

      <div className="row g-4">
        {badges.map(badge => (
          <div key={badge.id} className="col-md-6 col-lg-4">
            <AppCard className={`text-center p-4 ${!badge.earned ? 'opacity-50' : ''}`}>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                style={{
                  width: 80,
                  height: 80,
                  background: badge.earned
                    ? `color-mix(in srgb, ${badge.color} 18%, transparent)`
                    : 'var(--sky-bg)',
                  color: badge.earned ? badge.color : 'var(--muted-text)',
                  fontSize: 40,
                }}
              >
                <i className={`bi ${badge.icon}`}></i>
              </div>
              <h5 className="mb-2">{badge.title}</h5>
              {badge.earned ? (
                <>
                  <span className="na-badge na-badge--success mb-2">مكتسبة</span>
                  <div style={{ fontSize: 12, color: 'var(--muted-text)' }}>
                    {badge.date ? new Date(badge.date).toLocaleDateString('ar-SA') : ''}
                  </div>
                </>
              ) : (
                <span className="na-badge na-badge--warning">غير مكتسبة</span>
              )}
            </AppCard>
          </div>
        ))}
      </div>
    </div>
  );
}

