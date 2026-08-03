'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyBookmarks, removeBookmarkApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import StudentNav from '@/components/StudentNav';

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

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  async function handleRemove(resourceId) {
    try {
      await removeBookmarkApi(resourceId);
      setBookmarks((prev) => prev.filter((b) => b.resource._id !== resourceId));
    } catch (err) {
      setError('Could not remove bookmark.');
    }
  }

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
          My Bookmarks
        </h1>
        <p className="text-sm text-[var(--slate)] mb-6">Resources you&apos;ve saved for later</p>

        {error && <p className="text-sm text-[var(--rust)] mb-4">{error}</p>}
        {loading && <p className="text-sm text-[var(--slate)]">Loading...</p>}

        {!loading && bookmarks.length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
            <p className="text-sm text-[var(--slate)]">No bookmarks yet. Save resources from any topic to see them here.</p>
          </div>
        )}

        <div className="space-y-3">
          {bookmarks.map((b) => (
            <div key={b._id} className="bg-[var(--parchment)] rounded-xl p-4 flex items-center justify-between gap-4">
              <button onClick={() => router.push(`/resources/${b.resource._id}`)} className="text-left flex-1">
                <p className="text-sm font-medium text-[var(--ink)] mb-1">{b.resource.title}</p>
                <span
                  style={{ fontFamily: 'var(--font-mono)', ...tagStyles[b.resource.matchStatus] }}
                  className="text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-1 rounded-sm border"
                >
                  {tagLabels[b.resource.matchStatus]}
                </span>
              </button>
              <button onClick={() => handleRemove(b.resource._id)} className="text-[var(--rust)] text-xs hover:underline shrink-0">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}