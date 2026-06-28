import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  HelpCircle, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  FileQuestion,
  BookOpen,
  Layout,
  Clock,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/skeleton';
import QuizBuilderDialog from '../../components/admin/quizzes/QuizBuilderDialog';

export default function AdminQuizzesPage() {
  const { t, i18n } = useTranslation();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/quizzes');
      const raw = res.data?.data?.quizzes ?? res.data?.quizzes ?? res.data?.data ?? res.data ?? [];
      setQuizzes(Array.isArray(raw) ? raw : []);
    } catch {
      toast.error(t('Admin.quizzes.toast.fetchError', 'Failed to fetch quizzes'));
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchQuizzes();
  }, [fetchQuizzes]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('Admin.quizzes.deleteConfirm'))) return;
    try {
      await api.delete(`/admin/quizzes/${id}`);
      toast.success(t('Admin.quizzes.toast.deleteSuccess', 'Quiz deleted'));
      void fetchQuizzes();
    } catch {
      toast.error(t('Common.error'));
    }
  };

  const handleEdit = (quiz: any) => {
    setEditingQuiz(quiz);
    setIsBuilderOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            {t('Admin.quizzes.pageTitle')}
          </h1>
          <p className="mt-2 text-gray-400 font-medium">
            {t('Admin.quizzes.pageSubtitle')}
          </p>
        </div>
        <Button 
          onClick={() => { setEditingQuiz(null); setIsBuilderOpen(true); }}
          className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <Plus className="me-2 h-5 w-5" />
          {t('Admin.quizzes.addQuiz')}
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border-gray-100 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">{t('Admin.quizzes.title')}</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">{t('Admin.quizzes.type')}</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest">{t('Admin.quizzes.context')}</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-center">{t('Admin.quizzes.questions')}</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-center">{t('Admin.quizzes.passingScore')}</TableHead>
                <TableHead className="px-8 py-5 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="px-8 py-4"><Skeleton className="h-12 w-full rounded-xl" /></TableCell>
                  </TableRow>
                ))
              ) : quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <TableRow key={quiz.id} className="group border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <FileQuestion size={20} />
                        </div>
                        <span className="font-black text-gray-900">{quiz.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="h-6 py-0 border-none bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-tighter">
                        {quiz.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {quiz.session ? (
                          <span className="flex items-center text-xs font-bold text-gray-500">
                            <BookOpen size={12} className="me-1 inline" />
                            {quiz.session.title}
                          </span>
                        ) : quiz.track ? (
                          <span className="flex items-center text-xs font-bold text-blue-500">
                            <Layout size={12} className="me-1 inline" />
                            {quiz.track.title}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase italic">{t('Admin.quizzes.noLink')}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-black text-gray-900 border border-gray-200">
                         {quiz.questions?.length || 0}
                       </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs font-black text-emerald-600">
                        <Target size={14} />
                        {quiz.passingScore}%
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white text-gray-400">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-2xl border-gray-100 p-2 shadow-xl">
                          <DropdownMenuItem onClick={() => handleEdit(quiz)} className="rounded-xl p-2 font-bold cursor-pointer">
                            <Pencil size={14} className="me-2" />
                            {t('Common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(quiz.id)} className="rounded-xl p-2 font-bold text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                            <Trash2 size={14} className="me-2" />
                            {t('Common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <HelpCircle size={48} className="mb-4 opacity-10" />
                      <p className="text-sm font-bold uppercase tracking-widest">{t('Admin.quizzes.noQuizzes')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <QuizBuilderDialog 
        open={isBuilderOpen} 
        onOpenChange={setIsBuilderOpen} 
        quiz={editingQuiz}
        onSuccess={fetchQuizzes}
      />
    </div>
  );
}
