import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/cn';

export type StatsTrend = 'up' | 'down' | 'neutral';

export type StatsCardColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface StatsCardProps {
  title: string;
  value: string;
  icon: ComponentType<any>;
  /** Tailwind classes for the small icon tile (e.g. `bg-blue-100 text-blue-600`). */
  iconBackgroundClass: string;
  /** Numeric change; sign is ignored — use `trend` for color. */
  changePercent?: number | null;
  trend?: StatsTrend;
  /** Shown when `changePercent` is null/undefined. */
  neutralLabel?: string;
  /** Optional GoKanary-style color mapping (falls back to `primary`). */
  color?: StatsCardColor;
  className?: string;
}

function formatChange(n: number, trend: StatsTrend) {
  const abs = Math.abs(n);
  const formatted = `${abs.toFixed(1)}%`;
  if (trend === 'up') return `↑ ${formatted}`;
  if (trend === 'down') return `↓ ${formatted}`;
  return formatted;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconBackgroundClass,
  changePercent,
  trend = 'neutral',
  neutralLabel = '—',
  color = 'primary',
  className,
}: StatsCardProps) {
  const showNumeric = changePercent != null && !Number.isNaN(changePercent);
  const effectiveTrend: StatsTrend =
    showNumeric && changePercent !== 0 ? (changePercent > 0 ? 'up' : 'down') : trend;

  const colorMap: Record<StatsCardColor, string> = {
    primary: 'text-primary-600 bg-primary-50 border-primary-100',
    success: 'text-green-600 bg-green-50 border-green-100',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-100',
    danger: 'text-red-600 bg-red-50 border-red-100',
    info: 'text-blue-600 bg-blue-50 border-blue-100',
  };

  const trendBadge =
    showNumeric && effectiveTrend !== 'neutral'
      ? {
          className: effectiveTrend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
          Icon: effectiveTrend === 'up' ? TrendingUp : TrendingDown,
          text: `${Math.abs(changePercent!)}%`,
        }
      : null;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group',
        className
      )}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className={cn('p-3 rounded-xl border transition-colors duration-300', colorMap[color], iconBackgroundClass)}>
          <Icon className="h-6 w-6" />
        </div>
        {trendBadge ? (
          <div className={cn('flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full', trendBadge.className)}>
            <trendBadge.Icon className="h-3 w-3" />
            {trendBadge.text}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
            {showNumeric ? formatChange(changePercent!, effectiveTrend) : neutralLabel}
          </div>
        )}
      </div>

      <div className="mt-5 relative z-10">
        <h3 className="text-gray-500 text-sm font-medium mb-1 tracking-wide">{title}</h3>
        <p className="text-3xl font-bold tracking-tight text-gray-900 leading-none">{value}</p>
      </div>

      {/* Decorative background icon (EXACT GoKanary markup) */}
      <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none rtl:left-0 rtl:right-auto">
        <Icon size={120} />
      </div>
    </motion.div>
  );
}
