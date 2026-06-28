import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Layers, ShoppingBag, Sparkles } from 'lucide-react';
import { fetchPublicBundles, fetchPublicTracks } from '../../api/public';
import type { PublicBundle, PublicTrack } from '../../api/public';
import { purchaseBundle, purchaseTrack, redeemSubscriptionTrack } from '../../api/parentPurchase';
import { api } from '../../lib/axios';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Link } from 'react-router-dom';

type ChildBrief = {
  id: string;
  fullName: string;
  enrolledTrackIds?: string[];
  subscriptions?: Array<{
    id: string;
    status: string;
    endDate: string;
    enrolledTracksCount: number;
    package: { name: string; maxTracks: number };
  }>;
};

function paceLabel(t: PublicTrack) {
  return `${t.estimatedWeeks} Weeks | ${t.recommendedLessonsPerWeek} Sessions/week`;
}

export default function ParentStore() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();

  const [activeChildId, setActiveChildId] = useState<string>('');

  const childrenQ = useQuery({
    queryKey: ['parent', 'children', 'brief'],
    queryFn: async () => {
      const res = await api.get<{ data: { children: ChildBrief[] } }>('/parent/children');
      return res.data.data.children;
    },
  });

  const tracksQ = useQuery({
    queryKey: ['public', 'tracks', 'store'],
    queryFn: fetchPublicTracks,
    staleTime: 30_000,
  });

  const bundlesQ = useQuery({
    queryKey: ['public', 'bundles'],
    queryFn: fetchPublicBundles,
    staleTime: 30_000,
  });

  const buyTrackMut = useMutation({
    mutationFn: (body: { trackId: string; purchaseType: 'LIVE' | 'RECORDED' }) =>
      purchaseTrack({ childId: activeChildId, ...body }),
    onSuccess: () => {
      toast.success(t('Parent.store.toast.success', { defaultValue: 'تمت عملية الشراء بنجاح' }));
      void qc.invalidateQueries({ queryKey: ['parent', 'children'] });
      void qc.invalidateQueries({ queryKey: ['parent', 'child'] });
      void qc.invalidateQueries({ queryKey: ['student-tracks'] });
      void qc.invalidateQueries({ queryKey: ['parent', 'payments'] });
    },
    onError: (e) => {
      const msg = isAxiosError(e) ? (e.response?.data as { message?: string })?.message : undefined;
      toast.error(msg || t('Parent.store.toast.fail', { defaultValue: 'تعذر إتمام الشراء' }));
    },
  });

  const buyBundleMut = useMutation({
    mutationFn: (bundleId: string) => purchaseBundle({ childId: activeChildId, bundleId }),
    onSuccess: () => {
      toast.success(t('Parent.store.toast.success', { defaultValue: 'تمت عملية الشراء بنجاح' }));
      void qc.invalidateQueries({ queryKey: ['parent', 'children'] });
      void qc.invalidateQueries({ queryKey: ['parent', 'child'] });
      void qc.invalidateQueries({ queryKey: ['student-tracks'] });
      void qc.invalidateQueries({ queryKey: ['parent', 'payments'] });
    },
    onError: (e) => {
      const msg = isAxiosError(e) ? (e.response?.data as { message?: string })?.message : undefined;
      toast.error(msg || t('Parent.store.toast.fail', { defaultValue: 'تعذر إتمام الشراء' }));
    },
  });

  const redeemMut = useMutation({
    mutationFn: (trackId: string) => redeemSubscriptionTrack({ childId: activeChildId, trackId }),
    onSuccess: () => {
      toast.success(t('Parent.store.toast.addToPlanSuccess', { defaultValue: 'Track successfully added to your plan!' }));
      void qc.invalidateQueries({ queryKey: ['parent', 'children'] });
      void qc.invalidateQueries({ queryKey: ['parent', 'child'] });
      void qc.invalidateQueries({ queryKey: ['student-tracks'] });
    },
    onError: (e) => {
      const msg = isAxiosError(e) ? (e.response?.data as { message?: string })?.message : undefined;
      toast.error(msg || t('Parent.store.toast.fail', { defaultValue: 'تعذر إتمام الشراء' }));
    },
  });

  const loading = childrenQ.isLoading || tracksQ.isLoading || bundlesQ.isLoading;

  const children = childrenQ.data ?? [];
  const tracks = tracksQ.data ?? [];
  const bundles = bundlesQ.data ?? [];

  const ownedSet = useMemo(() => {
    const child = children.find((c) => c.id === activeChildId);
    return new Set(child?.enrolledTrackIds ?? []);
  }, [children, activeChildId]);

  const activeSub = useMemo(() => {
    if (!activeChildId) return null;
    const child = children.find((c) => c.id === activeChildId);
    if (!child || !child.subscriptions) return null;
    const now = new Date().getTime();
    return child.subscriptions.find((s) => s.status === 'ACTIVE' && new Date(s.endDate).getTime() > now) || null;
  }, [children, activeChildId]);

  const remainingSlots = activeSub ? Math.max(0, activeSub.package.maxTracks - activeSub.enrolledTracksCount) : 0;

  const currency = useMemo(() => 'SAR', []);
  const fmt = (n: number) =>
    new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.20)]">
        <CardContent className="p-0">
          <div className="relative bg-linear-to-r from-[#050c1f] via-[#0b2a5c] to-[#06122b] px-5 py-5 text-white">
            <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background:radial-gradient(900px_circle_at_15%_0%,rgba(45,212,191,0.22),transparent_55%)]" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black ring-1 ring-white/10">
                  <Sparkles className="h-4 w-4 text-[#2dd4bf]" aria-hidden />
                  {t('Parent.store.badge', { defaultValue: 'متجر المسارات (Lifetime)' })}
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  {t('Parent.store.title', { defaultValue: 'اختر رحلة تعليمية منظمة' })}
                </h1>
                <p className="mt-1 text-sm font-bold text-white/75">
                  {t('Parent.store.subtitle', {
                    defaultValue: 'شراء مباشر لمسار LIVE أو RECORDED — وصول مدى الحياة',
                  })}
                </p>
              </div>
              <div className="w-full sm:w-[320px]">
                <Select value={activeChildId} onValueChange={setActiveChildId}>
                  <SelectTrigger className="h-11 rounded-2xl border-white/15 bg-white/8 font-black text-white">
                    <SelectValue placeholder={t('Parent.store.chooseChild', { defaultValue: 'اختر الابن' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Bundles */}
          {bundles.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Layers className="h-5 w-5 text-[#0b2a5c]" />
                <h2 className="text-lg font-black">{t('Parent.store.bundles', { defaultValue: 'العروض المجمّعة' })}</h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {bundles.map((b: PublicBundle) => (
                  <Card key={b.id} className="rounded-3xl border border-slate-200/60 bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-black text-slate-900">{b.title}</CardTitle>
                      {b.description ? (
                        <p className="text-sm font-bold text-slate-500">{b.description}</p>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activeChildId && b.tracks.some((t) => ownedSet.has(t.id)) ? (
                        <div className="rounded-3xl border border-amber-200/60 bg-amber-50/60 p-3 text-xs font-black text-amber-900">
                          {t('Parent.store.bundleOwnedWarn', {
                            defaultValue: 'تنبيه: الطفل يملك بعض المسارات داخل هذا العرض.',
                          })}
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-400">
                          {t('Parent.store.bundlePrice', { defaultValue: 'سعر العرض' })}
                        </span>
                        <span className="text-xl font-black text-[#06122b]" dir="ltr">
                          {fmt(b.discountedPrice)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.tracks.slice(0, 6).map((t) => (
                          <span key={t.id} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
                            {t.title}
                          </span>
                        ))}
                        {b.tracks.length > 6 ? (
                          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">
                            +{b.tracks.length - 6}
                          </span>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        disabled={!activeChildId || buyBundleMut.isPending || (activeChildId && b.tracks.some((t) => ownedSet.has(t.id)))}
                        className="w-full rounded-2xl bg-[#06122b] font-black shadow-md shadow-[#06122b]/15 hover:bg-[#050c1f]"
                        onClick={() => buyBundleMut.mutate(b.id)}
                      >
                        <ShoppingBag className="me-2 h-4 w-4" />
                        {t('Parent.store.buyBundle', { defaultValue: 'اشترِ العرض' })}
                      </Button>
                      {!activeChildId ? (
                        <p className="text-xs font-bold text-slate-500">{t('Parent.store.hintChild', { defaultValue: 'اختر الابن أولاً' })}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Tracks */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <ShoppingBag className="h-5 w-5 text-[#0b2a5c]" />
              <h2 className="text-lg font-black">{t('Parent.store.tracks', { defaultValue: 'المسارات' })}</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tracks.map((tr: PublicTrack) => (
                <Card key={tr.id} className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm">
                  <CardContent className="p-0">
                    <div className="relative bg-linear-to-br from-[#050c1f] via-[#0b2a5c] to-[#06122b] px-5 py-4 text-white">
                      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background:radial-gradient(900px_circle_at_20%_0%,rgba(45,212,191,0.22),transparent_55%)]" />
                      <p className="text-xs font-black uppercase tracking-wide text-white/75">
                        {t('Parent.store.pace', { defaultValue: 'Academic pace' })}
                      </p>
                      <p className="mt-1 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black ring-1 ring-white/10" dir="ltr">
                        {paceLabel(tr)}
                      </p>
                      <h3 className="mt-3 text-lg font-black">{tr.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm font-bold text-white/75">{tr.description}</p>
                    </div>

                    <div className="space-y-3 px-5 py-4">
                      {activeChildId && ownedSet.has(tr.id) ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-[#2dd4bf]/25 bg-linear-to-br from-[#06122b]/4 via-white to-[#2dd4bf]/10 px-4 py-3">
                          <span className="rounded-full bg-[#2dd4bf]/15 px-3 py-1 text-xs font-black text-[#0b2a5c] ring-1 ring-[#2dd4bf]/25">
                            {t('Parent.store.owned', { defaultValue: 'مملوك' })}
                          </span>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-2xl border-[#2dd4bf]/35 font-black text-[#0b2a5c] hover:bg-[#2dd4bf]/10"
                          >
                            <Link to={`/parent/children/${activeChildId}`}>
                              {t('Parent.store.goDashboard', { defaultValue: 'اذهب إلى لوحة التحكم' })}
                            </Link>
                          </Button>
                        </div>
                      ) : remainingSlots > 0 ? (
                        <div className="space-y-2">
                          <div className="rounded-2xl border border-[#0b2a5c]/10 bg-[#0b2a5c]/5 px-3 py-1.5 text-center text-xs font-black text-[#0b2a5c]">
                            {t('Parent.store.remainingSlots', { defaultValue: `Remaining Slots: ${remainingSlots}`, slots: remainingSlots })}
                          </div>
                          <Button
                            type="button"
                            disabled={!activeChildId || redeemMut.isPending}
                            className={cn(
                              'w-full rounded-2xl font-black shadow-md',
                              'bg-[#0b2a5c] text-white hover:bg-[#06122b]'
                            )}
                            onClick={() => redeemMut.mutate(tr.id)}
                          >
                            <Sparkles className="me-2 h-4 w-4 text-[#2dd4bf]" />
                            {t('Parent.store.addToPlan', { defaultValue: 'Add to Plan' })}
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            disabled={!activeChildId || buyTrackMut.isPending}
                            className={cn(
                              'rounded-2xl font-black shadow-md',
                              'bg-[#2dd4bf] text-[#06122b] hover:bg-[#22c3b0]'
                            )}
                            onClick={() => buyTrackMut.mutate({ trackId: tr.id, purchaseType: 'LIVE' })}
                          >
                            {t('Parent.store.buyLive', { defaultValue: 'Buy Live' })}
                            <span className="ms-2 tabular-nums" dir="ltr">
                              {fmt(tr.livePrice)}
                            </span>
                          </Button>
                          <Button
                            type="button"
                            disabled={!activeChildId || buyTrackMut.isPending}
                            variant="outline"
                            className="rounded-2xl border-slate-200 font-black text-slate-900 hover:bg-slate-50"
                            onClick={() => buyTrackMut.mutate({ trackId: tr.id, purchaseType: 'RECORDED' })}
                          >
                            {t('Parent.store.buyRecorded', { defaultValue: 'Buy Recorded' })}
                            <span className="ms-2 tabular-nums" dir="ltr">
                              {fmt(tr.recordedPrice)}
                            </span>
                          </Button>
                        </div>
                      )}
                      {!activeChildId ? (
                        <p className="text-xs font-bold text-slate-500">{t('Parent.store.hintChild', { defaultValue: 'اختر الابن أولاً' })}</p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

