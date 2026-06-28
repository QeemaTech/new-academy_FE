import AppCard from '../../components/common/AppCard';

export default function StudentProjects() {
  const projects = [
    { id: '1', title: 'لعبة المتاهة', program: 'سكراتش المتقدم', date: '2026-02-15', status: 'completed' },
    { id: '2', title: 'حاسبة بايثون', program: 'بايثون للأطفال', date: '2026-03-01', status: 'completed' },
    { id: '3', title: 'قصة تفاعلية', program: 'سكراتش المتقدم', date: '2026-02-20', status: 'completed' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">المشاريع</h2>
        <p className="text-muted-custom mb-0">مشاريعك المنجزة</p>
      </div>

      <div className="row g-4">
        {projects.map(project => (
          <div key={project.id} className="col-md-6 col-lg-4">
            <AppCard>
              <div
                className="d-flex align-items-center justify-content-center rounded-na mb-3"
                style={{
                  height: 160,
                  background: 'var(--sky-bg)',
                }}
              >
                <i className="bi bi-folder fs-1" style={{ color: 'var(--primary-blue)', opacity: 0.3 }}></i>
              </div>
              <h5 className="mb-2">{project.title}</h5>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="na-badge na-badge--primary">{project.program}</span>
                <span className="na-badge na-badge--success">مكتمل</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted-text)' }} className="mb-3">
                تاريخ الإنجاز: {new Date(project.date).toLocaleDateString('ar-SA')}
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-na-primary btn-sm-na flex-fill">عرض المشروع</button>
                <button className="btn btn-na-outline btn-sm-na">تحميل</button>
              </div>
            </AppCard>
          </div>
        ))}
      </div>
    </div>
  );
}

