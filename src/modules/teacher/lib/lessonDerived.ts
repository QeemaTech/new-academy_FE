import type { LessonType, TeacherSession } from '../types';

/**
 * LIVE lesson phases for teacher UX (countdown, glow, join CTA, replay state).
 * - `upcoming`: before the pre-start window
 * - `starting_soon`: within N minutes before go-live
 * - `active`: between scheduled start and end (duration or default window)
 * - `past`: after the live window ended
 */
export type LiveLessonPhase = 'upcoming' | 'starting_soon' | 'active' | 'past' | 'n_a';

/** Minutes before start that trigger "starting soon" emphasis (Zoom-style). */
const STARTING_SOON_BEFORE_MIN = 10;
const STARTING_SOON_BEFORE_MS = STARTING_SOON_BEFORE_MIN * 60 * 1000;

/** Default live block length (minutes) when `duration` is not set on the session. */
const DEFAULT_LIVE_BLOCK_MIN = 90;

function liveBlockEndMs(scheduledAtMs: number, durationMinutes: number | null | undefined): number {
  const mins =
    durationMinutes != null && durationMinutes > 0 ? durationMinutes : DEFAULT_LIVE_BLOCK_MIN;
  return scheduledAtMs + mins * 60 * 1000;
}

/**
 * For LIVE lessons, classify relative to `scheduledAt` (UTC instant) for badges, countdown, and CTAs.
 */
export function deriveLiveLessonPhase(
  lessonType: LessonType,
  scheduledAtIso: string | null | undefined,
  nowMs: number = Date.now(),
  durationMinutes: number | null | undefined = undefined
): LiveLessonPhase {
  if (lessonType !== 'LIVE' || !scheduledAtIso) return 'n_a';
  const t = new Date(scheduledAtIso).getTime();
  if (Number.isNaN(t)) return 'n_a';
  const endActive = liveBlockEndMs(t, durationMinutes);

  if (nowMs < t - STARTING_SOON_BEFORE_MS) return 'upcoming';
  if (nowMs < t) return 'starting_soon';
  if (nowMs < endActive) return 'active';
  return 'past';
}

/** Milliseconds until scheduled start (negative if already started). */
export function msUntilStart(scheduledAtIso: string | undefined | null, nowMs: number): number | null {
  if (!scheduledAtIso) return null;
  const t = new Date(scheduledAtIso).getTime();
  if (Number.isNaN(t)) return null;
  return t - nowMs;
}

/** Milliseconds until the modeled end of the live block. */
export function msUntilLiveEnd(
  scheduledAtIso: string | null | undefined,
  durationMinutes: number | null | undefined,
  nowMs: number
): number | null {
  if (!scheduledAtIso) return null;
  const t = new Date(scheduledAtIso).getTime();
  if (Number.isNaN(t)) return null;
  const end = liveBlockEndMs(t, durationMinutes);
  return end - nowMs;
}

export function formatHms(totalMs: number): string {
  const ms = Math.max(0, totalMs);
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Order within a single roadmap section (same learning path / unscoped). */
export function compareSessionsLinear(a: TeacherSession, b: TeacherSession): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.title.localeCompare(b.title);
}
