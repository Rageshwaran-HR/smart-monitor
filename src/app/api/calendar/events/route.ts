import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Type assertion for session with custom properties
    const sessionWithToken = session as typeof session & { accessToken?: string };
    
    if (!sessionWithToken || !sessionWithToken.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Set up OAuth2 client with the access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: sessionWithToken.accessToken,
    });

    // Create Calendar API instance
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get URL parameters for date range
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    // Format events for our frontend
    const formattedEvents = events.map((event) => ({
      id: event.id || '',
      title: event.summary || 'Untitled Event',
      start: new Date(event.start?.dateTime || event.start?.date || ''),
      end: new Date(event.end?.dateTime || event.end?.date || ''),
      description: event.description || '',
      location: event.location || '',
      isAllDay: !event.start?.dateTime, // If no dateTime, it's an all-day event
    }));

    return NextResponse.json({ 
      success: true, 
      events: formattedEvents,
      count: formattedEvents.length 
    });

  } catch (error) {
    console.error('Google Calendar API Error:', error);
    
    if (error instanceof Error && error.message.includes('invalid_grant')) {
      return NextResponse.json({ 
        error: 'Token expired. Please re-authenticate.',
        needsReauth: true 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch calendar events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
