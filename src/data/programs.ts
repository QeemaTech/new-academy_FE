export interface Program {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  duration: string;
  lessonsPerWeek: number;
  price: number;
  icon: string;
  color: string;
  skills: string[];
  tracks: string[];
  image: string;
}

export const programs: Program[] = [
  {
    id: 'scratch-junior',
    title: 'سكراتش جونيور',
    description: 'تعلم أساسيات البرمجة المرئية بطريقة ممتعة ومبسطة للأطفال الصغار من خلال بناء قصص وألعاب تفاعلية.',
    ageRange: '5-7 سنوات',
    duration: '3 أشهر',
    lessonsPerWeek: 2,
    price: 199,
    icon: 'bi-puzzle',
    color: '#E39D6F',
    skills: ['التفكير المنطقي', 'الإبداع', 'حل المشكلات'],
    tracks: ['برمجة مرئية', 'قصص تفاعلية', 'ألعاب بسيطة'],
    image: ''
  },
  {
    id: 'scratch',
    title: 'سكراتش المتقدم',
    description: 'برمجة الألعاب والرسوم المتحركة باستخدام سكراتش مع مشاريع أكثر تعقيداً وتحديات ممتعة.',
    ageRange: '8-10 سنوات',
    duration: '4 أشهر',
    lessonsPerWeek: 2,
    price: 249,
    icon: 'bi-controller',
    color: '#366DEC',
    skills: ['البرمجة', 'التصميم', 'العمل الجماعي'],
    tracks: ['ألعاب', 'رسوم متحركة', 'محاكاة'],
    image: ''
  },
  {
    id: 'python-kids',
    title: 'بايثون للأطفال',
    description: 'دخول عالم البرمجة النصية الحقيقية بلغة بايثون مع مشاريع تطبيقية ممتعة ومسلية.',
    ageRange: '10-13 سنوات',
    duration: '5 أشهر',
    lessonsPerWeek: 2,
    price: 299,
    icon: 'bi-code-slash',
    color: '#46D268',
    skills: ['البرمجة النصية', 'الخوارزميات', 'تحليل البيانات'],
    tracks: ['برمجة', 'ألعاب نصية', 'تحليل بيانات'],
    image: ''
  },
  {
    id: 'web-development',
    title: 'تطوير الويب',
    description: 'تعلم بناء مواقع ويب حقيقية باستخدام HTML وCSS وJavaScript مع مشاريع عملية.',
    ageRange: '12-16 سنوات',
    duration: '6 أشهر',
    lessonsPerWeek: 3,
    price: 349,
    icon: 'bi-globe',
    color: '#ECC53E',
    skills: ['HTML', 'CSS', 'JavaScript', 'تصميم'],
    tracks: ['مواقع ويب', 'تصميم واجهات', 'برمجة تفاعلية'],
    image: ''
  },
  {
    id: 'robotics',
    title: 'الروبوتات والذكاء الاصطناعي',
    description: 'استكشاف عالم الروبوتات وبرمجتها مع مقدمة في الذكاء الاصطناعي وتعلم الآلة.',
    ageRange: '11-15 سنوات',
    duration: '5 أشهر',
    lessonsPerWeek: 2,
    price: 399,
    icon: 'bi-robot',
    color: '#E74C3C',
    skills: ['الروبوتات', 'الذكاء الاصطناعي', 'الإلكترونيات'],
    tracks: ['بناء روبوتات', 'برمجة', 'ذكاء اصطناعي'],
    image: ''
  },
  {
    id: 'app-development',
    title: 'تطوير التطبيقات',
    description: 'تعلم بناء تطبيقات موبايل احترافية من الصفر حتى النشر على متاجر التطبيقات.',
    ageRange: '13-17 سنوات',
    duration: '6 أشهر',
    lessonsPerWeek: 3,
    price: 449,
    icon: 'bi-phone',
    color: '#9B59B6',
    skills: ['تطوير تطبيقات', 'تصميم UX', 'قواعد بيانات'],
    tracks: ['تطبيقات iOS', 'تطبيقات Android', 'تصميم'],
    image: ''
  }
];

export const getProgram = (id: string) => programs.find(p => p.id === id);

