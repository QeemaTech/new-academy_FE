import { useQuery } from '@tanstack/react-query';
import { fetchRevenueChart } from '../api/analytics';

export function useRevenueChart(enabled: boolean) {
  return useQuery({
    queryKey: ['analytics', 'revenue-chart'],
    queryFn: fetchRevenueChart,
    enabled,
    staleTime: 60_000,
  });
}
