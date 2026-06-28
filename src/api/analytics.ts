import { api } from '../lib/axios';
import type { AnalyticsOverview, ApiEnvelope, RevenueChartRow } from './types';

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await api.get<ApiEnvelope<AnalyticsOverview>>('/analytics/overview');
  return res.data.data;
}

export async function fetchRevenueChart(): Promise<RevenueChartRow[]> {
  const res = await api.get<ApiEnvelope<RevenueChartRow[]>>('/analytics/revenue-chart');
  return res.data.data;
}
