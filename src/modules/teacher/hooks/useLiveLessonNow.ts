import { useEffect, useState } from 'react';
import type { TeacherSession } from '../types';

/** Ticks once per second while mounted — use with LIVE sessions for countdowns and phase updates. */
export function useLiveLessonNow(session: TeacherSession): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (session.lessonType !== 'LIVE' || !session.scheduledAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [session.lessonType, session.scheduledAt, session.duration]);

  return now;
}
