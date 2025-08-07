# Google Calendar Integration Setup

This guide will help you integrate Google Calendar API with your SmartMonitor application.

## Prerequisites

1. Google Cloud Platform account
2. Google Calendar API enabled
3. OAuth 2.0 credentials

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API

### 2. Create OAuth 2.0 Credentials

1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen
4. Add authorized origins (your domain)
5. Download the client configuration

### 3. Environment Variables

Add these to your `.env.local` file:

```env
GOOGLE_CALENDAR_CLIENT_ID=your_client_id_here
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 4. Install Dependencies

```bash
npm install googleapis @google-cloud/local-auth
```

### 5. API Integration

The `GoogleCalendar` component is ready for integration. Update the following:

1. Replace sample events with actual Google Calendar API calls
2. Implement OAuth authentication flow
3. Add token management for API requests

## Features Included

- ✅ Modern, responsive calendar UI
- ✅ Month navigation
- ✅ Event display
- ✅ Date selection
- ✅ Collapsible widget
- ✅ Glass morphism design
- ⏳ Google Calendar API integration (ready for implementation)
- ⏳ Real-time event synchronization
- ⏳ Event creation/editing

## Next Steps

1. Set up Google Cloud credentials
2. Implement OAuth flow in `/api/auth/` routes
3. Replace sample data with real Google Calendar events
4. Add event creation/editing functionality
