import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

const schema = z
  .object({
    newPassword: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const mut = useMutation({
    mutationFn: async (values: FormValues) => {
      await api.patch('/users/me/password', { newPassword: values.newPassword });
    },
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح');
      form.reset();
      onClose();
    },
    onError: () => {
      toast.error(t('Common.error', { defaultValue: 'حدث خطأ. يرجى المحاولة لاحقاً.' }));
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#0b2a5c]">تغيير كلمة المرور</DialogTitle>
          <DialogDescription>
            قم بتعيين كلمة مرور جديدة لحسابك. يجب أن تكون 6 أحرف على الأقل.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mut.mutate(v))} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
            <Input id="newPassword" type="password" {...form.register('newPassword')} className="rounded-xl text-left" dir="ltr" />
            {form.formState.errors.newPassword && (
              <p className="text-sm text-rose-500">{form.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} className="rounded-xl text-left" dir="ltr" />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-rose-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#0b2a5c] hover:bg-[#1a3a6e] text-white font-bold rounded-xl w-full"
              disabled={mut.isPending}
            >
              {mut.isPending ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
