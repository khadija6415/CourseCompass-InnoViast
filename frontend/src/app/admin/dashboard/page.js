'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCourses, createCourse, getTopics, createTopic } from '@/lib/api';
import { getUser, clearAuth } from '@/lib/auth';
import CompassMark from '@/components/CompassMark';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [topics, setTopics] = useState([]);

  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSlug, setNewCourseSlug] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSlug, setNewTopicSlug] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const current = getUser();
    if (!current || current.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(current);
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      setError('Could not load courses.');
    }
  }

  useEffect(() => {
    if (!selectedCourseId) {
      setTopics([]);
      return;
    }
    async function loadTopics() {
      const course = courses.find((c) => c._id === selectedCourseId);
      if (!course) return;
      const data = await getTopics(course.slug);
      setTopics(data);
    }
    loadTopics();
  }, [selectedCourseId, courses]);

  function slugify(text) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleAddCourse(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await createCourse({ name: newCourseName, slug: newCourseSlug || slugify(newCourseName) });
      setMessage('Course added successfully.');
      setNewCourseName('');
      setNewCourseSlug('');
      loadCourses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddTopic(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await createTopic({
        courseId: selectedCourseId,
        name: newTopicName,
        slug: newTopicSlug || slugify(newTopicName),
      });
      setMessage('Topic added successfully.');
      setNewTopicName('');
      setNewTopicSlug('');
      const course = courses.find((c) => c._id === selectedCourseId);
      const data = await getTopics(course.slug);
      setTopics(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearAuth();
    router.push('/admin/login');
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[var(--ink)] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <CompassMark className="w-5 h-5" color="var(--brass)" />
            <span className="text-[var(--parchment)] tracking-[0.2em] text-xs uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Admin Dashboard
            </span>
          </div>
          <button onClick={handleLogout} className="text-sm text-[var(--slate)] hover:text-[var(--rust)] transition-colors">
            Log out
          </button>
        </div>

        {message && <p className="text-sm text-[var(--verdigris)] mb-4">{message}</p>}
        {error && <p className="text-sm text-[var(--rust)] mb-4">{error}</p>}

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-[var(--parchment)] rounded-2xl p-6">
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--ink)] mb-4">
              Courses
            </h2>
            <ul className="space-y-2 mb-4">
              {courses.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => setSelectedCourseId(c._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCourseId === c._id ? 'bg-[var(--ink)] text-[var(--parchment)]' : 'bg-white text-[var(--ink)] hover:bg-[var(--ink)]/5'}`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddCourse} className="space-y-2 border-t border-black/10 pt-4">
              <input
                placeholder="New course name"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                required
                className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
              />
              <button type="submit" style={{ fontFamily: 'var(--font-mono)' }} className="w-full bg-[var(--brass)] text-[var(--ink)] rounded-lg py-2 text-xs uppercase tracking-wide font-medium hover:opacity-90 transition-opacity">
                + Add course
              </button>
            </form>
          </div>

          <div className="bg-[var(--parchment)] rounded-2xl p-6">
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-lg font-semibold text-[var(--ink)] mb-4">
              Topics
            </h2>
            {!selectedCourseId && <p className="text-sm text-[var(--slate)]">Select a course first.</p>}
            {selectedCourseId && (
              <>
                <ul className="space-y-2 mb-4">
                  {topics.map((t) => (
                    <li key={t._id} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg text-sm text-[var(--ink)]">
                      {t.name}
                      <button
                        onClick={() => router.push(`/admin/resources?topicId=${t._id}&topicName=${encodeURIComponent(t.name)}`)}
                        className="text-[var(--brass)] text-xs hover:underline"
                      >
                        Manage →
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleAddTopic} className="space-y-2 border-t border-black/10 pt-4">
                  <input
                    placeholder="New topic name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    required
                    className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)]"
                  />
                  <button type="submit" style={{ fontFamily: 'var(--font-mono)' }} className="w-full bg-[var(--brass)] text-[var(--ink)] rounded-lg py-2 text-xs uppercase tracking-wide font-medium hover:opacity-90 transition-opacity">
                    + Add topic
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}