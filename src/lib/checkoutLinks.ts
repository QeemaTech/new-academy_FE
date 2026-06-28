/** Path to parent checkout for a subscription package. */
export function subscriptionCheckoutPath(packageId: string) {
  return `/parent/checkout?packageId=${encodeURIComponent(packageId)}`;
}

/** Login URL that returns the user to checkout after auth. */
export function loginPathForCheckout(packageId: string) {
  return `/auth/login?redirect=${encodeURIComponent(subscriptionCheckoutPath(packageId))}`;
}
