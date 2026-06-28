import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { api } from '../../lib/axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../../lib/cn';

function parseOptionalAge(raw: unknown): number | undefined {
  if (raw === '' || raw === undefined || raw === null) return undefined;
  const n = typeof raw === 'number' ? raw : parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}

const addLearnerSchema = z
  .object({
    fullName: z.string().min(2).max(120),
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    password: z
      .string()
      .min(8)
      .regex(/[a-zA-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string(),
    age: z.union([z.string(), z.number()]).optional(),
    gradeLevel: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'mismatch',
  })
  .superRefine((data, ctx) => {
    const n = parseOptionalAge(data.age);
    if (n === undefined) return;
    if (n < 3 || n > 25) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['age'], message: 'range' });
    }
  });

type AddLearnerFormValues = z.infer<typeof addLearnerSchema>;

type AddLearnerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddLearnerDialog({ open, onOpenChange }: AddLearnerDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddLearnerFormValues>({
    resolver: zodResolver(addLearnerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      password: '',
      confirmPassword: '',
      age: '',
      gradeLevel: '',
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: async (payload: AddLearnerFormValues) => {
      const age = parseOptionalAge(payload.age);
      const res = await api.post('/parent/children', {
        fullName: payload.fullName.trim(),
        username: payload.username.trim().toLowerCase(),
        password: payload.password,
        confirmPassword: payload.confirmPassword,
        age: age ?? null,
        gradeLevel: payload.gradeLevel?.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(t('Parent.addLearner.success'));
      queryClient.invalidateQueries({ queryKey: ['parent', 'children'] });
      queryClient.invalidateQueries({ queryKey: ['parent', 'dashboard'] });
      onOpenChange(false);
      reset();
    },
    onError: (err: unknown) => {
      if (isAxiosError(err)) {
        const msg = err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data
          ? String((err.response.data as { message?: string }).message)
          : null;
        if (msg) {
          toast.error(msg);
          return;
        }
      }
      toast.error(t('Common.error'));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-[480px]">
        <DialogHeader className="border-b border-slate-100 px-5 py-4">
          <DialogTitle className="text-lg font-black text-slate-900">
            {t('Parent.addLearner.title')}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500">
            {t('Parent.addLearner.description')}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4 px-5 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="al-fullName">{t('Parent.addLearner.fullName')}</Label>
            <Input
              id="al-fullName"
              className={cn('rounded-xl', errors.fullName && 'border-red-300')}
              {...register('fullName')}
              autoComplete="name"
            />
            {errors.fullName && (
              <p className="text-xs font-bold text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="al-age">{t('Parent.addLearner.age')}</Label>
              <Input
                id="al-age"
                type="number"
                min={3}
                max={25}
                className={cn('rounded-xl', errors.age && 'border-red-300')}
                {...register('age')}
              />
              {errors.age && (
                <p className="text-xs font-bold text-red-500">{t('Parent.addLearner.ageError')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="al-grade">{t('Parent.addLearner.gradeLevel')}</Label>
              <Input
                id="al-grade"
                placeholder={t('Parent.addLearner.gradePlaceholder')}
                className="rounded-xl"
                {...register('gradeLevel')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="al-username">{t('Parent.addLearner.username')}</Label>
            <Input
              id="al-username"
              className={cn('rounded-xl', errors.username && 'border-red-300')}
              {...register('username')}
              autoComplete="username"
              dir="ltr"
            />
            {errors.username && (
              <p className="text-xs font-bold text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="al-password">{t('Parent.addLearner.password')}</Label>
            <Input
              id="al-password"
              type="password"
              className={cn('rounded-xl', errors.password && 'border-red-300')}
              {...register('password')}
              autoComplete="new-password"
              dir="ltr"
            />
            <p className="text-[10px] font-bold text-slate-400">{t('Auth.passwordRegisterHint')}</p>
            {errors.password && (
              <p className="text-xs font-bold text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="al-confirm">{t('Parent.addLearner.confirmPassword')}</Label>
            <Input
              id="al-confirm"
              type="password"
              className={cn('rounded-xl', errors.confirmPassword && 'border-red-300')}
              {...register('confirmPassword')}
              autoComplete="new-password"
              dir="ltr"
            />
            {errors.confirmPassword && (
              <p className="text-xs font-bold text-red-500">{t('Parent.addLearner.passwordMismatch')}</p>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 border-0 px-0 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl font-bold sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              {t('Common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-xl bg-[#4178EF] font-bold shadow-md shadow-[#4178EF]/25 hover:bg-[#3264D6] sm:w-auto"
            >
              {mutation.isPending ? (
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="me-2 h-4 w-4" />
                  {t('Parent.addLearner.submit')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
