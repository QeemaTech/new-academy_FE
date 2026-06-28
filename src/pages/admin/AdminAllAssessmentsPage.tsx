import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileBarChart2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  ExternalLink,
  Search,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

import { api } from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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

interface Attempt {
  id: string;
  score: number;
  isPassed: boolean;
  completedAt: string;
  timeTaken: number | null;
  child: {
    id: string;
    fullName: string;
    username: string;
  };
  quiz: {
    id: string;
    title: string;
    type: string;
  };
}

export default function AdminAllAssessmentsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const response = await api.get('/assessments/attempts');
        setAttempts(response.data.data || []);
      } catch {
        toast.error(t('Admin.assessments.toast.fetchError', 'Failed to load assessments'));
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchAttempts();
  }, [t]);

  const filteredAttempts = attempts.filter(a => 
    a.child.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDateLocale = () => (i18n.language === 'ar' ? ar : enUS);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
         <div className="size-12 animate-spin rounded-full border-4 border-[color:var(--color-primary-soft)] border-t-[color:var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]">
              <FileBarChart2 size={32} />
            </div>
            {t('Admin.assessments.allTitle', 'All Assessments')}
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-400 uppercase tracking-widest ps-1">
            {t('Admin.assessments.subtitle', 'Track student quiz performance across the platform')}
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder={t('Admin.assessments.searchPlaceholder', 'Filter by student or quiz...')}
            className="ps-10 h-11 rounded-2xl border-gray-100 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Attempts Table */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50 border-b border-gray-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{t('Admin.assessments.tableTitle', 'Recent Quiz Activity')}</CardTitle>
            <CardDescription>{t('Admin.assessments.tableSubtitle', 'Snapshot of the latest completed assessments')}</CardDescription>
          </div>
          <Badge className="bg-[color:var(--color-primary)] text-white font-bold h-7 rounded-lg">
            {filteredAttempts.length} {t('Common.total', 'Total')}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAttempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="font-bold">{t('Admin.assessments.noResults', 'No assessment attempts found')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/30 border-b border-gray-50 hover:bg-gray-50/30">
                  <TableHead className="ps-8 py-4 font-bold uppercase tracking-widest text-[10px] text-gray-400">
                    {t('Admin.performancePage.table.studentName', 'Student')}
                  </TableHead>
                  <TableHead className="py-4 font-bold uppercase tracking-widest text-[10px] text-gray-400">
                    {t('Admin.performancePage.table.quizName', 'Quiz')}
                  </TableHead>
                  <TableHead className="py-4 font-bold uppercase tracking-widest text-[10px] text-gray-400 text-center">
                    {t('Admin.performancePage.table.score', 'Score')}
                  </TableHead>
                  <TableHead className="py-4 font-bold uppercase tracking-widest text-[10px] text-gray-400 text-center">
                    {t('Admin.performancePage.table.status', 'Status')}
                  </TableHead>
                  <TableHead className="pe-8 py-4 font-bold uppercase tracking-widest text-[10px] text-gray-400 text-end">
                    {t('Admin.performancePage.table.date', 'Date')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.map((attempt) => (
                  <TableRow key={attempt.id} className="group hover:bg-gray-50/50 border-b border-gray-50/50 transition-colors">
                    <TableCell className="ps-8 py-5">
                      <div 
                        className="flex flex-col cursor-pointer group/name"
                        onClick={() => navigate(`/admin/assessments/performance/${attempt.child.id}`)}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-gray-900 leading-tight group-hover/name:text-[color:var(--color-primary)] transition-colors">
                          {attempt.child.fullName}
                          <ExternalLink size={12} className="opacity-0 group-hover/name:opacity-100 transition-all translate-x-1" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          @{attempt.child.username}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">
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
                          <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold rounded-lg px-3 py-1 flex items-center gap-1.5 ring-1 ring-emerald-200">
                            <CheckCircle2 size={12} strokeWidth={3} />
                            {t('Admin.performancePage.passed')}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border-none font-bold rounded-lg px-3 py-1 flex items-center gap-1.5 ring-1 ring-red-200">
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
                           {formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true, locale: getDateLocale() })}
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
      
      {/* Tips / Call to Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="rounded-[2rem] border-none bg-blue-50/50 p-6">
            <div className="flex gap-4">
               <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 h-fit">
                 <Search size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-blue-900">{t('Admin.assessments.tips.title', 'Quick Search')}</h4>
                 <p className="text-sm text-blue-700/80 mt-1">{t('Admin.assessments.tips.search', 'Filter by student name or quiz title to find specific records quickly.')}</p>
               </div>
            </div>
         </Card>
         <Card className="rounded-[2rem] border-none bg-purple-50/50 p-6">
            <div className="flex gap-4">
               <div className="p-3 rounded-2xl bg-purple-100 text-purple-600 h-fit">
                 <ChevronRight size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-purple-900">{t('Admin.assessments.tips.detailsTitle', 'Drill Down')}</h4>
                 <p className="text-sm text-purple-700/80 mt-1">{t('Admin.assessments.tips.details', 'Click on a student’s name to view their full academic performance history and project submissions.')}</p>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
