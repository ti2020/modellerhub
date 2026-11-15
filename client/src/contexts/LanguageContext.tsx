import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'home.title': 'Welcome to ModellerHub Community',
    'home.slogan': 'We Thrive Together',
    'home.subtitle': "Modeller's Homeland",
    'home.description': 'Connecting the Architects of Finance - A premier professional collective dedicated to elevating financial modeling standards.',
    'home.joinTelegram': 'Join Us on Telegram',
    'home.featuredCourses': 'Featured Courses',
    'home.featuredEvents': 'Featured Events',
    'home.exploreCourses': 'Explore All Courses',
    'home.viewEvents': 'View All Events',
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.events': 'Events',
    'nav.batches': 'Batches',
    'nav.about': 'About',
    'nav.mission': 'Mission & Vision',
    'nav.modeling': 'Modeling Field',
    'nav.models': 'Models Library',
    'models.title': 'Models Library',
    'models.intro': 'Integrated three-statement models built to the AFM standard, each one balanced and fully checked.',
    'models.readOnly': 'View only: values and formatting, no formulas, no editing or downloads.',
    'models.open': 'Open model',
    'models.back': 'All models',
    'models.modelledBy': 'Modelled by',
    'models.sheets': 'Model sheets',
    'models.loadError': 'This model could not be loaded. Please try again.',
    'models.notFound': 'That model does not exist.',
    'models.note': 'Values shown as saved in the original workbook.',
    'nav.admin': 'Admin',
    'nav.language': 'Language',
    'footer.copyright': '© 2026 ModellerHub Community. All rights reserved.',
    'footer.slogan': 'We Thrive Together',
  },
  ar: {
    'home.title': 'مرحباً بك في مجتمع ModellerHub',
    'home.slogan': 'نحن ننمو معاً',
    'home.subtitle': 'وطن المُحلِّل',
    'home.description': 'ربط معماري التمويل - مجموعة احترافية رائدة مكرسة لرفع معايير النمذجة المالية.',
    'home.joinTelegram': 'انضم إلينا على تيليجرام',
    'home.featuredCourses': 'الدورات المميزة',
    'home.featuredEvents': 'الأحداث المميزة',
    'home.exploreCourses': 'استكشف جميع الدورات',
    'home.viewEvents': 'عرض جميع الأحداث',
    'nav.home': 'الرئيسية',
    'nav.courses': 'الدورات',
    'nav.events': 'الأحداث',
    'nav.batches': 'الدفعات',
    'nav.about': 'حول',
    'nav.mission': 'الرسالة والرؤية',
    'nav.modeling': 'مجال النمذجة',
    'nav.models': 'مكتبة النماذج',
    'models.title': 'مكتبة النماذج',
    'models.intro': 'نماذج متكاملة للقوائم المالية الثلاث وفق معيار AFM، كل نموذج متوازن ومُدقق بالكامل.',
    'models.readOnly': 'للعرض فقط: القيم والتنسيق، دون معادلات أو تعديل أو تنزيل.',
    'models.open': 'افتح النموذج',
    'models.back': 'كل النماذج',
    'models.modelledBy': 'إعداد',
    'models.sheets': 'أوراق النموذج',
    'models.loadError': 'تعذر تحميل هذا النموذج. حاول مرة أخرى.',
    'models.notFound': 'هذا النموذج غير موجود.',
    'models.note': 'القيم كما حُفظت في ملف العمل الأصلي.',
    'nav.admin': 'إدارة',
    'nav.language': 'اللغة',
    'footer.copyright': '© 2026 مجتمع ModellerHub. جميع الحقوق محفوظة.',
    'footer.slogan': 'نحن ننمو معاً',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, defaultValue?: string): string => {
    return translations[language][key] || defaultValue || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
