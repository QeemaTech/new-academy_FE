import { useTranslation } from 'react-i18next';
import {
  Archive,
  Calendar,
  CircleDot,
  Clock,
  Pencil,
  PlayCircle,
  Radio,
  UploadCloud,
  Video,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/cn';
import type { TeacherSession } from '../types';
import {
  deriveLiveLessonPhase,
  formatHms,
  msUntilLiveEnd,
  msUntilStart,
} from '../lib/lessonDerived';
import { useLiveLessonNow } from '../hooks/useLiveLessonNow';

function utcMedium(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function RoadmapSessionRow({
  session,
  index,
  onEdit,
}: {
  session: TeacherSession;
  index: number;
  onEdit: (s: TeacherSession) => void;
}) {
  const { t } = useTranslation();
  const now = useLiveLessonNow(session);
  const livePhase =
    session.lessonType === 'LIVE'
      ? deriveLiveLessonPhase(session.lessonType, session.scheduledAt, now, session.duration)
      : 'n_a';

  const untilStart = session.scheduledAt ? msUntilStart(session.scheduledAt, now) : null;
  const untilEnd =
    session.lessonType === 'LIVE' && session.scheduledAt
      ? msUntilLiveEnd(session.scheduledAt, session.duration, now)
      : null;

  const joinProminent =
    session.lessonType === 'LIVE' &&
    !!session.liveMeetingUrl &&
    (livePhase === 'starting_soon' || livePhase === 'active');

  const rowPulse =
    session.lessonType === 'LIVE' &&
    (livePhase === 'starting_soon' || livePhase === 'active');

  const showJoinMuted =
    session.lessonType === 'LIVE' && !!session.liveMeetingUrl && livePhase === 'upcoming';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all duration-300 hover:bg-white hover:shadow-md md:p-5',
        rowPulse && 'border-teal-300 bg-teal-50/30 shadow-md ring-2 ring-teal-500/10'
      )}
    >


      <div className="relative flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black shadow-sm transition-colors',
            rowPulse
              ? 'bg-teal-600 text-white'
              : 'bg-white border border-slate-100 text-slate-700'
          )}
        >
          {index + 1}
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-black leading-snug tracking-tight text-foreground md:text-[1.05rem]">
              {session.title}
            </h4>
            {session.lessonType === 'RECORDED' ? (
              <Badge variant="secondary" className="gap-1.5 border-none bg-slate-200 text-slate-700 px-3 py-1 font-bold">
                <PlayCircle className="h-3.5 w-3.5" />
                {t('Teacher.lesson.recorded', 'Recorded')}
              </Badge>
            ) : (
              <>
                <Badge
                  variant="secondary"
                  className="gap-1.5 border-none bg-teal-600 text-white px-3 py-1 font-bold"
                >
                  <Radio className="h-3.5 w-3.5" />
                  {t('Teacher.lesson.live', 'Live')}
                </Badge>
                {livePhase === 'upcoming' && (
                  <Badge
                    variant="outline"
                    className="border-sky-500/40 bg-sky-500/10 font-semibold text-sky-900 dark:text-sky-100"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {t('Teacher.live.scheduled', 'Scheduled')}
                  </Badge>
                )}
                {livePhase === 'starting_soon' && (
                  <span className="relative inline-flex items-center">
                    <span
                      className="absolute inset-0 animate-ping rounded-full bg-emerald-400/35"
                      aria-hidden
                    />
                    <Badge variant="success" className="relative gap-1 font-bold shadow-sm">
                      {t('Teacher.live.startingSoon', 'Starting soon')}
                    </Badge>
                  </span>
                )}
                {livePhase === 'active' && (
                  <Badge className="gap-1 border-0 bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-md">
                    <CircleDot className="h-3.5 w-3.5 animate-pulse" />
                    {t('Teacher.live.happeningNow', 'Happening now')}
                  </Badge>
                )}
                {livePhase === 'past' && !session.recordingUrl && (
                  <Badge
                    variant="warning"
                    className="gap-1 font-semibold"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    {t('Teacher.live.waitingRecording', 'Waiting for recording')}
                  </Badge>
                )}
                {livePhase === 'past' && session.recordingUrl && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-slate-400/50 font-semibold"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    {t('Teacher.live.archived', 'Recorded')}
                  </Badge>
                )}
              </>
            )}
            {!session.isActive && (
              <Badge variant="destructive">{t('Teacher.lesson.hidden', 'Hidden')}</Badge>
            )}
          </div>

          {session.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{session.description}</p>
          )}

          {session.lessonType === 'LIVE' && session.scheduledAt && (
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="font-medium text-foreground/90">{utcMedium(session.scheduledAt)}</span>
              <span className="text-[10px] uppercase tracking-wide">{t('Teacher.live.utcHint', 'UTC')}</span>
            </p>
          )}

          {session.lessonType === 'RECORDED' && session.videoUrl && (
            <p className="text-[11px] text-muted-foreground">
              {t('Teacher.lesson.video', 'Video')}: {session.videoUrl.slice(0, 48)}…
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-3 border-t border-slate-200/70 pt-3 md:w-[min(100%,280px)] md:border-s md:border-t-0 md:ps-5 md:pt-0 dark:border-slate-700/80">
          {session.lessonType === 'LIVE' && session.scheduledAt && livePhase !== 'n_a' && (
            <div className="space-y-1.5">
              {(livePhase === 'upcoming' || livePhase === 'starting_soon') && untilStart != null && untilStart > 0 && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t('Teacher.live.startsInLabel', 'Starts in')}
                  </p>
                  <p
                    dir="ltr"
                    className="font-mono text-lg font-black tabular-nums tracking-tight text-emerald-700 dark:text-emerald-300"
                  >
                    {formatHms(untilStart)}
                  </p>
                </div>
              )}
              {livePhase === 'active' && untilEnd != null && untilEnd > 0 && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/80 dark:text-emerald-100/90">
                    {t('Teacher.live.endsInLabel', 'Session ends in')}
                  </p>
                  <p
                    dir="ltr"
                    className="font-mono text-lg font-black tabular-nums tracking-tight text-emerald-800 dark:text-emerald-200"
                  >
                    {formatHms(untilEnd)}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2">
            {joinProminent && session.liveMeetingUrl && (
              <Button
                variant="primary"
                size="lg"
                className={cn(
                  'w-full gap-2 shadow-lg shadow-emerald-600/25 transition-transform active:scale-[0.99]',
                  livePhase === 'starting_soon' && 'animate-pulse'
                )}
                asChild
              >
                <a href={session.liveMeetingUrl} target="_blank" rel="noreferrer">
                  <Video className="h-4 w-4" />
                  {t('Teacher.live.joinLive', 'Join live room')}
                </a>
              </Button>
            )}

            {showJoinMuted && session.liveMeetingUrl && (
              <Button variant="outline" size="sm" className="w-full gap-2 border-dashed opacity-90" asChild>
                <a href={session.liveMeetingUrl} target="_blank" rel="noreferrer">
                  <Video className="h-3.5 w-3.5" />
                  {t('Teacher.live.openLobby', 'Open meeting link')}
                </a>
              </Button>
            )}

            {session.lessonType === 'LIVE' && session.recordingUrl && livePhase === 'past' && (
              <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                <a href={session.recordingUrl} target="_blank" rel="noreferrer">
                  <PlayCircle className="h-3.5 w-3.5" />
                  {t('Teacher.lesson.recording', 'Recording')}
                </a>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1 border-slate-300/80 dark:border-slate-600"
              type="button"
              onClick={() => onEdit(session)}
            >
              <Pencil className="h-3.5 w-3.5" />
              {t('Teacher.lesson.edit', 'Edit')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
