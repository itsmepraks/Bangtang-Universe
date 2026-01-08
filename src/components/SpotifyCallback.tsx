/**
 * Spotify OAuth Callback Handler Component
 * Handles the redirect from Spotify after user authorization
 */

import { useEffect, useState } from 'react';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

export const SpotifyCallback = () => {
  const { handleCallback } = useSpotifyAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        // Handle error from Spotify
        if (error) {
          const errorDescription = params.get('error_description') || 'Authorization failed';
          console.error('Spotify authorization error:', error, errorDescription);
          setStatus('error');
          setErrorMessage(errorDescription);
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            window.location.href = '/?error=' + encodeURIComponent(error);
          }, 3000);
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          console.error('Missing code or state parameter');
          setStatus('error');
          setErrorMessage('Invalid callback parameters');
          
          setTimeout(() => {
            window.location.href = '/?error=invalid_callback';
          }, 3000);
          return;
        }

        // Exchange code for tokens
        setStatus('processing');
        const success = await handleCallback(code, state);

        if (success) {
          setStatus('success');
          // Redirect to main app
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage('Authentication failed. Please try again.');
          setTimeout(() => {
            window.location.href = '/?error=auth_failed';
          }, 3000);
        }
      } catch (error) {
        console.error('Error processing callback:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        
        setTimeout(() => {
          window.location.href = '/?error=callback_error';
        }, 3000);
      }
    };

    processCallback();
  }, [handleCallback]);

  return (
    <div className="fixed inset-0 bg-[#020005] flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md px-8">
        {/* Animated Logo/Spinner */}
        <div className="relative w-32 h-32 mx-auto">
          {status === 'processing' && (
            <>
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin" />
              <div className="absolute inset-4 border-4 border-purple-400/20 rounded-full" />
              <div className="absolute inset-4 border-4 border-b-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
            </>
          )}
          
          {status === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Status Messages */}
        <div className="space-y-4">
          {status === 'processing' && (
            <>
              <h1 className="text-2xl font-light text-white tracking-wider">
                Connecting to Spotify
              </h1>
              <p className="text-purple-300/60 text-sm tracking-wide">
                Please wait while we complete the authorization...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <h1 className="text-2xl font-light text-white tracking-wider">
                Successfully Connected!
              </h1>
              <p className="text-green-300/60 text-sm tracking-wide">
                Redirecting you back to the app...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <h1 className="text-2xl font-light text-white tracking-wider">
                Connection Failed
              </h1>
              <p className="text-red-300/60 text-sm tracking-wide">
                {errorMessage}
              </p>
              <p className="text-purple-300/40 text-xs tracking-wide">
                Redirecting you back to try again...
              </p>
            </>
          )}
        </div>

        {/* Progress Dots */}
        {status === 'processing' && (
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyCallback;
