import { useId } from 'react';
import { cn } from '../../lib/cn';

type Props = {
  percent: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
  /** Stroke color for progress arc (default brand blue) */
  strokeColor?: string;
  /** Track ring color class */
  trackClassName?: string;
};

/** Thick colorful ring — gamified XP / level style. */
export function ProgressRing({
  percent,
  size = 88,
  stroke = 8,
  className,
  label,
  strokeColor = '#4178EF',
  trackClassName = 'text-[#4178EF]/12',
}: Props) {
  const uid = useId().replace(/:/g, '');
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  const gradId = `rg-${uid}`;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform drop-shadow-sm">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} />
            <stop offset="100%" stopColor="#6BA3FF" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-black tabular-nums text-slate-800">{Math.round(percent)}%</span>
        {label ? <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span> : null}
      </div>
    </div>
  );
}
