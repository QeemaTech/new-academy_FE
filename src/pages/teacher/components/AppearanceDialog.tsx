import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { cn } from '../../../lib/cn';

export function AppearanceDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#0b2a5c]">المظهر والتخصيص</DialogTitle>
          <DialogDescription>
            اختر لغة واجهة المستخدم المفضلة لديك.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-700">لغة العرض (Language)</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => changeLanguage('ar')}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all",
                  i18n.language === 'ar' 
                    ? "border-[#10B981] bg-emerald-50 text-[#0b2a5c]" 
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                )}
              >
                <span className="font-bold">العربية</span>
                {i18n.language === 'ar' && <Check className="w-5 h-5 text-[#10B981]" />}
              </button>
              
              <button
                onClick={() => changeLanguage('en')}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all",
                  i18n.language === 'en' 
                    ? "border-[#10B981] bg-emerald-50 text-[#0b2a5c]" 
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                )}
                dir="ltr"
              >
                <span className="font-bold">English</span>
                {i18n.language === 'en' && <Check className="w-5 h-5 text-[#10B981]" />}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
