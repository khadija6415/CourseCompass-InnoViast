'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCourses, getTopics } from '@/lib/api';
import CompassMark from '@/components/CompassMark';
import StudentNav from '@/components/StudentNav';

export default function HomePage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let slowTimer;
    async function loadCourses() {
      try {
        setLoading(true);
        setSlowLoading(false);
        slowTimer = setTimeout(() => setSlowLoading(true), 4000);
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        setError('Could not load courses. Please refresh the page — the server may still be starting up.');
      } finally {
        clearTimeout(slowTimer);
        setLoading(false);
        setSlowLoading(false);
      }
    }
    loadCourses();
    return () => clearTimeout(slowTimer);
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setTopics([]);
      setSelectedTopic('');
      return;
    }
    async function loadTopics() {
      try {
        const course = courses.find((c) => c._id === selectedCourse);
        const data = await getTopics(course.slug);
        setTopics(data);
      } catch (err) {
        setError('Could not load topics.');
      }
    }
    loadTopics();
  }, [selectedCourse, courses]);

  function handleViewResources() {
    if (!selectedTopic) return;
    const topic = topics.find((t) => t._id === selectedTopic);
    router.push(`/resources?topicId=${selectedTopic}&topicName=${encodeURIComponent(topic?.name || '')}`);
  }

  return (
    <main className="min-h-screen bg-[var(--ink)] flex flex-col px-4 py-6 relative overflow-hidden">
      <CompassMark className="absolute -right-20 -bottom-20 w-80 h-80 opacity-[0.06]" color="var(--brass)" />

      <div className="flex justify-end relative">
        <StudentNav />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md relative">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <CompassMark className="w-5 h-5" color="var(--brass)" />
            <span
              className="text-[var(--parchment)] tracking-[0.25em] text-xs uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              CourseCompass
            </span>
          </div>

          <div className="bg-[var(--parchment)] rounded-2xl shadow-2xl shadow-black/40 p-8">
            <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-semibold text-[var(--ink)] mb-1">
              Find your bearing
            </h1>
            <p className="text-sm text-[var(--slate)] mb-6">
              Resources checked against your exact syllabus — no more guessing.
            </p>

            {loading && (
              <div className="space-y-2">
                <p className="text-sm text-[var(--slate)] flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-[var(--brass)] border-t-transparent rounded-full animate-spin" />
                  Loading courses...
                </p>
                {slowLoading && (
                  <p className="text-xs text-[var(--slate)] italic">
                    The server may be waking up from idle — this can take up to a minute on the first visit. Thanks for waiting!
                  </p>
                )}
              </div>
            )}
            {error && <p className="text-sm text-[var(--rust)] mb-4">{error}</p>}

            {!loading && !error && (
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-[10px] uppercase tracking-[0.15em] text-[var(--slate)] mb-1"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full bg-white border border-[var(--ink)]/15 rounded-lg px-3 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-[10px] uppercase tracking-[0.15em] text-[var(--slate)] mb-1"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={!selectedCourse}
                    className="w-full bg-white border border-[var(--ink)]/15 rounded-lg px-3 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)] disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => (
                      <option key={topic._id} value={topic._id}>{topic.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleViewResources}
                  disabled={!selectedTopic}
                  style={{ fontFamily: 'var(--font-mono)' }}
                  className="w-full bg-[var(--ink)] text-[var(--parchment)] rounded-lg py-3 text-sm font-medium tracking-wide hover:bg-[var(--ink-soft)] disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                >
                  View resources →
                </button>
              </div>
            )}

            {!loading && !error && courses.length === 0 && (
              <p className="text-sm text-[var(--slate)] mt-4">
                No courses available yet. Add courses from the admin panel.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}