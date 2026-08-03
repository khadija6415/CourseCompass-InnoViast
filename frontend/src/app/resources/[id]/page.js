'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResourceById, getMyBookmarks, addBookmarkApi, removeBookmarkApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import MatchGauge from '@/components/MatchGauge';
import StudentNav from '@/components/StudentNav';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        setLoading(true);
        const data = await getResourceById(id);
        setResource(data);

        const user = getUser();
        if (user) {
          const bookmarks = await getMyBookmarks();
          setIsBookmarked(bookmarks.some((b) => b.resource && b.resource._id === id));
        }
      } catch (err) {
        setError('Could not load this resource.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleToggleBookmark() {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setBookmarkBusy(true);
    try {
      if (isBookmarked) {
        await removeBookmarkApi(id);
        setIsBookmarked(false);
      } else {
        await addBookmarkApi(id);
        setIsBookmarked(true);
      }
    } catch (err) {
      setError('Could not update bookmark.');
    } finally {
      setBookmarkBusy(false);
    }
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

          <div className="flex items-start justify-between gap-4 mb-1">
            <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--slate)]">
              {resource.source} · {resource.durationMinutes} min
            </p>
            <button
              onClick={handleToggleBookmark}
              disabled={bookmarkBusy}
              style={{ fontFamily: 'var(--font-mono)' }}
              className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded-sm border shrink-0 transition-colors ${
                isBookmarked
                  ? 'border-[var(--brass)] text-[var(--brass)] bg-[var(--brass)]/10'
                  : 'border-[var(--ink)]/20 text-[var(--slate)] hover:border-[var(--brass)] hover:text-[var(--brass)]'
              }`}
            >
              {isBookmarked ? '★ Saved' : '☆ Save'}
            </button>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[var(--ink)] mb-6">
            {resource.title}
          </h1>

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

          
           <a href={resource.url}
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