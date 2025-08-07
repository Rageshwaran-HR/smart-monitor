'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-white/70 mb-6">
            {error === 'OAuthSignin' && 'Error occurred during OAuth sign in.'}
            {error === 'OAuthCallback' && 'Error occurred during OAuth callback.'}
            {error === 'OAuthCreateAccount' && 'Could not create OAuth account.'}
            {error === 'EmailCreateAccount' && 'Could not create email account.'}
            {error === 'Callback' && 'Error occurred during authentication callback.'}
            {error === 'OAuthAccountNotLinked' && 'OAuth account is not linked to any existing account.'}
            {error === 'EmailSignin' && 'Check your email for a sign in link.'}
            {error === 'CredentialsSignin' && 'Sign in failed. Check the details you provided are correct.'}
            {error === 'SessionRequired' && 'You must be signed in to access this page.'}
            {error === 'RefreshAccessTokenError' && 'Unable to refresh access token. Please sign in again.'}
            {!error && 'An unknown authentication error occurred.'}
          </p>
          <Link 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
