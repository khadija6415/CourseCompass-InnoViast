export default function CompassMark({ className = 'w-6 h-6', color = 'var(--brass)' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" stroke={color} strokeWidth="1.2" />
      <line x1="20" y1="4" x2="20" y2="9" stroke={color} strokeWidth="1.2" />
      <line x1="20" y1="31" x2="20" y2="36" stroke={color} strokeWidth="1.2" />
      <line x1="4" y1="20" x2="9" y2="20" stroke={color} strokeWidth="1.2" />
      <line x1="31" y1="20" x2="36" y2="20" stroke={color} strokeWidth="1.2" />
      <path d="M20 10 L23 20 L20 30 L17 20 Z" fill={color} opacity="0.9" />
    </svg>
  );
}