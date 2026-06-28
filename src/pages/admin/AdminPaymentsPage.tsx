import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Search,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Filter,
  ArrowUpRight,
  User,
  Package,
  Calendar,
  Layers,
  Receipt
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

import { api } from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const MotionTableRow = motion(TableRow as any);

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt: string | null;
  createdAt: string;
  gatewayName: string | null;
  gatewayOrderId: string | null;
  subscription?: {
    id: string;
    child: {
      fullName: string;
      username: string;
      parent: { fullName: string; email: string };
    };
    package: { name: string; level: string };
  };
  enrollments?: Array<{
    track: { title: string };
  }>;
}

export default function AdminPaymentsPage() {
  const { t, i18n } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/admin/payments');
      setPayments(res.data?.data || []);
    } catch {
      toast.error(t('Admin.paymentsPage.toast.fetchError'));
      setPayments([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/payments/${id}/status`, { status: newStatus });
      toast.success(t('Admin.paymentsPage.toast.updateSuccess'));
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
      if (selectedPayment?.id === id) {
        setSelectedPayment(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Admin.paymentsPage.toast.error'));
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const term = searchTerm.toLowerCase();
      const parentName = p.subscription?.child.parent.fullName.toLowerCase() || '';
      const childName = p.subscription?.child.fullName.toLowerCase() || '';
      return p.id.toLowerCase().includes(term) || parentName.includes(term) || childName.includes(term);
    });
  }, [payments, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1.5 px-3 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold">
            <CheckCircle2 size={12} />
            {t(`Admin.paymentsPage.status.${status}`)}
          </Badge>
        );
      case 'FAILED':
      case 'REFUNDED':
        return (
          <Badge className="bg-red-50 text-red-600 border-red-100 flex items-center gap-1.5 px-3 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold">
            <XCircle size={12} />
            {t(`Admin.paymentsPage.status.${status}`)}
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-1.5 px-3 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold">
            <Clock size={12} />
            {t(`Admin.paymentsPage.status.${status}`)}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      {/* Search & Actions Panel */}
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]" />
          <Input
            type="search"
            placeholder={t('Admin.common.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 ps-11 pe-4 text-sm focus:ring-2 focus:ring-[color:var(--color-primary-soft)] transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 w-12 rounded-2xl border-gray-100 bg-gray-50/50 text-gray-500"
            onClick={() => void fetchPayments(true)}
          >
            <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={18} />
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 px-5 text-gray-600 font-bold">
            <Filter size={16} className="me-2" />
            {t('Admin.common.filters')}
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <section className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-none hover:bg-gray-50/50">
              <TableHead className="px-6 py-5 uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.paymentsPage.table.invoice')}
              </TableHead>
              <TableHead className="px-6 py-5 uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.paymentsPage.table.parent')}
              </TableHead>
              <TableHead className="px-6 py-5 uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.paymentsPage.table.amount')}
              </TableHead>
              <TableHead className="px-6 py-5 text-center uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.paymentsPage.table.status')}
              </TableHead>
              <TableHead className="px-6 py-5 uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.paymentsPage.table.date')}
              </TableHead>
              <TableHead className="px-6 py-5 text-end uppercase tracking-widest text-[10px] font-bold text-gray-400">
                {t('Admin.paymentsPage.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredPayments.map((payment) => (
                <MotionTableRow
                  key={payment.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group hover:bg-gray-50/40 transition-colors"
                >
                  <TableCell className="px-6 py-5 font-mono text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[color:var(--color-primary)] transition-colors">
                        <Receipt size={14} />
                      </div>
                      #{payment.id.split('-')[0]}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 line-clamp-1">
                        {payment.subscription?.child.parent.fullName || 'Guest Payer'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                         Child: {payment.subscription?.child.fullName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-baseline gap-1" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                      <span className="text-base font-black text-gray-900">{payment.amount}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{payment.currency}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center">
                    <div className="flex justify-center">
                       {getStatusBadge(payment.status)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col text-xs font-medium text-gray-500">
                       <span className="flex items-center gap-1.5 leading-none mb-1">
                         <Calendar size={12} className="text-gray-300" />
                         {(() => {
                           const d = parseISO(payment.createdAt);
                           return isValid(d) ? format(d, 'dd MMM yyyy') : 'N/A';
                         })()}
                       </span>
                       <span className="text-[10px] text-gray-300 ms-4 leading-none">
                         {(() => {
                           const d = parseISO(payment.createdAt);
                           return isValid(d) ? format(d, 'HH:mm') : '--:--';
                         })()}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-xl px-4 text-xs font-bold text-gray-400 hover:bg-[color:var(--color-primary-soft)] hover:text-[color:var(--color-primary)] transition-all"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      {t('Admin.common.view')}
                      <ArrowUpRight size={14} className="ms-1.5" />
                    </Button>
                  </TableCell>
                </MotionTableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </section>

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-[2.5rem] border-none p-0 shadow-2xl">
          {selectedPayment && (
            <>
              <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-7">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]">
                        <CreditCard size={26} />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold">{t('Admin.paymentsPage.details.title')}</DialogTitle>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {t('Admin.paymentsPage.details.refLabel')}: #{selectedPayment.id}
                        </p>
                      </div>
                   </div>
                   <div className="me-6">
                      {getStatusBadge(selectedPayment.status)}
                   </div>
                </div>
              </DialogHeader>

              <div className="p-8 space-y-8">
                 {/* Main Financial Card */}
                 <div className="flex flex-col items-center justify-center rounded-[2rem] bg-gray-900 p-8 text-white shadow-xl shadow-gray-200">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                      {t('Admin.paymentsPage.details.totalAmount')}
                    </span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black">{selectedPayment.amount}</span>
                       <span className="text-xs font-bold text-gray-500 uppercase">{selectedPayment.currency}</span>
                    </div>
                    <div className="mt-6 grid w-full grid-cols-2 gap-4 border-t border-gray-800 pt-6">
                       <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase text-gray-500 mb-1">{t('Admin.paymentsPage.details.gateway')}</span>
                          <span className="text-sm font-bold">
                            {selectedPayment.gatewayName || t('Admin.paymentsPage.details.manualVerification')}
                          </span>
                       </div>
                       <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold uppercase text-gray-500 mb-1">{t('Admin.paymentsPage.details.orderId')}</span>
                          <span className="text-sm font-mono truncate max-w-full italic">
                            {selectedPayment.gatewayOrderId || t('Common.none')}
                          </span>
                       </div>
                    </div>
                 </div>

                 {/* Linked Entity Details */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4 rounded-3xl border border-gray-50 bg-gray-50/30 p-5">
                       <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                         <User size={12} className="text-[color:var(--color-primary)]" />
                         {t('Admin.paymentsPage.details.child')}
                       </h4>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{selectedPayment.subscription?.child.fullName}</span>
                          <span className="text-xs font-medium text-gray-500">@{selectedPayment.subscription?.child.username}</span>
                       </div>
                    </div>
                    <div className="space-y-4 rounded-3xl border border-gray-50 bg-gray-50/30 p-5">
                       <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                         <Package size={12} className="text-[color:var(--color-primary)]" />
                         {t('Admin.paymentsPage.details.package')}
                       </h4>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{selectedPayment.subscription?.package.name}</span>
                          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider inline-flex items-center gap-1">
                             <Layers size={10} />
                             {selectedPayment.subscription?.package.level}
                          </span>
                       </div>
                    </div>
                 </div>

                 {/* Administrative Actions */}
                 <div className="space-y-4 pt-4">
                    <label className="ms-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t('Admin.paymentsPage.details.adminStatusOverride')}
                    </label>
                    <div className="flex items-center gap-3">
                       <Select 
                         value={selectedPayment.status} 
                         onValueChange={(val) => void handleStatusChange(selectedPayment.id, val)}
                       >
                         <SelectTrigger className="h-14 flex-1 rounded-2xl border-gray-100 bg-gray-50/50 font-black shadow-inner">
                           <SelectValue placeholder={t('Admin.paymentsPage.details.statusPlaceholder')} />
                         </SelectTrigger>
                         <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                           <SelectItem value="PAID" className="text-emerald-600 font-bold p-3 rounded-xl">{t('Admin.paymentsPage.status.PAID')}</SelectItem>
                           <SelectItem value="PENDING" className="text-amber-600 font-bold p-3 rounded-xl">{t('Admin.paymentsPage.status.PENDING')}</SelectItem>
                           <SelectItem value="FAILED" className="text-red-600 font-bold p-3 rounded-xl">{t('Admin.paymentsPage.status.FAILED')}</SelectItem>
                           <SelectItem value="REFUNDED" className="text-gray-600 font-bold p-3 rounded-xl">{t('Admin.paymentsPage.status.REFUNDED')}</SelectItem>
                         </SelectContent>
                       </Select>
                       <Button variant="outline" className="h-14 w-14 rounded-2xl border-gray-100 bg-gray-50/50 text-gray-400">
                          <ExternalLink size={20} />
                       </Button>
                    </div>
                    <p className="px-2 text-[10px] font-semibold text-gray-400 italic">
                       * {t('Admin.paymentsPage.details.paidActivatesNote')}
                    </p>
                 </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
