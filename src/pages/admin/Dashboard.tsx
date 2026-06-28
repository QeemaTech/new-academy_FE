import { useMemo, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, 
  Users, 
  Ticket, 
  Award,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Shield,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../store/useAuthStore';
import { hasPermission } from '../../lib/permissions';
import { api } from '../../lib/axios';
import { StatsCard } from '../../components/dashboard';
import RevenueAreaChart from '../../components/admin/RevenueAreaChart';
import ActivityFeed from '../../components/admin/ActivityFeed';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

interface DashboardData {
  totalUsers: number;
  totalChildren: number;
  activeSubscriptions: number;
  revenueThisMonth: number;
  pendingTickets: number;
  pendingProjects: number;
  recentActivity?: any[];
}

interface ChartData {
  month: number;
  revenue: number;
}

import { useNavigate } from 'react-router-dom';
import { getDefaultAdminRoute } from '../../lib/adminRedirect';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canAnalytics = hasPermission(user, 'VIEW_ANALYTICS');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSmartRedirect = () => {
    navigate(getDefaultAdminRoute(user));
  };

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [sumRes, ovRes, chartRes] = await Promise.all([
        api.get('/admin/analytics/summary'),
        api.get('/admin/analytics/overview'), // Still needed for activity feed
        api.get('/admin/analytics/revenue-chart')
      ]);
      
      setData({
        ...sumRes.data?.data,
        recentActivity: ovRes.data?.data?.recentActivity || []
      });
      setChartData(chartRes.data?.data || []);
    } catch (err: any) {
      console.error('Dashboard Fetch Error:', err);
      toast.error(t('Admin.analytics.loadError'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    if (canAnalytics) void fetchDashboardData();
  }, [canAnalytics, fetchDashboardData]);

  const currencyLabel = t('Common.currency');

  const formattedChartData = useMemo(() => {
    return chartData.map((d) => ({
      ...d,
      label: t(`Months.short.${d.month}`),
    }));
  }, [chartData, t]);

  if (!canAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-12 text-center rounded-[3.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner mb-6">
           <Shield size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {t('Admin.analytics.noPermission', 'لا تملك صلاحية الوصول للتحليلات')}
        </h2>
        <p className="text-slate-400 font-medium mt-3 max-w-sm leading-relaxed">
          {t('Admin.analytics.noPermissionHint', 'تم تقييد وصولك للوحة البيانات المالية. يمكنك متابعة مهامك من خلال مساحة العمل الخاصة بك.')}
        </p>
        
        <button
          onClick={handleSmartRedirect}
          className="mt-10 flex items-center gap-3 px-10 py-5 bg-slate-900 text-white font-black text-sm rounded-[1.5rem] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
        >
          <LayoutGrid size={20} className="group-hover:rotate-12 transition-transform" />
          {t('Admin.analytics.goToWorkspace', 'الذهاب إلى مساحة العمل الخاصة بي')}
          <ArrowRight size={18} className="rtl:rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 duration-700">
      {/* 🚀 Header & Main Search */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            {t('Admin.analytics.pageTitle')}
          </h1>
          <p className="mt-2 font-medium text-gray-400">
             {t('Admin.analytics.pageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="group relative">
              <Search className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-gray-300 size-4 transition-colors group-focus-within:text-blue-500" />
              <input 
                 className="h-12 w-64 rounded-2xl bg-white border border-gray-100 ps-10 pe-4 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                 placeholder={t('Admin.analytics.dashboardSearchPlaceholder')}
                 aria-label={t('Admin.analytics.dashboardSearchPlaceholder')}
              />
           </div>
           <Button
              variant="outline"
              className="h-12 w-12 rounded-2xl border-gray-100 bg-white shadow-sm"
              onClick={() => void fetchDashboardData(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={18} />
            </Button>
        </div>
      </div>

      {/* 📊 KPI Dashboard Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-3xl" />)
         ) : (
           <>
             <StatsCard 
               title={t('Admin.analytics.stats.revenue')}
               value={`${new Intl.NumberFormat(i18n.language).format(data?.revenueThisMonth || 0)} ${currencyLabel}`}
               icon={DollarSign}
               iconBackgroundClass="bg-emerald-50 text-emerald-600 border-emerald-100"
               changePercent={12.4}
               trend="up"
               color="success"
             />
             <StatsCard 
               title={t('Admin.analytics.stats.activeStudents')}
               value={String(data?.totalChildren || 0)}
               icon={Users}
               iconBackgroundClass="bg-blue-50 text-blue-600 border-blue-100"
               changePercent={5.2}
               trend="up"
               color="info"
             />
             <StatsCard 
               title={t('Admin.analytics.stats.pendingTickets')}
               value={String((data?.pendingTickets || 0) + (data?.pendingProjects || 0))}
               icon={Ticket}
               iconBackgroundClass="bg-amber-50 text-amber-600 border-amber-100"
               changePercent={-2.1}
               trend="down"
               color="warning"
             />
             <StatsCard 
               title={t('Admin.analytics.stats.activePackages')}
               value={String(data?.activeSubscriptions || 0)}
               icon={Award}
               iconBackgroundClass="bg-purple-50 text-purple-600 border-purple-100"
               changePercent={0}
               trend="neutral"
               color="primary"
             />
           </>
         )}
      </div>

      {/* 📈 Visualization Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Chart Section */}
         <Card className="lg:col-span-2 rounded-[2.5rem] border-gray-100 bg-white shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-xl font-black text-gray-900">{t('Admin.analytics.revenueChart.title')}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                    {t('Admin.analytics.growthChartPeriod', { currency: currencyLabel })}
                  </p>
               </div>
               <div className="flex h-10 items-center gap-1 rounded-xl bg-gray-50 p-1">
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-3 bg-white shadow-sm border border-gray-100">{t('Admin.analytics.monthly')}</Button>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-3 text-gray-400">{t('Admin.analytics.quarterly')}</Button>
               </div>
            </div>
            {loading ? <Skeleton className="h-72 w-full rounded-2xl" /> : <RevenueAreaChart data={formattedChartData} currency={currencyLabel} />}
         </Card>

         {/* Operation Pulse */}
         <div className="lg:col-span-1">
            {loading ? <Skeleton className="h-[28rem] rounded-[2.5rem]" /> : <ActivityFeed activities={data?.recentActivity || []} isLoading={loading} />}
         </div>
      </div>

    </div>
  );
}
