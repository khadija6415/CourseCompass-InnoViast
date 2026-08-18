'use client';

import { useState, useEffect } from 'react';
import { getReviewsForResource, addOrUpdateReview, getMyReviewForResource, deleteReview } from '@/lib/api';
import { getUser } from '@/lib/auth';
import StarRating from './StarRating';

export default function ReviewsSection({ resourceId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReviews();
    if (getUser()) {
      getMyReviewForResource(resourceId)
        .then((review) => {
          if (review) {
            setMyReview(review);
            setFormRating(review.rating);
            setFormComment(review.comment || '');
          }
        })
        .catch(() => {});
    }
  }, [resourceId]);

  async function loadReviews() {
    try {
      setLoading(true);
      const data = await getReviewsForResource(resourceId);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setCount(data.count);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formRating === 0) return;
    setSubmitting(true);
    try {
      const review = await addOrUpdateReview(resourceId, formRating, formComment);
      setMyReview(review);
      setShowForm(false);
      await loadReviews();
    } catch (err) {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!myReview) return;
    setSubmitting(true);
    try {
      await deleteReview(myReview._id);
      setMyReview(null);
      setFormRating(0);
      setFormComment('');
      await loadReviews();
    } catch (err) {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  function handleRequireLogin() {
    if (!getUser()) {
      window.location.href = '/login';
      return true;
    }
    return false;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink)]">
          Ratings & Reviews
        </p>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} size="sm" />
            <span style={{ fontFamily: 'var(--font-mono)' }} className="text-xs text-[var(--slate)]">
              {averageRating} ({count})
            </span>
          </div>
        )}
      </div>

      {!showForm && (
        <button
          onClick={() => {
            if (handleRequireLogin()) return;
            setShowForm(true);
          }}
          style={{ fontFamily: 'var(--font-mono)' }}
          className="text-xs text-[var(--brass)] hover:underline mb-3"
        >
          {myReview ? 'Edit your review' : '+ Write a review'}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/60 border border-black/10 rounded-xl p-4 mb-4">
          <div className="mb-3">
            <StarRating rating={formRating} size="lg" interactive onChange={setFormRating} />
          </div>
          <textarea
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder="Share your thoughts (optional)"
            rows={3}
            className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brass)] mb-3"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={formRating === 0 || submitting}
              style={{ fontFamily: 'var(--font-mono)' }}
              className="flex-1 bg-[var(--brass)] text-[var(--ink)] rounded-lg py-2 text-xs uppercase tracking-wide font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {submitting ? 'Saving...' : 'Save review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 text-xs text-[var(--slate)] hover:text-[var(--ink)] transition-colors"
            >
              Cancel
            </button>
            {myReview && (
              <button type="button" onClick={handleDelete} disabled={submitting} className="px-4 text-xs text-[var(--rust)] hover:underline">
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {loading && <p className="text-xs text-[var(--slate)]">Loading reviews...</p>}
      {!loading && reviews.length === 0 && (
        <p className="text-xs text-[var(--slate)] italic">No reviews yet. Be the first to share your thoughts.</p>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="border-b border-black/5 pb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--ink)]">{r.user?.name || 'Anonymous'}</span>
              <StarRating rating={r.rating} size="sm" />
            </div>
            {r.comment && <p className="text-xs text-[var(--slate)]">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}