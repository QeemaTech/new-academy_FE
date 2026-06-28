import { api } from '../lib/axios';

type ApiRes<T> = { success: boolean; data: T };

export type PurchaseType = 'LIVE' | 'RECORDED';

export async function purchaseTrack(body: { childId: string; trackId: string; purchaseType: PurchaseType }) {
  const { data } = await api.post<ApiRes<any>>('/parent/purchase/track', body);
  return data.data;
}

export async function purchaseBundle(body: { childId: string; bundleId: string }) {
  const { data } = await api.post<ApiRes<any>>('/parent/purchase/bundle', body);
  return data.data;
}

export async function redeemSubscriptionTrack(body: { childId: string; trackId: string }) {
  const { data } = await api.post<ApiRes<any>>('/parent/subscription/redeem-track', body);
  return data.data;
}

