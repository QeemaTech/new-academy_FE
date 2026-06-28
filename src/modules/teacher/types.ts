/**
 * Frontend models aligned with `/api/teacher/*` and Prisma hybrid curriculum.
 * @see backend/docs/TEACHER_API.md
 */

export type TrackLifecycle = 'LIVE_ENROLLMENT' | 'SELF_PACED' | 'CLOSED';

export type LessonType = 'RECORDED' | 'LIVE';

export type SessionContentType = 'VIDEO' | 'PDF' | 'TEXT' | 'MIXED';

/** Session row = one step on the linear roadmap (recorded or live hybrid lesson). */
export interface TeacherSession {
  id: string;
  trackId: string;
  learningPathId: string | null;
  title: string;
  description: string | null;
  contentType: SessionContentType;
  lessonType: LessonType;
  scheduledAt: string | null;
  liveMeetingUrl: string | null;
  recordingUrl: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  textContent: string | null;
  duration: number | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  learningPath?: {
    id: string;
    title: string;
    order: number;
  } | null;
}

export interface TeacherLearningPath {
  id: string;
  trackId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Track card in “My tracks” (list endpoint). */
export interface TeacherTrackSummary {
  id: string;
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  durationMonths: number;
  sessionsPerWeek: number;
  price: number;
  lifecycle: TrackLifecycle;
  priceLive: number;
  priceSelfPaced: number;
  defaultTimezone: string;
  thumbnail: string | null;
  isActive: boolean;
  programId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sessions: number;
    learningPaths: number;
  };
}

/** Single track + paths for roadmap header (`GET /teacher/tracks/:id`). */
export type TeacherTrackDetail = Omit<TeacherTrackSummary, '_count'> & {
  learningPaths: Pick<TeacherLearningPath, 'id' | 'title' | 'description' | 'order'>[];
  _count: { sessions: number };
};

export type TeacherQuizType = 'LESSON_QUIZ' | 'TRACK_FINAL' | 'COMPETITION';
export type TeacherQuestionType = 'MCQ' | 'TRUE_FALSE';

export interface TeacherQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TeacherQuizQuestion {
  id: string;
  text: string;
  type: TeacherQuestionType;
  points: number;
  order: number;
  options: TeacherQuizOption[];
}

/** Standalone track quiz shown on the linear roadmap (`sessionId` null). */
export interface TeacherQuiz {
  id: string;
  title: string;
  type: TeacherQuizType;
  trackId: string;
  learningPathId: string | null;
  sessionId: string | null;
  passingScore: number;
  timeLimit: number | null;
  maxAttempts: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  learningPath?: { id: string; title: string; order: number } | null;
  questions: TeacherQuizQuestion[];
}

export type RoadmapRow =
  | { kind: 'session'; session: TeacherSession }
  | { kind: 'quiz'; quiz: TeacherQuiz };

export interface RoadmapSection {
  path: Pick<TeacherLearningPath, 'id' | 'title' | 'order'> | null;
  /** Lessons and assessments merged by `order`. */
  items: RoadmapRow[];
}

export interface TeacherQuizOptionInput {
  text: string;
  isCorrect: boolean;
}

export interface TeacherQuizQuestionInput {
  text: string;
  type: TeacherQuestionType;
  points: number;
  order: number;
  options: TeacherQuizOptionInput[];
}

export interface CreateTeacherQuizPayload {
  title: string;
  type: TeacherQuizType;
  passingScore: number;
  timeLimit?: number | null;
  maxAttempts: number;
  learningPathId?: string | null;
  order?: number;
  questions: TeacherQuizQuestionInput[];
}

export type UpdateTeacherQuizPayload = CreateTeacherQuizPayload;

/** Payload for POST /teacher/tracks/:trackId/sessions */
export interface CreateTeacherSessionPayload {
  learningPathId?: string | null;
  title: string;
  description?: string | null;
  contentType: SessionContentType;
  lessonType: LessonType;
  scheduledAt?: string | null;
  liveMeetingUrl?: string | null;
  recordingUrl?: string | null;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  textContent?: string | null;
  duration?: number | null;
  order?: number;
  isActive?: boolean;
}

/** Payload for PATCH …/sessions/:sessionId */
export type UpdateTeacherSessionPayload = Partial<CreateTeacherSessionPayload>;

export type AccessLevel = 'FULL' | 'READ_ONLY' | 'LOCKED';

export interface TrackStudentChild {
  id: string;
  fullName: string;
  username: string;
  avatar: string | null;
  gradeLevel: string | null;
}

export interface TrackStudentRow {
  enrollmentId: string;
  enrolledAt: string;
  accessLevel: AccessLevel;
  child: TrackStudentChild;
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentComplete: number;
    lastActivityAt: string | null;
  };
  quizzes: {
    attemptCount: number;
    averageScore: number | null;
    /** Distinct track quizzes with at least one passing attempt. */
    passedQuizCount?: number;
    /** Total quizzes published on this track. */
    totalQuizzesOnTrack?: number;
    latest: {
      score: number;
      isPassed: boolean;
      completedAt: string;
    } | null;
  };
}

export interface TrackStudentsResponse {
  totalLessons: number;
  students: TrackStudentRow[];
}

export interface StudentLessonProgressItem {
  sessionId: string;
  title: string;
  order: number;
  lessonType: LessonType;
  learningPath: { id: string; title: string; order: number } | null;
  isCompleted: boolean;
  lastAccessedAt: string | null;
  completedAt: string | null;
  watchedDuration: number | null;
}

export interface StudentQuizAttemptRow {
  id: string;
  score: number;
  isPassed: boolean;
  completedAt: string;
  timeTaken: number | null;
  quiz: { id: string; title: string; type: string };
}

export interface TrackStudentDetailResponse {
  child: TrackStudentChild;
  enrollment: { enrolledAt: string; accessLevel: AccessLevel };
  summary: { totalLessons: number; completedCount: number; percentComplete: number };
  lessons: StudentLessonProgressItem[];
  recentQuizAttempts: StudentQuizAttemptRow[];
}

export interface TeacherAvailability {
  id: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTeacherAvailabilityPayload {
  availabilities: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}
