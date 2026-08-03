const statusConfig = {
  missing: { color: 'var(--rust)', label: 'Missing concept', needle: { x: 43.7, y: 67.5 } },
  extra: { color: 'var(--brass)', label: 'Extra content', needle: { x: 100, y: 35 } },
  match: { color: 'var(--verdigris)', label: 'Syllabus match', needle: { x: 156.3, y: 67.5 } },
};

export default function MatchGauge({ status }) {
  const config = statusConfig[status] || statusConfig.extra;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 115" className="w-56 h-32">
        <path d="M 20 100 A 80 80 0 0 1 60 30.7" stroke="var(--rust)" strokeWidth="10" fill="none" strokeLinecap="round" opacity={status === 'missing' ? 1 : 0.25} />
        <path d="M 60 30.7 A 80 80 0 0 1 140 30.7" stroke="var(--brass)" strokeWidth="10" fill="none" strokeLinecap="round" opacity={status === 'extra' ? 1 : 0.25} />
        <path d="M 140 30.7 A 80 80 0 0 1 180 100" stroke="var(--verdigris)" strokeWidth="10" fill="none" strokeLinecap="round" opacity={status === 'match' ? 1 : 0.25} />
        <line x1="100" y1="100" x2={config.needle.x} y2={config.needle.y} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="100" cy="100" r="6" fill="var(--ink)" />
      </svg>
      <p style={{ fontFamily: 'var(--font-mono)', color: config.color }} className="text-xs uppercase tracking-[0.15em] font-medium -mt-2">
        {config.label}
      </p>
    </div>
  );
}