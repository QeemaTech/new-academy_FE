import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Plus, Pencil, Trash2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';

import { api } from '../../lib/axios';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';


type Track = { id: string; title: string; recordedPrice: number };
type Bundle = {
  id: string;
  title: string;
  description: string | null;
  discountedPrice: number;
  isActive: boolean;
  tracks: { track: Track }[];
};

export default function AdminBundlesPage() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  const bundlesQ = useQuery({
    queryKey: ['admin', 'bundles'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Bundle[] }>('/admin/bundles');
      return data.data;
    },
  });

  const tracksQ = useQuery({
    queryKey: ['admin', 'programs'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { programs: Track[] } }>('/admin/programs');
      return data.data.programs;
    },
  });

  const bundles = bundlesQ.data ?? [];
  const tracks = tracksQ.data ?? [];

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDiscountedPrice('');
    setIsActive(true);
    setSelectedTracks(new Set());
    setIsOpen(true);
  };

  const openEdit = (b: Bundle) => {
    setEditingId(b.id);
    setTitle(b.title);
    setDescription(b.description || '');
    setDiscountedPrice(b.discountedPrice);
    setIsActive(b.isActive);
    setSelectedTracks(new Set(b.tracks.map((bt) => bt.track.id)));
    setIsOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        description: description || null,
        discountedPrice: Number(discountedPrice),
        isActive,
        trackIds: Array.from(selectedTracks),
      };

      if (editingId) {
        return api.patch(`/admin/bundles/${editingId}`, payload);
      } else {
        return api.post('/admin/bundles', payload);
      }
    },
    onSuccess: () => {
      toast.success(
        editingId
          ? t('Admin.bundles.toast.updateSuccess', { defaultValue: 'تم التحديث بنجاح' })
          : t('Admin.bundles.toast.createSuccess', { defaultValue: 'تم الإنشاء بنجاح' })
      );
      setIsOpen(false);
      void qc.invalidateQueries({ queryKey: ['admin', 'bundles'] });
    },
    onError: (err) => {
      const msg = isAxiosError(err) ? (err.response?.data as any)?.message : undefined;
      toast.error(msg || t('Admin.bundles.toast.error', { defaultValue: 'حدث خطأ ما' }));
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/bundles/${id}`),
    onSuccess: () => {
      toast.success(t('Admin.bundles.toast.deleteSuccess', { defaultValue: 'تم החذف بنجاح' }));
      void qc.invalidateQueries({ queryKey: ['admin', 'bundles'] });
    },
  });

  const toggleTrack = (id: string) => {
    const newSet = new Set(selectedTracks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTracks(newSet);
  };

  // Original Price UX
  const totalOriginalPrice = useMemo(() => {
    return Array.from(selectedTracks).reduce((acc, id) => {
      const t = tracks.find((x) => x.id === id);
      return acc + (t?.recordedPrice || 0);
    }, 0);
  }, [selectedTracks, tracks]);

  const currency = useMemo(() => 'SAR', []);
  const fmt = (n: number) =>
    new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#0b2a5c]" />
            {t('Admin.bundles.title', { defaultValue: 'إدارة العروض المجمعة' })}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {t('Admin.bundles.subtitle', { defaultValue: 'إنشاء وتعديل وحذف العروض الخاصة للمسارات لتشجيع التسجيل' })}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#2dd4bf] text-[#0b2a5c] hover:bg-[#22c3b0] font-black rounded-xl shadow-md"
        >
          <Plus className="w-4 h-4 me-2" />
          {t('Admin.bundles.create', { defaultValue: 'إنشاء عرض جديد' })}
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-bold">{t('Admin.bundles.table.title', { defaultValue: 'اسم العرض' })}</TableHead>
              <TableHead className="font-bold text-center">{t('Admin.bundles.table.tracksCount', { defaultValue: 'عدد المسارات' })}</TableHead>
              <TableHead className="font-bold">{t('Admin.bundles.table.price', { defaultValue: 'السعر المخفض' })}</TableHead>
              <TableHead className="font-bold">{t('Admin.bundles.table.status', { defaultValue: 'الحالة' })}</TableHead>
              <TableHead className="font-bold text-end">{t('Admin.bundles.table.actions', { defaultValue: 'الإجراءات' })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                  {t('Common.noResults', { defaultValue: 'لا توجد نتائج' })}
                </TableCell>
              </TableRow>
            ) : (
              bundles.map((b) => (
                <TableRow key={b.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="font-black text-slate-900">{b.title}</div>
                    {b.description && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">{b.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-black bg-slate-50 text-slate-600 rounded-lg">
                      {b.tracks.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-black text-[#0b2a5c]" dir="ltr">
                    {fmt(b.discountedPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'rounded-lg font-black',
                        b.isActive ? 'bg-[#2dd4bf]/20 text-[#0b2a5c] hover:bg-[#2dd4bf]/30' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {b.isActive ? t('Common.active', { defaultValue: 'نشط' }) : t('Common.inactive', { defaultValue: 'غير نشط' })}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end space-x-2 space-x-reverse">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-[#0b2a5c] rounded-xl" onClick={() => openEdit(b)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                      onClick={() => {
                        if (confirm(t('Common.confirmDelete', { defaultValue: 'هل أنت متأكد؟' }))) {
                          deleteMut.mutate(b.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#0b2a5c]">
              {editingId ? t('Admin.bundles.edit', { defaultValue: 'تعديل العرض' }) : t('Admin.bundles.create', { defaultValue: 'إنشاء عرض جديد' })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">{t('Admin.bundles.form.title', { defaultValue: 'عنوان العرض' })}</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-xl bg-slate-50/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">{t('Admin.bundles.form.description', { defaultValue: 'وصف العرض' })}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] rounded-xl bg-slate-50/50 resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">{t('Admin.bundles.form.selectTracks', { defaultValue: 'اختر المسارات' })}</Label>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <div className="h-48 overflow-y-auto p-2 custom-scrollbar">
                  <div className="space-y-1">
                    {tracks.map((t) => {
                      const selected = selectedTracks.has(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTrack(t.id)}
                          className={cn(
                            'w-full flex items-center justify-between p-3 rounded-xl text-start transition-colors',
                            selected ? 'bg-white border-2 border-[#2dd4bf] shadow-sm' : 'border-2 border-transparent hover:bg-slate-100'
                          )}
                        >
                          <span className={cn('font-bold text-sm', selected ? 'text-[#0b2a5c]' : 'text-slate-700')}>
                            {t.title}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400" dir="ltr">{fmt(t.recordedPrice)}</span>
                            <div className={cn(
                              'w-5 h-5 rounded-md flex items-center justify-center border transition-colors',
                              selected ? 'bg-[#2dd4bf] border-[#2dd4bf] text-[#0b2a5c]' : 'border-slate-300 bg-white'
                            )}>
                              {selected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">{t('Admin.bundles.form.discountedPrice', { defaultValue: 'السعر المخفض' })}</Label>
              <Input
                type="number"
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value ? Number(e.target.value) : '')}
                className="h-11 rounded-xl bg-slate-50/50 text-lg font-black"
                dir="ltr"
              />
              {selectedTracks.size > 0 && (
                <div className="text-sm font-bold text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-2 border border-amber-200/50 flex items-center justify-between">
                  <span>{t('Admin.bundles.form.originalPrice', { defaultValue: `القيمة الأصلية: ${totalOriginalPrice}`, price: totalOriginalPrice })}</span>
                  <span className="text-xs opacity-75">
                    ({selectedTracks.size} مسارات)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="font-bold text-slate-700 cursor-pointer" htmlFor="isActiveBundle">
                {t('Admin.bundles.form.isActive', { defaultValue: 'تفعيل العرض' })}
              </Label>
              <Switch id="isActiveBundle" checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-xl flex-1 font-bold"
                onClick={() => setIsOpen(false)}
                disabled={saveMut.isPending}
              >
                {t('Common.cancel', { defaultValue: 'إلغاء' })}
              </Button>
              <Button
                className="rounded-xl flex-1 bg-[#0b2a5c] text-white hover:bg-[#06122b] font-black"
                onClick={() => saveMut.mutate()}
                disabled={saveMut.isPending || !title || discountedPrice === '' || selectedTracks.size === 0}
              >
                {saveMut.isPending ? t('Common.saving', { defaultValue: 'جاري الحفظ...' }) : t('Common.save', { defaultValue: 'حفظ' })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
