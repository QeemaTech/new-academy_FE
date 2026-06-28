import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/** Normalized point for the bar chart (localized month label). */
export interface RevenueChartDatum {
  month: number;
  label: string;
  revenue: number;
}

interface Props {
  data: RevenueChartDatum[];
  /** Already translated, e.g. from `t('Common.currency')` */
  currency: string;
}

function formatAmount(value: number, lang: string) {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value);
}

const CHART_W = 920;
const CHART_H = 220;

export default function RevenueBarChart({ data, currency }: Props) {
  const { t, i18n } = useTranslation();

  const max = useMemo(() => Math.max(...data.map((d) => d.revenue), 1), [data]);

  const bars = useMemo(() => {
    const count = data.length || 1;
    const padX = 18;
    const padTop = 14;
    const padBottom = 26;
    const innerW = CHART_W - padX * 2;
    const innerH = CHART_H - padTop - padBottom;
    const gap = Math.max(10, innerW / (count * 6));
    const barW = (innerW - gap * (count - 1)) / count;
    return data.map((d, idx) => {
      const value = d.revenue;
      const ratio = max > 0 ? value / max : 0;
      const h = Math.round(innerH * ratio);
      const x = padX + idx * (barW + gap);
      const y = padTop + (innerH - h);
      return { ...d, x, y, w: barW, h };
    });
  }, [data, max]);

  return (
    <div dir="ltr" className="w-full">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        role="img"
        aria-label={t('Admin.analytics.revenueChart.title')}
        className="w-full"
      >
        <defs>
          <linearGradient id="revBar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5a8ff5" />
            <stop offset="100%" stopColor="#366dec" />
          </linearGradient>
        </defs>

        {/* Bars */}
        {bars.map((b) => {
          const tooltip = t('Admin.analytics.revenueChart.barTooltip', {
            amount: formatAmount(b.revenue, i18n.language),
            currency,
          });
          return (
            <g key={b.month}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={Math.max(b.h, b.revenue > 0 ? 6 : 0)}
                rx="10"
                fill="url(#revBar)"
              >
                <title>{tooltip}</title>
              </rect>
            </g>
          );
        })}

        {/* Axis baseline */}
        <line x1="16" y1={CHART_H - 22} x2={CHART_W - 16} y2={CHART_H - 22} stroke="rgba(54,109,236,0.18)" />
      </svg>

      <div className="mt-2 grid grid-cols-12 gap-2 border-t border-border pt-2">
        {data.map((d) => (
          <div key={`m-${d.month}`} className="col-span-1 text-center">
            <span className="block truncate text-[11px] font-semibold text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
