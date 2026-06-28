import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { isAxiosError } from 'axios';
import { User, Mail, Lock, UserPlus, ArrowLeft, UserCircle, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { mapBackendUserToStore } from '../../lib/mapBackendUser';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { cn } from '../../lib/cn';
import { getSafeRedirectUrl } from '../../lib/authRedirect';

/** Must stay aligned with `backend/src/modules/auth/auth.validation.ts` (register). */
const registerSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[a-zA-Z]/, 'يجب أن تحتوي كلمة المرور على حرف إنجليزي واحد على الأقل')
    .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل'),
  confirmPassword: z.string(),
  role: z.enum(['parent', 'student']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور لا تتطابق",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = useMemo(() => getSafeRedirectUrl(searchParams.get('redirect')), [searchParams]);
  const loginStore = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  const loginHref = redirectTarget
    ? `/auth/login?redirect=${encodeURIComponent(redirectTarget)}`
    : '/auth/login';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'parent',
    }
  });

  const selectedRole = watch('role');

  const goAfterRegister = (role: string) => {
    const r = role.toLowerCase();
    if (redirectTarget && r === 'parent') {
      navigate(redirectTarget, { replace: true });
      return;
    }
    if (r === 'parent') navigate('/parent/dashboard');
    else if (r === 'student' || r === 'child') navigate('/student/dashboard');
    else navigate('/ar');
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      if (data.role === 'student') {
        toast.error(
          t('Auth.studentRegisterDisabled', 'حساب الطالب يُنشأ عبر ولي الأمر أو الأكاديمية.')
        );
        return;
      }

      try {
        const res = await api.post('/auth/register', {
          fullName: data.fullName,
          email: data.email.trim().toLowerCase(),
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
        const body = res.data as {
          success?: boolean;
          data?: {
            user?: {
              id: string;
              fullName: string;
              email?: string;
              username?: string;
              role: string;
              customRole?: { permissions: unknown } | null;
            };
            tokens?: { accessToken?: string };
          };
          message?: string;
        };
        if (body?.success && body.data?.user && body.data.tokens?.accessToken) {
          const u = mapBackendUserToStore(body.data.user);
          loginStore(u, body.data.tokens.accessToken);
          toast.success(t('Auth.registerSuccess', 'تم إنشاء الحساب بنجاح'));
          goAfterRegister(u.role);
          return;
        }
        toast.error(body?.message || t('Auth.errors.generic'));
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          const msg = err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data
            ? String((err.response.data as { message?: string }).message)
            : null;
          if (msg) {
            toast.error(msg);
            return;
          }
        }
        toast.error(t('Auth.errors.generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="انضم إلى عائلة نيو أكاديمي اليوم وابدأ رحلة طفلك في عالم البرمجة"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {t('Auth.registerTitle', 'إنشاء حساب جديد')}
          </h1>
          <p className="text-gray-400 font-bold">
            {t('Auth.registerSubtitle', 'أهلاً بك في مستقبل التعليم الرقمي')}
          </p>
        </div>

        {/* Account Type Segmented Picker */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ms-1">
            {t('Auth.accountType', 'نوع الحساب')}
          </label>
          <div className="bg-gray-50 p-1.5 rounded-2xl flex gap-1 border border-gray-100">
            <button
              type="button"
              onClick={() => setValue('role', 'parent')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all",
                selectedRole === 'parent' ? "bg-white text-[#4178EF] shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <UserCircle size={16} />
              ولي أمر
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'student')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all",
                selectedRole === 'student' ? "bg-white text-[#4178EF] shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <GraduationCap size={16} />
              طالب
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput
            {...register('fullName')}
            label={t('Auth.fullName', 'الاسم الكامل')}
            icon={User}
            placeholder="أدخل اسمك الكامل"
            error={errors.fullName?.message}
          />
          
          <AuthInput
            {...register('email')}
            label={t('Auth.email', 'البريد الإلكتروني')}
            icon={Mail}
            type="email"
            placeholder="example@academy.com"
            error={errors.email?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AuthInput
              {...register('password')}
              label={t('Auth.password', 'كلمة المرور')}
              icon={Lock}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              hint={t('Auth.passwordRegisterHint', '8 أحرف على الأقل، مع حرف إنجليزي ورقم')}
            />
            <AuthInput
              {...register('confirmPassword')}
              label={t('Auth.confirmPassword', 'تأكيد كلمة المرور')}
              icon={Lock}
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#4178EF] hover:bg-[#3264D6] disabled:opacity-50 text-white rounded-[1.25rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#4178EF]/20 transition-all active:scale-95 group mt-4"
          >
            {loading ? (
              <span className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                {t('Auth.createAccount', 'إنشاء الحساب')}
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <p className="text-gray-400 font-bold">
            {t('Auth.loginLink', 'لديك حساب بالفعل؟')}{' '}
            <Link to={loginHref} className="text-[#4178EF] font-black hover:underline inline-flex items-center gap-1 group">
              <ArrowLeft size={16} className="group-hover:translate-x-[-2px] transition-transform" />
              {t('Auth.signInLink', 'سجل الدخول')}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
