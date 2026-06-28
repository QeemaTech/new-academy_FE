import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import type { SessionContentType, TeacherLearningPath, TeacherSession } from '../types';
import {
  useCreateTeacherSessionMutation,
  useUpdateTeacherSessionMutation,
} from '../hooks/useTeacherQueries';

const NONE = '__none__';

function toDateTimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

const lessonFormSchema = z
  .object({
    title: z.string().min(1),
    learningPathId: z.string(),
    description: z.string().optional(),
    contentType: z.enum(['VIDEO', 'PDF', 'TEXT', 'MIXED']),
    lessonType: z.enum(['RECORDED', 'LIVE']),
    scheduledAtLocal: z.string().optional(),
    liveMeetingUrl: z.string().optional(),
    recordingUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    textContent: z.string().optional(),
    duration: z.string().optional(),
    order: z.string().optional(),
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.lessonType === 'LIVE') {
      if (!v.scheduledAtLocal?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required',
          path: ['scheduledAtLocal'],
        });
      }
      if (!v.liveMeetingUrl?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Required',
          path: ['liveMeetingUrl'],
        });
      }
    }
  });

type LessonFormValues = z.infer<typeof lessonFormSchema>;

function parseOrder(s: string | undefined): number {
  const n = parseInt(String(s ?? '0'), 10);
  return Number.isFinite(n) ? n : 0;
}

function parseDuration(s: string | undefined): number | null | undefined {
  const t = s?.trim();
  if (!t) return undefined;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return n;
}

function emptyDefaults(initialPath: string | null): LessonFormValues {
  return {
    title: '',
    learningPathId: initialPath ?? NONE,
    description: '',
    contentType: 'VIDEO',
    lessonType: 'RECORDED',
    scheduledAtLocal: '',
    liveMeetingUrl: '',
    recordingUrl: '',
    videoUrl: '',
    textContent: '',
    duration: '',
    order: '0',
    isActive: true,
  };
}

function fromSession(s: TeacherSession): LessonFormValues {
  return {
    title: s.title,
    learningPathId: s.learningPathId ?? NONE,
    description: s.description ?? '',
    contentType: s.contentType,
    lessonType: s.lessonType,
    scheduledAtLocal: toDateTimeLocalValue(s.scheduledAt),
    liveMeetingUrl: s.liveMeetingUrl ?? '',
    recordingUrl: s.recordingUrl ?? '',
    videoUrl: s.videoUrl ?? '',
    textContent: s.textContent ?? '',
    duration: s.duration != null ? String(s.duration) : '',
    order: String(s.order),
    isActive: s.isActive,
  };
}

function toApiBody(values: LessonFormValues) {
  const learningPathId = values.learningPathId === NONE ? null : values.learningPathId;
  const description = values.description?.trim() || null;
  const videoUrl = values.videoUrl?.trim() || null;
  const textContent = values.textContent?.trim() || null;
  const recordingUrl = values.recordingUrl?.trim() || null;

  const base = {
    title: values.title.trim(),
    learningPathId,
    description,
    contentType: values.contentType as SessionContentType,
    lessonType: values.lessonType,
    videoUrl,
    textContent,
    duration: parseDuration(values.duration) ?? null,
    order: parseOrder(values.order),
    isActive: values.isActive,
  };

  if (values.lessonType === 'LIVE') {
    const scheduledAt = new Date(values.scheduledAtLocal!.trim()).toISOString();
    return {
      ...base,
      scheduledAt,
      liveMeetingUrl: values.liveMeetingUrl!.trim(),
      recordingUrl,
    };
  }

  return {
    ...base,
    lessonType: 'RECORDED' as const,
    scheduledAt: null,
    liveMeetingUrl: null,
    recordingUrl,
  };
}

export function LessonEditorDialog({
  open,
  onOpenChange,
  trackId,
  learningPaths,
  session,
  initialLearningPathId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trackId: string;
  learningPaths: TeacherLearningPath[];
  session: TeacherSession | null;
  initialLearningPathId: string | null;
}) {
  const { t } = useTranslation();
  const createMut = useCreateTeacherSessionMutation(trackId);
  const updateMut = useUpdateTeacherSessionMutation(trackId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: emptyDefaults(initialLearningPathId),
  });

  const lessonType = watch('lessonType');

  useEffect(() => {
    if (!open) return;
    if (session) reset(fromSession(session));
    else reset({ ...emptyDefaults(initialLearningPathId), learningPathId: initialLearningPathId ?? NONE });
  }, [open, session, initialLearningPathId, reset]);

  const onSubmit = async (values: z.infer<typeof lessonFormSchema>) => {
    const body = toApiBody(values);
    try {
      if (session) {
        await updateMut.mutateAsync({ sessionId: session.id, body });
      } else {
        await createMut.mutateAsync(body);
      }
      onOpenChange(false);
    } catch {
      /* toast in hook */
    }
  };

  const busy = isSubmitting || createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(92vw,560px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {session ? t('Teacher.lessonDialog.editTitle', 'Edit lesson') : t('Teacher.lessonDialog.createTitle', 'New lesson')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Teacher.lessonDialog.subtitle',
              'Linear roadmap step: choose recorded vs live (UTC schedule + meeting link for live).'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1 pb-2">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">{t('Teacher.lessonDialog.title', 'Title')}</Label>
            <Input id="lesson-title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t('Teacher.lessonDialog.learningPath', 'Learning unit')}</Label>
            <Controller
              name="learningPathId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Teacher.lessonDialog.pathPlaceholder', 'Select unit')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{t('Teacher.lessonDialog.pathNone', 'Track-level (no unit)')}</SelectItem>
                    {[...learningPaths]
                      .sort((a, b) => a.order - b.order)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-desc">{t('Teacher.lessonDialog.description', 'Description')}</Label>
            <Textarea id="lesson-desc" rows={2} {...register('description')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('Teacher.lessonDialog.contentType', 'Content type')}</Label>
              <Controller
                name="contentType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['VIDEO', 'PDF', 'TEXT', 'MIXED'] as const).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-order">{t('Teacher.lessonDialog.order', 'Order (sequence)')}</Label>
              <Input id="lesson-order" type="number" {...register('order')} />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <Label className="text-sm font-bold">{t('Teacher.lessonDialog.lessonType', 'Lesson type')}</Label>
            <Controller
              name="lessonType"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-3 text-sm font-medium has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                    <RadioGroupItem value="RECORDED" id="lt-rec" />
                    <span>{t('Teacher.lessonDialog.typeRecorded', 'Recorded — on-demand')}</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-3 text-sm font-medium has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                    <RadioGroupItem value="LIVE" id="lt-live" />
                    <span>{t('Teacher.lessonDialog.typeLive', 'Live — scheduled (UTC)')}</span>
                  </label>
                </RadioGroup>
              )}
            />
          </div>

          {lessonType === 'LIVE' && (
            <div className="space-y-4 rounded-lg border border-primary/25 bg-primary/5 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {t(
                  'Teacher.lessonDialog.liveHint',
                  'Pick the local date/time for the session; it is sent to the API as an ISO instant (UTC).'
                )}
              </p>
              <div className="space-y-2">
                <Label htmlFor="sched">{t('Teacher.lessonDialog.scheduledAt', 'Scheduled start')}</Label>
                <Input id="sched" type="datetime-local" step={60} {...register('scheduledAtLocal')} />
                {errors.scheduledAtLocal && (
                  <p className="text-xs text-destructive">{errors.scheduledAtLocal.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="meet">{t('Teacher.lessonDialog.meetingUrl', 'Live meeting URL')}</Label>
                <Input id="meet" type="url" placeholder="https://…" {...register('liveMeetingUrl')} />
                {errors.liveMeetingUrl && (
                  <p className="text-xs text-destructive">{errors.liveMeetingUrl.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rec">{t('Teacher.lessonDialog.recordingUrl', 'Recording URL (after live)')}</Label>
                <Input id="rec" type="url" placeholder="https://…" {...register('recordingUrl')} />
              </div>
            </div>
          )}

          {lessonType === 'RECORDED' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="vid">{t('Teacher.lessonDialog.videoUrl', 'Video URL')}</Label>
                <Input id="vid" type="url" {...register('videoUrl')} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="txt">{t('Teacher.lessonDialog.textContent', 'Text / instructions')}</Label>
                <Textarea id="txt" rows={3} {...register('textContent')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dur">{t('Teacher.lessonDialog.duration', 'Duration (minutes)')}</Label>
                <Input id="dur" type="number" min={1} {...register('duration')} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2">
            <div>
              <p className="text-sm font-semibold">{t('Teacher.lessonDialog.visible', 'Visible to students')}</p>
              <p className="text-xs text-muted-foreground">{t('Teacher.lessonDialog.visibleHint', 'Turn off to hide while drafting.')}</p>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          <DialogFooter className="sticky bottom-0 bg-card pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('Teacher.lessonDialog.cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? t('Teacher.lessonDialog.saving', 'Saving…') : t('Teacher.lessonDialog.save', 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
