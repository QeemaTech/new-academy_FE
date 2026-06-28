import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { api } from '../../lib/axios';
import { useParentPortalStore } from '../../store/useParentPortalStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../../lib/cn';

type ChildApiRow = {
  id: string;
  fullName: string;
  username: string;
  age: number | null;
  avatar: string | null;
  isActive: boolean;
};

/**
 * Warm context bar: pick which learner profile to emphasize (multi-child households).
 */
export function ParentChildStrip({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { childrenList, selectedChildId, setChildrenList, setSelectedChildId } = useParentPortalStore();

  const { data: rawChildren } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: async (): Promise<ChildApiRow[]> => {
      const res = await api.get<{ data: { children: ChildApiRow[] } }>('/parent/children');
      return res.data.data.children;
    },
  });

  useEffect(() => {
    if (!rawChildren?.length) {
      if (rawChildren && rawChildren.length === 0) setChildrenList([]);
      return;
    }
    setChildrenList(
      rawChildren.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        username: c.username,
        age: c.age,
        avatar: c.avatar,
        isActive: c.isActive,
      }))
    );
  }, [rawChildren, setChildrenList]);

  useEffect(() => {
    if (childrenList.length === 0) {
      setSelectedChildId(null);
      return;
    }
    if (childrenList.length === 1 && !selectedChildId) {
      setSelectedChildId(childrenList[0].id);
      return;
    }
    if (selectedChildId && !childrenList.some((c) => c.id === selectedChildId)) {
      setSelectedChildId(childrenList[0]?.id ?? null);
    }
  }, [childrenList, selectedChildId, setSelectedChildId]);

  if (childrenList.length === 0) {
    return (
      <div
        className={cn(
          'mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#4178EF]/15 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm shadow-[#4178EF]/10',
          className
        )}
      >
        <Users className="h-5 w-5 shrink-0 text-[#4178EF]" aria-hidden />
        <span className="font-semibold">{t('Parent.childStrip.noChildren')}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-2 rounded-2xl border border-[#4178EF]/12 bg-white px-4 py-3 shadow-sm shadow-[#4178EF]/8 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <Users className="h-5 w-5 text-[#4178EF]" aria-hidden />
        {t('Parent.childStrip.label')}
      </div>
      {childrenList.length > 1 ? (
        <div className="w-full sm:max-w-xs">
          <Select
            value={selectedChildId ?? ''}
            onValueChange={(v) => setSelectedChildId(v || null)}
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/80 font-semibold">
              <SelectValue placeholder={t('Parent.childStrip.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {childrenList.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <span className="text-sm font-semibold text-[#4178EF]">{childrenList[0].fullName}</span>
      )}
    </div>
  );
}
