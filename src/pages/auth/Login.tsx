import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, LogIn, ArrowRight, UserCircle, Briefcase, GraduationCap, AtSign, Presentation } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { mapBackendUserToStore } from '../../lib/mapBackendUser';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { cn } from '../../lib/cn';
import { getSafeRedirectUrl } from '../../lib/authRedirect';
import { getDefaultAdminRoute } from '../../lib/adminRedirect';

/** Email for parents/admins; username (no @) for child accounts — matches backend `loginUser`. */
const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم')
    .superRefine((val, ctx) => {
      if (val.includes('@')) {
        const ok = z.string().email().safeParse(val).success;
        if (!ok) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'يرجى إدخال بريد إلكتروني صحيح',
          });
        }
      } else {
        if (val.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'اسم المستخدم قصير جداً',
          });
        } else if (!/^[a-zA-Z0-9_.\u0600-\u06FF-]+$/.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'اسم المستخدم يحتوي رموزاً غير مسموحة',
          });
        }
      }
    }),
  password: z.string().min(1, 'أدخل كلمة المرور'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = useMemo(() => getSafeRedirectUrl(searchParams.get('redirect')), [searchParams]);
  const loginStore = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<'parent' | 'student' | 'admin' | 'teacher'>('parent');

  const registerHref = redirectTarget
    ? `/auth/register?redirect=${encodeURIComponent(redirectTarget)}`
    : '/auth/register';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });


  const goAfterLogin = (user: { role: string; permissions?: string[] }) => {
    const role = user.role.toLowerCase();
    
    if (redirectTarget && role === 'parent') {
      navigate(redirectTarget, { replace: true });
      return;
    }

    if (role === 'parent') {
      navigate('/parent/dashboard');
    } else if (role === 'student' || role === 'child') {
      navigate('/student/dashboard');
    } else if (role === 'teacher') {
      navigate('/teacher/tracks');
    } else if (role === 'admin' || role === 'staff' || role === 'super_admin') {
      navigate(getDefaultAdminRoute(user));
    } else {
      navigate('/ar');
    }
  };

  const readApiError = (e: any) => {
    const d = e.response?.data;
    return d?.message || d?.error || t('Auth.errors.generic');
  };

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        identifier: data.identifier,
        password: data.password 
      });
      
      const body = res.data;
      if (body?.success && body.data?.user && body.data.tokens?.accessToken) {
        const u = mapBackendUserToStore(body.data.user);
        loginStore(u, body.data.tokens.accessToken);
        goAfterLogin(u);
        return;
      }
      
      toast.error(t('Auth.errors.someError'));
    } catch (err: any) {
      toast.error(t('Auth.errors.someError'));
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (role: 'parent' | 'student' | 'admin' | 'teacher') => {
    setActiveRoleTab(role);
    const credentials = {
      parent: { identifier: 'parent@e2e.newacademy.test', pass: 'Password123' },
      student: { identifier: 'hero.student', pass: 'Password123' },
      admin: { identifier: 'admin@e2e.newacademy.test', pass: 'Password123' },
      teacher: { identifier: 'teacher@e2e.newacademy.test', pass: 'Password123' },
    };
    setValue('identifier', credentials[role].identifier);
    setValue('password', credentials[role].pass);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {t('Auth.loginTitle', 'تسجيل الدخول')}
          </h1>
          <p className="text-gray-400 font-bold">
            {t('Auth.loginSubtitle', 'مرحباً بك مجدداً في نيو أكاديمي')}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AuthInput
            {...register('identifier')}
            label={t('Auth.identifier', 'البريد الإلكتروني أو اسم المستخدم')}
            icon={AtSign}
            type="text"
            autoComplete="username"
            placeholder="parent@academy.com أو anas_pro"
            error={errors.identifier?.message}
          />
          
          <div className="space-y-2">
            <AuthInput
              {...register('password')}
              label={t('Auth.password', 'كلمة المرور')}
              icon={Lock}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
            />
            <div className="flex justify-end px-2">
              <Link to="/auth/forgot" className="text-sm font-black text-[#4178EF] hover:underline transition-all">
                {t('Auth.forgotPassword', 'نسيت كلمة المرور؟')}
              </Link>
            </div>
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
                <LogIn size={20} className="group-hover:translate-x-[-2px] transition-transform" />
                {t('Auth.signIn', 'دخول')}
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center gap-4 py-2">
          <div className="flex-grow h-px bg-gray-100" />
          <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{t('Auth.or', 'أو الدخول بـ')}</span>
          <div className="flex-grow h-px bg-gray-100" />
        </div>

        {/* Segmented Control Role Picker (Demo) */}
        <div className="space-y-4">
          <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {t('Auth.demoAccounts', 'الدخول السريع للحسابات التجريبية')}
          </p>
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-gray-100 bg-gray-50 p-1.5 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setDemoAccount('parent')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-3 font-black text-xs transition-all',
                activeRoleTab === 'parent' ? 'bg-white text-[#4178EF] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <UserCircle size={16} />
              ولي أمر
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('student')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-3 font-black text-xs transition-all',
                activeRoleTab === 'student' ? 'bg-white text-[#4178EF] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <GraduationCap size={16} />
              طالب
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('teacher')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-3 font-black text-xs transition-all',
                activeRoleTab === 'teacher' ? 'bg-white text-[#4178EF] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Presentation size={16} />
              معلم
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('admin')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-3 font-black text-xs transition-all',
                activeRoleTab === 'admin' ? 'bg-white text-[#4178EF] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Briefcase size={16} />
              مدير
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-4">
          <p className="text-gray-400 font-bold">
            {t('Auth.noAccount', 'لا تملك حساباً؟')}{' '}
            <Link to={registerHref} className="text-[#4178EF] font-black hover:underline inline-flex items-center gap-1 group">
              {t('Auth.registerNow', 'إنشاء حساب جديد')}
              <ArrowRight size={16} className="group-hover:translate-x-[2px] transition-transform rtl:rotate-180" />
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
