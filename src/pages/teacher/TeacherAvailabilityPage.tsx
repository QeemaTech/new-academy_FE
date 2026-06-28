import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  useTeacherAvailabilityQuery, 
  useUpdateTeacherAvailabilityMutation 
} from '../../modules/teacher/hooks/useTeacherQueries';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

const DAYS = [
  { id: 0, label: 'الأحد', en: 'Sunday' },
  { id: 1, label: 'الإثنين', en: 'Monday' },
  { id: 2, label: 'الثلاثاء', en: 'Tuesday' },
  { id: 3, label: 'الأربعاء', en: 'Wednesday' },
  { id: 4, label: 'الخميس', en: 'Thursday' },
  { id: 5, label: 'الجمعة', en: 'Friday' },
  { id: 6, label: 'السبت', en: 'Saturday' },
];

export default function TeacherAvailabilityPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: serverAvailabilities, isLoading } = useTeacherAvailabilityQuery();
  const updateMutation = useUpdateTeacherAvailabilityMutation();

  const [localAvailabilities, setLocalAvailabilities] = useState<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    tempId: string;
  }[]>([]);

  useEffect(() => {
    if (serverAvailabilities) {
      setLocalAvailabilities(
        serverAvailabilities.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          tempId: a.id,
        }))
      );
    }
  }, [serverAvailabilities]);

  const addSlot = (dayOfWeek: number) => {
    setLocalAvailabilities([
      ...localAvailabilities,
      {
        dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
        tempId: Math.random().toString(36).substring(7),
      },
    ]);
  };

  const removeSlot = (tempId: string) => {
    setLocalAvailabilities(localAvailabilities.filter((a) => a.tempId !== tempId));
  };

  const updateSlot = (tempId: string, field: 'startTime' | 'endTime', value: string) => {
    setLocalAvailabilities(
      localAvailabilities.map((a) => (a.tempId === tempId ? { ...a, [field]: value } : a))
    );
  };

  const handleSave = () => {
    updateMutation.mutate({
      availabilities: localAvailabilities.map(({ dayOfWeek, startTime, endTime }) => ({
        dayOfWeek,
        startTime,
        endTime,
      })),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-5xl space-y-10 p-4 md:p-8 min-h-[calc(100vh-120px)] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-teal-200/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-200/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" />

      <header className="space-y-4 relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1.5 w-12 bg-[#10B981] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10B981]">
            {t('Teacher.availability.subtitle', 'Scheduling & Availability')}
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm flex items-center gap-3">
              <CalendarDays className="w-10 h-10 text-indigo-600" />
              {t('Teacher.availability.title', 'Availability Times')}
            </h1>
            <p className="text-slate-500 font-medium max-w-xl">
              {t('Teacher.availability.subtitle', 'Define your recurring weekly available hours. This helps students and parents know when you are available for live sessions.')}
            </p>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            className="h-14 px-8 rounded-2xl shadow-xl shadow-teal-600/20 hover:shadow-2xl transition-all duration-300 font-bold group"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('common.saving', 'Saving...')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t('Teacher.availability.save', 'Save Changes')}
              </span>
            )}
          </Button>
        </div>
      </header>

      <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-2xl overflow-hidden">
        <div className="p-1">
          {DAYS.map((day) => {
            const daySlots = localAvailabilities.filter((a) => a.dayOfWeek === day.id);
            return (
              <div 
                key={day.id}
                className="group border-b border-slate-100 last:border-0 hover:bg-white/60 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 md:p-8">
                  <div className="w-40 flex flex-col gap-1">
                    <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {isAr ? day.label : day.en}
                    </h3>
                    <Badge variant="secondary" className="w-fit bg-slate-50 text-slate-400 border-none font-bold text-[10px] uppercase tracking-wider">
                      {daySlots.length === 0 ? t('Teacher.availability.unavailable', 'Not Set') : `${daySlots.length} ${t('Teacher.availability.slots', 'Slots')}`}
                    </Badge>
                  </div>

                  <div className="flex-1 flex flex-wrap gap-4 items-center">
                    <AnimatePresence mode="popLayout">
                      {daySlots.map((slot) => (
                        <motion.div
                          key={slot.tempId}
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group/slot"
                        >
                          <div className="flex items-center gap-2 px-2">
                            <Clock className="w-4 h-4 text-teal-500" />
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateSlot(slot.tempId, 'startTime', e.target.value)}
                              className="bg-transparent border-none focus:ring-0 font-bold text-slate-700 w-24 p-0"
                            />
                            <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateSlot(slot.tempId, 'endTime', e.target.value)}
                              className="bg-transparent border-none focus:ring-0 font-bold text-slate-700 w-24 p-0"
                            />
                          </div>
                          <button
                            onClick={() => removeSlot(slot.tempId)}
                            className="p-2 hover:bg-rose-50 rounded-xl text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover/slot:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSlot(day.id)}
                      className="rounded-xl border-dashed border-2 border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-500 hover:bg-indigo-50/30 font-bold h-12 px-5 transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('Teacher.availability.add', 'Add Time')}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 flex items-start gap-4">
        <div className="bg-white p-2 rounded-xl shadow-sm">
          <Info className="w-6 h-6 text-indigo-500" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-900 text-sm">
            {t('Teacher.availability.noteTitle', 'Important Note')}
          </h4>
          <p className="text-indigo-700/70 text-xs font-medium leading-relaxed">
            {t('Teacher.availability.noteDesc', 'These times are recurring every week. If you need to set a one-time unavailability (vacation, etc.), please notify the administration.')}
          </p>
        </div>
      </footer>
    </div>
  );
}
