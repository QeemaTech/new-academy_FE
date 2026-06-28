export type StudentCalendarItemType = 'SESSION' | 'QUIZ';
export type StudentCalendarEventKind = 'LIVE' | 'RECORDED' | 'QUIZ';

export interface StudentCalendarEvent {
  id: string;
  itemType: StudentCalendarItemType;
  itemId: string;
  trackId: string;
  kind: StudentCalendarEventKind;
  title: string;
  startAt: string;
  endAt: string;
  locked: boolean;
}

export interface StudentCalendarUnscheduledItem {
  itemType: StudentCalendarItemType;
  itemId: string;
  trackId: string;
  kind: 'RECORDED' | 'QUIZ';
  title: string;
  suggestedDurationMin: number;
  order: number;
  passingScore?: number;
  quizType?: string;
}

export interface StudentCalendarResponse {
  events: StudentCalendarEvent[];
  unscheduled: StudentCalendarUnscheduledItem[];
  weeklyTargets?: Record<
    string,
    { estimatedWeeks: number; recommendedLessonsPerWeek: number; weekIndex: number }
  >;
}

export interface PatchStudySlotsBody {
  slots: Array<{
    itemType: StudentCalendarItemType;
    itemId: string;
    trackId: string;
    startAt: string | null;
    endAt: string | null;
  }>;
}

