'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuizForResource, submitQuiz, getResourceById } from '@/lib/api';
import { getUser } from '@/lib/auth';
import StudentNav from '@/components/StudentNav';

export default function QuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const [resource, setResource] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!id) return;
    if (!getUser()) {
      router.push('/login');
      return;
    }
    async function load() {
      try {
        setLoading(true);
        const [resourceData, quizData] = await Promise.all([
          getResourceById(id),
          getQuizForResource(id),
        ]);
        setResource(resourceData);
        setQuestions(quizData.questions);
      } catch (err) {
        setError(
          err.message === 'No quiz available for this topic yet'
            ? 'No quiz has been added for this topic yet. Check back soon!'
            : 'Could not load the quiz.'
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function selectAnswer(questionId, index) {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      await handleSubmit();
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const payload = questions.map((q) => ({ questionId: q._id, selectedIndex: answers[q._id] }));
      const data = await submitQuiz(id, payload);
      setResult(data);
    } catch (err) {
      setError('Could not submit your quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
        <p className="text-sm text-[var(--slate)]">Loading quiz...</p>
      </main>
    );
  }

  if (error && !result) {
    return (
      <main className="min-h-screen bg-[var(--ink)] flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-sm text-[var(--rust)] text-center">{error}</p>
        <button onClick={() => router.push(`/resources/${id}`)} className="text-sm text-[var(--brass)] hover:underline">
          ← Back to resource
        </button>
      </main>
    );
  }

  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const scoreColor = percentage >= 70 ? 'var(--verdigris)' : percentage >= 40 ? 'var(--brass)' : 'var(--rust)';
    return (
      <main className="min-h-screen bg-[var(--ink)] px-4 py-10">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.push(`/resources/${id}`)} className="text-sm text-[var(--slate)] hover:text-[var(--brass)] transition-colors">
              ← Back to resource
            </button>
            <StudentNav />
          </div>

          <div className="bg-[var(--parchment)] rounded-2xl p-8 text-center mb-6">
            <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--slate)] mb-2">
              Quiz complete
            </p>
            <p style={{ fontFamily: 'var(--font-display)', color: scoreColor }} className="text-5xl font-semibold mb-2">
              {result.score}/{result.totalQuestions}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', color: scoreColor }} className="text-sm uppercase tracking-[0.1em]">
              {percentage}% correct
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {questions.map((q, i) => {
              const graded = result.answers.find((a) => a.question === q._id);
              const selectedIndex = answers[q._id];
              return (
                <div key={q._id} className="bg-[var(--parchment)] rounded-xl p-4">
                  <p className="text-sm font-medium text-[var(--ink)] mb-2">
                    {i + 1}. {q.questionText}
                  </p>
                  <p style={{ color: graded?.isCorrect ? 'var(--verdigris)' : 'var(--rust)' }} className="text-xs flex items-center gap-1.5">
                    <span>{graded?.isCorrect ? '✓' : '✕'}</span>
                    Your answer: {q.options[selectedIndex] ?? 'Not answered'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              style={{ fontFamily: 'var(--font-mono)' }}
              className="flex-1 bg-[var(--brass)] text-[var(--ink)] rounded-lg py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
            <button
              onClick={() => router.push(`/resources/${id}`)}
              style={{ fontFamily: 'var(--font-mono)' }}
              className="flex-1 bg-[var(--ink)] text-[var(--parchment)] border border-white/15 rounded-lg py-3 text-sm font-medium tracking-wide hover:bg-[var(--ink-soft)] transition-colors"
            >
              Back to resource
            </button>
          </div>
        </div>
      </main>
    );
  }

  const question = questions[currentIndex];
  const isAnswered = answers[question._id] !== undefined;
  const isLast = currentIndex === questions.length - 1;

  return (
    <main className="min-h-screen bg-[var(--ink)] px-4 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push(`/resources/${id}`)} className="text-sm text-[var(--slate)] hover:text-[var(--brass)] transition-colors">
            ← Exit quiz
          </button>
          <StudentNav />
        </div>

        <div className="mb-4">
          <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--slate)] mb-2">
            Question {currentIndex + 1} of {questions.length} · {resource?.title}
          </p>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brass)] rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-[var(--parchment)] rounded-2xl p-8">
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-semibold text-[var(--ink)] mb-6">
            {question.questionText}
          </h1>

          <div className="space-y-2 mb-8">
            {question.options.map((opt, i) => {
              const selected = answers[question._id] === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(question._id, i)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-colors ${
                    selected
                      ? 'bg-[var(--brass)]/15 border-[var(--brass)] text-[var(--ink)] font-medium'
                      : 'bg-white border-black/10 text-[var(--ink)] hover:border-[var(--brass)]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {error && <p className="text-sm text-[var(--rust)] mb-4">{error}</p>}

          <button
            onClick={handleNext}
            disabled={!isAnswered || submitting}
            style={{ fontFamily: 'var(--font-mono)' }}
            className="w-full bg-[var(--ink)] text-[var(--parchment)] rounded-lg py-3 text-sm font-medium tracking-wide hover:bg-[var(--ink-soft)] disabled:opacity-40 transition-colors"
          >
            {submitting ? 'Submitting...' : isLast ? 'Submit quiz' : 'Next question →'}
          </button>
        </div>
      </div>
    </main>
  );
}