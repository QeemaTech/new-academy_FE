import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppCard from '../../components/common/AppCard';
import Table from '../../components/common/Table';
import { getProgram } from '../../data/programs';

const TRIAL_LS_KEY = 'na_trial_bookings';

export default function AdminSupport() {
  const { t } = useTranslation();
  const [trials, setTrials] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRIAL_LS_KEY);
      setTrials(raw ? JSON.parse(raw) : []);
    } catch {
      setTrials([]);
    }
  }, []);

  const columns = [
    { key: 'parentName', label: t('Admin.supportPage.colParentName') },
    { key: 'childName', label: t('Admin.supportPage.colChildName') },
    { key: 'childAge', label: t('Admin.supportPage.colChildAge') },
    { key: 'email', label: t('Admin.supportPage.colEmail') },
    { key: 'phone', label: t('Admin.supportPage.colPhone') },
    {
      key: 'programId',
      label: t('Admin.supportPage.colProgram'),
      render: (val: string) => {
        const program = getProgram(val);
        return program?.title || val;
      },
    },
    {
      key: 'preferredDate',
      label: t('Admin.supportPage.colPreferredDate'),
      render: (val: string) => new Date(val).toLocaleDateString('ar-SA'),
    },
    {
      key: 'status',
      label: t('Admin.supportPage.colStatus'),
      render: (val: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
          pending: { label: t('Admin.supportPage.statusPending'), class: 'na-badge--warning' },
          confirmed: { label: t('Admin.supportPage.statusConfirmed'), class: 'na-badge--success' },
        };
        const status = statusMap[val] || { label: val, class: '' };
        return <span className={`na-badge ${status.class}`}>{status.label}</span>;
      },
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">{t('Admin.supportPage.title')}</h2>
        <p className="text-muted-custom mb-0">{t('Admin.supportPage.subtitle')}</p>
      </div>

      <AppCard>
        <h5 className="mb-3">{t('Admin.supportPage.trialRequests')}</h5>
        <Table columns={columns} data={trials} emptyMessage={t('Admin.supportPage.empty')} />
      </AppCard>
    </div>
  );
}

