import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/cn';
import type { TeacherTrackSummary } from '../types';
import { LifecycleBadge } from './LifecycleBadge';
import { TrackPriceSnapshot } from './TrackPriceSnapshot';

export function TeacherTrackCard({ track }: { track: TeacherTrackSummary }) {
  const { t } = useTranslation();
  const sessions = track._count?.sessions ?? 0;
  const paths = track._count?.learningPaths ?? 0;

  return (
    <Card
      className={cn(
        'group overflow-hidden rounded-3xl border-slate-200/80 bg-gradient-to-br from-slate-50/50 via-card to-emerald-50/35 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.2)] ring-1 ring-black/[0.03]',
        'transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_20px_50px_-20px_rgba(16,185,129,0.35)]',
        'dark:border-slate-800/80 dark:from-slate-950/40 dark:via-card dark:to-emerald-950/20 dark:ring-white/[0.04] dark:hover:shadow-[0_20px_50px_-20px_rgba(16,185,129,0.18)]'
      )}
    >
      <div className="h-1.5 w-full bg-gradient-to-l from-teal-500/20 via-emerald-500/70 to-emerald-800/90 opacity-90 transition-opacity group-hover:opacity-100" />
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2 pt-5">
        <div className="min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <LifecycleBadge lifecycle={track.lifecycle} />
            {!track.isActive && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t('Teacher.track.inactive', 'Inactive')}
              </span>
            )}
          </div>
          <CardTitle className="text-xl font-black leading-snug tracking-tight text-foreground">{track.title}</CardTitle>
          <TrackPriceSnapshot track={track} />
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700/12 to-teal-600/10 text-emerald-800 shadow-inner transition-transform duration-300 group-hover:scale-105 dark:from-emerald-500/20 dark:to-teal-900/20 dark:text-emerald-200">
          <Route className="h-6 w-6" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{track.description}</p>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-end">
            {t('Teacher.track.meta', '{{sessions}} lessons · {{paths}} units', { sessions, paths })}
          </p>
          <Button variant="primary" size="sm" asChild>
            <Link
              to={`/teacher/tracks/${track.id}`}
              className="gap-1.5 shadow-md shadow-emerald-600/20 transition-transform active:scale-[0.98]"
            >
              {t('Teacher.track.openRoadmap', 'Open roadmap')}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
