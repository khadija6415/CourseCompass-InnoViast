'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAnalyticsOverview, getPopularResources, getTopicPerformance, getEngagementTrend } from '@/lib/api';
import { getUser } from '@/lib/auth';
import CompassMark from '@/components/CompassMark';

const matchStatusMeta = {
  match: { label: 'Syllabus match', color: 'var(--verdigris)' },
  extra: { label: 'Extra content', color: 'var(--brass)' },
  missing: { label: 'Missing concept', color: 'var(--rust)' },
};

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[var(--parchment)] rounded-xl p-4">
      <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.1em] text-[var(--slate)] mb-1">
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[var(--ink)]">
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--slate)] mt-0.5">{sub}</p>}
    </div>
  );
}

function buildLast14Days() {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function MiniBarChart({ title, data, color }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.1em] text-[var(--slate)] mb-2">
        {title}
      </p>
      <div className="flex items-end gap-1 h-20">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.date}: ${d.count}`}>
            <div
              className="w-full rounded-sm transition-all"
              style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, backgroundColor: color, opacity: d.count === 0 ? 0.15 : 1 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [popular, setPopular] = useState([]);
  const [topicPerf, setTopicPerf] = useState([]);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const current = getUser();
    if (!current || current.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(current);
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [ov, pop, tp, tr] = await Promise.all([
        getAnalyticsOverview(),
        getPopularResources(),
        getTopicPerformance(),
        getEngagementTrend(),
      ]);
      setOverview(ov);
      setPopular(pop);
      setTopicPerf(tp);
      setTrend(tr);
    } catch (err) {
      setError('Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const days = buildLast14Days();
  const completionsData = trend
    ? days.map((date) => ({ date, count: trend.completionsTrend.find((t) => t._id === date)?.count || 0 }))
    : [];
  const quizData = trend
    ? days.map((date) => ({ date, count: trend.quizTrend.find((t) => t._id === date)?.count || 0 }))
    : [];

  const totalMatchStatus = overview?.matchStatusBreakdown?.reduce((sum, m) => sum + m.count, 0) || 0;

  return (
    <main className="min-h-screen bg-[var(--ink)] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <CompassMark className="w-5 h-5" color="var(--brass)" />
            <span className="text-[var(--parchment)] tracking-[0.2em] text-xs uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Analytics Dashboard
            </span>
          </div>
          <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-[var(--slate)] hover:text-[var(--brass)] transition-colors">
            ← Back to dashboard
          </button>
        </div>

        {loading && <p className="text-sm text-[var(--slate)]">Loading analytics...</p>}
        {error && <p className="text-sm text-[var(--rust)]">{error}</p>}

        {overview && (
          <>
            {/* Overview stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <StatCard label="Students" value={overview.totalStudents} />
              <StatCard label="Resources" value={overview.totalResources} sub={`across ${overview.totalTopics} topics`} />
              <StatCard label="Completion rate" value={`${overview.completionRate}%`} sub={`${overview.totalCompleted}/${overview.totalBookmarks} saved`} />
              <StatCard label="Avg rating" value={overview.avgRating > 0 ? `★ ${overview.avgRating}` : '—'} sub={`${overview.totalReviews} reviews`} />
              <StatCard label="Quiz attempts" value={overview.totalQuizAttempts} sub={`avg ${overview.avgQuizPercentage}% score`} />
              <StatCard label="Courses" value={overview.totalCourses} />
            </div>

            {/* Match status breakdown */}
            <div className="bg-[var(--parchment)] rounded-2xl p-6 mb-6">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--ink)] mb-4">
                Resource breakdown
              </h2>
              <div className="space-y-3">
                {overview.matchStatusBreakdown.map((m) => {
                  const meta = matchStatusMeta[m._id] || { label: m._id, color: 'var(--slate)' };
                  const percent = totalMatchStatus > 0 ? Math.round((m.count / totalMatchStatus) * 100) : 0;
                  return (
                    <div key={m._id}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontFamily: 'var(--font-mono)', color: meta.color }} className="text-xs uppercase tracking-[0.1em]">
                          {meta.label}
                        </span>
                        <span className="text-xs text-[var(--slate)]">{m.count} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: meta.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Engagement trend */}
            {trend && (
              <div className="bg-[var(--parchment)] rounded-2xl p-6 mb-6">
                <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--ink)] mb-4">
                  Engagement — last 14 days
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <MiniBarChart title="Resources completed" data={completionsData} color="var(--brass)" />
                  <MiniBarChart title="Quiz attempts" data={quizData} color="var(--verdigris)" />
                </div>
              </div>
            )}

            {/* Popular resources */}
            <div className="bg-[var(--parchment)] rounded-2xl p-6 mb-6">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--ink)] mb-4">
                Most popular resources
              </h2>
              {popular.length === 0 && <p className="text-sm text-[var(--slate)]">Not enough data yet.</p>}
              <div className="space-y-2">
                {popular.map((r, i) => (
                  <div key={r.resourceId} className="flex items-center justify-between gap-4 border-b border-black/5 pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--ink)] truncate">
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brass)' }} className="mr-2">
                          #{i + 1}
                        </span>
                        {r.title}
                      </p>
                      <p className="text-xs text-[var(--slate)]">
                        {r.bookmarkCount} saved · {r.completedCount} completed
                        {r.reviewCount > 0 ? ` · ★ ${r.averageRating} (${r.reviewCount})` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic performance */}
            <div className="bg-[var(--parchment)] rounded-2xl p-6">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--ink)] mb-4">
                Topic performance
              </h2>
              {topicPerf.length === 0 && <p className="text-sm text-[var(--slate)]">No topics yet.</p>}
              <div className="space-y-2">
                {topicPerf.map((t) => (
                  <div key={t.topicId} className="flex items-center justify-between gap-4 border-b border-black/5 pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--ink)] truncate">{t.topicName}</p>
                      <p className="text-xs text-[var(--slate)]">{t.courseName} · {t.totalResources} resources</p>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)' }} className="text-xs text-right shrink-0">
                      <p className="text-[var(--brass)]">{t.completedCount} completed</p>
                      {t.avgQuizPercentage !== null && <p className="text-[var(--verdigris)]">quiz avg {t.avgQuizPercentage}%</p>}
                      {t.avgRating !== null && <p className="text-[var(--slate)]">★ {t.avgRating}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}