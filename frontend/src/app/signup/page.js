'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import CompassMark from '@/components/CompassMark';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      saveAuth(data);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--ink)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <CompassMark className="w-5 h-5" color="var(--brass)" />
          <span className="text-[var(--parchment)] tracking-[0.25em] text-xs uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            CourseCompass
          </span>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--parchment)] rounded-2xl shadow-2xl shadow-black/40 p-8">
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[var(--ink)] mb-1">
            Create your account
          </h1>
          <p className="text-sm text-[var(--slate)] mb-6">Save resources and track what works for you</p>

          {error && <p className="text-sm text-[var(--rust)] mb-4">{error}</p>}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--slate)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-[var(--ink)]/15 rounded-lg px-3 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--slate)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-[var(--ink)]/15 rounded-lg px-3 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[var(--slate)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-white border border-[var(--ink)]/15 rounded-lg px-3 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ fontFamily: 'var(--font-mono)' }}
              className="w-full bg-[var(--ink)] text-[var(--parchment)] rounded-lg py-3 text-sm font-medium tracking-wide hover:bg-[var(--ink-soft)] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <p className="text-xs text-[var(--slate)] mt-4 text-center">
            Already have an account?{' '}
            <button type="button" onClick={() => router.push('/login')} className="text-[var(--brass)] hover:underline">
              Sign in
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}