import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Shield,
  Mail,
  Phone,
  Globe,
  Save,
  RefreshCcw,
  Layout,
  Info,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MessageCircle
} from 'lucide-react';

import { api } from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

interface Setting {
  id: string;
  key: string;
  value: string;
  group: string;
}

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  // Group-based mapping for UI
  const [formData, setFormData] = useState({
    site_name: '',
    contact_email: '',
    support_phone: '',
    platform_motto: '',
    maintenance_mode: 'false',
    whatsapp_number: '',
    whatsapp_message: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: ''
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/settings');
      const data: Setting[] = response.data?.data?.settings || [];
      
      const mapped = data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      setSettings(mapped);
      
      setFormData(prev => ({
        ...prev,
        ...mapped
      }));
    } catch {
      toast.error(t('Settings.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch('/admin/settings', { settings: formData });
      toast.success(t('Settings.toast.saveSuccess'));
    } catch {
      toast.error(t('Settings.toast.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in duration-500">
        <div className="flex items-center gap-4">
           <Skeleton className="h-14 w-14 rounded-2xl" />
           <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Skeleton className="h-80 rounded-[2.5rem]" />
           <Skeleton className="h-80 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 duration-700 pb-20">
      {/* ⚙️ Page Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
           <div className="flex size-16 items-center justify-center rounded-[1.75rem] bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
              <Settings size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900">
                {t('Settings.title')}
              </h1>
              <p className="mt-1 font-bold text-gray-400">
                {t('Settings.subtitle')}
              </p>
           </div>
        </div>

        <Button
           className="h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 shadow-xl shadow-indigo-100 transition-all hover:translate-y-[-2px] active:scale-95 active:translate-y-0"
           onClick={handleSave}
           disabled={saving}
        >
           {saving ? <RefreshCcw className="animate-spin me-3" size={20} /> : <Save className="me-3" size={20} />}
           {t('Settings.form.saveChanges')}
        </Button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 🏢 Section: General Branding */}
        <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
            <div className="flex items-center gap-3">
               <Globe className="text-indigo-500" size={20} />
               <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-tight">
                  {t('Settings.sections.general')}
               </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-indigo-500">
                {t('Settings.form.siteName')}
              </label>
              <div className="relative">
                 <Layout className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   value={formData.site_name}
                   onChange={(e) => setFormData(f => ({ ...f, site_name: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder={t('Settings.form.siteNamePlaceholder')}
                 />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-indigo-500">
                {t('Settings.form.platformMotto', 'Platform Motto / Tagline')}
              </label>
              <div className="relative">
                 <Info className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   value={formData.platform_motto}
                   onChange={(e) => setFormData(f => ({ ...f, platform_motto: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder={t('Settings.form.descriptionPlaceholder')}
                 />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 📞 Section: Contact Info */}
        <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
            <div className="flex items-center gap-3">
               <Mail className="text-indigo-500" size={20} />
               <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-tight">
                  {t('Settings.sections.contact')}
               </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-indigo-500">
                 {t('Settings.form.contactEmail')}
              </label>
              <div className="relative">
                 <Mail className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   type="email"
                   value={formData.contact_email}
                   onChange={(e) => setFormData(f => ({ ...f, contact_email: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder={t('Settings.form.contactEmailPlaceholder')}
                 />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-indigo-500">
                {t('Settings.form.supportPhone')}
              </label>
              <div className="relative">
                 <Phone className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   value={formData.support_phone}
                   onChange={(e) => setFormData(f => ({ ...f, support_phone: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder={t('Settings.form.supportPhonePlaceholder')}
                 />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🔒 Section: Advanced / Maintenance */}
        <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white lg:col-span-2">
           <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
              <div className="flex items-center gap-3">
                 <Shield className="text-indigo-500" size={20} />
                 <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-tight">
                    {t('Settings.sections.security')}
                 </CardTitle>
              </div>
           </CardHeader>
           <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[2rem] bg-amber-50 border border-amber-100">
                 <div className="space-y-1">
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">
                       System Visibility & Maintenance
                    </h4>
                    <p className="text-xs text-amber-700/70 font-bold max-w-md">
                       When maintenance mode is enabled, only administrators will be able to access the platform. Public visitors will see a maintenance message.
                    </p>
                 </div>
                 <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-amber-200 shadow-sm">
                    <Button 
                      type="button" 
                      variant={formData.maintenance_mode === 'true' ? 'primary' : 'outline'}
                      className="h-10 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest"
                      onClick={() => setFormData(f => ({ ...f, maintenance_mode: 'true' }))}
                    >
                      Enabled
                    </Button>
                    <Button 
                      type="button" 
                      variant={formData.maintenance_mode === 'false' ? 'primary' : 'outline'}
                      className="h-10 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest"
                      onClick={() => setFormData(f => ({ ...f, maintenance_mode: 'false' }))}
                    >
                      Disabled
                    </Button>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* 📱 Section: Social Media & WhatsApp */}
        <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white lg:col-span-2">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
            <div className="flex items-center gap-3">
               <MessageCircle className="text-indigo-500" size={20} />
               <CardTitle className="text-lg font-black text-gray-800 uppercase tracking-tight">
                  {t('Settings.sections.social', 'Social Media & Communication')}
               </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400">
                {t('Settings.form.whatsappNumber')}
              </label>
              <div className="relative">
                 <MessageCircle className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   value={formData.whatsapp_number}
                   onChange={(e) => setFormData(f => ({ ...f, whatsapp_number: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder="Enter number with country code"
                 />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400">
                {t('Settings.form.whatsappMessage')}
              </label>
              <div className="relative">
                 <Info className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   value={formData.whatsapp_message}
                   onChange={(e) => setFormData(f => ({ ...f, whatsapp_message: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder="Hello, I want to inquire about..."
                 />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400">
                {t('Settings.form.facebookUrl')}
              </label>
              <div className="relative">
                 <Facebook className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   value={formData.facebook_url}
                   onChange={(e) => setFormData(f => ({ ...f, facebook_url: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder="https://facebook.com/..."
                 />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400">
                {t('Settings.form.instagramUrl')}
              </label>
              <div className="relative">
                 <Instagram className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   value={formData.instagram_url}
                   onChange={(e) => setFormData(f => ({ ...f, instagram_url: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder="https://instagram.com/..."
                 />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400">
                {t('Settings.form.youtubeUrl')}
              </label>
              <div className="relative">
                 <Youtube className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   value={formData.youtube_url}
                   onChange={(e) => setFormData(f => ({ ...f, youtube_url: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder="https://youtube.com/..."
                 />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="ms-1 text-xs font-black uppercase tracking-widest text-gray-400">
                {t('Settings.form.twitterUrl')}
              </label>
              <div className="relative">
                 <Twitter className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                 <Input 
                   value={formData.twitter_url}
                   onChange={(e) => setFormData(f => ({ ...f, twitter_url: e.target.value }))}
                   className="h-14 rounded-2xl border-gray-100 bg-gray-50 ps-12 font-bold shadow-inner focus:bg-white transition-all outline-none" 
                   placeholder="https://twitter.com/..."
                 />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
