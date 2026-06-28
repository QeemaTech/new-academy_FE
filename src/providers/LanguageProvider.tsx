import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // 1. Set DOM structure for RTL support
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // 2. Set dynamic font family classes for Tailwind
    if (isRTL) {
      document.body.classList.add('font-cairo');
      document.body.classList.remove('font-inter');
    } else {
      document.body.classList.add('font-inter');
      document.body.classList.remove('font-cairo');
    }

    // Persist user selection
    localStorage.setItem('appLang', i18n.language);
  }, [i18n.language, isRTL]);

  return <>{children}</>;
};
