import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Search,
  Plus,
  RefreshCcw,
  Trash2,
  Calendar,
  User,
  BookOpen,
  QrCode,
  ShieldCheck,
  ChevronDown,
  Check
} from 'lucide-react';

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

interface Certificate {
  id: string;
  childId: string;
  trackId: string;
  type: 'COMPLETION' | 'EXCELLENCE';
  verificationCode: string;
  grade?: number;
  issuedAt: string;
  certificateUrl?: string;
  child: {
    fullName: string;
  };
  track: {
    title: string;
  };
}

export default function AdminCertificatesPage() {
  const { t, i18n } = useTranslation();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const fetchCertificates = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get('/admin/certificates');
      const data = response.data?.data;
      setCertificates(Array.isArray(data) ? data : (data?.certificates || []));
    } catch {
      toast.error(t('Certificates.toast.fetchError'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchCertificates();
  }, [fetchCertificates]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('Admin.common.confirmDelete', 'Are you sure you want to revoke this certificate?'))) return;

    try {
      await api.delete(`/admin/certificates/${id}`);
      toast.success(t('Certificates.toast.deleteSuccess'));
      void fetchCertificates(true);
    } catch {
      toast.error(t('Certificates.toast.error'));
    }
  };

  const filteredCerts = useMemo(() => {
    return certificates.filter((c) => {
      const search = searchTerm.toLowerCase();
      return (
        c.child?.fullName?.toLowerCase().includes(search) ||
        c.track?.title?.toLowerCase().includes(search) ||
        c.verificationCode?.toLowerCase().includes(search)
      );
    });
  }, [certificates, searchTerm]);

  if (loading && !isRefreshing) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 w-full bg-gray-100 rounded-2xl" />
        <div className="h-64 w-full bg-gray-100 rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 duration-700">
      {/* 🏅 Header & Search Area */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            {t('Certificates.title')}
          </h1>
          <p className="mt-2 font-medium text-gray-400">
             {t('Certificates.searchPlaceholder')}
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="group relative">
              <Search className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-gray-300 size-4 transition-colors group-focus-within:text-emerald-500" />
              <Input 
                 className="h-12 w-64 rounded-2xl bg-white border border-gray-100 ps-10 pe-4 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                 placeholder={t('Common.searchPlaceholder')}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Button
              variant="outline"
              className="h-12 w-12 rounded-2xl border-gray-100 bg-white shadow-sm"
              onClick={() => void fetchCertificates(true)}
              disabled={isRefreshing}
            >
              <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={18} />
            </Button>
            <Button
              className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-lg shadow-emerald-100 transition-all hover:translate-y-[-2px]"
              onClick={() => setIsIssueModalOpen(true)}
            >
              <Plus size={18} className="me-2" />
              {t('Certificates.issue')}
            </Button>
        </div>
      </div>

      {/* 📜 Certificates Table */}
      <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-b border-gray-100">
              <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">
                 {t('Certificates.table.student')}
              </TableHead>
              <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">
                 {t('Certificates.table.track')}
              </TableHead>
              <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">
                 {t('Certificates.table.date')}
              </TableHead>
              <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">
                 {t('Certificates.table.code')}
              </TableHead>
              <TableHead className="px-8 py-5 text-end text-xs font-black uppercase tracking-widest text-gray-400">
                 {t('Common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredCerts.map((cert) => (
                <MotionTableRow
                  key={cert.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group transition-colors hover:bg-gray-50/50"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <User size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">{cert.child?.fullName}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">{t('Certificates.studentAccount')}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                     <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-emerald-500" />
                        <span className="text-xs font-bold text-gray-700">{cert.track?.title}</span>
                     </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                     <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Calendar size={14} className="text-gray-300" />
                        {new Date(cert.issuedAt).toLocaleDateString(i18n.language)}
                     </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                     <Badge variant="outline" className="rounded-lg border-emerald-100 bg-emerald-50 text-[10px] font-black tracking-widest text-emerald-700">
                        <QrCode size={12} className="me-1.5" />
                        {cert.verificationCode}
                     </Badge>
                  </TableCell>
                   <TableCell className="px-8 py-6 text-end">
                     <div className="flex items-center justify-end gap-2">
                       {cert.certificateUrl && (
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-10 w-10 rounded-2xl text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100"
                           onClick={() => window.open(`${api.defaults.baseURL?.replace('/api', '')}${cert.certificateUrl}`, '_blank')}
                           title="Download PDF"
                         >
                           <QrCode size={16} />
                         </Button>
                       )}
                       <Button 
                         variant="ghost" 
                         size="icon"
                         className="h-10 w-10 rounded-2xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                         onClick={() => void handleDelete(cert.id)}
                       >
                         <Trash2 size={16} />
                       </Button>
                     </div>
                   </TableCell>
                </MotionTableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        {filteredCerts.length === 0 && (
          <div className="flex flex-col items-center justify-center p-20 text-center">
             <div className="size-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-4">
                <Award size={32} className="text-gray-200" />
             </div>
             <p className="text-sm font-bold text-gray-400">{t('Certificates.noResults')}</p>
          </div>
        )}
      </div>

      {/* 🏗️ Issuance Modal */}
      <IssueCertificateModal 
        open={isIssueModalOpen}
        onOpenChange={setIsIssueModalOpen}
        onSuccess={() => void fetchCertificates(true)}
      />
    </div>
  );
}

/**
 * 🛠️ Issue Certificate Modal
 */
function IssueCertificateModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess: () => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [formData, setFormData] = useState({
    childId: '',
    trackId: '',
    type: 'COMPLETION',
    grade: '',
    notes: '',
    studentDisplay: ''
  });

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [sRes, tRes] = await Promise.all([
            api.get('/admin/children'),
            api.get('/admin/programs')
          ]);
          
          const sData = sRes.data?.data;
          const tData = tRes.data?.data;
          
          setStudents(Array.isArray(sData) ? sData : (sData?.children || []));
          setTracks(Array.isArray(tData) ? tData : (tData?.programs || tData?.tracks || []));
        } catch {
          toast.error('Failed to load resource data');
        }
      };
      void fetchData();
    }
  }, [open]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const name = (s.fullName || s.name || '').toLowerCase();
      const username = (s.username || '').toLowerCase();
      const search = studentSearch.toLowerCase();
      return name.includes(search) || username.includes(search);
    });
  }, [students, studentSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.childId || !formData.trackId) {
       toast.error('Please select both a student and a track');
       return;
    }
    setLoading(true);

    try {
      await api.post('/admin/certificates/issue', {
        childId: formData.childId,
        trackId: formData.trackId,
        type: formData.type,
        grade: formData.grade ? parseFloat(formData.grade) : undefined,
        notes: formData.notes || undefined
      });
      toast.success(t('Certificates.toast.issueSuccess'));
      onOpenChange(false);
      await onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Certificates.toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-[3rem] border-none p-0 shadow-2xl outline-none">
        <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-10 py-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-[1.5rem] bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
              <Award size={28} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-gray-900">
                {t('Certificates.issue')}
              </DialogTitle>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                Certified Academic Achievement
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="custom-scrollbar max-h-[70vh] overflow-y-auto p-10 space-y-8">
          {/* Searchable Student Selector */}
          <div className="space-y-2 relative">
            <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400">
              {t('Certificates.form.child')} *
            </label>
            <div 
              className="relative group cursor-pointer"
              onClick={() => setShowStudentDropdown(!showStudentDropdown)}
            >
              <Input
                readOnly
                placeholder={t('Certificates.searchStudent')}
                value={formData.studentDisplay}
                className="h-16 cursor-pointer rounded-[1.5rem] border-gray-100 bg-gray-50 ps-12 font-black shadow-inner focus:ring-2 focus:ring-emerald-50 transition-all text-sm"
              />
              <User className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-emerald-500 transition-colors" size={20} />
              <ChevronDown className={`absolute end-5 top-1/2 -translate-y-1/2 text-gray-300 transition-transform ${showStudentDropdown ? 'rotate-180' : ''}`} size={20} />
            </div>

            <AnimatePresence>
              {showStudentDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-3 rounded-[2rem] border border-gray-100 bg-white p-3 shadow-2xl"
                >
                  <div className="relative mb-3">
                     <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                     <Input 
                       autoFocus
                       placeholder={t('Certificates.clickHereToType')}
                       value={studentSearch}
                       onChange={(e) => setStudentSearch(e.target.value)}
                       className="h-12 rounded-xl border-none bg-gray-50 ps-10 text-xs font-bold"
                       onClick={(e) => e.stopPropagation()}
                     />
                  </div>
                  <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                    {filteredStudents.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">{t('Certificates.noMatchingStudents')}</div>
                    ) : (
                      filteredStudents.map(s => (
                        <div 
                          key={s.id}
                          className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${formData.childId === s.id ? 'bg-emerald-50 text-emerald-600 scale-[0.98]' : 'hover:bg-gray-50 text-gray-700'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(f => ({ ...f, childId: s.id, studentDisplay: `${s.name} (@${s.username})` }));
                            setShowStudentDropdown(false);
                            setStudentSearch('');
                          }}
                        >
                          <div className="flex flex-col">
                             <span className="text-sm font-black">{s.fullName || s.name}</span>
                             <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">@{s.username}</span>
                          </div>
                          {formData.childId === s.id && <Check size={18} className="text-emerald-500" />}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Track and Type Selectors */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400 font-bold">
                  {t('Certificates.form.track')} *
               </label>
               <Select onValueChange={(v) => setFormData(f => ({ ...f, trackId: v }))}>
                  <SelectTrigger className="h-16 rounded-[1.5rem] border-gray-100 bg-gray-50 ps-5 font-black shadow-inner">
                     <SelectValue placeholder={t('Certificates.selectProgram')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-[1.5rem] border-gray-100 p-2 shadow-2xl">
                     {tracks.map(t => (
                        <SelectItem key={t.id} value={t.id} className="rounded-xl h-12 font-bold focus:bg-emerald-50 focus:text-emerald-600">
                           {t.title}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>
            <div className="space-y-2">
               <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400 font-bold">
                  {t('Certificates.form.type')} *
               </label>
               <Select defaultValue="COMPLETION" onValueChange={(v: any) => setFormData(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="h-16 rounded-[1.5rem] border-gray-100 bg-gray-50 ps-5 font-black shadow-inner">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-[1.5rem] border-gray-100 p-2 shadow-2xl">
                     <SelectItem value="COMPLETION" className="rounded-xl h-12 font-bold focus:bg-emerald-50">{t('Certificates.form.types.COMPLETION')}</SelectItem>
                     <SelectItem value="EXCELLENCE" className="rounded-xl h-12 font-bold focus:bg-emerald-50">{t('Certificates.form.types.EXCELLENCE')}</SelectItem>
                  </SelectContent>
               </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400 font-bold">
                  {t('Certificates.form.grade')}
               </label>
               <Input 
                 type="number" 
                 placeholder={t('Certificates.gradePlaceholder')}
                 value={formData.grade}
                 onChange={(e) => setFormData(f => ({ ...f, grade: e.target.value }))}
                 className="h-16 rounded-[1.5rem] border-gray-100 bg-gray-50 ps-5 font-black shadow-inner focus:bg-white transition-all"
               />
            </div>
            <div className="space-y-2">
               <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400 font-bold">
                  {t('Certificates.form.notes')}
               </label>
               <Input 
                 placeholder={t('Certificates.internalNotes')}
                 value={formData.notes}
                 onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                 className="h-16 rounded-[1.5rem] border-gray-100 bg-gray-50 ps-5 font-black shadow-inner focus:bg-white transition-all"
               />
            </div>
          </div>

          <div className="flex justify-end gap-5 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-16 rounded-[1.5rem] px-12 font-black text-gray-400 border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
            >
              {t('Common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-16 rounded-[1.5rem] px-14 font-black shadow-xl shadow-emerald-50 bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:translate-y-[-2px] active:scale-95 active:translate-y-0"
            >
              {loading ? <RefreshCcw className="animate-spin me-2" size={18} /> : <ShieldCheck className="me-2" size={20} />}
              {t('Certificates.issue')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
