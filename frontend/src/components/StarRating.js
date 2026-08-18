'use client';

export default function StarRating({ rating, size = 'md', interactive = false, onChange }) {
  const sizeClasses = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`inline-flex gap-0.5 ${sizeClasses[size]}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          style={{
            color: star <= Math.round(rating) ? 'var(--brass)' : 'var(--slate)',
            opacity: star <= Math.round(rating) ? 1 : 0.3,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}