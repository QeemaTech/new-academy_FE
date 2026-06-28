import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, User, CheckCircle2, TrendingUp, Map, Mail, ChevronRight, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

import { api } from '../../lib/axios';
import { resolveUploadedFileUrl } from '../../lib/assetUrl';
import { cn } from '../../lib/cn';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

type GlobalStudentDetails = {
  studentProfile: {
    id: string;
    fullName: string;
    username: string;
    avatar: string | null;
    email: string | null;
  };
  stats: {
    overallCompletionRate: number;
    averageScore: number;
    totalQuizzesTaken: number;
    quizzesPassed: number;
  };
  tracksBreakdown: Array<{
    trackId: string;
    title: string;
    progressPercent: number;
    completedSessions: number;
    totalSessions: number;
  }>;
  quizHistory: Array<{
    id: string;
    quizTitle: string;
    trackTitle: string;
    score: number;
    isPassed: boolean;
    completedAt: string;
  }>;
};

export default function TeacherStudentDetailsPage() {
  const { childId } = useParams<{ childId: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher', 'students', 'details', childId],
    queryFn: async () => {
      const res = await api.get<{ data: GlobalStudentDetails }>(`/teacher/students/${childId}/details`);
      return res.data.data;
    },
    enabled: !!childId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        {t('Common.loading', { defaultValue: 'جاري التحميل...' })}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-rose-500 font-bold">عذراً، لم يتم العثور على تفاصيل الطالب أو أنك لا تملك صلاحية الوصول.</p>
        <button onClick={() => navigate('/teacher/students')} className="text-[#10B981] font-bold underline">
          العودة للقائمة
        </button>
      </div>
    );
  }

  const { studentProfile, stats, tracksBreakdown, quizHistory } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Breadcrumbs & Header */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6">
          <Link to="/teacher/students" className="hover:text-[#0b2a5c] transition-colors">
            {t('Teacher.students.global.title', { defaultValue: 'طلابي' })}
          </Link>
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          <span className="text-[#0b2a5c] font-bold">{studentProfile.fullName}</span>
        </div>

        <div className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 border-4 border-white shadow-md rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
            {studentProfile.avatar ? (
              <img src={resolveUploadedFileUrl(studentProfile.avatar) || undefined} alt={studentProfile.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#0b2a5c] font-black text-xl">
                {studentProfile.fullName.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0b2a5c]">{studentProfile.fullName}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-500 text-sm font-medium">
              <div className="flex items-center gap-1.5" dir="ltr">
                <User className="w-4 h-4" />
                @{studentProfile.username}
              </div>
              {studentProfile.email && (
                <div className="flex items-center gap-1.5" dir="ltr">
                  <Mail className="w-4 h-4" />
                  {studentProfile.email}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0b2a5c] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <p className="text-slate-300 font-bold mb-2">
            {t('Teacher.students.details.overallProgress', { defaultValue: 'معدل الإنجاز العام' })}
          </p>
          <div className="flex items-end gap-3" dir="ltr">
            <span className="text-4xl font-black">{stats.overallCompletionRate}%</span>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden" dir="ltr">
            <div 
              className="h-full bg-[#10B981] transition-all duration-1000" 
              style={{ width: `${stats.overallCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0b2a5c] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Activity className="w-32 h-32" />
          </div>
          <p className="text-slate-300 font-bold mb-2">
            {t('Teacher.students.details.averageScore', { defaultValue: 'متوسط الدرجات' })}
          </p>
          <div className="flex items-end gap-3" dir="ltr">
            <span className={cn(
              "text-4xl font-black",
              stats.averageScore >= 80 ? "text-[#10B981]" : stats.averageScore >= 50 ? "text-amber-400" : "text-rose-400"
            )}>
              {stats.averageScore}%
            </span>
          </div>
        </div>

        <div className="bg-[#0b2a5c] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <CheckCircle2 className="w-32 h-32" />
          </div>
          <p className="text-slate-300 font-bold mb-2">
            {t('Teacher.students.details.quizzesPassed', { defaultValue: 'الاختبارات المجتازة' })}
          </p>
          <div className="flex items-baseline gap-2" dir="ltr">
            <span className="text-4xl font-black text-[#10B981]">{stats.quizzesPassed}</span>
            <span className="text-xl font-bold text-slate-400">/ {stats.totalQuizzesTaken}</span>
          </div>
        </div>
      </div>

      {/* Dual Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section A: Progress By Track */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
          <h2 className="text-xl font-black text-[#0b2a5c] mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-[#10B981]" />
            {t('Teacher.students.details.progressByTrack', { defaultValue: 'معدل الإنجاز حسب المسار' })}
          </h2>
          
          <div className="flex-1 space-y-6">
            {tracksBreakdown.map((track) => (
              <div key={track.trackId} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700">{track.title}</span>
                  <span className="text-sm font-bold text-[#0b2a5c] bg-slate-100 px-2 py-0.5 rounded-md" dir="ltr">
                    {track.completedSessions} / {track.totalSessions}
                  </span>
                </div>
                <div className="flex items-center gap-3" dir="ltr">
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10B981] rounded-full group-hover:bg-[#0ea5e9] transition-colors duration-300"
                      style={{ width: `${track.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-sm font-black w-10 text-end text-[#0b2a5c]">
                    {track.progressPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Quiz History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
          <h2 className="text-xl font-black text-[#0b2a5c] mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#10B981]" />
            {t('Teacher.students.details.quizHistory', { defaultValue: 'سجل الاختبارات' })}
          </h2>
          
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            {quizHistory.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-200" />
                <p className="font-medium">{t('Teacher.students.track.noQuizzes', { defaultValue: 'لا محاولات بعد' })}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-slate-100">
                    <TableHead className="font-bold text-slate-600">{t('Teacher.students.details.table.quiz', { defaultValue: 'الاختبار' })}</TableHead>
                    <TableHead className="font-bold text-slate-600 text-center">{t('Teacher.students.details.table.score', { defaultValue: 'الدرجة' })}</TableHead>
                    <TableHead className="font-bold text-slate-600 text-center">{t('Teacher.students.details.table.status', { defaultValue: 'الحالة' })}</TableHead>
                    <TableHead className="font-bold text-slate-600">{t('Teacher.students.details.table.date', { defaultValue: 'التاريخ' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizHistory.map((quiz) => (
                    <TableRow key={quiz.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <TableCell>
                        <div className="font-bold text-[#0b2a5c] truncate max-w-[150px]" title={quiz.quizTitle}>{quiz.quizTitle}</div>
                        <div className="text-xs font-medium text-slate-400 truncate max-w-[150px]">{quiz.trackTitle}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-black text-slate-700" dir="ltr">{quiz.score}%</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {quiz.isPassed ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-0 hover:bg-emerald-100">
                            {t('Teacher.students.details.pass', { defaultValue: 'نجاح' })}
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-50 text-rose-600 border-0 hover:bg-rose-100">
                            {t('Teacher.students.details.fail', { defaultValue: 'رسوب' })}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-slate-500">
                          {format(new Date(quiz.completedAt), 'dd MMM yyyy', { locale: isRTL ? arSA : undefined })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
