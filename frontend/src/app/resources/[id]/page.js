'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResourceById, getMyBookmarks, getMyAttemptsForResource } from '@/lib/api';
import { getUser } from '@/lib/auth';
import MatchGauge from '@/components/MatchGauge';
import StudentNav from '@/components/StudentNav';
import ProgressStatusControl from '@/components/ProgressStatusControl';
import ReviewsSection from '@/components/ReviewsSection';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressStatus, setProgressStatus] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        setLoading(true);
        const data = await getResourceById(id);
        setResource(data);

        const user = getUser();
        if (user) {
          const [bookmarks, attempts] = await Promise.all([
            getMyBookmarks(),
            getMyAttemptsForResource(id),
          ]);
          const mine = bookmarks.find((b) => b.resource && b.resource._id === id);
          setProgressStatus(mine ? mine.status : null);
          setQuizAttempts(attempts);
        }
      } catch (err) {
        setError('Could not load this resource.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleRequireLogin() {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return true;
    }
    return false;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
        <p className="text-sm text-[var(--slate)]">Loading resource...</p>
      </main>
    );
  }

  if (error || !resource) {
    return (
      <main className="min-h-screen bg-[var(--ink)] flex items-center justify-center px-4">
        <p className="text-sm text-[var(--rust)]">{error || 'Resource not found.'}</p>
      </main>
    );
  }

  const bestAttempt = quizAttempts.length > 0
    ? quizAttempts.reduce((best, a) => (a.score / a.totalQuestions > best.score / best.totalQuestions ? a : best), quizAttempts[0])
    : null;

  return (
    <main className="min-h-screen bg-[var(--ink)] px-4 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-sm text-[var(--slate)] hover:text-[var(--brass)] transition-colors">
            ← Back
          </button>
          <StudentNav />
        </div>

        <div className="bg-[var(--parchment)] rounded-2xl p-8">
          <div className="h-40 bg-[var(--ink)]/[0.06] rounded-lg mb-6 flex items-center justify-center text-[var(--slate)] text-xs">
            Video thumbnail
          </div>

          <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--slate)] mb-1">
            {resource.source} · {resource.durationMinutes} min
          </p>

          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[var(--ink)] mb-4">
            {resource.title}
          </h1>

          <div className="mb-4">
            <ProgressStatusControl
              resourceId={id}
              status={progressStatus}
              onChange={setProgressStatus}
              onRequireLogin={handleRequireLogin}
            />
          </div>

          <div className="bg-white/60 border border-black/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink)]">
                Comprehension Quiz
              </p>
              {bestAttempt && (
                <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.1em] text-[var(--brass)]">
                  Best: {bestAttempt.score}/{bestAttempt.totalQuestions}
                </p>
              )}
            </div>
            <p className="text-xs text-[var(--slate)] mb-3">
              {quizAttempts.length > 0
                ? `You've attempted this quiz ${quizAttempts.length} time${quizAttempts.length > 1 ? 's' : ''}.`
                : 'Test what you learned from this resource.'}
            </p>
            <button
              onClick={() => (getUser() ? router.push(`/resources/${id}/quiz`) : router.push('/login'))}
              style={{ fontFamily: 'var(--font-mono)' }}
              className="w-full bg-[var(--verdigris)] text-white rounded-lg py-2.5 text-xs uppercase tracking-wide font-medium hover:opacity-90 transition-opacity"
            >
              {quizAttempts.length > 0 ? 'Retake quiz' : 'Take the quiz'}
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <MatchGauge status={resource.matchStatus} />
          </div>

          {resource.covers?.length > 0 && (
            <div className="mb-4">
              <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--verdigris)] mb-2">
                Covers
              </p>
              <ul className="space-y-1">
                {resource.covers.map((item, i) => (
                  <li key={i} className="text-sm text-[var(--ink)] flex gap-2">
                    <span style={{ color: 'var(--verdigris)' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resource.missing?.length > 0 && (
            <div className="mb-6">
              <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--rust)] mb-2">
                Missing
              </p>
              <ul className="space-y-1">
                {resource.missing.map((item, i) => (
                  <li key={i} className="text-sm text-[var(--ink)] flex gap-2">
                    <span style={{ color: 'var(--rust)' }}>✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resource.notes && (
            <p className="text-sm text-[var(--slate)] italic mb-6 border-l-2 border-[var(--brass)] pl-3">
              {resource.notes}
            </p>
          )}

          <ReviewsSection resourceId={id} />

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-mono)' }}
            className="block text-center w-full bg-[var(--ink)] text-[var(--parchment)] rounded-lg py-3 text-sm font-medium tracking-wide hover:bg-[var(--ink-soft)] transition-colors"
          >
            Open resource ↗
          </a>
        </div>
      </div>
    </main>
  );
}