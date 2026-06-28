import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  Wallet, 
  Ticket,
  ChevronRight,
  Filter,
  RefreshCcw
} from 'lucide-react';

import { api } from '../../lib/axios';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '../../components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

/**
 * 📊 Mock Data Hub
 */
const FINANCIAL_DATA = [
  { month: 'يناير', revenue: 15400, expected: 12000 },
  { month: 'فبراير', revenue: 18900, expected: 14000 },
  { month: 'مارس', revenue: 22100, expected: 18000 },
  { month: 'أبريل', revenue: 19800, expected: 20000 },
  { month: 'مايو', revenue: 25400, expected: 22000 },
  { month: 'يونيو', revenue: 31200, expected: 25000 },
];

const ENROLLMENT_DATA = [
  { track: 'بايثون', count: 124, completions: 85 },
  { track: 'تصميم', count: 98, completions: 60 },
  { track: 'روبوتات', count: 145, completions: 92 },
  { track: 'أردوينو', count: 67, completions: 45 },
  { track: 'سكراتش', count: 189, completions: 156 },
];

const TICKET_DISTRIBUTION = [
  { name: 'مفتوحة', value: 12, color: '#f59e0b' },
  { name: 'قيد المتابعة', value: 24, color: '#3b82f6' },
  { name: 'مغلقة', value: 85, color: '#10b981' },
];

const TRANSACTIONS = [
  { id: 'TX-001', student: 'محمد علي', amount: 1500, package: 'بريميوم', date: '2026-04-15', status: 'PAID' },
  { id: 'TX-002', student: 'سارة خالد', amount: 800, package: 'أساسي', date: '2026-04-14', status: 'PAID' },
  { id: 'TX-003', student: 'أحمد سعيد', amount: 1200, package: 'متقدم', date: '2026-04-12', status: 'PENDING' },
  { id: 'TX-004', student: 'ليلى منصور', amount: 1500, package: 'بريميوم', date: '2026-04-10', status: 'PAID' },
];

/**
 * 🛠️ CSV Export Utility
 */
const downloadCSV = (data: any[], fileName: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const body = data
    .map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(',')
    )
    .join('\n');

  const csvContent = `\uFEFF${headers}\n${body}`; 
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AdminReports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('financials');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/analytics/reports', {
        params: {
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined
        }
      });
      setData(response.data?.data);
    } catch {
      // toast.error('Failed to load analytical data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const handleExport = () => {
    if (!data) return;
    let dataToExport: any[] = [];
    let fileName = `report-${activeTab}`;

    if (activeTab === 'financials') dataToExport = data.financials?.transactions || [];
    else if (activeTab === 'academics') dataToExport = data.academics?.enrollments || [];
    else if (activeTab === 'operations') dataToExport = data.operations?.tickets || [];

    downloadCSV(dataToExport, fileName);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 📁 Header & Action Bar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            {t('Reports.title')}
          </h1>
          <p className="mt-2 font-medium text-gray-400">
            {t('Reports.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
            <div className="flex items-center gap-2 px-3">
              <Calendar size={16} className="text-gray-400" />
              <input 
                type="date" 
                className="bg-transparent text-xs font-bold text-gray-600 outline-none"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div className="h-4 w-px bg-gray-100" />
            <div className="flex items-center gap-2 px-3">
              <input 
                type="date" 
                className="bg-transparent text-xs font-bold text-gray-600 outline-none"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
          
          <Button 
            className="h-12 rounded-2xl bg-[#00AEEF] hover:bg-[#008dbf] text-white font-bold px-6 shadow-lg shadow-blue-100 transition-all hover:translate-y-[-2px]"
            onClick={handleExport}
          >
            <Download size={18} className="me-2" />
            {t('Reports.export')}
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="financials" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8 inline-flex h-14 w-auto items-center justify-center rounded-3xl bg-gray-100/50 p-1.5 backdrop-blur-sm">
          <TabsTrigger value="financials" className="rounded-2xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('Reports.tabFinancials')}
          </TabsTrigger>
          <TabsTrigger value="academics" className="rounded-2xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('Reports.tabAcademics')}
          </TabsTrigger>
          <TabsTrigger value="operations" className="rounded-2xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('Reports.tabOperations')}
          </TabsTrigger>
        </TabsList>

        {/* 💰 Financials Tab */}
        <TabsContent value="financials" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 overflow-hidden rounded-[2.5rem] border-none bg-white shadow-sm ring-1 ring-gray-100">
              <CardHeader className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">نمو الإيرادات</CardTitle>
                    <CardDescription>مقارنة الدخل الفعلي مقابل المتوقع</CardDescription>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                    <Wallet size={24} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {loading ? (
                   <div className="h-[300px] w-full flex flex-col gap-4">
                      <div className="flex-1 flex gap-2 items-end">
                         {Array(12).fill(0).map((_, i) => (
                           <Skeleton key={i} className="w-full" style={{ height: `${Math.random() * 80 + 20}%` }} />
                         ))}
                      </div>
                      <div className="h-4 w-full flex gap-2">
                        {Array(12).fill(0).map((_, i) => (
                           <Skeleton key={i} className="flex-1 h-full" />
                         ))}
                      </div>
                   </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data?.financials?.revenueTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="expected" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="space-y-8">
               <Card className="overflow-hidden rounded-[2rem] border-none bg-emerald-600 text-white shadow-lg shadow-emerald-100">
                  <CardContent className="p-8">
                     <div className="flex items-center justify-between mb-6">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-100">إجمالي دخل الشهر</p>
                        <TrendingUp size={20} />
                     </div>
                     {loading ? (
                        <Skeleton className="h-10 w-32 bg-white/20" />
                     ) : (
                        <p className="text-4xl font-black">{data?.financials?.revenueTrend?.find((m: any) => m.month === 'يونيو')?.revenue || 0} ر.س</p>
                     )}
                     <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-100">
                        <span className="rounded-full bg-emerald-500/30 px-2 py-0.5">+12.5%</span>
                        عن الشهر الماضي
                     </div>
                  </CardContent>
               </Card>
               
               <Card className="overflow-hidden rounded-[2rem] border-none bg-white shadow-sm ring-1 ring-gray-100">
                   <CardContent className="p-6">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400">توزيع الباقات</span>
                            <ChevronRight size={16} className="text-gray-300" />
                         </div>
                         {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-8 w-full rounded-xl" />) : [
                           { name: 'بريميوم', p: 65, c: 'bg-blue-500' },
                           { name: 'متقدم', p: 25, c: 'bg-emerald-500' },
                           { name: 'أساسي', p: 10, c: 'bg-amber-500' }
                         ].map(b => (
                           <div key={b.name} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                                 <span className="text-gray-600">{b.name}</span>
                                 <span>{b.p}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-gray-50 overflow-hidden">
                                 <div className={`h-full ${b.c}`} style={{ width: `${b.p}%` }}></div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </CardContent>
               </Card>
            </div>
          </div>

          <Card className="rounded-[2.5rem] border-none bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
             <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black">سجل المعاملات الأخير</CardTitle>
                <CardDescription>تفاصيل الدفعات والطلاب المسجلين</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
               <Table>
                 <TableHeader>
                   <TableRow className="border-b border-gray-50 hover:bg-transparent">
                     <TableHead className="px-8 font-black uppercase tracking-widest text-[10px] text-gray-400">الرقم</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400">الطالب</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400">الباقة</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400">المبلغ</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400">التاريخ</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] text-gray-400 text-end pe-8">الحالة</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {loading ? (
                     [1,2,3,4].map(i => (
                       <TableRow key={i}>
                         {Array(6).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                       </TableRow>
                     ))
                   ) : (data?.financials?.transactions || []).map((tx: any) => (
                     <TableRow key={tx.id} className="hover:bg-gray-50/50 border-b border-gray-50/50">
                       <TableCell className="px-8 font-bold text-[10px] text-gray-400 tracking-wider">{tx.id}</TableCell>
                       <TableCell className="font-black text-gray-900">{tx.student}</TableCell>
                       <TableCell className="font-bold text-gray-600">{tx.package}</TableCell>
                       <TableCell className="font-black text-emerald-600">{tx.amount} ر.س</TableCell>
                       <TableCell className="font-bold text-gray-400 text-xs">{tx.date}</TableCell>
                       <TableCell className="pe-8 text-end">
                          <Badge className={tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}>
                            {tx.status === 'PAID' ? 'مدفوع' : 'معلق'}
                          </Badge>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
          </Card>
        </TabsContent>

        {/* 🎓 Academics Tab */}
        <TabsContent value="academics" className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] border-none bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
                 <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black">شعبية المسارات</CardTitle>
                    <CardDescription>عدد الطلاب المسجلين في كل مسار تعليمي</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-0">
                    {loading ? (
                       <Skeleton className="h-[300px] w-full rounded-2xl" />
                    ) : (
                       <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data?.academics?.enrollments || []}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="track" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                             <Tooltip 
                               cursor={{ fill: '#f8fafc' }}
                               contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                             />
                             <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                          </BarChart>
                       </ResponsiveContainer>
                    )}
                 </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
                 <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black">نسبة الإنجاز</CardTitle>
                    <CardDescription>الطلاب الذين أكملوا المسارات بنجاح</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-0">
                    {loading ? (
                       <Skeleton className="h-[300px] w-full rounded-2xl" />
                    ) : (
                       <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data?.academics?.performance || []} layout="vertical">
                             <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                             <XAxis type="number" hide />
                             <YAxis dataKey="track" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                             <Tooltip 
                               cursor={{ fill: '#f8fafc' }}
                               contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                             />
                             <Bar dataKey="avgScore" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={30} />
                          </BarChart>
                       </ResponsiveContainer>
                    )}
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        {/* ⚙️ Operations Tab */}
        <TabsContent value="operations" className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] border-none bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
                 <CardHeader className="p-8 text-center lg:text-start">
                    <CardTitle className="text-xl font-black">حالة تذاكر الدعم</CardTitle>
                    <CardDescription>توزيع تذاكر الدعم الفني حسب الحالة</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-0">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                       {loading ? (
                          <Skeleton className="size-[250px] rounded-full" />
                       ) : (
                          <ResponsiveContainer width="100%" height={250}>
                             <PieChart>
                                <Pie
                                   data={data?.operations?.tickets || []}
                                   innerRadius={70}
                                   outerRadius={100}
                                   paddingAngle={8}
                                   dataKey="value"
                                >
                                   {(data?.operations?.tickets || []).map((entry: any, index: any) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                             </PieChart>
                          </ResponsiveContainer>
                       )}
                       
                       <div className="w-full space-y-4">
                          {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-14 w-full rounded-2xl" />) : (data?.operations?.tickets || []).map((t: any) => (
                            <div key={t.name} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50">
                               <div className="flex items-center gap-3">
                                  <div className="size-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                                  <span className="text-sm font-bold text-gray-700">{t.name}</span>
                               </div>
                               <span className="font-black text-gray-900">{t.value}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full">
                 <Card className="rounded-[2.5rem] border-none bg-[#00AEEF]/5 shadow-none border border-[#00AEEF]/10">
                    <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                       <div className="size-16 rounded-3xl bg-blue-100/50 text-[#00AEEF] flex items-center justify-center mb-6">
                          <Users size={32} />
                       </div>
                       <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">الطلاب النشطون</p>
                       {loading ? <Skeleton className="h-12 w-20" /> : <p className="text-5xl font-black text-[#00AEEF]">{data?.operations?.engagement?.active || 0}</p>}
                    </CardContent>
                 </Card>

                 <Card className="rounded-[2.5rem] border-none bg-emerald-50 shadow-none border border-emerald-100">
                    <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                       <div className="size-16 rounded-3xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center mb-6">
                          <Filter size={32} />
                       </div>
                       <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">الطلاب غير النشطين</p>
                       {loading ? <Skeleton className="h-12 w-20" /> : <p className="text-5xl font-black text-emerald-600">{data?.operations?.engagement?.inactive || 0}</p>}
                    </CardContent>
                 </Card>
                 
                 <Card className="sm:col-span-2 rounded-[2.5rem] border-none bg-gray-900 shadow-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-transparent opacity-50"></div>
                    <CardContent className="p-10 relative z-10 flex flex-col items-center justify-center text-center">
                       <Ticket size={40} className="text-amber-500 mb-6" />
                       <p className="text-xl font-black text-white mb-2">إجمالي المسجلين</p>
                       {loading ? <Skeleton className="h-10 w-32 bg-white/20" /> : <p className="text-4xl font-black text-amber-500">{data?.operations?.engagement?.total || 0} طالب</p>}
                    </CardContent>
                 </Card>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
