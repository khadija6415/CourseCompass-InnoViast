'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, clearAuth } from '@/lib/auth';

export default function StudentNav() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    clearAuth();
    setUser(null);
    router.push('/');
  }

  return (
    <div className="flex items-center gap-4 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
      {user ? (
        <>
          <button onClick={() => router.push('/bookmarks')} className="text-[var(--parchment)] hover:text-[var(--brass)] transition-colors">
            Bookmarks
          </button>
          <span className="text-[var(--slate)]">{user.name}</span>
          <button onClick={handleLogout} className="text-[var(--slate)] hover:text-[var(--rust)] transition-colors">
            Log out
          </button>
        </>
      ) : (
        <>
          <button onClick={() => router.push('/login')} className="text-[var(--parchment)] hover:text-[var(--brass)] transition-colors">
            Sign in
          </button>
          <button onClick={() => router.push('/signup')} className="text-[var(--brass)] hover:opacity-80 transition-opacity">
            Sign up
          </button>
        </>
      )}
    </div>
  );
}