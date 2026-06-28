import { api } from '../lib/axios';
import type { PatchStudySlotsBody, StudentCalendarResponse } from '../modules/student/types';

export async function fetchStudentDashboard() {
  const { data } = await api.get('/student/dashboard');
  return data.data;
}

export async function fetchStudentTracks() {
  const { data } = await api.get('/student/tracks');
  return data.data;
}

export async function fetchStudentTrack(trackId: string) {
  const { data } = await api.get(`/student/tracks/${trackId}`);
  return data.data;
}

export async function fetchStudentLesson(sessionId: string) {
  const { data } = await api.get(`/student/lessons/${sessionId}`);
  return data.data;
}

export async function postLessonComplete(sessionId: string) {
  const { data } = await api.post(`/student/lessons/${sessionId}/complete`);
  return data.data;
}

export async function fetchStudentCertificates() {
  const { data } = await api.get('/student/certificates');
  return data.data;
}

export async function fetchStudentQuiz(quizId: string) {
  const { data } = await api.get(`/student/quizzes/${quizId}`);
  return data.data;
}

export async function submitStudentQuiz(quizId: string, body: Record<string, unknown>) {
  const { data } = await api.post(`/student/quizzes/${quizId}/submit`, body);
  return data.data;
}

export async function fetchStudentCalendar(trackId?: string): Promise<StudentCalendarResponse> {
  const { data } = await api.get('/student/calendar', { params: trackId ? { trackId } : undefined });
  return data.data;
}

export async function patchStudentStudySlots(body: PatchStudySlotsBody): Promise<{ ok: true }> {
  const { data } = await api.patch('/student/calendar/slots', body);
  return data.data;
}
