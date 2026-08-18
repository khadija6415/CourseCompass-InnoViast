'use client';

import { useState, useEffect } from 'react';
import { getTopicProgress } from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function TopicProgressBar({ topicId }) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!topicId || !getUser()) {
      setProgress(null);
      return;
    }
    getTopicProgress(topicId).then(setProgress).catch(() => setProgress(null));
  }, [topicId]);

  if (!progress || progress.totalResources === 0) return null;

  return (
    <div className="bg-[var(--parchment)]/[0.06] border border-[var(--parchment)]/10 rounded-xl px-4 py-3 mb-6">
      <div className="flex items-center justify-between mb-2">
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--slate)]">
          Your progress
        </p>
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.1em] text-[var(--brass)]">
          {progress.completed} / {progress.totalResources} completed
        </p>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--brass)] rounded-full transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}