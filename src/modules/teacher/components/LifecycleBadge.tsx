import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/badge';
import type { TrackLifecycle } from '../types';

const variantFor: Record<TrackLifecycle, 'primary' | 'success' | 'outline' | 'warning'> = {
  LIVE_ENROLLMENT: 'primary',
  SELF_PACED: 'success',
  CLOSED: 'outline',
};

export function LifecycleBadge({ lifecycle }: { lifecycle: TrackLifecycle }) {
  const { t } = useTranslation();
  return (
    <Badge variant={variantFor[lifecycle]} className="shrink-0 font-semibold capitalize">
      {t(`Teacher.lifecycle.${lifecycle}`, lifecycle.replace(/_/g, ' '))}
    </Badge>
  );
}
