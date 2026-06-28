import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  RefreshCcw,
  UserPlus,
  Calendar,
  AtSign,
  User,
  Check,
  ChevronDown,
  FileBarChart2
} from 'lucide-react';

import { api } from '../../lib/axios';
import type { Child, StoredUser as UserType } from '../../types/academy';
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
import { Badge } from '../../components/ui/badge';

const MotionTableRow = motion(TableRow as any);

/**
 * 🧒 Children Table Skeleton
 */
function ChildrenTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex h-11 w-full animate-pulse rounded-xl bg-gray-100" />
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex h-16 animate-pulse items-center gap-4 border-b border-gray-50 px-6">
            <div className="h-10 w-40 rounded-lg bg-gray-100" />
            <div className="h-6 w-32 rounded-lg bg-gray-50" />
            <div className="h-6 w-48 rounded-lg bg-gray-50" />
            <div className="h-6 w-24 rounded-lg bg-gray-100 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminChildrenPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchChildren = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get('/admin/children');
      const raw = response.data?.data?.children ?? response.data?.children ?? [];
      setChildren(Array.isArray(raw) ? raw : []);
    } catch {
      toast.error(t('Admin.childrenPage.toast.fetchError', 'Failed to fetch students'));
      setChildren([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchChildren();
  }, [fetchChildren]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const payload = { isActive: !currentStatus };
    const original = [...children];
    
    // Optimistic Update
    setChildren(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    
    try {
      await api.patch(`/admin/children/${id}`, payload);
      toast.success(t('Admin.common.statusUpdateSuccess', 'Status updated'));
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        setChildren(original);
        toast.error(err.response.data?.message || t('Admin.childrenPage.toast.error'));
        return;
      }

      setChildren(original);
      toast.error(t('Admin.common.error', 'Update failed'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('Admin.common.confirmDelete', 'Are you sure?'))) return;

    try {
      await api.delete(`/admin/children/${id}`);
      toast.success(t('Admin.common.deleteSuccess'));
      void fetchChildren(true);
    } catch {
      toast.error(t('Admin.common.deleteError'));
    }
  };

  const filteredChildren = useMemo(() => {
    return children.filter((c) => {
      const search = searchTerm.toLowerCase();
      return (
        c.name?.toLowerCase().includes(search) ||
        c.username?.toLowerCase().includes(search) ||
        c.parent?.fullName?.toLowerCase().includes(search) ||
        c.parent?.email?.toLowerCase().includes(search)
      );
    });
  }, [children, searchTerm]);

  if (loading && !isRefreshing) return <ChildrenTableSkeleton />;

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      {/* Header / Search Area */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]" />
          <Input
            type="search"
            placeholder={t('Admin.childrenPage.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-xl border-gray-200 bg-gray-50 ps-10 pe-3 text-sm focus-visible:bg-white transition-all duration-300"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl border-gray-200 bg-gray-50 text-gray-500 transition-all active:scale-95"
            onClick={() => void fetchChildren(true)}
          >
            <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={18} />
          </Button>

          <Button
            variant="primary"
            className="h-11 rounded-xl px-4 font-bold shadow-md transition-all hover:translate-y-[-2px]"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            {t('Admin.childrenPage.create')}
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <section className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <Table className="bg-transparent">
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50">
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.childrenPage.table.name')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                   {t('Admin.childrenPage.table.username')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.childrenPage.table.parent')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.childrenPage.table.joinDate')}
                </TableHead>
                <TableHead className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.childrenPage.table.status')}
                </TableHead>
                <TableHead className="px-6 py-4 text-end text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.childrenPage.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredChildren.map((child) => (
                  <MotionTableRow
                    key={child.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]">
                          <User size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{child.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium">ID: {child.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-5">
                      <Badge variant="outline" className="rounded-lg border-gray-100 bg-gray-50 text-xs font-bold text-gray-600">
                        @{child.username}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-gray-800">
                          {child.parent?.fullName || '—'}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                          <AtSign size={10} />
                          {child.parent?.email || '—'}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar size={14} className="text-gray-300" />
                        {new Date(child.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-5 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={child.isActive}
                          onCheckedChange={() => void handleToggleActive(child.id, child.isActive)}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-5 text-end">
                      <div className="flex justify-end gap-2 opacity-0 transition-all group-hover:opacity-100">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl border-gray-200 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                          onClick={() => navigate(`/admin/assessments/performance/${child.id}`)}
                        >
                          <FileBarChart2 size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          onClick={() => {
                            setSelectedChild(child);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                          onClick={() => void handleDelete(child.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </MotionTableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Modals */}
      <ChildModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => void fetchChildren(true)}
      />
      {selectedChild && (
        <ChildModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          child={selectedChild}
          onSuccess={() => void fetchChildren(true)}
        />
      )}
    </div>
  );
}

/**
 * 🛠️ Child Management Modal (Create/Edit)
 */
function ChildModal({
  open,
  onOpenChange,
  child,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  child?: Child;
  onSuccess: () => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<UserType[]>([]);
  const [parentSearch, setParentSearch] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    parentId: '',
    parentDisplay: '',
    age: null as number | null,
    isActive: true
  });

  // Load Parents
  useEffect(() => {
    if (open) {
      const fetchParents = async () => {
        try {
          const res = await api.get('/admin/users?role=PARENT');
          setParents(res.data?.data?.users || []);
        } catch {
          setParents([]);
        }
      };
      void fetchParents();
    }
  }, [open]);

  useEffect(() => {
    if (open && child) {
      setFormData({
        fullName: child.name,
        username: child.username,
        password: '', // Keep empty on edit unless changing
        parentId: child.parentId,
        parentDisplay: child.parent?.email || '',
        age: child.age,
        isActive: child.isActive
      });
    } else if (open) {
      setFormData({
        fullName: '',
        username: '',
        password: '',
        parentId: '',
        parentDisplay: '',
        age: null,
        isActive: true
      });
    }
  }, [open, child]);

  // Username Suggestion Logic
  const handleNameChange = (name: string) => {
    setFormData(f => {
      const updates: any = { fullName: name };
      // Only suggest if we're creating or if username was empty
      if (!child && (!f.username || f.username === f.fullName.toLowerCase().replace(/\s+/g, '_'))) {
        updates.username = name.toLowerCase().replace(/\s+/g, '_');
      }
      return { ...f, ...updates };
    });
  };

  const filteredParents = useMemo(() => {
    return parents.filter(p => 
      p.name.toLowerCase().includes(parentSearch.toLowerCase()) || 
      p.email.toLowerCase().includes(parentSearch.toLowerCase())
    );
  }, [parents, parentSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentId) {
      toast.error(t('Admin.childrenPage.form.parent') + ' is required');
      return;
    }
    setLoading(true);

    try {
      const { parentDisplay, ...payload } = formData;
      
      if (child) {
        await api.patch(`/admin/children/${child.id}`, payload);
        toast.success(t('Admin.childrenPage.toast.updateSuccess'));
      } else {
        await api.post('/admin/children', payload);
        toast.success(t('Admin.childrenPage.toast.createSuccess'));
      }
      onOpenChange(false);
      await onSuccess();
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        toast.error(err.response.data?.message || t('Admin.childrenPage.toast.error'));
        setLoading(false);
        return;
      }

      toast.error(t('Admin.childrenPage.toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-[2.5rem] border-none p-0 shadow-2xl outline-none">
        <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-7">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]">
              <UserPlus size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {child ? t('Admin.childrenPage.title') : t('Admin.childrenPage.create')}
              </DialogTitle>
              <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-gray-400">
                Level 2: Family Tree Management
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="custom-scrollbar max-h-[75vh] overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]">
                {t('Admin.childrenPage.form.fullName')} *
              </label>
              <Input
                required
                value={formData.fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-5 font-bold shadow-inner focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]">
                {t('Admin.childrenPage.form.username')} *
              </label>
              <Input
                required
                value={formData.username}
                onChange={(e) => setFormData(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-5 font-bold shadow-inner focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]">
                {t('Admin.childrenPage.form.password')} {child ? '(Leave blank to keep)' : '*'}
              </label>
              <Input
                type="password"
                required={!child}
                value={formData.password}
                onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-5 font-bold shadow-inner focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]">
                {t('Admin.childrenPage.form.age')}
              </label>
              <Input
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData(f => ({ ...f, age: parseInt(e.target.value) || null }))}
                className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-5 font-bold shadow-inner focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 🔍 Searchable Parent Selector (Custom Combobox Pattern) */}
          <div className="space-y-2 relative">
            <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
              {t('Admin.childrenPage.form.parent')} *
            </label>
            <div 
              className="relative group cursor-pointer"
              onClick={() => setShowParentDropdown(!showParentDropdown)}
            >
              <Input
                readOnly
                placeholder={t('Admin.childrenPage.form.parentPlaceholder')}
                value={formData.parentDisplay}
                className="h-14 cursor-pointer rounded-2xl border-gray-100 bg-gray-50 ps-5 font-bold shadow-inner focus:ring-2 focus:ring-[color:var(--color-primary-soft)] transition-all"
              />
              <ChevronDown className={`absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${showParentDropdown ? 'rotate-180' : ''}`} size={18} />
            </div>

            {showParentDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-50 w-full mt-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl"
              >
                <div className="relative mb-2">
                   <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                   <Input 
                     autoFocus
                     placeholder={t('Admin.childrenPage.form.parentSearchPlaceholder')}
                     value={parentSearch}
                     onChange={(e) => setParentSearch(e.target.value)}
                     className="h-10 rounded-xl border-none bg-gray-50 ps-9 text-sm"
                     onClick={(e) => e.stopPropagation()}
                   />
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredParents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 font-medium">{t('Admin.childrenPage.noParents')}</div>
                  ) : (
                    filteredParents.map(p => (
                      <div 
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${formData.parentId === p.id ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]' : 'hover:bg-gray-50 text-gray-700'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(f => ({ ...f, parentId: p.id, parentDisplay: `${p.name} (${p.email})` }));
                          setShowParentDropdown(false);
                          setParentSearch('');
                        }}
                      >
                        <div className="flex flex-col">
                           <span className="text-sm font-bold">{p.name}</span>
                           <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{p.email}</span>
                        </div>
                        {formData.parentId === p.id && <Check size={16} />}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-gray-50/20 p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-900 leading-none">
                   {t('Admin.childrenPage.form.isActive')}
                </h4>
                <p className="text-[10px] font-medium text-gray-400">
                   Enables student login and enrollment access
                </p>
              </div>
              <Switch 
                checked={formData.isActive} 
                onCheckedChange={(v) => setFormData(f => ({ ...f, isActive: v }))} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-14 rounded-2xl px-10 font-bold text-gray-400 border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
            >
              {t('Common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-14 rounded-2xl px-12 font-bold shadow-xl shadow-[color:var(--color-primary-soft)] transition-all hover:translate-y-[-2px] active:scale-95 active:translate-y-0"
            >
              {child ? <Edit2 className="me-2 h-4 w-4" /> : <Plus className="me-2 h-4 w-4" />}
              {child ? t('Common.save') : t('Common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
