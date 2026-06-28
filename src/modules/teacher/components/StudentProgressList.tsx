import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Search, Users, Eye, TrendingUp, Clock, Trophy } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Skeleton } from '../../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { useTrackStudents } from '../hooks/useTeacherQueries';
import type { TrackStudentRow } from '../types';
import { cn } from '../../../lib/cn';
import { resolveUploadedFileUrl } from '../../../lib/assetUrl';

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
}

function StudentAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const src = resolveUploadedFileUrl(avatarUrl);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-emerald-500/25 ring-offset-2 ring-offset-background"
      />
    );
  }
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-800 to-slate-900 text-[13px] font-bold text-white shadow-inner"
      aria-hidden
    >
      {initialsFromName(name)}
    </div>
  );
}

function lastActivityLabel(iso: string | null, locale: typeof enUS) {
  if (!iso) return '—';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale });
  } catch {
    return '—';
  }
}

export function StudentProgressList({
  trackId,
  onViewDetail,
}: {
  trackId: string;
  onViewDetail: (childId: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('ar') ? ar : enUS;
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const tmr = window.setTimeout(() => setDebouncedSearch(searchInput), 320);
    return () => window.clearTimeout(tmr);
  }, [searchInput]);

  const q = useTrackStudents(trackId, debouncedSearch);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-foreground">
            <Users className="h-5 w-5 text-emerald-600" />
            {t('Teacher.students.title', 'Student insights')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t(
              'Teacher.students.subtitle',
              'Enrollment and progress on this track. Search scales to large cohorts.'
            )}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('Teacher.students.searchPlaceholder', 'Search by name or username…')}
            className="h-10 border-emerald-900/15 ps-9"
            aria-label={t('Teacher.students.searchPlaceholder', 'Search by name or username…')}
          />
        </div>
      </div>

      {q.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      )}

      {q.isError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {t('Teacher.students.loadError', 'Could not load students.')}
        </p>
      )}

      {q.data && (
        <>
          <p className="text-xs font-medium text-muted-foreground">
            {t('Teacher.students.metaCount', '{{count}} enrolled · {{lessons}} lessons in roadmap', {
              count: q.data.students.length,
              lessons: q.data.totalLessons,
            })}
          </p>

          {q.data.students.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-900/15 bg-emerald-50/30 px-6 py-12 text-center text-sm text-muted-foreground dark:bg-emerald-950/20">
              {t('Teacher.students.empty', 'No students match your search.')}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-emerald-900/10 hover:bg-transparent">
                      <TableHead className="min-w-[160px]">{t('Teacher.students.colStudent', 'Student')}</TableHead>
                      <TableHead className="min-w-[180px]">{t('Teacher.students.colProgress', 'Roadmap')}</TableHead>
                      <TableHead className="hidden w-40 lg:table-cell">
                        {t('Teacher.students.colLastActivity', 'Last activity')}
                      </TableHead>
                      <TableHead className="min-w-[160px]">{t('Teacher.students.colQuizzesPassed', 'Quizzes')}</TableHead>
                      <TableHead className="w-28 text-end">{t('Teacher.students.colActions', '')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {q.data.students.map((row) => (
                      <StudentTableRow
                        key={row.child.id}
                        row={row}
                        locale={locale}
                        onView={() => onViewDetail(row.child.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 md:hidden">
                {q.data.students.map((row) => (
                  <StudentCard key={row.child.id} row={row} locale={locale} onView={() => onViewDetail(row.child.id)} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function StudentTableRow({
  row,
  locale,
  onView,
}: {
  row: TrackStudentRow;
  locale: typeof enUS;
  onView: () => void;
}) {
  const { t } = useTranslation();
  const pct = Math.min(100, Math.max(0, row.progress.percentComplete));
  const latest = row.quizzes.latest;
  const passedQ = row.quizzes.passedQuizCount ?? 0;
  const totalQ = row.quizzes.totalQuizzesOnTrack ?? 0;

  return (
    <TableRow className="border-slate-200/80 transition-colors hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-emerald-950/30">
      <TableCell>
        <div className="flex items-center gap-3">
          <StudentAvatar name={row.child.fullName} avatarUrl={row.child.avatar} />
          <div className="min-w-0">
            <div className="truncate font-semibold text-foreground">{row.child.fullName}</div>
            <div className="truncate font-mono text-[11px] text-muted-foreground">@{row.child.username}</div>
            {row.child.gradeLevel && (
              <Badge variant="outline" className="mt-1 text-[10px]">
                {row.child.gradeLevel}
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200">
          <span>{pct}%</span>
          <span className="font-mono text-[10px] font-normal text-muted-foreground">
            {row.progress.completedLessons}/{row.progress.totalLessons}
          </span>
        </div>
        <div dir="ltr" className="w-full min-w-[120px]">
          <Progress value={pct} className="h-2.5 bg-slate-200/80 dark:bg-slate-800 [&>div]:bg-emerald-600" />
        </div>
      </TableCell>
      <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
          {lastActivityLabel(row.progress.lastActivityAt, locale)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
            <Trophy className="h-3.5 w-3.5 shrink-0 text-amber-600/90" />
            <span dir="ltr" className="tabular-nums">
              {t('Teacher.students.quizzesPassed', '{{passed}}/{{total}} passed', {
                passed: passedQ,
                total: totalQ,
              })}
            </span>
          </span>
          {row.quizzes.averageScore != null ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              {t('Teacher.students.avgScore', 'Avg {{n}}%', { n: row.quizzes.averageScore })}
            </span>
          ) : totalQ === 0 ? (
            <span className="text-[11px] text-muted-foreground">{t('Teacher.students.noQuizzesOnTrack', 'No quizzes on track')}</span>
          ) : (
            <span className="text-[11px] text-muted-foreground">{t('Teacher.students.noQuizzes', 'No attempts yet')}</span>
          )}
          {latest && (
            <span className="text-[10px] text-muted-foreground">
              {t('Teacher.students.latestShort', 'Latest: {{score}}% · {{status}}', {
                score: latest.score,
                status: latest.isPassed
                  ? t('Teacher.students.pass', 'Pass')
                  : t('Teacher.students.fail', 'Fail'),
              })}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-end">
        <Button variant="outline" size="sm" type="button" className="gap-1 border-slate-300/80 dark:border-slate-600" onClick={onView}>
          <Eye className="h-3.5 w-3.5" />
          {t('Teacher.students.viewDetail', 'View')}
        </Button>
      </TableCell>
    </TableRow>
  );
}

function StudentCard({
  row,
  locale,
  onView,
}: {
  row: TrackStudentRow;
  locale: typeof enUS;
  onView: () => void;
}) {
  const { t } = useTranslation();
  const pct = Math.min(100, Math.max(0, row.progress.percentComplete));
  const passedQ = row.quizzes.passedQuizCount ?? 0;
  const totalQ = row.quizzes.totalQuizzesOnTrack ?? 0;
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-gradient-to-br from-card via-card to-emerald-50/30 p-4 shadow-md ring-1 ring-black/[0.03] transition-all',
        'dark:border-slate-800 dark:from-card dark:to-emerald-950/25 dark:ring-white/[0.04]'
      )}
    >
      <div className="flex items-start gap-3">
        <StudentAvatar name={row.child.fullName} avatarUrl={row.child.avatar} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-bold text-foreground">{row.child.fullName}</div>
              <div className="font-mono text-[11px] text-muted-foreground">@{row.child.username}</div>
            </div>
            <Button variant="outline" size="sm" type="button" className="shrink-0 gap-1" onClick={onView}>
              <Eye className="h-3.5 w-3.5" />
              {t('Teacher.students.viewDetail', 'View')}
            </Button>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200">
              <span>{pct}%</span>
              <span className="font-mono font-normal text-muted-foreground">
                {row.progress.completedLessons}/{row.progress.totalLessons}
              </span>
            </div>
            <div dir="ltr" className="w-full">
              <Progress value={pct} className="h-2.5 bg-slate-200/80 dark:bg-slate-800 [&>div]:bg-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>
              {t('Teacher.students.lastShort', 'Last')}: {lastActivityLabel(row.progress.lastActivityAt, locale)}
            </span>
            <span dir="ltr" className="inline-flex items-center gap-1 font-semibold text-foreground tabular-nums">
              <Trophy className="h-3 w-3 text-amber-600/90" />
              {t('Teacher.students.quizzesPassed', '{{passed}}/{{total}} passed', {
                passed: passedQ,
                total: totalQ,
              })}
            </span>
            {row.quizzes.averageScore != null && (
              <span>
                {t('Teacher.students.avgScore', 'Avg {{n}}%', { n: row.quizzes.averageScore })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
