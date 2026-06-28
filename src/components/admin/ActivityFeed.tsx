import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  MessageCircle, 
  ArrowUpRight, 
  Clock, 
  DollarSign,
  AlertCircle 
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ActivityItem {
  id: string;
  type: 'PAYMENT' | 'TICKET';
  status: string;
  user: string;
  createdAt: string;
  amount?: number;
  subject?: string;
}

interface Props {
  activities: ActivityItem[];
  isLoading: boolean;
}

export default function ActivityFeed({ activities, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-[2.5rem] border-gray-100 bg-white shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-8 py-6">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 leading-none">
            {t('Admin.analytics.activity.title')}
          </CardTitle>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1">
             {t('Admin.analytics.activity.subtitle')}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50">
          {t('Admin.analytics.activity.viewAll')}
          <ArrowUpRight size={14} className="ms-1" />
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-8">
        <div className="space-y-1">
          {activities.length > 0 ? (
            activities.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/50 transition-all duration-300"
              >
                <div className={`shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm border ${
                  item.type === 'PAYMENT' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {item.type === 'PAYMENT' ? <DollarSign size={18} /> : <MessageCircle size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-gray-900 truncate">
                      {item.type === 'PAYMENT' 
                        ? `${t('Admin.analytics.activity.payment')} (${item.amount} ${t('Admin.analytics.currencyInActivity')})` 
                        : item.subject || t('Admin.analytics.activity.ticket')}
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ms-2">
                       {(() => {
                         const date = parseISO(item.createdAt);
                         return isValid(date) ? format(date, 'HH:mm') : t('Common.justNow', 'Just now');
                       })()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                      {item.user}
                    </span>
                    <span className="text-[10px] text-gray-300">•</span>
                    <Badge variant="outline" className={`h-4 py-0 text-[8px] font-black border-none uppercase ${
                      item.status === 'PAID' ? 'text-emerald-500' : 
                      item.status === 'OPEN' ? 'text-blue-500' : 'text-amber-500'
                    }`}>
                      {item.status}
                    </Badge>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowUpRight size={14} className="text-gray-300" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
               <Clock size={32} className="mb-2 opacity-20" />
               <p className="text-xs font-bold uppercase tracking-widest">{t('Admin.analytics.revenueChart.noData')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
