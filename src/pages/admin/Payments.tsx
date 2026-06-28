import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { api } from '../../lib/axios';
import AppCard from '../../components/common/AppCard';
import Table from '../../components/common/Table';

export default function AdminPayments() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    void api
      .get('/admin/payments')
      .then((res) => setPayments(res.data?.data ?? res.data ?? []))
      .catch(() => {
        toast.error(t('Admin.paymentsPage.toast.fetchError'));
        setPayments([]);
      });
  }, [t]);

  const columns = [
    { key: 'description', label: t('Admin.paymentsPage.colDescription') },
    {
      key: 'amount',
      label: t('Admin.paymentsPage.colAmount'),
      render: (val: number) => <span className="fw-bold">{val} {t('Common.currency')}</span>,
    },
    {
      key: 'date',
      label: t('Admin.paymentsPage.colDate'),
      render: (val: string) => new Date(val).toLocaleDateString('ar-SA'),
    },
    { key: 'method', label: t('Admin.paymentsPage.colMethod') },
    {
      key: 'status',
      label: t('Admin.paymentsPage.colStatus'),
      render: (val: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
          paid: { label: t('Admin.paymentsPage.statusPaid'), class: 'na-badge--success' },
          pending: { label: t('Admin.paymentsPage.statusPending'), class: 'na-badge--warning' },
          overdue: { label: t('Admin.paymentsPage.statusOverdue'), class: 'na-badge--danger' },
        };
        const status = statusMap[val] || { label: val, class: '' };
        return <span className={`na-badge ${status.class}`}>{status.label}</span>;
      },
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">{t('Admin.paymentsPage.title')}</h2>
        <p className="text-muted-custom mb-0">{t('Admin.paymentsPage.subtitle')}</p>
      </div>

      <AppCard>
        <Table columns={columns} data={payments} emptyMessage={t('Admin.paymentsPage.empty')} />
      </AppCard>
    </div>
  );
}

