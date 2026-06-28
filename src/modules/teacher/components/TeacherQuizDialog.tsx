import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import type {
  CreateTeacherQuizPayload,
  TeacherLearningPath,
  TeacherQuestionType,
  TeacherQuiz,
  TeacherQuizType,
} from '../types';
import {
  useCreateTeacherQuizMutation,
  useUpdateTeacherQuizMutation,
} from '../hooks/useTeacherQueries';
import { cn } from '../../../lib/cn';

function nid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type DraftOption = { localId: string; text: string; isCorrect: boolean };
type DraftQuestion = {
  localId: string;
  text: string;
  type: TeacherQuestionType;
  points: number;
  options: DraftOption[];
};

function emptyMcq(): DraftQuestion {
  return {
    localId: nid(),
    text: '',
    type: 'MCQ',
    points: 1,
    options: [
      { localId: nid(), text: '', isCorrect: true },
      { localId: nid(), text: '', isCorrect: false },
    ],
  };
}

function emptyTf(): DraftQuestion {
  return {
    localId: nid(),
    text: '',
    type: 'TRUE_FALSE',
    points: 1,
    options: [
      { localId: nid(), text: 'True', isCorrect: true },
      { localId: nid(), text: 'False', isCorrect: false },
    ],
  };
}

function quizToDrafts(quiz: TeacherQuiz): DraftQuestion[] {
  return quiz.questions.map((q) => ({
    localId: q.id ?? nid(),
    text: q.text,
    type: q.type,
    points: q.points,
    options: q.options.map((o) => ({
      localId: o.id ?? nid(),
      text: o.text,
      isCorrect: o.isCorrect,
    })),
  }));
}

export function TeacherQuizDialog({
  open,
  onOpenChange,
  trackId,
  learningPaths,
  quiz,
  initialLearningPathId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trackId: string;
  learningPaths: TeacherLearningPath[];
  quiz: TeacherQuiz | null;
  initialLearningPathId: string | null;
}) {
  const { t } = useTranslation();
  const createM = useCreateTeacherQuizMutation(trackId);
  const updateM = useUpdateTeacherQuizMutation(trackId);
  const busy = createM.isPending || updateM.isPending;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<TeacherQuizType>('LESSON_QUIZ');
  const [passingScore, setPassingScore] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [learningPathId, setLearningPathId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyMcq()]);

  const pathSelectValue = learningPathId ?? '__track__';

  const sortedPaths = useMemo(
    () => [...learningPaths].sort((a, b) => a.order - b.order),
    [learningPaths]
  );

  useEffect(() => {
    if (!open) return;
    if (quiz) {
      setTitle(quiz.title);
      setType(quiz.type);
      setPassingScore(quiz.passingScore);
      setMaxAttempts(quiz.maxAttempts);
      setTimeLimit(quiz.timeLimit != null ? String(quiz.timeLimit) : '');
      setLearningPathId(quiz.learningPathId);
      const drafts = quizToDrafts(quiz);
      setQuestions(drafts.length ? drafts : [emptyMcq()]);
    } else {
      setTitle('');
      setType('LESSON_QUIZ');
      setPassingScore(60);
      setMaxAttempts(3);
      setTimeLimit('');
      setLearningPathId(initialLearningPathId);
      setQuestions([emptyMcq()]);
    }
  }, [open, quiz, initialLearningPathId]);

  const buildPayload = (): CreateTeacherQuizPayload | null => {
    const tl = timeLimit.trim();
    const timeLimitNum = tl === '' ? null : Number.parseInt(tl, 10);
    if (tl !== '' && (Number.isNaN(timeLimitNum!) || (timeLimitNum ?? 0) <= 0)) {
      toast.error(t('Teacher.quiz.errTimeLimit', 'Enter a valid time limit in minutes or leave empty.'));
      return null;
    }
    if (title.trim().length < 2) {
      toast.error(t('Teacher.quiz.errTitle', 'Title is too short.'));
      return null;
    }
    if (questions.length === 0) {
      toast.error(t('Teacher.quiz.errNoQuestions', 'Add at least one question.'));
      return null;
    }
    const payloadQuestions: CreateTeacherQuizPayload['questions'] = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      if (!q.text.trim()) {
        toast.error(t('Teacher.quiz.errQuestionText', 'Every question needs text.'));
        return null;
      }
      if (q.type === 'TRUE_FALSE') {
        if (q.options.length !== 2) {
          toast.error(t('Teacher.quiz.errTf', 'True/False must have two options.'));
          return null;
        }
        const correct = q.options.filter((o) => o.isCorrect).length;
        if (correct !== 1) {
          toast.error(t('Teacher.quiz.errOneCorrect', 'Mark exactly one correct answer per question.'));
          return null;
        }
        payloadQuestions.push({
          text: q.text.trim(),
          type: 'TRUE_FALSE',
          points: q.points,
          order: i,
          options: q.options.map((o) => ({ text: o.text.trim() || o.text, isCorrect: o.isCorrect })),
        });
        continue;
      }
      const filledOpts = q.options.filter((o) => o.text.trim());
      if (filledOpts.length < 2) {
        toast.error(t('Teacher.quiz.errMcqOptions', 'Multiple choice needs at least two filled options.'));
        return null;
      }
      const correctAmongFilled = filledOpts.filter((o) => o.isCorrect).length;
      if (correctAmongFilled !== 1) {
        toast.error(t('Teacher.quiz.errOneCorrect', 'Mark exactly one correct answer per question.'));
        return null;
      }
      payloadQuestions.push({
        text: q.text.trim(),
        type: 'MCQ',
        points: q.points,
        order: i,
        options: filledOpts.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
      });
    }

    return {
      title: title.trim(),
      type,
      passingScore,
      maxAttempts,
      timeLimit: timeLimitNum,
      learningPathId,
      questions: payloadQuestions,
    };
  };

  const onSubmit = async () => {
    const payload = buildPayload();
    if (!payload) return;
    if (quiz) {
      await updateM.mutateAsync({ quizId: quiz.id, body: payload });
    } else {
      await createM.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const setQuestionType = (localId: string, next: TeacherQuestionType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.localId !== localId) return q;
        if (next === 'TRUE_FALSE') return { ...emptyTf(), localId: q.localId, text: q.text, points: q.points };
        return { ...emptyMcq(), localId: q.localId, text: q.text, points: q.points };
      })
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-h-[min(90vh,880px)] w-[min(96vw,720px)] overflow-y-auto rounded-3xl border-slate-200/80 p-0',
          'bg-card shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]'
        )}
      >
        <DialogHeader className="border-b border-slate-200/70 px-6 py-5 dark:border-slate-800">
          <DialogTitle className="text-xl font-black">
            {quiz
              ? t('Teacher.quiz.editTitle', 'Edit assessment')
              : t('Teacher.quiz.createTitle', 'New assessment')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t(
              'Teacher.quiz.subtitle',
              'Link quizzes and exams to your curriculum. Students see them in roadmap order.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="qz-title">{t('Teacher.quiz.title', 'Title')}</Label>
              <Input
                id="qz-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('Teacher.quiz.titlePh', 'e.g. Module 1 check-in')}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Teacher.quiz.kind', 'Assessment type')}</Label>
              <Select value={type} onValueChange={(v) => setType(v as TeacherQuizType)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LESSON_QUIZ">{t('Teacher.quiz.typeLesson', 'Quiz')}</SelectItem>
                  <SelectItem value="TRACK_FINAL">{t('Teacher.quiz.typeFinal', 'Final exam')}</SelectItem>
                  <SelectItem value="COMPETITION">{t('Teacher.quiz.typeCompetition', 'Competition')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Teacher.quiz.placement', 'Roadmap segment')}</Label>
              <Select
                value={pathSelectValue}
                onValueChange={(v) => setLearningPathId(v === '__track__' ? null : v)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__track__">{t('Teacher.lessonDialog.pathNone', 'Track-level (no unit)')}</SelectItem>
                  {sortedPaths.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qz-pass">{t('Teacher.quiz.passingScore', 'Passing score %')}</Label>
              <Input
                id="qz-pass"
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qz-attempts">{t('Teacher.quiz.maxAttempts', 'Max attempts')}</Label>
              <Input
                id="qz-attempts"
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="qz-time">{t('Teacher.quiz.timeLimit', 'Time limit (minutes, optional)')}</Label>
              <Input
                id="qz-time"
                type="number"
                min={1}
                placeholder="—"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-black tracking-tight text-foreground">
                {t('Teacher.quiz.questions', 'Questions')}
              </h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1 rounded-xl border-emerald-500/30"
                onClick={() => setQuestions((q) => [...q, emptyMcq()])}
              >
                <Plus className="h-4 w-4" />
                {t('Teacher.quiz.addQuestion', 'Add question')}
              </Button>
            </div>

            {questions.map((q, qi) => (
              <div
                key={q.localId}
                className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {t('Teacher.quiz.questionN', 'Question {{n}}', { n: qi + 1 })}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={q.type} onValueChange={(v) => setQuestionType(q.localId, v as TeacherQuestionType)}>
                      <SelectTrigger className="h-9 w-[140px] rounded-lg text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MCQ">{t('Teacher.quiz.mcq', 'Multiple choice')}</SelectItem>
                        <SelectItem value="TRUE_FALSE">{t('Teacher.quiz.tf', 'True / False')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive"
                        onClick={() => setQuestions((prev) => prev.filter((x) => x.localId !== q.localId))}
                        aria-label={t('Teacher.quiz.removeQuestion', 'Remove question')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  value={q.text}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((row) => (row.localId === q.localId ? { ...row, text: e.target.value } : row))
                    )
                  }
                  placeholder={t('Teacher.quiz.questionPlaceholder', 'Write the question…')}
                  className="min-h-[72px] rounded-xl"
                />
                {q.type === 'MCQ' ? (
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <div key={opt.localId} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${q.localId}`}
                          checked={opt.isCorrect}
                          onChange={() =>
                            setQuestions((prev) =>
                              prev.map((row) => {
                                if (row.localId !== q.localId) return row;
                                return {
                                  ...row,
                                  options: row.options.map((o) => ({
                                    ...o,
                                    isCorrect: o.localId === opt.localId,
                                  })),
                                };
                              })
                            )
                          }
                          className="h-4 w-4 accent-emerald-600"
                        />
                        <Input
                          value={opt.text}
                          onChange={(e) =>
                            setQuestions((prev) =>
                              prev.map((row) => {
                                if (row.localId !== q.localId) return row;
                                return {
                                  ...row,
                                  options: row.options.map((o) =>
                                    o.localId === opt.localId ? { ...o, text: e.target.value } : o
                                  ),
                                };
                              })
                            )
                          }
                          placeholder={t('Teacher.quiz.optionPlaceholder', 'Option text')}
                          className="rounded-lg"
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.map((row) => {
                            if (row.localId !== q.localId || row.type !== 'MCQ') return row;
                            return {
                              ...row,
                              options: [
                                ...row.options,
                                { localId: nid(), text: '', isCorrect: false },
                              ],
                            };
                          })
                        )
                      }
                    >
                      + {t('Teacher.quiz.addOption', 'Add option')}
                    </Button>
                  </div>
                ) : (
                  <RadioGroup
                    value={q.options.find((o) => o.isCorrect)?.localId ?? ''}
                    onValueChange={(val) =>
                      setQuestions((prev) =>
                        prev.map((row) => {
                          if (row.localId !== q.localId) return row;
                          return {
                            ...row,
                            options: row.options.map((o) => ({ ...o, isCorrect: o.localId === val })),
                          };
                        })
                      )
                    }
                    className="flex flex-col gap-2"
                  >
                    {q.options.map((opt) => (
                      <label
                        key={opt.localId}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2"
                      >
                        <RadioGroupItem value={opt.localId} />
                        <span className="text-sm font-medium">{opt.text}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200/70 px-6 py-4 dark:border-slate-800">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            {t('Teacher.lessonDialog.cancel', 'Cancel')}
          </Button>
          <Button type="button" variant="primary" className="rounded-xl" onClick={() => void onSubmit()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {quiz ? t('Teacher.quiz.save', 'Save changes') : t('Teacher.quiz.create', 'Create assessment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
