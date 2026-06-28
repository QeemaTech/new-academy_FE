import { useTranslation } from 'react-i18next';
import { ClipboardList, Pencil, Sparkles, Trash2, Trophy } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/cn';
import type { TeacherQuiz, TeacherQuizType } from '../types';

const typeLabel = (t: (k: string, d: string) => string, type: TeacherQuizType) => {
  switch (type) {
    case 'TRACK_FINAL':
      return t('Teacher.quiz.typeFinal', 'Final exam');
    case 'COMPETITION':
      return t('Teacher.quiz.typeCompetition', 'Competition');
    default:
      return t('Teacher.quiz.typeLesson', 'Quiz');
  }
};

export function RoadmapQuizRow({
  quiz,
  index,
  onEdit,
  onDelete,
}: {
  quiz: TeacherQuiz;
  index: number;
  onEdit: (q: TeacherQuiz) => void;
  onDelete?: (q: TeacherQuiz) => void;
}) {
  const { t } = useTranslation();
  const qCount = quiz.questions?.length ?? 0;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all duration-300 hover:bg-white hover:shadow-md md:p-5"
    >
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex min-w-0 flex-1 gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white font-black text-base shadow-sm">
            {index + 1}
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-black leading-snug tracking-tight text-foreground md:text-[1.05rem]">
                {quiz.title}
              </h4>
              <Badge
                variant="secondary"
                className="gap-1.5 border-none bg-amber-100 text-amber-700 px-3 py-1 font-bold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {typeLabel(t, quiz.type)}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 border-none bg-indigo-100 text-indigo-700 px-3 py-1 font-bold">
                <ClipboardList className="h-3.5 w-3.5" />
                {t('Teacher.quiz.assessmentBadge', 'Assessment')}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
                <Trophy className="h-3.5 w-3.5 text-amber-600" />
                {t('Teacher.quiz.passingLine', 'Pass {{n}}%', { n: quiz.passingScore })}
              </span>
              <span>
                {t('Teacher.quiz.questionCount', '{{count}} questions', { count: qCount })}
              </span>
              {quiz.maxAttempts != null && (
                <span>{t('Teacher.quiz.maxAttemptsLine', 'Max {{n}} attempts', { n: quiz.maxAttempts })}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full shrink-0 gap-2 md:w-auto">
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(quiz)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-amber-500/25 md:flex-initial"
            type="button"
            onClick={() => onEdit(quiz)}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('Teacher.quiz.edit', 'Edit')}
          </Button>
        </div>
      </div>
    </div>
  );
}
