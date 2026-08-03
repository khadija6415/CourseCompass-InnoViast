'use client';

import { useState } from 'react';
import { matchSyllabus } from '@/lib/api';

export default function SyllabusMatchPanel({ topicId, onResults }) {
  const [mode, setMode] = useState('paste');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(false);

  async function handleCheck() {
    setError('');
    if (mode === 'paste' && !text.trim()) {
      setError('Please paste your syllabus text first.');
      return;
    }
    if (mode === 'upload' && !file) {
      setError('Please choose a PDF file first.');
      return;
    }
    setLoading(true);
    try {
      const data = await matchSyllabus(topicId, {
        text: mode === 'paste' ? text : '',
        file: mode === 'upload' ? file : null,
      });
      onResults(data.resources);
      setChecked(true);
    } catch (err) {
      setError(err.message || 'Could not match syllabus.');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setChecked(false);
    onResults(null);
    setText('');
    setFile(null);
  }

  return (
    <div className="bg-[var(--parchment)] rounded-xl p-4 mb-6">
      <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--slate)] mb-3">
        Personalize with your syllabus
      </p>

      {!checked ? (
        <>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setMode('paste')}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${mode === 'paste' ? 'bg-[var(--ink)] text-[var(--parchment)]' : 'bg-white text-[var(--ink)]'}`}
            >
              Paste text
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${mode === 'upload' ? 'bg-[var(--ink)] text-[var(--parchment)]' : 'bg-white text-[var(--ink)]'}`}
            >
              Upload PDF
            </button>
          </div>

          {mode === 'paste' ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Paste your course outline or syllabus text here..."
              className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)] mb-3"
            />
          ) : (
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-[var(--ink)] mb-3"
            />
          )}

          {error && <p className="text-xs text-[var(--rust)] mb-2">{error}</p>}

          <button
            onClick={handleCheck}
            disabled={loading}
            style={{ fontFamily: 'var(--font-mono)' }}
            className="bg-[var(--brass)] text-[var(--ink)] rounded-lg px-4 py-2 text-xs uppercase tracking-wide font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Checking...' : 'Check my syllabus'}
          </button>
        </>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--verdigris)]">Showing personalized match against your syllabus</p>
          <button onClick={handleClear} className="text-xs text-[var(--slate)] hover:text-[var(--rust)] underline shrink-0">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}