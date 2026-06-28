import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createTeacherQuiz,
  createTeacherSession,
  deleteTeacherQuiz,
  fetchTeacherLearningPaths,
  fetchTeacherQuizzes,
  fetchTeacherSessions,
  fetchTeacherTrack,
  fetchTeacherTracks,
  fetchTeacherPerformance,
  fetchTrackStudentDetail,
  fetchTrackStudents,
  updateTeacherQuiz,
  updateTeacherSession,
  fetchTeacherAvailability,
  updateTeacherAvailability,
} from '../../../api/teacher';
import type {
  CreateTeacherQuizPayload,
  CreateTeacherSessionPayload,
  UpdateTeacherSessionPayload,
} from '../types';

export const teacherKeys = {
  all: ['teacher'] as const,
  tracks: () => [...teacherKeys.all, 'tracks'] as const,
  performance: (params: any) => [...teacherKeys.all, 'performance', params] as const,
  track: (id: string) => [...teacherKeys.all, 'track', id] as const,
  paths: (id: string) => [...teacherKeys.all, 'paths', id] as const,
  sessions: (id: string) => [...teacherKeys.all, 'sessions', id] as const,
  quizzes: (id: string) => [...teacherKeys.all, 'quizzes', id] as const,
  trackStudents: (id: string, search: string) => [...teacherKeys.all, 'students', id, search] as const,
  trackStudentDetail: (trackId: string, childId: string) =>
    [...teacherKeys.all, 'studentDetail', trackId, childId] as const,
};

export function useTeacherTracksQuery() {
  return useQuery({
    queryKey: teacherKeys.tracks(),
    queryFn: fetchTeacherTracks,
  });
}

export function useTeacherPerformanceQuery(params: { range?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: teacherKeys.performance(params),
    queryFn: () => fetchTeacherPerformance(params),
  });
}

export function useTeacherTrackQuery(trackId: string | undefined) {
  return useQuery({
    queryKey: teacherKeys.track(trackId ?? ''),
    queryFn: () => fetchTeacherTrack(trackId!),
    enabled: Boolean(trackId),
  });
}

export function useTeacherLearningPathsQuery(trackId: string | undefined) {
  return useQuery({
    queryKey: teacherKeys.paths(trackId ?? ''),
    queryFn: () => fetchTeacherLearningPaths(trackId!),
    enabled: Boolean(trackId),
  });
}

export function useTeacherSessionsQuery(trackId: string | undefined) {
  return useQuery({
    queryKey: teacherKeys.sessions(trackId ?? ''),
    queryFn: () => fetchTeacherSessions(trackId!),
    enabled: Boolean(trackId),
  });
}

export function useTeacherQuizzesQuery(trackId: string | undefined) {
  return useQuery({
    queryKey: teacherKeys.quizzes(trackId ?? ''),
    queryFn: () => fetchTeacherQuizzes(trackId!),
    enabled: Boolean(trackId),
  });
}

/** Enrolled students + progress / quiz aggregates for a track (server-side search). */
export function useTrackStudents(trackId: string | undefined, search: string) {
  const q = search.trim();
  return useQuery({
    queryKey: teacherKeys.trackStudents(trackId ?? '', q),
    queryFn: () => fetchTrackStudents(trackId!, q || undefined),
    enabled: Boolean(trackId),
    staleTime: 30_000,
  });
}

export function useTrackStudentDetail(trackId: string | undefined, childId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: teacherKeys.trackStudentDetail(trackId ?? '', childId ?? ''),
    queryFn: () => fetchTrackStudentDetail(trackId!, childId!),
    enabled: Boolean(trackId && childId && enabled),
  });
}

export function useCreateTeacherSessionMutation(trackId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTeacherSessionPayload) => createTeacherSession(trackId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: teacherKeys.track(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.sessions(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.quizzes(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.tracks() });
      toast.success('Lesson created');
    },
    onError: () => toast.error('Could not create lesson'),
  });
}

export function useUpdateTeacherSessionMutation(trackId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, body }: { sessionId: string; body: UpdateTeacherSessionPayload }) =>
      updateTeacherSession(trackId, sessionId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: teacherKeys.track(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.sessions(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.quizzes(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.tracks() });
      toast.success('Lesson updated');
    },
    onError: () => toast.error('Could not update lesson'),
  });
}

export function useCreateTeacherQuizMutation(trackId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTeacherQuizPayload) => createTeacherQuiz(trackId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: teacherKeys.track(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.quizzes(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.tracks() });
      void qc.invalidateQueries({ queryKey: ['teacher', 'students', trackId] });
      toast.success('Assessment saved');
    },
    onError: () => toast.error('Could not save assessment'),
  });
}

export function useUpdateTeacherQuizMutation(trackId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, body }: { quizId: string; body: CreateTeacherQuizPayload }) =>
      updateTeacherQuiz(trackId, quizId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: teacherKeys.track(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.quizzes(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.tracks() });
      void qc.invalidateQueries({ queryKey: ['teacher', 'students', trackId] });
      toast.success('Assessment updated');
    },
    onError: () => toast.error('Could not update assessment'),
  });
}

export function useDeleteTeacherQuizMutation(trackId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => deleteTeacherQuiz(trackId, quizId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: teacherKeys.track(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.quizzes(trackId) });
      void qc.invalidateQueries({ queryKey: teacherKeys.tracks() });
      void qc.invalidateQueries({ queryKey: ['teacher', 'students', trackId] });
      toast.success('Assessment removed');
    },
    onError: () => toast.error('Could not delete assessment'),
  });
}

export function useTeacherAvailabilityQuery() {
  return useQuery({
    queryKey: [...teacherKeys.all, 'availability'] as const,
    queryFn: fetchTeacherAvailability,
  });
}

export function useUpdateTeacherAvailabilityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTeacherAvailability,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...teacherKeys.all, 'availability'] });
      toast.success('Availability updated');
    },
    onError: () => toast.error('Could not update availability'),
  });
}
