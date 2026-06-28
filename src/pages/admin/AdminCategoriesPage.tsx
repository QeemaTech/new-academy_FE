import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  LayoutList,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Plus,
  CheckCircle2,
  RefreshCcw,
  Zap
} from 'lucide-react';

import { api } from '../../lib/axios';
import type { Category } from '../../types/academy';
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

function CategoriesTableSkeleton() {
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

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCategories = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get('/admin/categories');
      const raw = response.data?.data?.categories ?? response.data?.categories ?? response.data?.data ?? response.data ?? [];
      const arr = Array.isArray(raw) ? raw : [];
      setCategories(arr);
    } catch {
      toast.error(t('Admin.categoriesPage.toast.fetchError', 'Failed to fetch categories'));
      setCategories([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('Admin.categoriesPage.confirmDelete', 'Are you sure you want to deactivate this package?'))) return;
    
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success(t('Admin.categoriesPage.toast.deleteSuccess', 'Package deactivated successfully'));
      void fetchCategories(true);
    } catch {
      toast.error(t('Admin.categoriesPage.toast.deleteError', 'Failed to deactivate package'));
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const payload = { isActive: !currentStatus };
    const original = [...categories];
    setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    
    try {
      await api.patch(`/admin/categories/${id}`, payload);
    } catch {
      setCategories(original);
      toast.error(t('Admin.categoriesPage.toast.error', 'Failed to update status'));
      return;
    }
    toast.success(t('Admin.categoriesPage.toast.statusUpdateSuccess', 'Status updated'));
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((p) => {
      const search = searchTerm.toLowerCase();
      return p.name?.toLowerCase().includes(search) || p.description?.toLowerCase().includes(search);
    });
  }, [categories, searchTerm]);

  if (loading && !isRefreshing) return <CategoriesTableSkeleton />;

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="group relative flex-1">
          <label className="sr-only">{t('Admin.categoriesPage.searchPlaceholder')}</label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={t('Admin.categoriesPage.searchPlaceholder')}
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
            onClick={() => void fetchCategories(true)}
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
            {t('Admin.categoriesPage.create')}
          </Button>
        </div>
      </div>

      <section className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ${isRefreshing ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <Table className="rounded-none border-0 bg-transparent shadow-none">
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.categoriesPage.table.name')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.categoriesPage.table.features')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.categoriesPage.table.price')}
                </TableHead>
                <TableHead className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.categoriesPage.table.status')}
                </TableHead>
                <TableHead className="px-6 py-4 text-end text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.categoriesPage.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto flex max-w-sm flex-col items-center gap-4"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50 text-gray-300">
                          <LayoutList size={32} />
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
                  filteredCategories.map((category) => (
                    <MotionTableRow
                      key={category.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="whitespace-nowrap px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-10 items-center justify-center rounded-2xl ${category.level === 'PREMIUM' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            <Zap size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 leading-tight">{category.name}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              {category.level}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-1.5 overflow-hidden">
                             {category.hasCertificate && 
                              <div className="inline-flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 border-2 border-white shadow-sm" title={t('Admin.categoriesPage.form.hasCertificate')}>
                                <CheckCircle2 size={12} />
                              </div>
                            }
                            {category.hasPersonalCoach && 
                              <div className="inline-flex size-6 items-center justify-center rounded-full bg-amber-50 text-amber-600 border-2 border-white shadow-sm" title={t('Admin.categoriesPage.form.hasCoach')}>
                                <CheckCircle2 size={12} />
                              </div>
                            }
                          </div>
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                            {category.maxTracks} {t('Admin.categoriesPage.form.tracks')}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-6 py-5 text-sm font-bold text-gray-900">
                        {category.price} <span className="text-[10px] text-gray-400">{t('Common.currency')}</span>
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-6 py-5 text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={category.isActive} 
                            onCheckedChange={() => void handleToggleActive(category.id, category.isActive)} 
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
                              setSelectedCategory(category);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-xl border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 shadow-sm transition-all"
                            onClick={() => void handleDelete(category.id)}
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

      <CategoryModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => void fetchCategories(true)}
      />
      {selectedCategory && (
        <CategoryModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          category={selectedCategory}
          onSuccess={() => void fetchCategories(true)}
        />
      )}
    </div>
  );
}

function CategoryModal({
  open,
  onOpenChange,
  category,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  category?: Category;
  onSuccess: () => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  const defaultState = {
    name: '',
    description: '',
    price: 0,
    durationMonths: 1,
    sessionsPerWeek: 1,
    level: 'BASIC' as Category['level'],
    maxTracks: 1,
    hasCertificate: false,
    hasPersonalCoach: false,
    hasPrivateSessions: false,
    hasWeeklyReport: false,
    supportType: 'EMAIL',
    isActive: true
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (open && category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        price: category.price,
        durationMonths: category.durationMonths,
        sessionsPerWeek: category.sessionsPerWeek,
        level: category.level,
        maxTracks: category.maxTracks,
        hasCertificate: category.hasCertificate,
        hasPersonalCoach: category.hasPersonalCoach,
        hasPrivateSessions: category.hasPrivateSessions,
        hasWeeklyReport: category.hasWeeklyReport,
        supportType: category.supportType,
        isActive: category.isActive
      });
    } else if (open) {
      setFormData(defaultState);
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category) {
        await api.patch(`/admin/categories/${category.id}`, formData);
        toast.success(t('Admin.categoriesPage.toast.updateSuccess'));
      } else {
        await api.post('/admin/categories', formData);
        toast.success(t('Admin.categoriesPage.toast.createSuccess'));
      }
      onOpenChange(false);
      await onSuccess();
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        toast.error(err.response.data?.message || t('Admin.categoriesPage.toast.error'));
        setLoading(false);
        return;
      }
      toast.error(t('Admin.categoriesPage.toast.error'));
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
               <Zap size={24} />
             </div>
             <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {category ? t('Admin.categoriesPage.edit.title') : t('Admin.categoriesPage.create')}
              </DialogTitle>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mt-0.5">
                {category ? t('Admin.categoriesPage.edit.subtitle', 'Synchronizing data') : t('Admin.categoriesPage.create.subtitle', 'Provisioning package')}
              </p>
             </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8 p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 group-focus-within:text-[color:var(--color-primary)] transition-colors">
                {t('Admin.categoriesPage.form.name')} *
              </label>
              <Input 
                required 
                minLength={3} 
                value={formData.name} 
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 text-sm font-bold shadow-inner focus:bg-white focus:ring-[color:var(--color-primary-soft)] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.categoriesPage.form.level')} *
              </label>
              <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v as Category['level'] })}>
                <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 font-bold shadow-inner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  <SelectItem value="BASIC" className="font-bold">{t('Admin.categoriesPage.level.BASIC')}</SelectItem>
                  <SelectItem value="ADVANCED" className="font-bold">{t('Admin.categoriesPage.level.ADVANCED')}</SelectItem>
                  <SelectItem value="PREMIUM" className="font-bold">{t('Admin.categoriesPage.level.PREMIUM')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2 group">
            <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 group-focus-within:text-[color:var(--color-primary)] transition-colors">
              {t('Admin.categoriesPage.form.description')}
            </label>
            <Input 
              value={formData.description} 
              onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Standard academic package..."
              className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 text-sm font-medium shadow-inner focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.categoriesPage.form.price')}
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  required 
                  min={0} 
                  value={formData.price} 
                  onChange={(e) => setFormData(f => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                  className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 pe-12 text-sm font-bold shadow-inner"
                />
                <span className="absolute end-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">SAR</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Admin.categoriesPage.form.tracks')}
              </label>
              <Input 
                type="number" 
                required 
                min={1} 
                value={formData.maxTracks} 
                onChange={(e) => setFormData(f => ({ ...f, maxTracks: parseInt(e.target.value) || 1 }))}
                className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 text-sm font-bold shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('Common.support')}
              </label>
              <Input 
                required 
                placeholder="EMAIL" 
                value={formData.supportType} 
                onChange={(e) => setFormData(f => ({ ...f, supportType: e.target.value }))}
                className="h-14 rounded-2xl bg-gray-50 border-gray-100 ps-5 text-sm font-bold shadow-inner"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-gray-50/20 p-8 space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--color-primary)] mb-2">
              {t('Admin.categoriesPage.form.features')}
            </h4>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex items-center gap-4 transition-transform hover:translate-x-1">
                <Switch checked={formData.hasCertificate} onCheckedChange={(c) => setFormData(f => ({...f, hasCertificate: c}))} />
                <span className="text-[11px] font-bold uppercase tracking-tight text-gray-500 leading-none">{t('Admin.categoriesPage.form.hasCertificate')}</span>
              </div>
              <div className="flex items-center gap-4 transition-transform hover:translate-x-1">
                <Switch checked={formData.hasPersonalCoach} onCheckedChange={(c) => setFormData(f => ({...f, hasPersonalCoach: c}))} />
                <span className="text-[11px] font-bold uppercase tracking-tight text-gray-500 leading-none">{t('Admin.categoriesPage.form.hasCoach')}</span>
              </div>
              <div className="flex items-center gap-4 transition-transform hover:translate-x-1">
                <Switch checked={formData.hasPrivateSessions} onCheckedChange={(c) => setFormData(f => ({...f, hasPrivateSessions: c}))} />
                <span className="text-[11px] font-bold uppercase tracking-tight text-gray-500 leading-none">{t('Admin.categoriesPage.form.hasPrivate')}</span>
              </div>
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
              {loading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : category ? <Edit2 className="me-2 h-4 w-4"/> : <Plus className="me-2 h-4 w-4"/>}
              {category ? t('Common.save') : t('Common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
