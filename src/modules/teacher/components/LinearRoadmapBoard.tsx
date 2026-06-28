import { useTranslation } from 'react-i18next';
import { GitBranch, ListTree } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { RoadmapSection, TeacherSession, TeacherQuiz } from '../types';
import { RoadmapSessionRow } from './RoadmapSessionRow';
import { RoadmapQuizRow } from './RoadmapQuizRow';
import { cn } from '../../../lib/cn';

export function LinearRoadmapBoard({
  sections,
  onAddLesson,
  onAddAssessment,
  onEditLesson,
  onEditQuiz,
  onDeleteQuiz,
}: {
  sections: RoadmapSection[];
  onAddLesson: (pathId: string | null) => void;
  onAddAssessment: (pathId: string | null) => void;
  onEditLesson: (s: TeacherSession) => void;
  onEditQuiz: (q: TeacherQuiz) => void;
  onDeleteQuiz?: (q: TeacherQuiz) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-10 md:space-y-14">
      {sections.map((section, si) => (
        <section
          key={section.path?.id ?? `unscoped-${si}`}
          className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-10"
        >
          <div className="mb-8 flex flex-col gap-6 border-b border-slate-100 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {section.path ? (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <ListTree className="h-7 w-7" />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <GitBranch className="h-7 w-7" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">
                  {section.path
                    ? section.path.title
                    : t('Teacher.roadmap.trackLevel', 'Track-level Content')}
                </h3>
                {section.path && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-600/70">
                      {t('Teacher.roadmap.unit', 'Unit')} #{section.path.order}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl border-slate-200 font-bold hover:bg-slate-50"
                onClick={() => onAddAssessment(section.path?.id ?? null)}
              >
                {t('Teacher.quiz.addAssessment', 'Add Assessment')}
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="rounded-xl font-bold shadow-lg shadow-teal-600/10"
                onClick={() => onAddLesson(section.path?.id ?? null)}
              >
                {t('Teacher.roadmap.addLesson', 'Add Lesson')}
              </Button>
            </div>
          </div>

          <div className="relative ms-2 border-s-2 border-slate-100 pb-1 ps-8 sm:ps-12">
            {section.items.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground">
                {t('Teacher.roadmap.emptySection', 'No lessons in this segment yet.')}
              </p>
            ) : (
              <ul className="space-y-5">
                {section.items.map((row, idx) => (
                  <li key={row.kind === 'session' ? row.session.id : row.quiz.id} className="relative">
                    <span
                      className={cn(
                        'absolute -start-[29px] top-7 h-3.5 w-3.5 rounded-full border-2 shadow-[0_0_0_5px_rgba(16,185,129,0.12)] sm:-start-[33px]',
                        row.kind === 'session'
                          ? 'border-emerald-300 bg-gradient-to-br from-emerald-400 to-emerald-700 dark:border-emerald-700 dark:from-emerald-300 dark:to-emerald-600'
                          : 'border-amber-300 bg-gradient-to-br from-amber-400 to-amber-700 shadow-[0_0_0_5px_rgba(245,158,11,0.15)] dark:border-amber-700 dark:from-amber-300 dark:to-amber-600'
                      )}
                    />
                    {row.kind === 'session' ? (
                      <RoadmapSessionRow session={row.session} index={idx} onEdit={onEditLesson} />
                    ) : (
                      <RoadmapQuizRow
                        quiz={row.quiz}
                        index={idx}
                        onEdit={onEditQuiz}
                        onDelete={onDeleteQuiz}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
