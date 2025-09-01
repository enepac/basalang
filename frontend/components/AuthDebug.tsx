'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setVisible(true);
    }
  }, []);

  if (!isLoaded || !visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-lg text-sm text-gray-800 p-4 rounded-md max-w-xs z-50">
      <strong>Auth Debug:</strong>
      <div className="mt-2 space-y-1">
        <p>Status: {isSignedIn ? 'Signed In' : 'Signed Out'}</p>
        {user && (
          <>
            <p>User ID: {user.id}</p>
            <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
            <p>Name: {user.fullName || 'N/A'}</p>
          </>
        )}
      </div>
    </div>
  );
}
