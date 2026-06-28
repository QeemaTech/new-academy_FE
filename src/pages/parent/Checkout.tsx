import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { AlertTriangle, CreditCard, Loader2, Lock, Tag } from 'lucide-react';
import { api } from '../../lib/axios';
import { fetchPublicPackages } from '../../api/public';
import { processCheckout, validateCheckoutCoupon } from '../../api/parentCheckout';
import { AddLearnerDialog } from '../../components/parent/AddLearnerDialog';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';

type ChildRow = { id: string; fullName: string; username: string; age: number | null };

const BRAND = '#4178EF';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageId = searchParams.get('packageId');
  const queryClient = useQueryClient();

  const [couponInput, setCouponInput] = useState('');
  const [validated, setValidated] = useState<{
    originalTotal: number;
    discountedTotal: number;
    savings: number;
    coupon: { id: string; code: string } | null;
  } | null>(null);
  const [childId, setChildId] = useState<string>('');
  const [addLearnerOpen, setAddLearnerOpen] = useState(false);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const { data: packages, isPending: packagesLoading } = useQuery({
    queryKey: ['public', 'packages'],
    queryFn: fetchPublicPackages,
    staleTime: 60_000,
  });

  const pkg = useMemo(() => packages?.find((p) => p.id === packageId) ?? null, [packages, packageId]);

  const { data: children = [], isPending: childrenLoading } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: async () => {
      const res = await api.get<{ data: { children: ChildRow[] } }>('/parent/children');
      return res.data.data.children;
    },
  });

  const validateMut = useMutation({
    mutationFn: async () => {
      if (!packageId) throw new Error('missing package');
      return validateCheckoutCoupon({
        packageId,
        code: couponInput.trim() || undefined,
      });
    },
    onSuccess: (data) => {
      setValidated({
        originalTotal: data.originalTotal,
        discountedTotal: data.discountedTotal,
        savings: data.savings,
        coupon: data.coupon,
      });
      toast.success(data.coupon ? 'تم تطبيق الكوبون' : 'تم تحديث الملخص');
    },
    onError: (e) => {
      setValidated(null);
      const msg = isAxiosError(e) ? (e.response?.data as { message?: string })?.message : null;
      toast.error(msg || 'تعذر التحقق من الكوبون');
    },
  });

  const processMut = useMutation({
    mutationFn: () =>
      processCheckout({
        packageId: packageId!,
        childId,
        couponCode: couponInput.trim() || null,
        mockCard: {
          holderName: cardName,
          number: cardNumber.replace(/\s/g, ''),
          expiry: cardExpiry,
          cvc: cardCvc,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['parent', 'payments'] });
      toast.success('تم تفعيل الاشتراك بنجاح!');
      navigate('/parent/dashboard', { replace: true });
    },
    onError: (e) => {
      const msg = isAxiosError(e) ? (e.response?.data as { message?: string })?.message : null;
      toast.error(msg || 'تعذر إتمام الدفع');
    },
  });

  if (!packageId) {
    return <Navigate to="/ar/pricing" replace />;
  }

  if (!packagesLoading && packages && !pkg) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-bold text-slate-800">الباقة غير موجودة أو لم تعد متاحة.</p>
        <Button asChild className="mt-4 bg-[#4178EF] font-bold text-white">
          <Link to="/ar/pricing">العودة للأسعار</Link>
        </Button>
      </div>
    );
  }

  const displayOriginal = validated?.originalTotal ?? pkg?.price ?? 0;
  const displayFinal = validated?.discountedTotal ?? pkg?.price ?? 0;
  const hasDiscount = validated && validated.savings > 0;

  const onApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    validateMut.mutate();
  };

  const canPay =
    childId &&
    cardName.trim().length >= 2 &&
    cardNumber.replace(/\s/g, '').length >= 12 &&
    cardExpiry.trim().length >= 4 &&
    cardCvc.trim().length >= 3;

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 md:text-3xl">إتمام الاشتراك</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">راجع التفاصيل، اختر الطفل، وأكمل الدفع التجريبي.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-[#4178EF]" />
                  بطاقة ائتمان (تجريبي)
                </CardTitle>
                <CardDescription>لا يتم خصم مبالغ حقيقية — محاكاة فقط لاختبار التدفق.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">الاسم على البطاقة</Label>
                  <Input
                    id="cardName"
                    placeholder="مثال: Ahmed Al Saud"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">رقم البطاقة</Label>
                  <Input
                    id="cardNumber"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="h-11 font-mono"
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exp">انتهاء الصلاحية</Label>
                    <Input
                      id="exp"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="h-11 font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="h-11 font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
                <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Lock className="h-3.5 w-3.5" />
                  الاتصال مشفراً في الإنتاج عبر بوابة الدفع.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">الطالب</CardTitle>
                <CardDescription>اختر الطفل الذي سيُفعَّل له الاشتراك.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {childrenLoading ? (
                  <Skeleton className="h-11 w-full" />
                ) : children.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <p className="font-black text-amber-900">لا يوجد طالب مرتبط بحسابك</p>
                        <p className="mt-1 text-sm font-medium text-amber-800/90">أضف طالبًا قبل إتمام الاشتراك.</p>
                        <Button
                          type="button"
                          className="mt-4 bg-[#4178EF] font-bold text-white hover:bg-[#3264D6]"
                          onClick={() => setAddLearnerOpen(true)}
                        >
                          إضافة طالب
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>اختر الطفل</Label>
                    <Select value={childId} onValueChange={setChildId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="اختر طالباً" />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.fullName}
                            {c.age != null ? ` (${c.age} سنة)` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24 border-slate-200 shadow-lg shadow-slate-200/50">
              <CardHeader>
                <CardTitle className="text-lg">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {packagesLoading || !pkg ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">الباقة</p>
                      <p className="font-black text-slate-900">{pkg.name}</p>
                      {pkg.description && <p className="mt-1 text-sm text-slate-500">{pkg.description}</p>}
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {pkg.durationMonths} شهر · {pkg.sessionsPerWeek} حصص أسبوعياً · حتى {pkg.maxTracks} مسارات
                      </p>
                    </div>

                    <form onSubmit={onApplyCoupon} className="space-y-2 border-t border-slate-100 pt-4">
                      <Label htmlFor="coupon" className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-[#4178EF]" />
                        كوبون خصم
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="coupon"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            setValidated(null);
                          }}
                          placeholder="أدخل الرمز"
                          className="h-10 font-mono"
                          dir="ltr"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          disabled={validateMut.isPending}
                          className="shrink-0 border-[#4178EF] font-bold text-[#4178EF]"
                        >
                          {validateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تطبيق'}
                        </Button>
                      </div>
                    </form>

                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-bold text-slate-500">الإجمالي</span>
                        <div className="text-end">
                          {hasDiscount && (
                            <p className="text-sm font-bold text-slate-400 line-through">
                              {Math.round(displayOriginal).toLocaleString('ar-SA')} ريال
                            </p>
                          )}
                          <p className="text-2xl font-black tabular-nums" style={{ color: BRAND }}>
                            {Math.round(displayFinal).toLocaleString('ar-SA')}{' '}
                            <span className="text-base font-bold text-slate-500">ريال</span>
                          </p>
                          {hasDiscount && (
                            <p className="text-xs font-bold text-emerald-600">وفّرت {Math.round(validated!.savings).toLocaleString('ar-SA')} ريال</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="h-12 w-full bg-[#4178EF] text-base font-black text-white hover:bg-[#3264D6]"
                      disabled={!canPay || children.length === 0 || processMut.isPending}
                      onClick={() => processMut.mutate()}
                    >
                      {processMut.isPending ? (
                        <>
                          <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                          جاري المعالجة…
                        </>
                      ) : (
                        'تأكيد ودفع'
                      )}
                    </Button>
                    <Button variant="ghost" className="w-full font-bold text-slate-500" asChild>
                      <Link to="/ar/pricing">تعديل الباقة</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddLearnerDialog
        open={addLearnerOpen}
        onOpenChange={(open) => {
          setAddLearnerOpen(open);
          if (!open) queryClient.invalidateQueries({ queryKey: ['parent', 'children'] });
        }}
      />
    </>
  );
}
