'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyBookmarks } from '@/lib/api';
import { getUser } from '@/lib/auth';
import StudentNav from '@/components/StudentNav';
import ProgressStatusControl from '@/components/ProgressStatusControl';

const tagStyles = {
  match: { borderColor: 'var(--verdigris)', color: 'var(--verdigris)' },
  extra: { borderColor: 'var(--brass)', color: 'var(--brass)' },
  missing: { borderColor: 'var(--rust)', color: 'var(--rust)' },
};

const tagLabels = {
  match: 'Syllabus match',
  extra: 'Extra content',
  missing: 'Missing concept',
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'saved', label: 'Saved' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    try {
      setLoading(true);
      const data = await getMyBookmarks();
      setBookmarks(data.filter((b) => b.resource));
    } catch (err) {
      setError('Could not load bookmarks.');
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChange(resourceId, newStatus) {
    if (newStatus === null) {
      setBookmarks((prev) => prev.filter((b) => b.resource._id !== resourceId));
    } else {
      setBookmarks((prev) => prev.map((b) => (b.resource._id === resourceId ? { ...b, status: newStatus } : b)));
    }
  }

  const visibleBookmarks = filter === 'all' ? bookmarks : bookmarks.filter((b) => b.status === filter);

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
          My Learning
        </h1>
        <p className="text-sm text-[var(--slate)] mb-6">Track what you&apos;ve saved, started, and completed</p>

        <div style={{ fontFamily: 'var(--font-mono)' }} className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.value
                  ? 'bg-[var(--brass)] border-[var(--brass)] text-[var(--ink)]'
                  : 'border-white/15 text-[var(--slate)] hover:border-[var(--brass)] hover:text-[var(--brass)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-[var(--rust)] mb-4">{error}</p>}
        {loading && <p className="text-sm text-[var(--slate)]">Loading...</p>}

        {!loading && visibleBookmarks.length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
            <p className="text-sm text-[var(--slate)]">Nothing here yet. Save resources from any topic to see them in your list.</p>
          </div>
        )}

        <div className="space-y-3">
          {visibleBookmarks.map((b) => (
            <div key={b._id} className="bg-[var(--parchment)] rounded-xl p-4">
              <button onClick={() => router.push(`/resources/${b.resource._id}`)} className="text-left w-full mb-3">
                <p className="text-sm font-medium text-[var(--ink)] mb-1">{b.resource.title}</p>
                <span
                  style={{ fontFamily: 'var(--font-mono)', ...tagStyles[b.resource.matchStatus] }}
                  className="text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-1 rounded-sm border"
                >
                  {tagLabels[b.resource.matchStatus]}
                </span>
              </button>
              <ProgressStatusControl
                resourceId={b.resource._id}
                status={b.status}
                onChange={(newStatus) => handleStatusChange(b.resource._id, newStatus)}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}