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
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

const schema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين'),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function UpdateProfileDialog({
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
      fullName: authUser?.fullName || '',
      phone: authUser?.phone || '',
    },
  });

  useEffect(() => {
    if (isOpen && authUser) {
      form.reset({
        fullName: authUser.fullName,
        phone: authUser.phone || '',
      });
    }
  }, [isOpen, authUser, form]);

  const mut = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await api.patch('/users/me/profile', values);
      return res.data.data.user;
    },
    onSuccess: (user) => {
      toast.success('تم تحديث الملف الشخصي بنجاح');
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
          <DialogTitle className="text-[#0b2a5c]">تعديل الملف الشخصي</DialogTitle>
          <DialogDescription>
            قم بتحديث معلوماتك الشخصية. ستظهر هذه التغييرات لجميع طلابك.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mut.mutate(v))} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input id="fullName" {...form.register('fullName')} className="rounded-xl" />
            {form.formState.errors.fullName && (
              <p className="text-sm text-rose-500">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" {...form.register('phone')} className="rounded-xl text-left" dir="ltr" />
          </div>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#10B981] hover:bg-[#0e9f6e] text-white font-bold rounded-xl w-full"
              disabled={mut.isPending}
            >
              {mut.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
