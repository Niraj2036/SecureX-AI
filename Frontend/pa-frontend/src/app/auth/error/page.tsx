// app/auth/error/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages = {
    AccessDenied: 'You do not have permission to sign in.',
    GoogleValidationFailed: 'Google authentication failed.',
    GoogleAuthError: 'Error during Google authentication.',
    ProviderNotAllowed: 'This login method is not allowed.',
    AuthFailed: 'Authentication failed.',
    default: 'An unknown error occurred during authentication.'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="text-lg mb-6">
        {errorMessages[error as keyof typeof errorMessages] || errorMessages.default}
      </p>
      <a 
        href="/auth/login" 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Return to Login
      </a>
    </div>
  );
}