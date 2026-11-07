import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string, defaultValue?: string) => string;
  /** Picks row[`${base}Ar`] or row[`${base}En`] for the current language, falling back to the other. */
  pick: (row: Record<string, any> | null | undefined, base: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'home.title': 'Welcome to ModellerHub Community',
    'home.slogan': 'We Thrive Together',
    'home.subtitle': "Modeller's Homeland",
    'home.description': 'Connecting the Architects of Finance - A premier professional collective dedicated to elevating financial modeling standards.',
    'home.joinTelegram': 'Join Us on Telegram',
    'home.ctaTitle': 'Ready to Join?',
    'home.ctaText': 'Connect with a network of financial modeling professionals and elevate your skills.',
    'footer.community': 'Community',
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
    'nav.models': 'Models',
    'models.intro': '{n} integrated three-statement models built by {name} for FMI AFM exam practice. Open any model to browse every sheet and watch the walkthrough.',
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
    'home.ctaTitle': 'مستعد للانضمام؟',
    'home.ctaText': 'تواصل مع شبكة من محترفي النمذجة المالية وارتقِ بمهاراتك.',
    'footer.community': 'المجتمع',
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
    'nav.models': 'النماذج',
    'models.title': 'مكتبة النماذج',
    'models.intro': '{n} نموذجاً مالياً متكاملاً للقوائم الثلاث من إعداد {name} للتدرب على اختبار AFM من FMI. افتح أي نموذج لتصفح جميع الأوراق ومشاهدة الشرح.',
    'models.cardBy': 'إعداد',
    'models.by': 'إعداد',
    'models.viewModel': 'عرض النموذج',
    'models.video': 'فيديو',
    'models.all': 'كل النماذج',
    'models.subtitle': 'نموذج متكامل للقوائم الثلاث · تدريب على اختبار AFM',
    'models.workbook': 'ملف النموذج',
    'models.readOnly': 'للعرض فقط — تظهر القيم دون المعادلات',
    'models.loadError': 'تعذر تحميل النموذج. يرجى تحديث الصفحة.',
    'models.notFound': 'النموذج غير موجود.',
    'models.back': 'العودة إلى كل النماذج',
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

  const pick = (row: Record<string, any> | null | undefined, base: string): string => {
    if (!row) return '';
    const [first, second] = isRTL ? ['Ar', 'En'] : ['En', 'Ar'];
    return row[base + first] || row[base + second] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t, pick }}>
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
