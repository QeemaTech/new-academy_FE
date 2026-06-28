import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Search,
  Edit2,
  Trash2,
  Plus,
  RefreshCcw,
  Video,
  FileText,
  Type,
  Layers,
  ChevronDown,
  Check,
  MoreVertical,
  GripVertical,
  Settings2,
  ListVideo
} from 'lucide-react';

import { api } from '../../lib/axios';
import type { Program } from '../../types/academy';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

const MotionTableRow = motion(TableRow as any);

interface Session {
  id: string;
  trackId: string;
  track?: { title: string };
  learningPathId?: string;
  learningPath?: { title: string };
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'PDF' | 'TEXT' | 'MIXED';
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  duration?: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface LearningPath {
  id: string;
  trackId: string;
  title: string;
  order: number;
}

export default function AdminSessionsPage() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);

  const fetchSessions = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/admin/sessions');
      setSessions(res.data?.data?.sessions || []);
    } catch {
      toast.error(t('Admin.sessionsPage.toast.fetchError'));
      setSessions([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/sessions/${id}`, { isActive: !current });
      toast.success(t('Admin.common.statusUpdateSuccess'));
      setSessions(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s));
    } catch {
      toast.error(t('Admin.common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('Admin.common.confirmDelete'))) return;
    try {
      await api.delete(`/admin/sessions/${id}`);
      toast.success(t('Admin.common.deleteSuccess'));
      void fetchSessions(true);
    } catch {
      toast.error(t('Admin.common.deleteError'));
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const term = searchTerm.toLowerCase();
      return (
        s.title.toLowerCase().includes(term) ||
        s.track?.title.toLowerCase().includes(term) ||
        s.learningPath?.title.toLowerCase().includes(term)
      );
    });
  }, [sessions, searchTerm]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video size={16} className="text-red-500" />;
      case 'PDF': return <FileText size={16} className="text-orange-500" />;
      case 'TEXT': return <Type size={16} className="text-blue-500" />;
      default: return <Layers size={16} className="text-purple-500" />;
    }
  };

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]" />
          <Input
            type="search"
            placeholder={t('Admin.sessionsPage.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 ps-11 pe-4 text-sm focus:ring-2 focus:ring-[color:var(--color-primary-soft)] transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 w-12 rounded-2xl border-gray-100 bg-gray-50/50 text-gray-500"
            onClick={() => void fetchSessions(true)}
          >
            <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={18} />
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
            onClick={() => setIsPathModalOpen(true)}
          >
            <Plus size={16} className="me-2" />
            {t('Admin.sessionsPage.learningPath.create')}
          </Button>
          <Button
            variant="primary"
            className="h-12 rounded-2xl px-6 font-bold shadow-lg shadow-[color:var(--color-primary-soft)]"
            onClick={() => {
              setSelectedSession(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} className="me-2" />
            {t('Admin.sessionsPage.create')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">
                  {t('Admin.sessionsPage.table.title')}
                </TableHead>
                <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">
                  {t('Admin.sessionsPage.table.track')}
                </TableHead>
                <TableHead className="px-6 py-4 uppercase tracking-widest text-xs font-bold text-gray-400">
                  {t('Admin.sessionsPage.table.path')}
                </TableHead>
                <TableHead className="px-6 py-4 text-center uppercase tracking-widest text-xs font-bold text-gray-400">
                   {t('Admin.sessionsPage.table.order')}
                </TableHead>
                <TableHead className="px-6 py-4 text-center uppercase tracking-widest text-xs font-bold text-gray-400">
                  {t('Admin.sessionsPage.table.status')}
                </TableHead>
                <TableHead className="px-6 py-4 text-end uppercase tracking-widest text-xs font-bold text-gray-400">
                  {t('Admin.common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredSessions.map((session) => (
                  <MotionTableRow
                    key={session.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-gray-50/30"
                  >
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-600 transition-colors group-hover:bg-white group-hover:shadow-sm">
                          {getIcon(session.contentType)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 line-clamp-1">{session.title}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {session.contentType} • {session.duration || 0} min
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-5">
                       <Badge variant="outline" className="rounded-lg border-gray-100 bg-gray-50 py-1 text-[11px] font-bold text-gray-600">
                         {session.track?.title || '—'}
                       </Badge>
                    </TableCell>

                    <TableCell className="px-6 py-5 text-sm font-medium text-gray-500">
                      {session.learningPath?.title || t('Common.none')}
                    </TableCell>

                    <TableCell className="px-6 py-5 text-center">
                       <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-xs font-bold text-gray-600">
                         #{session.order}
                       </div>
                    </TableCell>

                    <TableCell className="px-6 py-5">
                      <div className="flex justify-center">
                        <Switch
                          checked={session.isActive}
                          onCheckedChange={() => void handleToggleActive(session.id, session.isActive)}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-5 text-end">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl border-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedSession(session);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-xl border-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => void handleDelete(session.id)}
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

      {/* Session Modal */}
      <SessionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        session={selectedSession}
        onSuccess={() => void fetchSessions(true)}
      />

      {/* Learning Path Modal */}
      <LearningPathModal
        open={isPathModalOpen}
        onOpenChange={setIsPathModalOpen}
        onSuccess={() => void fetchSessions(true)}
      />
    </div>
  );
}

/**
 * 🎬 Session Logic & Modal
 */
function SessionModal({ open, onOpenChange, session, onSuccess }: { open: boolean, onOpenChange: (o: boolean) => void, session: Session | null, onSuccess: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<{ id: string, title: string }[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [showTrackSelect, setShowTrackSelect] = useState(false);

  const [formData, setFormData] = useState({
    trackId: '',
    trackTitle: '',
    learningPathId: '',
    title: '',
    description: '',
    contentType: 'VIDEO',
    videoUrl: '',
    pdfUrl: '',
    textContent: '',
    duration: 0,
    order: 0,
    isActive: true
  });

  useEffect(() => {
    if (open) {
      void api.get('/admin/sessions/tracks').then(res => setTracks(res.data?.data?.tracks || []));
    }
  }, [open]);

  useEffect(() => {
    if (open && session) {
      setFormData({
        trackId: session.trackId,
        trackTitle: session.track?.title || '',
        learningPathId: session.learningPathId || '',
        title: session.title,
        description: session.description || '',
        contentType: session.contentType,
        videoUrl: session.videoUrl || '',
        pdfUrl: session.pdfUrl || '',
        textContent: session.textContent || '',
        duration: session.duration || 0,
        order: session.order,
        isActive: session.isActive
      });
      loadPaths(session.trackId);
    } else if (open) {
      setFormData({
        trackId: '',
        trackTitle: '',
        learningPathId: '',
        title: '',
        description: '',
        contentType: 'VIDEO',
        videoUrl: '',
        pdfUrl: '',
        textContent: '',
        duration: 0,
        order: (getStore(KEYS.SESSIONS, []).length + 1),
        isActive: true
      });
    }
  }, [open, session]);

  const loadPaths = async (trackId: string) => {
     try {
       const res = await api.get(`/admin/sessions/learning-paths/${trackId}`);
       setLearningPaths(res.data?.data?.learningPaths || []);
     } catch {
       setLearningPaths([]);
     }
  };

  const filteredTracks = useMemo(() => {
    return tracks.filter(t => t.title.toLowerCase().includes(trackSearch.toLowerCase()));
  }, [tracks, trackSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { trackTitle, ...cleanData } = formData;
      const payload: any = { ...cleanData };

      // Prune irrelevant fields based on contentType and convert empty strings to null
      if (payload.contentType === 'VIDEO') {
        payload.pdfUrl = null;
        payload.textContent = null;
        if (!payload.videoUrl) payload.videoUrl = null;
      } else if (payload.contentType === 'PDF') {
        payload.videoUrl = null;
        payload.textContent = null;
        if (!payload.pdfUrl) payload.pdfUrl = null;
      } else if (payload.contentType === 'TEXT') {
        payload.videoUrl = null;
        payload.pdfUrl = null;
        if (!payload.textContent) payload.textContent = null;
      } else {
        // MIXED or others - just ensure empty strings are null
        if (!payload.videoUrl) payload.videoUrl = null;
        if (!payload.pdfUrl) payload.pdfUrl = null;
        if (!payload.textContent) payload.textContent = null;
      }

      if (session) {
        await api.patch(`/admin/sessions/${session.id}`, payload);
        toast.success(t('Admin.sessionsPage.toast.updateSuccess'));
      } else {
        await api.post('/admin/sessions', payload);
        toast.success(t('Admin.sessionsPage.toast.createSuccess'));
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(t('Admin.sessionsPage.toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-[2.5rem] border-none p-0 shadow-2xl">
        <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-7">
           <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]">
                <Video size={24} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{session ? t('Admin.sessionsPage.table.title') : t('Admin.sessionsPage.create')}</DialogTitle>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.phase.contentProvisioning')}</p>
              </div>
           </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="custom-scrollbar max-h-[75vh] overflow-y-auto p-8 space-y-6">
           {/* Section: Relationship */}
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.form.track')} *</label>
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setShowTrackSelect(!showTrackSelect)}
                >
                  <Input
                    readOnly
                    placeholder={t('Admin.sessionsPage.form.trackPlaceholder')}
                    value={formData.trackTitle}
                    className="h-14 cursor-pointer rounded-2xl border-gray-100 bg-gray-50 ps-5 font-bold shadow-inner"
                  />
                  <ChevronDown className={`absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${showTrackSelect ? 'rotate-180' : ''}`} size={18} />
                </div>

                {showTrackSelect && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 w-full mt-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
                      <Input 
                        autoFocus
                        placeholder={t('Admin.sessionsPage.form.trackSearchPlaceholder')}
                        value={trackSearch}
                        onChange={(e) => setTrackSearch(e.target.value)}
                        className="mb-2 h-10 border-none bg-gray-50 rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                         {filteredTracks.map(track => (
                           <div 
                             key={track.id}
                             className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${formData.trackId === track.id ? 'bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary)]' : 'hover:bg-gray-50'}`}
                             onClick={(e) => {
                               e.stopPropagation();
                               setFormData(f => ({ ...f, trackId: track.id, trackTitle: track.title, learningPathId: '' }));
                               loadPaths(track.id);
                               setShowTrackSelect(false);
                             }}
                           >
                             <span className="text-sm font-bold">{track.title}</span>
                             {formData.trackId === track.id && <Check size={16} />}
                           </div>
                         ))}
                      </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.form.path')}</label>
                <Select
                  disabled={!formData.trackId}
                  value={formData.learningPathId}
                  onValueChange={(v) => setFormData(f => ({ ...f, learningPathId: v }))}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-5 font-bold shadow-inner">
                    <SelectValue placeholder={t('Admin.sessionsPage.form.pathPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                    {learningPaths.map(p => (
                      <SelectItem key={p.id} value={p.id} className="rounded-xl font-medium focus:bg-[color:var(--color-primary-soft)]">{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
           </div>

           {/* Section: Basic Info */}
           <div className="space-y-6 rounded-3xl border border-gray-50 bg-gray-50/20 p-6">
              <div className="space-y-2">
                 <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.form.title')} *</label>
                 <Input 
                   required
                   value={formData.title}
                   onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-white font-bold shadow-sm"
                 />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.form.contentType')}</label>
                   <Select value={formData.contentType} onValueChange={(v) => setFormData(f => ({ ...f, contentType: v as any }))}>
                      <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-white font-bold shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
<SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                          <SelectItem value="VIDEO" className="rounded-xl">{t('Admin.sessionsPage.contentType.VIDEO')}</SelectItem>
                          <SelectItem value="PDF" className="rounded-xl">{t('Admin.sessionsPage.contentType.PDF')}</SelectItem>
                          <SelectItem value="TEXT" className="rounded-xl">{t('Admin.sessionsPage.contentType.TEXT')}</SelectItem>
                          <SelectItem value="MIXED" className="rounded-xl">{t('Admin.sessionsPage.contentType.MIXED')}</SelectItem>
                       </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.form.duration')}</label>
                   <Input 
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(f => ({ ...f, duration: parseInt(e.target.value) }))}
                      className="h-14 rounded-2xl border-gray-100 bg-white font-bold shadow-sm"
                   />
                </div>
              </div>
           </div>

           {/* Section: Conditional Content */}
           <AnimatePresence mode="wait">
              {formData.contentType === 'VIDEO' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                    <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.form.videoUrl')}</label>
                    <Input 
                      placeholder={t('Admin.sessionsPage.form.videoUrlPlaceholder')}
                      value={formData.videoUrl}
                      onChange={(e) => setFormData(f => ({ ...f, videoUrl: e.target.value }))}
                      className="h-14 rounded-2xl border-gray-100 font-medium"
                    />
                </motion.div>
              )}
              {formData.contentType === 'PDF' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                    <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.form.pdfUrl')}</label>
                    <Input 
                      placeholder={t('Admin.sessionsPage.form.pdfUrlPlaceholder')}
                      value={formData.pdfUrl}
                      onChange={(e) => setFormData(f => ({ ...f, pdfUrl: e.target.value }))}
                      className="h-14 rounded-2xl border-gray-100 font-medium"
                    />
                </motion.div>
              )}
              {formData.contentType === 'TEXT' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                    <label className="ms-1 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.form.textContent')}</label>
                    <Textarea 
                      rows={5}
                      value={formData.textContent}
                      onChange={(e) => setFormData(f => ({ ...f, textContent: e.target.value }))}
                      className="rounded-2xl border-gray-100 font-medium p-4 resize-none"
                    />
                </motion.div>
              )}
           </AnimatePresence>

           {/* Footer */}
           <div className="flex items-center justify-between border-t border-gray-100 pt-8 mt-2">
              <div className="flex items-center gap-4">
                 <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData(f => ({ ...f, isActive: v }))} />
                 <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('Admin.sessionsPage.form.isActive')}</span>
              </div>
              <div className="flex gap-4">
                 <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-14 rounded-2xl px-10 border-gray-100">
                    {t('Common.cancel')}
                 </Button>
                 <Button disabled={loading || !formData.trackId} type="submit" className="h-14 rounded-2xl px-12 font-bold shadow-xl shadow-[color:var(--color-primary-soft)]">
                    {loading ? <RefreshCcw size={18} className="animate-spin" /> : (session ? t('Common.save') : t('Common.create'))}
                 </Button>
              </div>
           </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 📂 Learning Path Modal
 */
function LearningPathModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (o: boolean) => void, onSuccess: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<{ id: string, title: string }[]>([]);
  const [formData, setFormData] = useState({ trackId: '', title: '', description: '', order: 0 });

  useEffect(() => {
    if (open) void api.get('/admin/sessions/tracks').then(res => setTracks(res.data?.data?.tracks || []));
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/sessions/learning-paths', formData);
      toast.success(t('Admin.sessionsPage.toast.pathCreateSuccess'));
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(t('Admin.common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-8">
         <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t('Admin.sessionsPage.learningPath.create')}</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.form.track')}</label>
               <Select onValueChange={(v) => setFormData(f => ({ ...f, trackId: v }))}>
                  <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100">
                    <SelectValue placeholder="Select Program" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {tracks.map(t => <SelectItem key={t.id} value={t.id} className="rounded-xl">{t.title}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.learningPath.name')}</label>
               <Input required value={formData.title} onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))} className="h-14 rounded-2xl bg-gray-50 border-gray-100" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.learningPath.description')} <span className="text-[10px] opacity-70">(Optional)</span></label>
               <Textarea 
                 placeholder="Brief overview of this chapter..."
                 value={formData.description} 
                 onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} 
                 className="rounded-2xl bg-gray-50 border-gray-100 resize-none" 
               />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.sessionsPage.learningPath.order')}</label>
               <Input type="number" value={formData.order} onChange={(e) => setFormData(f => ({ ...f, order: parseInt(e.target.value) }))} className="h-14 rounded-2xl bg-gray-50 border-gray-100" />
            </div>
            <Button disabled={loading || !formData.trackId} type="submit" className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-[color:var(--color-primary-soft)]">
               {loading ? <RefreshCcw size={18} className="animate-spin" /> : t('Common.create')}
            </Button>
         </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper for mock storage usage in order field
function getStore<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}
const KEYS = { SESSIONS: 'academy_mock_sessions' };
