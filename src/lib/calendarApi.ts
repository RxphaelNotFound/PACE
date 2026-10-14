import { getAccessToken } from './firebase';
import { CalendarEvent } from '../types';

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
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
    maxResults: '50',
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
  return data.items || [];
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
