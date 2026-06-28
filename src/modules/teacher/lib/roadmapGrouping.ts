import type { TeacherLearningPath, TeacherSession, TeacherQuiz, RoadmapSection, RoadmapRow } from '../types';
import { compareSessionsLinear } from './lessonDerived';

function compareQuizzesLinear(a: TeacherQuiz, b: TeacherQuiz): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.title.localeCompare(b.title);
}

function mergeSessionsAndQuizzes(
  sessions: TeacherSession[],
  quizzes: TeacherQuiz[]
): RoadmapRow[] {
  const sortS = (list: TeacherSession[]) => [...list].sort(compareSessionsLinear);
  const sortQ = (list: TeacherQuiz[]) => [...list].sort(compareQuizzesLinear);
  const rows: RoadmapRow[] = [
    ...sortS(sessions).map((session) => ({ kind: 'session' as const, session })),
    ...sortQ(quizzes).map((quiz) => ({ kind: 'quiz' as const, quiz })),
  ];
  rows.sort((a, b) => {
    const oa = a.kind === 'session' ? a.session.order : a.quiz.order;
    const ob = b.kind === 'session' ? b.session.order : b.quiz.order;
    if (oa !== ob) return oa - ob;
    if (a.kind !== b.kind) return a.kind === 'session' ? -1 : 1;
    return 0;
  });
  return rows;
}

/**
 * Builds ordered sections: unscoped items first, then each learning path (even if empty)
 * so teachers see the full spine. Lessons and assessments share one `order` sequence.
 */
export function buildRoadmapSections(
  paths: TeacherLearningPath[],
  sessions: TeacherSession[],
  quizzes: TeacherQuiz[]
): RoadmapSection[] {
  const byLpSessions = new Map<string | null, TeacherSession[]>();
  const byLpQuizzes = new Map<string | null, TeacherQuiz[]>();

  for (const s of sessions) {
    const key = s.learningPathId ?? null;
    if (!byLpSessions.has(key)) byLpSessions.set(key, []);
    byLpSessions.get(key)!.push(s);
  }
  for (const q of quizzes) {
    const key = q.learningPathId ?? null;
    if (!byLpQuizzes.has(key)) byLpQuizzes.set(key, []);
    byLpQuizzes.get(key)!.push(q);
  }

  const sections: RoadmapSection[] = [];
  sections.push({
    path: null,
    items: mergeSessionsAndQuizzes(byLpSessions.get(null) ?? [], byLpQuizzes.get(null) ?? []),
  });

  const orderedPaths = [...paths].sort((a, b) => a.order - b.order);
  for (const p of orderedPaths) {
    sections.push({
      path: { id: p.id, title: p.title, order: p.order },
      items: mergeSessionsAndQuizzes(
        byLpSessions.get(p.id) ?? [],
        byLpQuizzes.get(p.id) ?? []
      ),
    });
  }
  return sections;
}
