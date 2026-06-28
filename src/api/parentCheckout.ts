import { api } from '../lib/axios';

export type CheckoutPackageSummary = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMonths: number;
  sessionsPerWeek: number;
  level: string;
  maxTracks: number;
};

export type ValidateCouponResponse = {
  package: CheckoutPackageSummary;
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  coupon: { id: string; code: string } | null;
};

export type ProcessCheckoutResponse = {
  subscription: {
    id: string;
    childId: string;
    packageId: string;
    status: string;
    package: { name: string };
    child: { fullName: string };
  };
  amountPaid: number;
  originalPrice: number;
};

type ApiRes<T> = { success: boolean; data: T };

export async function validateCheckoutCoupon(body: {
  packageId: string;
  code?: string;
  programId?: string | null;
}) {
  const { data } = await api.post<ApiRes<ValidateCouponResponse>>('/parent/checkout/validate-coupon', body);
  return data.data;
}

export async function processCheckout(body: {
  packageId: string;
  childId: string;
  couponCode?: string | null;
  mockCard?: { holderName?: string; number?: string; expiry?: string; cvc?: string };
}) {
  const { data } = await api.post<ApiRes<ProcessCheckoutResponse>>('/parent/checkout/process', body);
  return data.data;
}
