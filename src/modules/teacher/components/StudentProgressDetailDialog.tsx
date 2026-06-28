import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { CheckCircle2, Circle, ClipboardList } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Skeleton } from '../../../components/ui/skeleton';
import { useTrackStudentDetail } from '../hooks/useTeacherQueries';
import type { TrackStudentDetailResponse } from '../types';

function fmtDate(iso: string | null | undefined, locale: Locale) {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'PPp', { locale });
  } catch {
    return iso;
  }
}

function rel(iso: string | null | undefined, locale: Locale) {
  if (!iso) return '—';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale });
  } catch {
    return iso;
  }
}

type Locale = typeof enUS;

export function StudentProgressDetailDialog({
  open,
  onOpenChange,
  trackId,
  childId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trackId: string;
  childId: string | null;
}) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? ar : enUS;
  const q = useTrackStudentDetail(trackId, childId ?? undefined, open && Boolean(childId));

  const d = q.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(96vw,720px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start">
            <ClipboardList className="h-5 w-5 shrink-0 text-emerald-600" />
            {d?.child.fullName ?? (q.isLoading ? '…' : '')}
          </DialogTitle>
          <DialogDescription className="text-start">
            {d && (
              <span className="font-mono text-xs text-muted-foreground">@{d.child.username}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {q.isLoading && (
          <div className="space-y-3 py-2">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        )}

        {q.isError && (
          <p className="text-sm text-destructive">{t('Teacher.students.detailError', 'Could not load student detail.')}</p>
        )}

        {d && <DetailBody data={d} locale={locale} />}
      </DialogContent>
    </Dialog>
  );
}

function DetailBody({ data, locale }: { data: TrackStudentDetailResponse; locale: Locale }) {
  const { t } = useTranslation();
  const pending = data.lessons.filter((l) => !l.isCompleted).length;
  const done = data.lessons.filter((l) => l.isCompleted).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl border border-emerald-900/10 bg-gradient-to-br from-emerald-50/80 to-transparent p-4 dark:from-emerald-950/30">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t('Teacher.students.enrolled', 'Enrolled')}</span>
            <p className="font-semibold">{fmtDate(data.enrollment.enrolledAt, locale)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t('Teacher.students.access', 'Access')}</span>
            <p className="font-semibold">{data.enrollment.accessLevel}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t('Teacher.students.summaryProgress', 'Roadmap')}</span>
            <p className="font-semibold">
              {data.summary.percentComplete}% — {done}/{data.summary.totalLessons}{' '}
              {t('Teacher.students.lessons', 'lessons')}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">{t('Teacher.students.pending', 'Pending')}</span>
            <p className="font-semibold">{pending}</p>
          </div>
        </div>
      </div>

      <section>
        <h4 className="mb-2 text-sm font-black text-foreground">
          {t('Teacher.students.lessonBreakdown', 'Lesson checklist')}
        </h4>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">#</TableHead>
              <TableHead>{t('Teacher.students.colLesson', 'Lesson')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('Teacher.students.colStatus', 'Status')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('Teacher.students.colLast', 'Last opened')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.lessons.map((lesson, i) => (
              <TableRow key={lesson.sessionId}>
                <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{lesson.title}</div>
                  {lesson.learningPath && (
                    <div className="text-[11px] text-muted-foreground">{lesson.learningPath.title}</div>
                  )}
                  <div className="mt-1 sm:hidden">
                    {lesson.isCompleted ? (
                      <Badge variant="success" className="text-[10px]">
                        {t('Teacher.students.done', 'Done')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {t('Teacher.students.pendingBadge', 'Pending')}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {lesson.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {t('Teacher.students.done', 'Done')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Circle className="h-4 w-4" />
                      {t('Teacher.students.pendingBadge', 'Pending')}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                  {lesson.lastAccessedAt ? rel(lesson.lastAccessedAt, locale) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {data.recentQuizAttempts.length > 0 && (
        <section>
          <h4 className="mb-2 text-sm font-black text-foreground">
            {t('Teacher.students.recentQuizzes', 'Recent quiz attempts')}
          </h4>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('Teacher.students.colQuiz', 'Quiz')}</TableHead>
                <TableHead className="w-24">{t('Teacher.students.colScore', 'Score')}</TableHead>
                <TableHead className="hidden w-28 sm:table-cell">{t('Teacher.students.colResult', 'Result')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('Teacher.students.colWhen', 'When')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentQuizAttempts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium">{a.quiz.title}</div>
                    <div className="text-[10px] text-muted-foreground">{a.quiz.type}</div>
                  </TableCell>
                  <TableCell className="font-mono font-bold">{a.score}%</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {a.isPassed ? (
                      <Badge variant="success">{t('Teacher.students.pass', 'Pass')}</Badge>
                    ) : (
                      <Badge variant="destructive">{t('Teacher.students.fail', 'Fail')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {rel(a.completedAt, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
