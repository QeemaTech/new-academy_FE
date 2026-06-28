import { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Calendar as RBCalendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop, {
} from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { fetchStudentCalendar, fetchStudentTracks, patchStudentStudySlots } from '../../api/student';
import type { StudentCalendarEvent, StudentCalendarUnscheduledItem } from '../../modules/student/types';
import { cn } from '../../lib/cn';
import { deriveLiveLessonPhase } from '../../modules/teacher/lib/lessonDerived';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { GripVertical, X } from 'lucide-react';

// `react-big-calendar` types may not be installed; keep runtime behavior strongly typed via `resource`.
type RBCEventLike = { title: string; start: Date; end: Date; allDay?: boolean };
type PlannerEvent = RBCEventLike & { resource: StudentCalendarEvent };

const locales = { en: enUS, ar };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date, culture?: unknown) => {
    const c = typeof culture === 'string' ? culture : culture ? String(culture) : '';
    const isAr = c.startsWith('ar') || c.includes('ar');
    return startOfWeek(date, { weekStartsOn: isAr ? 6 : 0 });
  },
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(RBCalendar);

function toDate(iso: string) {
  return new Date(iso);
}

function slotEnd(start: Date, minutes: number) {
  return new Date(start.getTime() + minutes * 60 * 1000);
}

export default function StudyPlannerPage() {
  const { i18n, t } = useTranslation();
  const rtl = i18n.language?.startsWith('ar');
  const qc = useQueryClient();

  const [dragging, setDragging] = useState<StudentCalendarUnscheduledItem | null>(null);
  const draggingRef = useRef<StudentCalendarUnscheduledItem | null>(null);
  const [trackFilter, setTrackFilter] = useState<string>('__all__');

  const tracksQ = useQuery({
    queryKey: ['student-tracks'],
    queryFn: fetchStudentTracks,
    staleTime: 60_000,
  });
  const tracks: Array<{ trackId: string; title: string }> = tracksQ.data?.tracks ?? [];
  const activeTrackId = trackFilter === '__all__' ? undefined : trackFilter;
  const selectedTrackName =
    trackFilter === '__all__'
      ? null
      : tracks.find((x) => x.trackId === trackFilter)?.title ?? null;

  const q = useQuery({
    queryKey: ['student-calendar', trackFilter],
    queryFn: () => fetchStudentCalendar(activeTrackId),
    staleTime: 15_000,
  });

  const events: PlannerEvent[] = useMemo(() => {
    const list = q.data?.events ?? [];
    return list.map((e) => ({
      title: e.title,
      start: toDate(e.startAt),
      end: toDate(e.endAt),
      allDay: false,
      resource: e,
    }));
  }, [q.data?.events]);

  const unscheduled = q.data?.unscheduled ?? [];
  const weeklyTargets = q.data?.weeklyTargets ?? {};

  const calKey = ['student-calendar', trackFilter] as const;

  const upsertOptimisticEvent = (ev: StudentCalendarEvent, start: Date, end: Date) => {
    qc.setQueryData<{ events: StudentCalendarEvent[]; unscheduled: StudentCalendarUnscheduledItem[] } | undefined>(
      calKey,
      (prev) => {
        if (!prev) return prev;
        const nextEvent: StudentCalendarEvent = {
          ...ev,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          locked: false,
        };
        const exists = prev.events.some((x) => x.itemType === ev.itemType && x.itemId === ev.itemId);
        const events = exists
          ? prev.events.map((x) => (x.itemType === ev.itemType && x.itemId === ev.itemId ? nextEvent : x))
          : [...prev.events, nextEvent];
        const unscheduledNext = prev.unscheduled.filter(
          (u) => !(u.itemType === ev.itemType && u.itemId === ev.itemId)
        );
        return { ...prev, events, unscheduled: unscheduledNext };
      }
    );
  };

  const saveSlot = async (ev: StudentCalendarEvent, start: Date, end: Date) => {
    await patchStudentStudySlots({
      slots: [
        {
          itemType: ev.itemType,
          itemId: ev.itemId,
          trackId: ev.trackId,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
        },
      ],
    });
    void qc.invalidateQueries({ queryKey: ['student-calendar'] });
  };

  const onEventDrop = async ({ event, start, end }: { event: PlannerEvent; start: Date; end: Date }) => {
    if (event.resource.locked) return;
    const snapshot = qc.getQueryData(calKey);
    upsertOptimisticEvent(event.resource, start, end);
    try {
      await saveSlot(event.resource, start, end);
      toast.success(t('Student.planner.saved', 'Saved'));
    } catch {
      qc.setQueryData(calKey, snapshot);
      toast.error(t('Student.planner.saveError', 'Could not save slot'));
    }
  };

  const dragFromOutsideItem = (_args: unknown) => {
    const item = draggingRef.current ?? dragging;
    if (!item) return null;
    // A temporary calendar event while dragging in
    return {
      title: item.title,
      start: new Date(),
      end: slotEnd(new Date(), item.suggestedDurationMin),
      allDay: false,
      resource: {
        id: `${item.itemType}:${item.itemId}`,
        itemType: item.itemType,
        itemId: item.itemId,
        trackId: item.trackId,
        kind: item.kind === 'QUIZ' ? 'QUIZ' : 'RECORDED',
        title: item.title,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        locked: false,
      } satisfies StudentCalendarEvent,
    } as PlannerEvent;
  };

  const onDropFromOutside = async ({ start }: { start: Date | string }) => {
    const item = draggingRef.current ?? dragging;
    if (!item) return;
    const snapshot = qc.getQueryData(calKey);
    try {
      const startAt = start as Date;
      const endAt = slotEnd(startAt, item.suggestedDurationMin);
      const eventResource: StudentCalendarEvent = {
        id: `${item.itemType}:${item.itemId}`,
        itemType: item.itemType,
        itemId: item.itemId,
        trackId: item.trackId,
        kind: item.kind === 'QUIZ' ? 'QUIZ' : 'RECORDED',
        title: item.title,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        locked: false,
      };
      upsertOptimisticEvent(eventResource, startAt, endAt);
      await patchStudentStudySlots({
        slots: [
          {
            itemType: item.itemType,
            itemId: item.itemId,
            trackId: item.trackId,
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
          },
        ],
      });
      toast.success(t('Student.planner.saved', 'Saved'));
      setDragging(null);
      draggingRef.current = null;
      void qc.invalidateQueries({ queryKey: ['student-calendar'] });
    } catch {
      // rollback optimistic
      qc.setQueryData(calKey, snapshot);
      toast.error(t('Student.planner.saveError', 'Could not save slot'));
    }
  };

  const eventPropGetter = (event: PlannerEvent) => {
    const e = event.resource;
    if (e.kind === 'LIVE') {
      const phase = deriveLiveLessonPhase('LIVE', e.startAt);
      const base =
        phase === 'starting_soon'
          ? 'bg-emerald-600 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]'
          : phase === 'active'
            ? 'bg-emerald-700'
            : 'bg-emerald-800/90';
      return {
        className: cn(
          'rounded-xl border border-emerald-200/30 text-white',
          base
        ),
      };
    }
    if (e.kind === 'QUIZ') {
      return {
        className: 'rounded-xl border border-amber-200/40 bg-amber-500/25 text-slate-900',
      };
    }
    return {
      className: 'rounded-xl border border-slate-200/60 bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white',
    };
  };

  return (
    <div className={cn('space-y-5', rtl ? 'rtl' : '')} dir={rtl ? 'rtl' : 'ltr'}>
      <header className="rounded-3xl border border-slate-200/80 bg-card p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.18)] dark:border-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {t('Student.planner.title', 'Study planner')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('Student.planner.subtitle', 'Drag lessons and quizzes into your week. Live sessions are fixed.')}
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <Select
              value={trackFilter}
              onValueChange={(v) => {
                setDragging(null);
                setTrackFilter(v);
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <SelectTrigger className="flex-1 rounded-2xl border-emerald-900/15 bg-slate-50/70 shadow-inner dark:bg-slate-900/40">
                <SelectValue placeholder={t('Student.planner.allTracks', 'All tracks')} />
                </SelectTrigger>
                {selectedTrackName && (
                  <Badge
                    variant="success"
                    className="gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/12 text-emerald-900 dark:text-emerald-100"
                  >
                    {selectedTrackName}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full text-emerald-900/80 hover:bg-emerald-500/10 dark:text-emerald-100"
                      aria-label={t('Student.planner.clearFilter', 'Clear filter')}
                      onClick={() => setTrackFilter('__all__')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </Badge>
                )}
              </div>
              <SelectContent>
                <SelectItem value="__all__">{t('Student.planner.allTracks', 'All tracks')}</SelectItem>
                {tracks.map((tr) => (
                  <SelectItem key={tr.trackId} value={tr.trackId}>
                    {tr.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-3xl border border-slate-200/80 bg-card p-4 shadow-sm dark:border-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground">{t('Student.planner.todo', 'Suggested slots')}</h2>
            <span className="text-xs font-semibold text-muted-foreground">{unscheduled.length}</span>
          </div>
          <p className="mb-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-200">
            {t(
              'Student.planner.dragHint',
              '🎯 اسحب المهمة وأفلتها في الجدول لتحديد موعدها'
            )}
          </p>
          {q.isLoading ? (
            <div className="text-sm text-muted-foreground">{t('Student.planner.loading', 'Loading…')}</div>
          ) : tracksQ.isError ? (
            <div className="text-sm text-muted-foreground">{t('Student.planner.loading', 'Loading…')}</div>
          ) : unscheduled.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted-foreground dark:border-slate-800">
              {t('Student.planner.empty', 'Nothing to schedule right now.')}
            </div>
          ) : (
            <ul className="space-y-2">
              {(() => {
                const perTrackSeen: Record<string, number> = {};
                const sorted = unscheduled.slice().sort((a, b) => a.order - b.order);
                return sorted.map((it) => {
                  const target = weeklyTargets[it.trackId];
                  const isRecorded = it.kind !== 'QUIZ';
                  const seen = perTrackSeen[it.trackId] ?? 0;
                  const isWeeklyTarget =
                    isRecorded && !!target && seen < target.recommendedLessonsPerWeek;
                  perTrackSeen[it.trackId] = isRecorded ? seen + 1 : seen;

                  return (
                  <li key={`${it.itemType}:${it.itemId}`}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        setDragging(it);
                        draggingRef.current = it;
                        // Required in Firefox / some browsers to initialize DnD
                        e.dataTransfer.setData('text/plain', '');
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        draggingRef.current = null;
                      }}
                      className={cn(
                        'group w-full rounded-2xl border p-3 text-start transition-all active:scale-[0.99]',
                        'cursor-grab active:cursor-grabbing',
                        it.kind === 'QUIZ'
                          ? 'border-amber-200/60 bg-amber-500/10 hover:bg-amber-500/15 dark:border-amber-900/50'
                          : 'border-slate-200/70 bg-slate-50/60 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            'mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-xl border',
                            it.kind === 'QUIZ'
                              ? 'border-amber-500/25 bg-amber-500/10 text-amber-700'
                              : 'border-[#4178EF]/20 bg-[#4178EF]/10 text-[#4178EF]'
                          )}
                          aria-hidden
                        >
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-black text-foreground">{it.title}</div>
                            {isWeeklyTarget ? (
                              <span className="rounded-full bg-emerald-600/15 px-2 py-0.5 text-[10px] font-black text-emerald-800 ring-1 ring-emerald-600/20">
                                {t('Student.planner.weekTarget', 'هدف هذا الأسبوع')}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 text-xs font-bold text-muted-foreground" dir="ltr">
                            {it.suggestedDurationMin} min
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                  );
                });
              })()}
            </ul>
          )}
        </aside>

        <section className="rounded-3xl border border-slate-200/80 bg-card p-3 shadow-sm dark:border-slate-800">
          <div className="calendar-shell">
            <DnDCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              rtl={rtl}
              defaultView="week"
              views={['week', 'day', 'agenda']}
              step={30}
              timeslots={2}
              onEventDrop={onEventDrop}
              draggableAccessor={(ev: PlannerEvent) => !ev.resource.locked}
              resizable={false}
              onDropFromOutside={onDropFromOutside}
              dragFromOutsideItem={dragFromOutsideItem}
              eventPropGetter={(ev: PlannerEvent) => eventPropGetter(ev)}
              style={{ height: 720 }}
              messages={{
                week: t('Student.planner.week', 'Week'),
                day: t('Student.planner.day', 'Day'),
                agenda: t('Student.planner.agenda', 'Agenda'),
                today: t('Student.planner.today', 'Today'),
                previous: t('Student.planner.prev', 'Back'),
                next: t('Student.planner.next', 'Next'),
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

