import { useTranslation } from 'react-i18next';
import type { TeacherTrackSummary } from '../types';

function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

/** Shows the price signals relevant to the track’s hybrid lifecycle. */
export function TrackPriceSnapshot({ track }: { track: Pick<TeacherTrackSummary, 'lifecycle' | 'price' | 'priceLive' | 'priceSelfPaced'> }) {
  const { t } = useTranslation();
  const { lifecycle, price, priceLive, priceSelfPaced } = track;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {lifecycle === 'LIVE_ENROLLMENT' && priceLive > 0 && (
        <span>
          <span className="font-semibold text-foreground">{t('Teacher.price.live', 'Live')}</span>{' '}
          {fmt(priceLive)}
        </span>
      )}
      {lifecycle === 'SELF_PACED' && priceSelfPaced > 0 && (
        <span>
          <span className="font-semibold text-foreground">{t('Teacher.price.selfPaced', 'Self-paced')}</span>{' '}
          {fmt(priceSelfPaced)}
        </span>
      )}
      {(lifecycle === 'CLOSED' || (lifecycle === 'LIVE_ENROLLMENT' && !priceLive)) &&
        price > 0 && (
          <span>
            <span className="font-semibold text-foreground">{t('Teacher.price.base', 'List')}</span> {fmt(price)}
          </span>
        )}
    </div>
  );
}
