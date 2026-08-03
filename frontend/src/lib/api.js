import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCourses() {
  const res = await fetch(`${API_URL}/courses`);
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

export async function createCourse(payload) {
  const res = await fetch(`${API_URL}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create course');
  }
  return res.json();
}

export async function getTopics(courseSlug) {
  const res = await fetch(`${API_URL}/topics?courseSlug=${courseSlug}`);
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function createTopic(payload) {
  const res = await fetch(`${API_URL}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create topic');
  }
  return res.json();
}

export async function getResources(topicId, { search, matchStatus } = {}) {
  const params = new URLSearchParams({ topicId });
  if (search) params.append('search', search);
  if (matchStatus) params.append('matchStatus', matchStatus);
  const res = await fetch(`${API_URL}/resources?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch resources');
  return res.json();
}

export async function getResourceById(id) {
  const res = await fetch(`${API_URL}/resources/${id}`);
  if (!res.ok) throw new Error('Failed to fetch resource');
  return res.json();
}

export async function createResource(payload) {
  const res = await fetch(`${API_URL}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create resource');
  }
  return res.json();
}

export async function deleteResource(id) {
  const res = await fetch(`${API_URL}/resources/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete resource');
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Login failed');
  }
  return res.json();
}

export async function registerUser(payload) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Registration failed');
  }
  return res.json();
}

export async function getMyBookmarks() {
  const res = await fetch(`${API_URL}/bookmarks`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error('Failed to fetch bookmarks');
  return res.json();
}

export async function addBookmarkApi(resourceId) {
  const res = await fetch(`${API_URL}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ resourceId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to add bookmark');
  }
  return res.json();
}

export async function removeBookmarkApi(resourceId) {
  const res = await fetch(`${API_URL}/bookmarks/${resourceId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error('Failed to remove bookmark');
  return res.json();
}

export async function matchSyllabus(topicId, { text, file }) {
  const formData = new FormData();
  formData.append('topicId', topicId);
  if (text) formData.append('syllabusText', text);
  if (file) formData.append('syllabusFile', file);

  const res = await fetch(`${API_URL}/syllabus/match`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to match syllabus');
  }
  return res.json();
}