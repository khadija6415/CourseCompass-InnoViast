'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createQuestion, getQuestionsByTopic, deleteQuestion } from '@/lib/api';
import { getUser } from '@/lib/auth';

function AdminQuestionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topicId = searchParams.get('topicId');
  const topicName = searchParams.get('topicName') || 'Quiz Questions';

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [tags, setTags] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    if (topicId) loadQuestions();
  }, [topicId]);

  async function loadQuestions() {
    try {
      setLoading(true);
      const data = await getQuestionsByTopic(topicId);
      setQuestions(data);
    } catch (err) {
      setError('Could not load questions.');
    } finally {
      setLoading(false);
    }
  }

  function handleOptionChange(index, value) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }

  function handleAddOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, '']);
  }

  function handleRemoveOption(index) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
    if (correctAnswerIndex === index) setCorrectAnswerIndex(0);
    else if (correctAnswerIndex > index) setCorrectAnswerIndex((prev) => prev - 1);
  }

  function resetForm() {
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
    setTags('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    const trimmedOptions = options.map((o) => o.trim());
    if (trimmedOptions.some((o) => !o)) {
      setError('All options must be filled in.');
      return;
    }

    setSubmitting(true);
    try {
      await createQuestion({
        topic: topicId,
        questionText: questionText.trim(),
        options: trimmedOptions,
        correctAnswerIndex,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      setMessage('Question added successfully.');
      resetForm();
      loadQuestions();
    } catch (err) {
      setError(err.message || 'Failed to add question.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this question?')) return;
    try {
      await deleteQuestion(id);
      loadQuestions();
    } catch (err) {
      setError('Failed to delete question.');
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
          {topicName} — Quiz Questions
        </h1>
        <p className="text-sm text-[var(--slate)] mb-6">Build the comprehension quiz students see after completing a resource</p>

        {message && <p className="text-sm text-[var(--verdigris)] mb-4">{message}</p>}
        {error && <p className="text-sm text-[var(--rust)] mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="bg-[var(--parchment)] rounded-2xl p-6 mb-8 space-y-3">
          <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--ink)] mb-2">
            Add new question
          </h2>

          <textarea
            placeholder="Question text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            rows={2}
            className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
          />

          <div className="space-y-2">
            <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.1em] text-[var(--slate)]">
              Options — select the correct one
            </p>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswerIndex === i}
                  onChange={() => setCorrectAnswerIndex(i)}
                  className="accent-[var(--verdigris)] shrink-0"
                />
                <input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  required
                  className="flex-1 bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    className="text-[var(--rust)] text-xs shrink-0 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button type="button" onClick={handleAddOption} className="text-xs text-[var(--brass)] hover:underline">
                + Add option
              </button>
            )}
          </div>

          <input
            placeholder="Tags / concepts (comma-separated, optional)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
          />

          <button
            type="submit"
            disabled={submitting}
            style={{ fontFamily: 'var(--font-mono)' }}
            className="w-full bg-[var(--ink)] text-[var(--parchment)] rounded-lg py-2.5 text-sm font-medium tracking-wide hover:bg-[var(--ink-soft)] disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Adding...' : '+ Add question'}
          </button>
        </form>

        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--parchment)] mb-3">
          Existing questions ({questions.length})
        </h2>

        {loading && <p className="text-sm text-[var(--slate)]">Loading...</p>}
        {!loading && questions.length === 0 && (
          <p className="text-sm text-[var(--slate)]">No questions added yet. Students won&apos;t see a quiz until you add at least one.</p>
        )}

        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q._id} className="bg-[var(--parchment)] rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-sm font-medium text-[var(--ink)]">{q.questionText}</p>
                <button onClick={() => handleDelete(q._id)} className="text-[var(--rust)] text-xs hover:underline shrink-0">
                  Delete
                </button>
              </div>
              <ul className="space-y-0.5">
                {q.options.map((opt, i) => (
                  <li
                    key={i}
                    style={{ color: i === q.correctAnswerIndex ? 'var(--verdigris)' : 'var(--slate)' }}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <span>{i === q.correctAnswerIndex ? '✓' : '○'}</span> {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function AdminQuestionsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--ink)]" />}>
      <AdminQuestionsContent />
    </Suspense>
  );
}