export type MissionCategory = 'Personal' | 'Study' | 'Training' | 'Wellbeing';
export type MissionPriority = 'low' | 'medium' | 'high';
export type MissionStatus = 'active' | 'completed' | 'archived';
export type MissionRecurrence = 'none' | 'daily' | 'weekly';

export interface Mission {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: MissionCategory;
  priority: MissionPriority;
  status: MissionStatus;
  deadline?: string | null; // ISO string
  recurrence: MissionRecurrence;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EventType = 'session' | 'event' | 'competition' | 'time_trial';

export interface TrainingRecord {
  id: string;
  userId: string;
  sport: string;
  title: string;
  eventType: EventType;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  metricName?: string; // e.g. "5km Time", "Bench Press", "400m Split"
  metricValue?: number; // e.g. 19.45, 120, 49.2
  metricUnit?: string; // e.g. "mins", "kg", "seconds", "km", "watts"
  isPersonalBest?: boolean;
  notes?: string;
  intensity?: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

export type StudySessionType = 'revision' | 'assignment' | 'lecture' | 'exam_prep';

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string;
  subjectName: string;
  topic?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  sessionType: StudySessionType;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code?: string;
  color: string;
  targetWeeklyHours: number;
  createdAt: string;
}

export type CalendarActivityType = 'exam' | 'deadline' | 'training' | 'study' | 'personal';
export type CalendarEventStatus = 'scheduled' | 'completed' | 'cancelled';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  type: CalendarActivityType;
  startDate: string; // ISO string
  endDate?: string; // ISO string
  allDay?: boolean;
  notes?: string;
  googleEventId?: string;
  status: CalendarEventStatus;
  createdAt: string;
}


export interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  goals?: string;
  primaryFocus: 'Athletics' | 'Academics' | 'Dual Athlete-Student' | 'General';
  primarySport?: string;
  dailyGoalMissions: number;
  dailyGoalStudyMinutes: number;
  dailyGoalTrainingMinutes?: number;
  notificationsEnabled: boolean;
  googleCalendarSyncEnabled?: boolean;
  googleCalendarLastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'exam' | 'streak' | 'system' | 'google_calendar';
  date: string;
  read: boolean;
  linkTab?: string;
}

export interface ConsistencyDay {
  date: string; // YYYY-MM-DD
  level: number; // 0, 1, 2, 3
  missionsCount: number;
  studyMinutes: number;
  trainingMinutes: number;
  eventsCount: number;
}
