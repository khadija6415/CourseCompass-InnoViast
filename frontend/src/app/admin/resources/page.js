'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getResources, createResource, deleteResource } from '@/lib/api';
import { getUser } from '@/lib/auth';

const statusOptions = [
  { value: 'match', label: 'Syllabus match' },
  { value: 'extra', label: 'Extra content' },
  { value: 'missing', label: 'Missing concept' },
];

function AdminResourcesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topicId = searchParams.get('topicId');
  const topicName = searchParams.get('topicName') || 'Resources';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    title: '', url: '', source: 'YouTube', durationMinutes: '',
    matchStatus: 'match', covers: '', missing: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    if (topicId) loadResources();
  }, [topicId]);

  async function loadResources() {
    try {
      setLoading(true);
      const data = await getResources(topicId);
      setResources(data);
    } catch (err) {
      setError('Could not load resources.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await createResource({
        topic: topicId,
        title: form.title,
        url: form.url,
        source: form.source,
        durationMinutes: Number(form.durationMinutes) || 0,
        matchStatus: form.matchStatus,
        covers: form.covers ? form.covers.split(',').map((s) => s.trim()).filter(Boolean) : [],
        missing: form.missing ? form.missing.split(',').map((s) => s.trim()).filter(Boolean) : [],
        notes: form.notes,
      });
      setMessage('Resource added successfully.');
      setForm({ title: '', url: '', source: 'YouTube', durationMinutes: '', matchStatus: 'match', covers: '', missing: '', notes: '' });
      loadResources();
    } catch (err) {
      setError(err.message || 'Failed to add resource.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this resource?')) return;
    try {
      await deleteResource(id);
      loadResources();
    } catch (err) {
      setError('Failed to delete resource.');
    }
  }

  if (!topicId) {
    return (
      <main className="min-h-screen bg-[var(--ink)] flex items-center justify-center px-4">
        <p className="text-sm text-[var(--slate)]">
          No topic selected.{' '}
          <button onClick={() => router.push('/admin/dashboard')} className="text-[var(--brass)] underline">
            Go back
          </button>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--ink)] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-[var(--slate)] hover:text-[var(--brass)] mb-4 transition-colors">
          ← Back to dashboard
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold text-[var(--parchment)] mb-1">
          {topicName} — Resources
        </h1>
        <p className="text-sm text-[var(--slate)] mb-6">Add and manage curated resources for this topic</p>

        {message && <p className="text-sm text-[var(--verdigris)] mb-4">{message}</p>}
        {error && <p className="text-sm text-[var(--rust)] mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="bg-[var(--parchment)] rounded-2xl p-6 mb-8 space-y-3">
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--ink)] mb-2">
            Add new resource
          </h2>

          <input
            placeholder="Video title"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
          />
          <input
            placeholder="YouTube URL"
            value={form.url}
            onChange={(e) => handleChange('url', e.target.value)}
            required
            className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={form.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', e.target.value)}
              className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
            />
            <select
              value={form.matchStatus}
              onChange={(e) => handleChange('matchStatus', e.target.value)}
              className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <input
            placeholder="Covers (comma-separated, e.g. Loops, Functions)"
            value={form.covers}
            onChange={(e) => handleChange('covers', e.target.value)}
            className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
          />
          <input
            placeholder="Missing (comma-separated, optional)"
            value={form.missing}
            onChange={(e) => handleChange('missing', e.target.value)}
            className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
          />
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
          />

          <button
            type="submit"
            disabled={submitting}
            style={{ fontFamily: 'var(--font-mono)' }}
            className="w-full bg-[var(--ink)] text-[var(--parchment)] rounded-lg py-2.5 text-sm font-medium tracking-wide hover:bg-[var(--ink-soft)] disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Adding...' : '+ Add resource'}
          </button>
        </form>

        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--parchment)] mb-3">
          Existing resources
        </h2>

        {loading && <p className="text-sm text-[var(--slate)]">Loading...</p>}

        {!loading && resources.length === 0 && (
          <p className="text-sm text-[var(--slate)]">No resources added yet.</p>
        )}

        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r._id} className="bg-[var(--parchment)] rounded-lg p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">{r.title}</p>
                <p className="text-xs text-[var(--slate)]">{r.matchStatus} · {r.durationMinutes} min</p>
              </div>
              <button onClick={() => handleDelete(r._id)} className="text-[var(--rust)] text-xs hover:underline shrink-0">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function AdminResourcesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--ink)]" />}>
      <AdminResourcesContent />
    </Suspense>
  );
}
