import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Map } from 'lucide-react';
import {
  useDeleteTeacherQuizMutation,
  useTeacherLearningPathsQuery,
  useTeacherQuizzesQuery,
  useTeacherSessionsQuery,
  useTeacherTrackQuery,
} from '../../modules/teacher/hooks/useTeacherQueries';
import { buildRoadmapSections } from '../../modules/teacher/lib/roadmapGrouping';
import { LinearRoadmapBoard } from '../../modules/teacher/components/LinearRoadmapBoard';
import { LessonEditorDialog } from '../../modules/teacher/components/LessonEditorDialog';
import { TeacherQuizDialog } from '../../modules/teacher/components/TeacherQuizDialog';
import { LifecycleBadge } from '../../modules/teacher/components/LifecycleBadge';
import { TrackPriceSnapshot } from '../../modules/teacher/components/TrackPriceSnapshot';
import { StudentProgressList } from '../../modules/teacher/components/StudentProgressList';
import { StudentProgressDetailDialog } from '../../modules/teacher/components/StudentProgressDetailDialog';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import type { TeacherQuiz, TeacherSession } from '../../modules/teacher/types';

export default function TeacherTrackRoadmapPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const { t } = useTranslation();
  const id = trackId ?? '';

  const trackQ = useTeacherTrackQuery(id);
  const pathsQ = useTeacherLearningPathsQuery(id);
  const sessionsQ = useTeacherSessionsQuery(id);
  const quizzesQ = useTeacherQuizzesQuery(id);

  const deleteQuizM = useDeleteTeacherQuizMutation(id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TeacherSession | null>(null);
  const [createPathId, setCreatePathId] = useState<string | null>(null);

  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<TeacherQuiz | null>(null);
  const [quizPathId, setQuizPathId] = useState<string | null>(null);

  const [detailChildId, setDetailChildId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const sections = useMemo(() => {
    if (!pathsQ.data || !sessionsQ.data || !quizzesQ.data) return [];
    return buildRoadmapSections(pathsQ.data, sessionsQ.data, quizzesQ.data);
  }, [pathsQ.data, sessionsQ.data, quizzesQ.data]);

  const openCreate = (pathId: string | null) => {
    setEditingSession(null);
    setCreatePathId(pathId);
    setDialogOpen(true);
  };

  const openEdit = (s: TeacherSession) => {
    setEditingSession(s);
    setCreatePathId(null);
    setDialogOpen(true);
  };

  const openCreateQuiz = (pathId: string | null) => {
    setEditingQuiz(null);
    setQuizPathId(pathId);
    setQuizDialogOpen(true);
  };

  const openEditQuiz = (q: TeacherQuiz) => {
    setEditingQuiz(q);
    setQuizPathId(q.learningPathId);
    setQuizDialogOpen(true);
  };

  const onDeleteQuiz = (q: TeacherQuiz) => {
    if (!window.confirm(t('Teacher.quiz.confirmDelete', 'Delete this assessment? This cannot be undone.'))) return;
    void deleteQuizM.mutateAsync(q.id);
  };

  const openStudentDetail = (childId: string) => {
    setDetailChildId(childId);
    setDetailOpen(true);
  };

  const loading = trackQ.isLoading || pathsQ.isLoading || sessionsQ.isLoading || quizzesQ.isLoading;
  const notFound = !loading && (trackQ.isError || !trackQ.data);

  return (
    <div className="teacher-roadmap-root mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link to="/teacher/tracks">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('Teacher.roadmap.back', 'All tracks')}
          </Link>
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {notFound && (
        <p className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
          {t('Teacher.roadmap.notFound', 'This track is not available or you are not assigned to it.')}
        </p>
      )}

      {!loading && trackQ.data && (
        <>
          <header className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <LifecycleBadge lifecycle={trackQ.data.lifecycle} />
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Map className="h-5 w-5" />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">{trackQ.data.title}</h1>
            <TrackPriceSnapshot track={trackQ.data} />
            <p className="max-w-3xl text-base leading-relaxed text-slate-500 font-medium">{trackQ.data.description}</p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>{t('Teacher.roadmap.timezone', 'Default Timezone')}</span>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-slate-600">{trackQ.data.defaultTimezone}</span>
            </div>
          </header>

          <Tabs defaultValue="roadmap" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 gap-2 rounded-2xl bg-slate-100/50 p-1.5">
              <TabsTrigger
                value="roadmap"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm font-bold transition-all"
              >
                {t('Teacher.tabs.roadmap', 'Curriculum')}
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm font-bold transition-all"
              >
                {t('Teacher.tabs.students', 'Students')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="mt-8 space-y-2">
              <h2 className="sr-only">{t('Teacher.roadmap.title', 'Linear roadmap')}</h2>
              <LinearRoadmapBoard
                sections={sections}
                onAddLesson={openCreate}
                onAddAssessment={openCreateQuiz}
                onEditLesson={openEdit}
                onEditQuiz={openEditQuiz}
                onDeleteQuiz={onDeleteQuiz}
              />
            </TabsContent>

            <TabsContent value="students" className="mt-8">
              <StudentProgressList trackId={id} onViewDetail={openStudentDetail} />
            </TabsContent>
          </Tabs>

          <LessonEditorDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            trackId={id}
            learningPaths={pathsQ.data ?? []}
            session={editingSession}
            initialLearningPathId={editingSession ? editingSession.learningPathId : createPathId}
          />

          <TeacherQuizDialog
            open={quizDialogOpen}
            onOpenChange={setQuizDialogOpen}
            trackId={id}
            learningPaths={pathsQ.data ?? []}
            quiz={editingQuiz}
            initialLearningPathId={quizPathId}
          />

          <StudentProgressDetailDialog
            open={detailOpen}
            onOpenChange={(v) => {
              setDetailOpen(v);
              if (!v) setDetailChildId(null);
            }}
            trackId={id}
            childId={detailChildId}
          />
        </>
      )}
    </div>
  );
}
