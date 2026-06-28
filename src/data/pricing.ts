export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  recommended: boolean;
  color: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'الأساسي',
    price: 199,
    period: 'شهرياً',
    description: 'مثالي للبداية والتجربة',
    features: [
      'حصتان أسبوعياً',
      'مسار واحد',
      'شهادة إتمام',
      'دعم فني بالإيميل',
      'مشاريع تطبيقية'
    ],
    recommended: false,
    color: 'var(--primary-blue)'
  },
  {
    id: 'pro',
    name: 'المتقدم',
    price: 349,
    period: 'شهرياً',
    description: 'الأكثر شعبية للتعلم الجاد',
    features: [
      '3 حصص أسبوعياً',
      'جميع المسارات',
      'شهادة إتمام معتمدة',
      'دعم فني على مدار الساعة',
      'مشاريع تطبيقية متقدمة',
      'مسابقات ومنافسات',
      'تقارير أسبوعية لولي الأمر'
    ],
    recommended: true,
    color: 'var(--success-green)'
  },
  {
    id: 'premium',
    name: 'المميز',
    price: 549,
    period: 'شهرياً',
    description: 'تجربة شاملة مع متابعة خاصة',
    features: [
      '5 حصص أسبوعياً',
      'جميع المسارات + حصص خاصة',
      'شهادة إتمام معتمدة دولياً',
      'مدرب شخصي',
      'مشاريع حقيقية',
      'مسابقات دولية',
      'تقارير يومية',
      'استشارات تعليمية'
    ],
    recommended: false,
    color: 'var(--accent-orange)'
  }
];




