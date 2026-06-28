import { api } from '../lib/axios';
import { isAxiosError } from 'axios';

export type PublicTrack = {
  id: string;
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  durationMonths: number;
  sessionsPerWeek: number;
  price: number;
  livePrice: number;
  recordedPrice: number;
  isLive: boolean;
  estimatedWeeks: number;
  recommendedLessonsPerWeek: number;
  thumbnail: string | null;
  tags: string[];
  programId: string | null;
  schedules?: Array<{ dayOfWeek: number; startTime: string }>;
};

export type PublicBundle = {
  id: string;
  title: string;
  description: string | null;
  discountedPrice: number;
  tracks: Array<{
    id: string;
    title: string;
    thumbnail: string | null;
    livePrice: number;
    recordedPrice: number;
    estimatedWeeks: number;
    recommendedLessonsPerWeek: number;
  }>;
};

export type PublicProject = {
  id: string;
  title: string;
  imageUrl: string | null;
  studentName: string;
  age: number | null;
};

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
};

export type PublicPackage = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMonths: number;
  sessionsPerWeek: number;
  level: string;
  maxTracks: number;
  highlighted: boolean;
  hasCertificate: boolean;
  hasPersonalCoach: boolean;
  hasPrivateSessions: boolean;
  hasWeeklyReport: boolean;
  hasDailyReport: boolean;
  hasCompetitions: boolean;
  supportType: string;
  features: string[];
};

export type PublicProgramListItem = {
  id: string;
  title: string;
  description: string;
  shortDescription: string | null;
  coverImage: string | null;
  trackCount: number;
  minAge: number;
  maxAge: number;
  priceFrom: number;
};

export type PublicLesson = {
  id: string;
  title: string;
  order: number;
  contentType: string;
  duration: number | null;
};

export type PublicProgramTrack = {
  id: string;
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  thumbnail: string | null;
  durationMonths: number;
  sessionsPerWeek: number;
  price: number;
  lessonCount: number;
  lessons: PublicLesson[];
  schedules?: Array<{ dayOfWeek: number; startTime: string }>;
  ageLabel: string;
};

export type PublicProgramDetail = {
  id: string;
  title: string;
  description: string;
  shortDescription: string | null;
  coverImage: string | null;
  totalTracks: number;
  totalLessons: number;
  minAge: number;
  maxAge: number;
  ageLabel: string;
  priceFrom: number;
  tracks: PublicProgramTrack[];
};

export type PublicPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
};

export type PublicArticleListItem = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  readTime: number | null;
  publishedAt: string | null;
  authorName: string;
  excerpt: string;
  category: string;
};

export type PublicArticleDetail = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string | null;
  readTime: number | null;
  publishedAt: string | null;
  authorName: string;
  category: string;
};

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function fetchPublicTracks(): Promise<PublicTrack[]> {
  const { data } = await api.get<ApiResponse<PublicTrack[]>>('/public/tracks');
  return data.data ?? [];
}

export async function fetchPublicBundles(): Promise<PublicBundle[]> {
  const { data } = await api.get<ApiResponse<PublicBundle[]>>('/public/bundles');
  return data.data ?? [];
}

export async function fetchPublicProjects(): Promise<PublicProject[]> {
  const { data } = await api.get<ApiResponse<PublicProject[]>>('/public/projects');
  return data.data ?? [];
}

export async function fetchPublicFaqs(): Promise<PublicFaq[]> {
  const { data } = await api.get<ApiResponse<PublicFaq[]>>('/public/faqs');
  return data.data ?? [];
}

export async function fetchPublicPackages(): Promise<PublicPackage[]> {
  const { data } = await api.get<ApiResponse<PublicPackage[]>>('/public/packages');
  return data.data ?? [];
}

export async function fetchPublicPrograms(): Promise<PublicProgramListItem[]> {
  const { data } = await api.get<ApiResponse<PublicProgramListItem[]>>('/public/programs');
  return data.data ?? [];
}

export async function fetchPublicProgramById(id: string): Promise<PublicProgramDetail> {
  const { data } = await api.get<ApiResponse<PublicProgramDetail>>(`/public/programs/${id}`);
  return data.data as PublicProgramDetail;
}

export async function fetchPublicPageBySlug(slug: string): Promise<PublicPage | null> {
  try {
    const { data } = await api.get<ApiResponse<PublicPage>>(`/public/pages/${slug}`);
    return data.data ?? null;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

export async function fetchPublicArticles(): Promise<PublicArticleListItem[]> {
  const { data } = await api.get<ApiResponse<PublicArticleListItem[]>>('/public/articles');
  return data.data ?? [];
}

export async function fetchPublicArticleBySlug(slug: string): Promise<PublicArticleDetail | null> {
  try {
    const { data } = await api.get<ApiResponse<PublicArticleDetail>>(`/public/articles/${slug}`);
    return data.data ?? null;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

export type PublicSettings = Record<string, string>;

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const { data } = await api.get<ApiResponse<PublicSettings>>('/public/settings');
  return data.data ?? {};
}
