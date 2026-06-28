import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/** Normalized point for the chart. */
export interface RevenueChartPoint {
  month: number;
  label: string;
  revenue: number;
}

interface Props {
  data: RevenueChartPoint[];
  currency: string;
}

export default function RevenueAreaChart({ data, currency }: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <p className="text-lg font-black text-gray-900">
            {new Intl.NumberFormat(i18n.language).format(payload[0].value)}
            <span className="text-[10px] ms-1 text-gray-400">{currency}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] mt-4" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: isRTL ? 40 : 10,
            left: isRTL ? 10 : 40,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            dy={10}
            orientation="bottom"
          />
          <YAxis 
            hide={true} // Cleaner "Command Center" look, data shown in tooltips
            orientation={isRTL ? 'right' : 'left'}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-primary)"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
