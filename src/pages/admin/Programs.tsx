import { programs } from '../../data/programs';
import AppCard from '../../components/common/AppCard';
import { PrimaryButton } from '../../components/common/Button';

export default function AdminPrograms() {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="mb-1">البرامج</h2>
          <p className="text-muted-custom mb-0">إدارة البرامج التعليمية</p>
        </div>
        <PrimaryButton icon="bi-plus">إضافة برنامج</PrimaryButton>
      </div>

      <div className="row g-4">
        {programs.map(prog => (
          <div key={prog.id} className="col-md-6 col-lg-4">
            <AppCard>
              <div
                className="d-flex align-items-center justify-content-center rounded-na mb-3"
                style={{
                  height: 140,
                  background: `${prog.color}10`,
                }}
              >
                <i className={`bi ${prog.icon}`} style={{ fontSize: 48, color: prog.color }}></i>
              </div>
              <h5 className="mb-2">{prog.title}</h5>
              <div className="d-flex gap-2 mb-3">
                <span className="na-badge na-badge--primary">{prog.ageRange}</span>
                <span className="na-badge na-badge--success">{prog.duration}</span>
              </div>
              <p className="mb-3" style={{ fontSize: 14, color: 'var(--muted-text)' }}>
                {prog.description}
              </p>
              <div className="d-flex gap-2">
                <button className="btn btn-na-primary btn-sm-na flex-fill">تعديل</button>
                <button className="btn btn-na-outline btn-sm-na">حذف</button>
              </div>
            </AppCard>
          </div>
        ))}
      </div>
    </div>
  );
}

