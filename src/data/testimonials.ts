export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'أم محمد',
    role: 'ولي أمر',
    content: 'ابني تحسن كثيراً في التفكير المنطقي وأصبح يبتكر مشاريع بنفسه. أنا سعيدة جداً بالنتائج التي حققها مع نيو أكاديمي.',
    rating: 5,
    avatar: ''
  },
  {
    id: 2,
    name: 'أبو سارة',
    role: 'ولي أمر',
    content: 'بنتي كانت تخاف من التكنولوجيا والآن أصبحت تبرمج ألعاب بنفسها! المعلمون ممتازون والمنهج مدروس بعناية.',
    rating: 5,
    avatar: ''
  },
  {
    id: 3,
    name: 'أم خالد',
    role: 'ولي أمر',
    content: 'الحصص تفاعلية ومشوقة، ابني يستمتع بكل درس ويتطلع دائماً للحصة القادمة. شكراً نيو أكاديمي!',
    rating: 5,
    avatar: ''
  },
  {
    id: 4,
    name: 'أبو أحمد',
    role: 'ولي أمر',
    content: 'استثمار رائع في مستقبل أطفالنا. المحتوى عربي 100% وهذا ما كنا نبحث عنه. أنصح الجميع بالتسجيل.',
    rating: 4,
    avatar: ''
  },
  {
    id: 5,
    name: 'أم ليان',
    role: 'ولي أمر',
    content: 'ابنتي حصلت على المركز الأول في مسابقة البرمجة المدرسية بفضل ما تعلمته هنا. فخورة جداً بها!',
    rating: 5,
    avatar: ''
  }
];




