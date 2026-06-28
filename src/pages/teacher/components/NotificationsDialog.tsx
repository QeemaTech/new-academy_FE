import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/axios';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';

const schema = z.object({
  inAppNotifications: z.boolean(),
  emailNotifications: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function NotificationsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inAppNotifications: authUser?.inAppNotifications ?? true,
      emailNotifications: authUser?.emailNotifications ?? true,
    },
  });

  useEffect(() => {
    if (isOpen && authUser) {
      form.reset({
        inAppNotifications: authUser.inAppNotifications ?? true,
        emailNotifications: authUser.emailNotifications ?? true,
      });
    }
  }, [isOpen, authUser, form]);

  const mut = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await api.patch('/users/me/preferences', values);
      return res.data.data.user;
    },
    onSuccess: (user) => {
      toast.success('تم تحديث تفضيلات الإشعارات بنجاح');
      if (authUser) {
        setUser({ ...authUser, ...user });
      }
      qc.invalidateQueries({ queryKey: ['teacher', 'me'] });
      onClose();
    },
    onError: () => {
      toast.error(t('Common.error', { defaultValue: 'حدث خطأ أثناء حفظ التغييرات' }));
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#0b2a5c]">إعدادات التنبيهات</DialogTitle>
          <DialogDescription>
            اختر كيف تود استلام التنبيهات والتحديثات.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mut.mutate(v))} className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="inAppNotifications" className="flex flex-col space-y-1">
              <span>إشعارات النظام (In-App)</span>
              <span className="font-normal text-xs text-slate-500">استلام التنبيهات داخل لوحة التحكم.</span>
            </Label>
            <Switch
              id="inAppNotifications"
              checked={form.watch('inAppNotifications')}
              onCheckedChange={(checked) => form.setValue('inAppNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
              <span>إشعارات البريد الإلكتروني</span>
              <span className="font-normal text-xs text-slate-500">استلام ملخصات أسبوعية وتنبيهات هامة عبر البريد.</span>
            </Label>
            <Switch
              id="emailNotifications"
              checked={form.watch('emailNotifications')}
              onCheckedChange={(checked) => form.setValue('emailNotifications', checked)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#10B981] hover:bg-[#0e9f6e] text-white font-bold rounded-xl w-full"
              disabled={mut.isPending}
            >
              {mut.isPending ? 'جاري الحفظ...' : 'حفظ التفضيلات'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
