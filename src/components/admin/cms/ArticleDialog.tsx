import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { api } from '../../../lib/axios';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  displayAuthor?: string | null;
  isPublished: boolean;
}

interface ArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article | null;
  onSuccess: () => void;
}

export function ArticleDialog({ open, onOpenChange, article, onSuccess }: ArticleDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    image: '',
    displayAuthor: '',
    isPublished: false
  });

  useEffect(() => {
    if (open && article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content,
        image: article.image || '',
        displayAuthor: article.displayAuthor || '',
        isPublished: article.isPublished
      });
    } else if (open) {
      setFormData({
        title: '',
        slug: '',
        content: '',
        image: '',
        displayAuthor: '',
        isPublished: false
      });
    }
  }, [open, article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { image, ...rest } = formData;
      const payload = {
        ...rest,
        coverImage: image || null,
        displayAuthor: formData.displayAuthor || null,
      };
      if (article) {
        await api.patch(`/admin/cms/articles/${article.id}`, payload);
        toast.success(t('Admin.cmsPage.articles.updateSuccess', 'Article updated successfully'));
      } else {
        await api.post('/admin/cms/articles', payload);
        toast.success(t('Admin.cmsPage.articles.createSuccess', 'Article created successfully'));
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(t('Admin.cmsPage.articles.error', 'Failed to save article'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {article ? t('Admin.cmsPage.articles.editTitle', 'Edit Article') : t('Admin.cmsPage.articles.createTitle', 'New Article')}
          </DialogTitle>
          <DialogDescription>
            {t('Admin.cmsPage.articles.formDesc', 'Configure your article content and publishing settings.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{t('Admin.cmsPage.articles.titleLabel', 'Title')}</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder={t('Admin.cmsPage.articles.titlePlaceholder', 'e.g. New Academy Opening')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t('Admin.cmsPage.articles.slugLabel', 'Slug (Optional)')}</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(f => ({ ...f, slug: e.target.value }))}
                placeholder={t('Admin.cmsPage.articles.slugPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">{t('Admin.cmsPage.articles.imageLabel', 'Cover Image URL')}</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData(f => ({ ...f, image: e.target.value }))}
              placeholder={t('Admin.cmsPage.articles.imageUrlPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayAuthor">{t('Admin.cmsPage.articles.displayAuthorLabel')}</Label>
            <Input
              id="displayAuthor"
              value={formData.displayAuthor}
              onChange={(e) => setFormData(f => ({ ...f, displayAuthor: e.target.value }))}
              placeholder={t('Admin.cmsPage.articles.displayAuthorPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t('Admin.cmsPage.articles.contentLabel', 'Content')}</Label>
            <Textarea
              id="content"
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">{t('Admin.cmsPage.articles.publishLabel', 'Publish Status')}</Label>
              <p className="text-xs text-gray-400">{t('Admin.cmsPage.articles.publishDesc', 'Live on the website if enabled')}</p>
            </div>
            <Switch
              checked={formData.isPublished}
              onCheckedChange={(val) => setFormData(f => ({ ...f, isPublished: val }))}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('Common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {article ? t('Common.saveChanges') : t('Common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
