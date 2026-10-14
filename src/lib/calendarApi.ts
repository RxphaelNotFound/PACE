import { getAccessToken } from './firebase';
import { CalendarEvent, CalendarActivityType } from '../types';

export interface GoogleCalendarEventItem {
  id: string;
  summary?: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  status?: string;
}

/**
 * Fetch events from Google Calendar
 */
export async function fetchGoogleCalendarEvents(
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEventItem[]> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No Google Calendar access token found. Please sign in with Google.');
  }

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  });

  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Google Calendar API Error (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  return (data.items || []).filter((item: GoogleCalendarEventItem) => item.status !== 'cancelled');
}

/**
 * Create an event in user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(event: {
  title: string;
  notes?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
}): Promise<string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No Google Calendar access token. Sign in with Google to enable calendar sync.');
  }

  let startPayload: any = {};
  let endPayload: any = {};

  if (event.allDay) {
    const dateOnly = event.startDate.slice(0, 10);
    startPayload = { date: dateOnly };
    endPayload = { date: event.endDate ? event.endDate.slice(0, 10) : dateOnly };
  } else {
    const startIso = new Date(event.startDate).toISOString();
    const endIso = event.endDate
      ? new Date(event.endDate).toISOString()
      : new Date(new Date(event.startDate).getTime() + 60 * 60 * 1000).toISOString();
    startPayload = { dateTime: startIso };
    endPayload = { dateTime: endIso };
  }

  const body = {
    summary: event.title,
    description: event.notes ? `[PACE 2.0] ${event.notes}` : '[PACE 2.0 Command Centre]',
    start: startPayload,
    end: endPayload,
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Google Calendar event: ${errText}`);
  }

  const created = await res.json();
  return created.id;
}

/**
 * Update an existing event in user's primary Google Calendar
 */
export async function updateGoogleCalendarEvent(
  googleEventId: string,
  event: {
    title: string;
    notes?: string;
    startDate: string;
    endDate?: string;
    allDay?: boolean;
  },
  userConfirmed: boolean
): Promise<void> {
  if (!userConfirmed) {
    throw new Error('Action aborted: User confirmation is mandatory before modifying calendar events.');
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error('No Google Calendar access token found.');
  }

  let startPayload: any = {};
  let endPayload: any = {};

  if (event.allDay) {
    const dateOnly = event.startDate.slice(0, 10);
    startPayload = { date: dateOnly };
    endPayload = { date: event.endDate ? event.endDate.slice(0, 10) : dateOnly };
  } else {
    const startIso = new Date(event.startDate).toISOString();
    const endIso = event.endDate
      ? new Date(event.endDate).toISOString()
      : new Date(new Date(event.startDate).getTime() + 60 * 60 * 1000).toISOString();
    startPayload = { dateTime: startIso };
    endPayload = { dateTime: endIso };
  }

  const body = {
    summary: event.title,
    description: event.notes ? `[PACE 2.0] ${event.notes}` : '[PACE 2.0 Command Centre]',
    start: startPayload,
    end: endPayload,
  };

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update Google Calendar event: ${errText}`);
  }
}

/**
 * Delete an event from Google Calendar with mandatory confirmation check
 */
export async function deleteGoogleCalendarEvent(
  googleEventId: string,
  eventTitle: string,
  userConfirmed: boolean
): Promise<void> {
  if (!userConfirmed) {
    throw new Error('Action aborted: User confirmation is mandatory before deleting calendar events.');
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error('No Google Calendar access token found.');
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok && res.status !== 404) {
    const errText = await res.text();
    throw new Error(`Failed to delete Google Calendar event "${eventTitle}": ${errText}`);
  }
}

/**
 * Normalizes title for deduplication comparison
 */
export function normalizeEventTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/^\[pace 2\.0\]\s*/i, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Check if a Google Calendar event matches an existing local PACE event
 * to prevent duplicates during initial or subsequent syncs
 */
export function isEventDuplicateOrMatch(
  gEvent: GoogleCalendarEventItem,
  localEvent: CalendarEvent
): boolean {
  // Direct Google event ID match
  if (localEvent.googleEventId && localEvent.googleEventId === gEvent.id) {
    return true;
  }

  // Title similarity match
  const gTitleNorm = normalizeEventTitle(gEvent.summary || '');
  const localTitleNorm = normalizeEventTitle(localEvent.title);

  if (!gTitleNorm || !localTitleNorm) return false;
  if (gTitleNorm !== localTitleNorm) return false;

  // Time comparison
  const gStart = gEvent.start.dateTime || gEvent.start.date;
  if (!gStart) return false;

  const gDateOnly = gStart.slice(0, 10);
  const localDateOnly = localEvent.startDate.slice(0, 10);

  // If same day
  if (gDateOnly === localDateOnly) {
    // If both have specific times, check if within 15 minutes of each other
    if (gEvent.start.dateTime && !localEvent.allDay) {
      const gTime = new Date(gEvent.start.dateTime).getTime();
      const localTime = new Date(localEvent.startDate).getTime();
      return Math.abs(gTime - localTime) <= 15 * 60 * 1000;
    }
    return true;
  }

  return false;
}
