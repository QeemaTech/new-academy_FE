import { useTranslation } from 'react-i18next';
import { hasPermission } from '../../lib/permissions';
import type { User } from '../../store/useAuthStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';

export interface QuickActionsCardProps {
  user: User | null;
}

export default function QuickActionsCard({ user }: QuickActionsCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="text-base font-extrabold text-foreground">{t('Admin.analytics.quickActionsTitle')}</div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {hasPermission(user, 'MANAGE_USERS') && (
            <Button variant="primary" className="w-full justify-center">
              {t('Admin.analytics.actionAddUser')}
            </Button>
          )}
          {hasPermission(user, 'VIEW_ANALYTICS') && (
            <Button variant="outline" className="w-full justify-center">
              {t('Admin.analytics.actionReports')}
            </Button>
          )}
          {hasPermission(user, 'MANAGE_CONTENT') && (
            <Button variant="outline" className="w-full justify-center">
              {t('Admin.analytics.actionPrograms')}
            </Button>
          )}
          {!hasPermission(user, 'MANAGE_USERS') &&
            !hasPermission(user, 'VIEW_ANALYTICS') &&
            !hasPermission(user, 'MANAGE_CONTENT') && (
              <p className="text-sm font-semibold text-muted-foreground">{t('Admin.analytics.noQuickActions')}</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

