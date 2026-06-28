import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, Route, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { api } from '../../../lib/axios';

interface Track {
  id: string;
  title: string;
}

interface TeacherTracksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function TeacherTracksDialog({ open, onOpenChange, userId, userName }: TeacherTracksDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open && userId) {
      void loadData();
    }
  }, [open, userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tracksRes, assignedRes] = await Promise.all([
        api.get('/admin/teachers/tracks'),
        api.get(`/admin/teachers/${userId}/tracks`)
      ]);
      setAllTracks(tracksRes.data?.data?.tracks ?? []);
      setSelectedIds((assignedRes.data?.data?.tracks ?? []).map((t: Track) => t.id));
    } catch (err) {
      toast.error(t('Admin.usersPage.toast.fetchError', 'Failed to load track data'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/admin/teachers/${userId}/tracks`, { trackIds: selectedIds });
      toast.success(t('Admin.usersPage.toast.saveSuccess', 'Teacher tracks updated successfully'));
      onOpenChange(false);
    } catch (err) {
      toast.error(t('common.error', 'Failed to save changes'));
    } finally {
      setSaving(false);
    }
  };

  const filteredTracks = allTracks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden rounded-3xl border-gray-100">
        <div className="bg-[#0F172A] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#10B981]/20 p-2 text-[#10B981]">
              <Route size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{t('Admin.usersPage.teacherTracks.title', 'Track Assignments')}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {t('Admin.usersPage.teacherTracks.desc', 'Assign courses to {{name}}', { name: userName })}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={t('common.searchPlaceholder', 'Search tracks...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl bg-gray-50 border-gray-100"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-emerald-500" />
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="text-center py-10 text-gray-400 italic">
                {t('common.noResults', 'No tracks found')}
              </div>
            ) : (
              filteredTracks.map(track => {
                const isSelected = selectedIds.includes(track.id);
                return (
                  <div
                    key={track.id}
                    onClick={() => handleToggle(track.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 group shadow-sm'
                        : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-bold text-sm tracking-tight">{track.title}</span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'
                    }`}>
                      {isSelected ? <Check size={14} strokeWidth={3} /> : <X size={14} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-8 shadow-lg shadow-gray-200"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
