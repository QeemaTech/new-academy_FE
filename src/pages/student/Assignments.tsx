import { useState } from 'react';
import AppCard from '../../components/common/AppCard';
import Tabs from '../../components/common/Tabs';
import toast from 'react-hot-toast';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);

  const handleSubmit = async (_id: string) => {
    toast.success('سيتم ربط تسليم الواجبات بالخادم قريباً');
    setAssignments((prev) => prev);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">الواجبات</h2>
        <p className="text-muted-custom mb-0">عرض وإتمام واجباتك</p>
      </div>

      <AppCard>
        <Tabs
          tabs={[
            {
              id: 'pending',
              label: 'المعلقة',
              icon: 'bi-journal-text',
              content: (
                <div className="d-flex flex-column gap-3">
                  {assignments
                    .filter(a => a.status === 'pending')
                    .map(assignment => (
                      <AppCard key={assignment.id} className="p-4">
                        <div className="d-flex align-items-start justify-content-between mb-3">
                          <div>
                            <h5 className="mb-1">{assignment.title}</h5>
                            <p className="mb-0" style={{ fontSize: 14, color: 'var(--muted-text)' }}>
                              {assignment.description}
                            </p>
                          </div>
                          <span className="na-badge na-badge--warning">معلقة</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
                          <div style={{ fontSize: 13, color: 'var(--muted-text)' }}>
                            موعد التسليم: {new Date(assignment.dueDate).toLocaleDateString('ar-SA')}
                          </div>
                          <button className="btn btn-na-primary btn-sm-na" onClick={() => handleSubmit(assignment.id)}>
                            تسليم الواجب
                          </button>
                        </div>
                      </AppCard>
                    ))}
                </div>
              ),
            },
            {
              id: 'submitted',
              label: 'المقدمة',
              icon: 'bi-send',
              content: (
                <div className="d-flex flex-column gap-3">
                  {assignments
                    .filter(a => a.status === 'submitted')
                    .map(assignment => (
                      <AppCard key={assignment.id} className="p-4">
                        <div className="d-flex align-items-start justify-content-between mb-3">
                          <div>
                            <h5 className="mb-1">{assignment.title}</h5>
                            <p className="mb-0" style={{ fontSize: 14, color: 'var(--muted-text)' }}>
                              {assignment.description}
                            </p>
                          </div>
                          <span className="na-badge na-badge--primary">مقدمة</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--muted-text)' }}>
                          في انتظار التصحيح
                        </div>
                      </AppCard>
                    ))}
                </div>
              ),
            },
            {
              id: 'graded',
              label: 'المصححة',
              icon: 'bi-star',
              content: (
                <div className="d-flex flex-column gap-3">
                  {assignments
                    .filter(a => a.status === 'graded')
                    .map(assignment => (
                      <AppCard key={assignment.id} className="p-4">
                        <div className="d-flex align-items-start justify-content-between mb-3">
                          <div>
                            <h5 className="mb-1">{assignment.title}</h5>
                            <p className="mb-0" style={{ fontSize: 14, color: 'var(--muted-text)' }}>
                              {assignment.description}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="fw-bold fs-4" style={{ color: 'var(--success-green)' }}>
                              {assignment.grade}%
                            </div>
                            <span className="na-badge na-badge--success">مصححة</span>
                          </div>
                        </div>
                      </AppCard>
                    ))}
                </div>
              ),
            },
          ]}
        />
      </AppCard>
    </div>
  );
}

