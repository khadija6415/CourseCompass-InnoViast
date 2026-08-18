'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyQuizAttempts } from '@/lib/api';
import { getUser } from '@/lib/auth';
import StudentNav from '@/components/StudentNav';

export default function QuizHistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getUser()) {
      router.push('/login');
      return;
    }
    getMyQuizAttempts()
      .then(setAttempts)
      .catch(() => setError('Could not load quiz history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[var(--ink)] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/')} className="text-sm text-[var(--slate)] hover:text-[var(--brass)] transition-colors">
            ← Back
          </button>
          <StudentNav />
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[var(--parchment)] mb-1">
          Quiz History
        </h1>
        <p className="text-sm text-[var(--slate)] mb-6">Every comprehension quiz you&apos;ve attempted, with your marks</p>

        {loading && <p className="text-sm text-[var(--slate)]">Loading...</p>}
        {error && <p className="text-sm text-[var(--rust)]">{error}</p>}

        {!loading && attempts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
            <p className="text-sm text-[var(--slate)]">No quiz attempts yet. Complete a resource and test yourself!</p>
          </div>
        )}

        <div className="space-y-3">
          {attempts.map((a) => {
            const percentage = Math.round((a.score / a.totalQuestions) * 100);
            const color = percentage >= 70 ? 'var(--verdigris)' : percentage >= 40 ? 'var(--brass)' : 'var(--rust)';
            return (
              <button
                key={a._id}
                onClick={() => a.resource && router.push(`/resources/${a.resource._id}`)}
                className="w-full text-left bg-[var(--parchment)] rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-lg hover:shadow-black/20 transition-all"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--ink)] mb-1">{a.resource?.title || 'Resource removed'}</p>
                  <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.1em] text-[var(--slate)]">
                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', color }} className="text-sm font-semibold shrink-0">
                  {a.score}/{a.totalQuestions} · {percentage}%
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}