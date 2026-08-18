import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Session refresh failed');
  const data = await res.json();
  saveTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function apiFetch(path, options = {}) {
  const { skipAuth, ...rest } = options;
  const accessToken = getAccessToken();
  const headers = { ...(rest.headers || {}) };
  if (accessToken && !skipAuth) headers.Authorization = `Bearer ${accessToken}`;

  let res = await fetch(`${API_URL}${path}`, { ...rest, headers });

  if (res.status === 401 && !skipAuth && getRefreshToken()) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
      }
      const newAccessToken = await refreshPromise;
      const retryHeaders = { ...(rest.headers || {}), Authorization: `Bearer ${newAccessToken}` };
      res = await fetch(`${API_URL}${path}`, { ...rest, headers: retryHeaders });
    } catch (err) {
      clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired. Please sign in again.');
    }
  }
  return res;
}

async function handleJson(res, fallbackMsg) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || fallbackMsg);
  }
  return res.json();
}

/* ---------- Courses & Topics (unchanged) ---------- */

export async function getCourses() {
  const res = await apiFetch('/courses', { skipAuth: true });
  return handleJson(res, 'Failed to fetch courses');
}

export async function createCourse(payload) {
  const res = await apiFetch('/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJson(res, 'Failed to create course');
}

export async function getTopics(courseSlug) {
  const res = await apiFetch(`/topics?courseSlug=${courseSlug}`, { skipAuth: true });
  return handleJson(res, 'Failed to fetch topics');
}

export async function createTopic(payload) {
  const res = await apiFetch('/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJson(res, 'Failed to create topic');
}

/* ---------- Resources (unchanged) ---------- */

export async function getResources(topicId, { search, matchStatus } = {}) {
  const params = new URLSearchParams({ topicId });
  if (search) params.append('search', search);
  if (matchStatus) params.append('matchStatus', matchStatus);
  const res = await apiFetch(`/resources?${params.toString()}`, { skipAuth: true });
  return handleJson(res, 'Failed to fetch resources');
}

export async function getResourceById(id) {
  const res = await apiFetch(`/resources/${id}`, { skipAuth: true });
  return handleJson(res, 'Failed to fetch resource');
}

export async function createResource(payload) {
  const res = await apiFetch('/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJson(res, 'Failed to create resource');
}

export async function deleteResource(id) {
  const res = await apiFetch(`/resources/${id}`, { method: 'DELETE' });
  return handleJson(res, 'Failed to delete resource');
}

/* ---------- Auth ---------- */

export async function loginUser(email, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
  return handleJson(res, 'Login failed');
}

export async function registerUser(payload) {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  return handleJson(res, 'Registration failed');
}

export async function logoutUser() {
  const res = await apiFetch('/auth/logout', { method: 'POST' });
  return handleJson(res, 'Logout failed');
}

/* ---------- Bookmarks & Progress Tracking ---------- */

export async function getMyBookmarks() {
  const res = await apiFetch('/bookmarks');
  return handleJson(res, 'Failed to fetch bookmarks');
}

export async function addBookmarkApi(resourceId) {
  const res = await apiFetch('/bookmarks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resourceId }),
  });
  return handleJson(res, 'Failed to add bookmark');
}

export async function removeBookmarkApi(resourceId) {
  const res = await apiFetch(`/bookmarks/${resourceId}`, { method: 'DELETE' });
  return handleJson(res, 'Failed to remove bookmark');
}

export async function updateProgressStatus(resourceId, status) {
  const res = await apiFetch(`/bookmarks/${resourceId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleJson(res, 'Failed to update progress');
}

export async function getTopicProgress(topicId) {
  const res = await apiFetch(`/bookmarks/progress/${topicId}`);
  return handleJson(res, 'Failed to fetch progress');
}

/* ---------- Quiz ---------- */

export async function getQuizForResource(resourceId) {
  const res = await apiFetch(`/quiz/${resourceId}`);
  return handleJson(res, 'Failed to load quiz');
}

export async function submitQuiz(resourceId, answers) {
  const res = await apiFetch(`/quiz/${resourceId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  return handleJson(res, 'Failed to submit quiz');
}

export async function getMyQuizAttempts() {
  const res = await apiFetch('/quiz/attempts/me');
  return handleJson(res, 'Failed to fetch quiz history');
}

export async function getMyAttemptsForResource(resourceId) {
  const res = await apiFetch(`/quiz/attempts/resource/${resourceId}`);
  return handleJson(res, 'Failed to fetch quiz attempts');
}

/* ---------- Question Bank (admin) ---------- */

export async function createQuestion(payload) {
  const res = await apiFetch('/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJson(res, 'Failed to create question');
}

export async function getQuestionsByTopic(topicId) {
  const res = await apiFetch(`/questions/topic/${topicId}`);
  return handleJson(res, 'Failed to fetch questions');
}

export async function updateQuestion(id, payload) {
  const res = await apiFetch(`/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJson(res, 'Failed to update question');
}

export async function deleteQuestion(id) {
  const res = await apiFetch(`/questions/${id}`, { method: 'DELETE' });
  return handleJson(res, 'Failed to delete question');
}

/* ---------- Reviews & Ratings ---------- */

export async function addOrUpdateReview(resourceId, rating, comment) {
  const res = await apiFetch('/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resourceId, rating, comment }),
  });
  return handleJson(res, 'Failed to submit review');
}

export async function getReviewsForResource(resourceId) {
  const res = await apiFetch(`/reviews/resource/${resourceId}`, { skipAuth: true });
  return handleJson(res, 'Failed to fetch reviews');
}

export async function getMyReviewForResource(resourceId) {
  const res = await apiFetch(`/reviews/resource/${resourceId}/mine`);
  return handleJson(res, 'Failed to fetch your review');
}

export async function deleteReview(id) {
  const res = await apiFetch(`/reviews/${id}`, { method: 'DELETE' });
  return handleJson(res, 'Failed to delete review');
}

/* ---------- Analytics (admin) ---------- */

export async function getAnalyticsOverview() {
  const res = await apiFetch('/analytics/overview');
  return handleJson(res, 'Failed to fetch analytics');
}

export async function getPopularResources() {
  const res = await apiFetch('/analytics/popular-resources');
  return handleJson(res, 'Failed to fetch popular resources');
}

export async function getTopicPerformance() {
  const res = await apiFetch('/analytics/topic-performance');
  return handleJson(res, 'Failed to fetch topic performance');
}

export async function getEngagementTrend() {
  const res = await apiFetch('/analytics/engagement-trend');
  return handleJson(res, 'Failed to fetch engagement trend');
}

/* ---------- Syllabus matching (unchanged) ---------- */

export async function matchSyllabus(topicId, { text, file }) {
  const formData = new FormData();
  formData.append('topicId', topicId);
  if (text) formData.append('syllabusText', text);
  if (file) formData.append('syllabusFile', file);

  const res = await apiFetch('/syllabus/match', {
    method: 'POST',
    body: formData,
    skipAuth: true,
  });
  return handleJson(res, 'Failed to match syllabus');
}