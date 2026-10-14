import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Mission,
  TrainingRecord,
  StudySession,
  Subject,
  CalendarEvent,
  VisionPoster,
  UserProfile,
} from '../types';

export interface PaceAppData {
  profile: UserProfile;
  missions: Mission[];
  trainingRecords: TrainingRecord[];
  studySessions: StudySession[];
  subjects: Subject[];
  calendarEvents: CalendarEvent[];
  visionPosters: VisionPoster[];
}

const STORAGE_KEY_PREFIX = 'pace20_data_';
const QUEUE_KEY = 'pace20_sync_queue';

interface MutationQueueItem {
  id: string;
  type: 'set' | 'delete';
  collectionName: string;
  docId: string;
  userId: string;
  data?: any;
  timestamp: number;
}

// Initial mock data tailored for a student-athlete
export function getInitialDemoData(userId: string = 'guest'): PaceAppData {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10);
  const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10);
  const inTwoDays = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);
  const inFiveDays = new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10);

  const subjects: Subject[] = [
    {
      id: 'sub_math',
      userId,
      name: 'Advanced Calculus',
      code: 'MATH 201',
      color: '#3b82f6', // blue
      targetWeeklyHours: 6,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sub_phys',
      userId,
      name: 'Biomechanics & Physics',
      code: 'KINE 310',
      color: '#10b981', // green
      targetWeeklyHours: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sub_chem',
      userId,
      name: 'Organic Chemistry',
      code: 'CHEM 220',
      color: '#a855f7', // purple
      targetWeeklyHours: 7,
      createdAt: new Date().toISOString(),
    },
  ];

  const missions: Mission[] = [
    {
      id: 'm1',
      userId,
      title: 'Complete 6x150m Speed Endurance Spikes',
      description: 'Focus on 95% velocity with 3-minute full recoveries.',
      category: 'Training',
      priority: 'high',
      status: 'active',
      deadline: `${today}T17:30:00`,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm2',
      userId,
      title: 'Review Biomechanics Chapter 4 Notes',
      description: 'Torque in kinetic chain during acceleration phase.',
      category: 'Study',
      priority: 'medium',
      status: 'active',
      deadline: `${today}T21:00:00`,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm3',
      userId,
      title: 'Morning 20m Mobility & Foam Rolling',
      description: 'Ankle dorsiflexion and thoracic spine opening.',
      category: 'Wellbeing',
      priority: 'high',
      status: 'completed',
      deadline: `${today}T08:00:00`,
      recurrence: 'daily',
      completedAt: `${today}T07:45:00`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm4',
      userId,
      title: 'Hydration Target: 3.5 Litres with Electrolytes',
      description: 'Recovery benchmark for double training block.',
      category: 'Wellbeing',
      priority: 'medium',
      status: 'active',
      deadline: `${today}T22:00:00`,
      recurrence: 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm5',
      userId,
      title: 'Submit Calculus Problem Set 3',
      description: 'Integration by parts and multivariable limits.',
      category: 'Study',
      priority: 'high',
      status: 'active',
      deadline: `${inTwoDays}T23:59:00`,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const trainingRecords: TrainingRecord[] = [
    {
      id: 'tr1',
      userId,
      sport: 'Track & Field (Sprint)',
      title: '60m Block Starts & Acceleration',
      eventType: 'time_trial',
      date: today,
      durationMinutes: 75,
      metricName: '60m Electronic Time',
      metricValue: 6.84,
      metricUnit: 'seconds',
      isPersonalBest: true,
      notes: 'Clean drive phase, head remained neutral for first 25m.',
      intensity: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tr2',
      userId,
      sport: 'Strength & Conditioning',
      title: 'Lower Body Power & Trap Bar Deadlift',
      eventType: 'session',
      date: yesterday,
      durationMinutes: 60,
      metricName: 'Trap Bar DL 3RM',
      metricValue: 195,
      metricUnit: 'kg',
      isPersonalBest: true,
      notes: 'Explosive hip extension. Felt powerful throughout.',
      intensity: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tr3',
      userId,
      sport: 'Track & Field (Sprint)',
      title: '150m Flys & Plyometrics',
      eventType: 'session',
      date: threeDaysAgo,
      durationMinutes: 90,
      metricName: '150m Average Split',
      metricValue: 16.1,
      metricUnit: 'seconds',
      isPersonalBest: false,
      notes: 'Maintained front side mechanics across all 4 reps.',
      intensity: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const studySessions: StudySession[] = [
    {
      id: 'ss1',
      userId,
      subjectId: 'sub_math',
      subjectName: 'Advanced Calculus',
      topic: 'Double Integrals in Polar Coordinates',
      durationMinutes: 90,
      date: today,
      sessionType: 'assignment',
      notes: 'Solved questions 1-14 from Problem Set 3.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ss2',
      userId,
      subjectId: 'sub_phys',
      subjectName: 'Biomechanics & Physics',
      topic: 'Ground Reaction Force Profiles in Sprinting',
      durationMinutes: 60,
      date: yesterday,
      sessionType: 'revision',
      notes: 'Annotated force-velocity graphs.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ss3',
      userId,
      subjectId: 'sub_chem',
      subjectName: 'Organic Chemistry',
      topic: 'Electrophilic Aromatic Substitution',
      durationMinutes: 120,
      date: twoDaysAgo,
      sessionType: 'exam_prep',
      notes: 'Flashcards on directing groups.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ss4',
      userId,
      subjectId: 'sub_math',
      subjectName: 'Advanced Calculus',
      topic: 'Vector Fields & Conservative Systems',
      durationMinutes: 45,
      date: threeDaysAgo,
      sessionType: 'lecture',
      notes: 'Reviewed lecture recording.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const calendarEvents: CalendarEvent[] = [
    {
      id: 'cal1',
      userId,
      title: 'Advanced Calculus Midterm Exam',
      type: 'exam',
      startDate: `${inFiveDays}T09:00:00`,
      endDate: `${inFiveDays}T12:00:00`,
      allDay: false,
      notes: 'Hall B, Desk 42. Bring scientific calculator and student ID.',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cal2',
      userId,
      title: 'Regional Invitational Athletic Meet',
      type: 'training',
      startDate: `${inTwoDays}T14:00:00`,
      endDate: `${inTwoDays}T18:00:00`,
      allDay: false,
      notes: 'Events: 60m dash and 200m finals.',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cal3',
      userId,
      title: 'Biomechanics Lab Report Due',
      type: 'deadline',
      startDate: `${today}T23:59:00`,
      allDay: false,
      notes: 'Submit PDF to university portal.',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    },
  ];

  const visionPosters: VisionPoster[] = [
    {
      id: 'vp1',
      userId,
      title: 'Championship Drive',
      prompt: 'Cinematic sprinter in starting blocks under electric lime neon lights',
      aspectRatio: '16:9',
      imageUrl: '/src/assets/images/pace_hero_banner_1791994168324.jpg',
      modelUsed: 'gemini-nano-banana-2.1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'vp2',
      userId,
      title: 'Deep Focus Lab',
      prompt: 'Minimalist study desk with stopwatch and neon lime edge glow',
      aspectRatio: '4:3',
      imageUrl: '/src/assets/images/pace_study_focus_1791994169873.jpg',
      modelUsed: 'gemini-nano-banana-2.1',
      createdAt: new Date().toISOString(),
    },
  ];

  const profile: UserProfile = {
    userId,
    displayName: 'Alex Mercer',
    email: 'athlete.student@pace.io',
    goals: 'Sub-6.80s in 60m dash and 4.0 GPA in semester examinations',
    primaryFocus: 'Dual Athlete-Student',
    primarySport: 'Track & Field / Sprint',
    dailyGoalMissions: 4,
    dailyGoalStudyMinutes: 120,
    notificationsEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    profile,
    missions,
    trainingRecords,
    studySessions,
    subjects,
    calendarEvents,
    visionPosters,
  };
}

// Local storage helpers
export function loadLocalData(userId: string): PaceAppData {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading local data:', err);
  }
  const initial = getInitialDemoData(userId);
  saveLocalData(userId, initial);
  return initial;
}

export function saveLocalData(userId: string, data: PaceAppData) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving local data:', err);
  }
}

// Offline mutation queue
export function queueMutation(item: Omit<MutationQueueItem, 'id' | 'timestamp'>) {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const queue: MutationQueueItem[] = raw ? JSON.parse(raw) : [];
    queue.push({
      ...item,
      id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Error queueing mutation:', err);
  }
}

// Flush pending mutations to Firestore when online
export async function flushMutationQueue(): Promise<number> {
  if (!navigator.onLine) return 0;
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return 0;
    const queue: MutationQueueItem[] = JSON.parse(raw);
    if (!queue.length) return 0;

    let successful = 0;
    const remaining: MutationQueueItem[] = [];

    for (const item of queue) {
      try {
        const docRef = doc(db, 'users', item.userId, item.collectionName, item.docId);
        if (item.type === 'set' && item.data) {
          await setDoc(docRef, item.data, { merge: true });
        } else if (item.type === 'delete') {
          await deleteDoc(docRef);
        }
        successful++;
      } catch (err) {
        console.error('Failed to flush mutation item:', item, err);
        remaining.push(item);
      }
    }

    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    return successful;
  } catch (err) {
    console.error('Error flushing queue:', err);
    return 0;
  }
}

// Sync all collections from Firestore for an authenticated user
export async function syncFromFirestore(userId: string): Promise<PaceAppData | null> {
  if (!navigator.onLine || !userId || userId === 'guest') return null;

  try {
    // 1. Flush any pending outgoing mutations first
    await flushMutationQueue();

    // 2. Fetch all collections in parallel
    const [missionsSnap, trainingSnap, studySnap, subjectsSnap, calSnap, visionSnap] =
      await Promise.all([
        getDocs(collection(db, 'users', userId, 'missions')).catch((e) => {
          handleFirestoreError(e, OperationType.LIST, `users/${userId}/missions`);
        }),
        getDocs(collection(db, 'users', userId, 'trainingRecords')).catch((e) => {
          handleFirestoreError(e, OperationType.LIST, `users/${userId}/trainingRecords`);
        }),
        getDocs(collection(db, 'users', userId, 'studySessions')).catch((e) => {
          handleFirestoreError(e, OperationType.LIST, `users/${userId}/studySessions`);
        }),
        getDocs(collection(db, 'users', userId, 'subjects')).catch((e) => {
          handleFirestoreError(e, OperationType.LIST, `users/${userId}/subjects`);
        }),
        getDocs(collection(db, 'users', userId, 'calendarEvents')).catch((e) => {
          handleFirestoreError(e, OperationType.LIST, `users/${userId}/calendarEvents`);
        }),
        getDocs(collection(db, 'users', userId, 'visionPosters')).catch((e) => {
          handleFirestoreError(e, OperationType.LIST, `users/${userId}/visionPosters`);
        }),
      ]);

    const missions: Mission[] = [];
    missionsSnap?.forEach((d) => missions.push(d.data() as Mission));

    const trainingRecords: TrainingRecord[] = [];
    trainingSnap?.forEach((d) => trainingRecords.push(d.data() as TrainingRecord));

    const studySessions: StudySession[] = [];
    studySnap?.forEach((d) => studySessions.push(d.data() as StudySession));

    const subjects: Subject[] = [];
    subjectsSnap?.forEach((d) => subjects.push(d.data() as Subject));

    const calendarEvents: CalendarEvent[] = [];
    calSnap?.forEach((d) => calendarEvents.push(d.data() as CalendarEvent));

    const visionPosters: VisionPoster[] = [];
    visionSnap?.forEach((d) => visionPosters.push(d.data() as VisionPoster));

    // If cloud is empty (brand new cloud user), upload local data to bootstrap
    const local = loadLocalData(userId);
    if (
      missions.length === 0 &&
      trainingRecords.length === 0 &&
      studySessions.length === 0 &&
      subjects.length === 0
    ) {
      await bootstrapCloudData(userId, local);
      return local;
    }

    const mergedData: PaceAppData = {
      profile: local.profile,
      missions: missions.length ? missions : local.missions,
      trainingRecords: trainingRecords.length ? trainingRecords : local.trainingRecords,
      studySessions: studySessions.length ? studySessions : local.studySessions,
      subjects: subjects.length ? subjects : local.subjects,
      calendarEvents: calendarEvents.length ? calendarEvents : local.calendarEvents,
      visionPosters: visionPosters.length ? visionPosters : local.visionPosters,
    };

    saveLocalData(userId, mergedData);
    return mergedData;
  } catch (err) {
    console.warn('Sync from Firestore failed, operating on local data:', err);
    return null;
  }
}

// Push local data up to Firestore
export async function bootstrapCloudData(userId: string, data: PaceAppData) {
  try {
    for (const m of data.missions) {
      await setDoc(doc(db, 'users', userId, 'missions', m.id), m);
    }
    for (const t of data.trainingRecords) {
      await setDoc(doc(db, 'users', userId, 'trainingRecords', t.id), t);
    }
    for (const s of data.studySessions) {
      await setDoc(doc(db, 'users', userId, 'studySessions', s.id), s);
    }
    for (const sub of data.subjects) {
      await setDoc(doc(db, 'users', userId, 'subjects', sub.id), sub);
    }
    for (const c of data.calendarEvents) {
      await setDoc(doc(db, 'users', userId, 'calendarEvents', c.id), c);
    }
    for (const v of data.visionPosters) {
      await setDoc(doc(db, 'users', userId, 'visionPosters', v.id), v);
    }
  } catch (err) {
    console.error('Error bootstrapping cloud data:', err);
  }
}
