import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileBarChart2, 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  Award,
  BookMarked
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import { api } from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

interface QuizAttempt {
  id: string;
  score: number;
  isPassed: boolean;
  timeTaken: number | null;
  completedAt: string;
  quiz: {
    title: string;
    type: string;
  };
}

interface PerformanceData {
  student: {
    id: string;
    fullName: string;
    username: string;
    avatar: string | null;
    createdAt: string;
  };
  stats: {
    totalQuizzes: number;
    passedQuizzes: number;
    avgScore: number;
    projectsSubmitted: number;
  };
  quizAttempts: QuizAttempt[];
}

export default function AdminPerformancePage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await api.get(`/assessments/performance/${childId}`);
        setData(response.data.data);
      } catch (error) {
        toast.error(t('Admin.performancePage.toast.fetchError', 'Failed to load report card'));
        navigate('/admin/children');
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      void fetchPerformance();
    }
  }, [childId, navigate, t]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: t('Admin.performancePage.stats.avgScore'),
        value: `${data.stats.avgScore}%`,
        icon: TrendingUp,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        label: t('Admin.performancePage.stats.totalQuizzes'),
        value: data.stats.totalQuizzes,
        icon: BookMarked,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
      },
      {
        label: t('Admin.performancePage.stats.passedQuizzes'),
        value: data.stats.passedQuizzes,
        icon: Award,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
      {
        label: t('Admin.performancePage.stats.projectsSubmitted'),
        value: data.stats.projectsSubmitted,
        icon: FileBarChart2,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
      },
    ];
  }, [data, t]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative flex flex-col items-center gap-4">
          <div className="size-16 animate-spin rounded-full border-4 border-[color:var(--color-primary-soft)] border-t-[color:var(--color-primary)]"></div>
          <p className="font-bold text-gray-400 animate-pulse">{t('Common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full hover:bg-gray-100 transition-all active:scale-90"
            onClick={() => navigate('/admin/children')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              {data.student.fullName}
            </h1>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              {t('Admin.performancePage.overallPerformance')} • @{data.student.username}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-white font-bold border-gray-100 text-gray-500">
             {t('Admin.childrenPage.table.joinDate')}: {new Date(data.student.createdAt).toLocaleDateString()}
           </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[2rem]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-black ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress & Identity */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50 pb-6">
              <CardTitle className="text-lg font-bold">{t('Admin.performancePage.overallPerformance')}</CardTitle>
              <CardDescription>{t('Admin.performancePage.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="flex flex-col items-center justify-center p-8 rounded-[3rem] bg-gray-50/50 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-primary-soft)] to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                 
                 <div className="relative">
                   <div className="flex flex-col items-center">
                      <span className="text-5xl font-black text-[color:var(--color-primary)]">
                        {data.stats.avgScore}%
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">
                         {t('Admin.performancePage.stats.avgScore')}
                      </span>
                   </div>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-gray-600">{t('Admin.performancePage.stats.passedQuizzes')}</span>
                  <span className="text-[color:var(--color-primary)]">{data.stats.passedQuizzes} / {data.stats.totalQuizzes}</span>
                </div>
                <Progress 
                  value={(data.stats.passedQuizzes / (data.stats.totalQuizzes || 1)) * 100} 
                  className="h-3 rounded-full bg-gray-100"
                />
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-3xl bg-emerald-50 text-emerald-700 flex flex-col items-center gap-1 border border-emerald-100">
                    <span className="text-lg font-black">{data.stats.passedQuizzes}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('Admin.performancePage.passed')}</span>
                 </div>
                 <div className="p-4 rounded-3xl bg-red-50 text-red-700 flex flex-col items-center gap-1 border border-red-100">
                    <span className="text-lg font-black">{data.stats.totalQuizzes - data.stats.passedQuizzes}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('Admin.performancePage.failed')}</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quiz Attempts List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">{t('Admin.performancePage.title')}</CardTitle>
                </div>
                <Badge className="bg-[color:var(--color-primary)] text-white font-bold h-7 rounded-lg">
                  {data.quizAttempts.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.quizAttempts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="p-4 rounded-full bg-gray-50 mb-4">
                    <FileBarChart2 size={32} />
                  </div>
                  <p className="font-bold">{t('Admin.performancePage.noAttempts')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/30 border-b border-gray-50 hover:bg-gray-50/30">
                      <TableHead className="ps-8 py-4 font-bold uppercase tracking-widest text-[10px] text-gray-400">
                        {t('Admin.performancePage.table.quizName')}
                      </TableHead>
                      <TableHead className="py-4 font-bold uppercase tracking-widest text-[10px] text-gray-400 text-center">
                        {t('Admin.performancePage.table.score')}
                      </TableHead>
                      <TableHead className="py-4 font-bold uppercase tracking-widest text-[10px] text-gray-400 text-center">
                        {t('Admin.performancePage.table.status')}
                      </TableHead>
                      <TableHead className="pe-8 py-4 font-bold uppercase tracking-widest text-[10px] text-gray-400 text-end">
                        {t('Admin.performancePage.table.date')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.quizAttempts.map((attempt) => (
                      <TableRow key={attempt.id} className="group hover:bg-gray-50/50 border-b border-gray-50/50 transition-colors">
                        <TableCell className="ps-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 leading-tight">
                              {attempt.quiz.title}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                              {t(`Admin.quizzes.status.${attempt.quiz.type}`)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <span className={`text-sm font-black ${attempt.isPassed ? 'text-emerald-600' : 'text-red-500'}`}>
                            {attempt.score}%
                          </span>
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <div className="flex justify-center">
                            {attempt.isPassed ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold rounded-lg px-3 py-1 flex items-center gap-1.5 ring-1 ring-emerald-200 shadow-none">
                                <CheckCircle2 size={12} strokeWidth={3} />
                                {t('Admin.performancePage.passed')}
                              </Badge>
                            ) : (
                              <Badge className="bg-red-50 text-red-700 border-none font-bold rounded-lg px-3 py-1 flex items-center gap-1.5 ring-1 ring-red-200 shadow-none">
                                <XCircle size={12} strokeWidth={3} />
                                {t('Admin.performancePage.failed')}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="pe-8 py-5 text-end">
                          <div className="flex flex-col items-end">
                             <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                               <Calendar size={12} className="text-gray-300" />
                               {new Date(attempt.completedAt).toLocaleDateString()}
                             </div>
                             {attempt.timeTaken && (
                               <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mt-1">
                                 <Clock size={10} />
                                 {attempt.timeTaken} {t('Admin.performancePage.table.duration')}
                               </div>
                             )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
