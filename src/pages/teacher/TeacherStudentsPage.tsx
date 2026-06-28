import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Users, Search, ChevronRight, ChevronLeft, Inbox } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { api } from '../../lib/axios';
import { cn } from '../../lib/cn';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

import { resolveUploadedFileUrl } from '../../lib/assetUrl';

type GlobalStudent = {
  child: {
    id: string;
    fullName: string;
    username: string;
    avatar: string | null;
    gradeLevel: string;
  };
  enrolledTracksCount: number;
  averageCompletionRate: number;
  averageQuizScore: number;
};

type GlobalStudentsResponse = {
  students: GlobalStudent[];
  totalCount: number;
  page: number;
  totalPages: number;
};

export default function TeacherStudentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['teacher', 'students', 'global', debouncedSearch, page],
    queryFn: async () => {
      const res = await api.get<{ data: GlobalStudentsResponse }>('/teacher/students', {
        params: { search: debouncedSearch, page, limit },
      });
      return res.data.data;
    },
    keepPreviousData: true,
  });

  const students = data?.students ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0b2a5c] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#10B981]" />
            {t('Teacher.students.global.title', { defaultValue: 'طلابي' })}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {t('Teacher.students.global.subtitle', { defaultValue: 'نظرة عامة على أداء جميع الطلاب في جميع مساراتك' })}
          </p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-4 pr-10 rounded-xl bg-white border-slate-200 focus-visible:ring-[#10B981]"
            placeholder={t('Teacher.students.global.searchPlaceholder', { defaultValue: 'البحث عن طالب...' })}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#0b2a5c]">
            <TableRow className="hover:bg-[#0b2a5c]">
              <TableHead className="font-bold text-white border-b-0">{t('Teacher.students.global.table.student')}</TableHead>
              <TableHead className="font-bold text-white text-center border-b-0">{t('Teacher.students.global.table.tracksCount')}</TableHead>
              <TableHead className="font-bold text-white border-b-0">{t('Teacher.students.global.table.overallProgress')}</TableHead>
              <TableHead className="font-bold text-white text-center border-b-0">{t('Teacher.students.global.table.avgQuizScore')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500 font-medium">
                  {t('Common.loading')}
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                      <Inbox className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-500">
                      {t('Teacher.students.global.empty')}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((item) => (
                <TableRow 
                  key={item.child.id} 
                  className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/teacher/students/${item.child.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-2 border-white shadow-sm rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                        {item.child.avatar ? (
                          <img src={resolveUploadedFileUrl(item.child.avatar) || undefined} alt={item.child.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#0b2a5c] font-black text-sm">
                            {item.child.fullName.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#0b2a5c]">{item.child.fullName}</div>
                        <div className="text-xs text-slate-500" dir="ltr">@{item.child.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-black bg-slate-50 text-[#0b2a5c] rounded-lg border-slate-200">
                      {item.enrolledTracksCount}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3" dir="ltr">
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10B981] rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${item.averageCompletionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-black w-10 text-end text-[#0b2a5c]">
                        {item.averageCompletionRate}%
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {item.averageQuizScore > 0 ? (
                      <Badge
                        className={cn(
                          'rounded-lg font-black',
                          item.averageQuizScore >= 80 ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' :
                          item.averageQuizScore >= 50 ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' :
                          'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        )}
                      >
                        {item.averageQuizScore}%
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-sm font-medium">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-slate-50/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl font-bold"
            >
              <ChevronRight className="w-4 h-4 me-2" />
              السابق
            </Button>
            <span className="text-sm font-bold text-slate-500" dir="ltr">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl font-bold"
            >
              التالي
              <ChevronLeft className="w-4 h-4 ms-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
