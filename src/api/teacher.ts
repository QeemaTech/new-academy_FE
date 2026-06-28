import { api } from '../lib/axios';
import type {
  CreateTeacherQuizPayload,
  CreateTeacherSessionPayload,
  TeacherLearningPath,
  TeacherQuiz,
  TeacherSession,
  TeacherTrackDetail,
  TeacherTrackSummary,
  TrackStudentDetailResponse,
  TrackStudentsResponse,
  UpdateTeacherSessionPayload,
  TeacherAvailability,
  UpdateTeacherAvailabilityPayload,
} from '../modules/teacher/types';

export async function fetchTeacherTracks(): Promise<TeacherTrackSummary[]> {
  const { data } = await api.get<{ success: boolean; data: { tracks: TeacherTrackSummary[] } }>('/teacher/tracks');
  return data.data.tracks;
}

export async function fetchTeacherTrack(trackId: string): Promise<TeacherTrackDetail> {
  const { data } = await api.get<{ success: boolean; data: { track: TeacherTrackDetail } }>(
    `/teacher/tracks/${trackId}`
  );
  return data.data.track;
}

export async function fetchTeacherLearningPaths(trackId: string): Promise<TeacherLearningPath[]> {
  const { data } = await api.get<{ success: boolean; data: { learningPaths: TeacherLearningPath[] } }>(
    `/teacher/tracks/${trackId}/learning-paths`
  );
  return data.data.learningPaths;
}

export async function fetchTeacherSessions(trackId: string): Promise<TeacherSession[]> {
  const { data } = await api.get<{ success: boolean; data: { sessions: TeacherSession[] } }>(
    `/teacher/tracks/${trackId}/sessions`
  );
  return data.data.sessions;
}

export async function fetchTeacherQuizzes(trackId: string): Promise<TeacherQuiz[]> {
  const { data } = await api.get<{ success: boolean; data: { quizzes: TeacherQuiz[] } }>(
    `/teacher/tracks/${trackId}/quizzes`
  );
  return data.data.quizzes;
}

export async function createTeacherQuiz(trackId: string, body: CreateTeacherQuizPayload): Promise<TeacherQuiz> {
  const { data } = await api.post<{ success: boolean; data: { quiz: TeacherQuiz } }>(
    `/teacher/tracks/${trackId}/quizzes`,
    body
  );
  return data.data.quiz;
}

export async function updateTeacherQuiz(
  trackId: string,
  quizId: string,
  body: CreateTeacherQuizPayload
): Promise<TeacherQuiz> {
  const { data } = await api.patch<{ success: boolean; data: { quiz: TeacherQuiz } }>(
    `/teacher/tracks/${trackId}/quizzes/${quizId}`,
    body
  );
  return data.data.quiz;
}

export async function deleteTeacherQuiz(trackId: string, quizId: string): Promise<void> {
  await api.delete(`/teacher/tracks/${trackId}/quizzes/${quizId}`);
}

export async function createTeacherSession(
  trackId: string,
  body: CreateTeacherSessionPayload
): Promise<TeacherSession> {
  const { data } = await api.post<{ success: boolean; data: { session: TeacherSession } }>(
    `/teacher/tracks/${trackId}/sessions`,
    body
  );
  return data.data.session;
}

export async function updateTeacherSession(
  trackId: string,
  sessionId: string,
  body: UpdateTeacherSessionPayload
): Promise<TeacherSession> {
  const { data } = await api.patch<{ success: boolean; data: { session: TeacherSession } }>(
    `/teacher/tracks/${trackId}/sessions/${sessionId}`,
    body
  );
  return data.data.session;
}

export async function fetchTrackStudents(trackId: string, search?: string): Promise<TrackStudentsResponse> {
  const { data } = await api.get<{
    success: boolean;
    data: TrackStudentsResponse;
  }>(`/teacher/tracks/${trackId}/students`, {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return data.data;
}

export async function fetchTrackStudentDetail(
  trackId: string,
  childId: string
): Promise<TrackStudentDetailResponse> {
  const { data } = await api.get<{
    success: boolean;
    data: TrackStudentDetailResponse;
  }>(`/teacher/tracks/${trackId}/students/${childId}`);
  return data.data;
}

export async function fetchTeacherPerformance(params: { range?: string; startDate?: string; endDate?: string }): Promise<any> {
  const { data } = await api.get<{ success: boolean; data: { performance: any } }>(
    '/teacher/performance',
    { params }
  );
  return data.data.performance;
}

export async function fetchTeacherAvailability(): Promise<TeacherAvailability[]> {
  const { data } = await api.get<{ success: boolean; data: { availabilities: TeacherAvailability[] } }>(
    '/teacher/availability'
  );
  return data.data.availabilities;
}

export async function updateTeacherAvailability(body: UpdateTeacherAvailabilityPayload): Promise<TeacherAvailability[]> {
  const { data } = await api.put<{ success: boolean; data: { availabilities: TeacherAvailability[] } }>(
    '/teacher/availability',
    body
  );
  return data.data.availabilities;
}
