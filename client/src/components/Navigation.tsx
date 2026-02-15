import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

export default function Navigation() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.courses'), href: '/courses' },
    { label: t('nav.events'), href: '/events' },
    { label: t('nav.batches'), href: '/batches' },
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.mission'), href: '/mission' },
    { label: t('nav.modeling'), href: '/modeling' },
  ];

  return (
    <nav className="bg-[#002B5C] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl hover:opacity-80">
              <div className="w-8 h-8 bg-[#C5A065] rounded-full flex items-center justify-center">
                M
              </div>
              <span>ModellerHub</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#003d7a] transition-colors">
                  {item.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Language Switcher & Mobile Menu */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-[#C5A065] hover:bg-[#b39456] text-black' : 'text-white border-white hover:bg-[#003d7a]'}
              >
                EN
              </Button>
              <Button
                variant={language === 'ar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('ar')}
                className={language === 'ar' ? 'bg-[#C5A065] hover:bg-[#b39456] text-black' : 'text-white border-white hover:bg-[#003d7a]'}
              >
                العربية
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md hover:bg-[#003d7a] transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className={`md:hidden pb-4 ${isRTL ? 'text-right' : ''}`}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[#003d7a] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
