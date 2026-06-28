import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ParentSettings() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const authUser = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['parent', 'me'],
    queryFn: async () => {
      const res = await api.get<{ data: { user: FormValues & { email: string } } }>('/parent/me');
      return res.data.data.user;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', phone: '' },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        fullName: data.fullName,
        phone: data.phone ?? '',
      });
    }
  }, [data, form]);

  const mut = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await api.patch('/parent/me', values);
      return res.data.data.user as { fullName: string; phone: string | null };
    },
    onSuccess: (user) => {
      toast.success(t('Parent.settings.saved'));
      if (authUser) {
        setUser({
          ...authUser,
          fullName: user.fullName,
        });
      }
      qc.invalidateQueries({ queryKey: ['parent', 'me'] });
    },
    onError: () => toast.error(t('Common.error')),
  });

  if (isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{t('Parent.settings.title')}</h1>
        <p className="mt-1 font-medium text-slate-500">{t('Parent.settings.subtitle')}</p>
      </div>

      <Card className="rounded-2xl border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-black">{t('Parent.settings.profile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => mut.mutate(v))}
          >
            <div className="space-y-2">
              <Label>{t('Parent.settings.email')}</Label>
              <Input value={data?.email ?? ''} disabled className="rounded-xl bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('Parent.settings.fullName')}</Label>
              <Input id="fullName" {...form.register('fullName')} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('Parent.settings.phone')}</Label>
              <Input id="phone" {...form.register('phone')} className="rounded-xl" />
            </div>
            <Button
              type="submit"
              className="rounded-xl bg-[#4178EF] font-bold"
              disabled={mut.isPending}
            >
              {t('Parent.settings.save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
