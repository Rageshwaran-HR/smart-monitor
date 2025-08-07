import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Type assertion for session with custom properties
  const sessionWithToken = session as typeof session & { accessToken?: string };
  
  if (!sessionWithToken || !sessionWithToken.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const calendarId = 'primary';
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 30); // fetch 30 days back
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 60); // fetch 60 days ahead

  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${sessionWithToken.accessToken}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({ events: data.items });
}
