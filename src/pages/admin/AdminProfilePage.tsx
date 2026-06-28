import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Save, 
  Eye, 
  EyeOff,
  UserCircle 
} from 'lucide-react';

import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';

export default function AdminProfilePage() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  // Password Form State
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.fullName || !profileData.email) return;

    setLoading(true);
    try {
      const res = await api.patch('/admin/users/me/profile', profileData);
      setUser(res.data.data); // Update global auth store
      toast.success(t('Profile.updateSuccess'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error(t('Profile.passMismatch'));
      return;
    }

    setLoading(true);
    try {
      await api.patch('/admin/users/me/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      toast.success(t('Profile.passSuccess'));
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Profile.passError'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6 container max-w-4xl py-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900">{t('Profile.title')}</h1>
        <p className="text-gray-400 font-medium">{t('Profile.subtitle')}</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2 h-14 bg-gray-100/50 rounded-2xl p-1.5 backdrop-blur-sm">
          <TabsTrigger value="personal" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="w-4 h-4 me-2" />
            {t('Profile.personalTab')}
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Lock className="w-4 h-4 me-2" />
            {t('Profile.securityTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                   <UserCircle size={32} />
                 </div>
                 <div>
                   <CardTitle className="text-xl font-black">{t('Profile.personalInfo')}</CardTitle>
                   <CardDescription>{t('Profile.personalDesc')}</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">{t('Profile.fullName')}</Label>
                    <div className="relative">
                      <User className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input 
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="ps-10 h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-bold"
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">{t('Profile.username')}</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input 
                        value={user.email} // Use email as unique username placeholder
                        disabled
                        className="ps-10 h-12 rounded-xl border-gray-100 bg-gray-100/50 cursor-not-allowed font-medium text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-bold text-gray-700">{t('Profile.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input 
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="ps-10 h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-bold"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                   <Button 
                     type="submit" 
                     className="h-12 rounded-xl px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/10"
                     disabled={loading}
                   >
                     <Save className="w-4 h-4 me-2" />
                     {loading ? t('Common.saving') : t('Profile.saveChanges')}
                   </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-[2rem] overflow-hidden">
             <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-4">
                   <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                     <ShieldCheck size={32} />
                   </div>
                   <div>
                     <CardTitle className="text-xl font-black">{t('Profile.changePass')}</CardTitle>
                     <CardDescription>{t('Profile.securityDesc')}</CardDescription>
                   </div>
                </div>
             </CardHeader>
             <CardContent className="p-8">
               <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl mx-auto">
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">{t('Profile.currentPass')}</Label>
                      <div className="relative">
                        <Input 
                          type={showCurrentPass ? "text" : "password"}
                          value={passData.currentPassword}
                          onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                          className="pe-10 h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-bold"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">{t('Profile.newPass')}</Label>
                      <div className="relative">
                        <Input 
                          type={showNewPass ? "text" : "password"}
                          value={passData.newPassword}
                          onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                          className="pe-10 h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-bold"
                          required
                          minLength={8}
                        />
                         <button 
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="font-bold text-gray-700">{t('Profile.confirmPass')}</Label>
                       <Input 
                         type="password"
                         value={passData.confirmPassword}
                         onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                         className="h-12 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-bold"
                         required
                       />
                    </div>
                 </div>

                 <div className="pt-4 flex justify-center">
                   <Button 
                     type="submit" 
                     className="w-full sm:w-[280px] h-12 rounded-xl bg-gray-900 border-none hover:bg-black text-white font-bold shadow-xl shadow-gray-200 transition-all active:scale-95"
                     disabled={loading}
                   >
                     {loading ? t('Common.saving') : t('Profile.updatePass')}
                   </Button>
                 </div>
               </form>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
