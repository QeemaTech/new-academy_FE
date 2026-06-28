import { useTranslation } from 'react-i18next';
import { Ticket, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export interface QuickStatsListProps {
  canAnalytics: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  pendingTickets?: number;
  registeredUsersTotal?: number;
}

export default function QuickStatsList({
  canAnalytics,
  isLoading,
  isSuccess,
  pendingTickets,
  registeredUsersTotal,
}: QuickStatsListProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="text-base font-extrabold text-foreground">{t('Admin.analytics.quickInsightsTitle')}</div>
      </CardHeader>
      <CardContent>
        {canAnalytics && isSuccess ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Ticket className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-foreground">{t('Admin.analytics.openTicketsTitle')}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{t('Admin.analytics.openTicketsHint')}</div>
                </div>
              </div>
              <div className="text-xl font-extrabold text-foreground">{pendingTickets ?? 0}</div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-foreground">{t('Admin.analytics.registeredUsersTitle')}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{t('Admin.analytics.registeredUsersHint')}</div>
                </div>
              </div>
              <div className="text-xl font-extrabold text-foreground">{registeredUsersTotal ?? 0}</div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="grid gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

