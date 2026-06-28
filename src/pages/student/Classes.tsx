import { useState } from 'react';
import AppCard from '../../components/common/AppCard';
import Tabs from '../../components/common/Tabs';

export default function StudentClasses() {
  // Using state to toggle the video player for completed sessions
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const classes = [
    { id: '1', title: 'سكراتش المتقدم - الحصة 5', date: '2026-03-05', time: '16:00', status: 'upcoming' },
    { id: '2', title: 'بايثون للأطفال - الحصة 3', date: '2026-03-07', time: '17:00', status: 'upcoming' },
    { id: '3', title: 'سكراتش المتقدم - الحصة 4', date: '2026-03-01', time: '16:00', status: 'completed' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1 font-bold text-2xl text-custom-text">الحصص</h2>
        <p className="text-custom-muted mb-0">جدول حصصك الأسبوعية</p>
      </div>

      <AppCard>
        <Tabs
          tabs={[
            {
              id: 'upcoming',
              label: 'القادمة',
              icon: 'bi-calendar-event',
              content: (
                <div className="flex flex-col gap-4">
                  {classes
                    .filter(c => c.status === 'upcoming')
                    .map(cls => (
                      <div key={cls.id} className="flex items-center gap-4 p-4 rounded-xl bg-sky-bg shadow-sm transition-all hover:shadow-md border border-transparent hover:border-custom-border">
                        <div className="flex items-center justify-center rounded-full w-[56px] h-[56px] bg-primary-light text-primary text-2xl shrink-0">
                          <i className="bi bi-camera-video"></i>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-[15px] mb-1 text-custom-text">{cls.title}</div>
                          <div className="text-[13px] text-custom-muted">
                            {new Date(cls.date).toLocaleDateString('ar-SA')} في {cls.time}
                          </div>
                        </div>
                        <button className="bg-gradient-primary text-white font-semibold rounded-full h-[38px] px-5 text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(54,109,236,0.4)]">
                          انضم الآن
                        </button>
                      </div>
                    ))}
                </div>
              ),
            },
            {
              id: 'completed',
              label: 'المكتملة',
              icon: 'bi-check-circle',
              content: (
                <div className="flex flex-col gap-4">
                  {classes
                    .filter(c => c.status === 'completed')
                    .map(cls => (
                      <div key={cls.id} className="flex flex-col gap-0 overflow-hidden rounded-xl bg-sky-bg shadow-sm border border-transparent hover:border-custom-border transition-all">
                        <div className="flex items-center gap-4 p-4">
                          <div className="flex items-center justify-center rounded-full w-[56px] h-[56px] bg-success/10 text-success text-2xl shrink-0">
                            <i className="bi bi-check-circle"></i>
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-[15px] mb-1 text-custom-text">{cls.title}</div>
                            <div className="text-[13px] text-custom-muted">
                              {new Date(cls.date).toLocaleDateString('ar-SA')} في {cls.time}
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveVideoId(activeVideoId === cls.id ? null : cls.id)}
                            className="bg-transparent border-2 border-primary text-primary font-semibold rounded-full h-[38px] px-5 text-sm transition-all hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(54,109,236,0.3)]"
                          >
                            {activeVideoId === cls.id ? 'إخفاء التسجيل' : 'عرض التسجيل'}
                          </button>
                        </div>

                        {/* Responsive Video Player utilizing Tailwind's aspect-video */}
                        {activeVideoId === cls.id && (
                          <div className="w-full bg-black">
                            <div className="w-full max-w-4xl mx-auto aspect-video bg-gray-900 border-t border-gray-800 relative flex items-center justify-center group overflow-hidden">
                              {/* Mock Poster / Video Interface */}
                              <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200" alt="Session Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                              <button className="relative z-10 w-16 h-16 bg-primary/90 text-white rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110">
                                <i className="bi bi-play-fill ms-1"></i>
                              </button>
                              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3">
                                <i className="bi bi-pause-fill text-white text-xl cursor-pointer"></i>
                                <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden cursor-pointer">
                                  <div className="h-full bg-primary w-1/3"></div>
                                </div>
                                <span className="text-white text-xs font-inter">12:40 / 45:00</span>
                                <i className="bi bi-volume-up text-white text-lg cursor-pointer"></i>
                                <i className="bi bi-arrows-fullscreen text-white text-lg cursor-pointer ms-2"></i>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
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

