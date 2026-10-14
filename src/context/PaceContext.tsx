import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Mission,
  TrainingRecord,
  StudySession,
  Subject,
  CalendarEvent,
  VisionPoster,
  NotificationItem,
  ConsistencyDay,
  MissionCategory,
} from '../types';
import { useAuth } from './AuthContext';
import {
  loadLocalData,
  saveLocalData,
  queueMutation,
  syncFromFirestore,
  getInitialDemoData,
  PaceAppData,
} from '../lib/storage';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fetchGoogleCalendarEvents, createGoogleCalendarEvent, deleteGoogleCalendarEvent } from '../lib/calendarApi';

export type SyncState = 'online' | 'offline' | 'syncing' | 'synced' | 'error';

interface PaceContextType {
  // Collections
  missions: Mission[];
  trainingRecords: TrainingRecord[];
  studySessions: StudySession[];
  subjects: Subject[];
  calendarEvents: CalendarEvent[];
  visionPosters: VisionPoster[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;

  // Sync state
  syncState: SyncState;
  lastSyncedAt: Date | null;
  triggerManualSync: () => Promise<void>;

  // Mission actions
  addMission: (data: Omit<Mission, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateMission: (id: string, updates: Partial<Mission>) => Promise<void>;
  toggleMissionComplete: (id: string) => Promise<void>;
  archiveMission: (id: string) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;

  // Training actions
  addTrainingRecord: (data: Omit<TrainingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteTrainingRecord: (id: string) => Promise<void>;

  // Study actions
  addStudySession: (data: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteStudySession: (id: string) => Promise<void>;
  addSubject: (data: Omit<Subject, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Calendar actions
  addCalendarEvent: (data: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>, syncToGoogle?: boolean) => Promise<void>;
  deleteCalendarEvent: (id: string, userConfirmed: boolean) => Promise<void>;
  syncGoogleCalendar: () => Promise<{ imported: number; exported: number }>;

  // Vision actions
  addVisionPoster: (poster: Omit<VisionPoster, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteVisionPoster: (id: string) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  requestBrowserNotifications: () => Promise<boolean>;

  // Computed metrics
  todayCompletedMissions: number;
  todayTotalMissions: number;
  todayMissionPercentage: number;
  todayStudyMinutes: number;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
  heatMapData: ConsistencyDay[];
  upcomingDeadlinesAndExams: CalendarEvent[];
  recentPBs: TrainingRecord[];

  // Data import/export
  exportAppDataJson: () => string;
  importAppDataJson: (jsonString: string) => Promise<boolean>;
  resetToDefaultData: () => void;
}

const PaceContext = createContext<PaceContextType | undefined>(undefined);

export const PaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser ? currentUser.uid : 'guest';

  const [data, setData] = useState<PaceAppData>(() => loadLocalData(userId));
  const [syncState, setSyncState] = useState<SyncState>(navigator.onLine ? 'online' : 'offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Keep local data in sync when switching user
  useEffect(() => {
    const loaded = loadLocalData(userId);
    setData(loaded);
  }, [userId]);

  // Save changes to localStorage whenever data changes
  const persistData = useCallback(
    (newData: PaceAppData) => {
      setData(newData);
      saveLocalData(userId, newData);
    },
    [userId]
  );

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ccff00', '#10b981', '#3b82f6', '#ffffff'],
      });
    } catch {
      // Fallback
    }
  };

  // Perform Cloud sync
  const triggerManualSync = useCallback(async () => {
    if (!navigator.onLine || userId === 'guest') {
      setSyncState(navigator.onLine ? 'online' : 'offline');
      return;
    }
    setSyncState('syncing');
    try {
      const cloudData = await syncFromFirestore(userId);
      if (cloudData) {
        setData(cloudData);
        setLastSyncedAt(new Date());
        setSyncState('synced');
        setTimeout(() => setSyncState('online'), 2500);
      } else {
        setSyncState('online');
      }
    } catch (err) {
      console.warn('Sync error:', err);
      setSyncState('error');
    }
  }, [userId]);

  // Initial cloud sync on login or online event
  useEffect(() => {
    if (currentUser && navigator.onLine) {
      triggerManualSync();
    }

    const handleOnline = () => {
      setSyncState('online');
      if (currentUser) triggerManualSync();
    };
    const handleOffline = () => setSyncState('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser, triggerManualSync]);

  // Recurring mission daily regenerator: ensure daily habits exist for today
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const recurringMissions = data.missions.filter((m) => m.recurrence === 'daily');

    let updated = false;
    const currentMissions = [...data.missions];

    for (const rec of recurringMissions) {
      // Check if mission was completed on a previous day and needs reopening for today
      if (rec.status === 'completed' && rec.completedAt && !rec.completedAt.startsWith(todayStr)) {
        const idx = currentMissions.findIndex((m) => m.id === rec.id);
        if (idx !== -1) {
          currentMissions[idx] = {
            ...currentMissions[idx],
            status: 'active',
            completedAt: null,
            deadline: `${todayStr}T23:59:00`,
            updatedAt: new Date().toISOString(),
          };
          updated = true;
        }
      }
    }

    if (updated) {
      persistData({ ...data, missions: currentMissions });
    }
  }, [data, persistData]);

  // Check upcoming notifications
  useEffect(() => {
    const generated: NotificationItem[] = [];
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Active missions due in 24 hours
    data.missions
      .filter((m) => m.status === 'active' && m.deadline)
      .forEach((m) => {
        const due = new Date(m.deadline!);
        if (due > now && due <= in24h) {
          generated.push({
            id: `notif_m_${m.id}`,
            title: 'Mission Deadline Impending',
            message: `"${m.title}" is due in less than 24 hours.`,
            type: 'deadline',
            date: m.deadline!,
            read: false,
            linkTab: 'missions',
          });
        }
      });

    // Exams due in 48 hours
    data.calendarEvents
      .filter((c) => c.type === 'exam' && c.status === 'scheduled')
      .forEach((c) => {
        const examDate = new Date(c.startDate);
        if (examDate > now && examDate <= in48h) {
          generated.push({
            id: `notif_exam_${c.id}`,
            title: 'Upcoming Examination Alert',
            message: `"${c.title}" is scheduled for ${examDate.toLocaleDateString()}. Stay prepared.`,
            type: 'exam',
            date: c.startDate,
            read: false,
            linkTab: 'calendar',
          });
        }
      });

    setNotifications(generated);
  }, [data.missions, data.calendarEvents]);

  // Mission Actions
  const addMission = async (
    newM: Omit<Mission, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    const id = `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const nowIso = new Date().toISOString();
    const mission: Mission = {
      ...newM,
      id,
      userId,
      status: 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const nextMissions = [mission, ...data.missions];
    persistData({ ...data, missions: nextMissions });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        setDoc(doc(db, 'users', userId, 'missions', id), mission).catch((err) => {
          console.warn('Queueing mission offline:', err);
          queueMutation({ type: 'set', collectionName: 'missions', docId: id, userId, data: mission });
        });
      } else {
        queueMutation({ type: 'set', collectionName: 'missions', docId: id, userId, data: mission });
      }
    }
  };

  const updateMission = async (id: string, updates: Partial<Mission>) => {
    const nextMissions = data.missions.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    persistData({ ...data, missions: nextMissions });

    const target = nextMissions.find((m) => m.id === id);
    if (userId !== 'guest' && target) {
      if (navigator.onLine) {
        setDoc(doc(db, 'users', userId, 'missions', id), target, { merge: true }).catch((err) => {
          queueMutation({ type: 'set', collectionName: 'missions', docId: id, userId, data: target });
        });
      } else {
        queueMutation({ type: 'set', collectionName: 'missions', docId: id, userId, data: target });
      }
    }
  };

  const toggleMissionComplete = async (id: string) => {
    const target = data.missions.find((m) => m.id === id);
    if (!target) return;

    const isCompleting = target.status !== 'completed';
    const nowIso = new Date().toISOString();

    const nextMissions = data.missions.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          status: isCompleting ? ('completed' as const) : ('active' as const),
          completedAt: isCompleting ? nowIso : null,
          updatedAt: nowIso,
        };
      }
      return m;
    });

    persistData({ ...data, missions: nextMissions });

    if (isCompleting) {
      triggerConfetti();
    }

    const updated = nextMissions.find((m) => m.id === id);
    if (userId !== 'guest' && updated) {
      if (navigator.onLine) {
        setDoc(doc(db, 'users', userId, 'missions', id), updated, { merge: true }).catch(() => {
          queueMutation({ type: 'set', collectionName: 'missions', docId: id, userId, data: updated });
        });
      } else {
        queueMutation({ type: 'set', collectionName: 'missions', docId: id, userId, data: updated });
      }
    }
  };

  const archiveMission = async (id: string) => {
    await updateMission(id, { status: 'archived' });
  };

  const deleteMission = async (id: string) => {
    const nextMissions = data.missions.filter((m) => m.id !== id);
    persistData({ ...data, missions: nextMissions });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        deleteDoc(doc(db, 'users', userId, 'missions', id)).catch(() => {
          queueMutation({ type: 'delete', collectionName: 'missions', docId: id, userId });
        });
      } else {
        queueMutation({ type: 'delete', collectionName: 'missions', docId: id, userId });
      }
    }
  };

  // Training Actions
  const addTrainingRecord = async (
    recordData: Omit<TrainingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const id = `tr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const nowIso = new Date().toISOString();

    // Check if this is a genuine personal best (PB)
    let isPB = recordData.isPersonalBest || false;
    if (recordData.metricValue && recordData.metricName) {
      const comparable = data.trainingRecords.filter(
        (r) =>
          r.sport.toLowerCase() === recordData.sport.toLowerCase() &&
          r.metricName?.toLowerCase() === recordData.metricName?.toLowerCase() &&
          r.metricValue !== undefined
      );

      if (comparable.length > 0) {
        // For speed/time trial, lower is better. For weights/distance/reps, higher is better.
        const isTimeTrial =
          recordData.eventType === 'time_trial' ||
          recordData.metricUnit?.toLowerCase().includes('sec') ||
          recordData.metricUnit?.toLowerCase().includes('min');

        const prevBest = isTimeTrial
          ? Math.min(...comparable.map((c) => c.metricValue!))
          : Math.max(...comparable.map((c) => c.metricValue!));

        if (isTimeTrial ? recordData.metricValue < prevBest : recordData.metricValue > prevBest) {
          isPB = true;
          triggerConfetti();
        }
      } else {
        // First record in this metric is automatically baseline PB
        isPB = true;
      }
    }

    const newRecord: TrainingRecord = {
      ...recordData,
      id,
      userId,
      isPersonalBest: isPB,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const nextRecords = [newRecord, ...data.trainingRecords];
    persistData({ ...data, trainingRecords: nextRecords });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        setDoc(doc(db, 'users', userId, 'trainingRecords', id), newRecord).catch(() => {
          queueMutation({ type: 'set', collectionName: 'trainingRecords', docId: id, userId, data: newRecord });
        });
      } else {
        queueMutation({ type: 'set', collectionName: 'trainingRecords', docId: id, userId, data: newRecord });
      }
    }
  };

  const deleteTrainingRecord = async (id: string) => {
    const next = data.trainingRecords.filter((t) => t.id !== id);
    persistData({ ...data, trainingRecords: next });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        deleteDoc(doc(db, 'users', userId, 'trainingRecords', id)).catch(() => {
          queueMutation({ type: 'delete', collectionName: 'trainingRecords', docId: id, userId });
        });
      } else {
        queueMutation({ type: 'delete', collectionName: 'trainingRecords', docId: id, userId });
      }
    }
  };

  // Study Actions
  const addStudySession = async (
    sessionData: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const id = `ss_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const nowIso = new Date().toISOString();
    const session: StudySession = {
      ...sessionData,
      id,
      userId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const next = [session, ...data.studySessions];
    persistData({ ...data, studySessions: next });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        setDoc(doc(db, 'users', userId, 'studySessions', id), session).catch(() => {
          queueMutation({ type: 'set', collectionName: 'studySessions', docId: id, userId, data: session });
        });
      } else {
        queueMutation({ type: 'set', collectionName: 'studySessions', docId: id, userId, data: session });
      }
    }
  };

  const deleteStudySession = async (id: string) => {
    const next = data.studySessions.filter((s) => s.id !== id);
    persistData({ ...data, studySessions: next });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        deleteDoc(doc(db, 'users', userId, 'studySessions', id)).catch(() => {
          queueMutation({ type: 'delete', collectionName: 'studySessions', docId: id, userId });
        });
      } else {
        queueMutation({ type: 'delete', collectionName: 'studySessions', docId: id, userId });
      }
    }
  };

  const addSubject = async (sub: Omit<Subject, 'id' | 'userId' | 'createdAt'>) => {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newSub: Subject = {
      ...sub,
      id,
      userId,
      createdAt: new Date().toISOString(),
    };

    const next = [...data.subjects, newSub];
    persistData({ ...data, subjects: next });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        setDoc(doc(db, 'users', userId, 'subjects', id), newSub).catch(() => {
          queueMutation({ type: 'set', collectionName: 'subjects', docId: id, userId, data: newSub });
        });
      } else {
        queueMutation({ type: 'set', collectionName: 'subjects', docId: id, userId, data: newSub });
      }
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    const next = data.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
    persistData({ ...data, subjects: next });

    const target = next.find((s) => s.id === id);
    if (userId !== 'guest' && target) {
      if (navigator.onLine) {
        setDoc(doc(db, 'users', userId, 'subjects', id), target, { merge: true }).catch(() => {
          queueMutation({ type: 'set', collectionName: 'subjects', docId: id, userId, data: target });
        });
      }
    }
  };

  const deleteSubject = async (id: string) => {
    const next = data.subjects.filter((s) => s.id !== id);
    persistData({ ...data, subjects: next });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        deleteDoc(doc(db, 'users', userId, 'subjects', id)).catch(() => {
          queueMutation({ type: 'delete', collectionName: 'subjects', docId: id, userId });
        });
      } else {
        queueMutation({ type: 'delete', collectionName: 'subjects', docId: id, userId });
      }
    }
  };

  // Calendar Actions
  const addCalendarEvent = async (
    eventData: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>,
    syncToGoogle: boolean = false
  ) => {
    const id = `cal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    let googleEventId: string | undefined = undefined;

    if (syncToGoogle) {
      try {
        googleEventId = await createGoogleCalendarEvent({
          title: eventData.title,
          notes: eventData.notes,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          allDay: eventData.allDay,
        });
      } catch (err) {
        console.warn('Google Calendar export failed:', err);
      }
    }

    const newEvent: CalendarEvent = {
      ...eventData,
      id,
      userId,
      googleEventId,
      createdAt: new Date().toISOString(),
    };

    const next = [newEvent, ...data.calendarEvents];
    persistData({ ...data, calendarEvents: next });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        setDoc(doc(db, 'users', userId, 'calendarEvents', id), newEvent).catch(() => {
          queueMutation({ type: 'set', collectionName: 'calendarEvents', docId: id, userId, data: newEvent });
        });
      } else {
        queueMutation({ type: 'set', collectionName: 'calendarEvents', docId: id, userId, data: newEvent });
      }
    }
  };

  const deleteCalendarEvent = async (id: string, userConfirmed: boolean) => {
    if (!userConfirmed) {
      throw new Error('User confirmation is required to delete calendar events.');
    }
    const target = data.calendarEvents.find((e) => e.id === id);
    if (!target) return;

    if (target.googleEventId) {
      try {
        await deleteGoogleCalendarEvent(target.googleEventId, target.title, userConfirmed);
      } catch (err) {
        console.warn('Could not delete from Google Calendar:', err);
      }
    }

    const next = data.calendarEvents.filter((e) => e.id !== id);
    persistData({ ...data, calendarEvents: next });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        deleteDoc(doc(db, 'users', userId, 'calendarEvents', id)).catch(() => {
          queueMutation({ type: 'delete', collectionName: 'calendarEvents', docId: id, userId });
        });
      } else {
        queueMutation({ type: 'delete', collectionName: 'calendarEvents', docId: id, userId });
      }
    }
  };

  const syncGoogleCalendar = async (): Promise<{ imported: number; exported: number }> => {
    const googleEvents = await fetchGoogleCalendarEvents();
    let imported = 0;
    let exported = 0;

    const existingGoogleIds = new Set(
      data.calendarEvents.map((e) => e.googleEventId).filter(Boolean)
    );

    const newImported: CalendarEvent[] = [];

    for (const gEvent of googleEvents) {
      if (!existingGoogleIds.has(gEvent.id)) {
        const start = gEvent.start.dateTime || gEvent.start.date || new Date().toISOString();
        const end = gEvent.end.dateTime || gEvent.end.date;

        let type: CalendarEvent['type'] = 'personal';
        const lowerTitle = (gEvent.summary || '').toLowerCase();
        if (lowerTitle.includes('exam') || lowerTitle.includes('test') || lowerTitle.includes('quiz')) {
          type = 'exam';
        } else if (lowerTitle.includes('due') || lowerTitle.includes('deadline') || lowerTitle.includes('assignment')) {
          type = 'deadline';
        } else if (lowerTitle.includes('train') || lowerTitle.includes('workout') || lowerTitle.includes('meet') || lowerTitle.includes('run')) {
          type = 'training';
        } else if (lowerTitle.includes('study') || lowerTitle.includes('lecture') || lowerTitle.includes('class')) {
          type = 'study';
        }

        newImported.push({
          id: `cal_g_${gEvent.id}`,
          userId,
          title: gEvent.summary || 'Google Calendar Event',
          notes: gEvent.description,
          type,
          startDate: start,
          endDate: end,
          allDay: !gEvent.start.dateTime,
          googleEventId: gEvent.id,
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        });
        imported++;
      }
    }

    if (newImported.length > 0) {
      persistData({ ...data, calendarEvents: [...newImported, ...data.calendarEvents] });
    }

    return { imported, exported };
  };

  // Vision Actions
  const addVisionPoster = async (poster: Omit<VisionPoster, 'id' | 'userId' | 'createdAt'>) => {
    const id = `vp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newPoster: VisionPoster = {
      ...poster,
      id,
      userId,
      createdAt: new Date().toISOString(),
    };

    const next = [newPoster, ...data.visionPosters];
    persistData({ ...data, visionPosters: next });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        setDoc(doc(db, 'users', userId, 'visionPosters', id), newPoster).catch(() => {
          queueMutation({ type: 'set', collectionName: 'visionPosters', docId: id, userId, data: newPoster });
        });
      } else {
        queueMutation({ type: 'set', collectionName: 'visionPosters', docId: id, userId, data: newPoster });
      }
    }
  };

  const deleteVisionPoster = async (id: string) => {
    const next = data.visionPosters.filter((v) => v.id !== id);
    persistData({ ...data, visionPosters: next });

    if (userId !== 'guest') {
      if (navigator.onLine) {
        deleteDoc(doc(db, 'users', userId, 'visionPosters', id)).catch(() => {
          queueMutation({ type: 'delete', collectionName: 'visionPosters', docId: id, userId });
        });
      } else {
        queueMutation({ type: 'delete', collectionName: 'visionPosters', docId: id, userId });
      }
    }
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const requestBrowserNotifications = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
    return false;
  };

  // Computed Metrics
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const { todayCompletedMissions, todayTotalMissions, todayMissionPercentage } = useMemo(() => {
    const todays = data.missions.filter((m) => {
      if (m.status === 'completed' && m.completedAt?.startsWith(todayStr)) return true;
      if (m.deadline?.startsWith(todayStr)) return true;
      if (m.recurrence === 'daily') return true;
      return false;
    });

    const completed = todays.filter((m) => m.status === 'completed').length;
    const total = Math.max(todays.length, 1);
    const pct = Math.round((completed / total) * 100);

    return {
      todayCompletedMissions: completed,
      todayTotalMissions: todays.length,
      todayMissionPercentage: pct,
    };
  }, [data.missions, todayStr]);

  const todayStudyMinutes = useMemo(() => {
    return data.studySessions
      .filter((s) => s.date === todayStr)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [data.studySessions, todayStr]);

  // Streak calculation (actual activity check per day)
  const { currentStreak, longestStreak } = useMemo(() => {
    const activityDays = new Set<string>();

    data.missions
      .filter((m) => m.status === 'completed' && m.completedAt)
      .forEach((m) => activityDays.add(m.completedAt!.slice(0, 10)));

    data.trainingRecords.forEach((t) => activityDays.add(t.date));
    data.studySessions.forEach((s) => activityDays.add(s.date));

    let current = 0;
    let longest = 0;
    let tempStreak = 0;

    // Check today or yesterday
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const yesterday = new Date(today.getTime() - 86400000);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    // Scan backwards from today/yesterday for current streak
    let cursor = activityDays.has(todayKey) ? today : activityDays.has(yesterdayKey) ? yesterday : null;

    if (cursor) {
      let checkDate = new Date(cursor.getTime());
      while (true) {
        const key = checkDate.toISOString().slice(0, 10);
        if (activityDays.has(key)) {
          current++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    }

    // Longest streak calculation over sorted days
    const sortedDays = Array.from(activityDays).sort();
    if (sortedDays.length > 0) {
      tempStreak = 1;
      longest = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1]).getTime();
        const curr = new Date(sortedDays[i]).getTime();
        const diffDays = Math.round((curr - prev) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > longest) longest = tempStreak;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
    }

    return { currentStreak: current, longestStreak: longest };
  }, [data.missions, data.trainingRecords, data.studySessions]);

  // Heat Map Data (Past 112 days = 16 weeks)
  const heatMapData = useMemo(() => {
    const days: ConsistencyDay[] = [];
    const now = new Date();

    for (let i = 111; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);

      const mCount = data.missions.filter(
        (m) => m.status === 'completed' && m.completedAt?.startsWith(dateStr)
      ).length;
      const sMins = data.studySessions
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      const tMins = data.trainingRecords
        .filter((t) => t.date === dateStr)
        .reduce((sum, t) => sum + t.durationMinutes, 0);
      const eCount = data.calendarEvents.filter(
        (e) => e.startDate.startsWith(dateStr) && e.status === 'completed'
      ).length;

      // Intensity score (0 to 3)
      let score = mCount * 1 + Math.floor(sMins / 45) * 1 + Math.floor(tMins / 30) * 2 + eCount * 1;
      let level = 0;
      if (score >= 4) level = 3;
      else if (score >= 2) level = 2;
      else if (score >= 1) level = 1;

      days.push({
        date: dateStr,
        level,
        missionsCount: mCount,
        studyMinutes: sMins,
        trainingMinutes: tMins,
        eventsCount: eCount,
      });
    }

    return days;
  }, [data.missions, data.studySessions, data.trainingRecords, data.calendarEvents]);

  // 30-day Consistency Score (0-100%)
  const consistencyScore = useMemo(() => {
    const last30 = heatMapData.slice(-30);
    const activeDays = last30.filter((d) => d.level > 0).length;
    return Math.round((activeDays / 30) * 100);
  }, [heatMapData]);

  // Upcoming deadlines and exams (next 14 days)
  const upcomingDeadlinesAndExams = useMemo(() => {
    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 86400000);

    return data.calendarEvents
      .filter((e) => {
        const d = new Date(e.startDate);
        return d >= now && d <= in14Days && (e.type === 'exam' || e.type === 'deadline');
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [data.calendarEvents]);

  // Recent PBs
  const recentPBs = useMemo(() => {
    return data.trainingRecords.filter((t) => t.isPersonalBest).slice(0, 5);
  }, [data.trainingRecords]);

  // Export / Import
  const exportAppDataJson = (): string => {
    return JSON.stringify(data, null, 2);
  };

  const importAppDataJson = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.missions && parsed.trainingRecords && parsed.studySessions) {
        persistData(parsed);
        if (userId !== 'guest') {
          await triggerManualSync();
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToDefaultData = () => {
    const initial = getInitialDemoData(userId);
    persistData(initial);
  };

  return (
    <PaceContext.Provider
      value={{
        missions: data.missions,
        trainingRecords: data.trainingRecords,
        studySessions: data.studySessions,
        subjects: data.subjects,
        calendarEvents: data.calendarEvents,
        visionPosters: data.visionPosters,
        notifications,
        unreadNotificationsCount: notifications.filter((n) => !n.read).length,
        syncState,
        lastSyncedAt,
        triggerManualSync,
        addMission,
        updateMission,
        toggleMissionComplete,
        archiveMission,
        deleteMission,
        addTrainingRecord,
        deleteTrainingRecord,
        addStudySession,
        deleteStudySession,
        addSubject,
        updateSubject,
        deleteSubject,
        addCalendarEvent,
        deleteCalendarEvent,
        syncGoogleCalendar,
        addVisionPoster,
        deleteVisionPoster,
        markNotificationRead,
        clearAllNotifications,
        requestBrowserNotifications,
        todayCompletedMissions,
        todayTotalMissions,
        todayMissionPercentage,
        todayStudyMinutes,
        currentStreak,
        longestStreak,
        consistencyScore,
        heatMapData,
        upcomingDeadlinesAndExams,
        recentPBs,
        exportAppDataJson,
        importAppDataJson,
        resetToDefaultData,
      }}
    >
      {children}
    </PaceContext.Provider>
  );
};

export const usePace = () => {
  const ctx = useContext(PaceContext);
  if (!ctx) throw new Error('usePace must be used within PaceProvider');
  return ctx;
};
