/** Shared shapes for admin UI (replaces deleted mock seed types). */

export type ParentEnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  /** Present when listing from seed; omitted from API responses. */
  password?: string;
  role: 'parent' | 'student' | 'admin' | 'staff' | 'child';
  avatar: string;
  phone?: string;
  createdAt?: string;
  parentEnrollment?: { id: string; status: ParentEnrollmentStatus };
  staffCustomRoleId?: string;
  staffCustomRoleName?: string;
  isActive?: boolean;
}

export interface Child {
  id: string;
  name: string;
  username: string;
  password?: string;
  age: number | null;
  grade: string;
  parentId: string;
  enrolledPrograms: string[];
  avatar: string;
  isActive: boolean;
  createdAt: string;
  parent?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  sessionsPerWeek: number;
  level: 'BASIC' | 'ADVANCED' | 'PREMIUM';
  maxTracks: number;
  hasCertificate: boolean;
  hasPersonalCoach: boolean;
  hasPrivateSessions: boolean;
  hasWeeklyReport: boolean;
  supportType: string;
  isActive: boolean;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  durationMonths: number;
  sessionsPerWeek: number;
  price: number;
  thumbnail?: string;
  skills: string[];
  schedules?: { dayOfWeek: number; startTime: string }[];
  createdAt: string;
}
