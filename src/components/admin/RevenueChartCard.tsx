import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import RevenueBarChart from './RevenueBarChart';

export interface RevenueChartPoint {
  month: number;
  label: string;
  revenue: number;
}

export interface RevenueChartCardProps {
  currencyLabel: string;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data: RevenueChartPoint[];
  onRetry: () => void;
}

export default function RevenueChartCard({
  currencyLabel,
  isLoading,
  isError,
  isSuccess,
  data,
  onRetry,
}: RevenueChartCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold text-foreground">{t('Admin.analytics.revenueChart.title')}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('Admin.analytics.revenueChart.subtitle', { currency: currencyLabel })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid gap-3">
            <Skeleton className="h-56 w-full" />
            <div className="grid grid-cols-12 gap-2">
              {Array.from({ length: 12 }).map((_, idx) => (
                <Skeleton key={idx} className="h-3 w-full" />
              ))}
            </div>
          </div>
        )}

        {isError && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-destructive">{t('Admin.analytics.revenueChart.loadError')}</p>
            <Button variant="outline" onClick={onRetry}>
              {t('Common.retry')}
            </Button>
          </div>
        )}

        {isSuccess && data.length > 0 && <RevenueBarChart data={data} currency={currencyLabel} />}

        {isSuccess && data.length === 0 && (
          <p className="text-sm font-semibold text-muted-foreground">{t('Admin.analytics.revenueChart.noData')}</p>
        )}
      </CardContent>
    </Card>
  );
}

