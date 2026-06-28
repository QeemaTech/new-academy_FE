import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, User, Bell, Shield, Paintbrush } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { UpdateProfileDialog } from './components/UpdateProfileDialog';
import { ChangePasswordDialog } from './components/ChangePasswordDialog';
import { AppearanceDialog } from './components/AppearanceDialog';
import { NotificationsDialog } from './components/NotificationsDialog';

export default function TeacherSettingsPage() {
  const { t } = useTranslation();
  const [activeDialog, setActiveDialog] = useState<'profile' | 'password' | 'appearance' | 'notifications' | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#0b2a5c] flex items-center gap-2">
          <Settings className="w-8 h-8 text-[#10B981]" />
          {t('Teacher.nav.settings', { defaultValue: 'الإعدادات' })}
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          إدارة تفضيلات الحساب، التنبيهات، والملف الشخصي
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-[#0b2a5c]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0b2a5c]">الملف الشخصي</h3>
            <p className="text-sm text-slate-500 font-medium">تحديث معلوماتك الشخصية والصورة الرمزية</p>
          </div>
          <Button variant="outline" className="mt-auto w-full font-bold" onClick={() => setActiveDialog('profile')}>تعديل الملف الشخصي</Button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0b2a5c]">التنبيهات</h3>
            <p className="text-sm text-slate-500 font-medium">إدارة تفضيلات الإشعارات والتنبيهات المباشرة</p>
          </div>
          <Button variant="outline" className="mt-auto w-full font-bold" onClick={() => setActiveDialog('notifications')}>إعدادات التنبيهات</Button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0b2a5c]">كلمة المرور والأمان</h3>
            <p className="text-sm text-slate-500 font-medium">تغيير كلمة المرور وإدارة جلسات الدخول</p>
          </div>
          <Button variant="outline" className="mt-auto w-full font-bold" onClick={() => setActiveDialog('password')}>إدارة الأمان</Button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-start gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
            <Paintbrush className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0b2a5c]">المظهر والتخصيص</h3>
            <p className="text-sm text-slate-500 font-medium">تغيير اللغة (العربية/الإنجليزية) وتفضيلات العرض</p>
          </div>
          <Button variant="outline" className="mt-auto w-full font-bold" onClick={() => setActiveDialog('appearance')}>تخصيص المظهر</Button>
        </div>
      </div>

      <UpdateProfileDialog isOpen={activeDialog === 'profile'} onClose={() => setActiveDialog(null)} />
      <ChangePasswordDialog isOpen={activeDialog === 'password'} onClose={() => setActiveDialog(null)} />
      <AppearanceDialog isOpen={activeDialog === 'appearance'} onClose={() => setActiveDialog(null)} />
      <NotificationsDialog isOpen={activeDialog === 'notifications'} onClose={() => setActiveDialog(null)} />
    </div>
  );
}
