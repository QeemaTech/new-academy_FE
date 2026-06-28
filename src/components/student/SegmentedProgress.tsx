import { cn } from '../../lib/cn';

type Props = {
  percent: number;
  segments?: number;
  className?: string;
};

/** Chunky “game level” bar — reads like filling segments on a progress bar. */
export function SegmentedProgress({ percent, segments = 10, className }: Props) {
  const filled = Math.round((Math.min(100, Math.max(0, percent)) / 100) * segments);
  return (
    <div className={cn('flex gap-1.5', className)} dir="ltr">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 flex-1 rounded-full border-2 border-slate-900/10 transition-all duration-500',
            i < filled
              ? 'bg-gradient-to-t from-[#4178EF] to-[#6BA3FF] shadow-[2px_2px_0_0_rgba(15,23,42,0.15)]'
              : 'bg-slate-200/80'
          )}
        />
      ))}
    </div>
  );
}
