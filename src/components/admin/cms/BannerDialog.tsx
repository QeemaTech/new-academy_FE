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
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { api } from '../../../lib/axios';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  position: 'HERO' | 'SIDEBAR' | 'POPUP';
  isActive: boolean;
  order: number;
}

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: Banner | null;
  onSuccess: () => void;
}

export function BannerDialog({ open, onOpenChange, banner, onSuccess }: BannerDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    link: '',
    position: 'HERO' as const,
    isActive: true,
    order: 0
  });

  useEffect(() => {
    if (open && banner) {
      setFormData({
        title: banner.title,
        imageUrl: banner.imageUrl,
        link: banner.link || '',
        position: banner.position,
        isActive: banner.isActive,
        order: banner.order
      });
    } else if (open) {
      setFormData({
        title: '',
        imageUrl: '',
        link: '',
        position: 'HERO',
        isActive: true,
        order: 0
      });
    }
  }, [open, banner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (banner) {
        await api.patch(`/admin/cms/banners/${banner.id}`, formData);
        toast.success(t('Admin.cmsPage.banners.updateSuccess', 'Banner updated successfully'));
      } else {
        await api.post('/admin/cms/banners', formData);
        toast.success(t('Admin.cmsPage.banners.createSuccess', 'Banner created successfully'));
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(t('Admin.cmsPage.banners.error', 'Failed to save banner'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {banner ? t('Admin.cmsPage.banners.editTitle', 'Edit Banner') : t('Admin.cmsPage.banners.createTitle', 'New Banner')}
          </DialogTitle>
          <DialogDescription>
            {t('Admin.cmsPage.banners.formDesc', 'Configure marketing banners and announcement images.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('Admin.cmsPage.banners.titleLabel', 'Banner Title')}</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder={t('Admin.cmsPage.banners.titlePlaceholder', 'e.g. Summer Discount')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">{t('Admin.cmsPage.banners.imageLabel', 'Banner Image URL')}</Label>
            <Input
              id="imageUrl"
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData(f => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">{t('Admin.cmsPage.banners.linkLabel', 'Destination Link (Optional)')}</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(f => ({ ...f, link: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('Admin.cmsPage.banners.positionLabel', 'Display Position')}</Label>
              <Select
                value={formData.position}
                onValueChange={(val: any) => setFormData(f => ({ ...f, position: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HERO">{t('Admin.cmsPage.banners.posHero', 'Hero Section')}</SelectItem>
                  <SelectItem value="SIDEBAR">{t('Admin.cmsPage.banners.posSidebar', 'Sidebar')}</SelectItem>
                  <SelectItem value="POPUP">{t('Admin.cmsPage.banners.posPopup', 'Popup')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">{t('Admin.cmsPage.banners.orderLabel', 'Display Order')}</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">{t('Admin.cmsPage.banners.activeLabel', 'Active Status')}</Label>
              <p className="text-xs text-gray-400">{t('Admin.cmsPage.banners.activeDesc', 'Visible to users if enabled')}</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(val) => setFormData(f => ({ ...f, isActive: val }))}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {banner ? t('common.save', 'Save Changes') : t('common.create', 'Create Banner')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
