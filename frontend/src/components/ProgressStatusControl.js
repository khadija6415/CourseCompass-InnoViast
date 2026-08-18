'use client';

import { useState } from 'react';
import { updateProgressStatus, removeBookmarkApi } from '@/lib/api';

const STATUS_OPTIONS = [
  { value: 'saved', label: 'Saved', icon: '☆' },
  { value: 'in-progress', label: 'In Progress', icon: '▶' },
  { value: 'completed', label: 'Completed', icon: '✓' },
];

export default function ProgressStatusControl({ resourceId, status, onChange, onRequireLogin }) {
  const [busy, setBusy] = useState(false);

  async function handleSetStatus(value) {
    if (!resourceId || busy) return;
    if (onRequireLogin && onRequireLogin()) return;
    setBusy(true);
    try {
      await updateProgressStatus(resourceId, value);
      onChange?.(value);
    } catch (err) {
      // silently ignore; button just won't visually update
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    try {
      await removeBookmarkApi(resourceId);
      onChange?.(null);
    } catch (err) {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        style={{ fontFamily: 'var(--font-mono)' }}
        className="inline-flex rounded-lg border border-[var(--ink)]/15 overflow-hidden self-start"
      >
        {STATUS_OPTIONS.map((opt, i) => {
          const active = status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={busy}
              onClick={() => handleSetStatus(opt.value)}
              className={`px-3 py-2 text-[10px] uppercase tracking-[0.1em] font-medium transition-colors disabled:opacity-50 ${
                active ? 'bg-[var(--brass)] text-[var(--ink)]' : 'bg-white text-[var(--slate)] hover:bg-[var(--ink)]/5'
              } ${i !== 0 ? 'border-l border-[var(--ink)]/15' : ''}`}
            >
              {opt.icon} {opt.label}
            </button>
          );
        })}
      </div>
      {status && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          className="text-[11px] text-[var(--slate)] hover:text-[var(--rust)] transition-colors self-start"
        >
          Remove from my list
        </button>
      )}
    </div>
  );
}