import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Ticket,
  Search,
  Edit2,
  Trash2,
  Plus,
  RefreshCcw,
  Tag,
  Calendar,
  Users
} from 'lucide-react';

import { api } from '../../lib/axios';
import type { Coupon } from '../../types/academy';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const MotionTableRow = motion(TableRow as any);

function CouponsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex h-11 w-full animate-pulse rounded-xl bg-gray-100" />
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex h-16 animate-pulse items-center gap-4 border-b border-gray-50 px-6">
            <div className="h-10 w-32 rounded-lg bg-gray-100" />
            <div className="h-6 w-48 rounded-lg bg-gray-50" />
            <div className="h-6 w-16 rounded-lg bg-gray-50 ml-auto" />
            <div className="h-6 w-24 rounded-lg bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCoupons = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get('/admin/coupons');
      const raw = response.data?.data?.coupons ?? response.data?.coupons ?? response.data?.data ?? response.data ?? [];
      const arr = Array.isArray(raw) ? raw : [];
      setCoupons(arr);
    } catch {
      toast.error(t('Admin.couponsPage.toast.fetchError', 'Failed to fetch coupons'));
      setCoupons([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('Admin.categoriesPage.confirmDelete', 'Are you sure you want to delete this coupon?'))) return;
    
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success(t('Admin.common.deleteSuccess', 'Coupon deleted successfully'));
      void fetchCoupons(true);
    } catch {
      toast.error(t('Admin.common.deleteError', 'Failed to delete coupon'));
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const payload = { isActive: !currentStatus };
    const original = [...coupons];
    
    // Optimistic Update
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    
    try {
      await api.patch(`/admin/coupons/${id}`, payload);
      toast.success(t('Admin.categoriesPage.toast.statusUpdateSuccess', 'Status updated'));
    } catch (err: any) {
      // Validation Error Policy
      if (err.response?.status === 400 || err.response?.status === 422) {
        setCoupons(original);
        toast.error(err.response.data?.message || t('Admin.common.error'));
        return;
      }

      setCoupons(original);
      toast.error(t('Admin.common.error', 'Failed to update status'));
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const search = searchTerm.toLowerCase();
      return c.code?.toLowerCase().includes(search);
    });
  }, [coupons, searchTerm]);

  if (loading && !isRefreshing) return <CouponsTableSkeleton />;

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="group relative flex-1">
          <label className="sr-only">{t('Admin.couponsPage.searchPlaceholder')}</label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={t('Admin.couponsPage.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-xl border-gray-200 bg-gray-50 ps-10 pe-3 text-sm focus-visible:bg-white transition-all duration-300"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-900 transition-all active:scale-95"
            title={t('Admin.analytics.refresh')}
            onClick={() => void fetchCoupons(true)}
          >
            <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={18} />
          </Button>

          <Button
            type="button"
            variant="primary"
            className="h-11 rounded-xl px-4 font-bold shadow-md shadow-[color:var(--color-primary-soft)] transition-all hover:translate-y-[-2px] active:translate-y-0"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            {t('Admin.couponsPage.create')}
          </Button>
        </div>
      </div>

      <section className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <Table className="rounded-none border-0 bg-transparent shadow-none">
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.couponsPage.table.code')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.couponsPage.table.discount')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.couponsPage.table.usage')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.couponsPage.table.expiry')}
                </TableHead>
                <TableHead className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.couponsPage.table.status')}
                </TableHead>
                <TableHead className="px-6 py-4 text-end text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.couponsPage.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-24 text-center">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto flex max-w-sm flex-col items-center gap-4"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50 text-gray-300">
                          <Ticket size={32} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-gray-900">
                            {t('Admin.usersPage.emptyTitle')}
                          </p>
                          <p className="text-xs font-medium text-gray-400">
                            {t('Admin.usersPage.emptyMessage')}
                          </p>
                        </div>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <MotionTableRow
                      key={coupon.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="whitespace-nowrap px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]">
                            <Tag size={18} />
                          </div>
                          <span className="text-sm font-black tracking-wider text-gray-900 leading-tight">
                            {coupon.code}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {coupon.discountPercent ? `${coupon.discountPercent}%` : `${coupon.discountAmount} ${t('Common.currency')}`}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {coupon.discountPercent ? t('Admin.couponsPage.form.percentage') : t('Admin.couponsPage.form.fixed')}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-6 py-5">
                        <div className="flex items-center gap-2">
                           <Users size={14} className="text-gray-400" />
                           <span className="text-sm font-bold text-gray-700">
                             {coupon.usedCount} / {coupon.maxUses || '∞'}
                           </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className={`text-xs font-bold ${coupon.expiresAt && new Date(coupon.expiresAt) < new Date() ? 'text-red-500' : 'text-gray-600'}`}>
                            {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : t('Common.none', 'None')}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-6 py-5 text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={coupon.isActive} 
                            onCheckedChange={() => void handleToggleActive(coupon.id, coupon.isActive)} 
                          />
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-6 py-5 text-end">
                        <div className="flex justify-end gap-2 opacity-0 transition-all group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 shadow-sm transition-all"
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 shadow-sm transition-all"
                            onClick={() => void handleDelete(coupon.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </MotionTableRow>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </section>

      <CouponModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => void fetchCoupons(true)}
      />
      {selectedCoupon && (
        <CouponModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          coupon={selectedCoupon}
          onSuccess={() => void fetchCoupons(true)}
        />
      )}
    </div>
  );
}

function CouponModal({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  coupon?: Coupon;
  onSuccess: () => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>(
    coupon?.discountPercent ? 'PERCENTAGE' : 'FIXED'
  );

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 0,
    usageLimit: null as number | null,
    expiryDate: null as string | null,
    isActive: true
  });

  useEffect(() => {
    if (open && coupon) {
      setFormData({
        code: coupon.code,
        discountType: coupon.discountPercent ? 'PERCENTAGE' : 'FIXED',
        discountValue: coupon.discountPercent || coupon.discountAmount || 0,
        usageLimit: coupon.maxUses,
        expiryDate: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : null,
        isActive: coupon.isActive
      });
      setDiscountType(coupon.discountPercent ? 'PERCENTAGE' : 'FIXED');
    } else if (open) {
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        usageLimit: null,
        expiryDate: null,
        isActive: true
      });
      setDiscountType('PERCENTAGE');
    }
  }, [open, coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Prepare Payload with End-of-Day ISO string
    const payload = {
       ...formData,
       discountType, // Use local state for toggle
       expiryDate: formData.expiryDate 
         ? new Date(new Date(formData.expiryDate).setHours(23, 59, 59, 999)).toISOString()
         : null
    };

    try {
      // 2. Primary API Call
      if (coupon) {
        await api.patch(`/admin/coupons/${coupon.id}`, payload);
        toast.success(t('Admin.couponsPage.toast.updateSuccess'));
      } else {
        await api.post('/admin/coupons', payload);
        toast.success(t('Admin.couponsPage.toast.createSuccess'));
      }
      onOpenChange(false);
      await onSuccess();
    } catch (err: any) {
      // 3. Validation Filter (Policy: Block fallback on 400/422)
      if (err.response?.status === 400 || err.response?.status === 422) {
        toast.error(err.response.data?.message || t('Admin.couponsPage.toast.error'));
        setLoading(false);
        return; // STOP execution
      }

      toast.error(t('Admin.couponsPage.toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[2.5rem] p-0 overflow-hidden outline-none border-none shadow-2xl">
        <DialogHeader className="bg-gray-50/50 px-8 py-7 border-b border-gray-100">
          <div className="flex items-center gap-4">
             <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]">
               <Tag size={24} />
             </div>
             <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {coupon ? t('Admin.couponsPage.create') : t('Admin.couponsPage.create')}
              </DialogTitle>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mt-0.5">
                {t('Admin.analytics.quickInsightsTitle')}
              </p>
             </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8 p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2 group">
            <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 group-focus-within:text-[color:var(--color-primary)] transition-colors">
              {t('Admin.couponsPage.form.code')} *
            </label>
            <Input 
              required 
              minLength={3} 
              value={formData.code} 
              onChange={(e) => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder={t('Admin.couponsPage.form.codePlaceholder')}
              className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 text-sm font-black tracking-widest shadow-inner focus:bg-white focus:ring-[color:var(--color-primary-soft)] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.couponsPage.form.discountType')}
              </label>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as any)}>
                <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 font-bold shadow-inner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  <SelectItem value="PERCENTAGE" className="font-bold">{t('Admin.couponsPage.form.percentage')}</SelectItem>
                  <SelectItem value="FIXED" className="font-bold">{t('Admin.couponsPage.form.fixed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.couponsPage.form.discountValue')}
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  required 
                  min={1} 
                  value={formData.discountValue} 
                  onChange={(e) => setFormData(f => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))}
                  className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 pe-12 text-sm font-bold shadow-inner"
                />
                <span className="absolute end-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">
                  {discountType === 'PERCENTAGE' ? '%' : 'SAR'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.couponsPage.form.usageLimit')}
              </label>
              <Input 
                type="number" 
                placeholder={t('Admin.couponsPage.form.usageLimitPlaceholder')}
                value={formData.usageLimit || ''} 
                onChange={(e) => setFormData(f => ({ ...f, usageLimit: parseInt(e.target.value) || null }))}
                className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 text-sm font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.couponsPage.form.expiryDate')}
              </label>
              <input 
                type="date" 
                value={formData.expiryDate || ''} 
                onChange={(e) => setFormData(f => ({ ...f, expiryDate: e.target.value || null }))}
                className="flex w-full h-14 rounded-2xl bg-gray-50 border border-gray-100 ps-5 pe-5 text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary-soft)] transition-all"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-gray-50/20 p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 leading-none">{t('Admin.couponsPage.form.isActive')}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{t('Admin.usersPage.statusState')}</p>
              </div>
              <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData(f => ({...f, isActive: c}))} />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-14 rounded-[1.25rem] px-10 font-bold text-gray-400 border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
            >
              {t('Common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-14 rounded-[1.25rem] px-12 font-bold shadow-xl shadow-[color:var(--color-primary-soft)] transition-all hover:translate-y-[-2px] active:scale-95 active:translate-y-0"
            >
              {loading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : coupon ? <Edit2 className="me-2 h-4 w-4"/> : <Plus className="me-2 h-4 w-4"/>}
              {coupon ? t('Common.save') : t('Common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Loader2({ className, size }: { className?: string; size?: number }) {
  return <RefreshCcw className={className} size={size} />;
}
