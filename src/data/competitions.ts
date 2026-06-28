export interface Competition {
  id: string;
  title: string;
  description: string;
  date: string;
  deadline: string;
  ageRange: string;
  participants: number;
  prizes: string[];
  status: 'upcoming' | 'active' | 'completed';
  icon: string;
}

export const competitions: Competition[] = [
  {
    id: 'hackathon-2026',
    title: 'هاكاثون نيو أكاديمي 2026',
    description: 'أكبر مسابقة برمجة للأطفال في المنطقة العربية. قم ببناء مشروعك خلال 48 ساعة!',
    date: '2026-04-15',
    deadline: '2026-04-01',
    ageRange: '8-17 سنة',
    participants: 250,
    prizes: ['جائزة المركز الأول: 5000 ريال', 'المركز الثاني: 3000 ريال', 'المركز الثالث: 1000 ريال'],
    status: 'upcoming',
    icon: 'bi-trophy'
  },
  {
    id: 'scratch-challenge',
    title: 'تحدي سكراتش الإبداعي',
    description: 'صمم لعبة أو قصة تفاعلية باستخدام سكراتش واربح جوائز قيمة.',
    date: '2026-03-20',
    deadline: '2026-03-10',
    ageRange: '6-12 سنة',
    participants: 180,
    prizes: ['ميدالية ذهبية + هدية تقنية', 'ميدالية فضية + هدية', 'ميدالية برونزية'],
    status: 'active',
    icon: 'bi-stars'
  },
  {
    id: 'ai-innovators',
    title: 'مبتكرو الذكاء الاصطناعي',
    description: 'مسابقة لبناء مشاريع ذكاء اصطناعي مبتكرة تحل مشكلات حقيقية.',
    date: '2026-05-10',
    deadline: '2026-04-25',
    ageRange: '12-17 سنة',
    participants: 100,
    prizes: ['منحة دراسية', 'جهاز لابتوب', 'دورة متقدمة مجانية'],
    status: 'upcoming',
    icon: 'bi-cpu'
  },
  {
    id: 'web-wizards',
    title: 'سحرة الويب',
    description: 'صمم أفضل موقع ويب تفاعلي واحصل على فرصة لعرض مشروعك أمام شركات تقنية.',
    date: '2025-12-01',
    deadline: '2025-11-15',
    ageRange: '13-17 سنة',
    participants: 120,
    prizes: ['فرصة تدريب في شركة تقنية', 'جائزة نقدية 2000 ريال', 'شهادة تميز'],
    status: 'completed',
    icon: 'bi-globe2'
  }
];




