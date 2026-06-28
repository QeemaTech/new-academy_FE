import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, CreditCard, Sparkles } from 'lucide-react';
import { api } from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { ParentTabEmpty } from '../../components/parent/ParentTabEmpty';
import { cn } from '../../lib/cn';

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  subscription: {
    child: { fullName: string };
    package: { name: string };
  } | null;
};

export default function ParentPayments() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['parent', 'payments'],
    queryFn: async () => {
      const res = await api.get<{ data: { payments: PaymentRow[] } }>('/parent/payments');
      return res.data.data.payments;
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  const rows = data ?? [];
  const pendingCount = rows.filter((r) => (r.status ?? '').toUpperCase() !== 'PAID').length;
  const pendingTotal = rows
    .filter((r) => (r.status ?? '').toUpperCase() !== 'PAID')
    .reduce((acc, r) => acc + (Number.isFinite(r.amount) ? r.amount : 0), 0);

  const formatMoney = (amount: number, currency: string) => `${amount} ${currency}`;

  const statusTone = (status: string) => {
    const s = (status ?? '').toUpperCase();
    if (s === 'PAID') return 'paid';
    if (s === 'PENDING' || s === 'UNPAID') return 'pending';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{t('Parent.payments.title')}</h1>
        <p className="mt-1 font-medium text-slate-500">{t('Parent.payments.subtitle')}</p>
      </div>

      {rows.length === 0 ? (
        <ParentTabEmpty
          icon={CreditCard}
          title={t('Parent.payments.empty')}
          description={t('Parent.payments.emptyHint')}
          action={
            <Button
              asChild
              className="rounded-2xl bg-[#06122b] font-bold shadow-md shadow-[#06122b]/15 hover:bg-[#050c1f]"
            >
              <Link to="/parent/children">{t('Parent.dashboard.viewChildren')}</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Value-add: Billing health banner + one-click CTA */}
          <Card className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.18)]">
            <CardContent className="p-0">
              <div className="relative bg-linear-to-r from-[#050c1f] via-[#0b2a5c] to-[#06122b] px-5 py-4 text-white">
                <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background:radial-gradient(900px_circle_at_15%_0%,rgba(45,212,191,0.22),transparent_55%)]" />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black ring-1 ring-white/10">
                      <Sparkles className="h-4 w-4 text-[#2dd4bf]" aria-hidden />
                      {t('Parent.payments.premiumBilling', { defaultValue: 'إدارة الفواتير (Premium)' })}
                    </div>
                    <p className="mt-2 text-sm font-bold text-white/80">
                      {pendingCount > 0
                        ? t('Parent.payments.pendingSummary', {
                            defaultValue: 'لديك {{count}} فاتورة تحتاج إجراء — المجموع: {{total}}',
                            count: pendingCount,
                            total: formatMoney(pendingTotal, rows[0]?.currency ?? 'SAR'),
                          })
                        : t('Parent.payments.allGood', { defaultValue: 'كل شيء مُسدّد. استمر!' })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="rounded-2xl bg-[#2dd4bf] font-black text-[#06122b] hover:bg-[#22c3b0]"
                    >
                      <Link to="/parent/checkout">
                        {t('Parent.payments.renewNow', { defaultValue: 'تجديد/ترقية الآن' })}
                        <ArrowUpRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-2xl border-white/15 bg-white/8 font-black text-white hover:bg-white/12"
                    >
                      <Link to="/parent/children">
                        {t('Parent.payments.backToLearners', { defaultValue: 'عرض الأبناء' })}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modern SaaS invoice list */}
          <Card className="rounded-3xl border border-slate-200/60 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black text-slate-900">{t('Parent.payments.tableTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rows.map((p) => {
                const tone = statusTone(p.status);
                const dateIso = p.paidAt ?? p.createdAt;
                return (
                  <div
                    key={p.id}
                    className="group flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/60 bg-white px-4 py-3 transition hover:bg-slate-50/70 hover:shadow-[0_18px_45px_-40px_rgba(6,18,43,0.25)]"
                  >
                    <div className="min-w-[220px]">
                      <p className="truncate font-black text-slate-900">
                        {p.subscription?.package.name ?? '—'}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-slate-500">
                        {t('Parent.payments.colLearner')}: {p.subscription?.child.fullName ?? '—'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-end">
                        <p className="font-black text-slate-900">
                          {formatMoney(p.amount, p.currency)}
                        </p>
                        <p className="text-xs font-bold text-slate-500" dir="ltr">
                          {new Date(dateIso).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1',
                          tone === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/70'
                            : tone === 'pending'
                              ? 'bg-amber-50 text-amber-700 ring-amber-200/70'
                              : 'bg-slate-50 text-slate-700 ring-slate-200/70'
                        )}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
