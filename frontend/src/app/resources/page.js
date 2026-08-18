'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getResources, getMyBookmarks } from '@/lib/api';
import { getUser } from '@/lib/auth';
import SyllabusMatchPanel from '@/components/SyllabusMatchPanel';
import TopicProgressBar from '@/components/TopicProgressBar';

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

const statusLabels = {
  saved: '☆ Saved',
  'in-progress': '▶ In progress',
  completed: '✓ Completed',
};

function personalizedColor(percent) {
  if (percent >= 70) return 'var(--verdigris)';
  if (percent >= 40) return 'var(--brass)';
  return 'var(--rust)';
}

function ResourcesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topicId = searchParams.get('topicId');
  const topicName = searchParams.get('topicName') || 'Resources';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [personalized, setPersonalized] = useState(null);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    if (!topicId) return;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await getResources(topicId, { search, matchStatus: filter });
        setResources(data);
      } catch (err) {
        setError('Could not load resources. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [topicId, search, filter]);

  useEffect(() => {
    if (!getUser()) {
      setStatusMap({});
      return;
    }
    getMyBookmarks()
      .then((data) => {
        const map = {};
        data.forEach((b) => {
          if (b.resource) map[b.resource._id] = b.status;
        });
        setStatusMap(map);
      })
      .catch(() => {});
  }, [topicId]);

  function handlePersonalizedResults(results) {
    if (!results) {
      setPersonalized(null);
      return;
    }
    const map = {};
    results.forEach((r) => {
      map[r._id] = r;
    });
    setPersonalized(map);
  }

  if (!topicId) {
    return (
      <main className="min-h-screen bg-[var(--ink)] flex items-center justify-center px-4">
        <p className="text-sm text-[var(--slate)]">
          No topic selected.{' '}
          <button onClick={() => router.push('/')} className="text-[var(--brass)] underline">
            Go back
          </button>
        </p>
      </main>
    );
  }

  const displayResources = personalized
    ? [...resources].sort((a, b) => {
        const pa = personalized[a._id]?.personalizedMatchPercent ?? -1;
        const pb = personalized[b._id]?.personalizedMatchPercent ?? -1;
        return pb - pa;
      })
    : resources;

  return (
    <main className="min-h-screen bg-[var(--ink)] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push('/')} className="text-sm text-[var(--slate)] hover:text-[var(--brass)] mb-4 transition-colors">
          ← Back
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[var(--parchment)] mb-1">
          {topicName}
        </h1>
        <p className="text-sm text-[var(--slate)] mb-6">Curated resources checked against your course syllabus</p>

        <TopicProgressBar topicId={topicId} />

        <SyllabusMatchPanel topicId={topicId} onResults={handlePersonalizedResults} />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[var(--parchment)] border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-black/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All resources</option>
            <option value="match">Syllabus match</option>
            <option value="extra">Extra content</option>
            <option value="missing">Missing concept</option>
          </select>
        </div>

        {loading && <p className="text-sm text-[var(--slate)]">Loading resources...</p>}
        {error && <p className="text-sm text-[var(--rust)]">{error}</p>}

        {!loading && !error && displayResources.length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
            <p className="text-sm text-[var(--slate)]">No resources found for this topic yet.</p>
          </div>
        )}

        {!loading && !error && displayResources.length > 0 && (
          <div className="space-y-3">
            {displayResources.map((resource) => {
              const p = personalized?.[resource._id];
              const matchedSet = new Set(p?.matchedCovers || []);
              return (
                <button
                  key={resource._id}
                  onClick={() => router.push(`/resources/${resource._id}`)}
                  className="w-full text-left bg-[var(--parchment)] rounded-xl p-4 hover:shadow-lg hover:shadow-black/20 transition-all"
                >
                  <div className="h-24 bg-[var(--ink)]/[0.06] rounded-lg mb-3 flex items-center justify-center text-[var(--slate)] text-xs">
                    Video thumbnail
                  </div>
                  <p className="text-sm font-medium text-[var(--ink)] mb-2">{resource.title}</p>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      style={{ fontFamily: 'var(--font-mono)', ...tagStyles[resource.matchStatus] }}
                      className="text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-1 rounded-sm border"
                    >
                      {tagLabels[resource.matchStatus]}
                    </span>
                    <span className="text-xs text-[var(--slate)]">{resource.durationMinutes} min</span>
                  </div>

                  {statusMap[resource._id] && (
                    <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.1em] text-[var(--brass)] mt-1">
                      {statusLabels[statusMap[resource._id]]}
                    </p>
                  )}

                  {p && p.personalizedMatchPercent !== null && (
                    <>
                      <p
                        style={{ fontFamily: 'var(--font-mono)', color: personalizedColor(p.personalizedMatchPercent) }}
                        className="text-[10px] uppercase tracking-[0.1em] mt-2"
                      >
                        {p.personalizedMatchPercent}% matches your syllabus
                      </p>
                      {resource.covers?.length > 0 && (
                        <div className="mt-2 space-y-0.5 border-t border-black/5 pt-2">
                          {resource.covers.map((c) => {
                            const isMatched = matchedSet.has(c);
                            return (
                              <p
                                key={c}
                                style={{ color: isMatched ? 'var(--verdigris)' : 'var(--rust)' }}
                                className="text-[11px] flex items-center gap-1.5"
                              >
                                <span>{isMatched ? '✓' : '✕'}</span> {c}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
          <p className="text-sm text-[var(--slate)]">Loading...</p>
        </main>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}