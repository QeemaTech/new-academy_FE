import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, 
  BarChart3, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  Calendar,
  Printer,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Input } from '../../ui/input';
import { api } from '../../../lib/axios';

interface PerformanceData {
  totalStudents: number;
  avgQuizScore: number;
  completionRate: number;
  tracksCount: number;
}

interface TeacherPerformanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function TeacherPerformanceDialog({ open, onOpenChange, userId, userName }: TeacherPerformanceDialogProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [range, setRange] = useState('30d');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const sapphire = "#0F172A";
  const mint = "#10B981";

  useEffect(() => {
    if (open && userId) {
      void loadPerformance();
    }
  }, [open, userId, range, customRange.start, customRange.end]);

  const loadPerformance = async () => {
    setLoading(true);
    try {
      const params: any = { range };
      if (range === 'custom') {
        params.startDate = customRange.start;
        params.endDate = customRange.end;
      }
      const res = await api.get(`/admin/teachers/${userId}/performance`, { params });
      setData(res.data?.data?.performance);
    } catch (err) {
      toast.error(t('common.error', 'Failed to load performance metrics'));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const StatCard = ({ title, value, icon: Icon, color, percent }: any) => (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`rounded-2xl p-2.5 ${color === 'mint' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#0F172A]/5 text-[#0F172A]'}`}>
          <Icon size={20} />
        </div>
        {percent !== undefined && (
          <Badge className={percent > 70 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
            {percent}%
          </Badge>
        )}
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</h4>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-black text-slate-900" style={{ direction: 'ltr' }}>{value}</span>
          {title.includes('%') && <span className="text-lg font-bold text-slate-400">%</span>}
        </div>
      </div>
      {percent !== undefined && (
        <Progress value={percent} className="h-1.5 bg-gray-100 [&>div]:bg-[#10B981]" />
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl border-0 p-0 overflow-hidden bg-gray-50/50 print:bg-white print:max-w-full print:rounded-none">
        {/* Header Section */}
        <div className="bg-[#0F172A] p-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-[#10B981] flex items-center justify-center text-[#0F172A] font-black text-2xl shadow-xl shadow-black/20">
                {userName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{userName}</h2>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">
                  {t('Admin.usersPage.performance.teacherTitle', 'Senior Instructor Performance')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 print:hidden">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <Printer size={18} className="mr-2" />
                {t('Admin.usersPage.performance.export', 'Export Report')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 print:hidden">
            {['7d', '30d', 'all', 'custom'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  range === r 
                    ? 'bg-[#10B981] text-[#0F172A] shadow-lg shadow-emerald-500/20' 
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {t(`Admin.usersPage.performance.range.${r}`, r)}
              </button>
            ))}
          </div>

          {range === 'custom' && (
            <div className="flex flex-wrap gap-4 mt-6 animate-in slide-in-from-top-2 print:hidden">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t('common.from', 'From')}</label>
                <Input 
                  type="date" 
                  value={customRange.start} 
                  onChange={(e) => setCustomRange(p => ({ ...p, start: e.target.value }))}
                  className="h-10 rounded-xl bg-white/5 border-white/10 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{t('common.to', 'To')}</label>
                <Input 
                  type="date" 
                  value={customRange.end} 
                  onChange={(e) => setCustomRange(p => ({ ...p, end: e.target.value }))}
                  className="h-10 rounded-xl bg-white/5 border-white/10 text-white text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8">
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {t('common.loading', 'Calibrating Metrics...')}
              </p>
            </div>
          ) : data ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title={t('Admin.usersPage.performance.totalStudents', 'Registered Students')} 
                  value={data.totalStudents} 
                  icon={Users} 
                  color="sapphire" 
                />
                <StatCard 
                  title={t('Admin.usersPage.performance.avgScore', 'Avg Quiz Score')} 
                  value={data.avgQuizScore} 
                  icon={GraduationCap} 
                  color="mint" 
                  percent={data.avgQuizScore}
                />
                <StatCard 
                  title={t('Admin.usersPage.performance.completion', 'Syllabus Mastery')} 
                  value={data.completionRate} 
                  icon={CheckCircle2} 
                  color="mint" 
                  percent={data.completionRate}
                />
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t('Admin.usersPage.performance.trackFocus', 'Instructional Context')}</h3>
                    <p className="text-sm text-slate-400">{t('Admin.usersPage.performance.trackFocusDesc', 'Overview of tracks managed by this instructor.')}</p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-600 border-0 h-8 px-4 rounded-xl text-sm font-bold">
                    {data.tracksCount} {t('Admin.usersPage.performance.activeTracks', 'Assigned Tracks')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Admin.usersPage.performance.engagement', 'Global Engagement')}</p>
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {data.totalStudents > 0 ? t('Admin.usersPage.performance.highImpact', 'Significant academic impact detected') : t('Admin.usersPage.performance.noImpact', 'Pending track engagement')}
                      </p>
                    </div>
                    <ChevronRight className="text-slate-300" size={16} />
                  </div>
                  <div className="flex items-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100 gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t('Admin.usersPage.performance.health', 'Course Health')}</p>
                      <p className="text-sm font-bold text-emerald-900 leading-tight">
                        {data.completionRate > 50 ? t('Admin.usersPage.performance.onTrack', 'Curriculum progression is optimal') : t('Admin.usersPage.performance.attentionNeeded', 'Monitor session participation')}
                      </p>
                    </div>
                    <ChevronRight className="text-emerald-300" size={16} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
               <GraduationCap size={48} className="mb-4 opacity-20" />
               <p>{t('common.noData', 'No metrics available for the selected period.')}</p>
            </div>
          )}
        </div>

        <div className="p-8 pt-0 flex justify-end print:hidden">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
              {t('common.close', 'Dismiss')}
           </Button>
        </div>

        {/* Global Styles for custom scrollbar and print */}
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #E2E8F0;
            border-radius: 10px;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            #radix-\\:rn\\: {
              visibility: visible;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .DialogContent * {
              visibility: visible;
            }
          }
        `}} />
      </DialogContent>
    </Dialog>
  );
}
