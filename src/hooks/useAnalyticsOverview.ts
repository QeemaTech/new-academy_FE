import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsOverview } from '../api/analytics';

export function useAnalyticsOverview(enabled: boolean) {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: fetchAnalyticsOverview,
    enabled,
    staleTime: 60_000,
  });
}
