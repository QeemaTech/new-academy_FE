/** One month bucket from `GET /api/analytics/revenue-chart` */
export interface RevenueChartRow {
  month: number; // 1–12
  revenue: number;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  activeSubscriptions: number;
  totalUsers: {
    parents: number;
    children: number;
    total: number;
  };
  pendingTickets: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}
