import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  FileText,
  FolderKanban,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  ExternalLink,
  LayoutTemplate,
} from 'lucide-react';

import { api } from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArticleDialog } from '../../components/admin/cms/ArticleDialog';

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  displayAuthor?: string | null;
  isPublished: boolean;
  author?: { fullName: string };
};

type LandingProjectRow = {
  id: string;
  title: string;
  description: string;
  studentName: string;
  imageUrl?: string | null;
  projectUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
};

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  createdAt: string;
};

export default function AdminContentPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('blog');
  const [loading, setLoading] = useState(true);

  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [projects, setProjects] = useState<LandingProjectRow[]>([]);
  const [faqs, setFaqs] = useState<FaqRow[]>([]);

  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleRow | null>(null);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<LandingProjectRow | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    studentName: '',
    imageUrl: '',
    projectUrl: '',
    order: 0,
    isActive: true,
  });
  const [projectSaving, setProjectSaving] = useState(false);

  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqRow | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: '' });
  const [faqSaving, setFaqSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [a, p, f] = await Promise.all([
        api.get('/admin/cms/articles'),
        api.get('/admin/cms/projects'),
        api.get('/admin/cms/faqs'),
      ]);
      setArticles(a.data?.data ?? []);
      setProjects(p.data?.data ?? []);
      setFaqs(f.data?.data ?? []);
    } catch {
      toast.error(t('Admin.contentPage.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const openNewArticle = () => {
    setSelectedArticle(null);
    setArticleDialogOpen(true);
  };

  const openEditArticle = (row: ArticleRow) => {
    setSelectedArticle(row);
    setArticleDialogOpen(true);
  };

  const deleteArticle = async (id: string) => {
    if (!window.confirm(t('Admin.common.confirmDelete'))) return;
    try {
      await api.delete(`/admin/cms/articles/${id}`);
      toast.success(t('Admin.cmsPage.articles.deleteSuccess'));
      setArticles((prev) => prev.filter((x) => x.id !== id));
    } catch {
      toast.error(t('Admin.common.error'));
    }
  };

  const openProjectDialog = (row: LandingProjectRow | null) => {
    setSelectedProject(row);
    if (row) {
      setProjectForm({
        title: row.title,
        description: row.description,
        studentName: row.studentName,
        imageUrl: row.imageUrl || '',
        projectUrl: row.projectUrl || '',
        order: row.order ?? 0,
        isActive: row.isActive ?? true,
      });
    } else {
      setProjectForm({ title: '', description: '', studentName: '', imageUrl: '', projectUrl: '', order: 0, isActive: true });
    }
    setProjectDialogOpen(true);
  };

  const submitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectSaving(true);
    try {
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        studentName: projectForm.studentName,
        imageUrl: projectForm.imageUrl || null,
        projectUrl: projectForm.projectUrl || null,
        order: projectForm.order,
        isActive: projectForm.isActive,
      };
      if (selectedProject) {
        await api.patch(`/admin/cms/projects/${selectedProject.id}`, payload);
        toast.success(t('Admin.contentPage.projectUpdated'));
      } else {
        await api.post('/admin/cms/projects', payload);
        toast.success(t('Admin.contentPage.projectCreated'));
      }
      setProjectDialogOpen(false);
      await loadAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Admin.common.error'));
    } finally {
      setProjectSaving(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm(t('Admin.common.confirmDelete'))) return;
    try {
      await api.delete(`/admin/cms/projects/${id}`);
      toast.success(t('Admin.contentPage.projectDeleted'));
      setProjects((prev) => prev.filter((x) => x.id !== id));
    } catch {
      toast.error(t('Admin.common.error'));
    }
  };

  const openFaqDialog = (row: FaqRow | null) => {
    setSelectedFaq(row);
    if (row) {
      setFaqForm({ question: row.question, answer: row.answer, category: row.category || '' });
    } else {
      setFaqForm({ question: '', answer: '', category: '' });
    }
    setFaqDialogOpen(true);
  };

  const submitFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setFaqSaving(true);
    try {
      const payload = {
        question: faqForm.question,
        answer: faqForm.answer,
        category: faqForm.category || null,
      };
      if (selectedFaq) {
        await api.patch(`/admin/cms/faqs/${selectedFaq.id}`, payload);
        toast.success(t('Admin.contentPage.faqUpdated'));
      } else {
        await api.post('/admin/cms/faqs', payload);
        toast.success(t('Admin.contentPage.faqCreated'));
      }
      setFaqDialogOpen(false);
      await loadAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('Admin.common.error'));
    } finally {
      setFaqSaving(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!window.confirm(t('Admin.common.confirmDelete'))) return;
    try {
      await api.delete(`/admin/cms/faqs/${id}`);
      toast.success(t('Admin.contentPage.faqDeleted'));
      setFaqs((prev) => prev.filter((x) => x.id !== id));
    } catch {
      toast.error(t('Admin.common.error'));
    }
  };

  return (
    <div className="animate-fade-in space-y-6 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            {t('Admin.contentPage.title')}
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">{t('Admin.contentPage.subtitle')}</p>
        </div>
        <Button variant="outline" asChild className="rounded-2xl border-gray-200">
          <Link to="/admin/cms" className="inline-flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            {t('Admin.contentPage.bannersLink')}
          </Link>
        </Button>
      </div>

      <Card className="rounded-3xl border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-3 rounded-2xl bg-gray-100/80 p-1">
              <TabsTrigger value="blog" className="rounded-xl gap-2 data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" />
                {t('Admin.contentPage.tabBlog')}
              </TabsTrigger>
              <TabsTrigger value="projects" className="rounded-xl gap-2 data-[state=active]:shadow-sm">
                <FolderKanban className="h-4 w-4" />
                {t('Admin.contentPage.tabProjects')}
              </TabsTrigger>
              <TabsTrigger value="faq" className="rounded-xl gap-2 data-[state=active]:shadow-sm">
                <HelpCircle className="h-4 w-4" />
                {t('Admin.contentPage.tabFaq')}
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex h-48 items-center justify-center text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <TabsContent value="blog" className="space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={openNewArticle} className="rounded-2xl gap-2">
                      <Plus className="h-4 w-4" />
                      {t('Admin.contentPage.addArticle')}
                    </Button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80">
                          <TableHead>{t('Admin.contentPage.colTitle')}</TableHead>
                          <TableHead>{t('Admin.contentPage.colSlug')}</TableHead>
                          <TableHead>{t('Admin.contentPage.colAuthor')}</TableHead>
                          <TableHead>{t('Admin.contentPage.colPublished')}</TableHead>
                          <TableHead className="text-end">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-400">
                              {t('Admin.contentPage.emptyBlog')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          articles.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-semibold">{row.title}</TableCell>
                              <TableCell className="font-mono text-xs text-gray-500">{row.slug}</TableCell>
                              <TableCell className="text-sm">
                                {row.displayAuthor || row.author?.fullName || '—'}
                              </TableCell>
                              <TableCell>
                                {row.isPublished ? (
                                  <Badge className="bg-emerald-50 text-emerald-800">{t('common.active')}</Badge>
                                ) : (
                                  <Badge variant="outline">{t('common.draft')}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => openEditArticle(row)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => void deleteArticle(row.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={() => openProjectDialog(null)} className="rounded-2xl gap-2">
                      <Plus className="h-4 w-4" />
                      {t('Admin.contentPage.addProject')}
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.length === 0 ? (
                      <p className="col-span-full text-center text-gray-400">{t('Admin.contentPage.emptyProjects')}</p>
                    ) : (
                      projects.map((p) => (
                        <Card key={p.id} className={`overflow-hidden rounded-2xl border-gray-100 transition-opacity ${!p.isActive ? 'opacity-50' : ''}`}>
                          <div className="relative aspect-video bg-gray-100">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-300">
                                <FolderKanban className="h-10 w-10" />
                              </div>
                            )}
                            <div className="absolute top-2 start-2 flex gap-1">
                              <Badge className="bg-white/90 text-gray-700 shadow-sm text-[10px] px-1.5">#{p.order}</Badge>
                              <Badge className={`text-[10px] px-1.5 shadow-sm ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                {p.isActive ? t('common.active') : t('common.inactive')}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="space-y-2 p-4">
                            <h3 className="font-bold text-gray-900 line-clamp-2">{p.title}</h3>
                            <p className="text-xs font-semibold text-[color:var(--color-primary)]">{p.studentName}</p>
                            <p className="line-clamp-2 text-sm text-gray-600">{p.description}</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {p.projectUrl && (
                                <a
                                  href={p.projectUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {t('Admin.contentPage.openProject')}
                                </a>
                              )}
                              <div className="ms-auto flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => openProjectDialog(p)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => void deleteProject(p.id)}>
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="faq" className="space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={() => openFaqDialog(null)} className="rounded-2xl gap-2">
                      <Plus className="h-4 w-4" />
                      {t('Admin.contentPage.addFaq')}
                    </Button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80">
                          <TableHead>{t('Admin.contentPage.faqQuestion')}</TableHead>
                          <TableHead>{t('Admin.contentPage.faqCategory')}</TableHead>
                          <TableHead className="text-end">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {faqs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-gray-400">
                              {t('Admin.contentPage.emptyFaq')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          faqs.map((f) => (
                            <TableRow key={f.id}>
                              <TableCell className="max-w-md font-medium">{f.question}</TableCell>
                              <TableCell className="text-sm text-gray-500">{f.category || '—'}</TableCell>
                              <TableCell className="text-end">
                                <Button variant="ghost" size="sm" onClick={() => openFaqDialog(f)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => void deleteFaq(f.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <ArticleDialog
        open={articleDialogOpen}
        onOpenChange={setArticleDialogOpen}
        article={selectedArticle}
        onSuccess={() => void loadAll()}
      />

      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? t('Admin.contentPage.editProject') : t('Admin.contentPage.newProject')}
            </DialogTitle>
            <DialogDescription>{t('Admin.contentPage.projectFormHint')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitProject} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Admin.contentPage.projectTitle')}</Label>
              <Input
                required
                value={projectForm.title}
                onChange={(e) => setProjectForm((s) => ({ ...s, title: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Admin.contentPage.studentName')}</Label>
              <Input
                required
                value={projectForm.studentName}
                onChange={(e) => setProjectForm((s) => ({ ...s, studentName: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Admin.contentPage.projectDescription')}</Label>
              <Textarea
                required
                rows={4}
                value={projectForm.description}
                onChange={(e) => setProjectForm((s) => ({ ...s, description: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Admin.contentPage.imageUrl')}</Label>
              <Input
                value={projectForm.imageUrl}
                onChange={(e) => setProjectForm((s) => ({ ...s, imageUrl: e.target.value }))}
                className="rounded-xl"
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Admin.contentPage.projectUrl')}</Label>
              <Input
                value={projectForm.projectUrl}
                onChange={(e) => setProjectForm((s) => ({ ...s, projectUrl: e.target.value }))}
                className="rounded-xl"
                placeholder="https://"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('Admin.contentPage.orderLabel')}</Label>
                <Input
                  type="number"
                  value={projectForm.order}
                  onChange={(e) => setProjectForm((s) => ({ ...s, order: parseInt(e.target.value) || 0 }))}
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-end">
                <div className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <Label className="text-sm">{t('Admin.contentPage.activeLabel')}</Label>
                  <Switch
                    checked={projectForm.isActive}
                    onCheckedChange={(val) => setProjectForm((s) => ({ ...s, isActive: val }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProjectDialogOpen(false)}>
                {t('Common.cancel')}
              </Button>
              <Button type="submit" disabled={projectSaving} className="rounded-xl">
                {projectSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('Common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>{selectedFaq ? t('Admin.contentPage.editFaq') : t('Admin.contentPage.newFaq')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitFaq} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('Admin.contentPage.faqQuestion')}</Label>
              <Input
                required
                value={faqForm.question}
                onChange={(e) => setFaqForm((s) => ({ ...s, question: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Admin.contentPage.faqCategory')}</Label>
              <Input
                value={faqForm.category}
                onChange={(e) => setFaqForm((s) => ({ ...s, category: e.target.value }))}
                className="rounded-xl"
                placeholder={t('Admin.contentPage.faqCategoryPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Admin.contentPage.faqAnswer')}</Label>
              <Textarea
                required
                rows={5}
                value={faqForm.answer}
                onChange={(e) => setFaqForm((s) => ({ ...s, answer: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFaqDialogOpen(false)}>
                {t('Common.cancel')}
              </Button>
              <Button type="submit" disabled={faqSaving}>
                {faqSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('Common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
