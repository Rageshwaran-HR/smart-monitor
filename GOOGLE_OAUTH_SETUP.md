# Google Calendar Integration Setup Guide

## Step-by-Step Google OAuth Configuration

### 1. Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Google Calendar API" and enable it

### 2. OAuth Consent Screen Configuration

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: SmartMonitor
   - User support email: your-email@example.com
   - Developer contact information: your-email@example.com
4. Add scopes:
   - https://www.googleapis.com/auth/calendar.readonly
   - openid
   - email
   - profile
5. Add test users (your email addresses)

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (for local development)
   - https://mycalender.loca.lt/api/auth/callback/google (for your tunnel)
5. Copy the Client ID and Client Secret

### 4. Update Environment Variables

Replace the placeholder values in your .env file:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://mycalender.loca.lt
NEXTAUTH_SECRET=wjNZr8rU9czr0w8SGpQNkHoEFB3nlCgOdMh165mLo+c=

# Google OAuth Configuration (Replace with your actual values)
GOOGLE_CLIENT_ID=your-actual-client-id-from-google-console
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google-console
```

### 5. Test the Setup

1. Start your development server: `npm run dev`
2. Visit your app and try to sign in with Google
3. Check the browser network tab for any errors

### Common Issues and Solutions:

#### Error: "Cannot GET /api/auth/callback/google"

- Ensure your redirect URI in Google Console matches exactly
- Make sure NextAuth is properly configured
- Verify environment variables are loaded correctly

#### Error: "redirect_uri_mismatch"

- Check that the redirect URI in Google Console matches your NEXTAUTH_URL
- Format should be: https://your-domain.com/api/auth/callback/google

#### Error: "unauthorized_client"

- Verify your OAuth consent screen is properly configured
- Ensure your app is not in testing mode or add test users
- Check that the Google Calendar API is enabled

### Testing Endpoints:

- Auth test: https://mycalender.loca.lt/api/auth/test
- NextAuth signin: https://mycalender.loca.lt/api/auth/signin
- Calendar events: https://mycalender.loca.lt/api/calendar/events

### Security Notes:

- Never commit actual credentials to version control
- Use environment variables for all sensitive data
- Consider using OAuth scopes principle of least privilege
