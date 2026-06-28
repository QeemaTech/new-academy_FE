import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Newspaper, 
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { api } from '../../lib/axios';

import { ArticleDialog } from '../../components/admin/cms/ArticleDialog';
import { BannerDialog } from '../../components/admin/cms/BannerDialog';

const MotionTableRow = motion(TableRow as any);

export default function AdminCMSPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('articles');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [articles, setArticles] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  // Dialog States
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'articles') {
        const res = await api.get('/admin/cms/articles');
        setArticles(res.data?.data || []);
      } else {
        const res = await api.get('/admin/cms/banners');
        setBanners(res.data?.data || []);
      }
    } catch (err) {
      toast.error(t('Admin.cmsPage.fetchError', 'Failed to load CMS content'));
    } finally {
      setLoading(false);
    }
  }, [activeTab, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleArticleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/cms/articles/${id}`, { isPublished: !currentStatus });
      setArticles(prev => prev.map(a => a.id === id ? { ...a, isPublished: !currentStatus } : a));
      toast.success(t('Admin.cmsPage.articles.statusUpdated', 'Article status updated'));
    } catch (err) {
      toast.error(t('Admin.cmsPage.articles.statusError', 'Update failed'));
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/cms/banners/${id}`, { isActive: !currentStatus });
      setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
      toast.success(t('Admin.cmsPage.banners.statusUpdated', 'Banner status updated'));
    } catch (err) {
      toast.error(t('Admin.cmsPage.banners.statusError', 'Update failed'));
    }
  };

  const handleDelete = async (id: string, type: 'article' | 'banner') => {
    if (!window.confirm(t('common.confirmDelete', 'Are you sure?'))) return;
    try {
      await api.delete(`/admin/cms/${type}s/${id}`);
      toast.success(t(`Admin.cmsPage.${type}s.deleteSuccess`, 'Deleted successfully'));
      fetchData();
    } catch (err) {
      toast.error(t(`Admin.cmsPage.${type}s.deleteError`, 'Delete failed'));
    }
  };

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="group relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder={t('Admin.cmsPage.searchPlaceholder', 'Search by title...')}
            className="h-11 rounded-xl border-gray-200 bg-gray-50 ps-10 pe-3 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setSelectedItem(null);
              if (activeTab === 'articles') setIsArticleOpen(true);
              else setIsBannerOpen(true);
            }}
            variant="primary"
            className="h-11 rounded-xl px-4 font-bold"
          >
            <Plus size={16} />
            {activeTab === 'articles' ? t('Admin.cmsPage.articles.new') : t('Admin.cmsPage.banners.new')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="articles" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="h-12 w-full max-w-md rounded-xl bg-gray-100/50 p-1 mb-6">
          <TabsTrigger value="articles" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Newspaper size={16} className="me-2" />
            {t('Admin.cmsPage.articles.tab')}
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ImageIcon size={16} className="me-2" />
            {t('Admin.cmsPage.banners.tab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 bg-gray-50/50">
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.cmsPage.articles.tableTitle')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.cmsPage.articles.tableStatus')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.cmsPage.articles.tableDate')}</TableHead>
                    <TableHead className="px-6 py-4 text-end text-xs font-bold uppercase tracking-widest text-gray-400">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-primary" /></TableCell></TableRow>
                    ) : articles.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="py-20 text-center text-gray-400">{t('Admin.cmsPage.articles.empty')}</TableCell></TableRow>
                    ) : articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).map((article) => (
                      <MotionTableRow key={article.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-gray-50/50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 overflow-hidden rounded-lg border bg-gray-50">
                              {article.image ? <img src={article.image} alt="" className="h-full w-full object-cover" /> : <Newspaper className="m-auto h-full text-gray-300 p-2" />}
                            </div>
                            <div className="flex flex-col max-w-[300px]">
                              <span className="truncate text-sm font-bold text-gray-900">{article.title}</span>
                              <span className="text-[10px] text-gray-400">/{article.slug}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <Switch checked={article.isPublished} onCheckedChange={() => toggleArticleStatus(article.id, article.isPublished)} />
                             <Badge variant={article.isPublished ? 'success' : 'outline'} className="text-[10px] px-1.5 py-0">
                               {article.isPublished ? t('common.published') : t('common.draft')}
                             </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-xs text-gray-500">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-end">
                           <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary" onClick={() => { setSelectedItem(article); setIsArticleOpen(true); }}><Edit2 size={14} /></Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(article.id, 'article')}><Trash2 size={14} /></Button>
                           </div>
                        </TableCell>
                      </MotionTableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="banners">
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 bg-gray-50/50">
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.cmsPage.banners.tablePreview')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.cmsPage.banners.tablePosition')}</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t('Admin.cmsPage.banners.tableStatus')}</TableHead>
                    <TableHead className="px-6 py-4 text-end text-xs font-bold uppercase tracking-widest text-gray-400">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-primary" /></TableCell></TableRow>
                    ) : banners.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="py-20 text-center text-gray-400">{t('Admin.cmsPage.banners.empty')}</TableCell></TableRow>
                    ) : banners.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map((banner) => (
                      <MotionTableRow key={banner.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-gray-50/50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-24 overflow-hidden rounded-lg border bg-gray-100 shadow-inner">
                              <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <span className="max-w-[150px] truncate text-sm font-bold text-gray-900">{banner.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-medium">
                             {banner.position}
                           </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <Switch checked={banner.isActive} onCheckedChange={() => toggleBannerStatus(banner.id, banner.isActive)} />
                             <Badge variant={banner.isActive ? 'success' : 'outline'} className="text-[10px] px-1.5 py-0">
                               {banner.isActive ? t('common.active') : t('common.inactive')}
                             </Badge>
                           </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-end">
                           <div className="flex justify-end gap-2">
                              {banner.link && (
                                <a href={banner.link} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-100 text-gray-400 hover:text-primary transition-colors">
                                  <ExternalLink size={14} />
                                </a>
                              )}
                              <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary" onClick={() => { setSelectedItem(banner); setIsBannerOpen(true); }}><Edit2 size={14} /></Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(banner.id, 'banner')}><Trash2 size={14} /></Button>
                           </div>
                        </TableCell>
                      </MotionTableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <ArticleDialog 
        open={isArticleOpen} 
        onOpenChange={setIsArticleOpen} 
        article={selectedItem} 
        onSuccess={fetchData} 
      />
      
      <BannerDialog 
        open={isBannerOpen} 
        onOpenChange={setIsBannerOpen} 
        banner={selectedItem} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
