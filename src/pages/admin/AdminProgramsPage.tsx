import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Plus
} from 'lucide-react';

import { api } from '../../lib/axios';
import type { Program } from '../../types/academy';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const MotionTableRow = motion(TableRow as any);

function ProgramsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex h-11 w-full animate-pulse rounded-xl bg-gray-100" />
      <div className="rounded-2xl border border-gray-100 bg-white">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex h-16 animate-pulse items-center gap-4 border-b border-gray-50 px-6">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />
            <div className="flex px-4 flex-col gap-2">
              <div className="h-3 w-32 rounded bg-gray-100" />
              <div className="h-2 w-20 rounded bg-gray-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminProgramsPage() {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await api.get('/admin/programs');
      const raw = response.data?.data?.programs ?? response.data?.programs ?? response.data?.data ?? response.data ?? [];
      const arr = Array.isArray(raw) ? raw : [];
      setPrograms(arr);
    } catch {
      toast.error(t('Admin.programsPage.toast.fetchError', 'Failed to fetch programs'));
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchPrograms();
  }, [fetchPrograms]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('Admin.programsPage.confirmDelete', 'Are you sure you want to delete this program?'))) return;
    
    try {
      await api.delete(`/admin/programs/${id}`);
      toast.success(t('Admin.programsPage.toast.deleteSuccess', 'Program deleted successfully'));
      void fetchPrograms();
    } catch {
      toast.error(t('Admin.programsPage.toast.deleteError', 'Failed to delete program'));
    }
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      return p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [programs, searchTerm]);

  if (loading && programs.length === 0) return <ProgramsTableSkeleton />;

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="group relative flex-1">
          <label className="sr-only">{t('Admin.programsPage.search', 'Search programs')}</label>
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[color:var(--color-primary)]"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={t('Admin.programsPage.search', 'Search programs...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-xl border-gray-200 bg-gray-50 ps-10 pe-3 text-sm focus-visible:bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-900"
            title={t('Admin.programsPage.refresh', 'Refresh')}
            onClick={() => {
              setLoading(true);
              void fetchPrograms();
            }}
          >
            <Loader2 className={loading ? 'animate-spin' : ''} size={18} />
          </Button>

          <Button
            type="button"
            variant="primary"
            className="h-11 rounded-xl px-4 font-bold shadow-md shadow-[color:var(--color-primary-soft)]"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            {t('Admin.programsPage.createProgram', 'Create Program')}
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="rounded-none border-0 bg-transparent shadow-none">
            <TableHeader>
              <TableRow className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.programsPage.programDetails', 'Program Details')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.programsPage.targetAge', 'Target Age')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.programsPage.duration', 'Duration')}
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.programsPage.price', 'Price')}
                </TableHead>
                <TableHead className="px-6 py-4 text-end text-xs font-bold uppercase tracking-widest text-gray-400">
                  {t('Admin.programsPage.settings', 'Settings')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                          <BookOpen size={28} />
                        </div>
                        <p className="text-base font-bold text-gray-900">
                          {t('Admin.programsPage.emptyTitle', 'No programs found. Create your first educational track to get started.')}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrograms.map((program) => (
                    <MotionTableRow
                      key={program.id}
                      layout={false}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group border-gray-50 hover:bg-gray-50/50"
                    >
                      <TableCell className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          {program.thumbnail ? (
                            <img src={program.thumbnail} alt={program.title} className="h-10 w-10 shrink-0 rounded-lg object-cover border" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-gray-50 text-gray-400 shadow-sm">
                              <BookOpen size={18} />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{program.title}</span>
                            <span className="text-xs text-gray-400 w-48 overflow-hidden text-ellipsis whitespace-nowrap">{program.description}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {program.minAge} - {program.maxAge} {t('Admin.programsPage.years', 'Years')}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                        {program.durationMonths} {t('Admin.programsPage.months', 'Mo')} • {program.sessionsPerWeek} {t('Admin.programsPage.sessionsPerWeek', 'Sessions/Wk')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                        {program.price} SAR
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-6 py-4 text-end">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-blue-600"
                            onClick={() => {
                              setSelectedProgram(program);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                            onClick={() => void handleDelete(program.id)}
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

      <ProgramModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchPrograms}
      />
      {selectedProgram && (
        <ProgramModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          program={selectedProgram}
          onSuccess={fetchPrograms}
        />
      )}
    </div>
  );
}

function ProgramModal({
  open,
  onOpenChange,
  program,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  program?: Program;
  onSuccess: () => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    minAge: 7,
    maxAge: 12,
    durationMonths: 1,
    sessionsPerWeek: 1,
    price: 0,
    thumbnail: '',
    skills: '',
    schedules: [] as { dayOfWeek: number; startTime: string }[]
  });

  useEffect(() => {
    if (open && program) {
      setFormData({
        title: program.title,
        description: program.description,
        minAge: program.minAge,
        maxAge: program.maxAge,
        durationMonths: program.durationMonths,
        sessionsPerWeek: program.sessionsPerWeek,
        price: program.price,
        thumbnail: program.thumbnail || '',
        skills: program.skills.join(', '),
        schedules: program.schedules || []
      });
    } else if (open) {
      setFormData({
        title: '',
        description: '',
        minAge: 7,
        maxAge: 12,
        durationMonths: 1,
        sessionsPerWeek: 1,
        price: 0,
        thumbnail: '',
        skills: '',
        schedules: []
      });
    }
  }, [open, program]);

  const addSchedule = () => {
    setFormData(f => ({
      ...f,
      schedules: [...f.schedules, { dayOfWeek: 1, startTime: '18:00' }]
    }));
  };

  const removeSchedule = (index: number) => {
    setFormData(f => ({
      ...f,
      schedules: f.schedules.filter((_, i) => i !== index)
    }));
  };

  const updateSchedule = (index: number, field: 'dayOfWeek' | 'startTime', value: any) => {
    setFormData(f => ({
      ...f,
      schedules: f.schedules.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      schedules: formData.schedules.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime
      }))
    };

    try {
      if (program) {
        await api.patch(`/admin/programs/${program.id}`, payload);
        toast.success(t('Admin.programsPage.toast.updateSuccess', 'Program updated successfully'));
      } else {
        await api.post('/admin/programs', payload);
        toast.success(t('Admin.programsPage.toast.createSuccess', 'Program created successfully'));
      }
      onOpenChange(false);
      await onSuccess();
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        toast.error(err.response.data?.message || t('Admin.programsPage.toast.validationError', 'Validation error. Please check your inputs.'));
        setLoading(false);
        return;
      }
      toast.error(t('Admin.programsPage.toast.error', 'Operation failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {program ? t('Admin.programsPage.editProgram', 'Edit Program') : t('Admin.programsPage.newProgram', 'New Program')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('Admin.programsPage.title', 'Title')}</label>
            <Input required minLength={3} value={formData.title} onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('Admin.programsPage.description', 'Description')}</label>
            <Input required minLength={3} value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Admin.programsPage.minAge', 'Min Age')}</label>
              <Input type="number" required min={0} value={formData.minAge} onChange={(e) => setFormData(f => ({ ...f, minAge: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Admin.programsPage.maxAge', 'Max Age')}</label>
              <Input type="number" required min={0} value={formData.maxAge} onChange={(e) => setFormData(f => ({ ...f, maxAge: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Admin.programsPage.durationMonths', 'Duration (Months)')}</label>
              <Input type="number" required min={1} value={formData.durationMonths} onChange={(e) => setFormData(f => ({ ...f, durationMonths: parseInt(e.target.value) || 1 }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Admin.programsPage.sessionsPerWeek', 'Sessions/Week')}</label>
              <Input type="number" required min={1} value={formData.sessionsPerWeek} onChange={(e) => setFormData(f => ({ ...f, sessionsPerWeek: parseInt(e.target.value) || 1 }))} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('Admin.programsPage.price', 'Price')}</label>
            <Input type="number" required min={0} value={formData.price} onChange={(e) => setFormData(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('Admin.programsPage.thumbnail', 'Image URL')}</label>
            <Input type="url" placeholder="https://..." value={formData.thumbnail} onChange={(e) => setFormData(f => ({ ...f, thumbnail: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('Admin.programsPage.skills', 'Skills (comma separated)')}</label>
            <Input required placeholder="Logic, Python, ..." value={formData.skills} onChange={(e) => setFormData(f => ({ ...f, skills: e.target.value }))} />
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold">{t('Admin.programsPage.weeklySchedules', 'Weekly Schedules')}</label>
              <Button type="button" variant="outline" size="sm" onClick={addSchedule} className="h-8 rounded-lg gap-1 text-xs">
                <Plus size={14} />
                {t('Admin.programsPage.addSchedule', 'Add')}
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.schedules.map((schedule, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select 
                    value={schedule.dayOfWeek.toString()} 
                    onValueChange={(v) => updateSchedule(idx, 'dayOfWeek', parseInt(v))}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {[0,1,2,3,4,5,6].map(d => (
                        <SelectItem key={d} value={d.toString()} className="text-xs">
                          {t(`Admin.programsPage.days.${d}`, ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input 
                    type="time" 
                    value={schedule.startTime} 
                    onChange={(e) => updateSchedule(idx, 'startTime', e.target.value)}
                    className="h-10 w-24 rounded-xl bg-white text-xs"
                  />
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500" 
                    onClick={() => removeSchedule(idx)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {formData.schedules.length === 0 && (
                <p className="text-center text-[10px] text-gray-400 font-medium py-2">
                  {t('Admin.programsPage.noSchedules', 'No fixed schedules set for this live course.')}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('Admin.programsPage.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {program ? t('Admin.programsPage.saveChanges', 'Save Changes') : t('Admin.programsPage.create', 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
