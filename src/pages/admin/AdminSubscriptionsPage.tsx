import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Search,
  Plus,
  RefreshCcw,
  Check,
  ChevronDown,
  UserPlus,
  Calendar,
  Package as PackageIcon,
  Flag,
  MoreVertical,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
  Edit2,
  Trash2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const MotionTableRow = motion(TableRow as any);

interface Subscription {
  id: string;
  childId: string;
  child: { fullName: string; username: string };
  packageId: string;
  package: { name: string; level: string };
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING_PAYMENT';
  createdAt: string;
}

interface Enrollment {
  id: string;
  childId: string;
  child: { fullName: string; username: string };
  trackId: string;
  track: { title: string };
  enrolledAt: string;
  accessLevel: 'FULL' | 'READ_ONLY' | 'LOCKED';
}

export default function AdminSubscriptionsPage() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [subsRes, enrollRes] = await Promise.all([
        api.get('/admin/subscriptions'),
        api.get('/admin/subscriptions/enrollments'),
      ]);
      setSubscriptions(subsRes.data?.data || []);
      setEnrollments(enrollRes.data?.data || []);
    } catch {
      toast.error(t('Admin.subscriptionsPage.toast.fetchError'));
      setSubscriptions([]);
      setEnrollments([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/subscriptions/${id}/status`, { status: newStatus });
      toast.success(t('Admin.subscriptionsPage.toast.updateSuccess'));
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
    } catch {
      toast.error(t('Admin.common.error'));
    }
  };

  const filteredSubs = useMemo(() => {
    return subscriptions.filter(s => {
      const term = searchTerm.toLowerCase();
      return s.child.fullName.toLowerCase().includes(term) || s.package.name.toLowerCase().includes(term);
    });
  }, [subscriptions, searchTerm]);

  const filteredEnrolls = useMemo(() => {
    return enrollments.filter(e => {
      const term = searchTerm.toLowerCase();
      return e.child.fullName.toLowerCase().includes(term) || e.track.title.toLowerCase().includes(term);
    });
  }, [enrollments, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'EXPIRED': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'CANCELED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      {/* Header Panel */}
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
            onClick={() => void fetchData(true)}
          >
            <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={18} />
          </Button>
          <Button
            variant="primary"
            className="h-12 rounded-2xl px-6 font-bold shadow-lg shadow-[color:var(--color-primary-soft)]"
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus size={16} className="me-2" />
            {t('Admin.subscriptionsPage.create')}
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="subscriptions" onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="h-14 w-full justify-start rounded-2xl border border-gray-100 bg-gray-50/50 p-1 lg:w-max">
          <TabsTrigger value="subscriptions" className="h-12 rounded-xl px-8 font-bold text-sm tracking-wide data-[state=active]:bg-white data-[state=active]:text-[color:var(--color-primary)] data-[state=active]:shadow-sm transition-all">
             {t('Admin.subscriptionsPage.tabs.subscriptions')}
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="h-12 rounded-xl px-8 font-bold text-sm tracking-wide data-[state=active]:bg-white data-[state=active]:text-[color:var(--color-primary)] data-[state=active]:shadow-sm transition-all">
             {t('Admin.subscriptionsPage.tabs.enrollments')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="focus-visible:ring-0">
          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.student')}</TableHead>
                  <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.plan')}</TableHead>
                  <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.dates')}</TableHead>
                  <TableHead className="px-6 py-4 text-center uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.status')}</TableHead>
                  <TableHead className="px-6 py-4 text-end uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredSubs.map((sub) => (
                    <MotionTableRow key={sub.id} layout transition={{ duration: 0.2 }} className="group hover:bg-gray-50/30">
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)] font-bold">
                            {sub.child.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 line-clamp-1">{sub.child.fullName}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">@{sub.child.username}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                         <div className="flex items-center gap-2">
                           <PackageIcon size={14} className="text-gray-400" />
                           <span className="text-sm font-semibold text-gray-700">{sub.package.name}</span>
                           <Badge variant="outline" className="rounded-lg border-gray-100 bg-gray-50 py-0.5 text-[10px] uppercase font-bold text-gray-500">
                             {sub.package.level}
                           </Badge>
                         </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                         <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                             <Clock size={12} className="text-emerald-500" />
                             {(() => {
                               const d = parseISO(sub.startDate);
                               return isValid(d) ? format(d, 'dd MMM yyyy') : 'N/A';
                             })()}
                           </div>
                           <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                             <ArrowRight size={10} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                             {(() => {
                               const d = parseISO(sub.endDate);
                               return isValid(d) ? format(d, 'dd MMM yyyy') : 'N/A';
                             })()}
                           </div>
                         </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                         <Select value={sub.status} onValueChange={(v) => void handleStatusChange(sub.id, v)}>
                            <SelectTrigger className={`mx-auto h-8 w-max rounded-lg border px-3 text-[11px] font-bold ${getStatusColor(sub.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                               <SelectItem value="ACTIVE" className="rounded-lg text-emerald-600 font-bold">{t('Admin.subscriptionsPage.status.ACTIVE')}</SelectItem>
                               <SelectItem value="EXPIRED" className="rounded-lg text-orange-600 font-bold">{t('Admin.subscriptionsPage.status.EXPIRED')}</SelectItem>
                               <SelectItem value="CANCELED" className="rounded-lg text-red-600 font-bold">{t('Admin.subscriptionsPage.status.CANCELED')}</SelectItem>
                            </SelectContent>
                         </Select>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-end">
                         <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-gray-100 text-gray-400 hover:bg-gray-50">
                            <Edit2 size={14} />
                         </Button>
                      </TableCell>
                    </MotionTableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </section>
        </TabsContent>

        <TabsContent value="enrollments" className="focus-visible:ring-0">
          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
             <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.student')}</TableHead>
                    <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.plan')}</TableHead>
                    <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.accessLevel')}</TableHead>
                    <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.enrolledAt')}</TableHead>
                    <TableHead className="px-6 py-4 text-end uppercase tracking-widest text-xs font-bold text-gray-400">{t('Admin.subscriptionsPage.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   <AnimatePresence mode="popLayout">
                    {filteredEnrolls.map((enroll) => (
                      <MotionTableRow key={enroll.id} layout transition={{ duration: 0.2 }} className="hover:bg-gray-50/30">
                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold">
                              {enroll.child.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{enroll.child.fullName}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">@{enroll.child.username}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                           <div className="flex items-center gap-2">
                             <Flag size={14} className="text-[color:var(--color-primary)]" />
                             <span className="text-sm font-bold text-gray-700">{enroll.track.title}</span>
                           </div>
                        </TableCell>
                        <TableCell className="px-6 py-5 leading-none">
                           <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 text-[11px] font-bold">
                             {enroll.accessLevel}
                           </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-gray-500 font-medium text-sm">
                           {(() => {
                             const d = parseISO(enroll.enrolledAt);
                             return isValid(d) ? format(d, 'dd MMM yyyy') : 'N/A';
                           })()}
                        </TableCell>
                        <TableCell className="px-6 py-5 text-end">
                           <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-gray-100 text-gray-400">
                              <MoreVertical size={16} />
                           </Button>
                        </TableCell>
                      </MotionTableRow>
                    ))}
                   </AnimatePresence>
                </TableBody>
             </Table>
          </section>
        </TabsContent>
      </Tabs>

      {/* Enrollment Creation Modal */}
      <EnrollmentModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSuccess={() => void fetchData(true)} 
      />
    </div>
  );
}

/**
 * 🤝 Enrollment Modal (Package vs Track Logic)
 */
function EnrollmentModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (o: boolean) => void, onSuccess: () => void }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [enrollType, setEnrollType] = useState<'package' | 'track'>('package');
  
  // Lookups
  const [children, setChildren] = useState<{ id: string, fullName: string, username: string, parentEmail?: string }[]>([]);
  const [packages, setPackages] = useState<{ id: string, name: string }[]>([]);
  const [tracks, setTracks] = useState<{ id: string, title: string }[]>([]);

  // Selection UI State
  const [childSearch, setChildSearch] = useState('');
  const [showChildSelect, setShowChildSelect] = useState(false);
  
  const [targetSearch, setTargetSearch] = useState('');
  const [showTargetSelect, setShowTargetSelect] = useState(false);

  const [formData, setFormData] = useState({
    childId: '',
    childName: '',
    targetId: '',
    targetName: '',
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (open) {
      void api.get('/admin/children').then(r => setChildren(r.data?.data?.children || [])).catch(() => setChildren([]));

      void api.get('/admin/categories').then(r => setPackages(r.data?.data?.categories || [])).catch(() => setPackages([]));

      void api.get('/admin/programs').then(r => setTracks(r.data?.data?.programs || [])).catch(() => setTracks([]));
    }
  }, [open]);

  const filteredChildren = useMemo(() => {
    return children.filter(c => c.fullName.toLowerCase().includes(childSearch.toLowerCase()) || c.username.toLowerCase().includes(childSearch.toLowerCase()));
  }, [children, childSearch]);

  const filteredTargets = useMemo(() => {
    if (enrollType === 'package') {
      return packages.filter(p => p.name.toLowerCase().includes(targetSearch.toLowerCase()));
    }
    return tracks.filter(t => t.title.toLowerCase().includes(targetSearch.toLowerCase()));
  }, [enrollType, packages, tracks, targetSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (enrollType === 'package') {
        const payload = {
          childId: formData.childId,
          packageId: formData.targetId,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate?.toISOString(),
          status: formData.status
        };
        await api.post('/admin/subscriptions', payload);
      } else {
        const payload = {
          childId: formData.childId,
          trackId: formData.targetId,
          accessLevel: 'FULL'
        };
        await api.post('/admin/subscriptions/enrollments', payload);
      }
      toast.success(t('Admin.subscriptionsPage.toast.createSuccess'));
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Admin.subscriptionsPage.toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden rounded-[2.5rem] border-none p-0 shadow-2xl">
        <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-7">
           <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={26} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t('Admin.subscriptionsPage.create')}</DialogTitle>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.subscriptionsPage.phase.accessProvisioning')}</p>
              </div>
           </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           {/* Section 1: Child Selection */}
           <div className="space-y-2 relative">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.subscriptionsPage.form.student')} *</label>
              <div className="relative cursor-pointer" onClick={() => setShowChildSelect(!showChildSelect)}>
                <Input 
                  readOnly 
                  placeholder={t('Admin.subscriptionsPage.form.studentPlaceholder')}
                  value={formData.childName}
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold shadow-inner cursor-pointer" 
                />
                <ChevronDown className={`absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${showChildSelect ? 'rotate-180' : ''}`} size={18} />
              </div>

              {showChildSelect && (
                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 w-full mt-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">
                    <Input 
                       autoFocus
                       placeholder="Search name or @username..."
                       value={childSearch}
                       onChange={e => setChildSearch(e.target.value)}
                       className="mb-3 h-11 border-none bg-gray-50 rounded-xl"
                       onClick={e => e.stopPropagation()}
                    />
                    <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                       {filteredChildren.map(child => (
                         <div 
                           key={child.id}
                           className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                           onClick={(e) => {
                             e.stopPropagation();
                             setFormData(f => ({ ...f, childId: child.id, childName: child.fullName }));
                             setShowChildSelect(false);
                           }}
                         >
                            <div className="flex flex-col">
                               <span className="text-sm font-bold">{child.fullName}</span>
                               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">@{child.username}</span>
                            </div>
                            {formData.childId === child.id && <Check size={16} className="text-emerald-500" />}
                         </div>
                       ))}
                    </div>
                 </motion.div>
              )}
           </div>

           {/* Section 2: Type Selection */}
           <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${enrollType === 'package' ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-soft)]' : 'border-gray-50 bg-gray-50/50 hover:bg-gray-50'}`}
                onClick={() => { setEnrollType('package'); setFormData(f => ({ ...f, targetId: '', targetName: '' })) }}
              >
                 <PackageIcon className={`mb-2 ${enrollType === 'package' ? 'text-[color:var(--color-primary)]' : 'text-gray-400'}`} size={20} />
                 <p className="text-xs font-bold leading-tight">{t('Admin.subscriptionsPage.form.typePackage')}</p>
              </div>
              <div 
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${enrollType === 'track' ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50/50 hover:bg-gray-50'}`}
                onClick={() => { setEnrollType('track'); setFormData(f => ({ ...f, targetId: '', targetName: '' })) }}
              >
                 <Flag className={`mb-2 ${enrollType === 'track' ? 'text-blue-600' : 'text-gray-400'}`} size={20} />
                 <p className="text-xs font-bold leading-tight">{t('Admin.subscriptionsPage.form.typeTrack')}</p>
              </div>
           </div>

           {/* Section 3: Target Selection */}
           <div className="space-y-2 relative">
              <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {enrollType === 'package' ? t('Admin.subscriptionsPage.form.package') : t('Admin.subscriptionsPage.form.track')} *
              </label>
              <div className="relative cursor-pointer" onClick={() => setShowTargetSelect(!showTargetSelect)}>
                <Input 
                  readOnly 
                  placeholder={enrollType === 'package' ? t('Admin.subscriptionsPage.form.packagePlaceholder') : t('Admin.subscriptionsPage.form.trackPlaceholder')}
                  value={formData.targetName}
                  className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold shadow-inner cursor-pointer" 
                />
                <ChevronDown className={`absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${showTargetSelect ? 'rotate-180' : ''}`} size={18} />
              </div>

              {showTargetSelect && (
                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 w-full mt-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">
                    <Input 
                       autoFocus
                       placeholder="Search list..."
                       value={targetSearch}
                       onChange={e => setTargetSearch(e.target.value)}
                       className="mb-3 h-11 border-none bg-gray-50 rounded-xl"
                       onClick={e => e.stopPropagation()}
                    />
                    <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                       {filteredTargets.map(target => (
                         <div 
                           key={target.id}
                           className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                           onClick={(e) => {
                             e.stopPropagation();
                             setFormData(f => ({ ...f, targetId: target.id, targetName: (target as any).name || (target as any).title }));
                             setShowTargetSelect(false);
                           }}
                         >
                            <span className="text-sm font-bold">{(target as any).name || (target as any).title}</span>
                            {formData.targetId === target.id && <Check size={16} className="text-emerald-500" />}
                         </div>
                       ))}
                    </div>
                 </motion.div>
              )}
           </div>

           {/* Date Logic (Subscriptions Only) */}
           {enrollType === 'package' && (
             <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl border border-gray-50 bg-gray-50/30">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('Admin.subscriptionsPage.form.startDate')}</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Calendar size={14} className="text-emerald-600" />
                    {format(formData.startDate, 'dd MMMM yyyy')}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('Admin.subscriptionsPage.form.endDate')}</span>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 italic">
                    <RefreshCcw size={12} />
                    {t('Admin.subscriptionsPage.form.endDateHint')}
                  </div>
                </div>
             </div>
           )}

           <div className="pt-4">
             <Button 
               disabled={loading || !formData.childId || !formData.targetId} 
               type="submit" 
               className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-[color:var(--color-primary-soft)]"
             >
                {loading ? <RefreshCcw className="animate-spin" size={20} /> : t('Common.create')}
             </Button>
           </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
