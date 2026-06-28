import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const contactSchema = z.object({
  name: z.string().min(2, 'أدخل الاسم'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'أدخل الموضوع'),
  message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const infoItems = [
  { Icon: Mail, label: 'البريد الإلكتروني', value: 'info@new-academy.com', href: 'mailto:info@new-academy.com' },
  { Icon: Phone, label: 'الهاتف', value: '+966 50 123 4567', href: 'tel:+966501234567' },
  { Icon: MapPin, label: 'العنوان', value: 'الرياض، المملكة العربية السعودية', href: null as string | null },
  { Icon: Clock, label: 'ساعات العمل', value: 'السبت - الخميس: 9 ص - 9 م', href: null as string | null },
];

export default function Contact() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (_values: ContactFormValues) => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('تم استلام رسالتك، سنتواصل معك قريباً!');
    form.reset();
  };

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">تواصل معنا</h1>
          <p className="mt-3 text-base font-medium text-slate-500 md:text-lg">
            نحن هنا للإجابة على استفساراتك ومساعدتك في رحلة طفلك التعليمية
          </p>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-4">
            {infoItems.map(({ Icon, label, value, href }) => (
              <Card key={label} className="border-slate-200 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4178EF]/12 text-[#4178EF]">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-400">{label}</p>
                    {href ? (
                      <a href={href} className="mt-1 block break-all text-sm font-bold text-slate-800 hover:text-[#4178EF]">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 p-6 shadow-lg md:p-8">
            <h2 className="mb-6 text-xl font-black text-slate-900">أرسل لنا رسالة</h2>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input id="name" className="h-11" {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-xs font-semibold text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" className="h-11" dir="ltr" {...form.register('email')} />
                  {form.formState.errors.email && (
                    <p className="text-xs font-semibold text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                <Input id="phone" type="tel" className="h-11" dir="ltr" {...form.register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">الموضوع</Label>
                <Input id="subject" className="h-11" {...form.register('subject')} />
                {form.formState.errors.subject && (
                  <p className="text-xs font-semibold text-red-600">{form.formState.errors.subject.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">الرسالة</Label>
                <Textarea id="message" rows={6} className="min-h-[140px] resize-y" {...form.register('message')} />
                {form.formState.errors.message && (
                  <p className="text-xs font-semibold text-red-600">{form.formState.errors.message.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-12 w-full rounded-xl bg-[#4178EF] text-base font-black text-white hover:bg-[#3264D6]"
              >
                {form.formState.isSubmitting ? 'جاري الإرسال…' : 'إرسال الرسالة'}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </>
  );
}
