import { TELEGRAM_URL } from '@/const';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-[#002B5C] text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 ${isRTL ? 'text-right' : ''}`}>
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#C5A065]">ModellerHub</h3>
            <p className="text-gray-300 text-sm">
              {t('home.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#C5A065]">{t('nav.home')}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/courses" className="hover:text-[#C5A065] transition-colors">{t('nav.courses')}</a></li>
              <li><a href="/events" className="hover:text-[#C5A065] transition-colors">{t('nav.events')}</a></li>
              <li><a href="/batches" className="hover:text-[#C5A065] transition-colors">{t('nav.batches')}</a></li>
              <li><a href="/about" className="hover:text-[#C5A065] transition-colors">{t('nav.about')}</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#C5A065]">Community</h3>
            <p className="text-gray-300 text-sm mb-4">
              {t('home.joinTelegram')}
            </p>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#C5A065] text-black px-4 py-2 rounded-md font-medium hover:bg-[#b39456] transition-colors text-sm"
            >
              Telegram
            </a>
          </div>
        </div>

        <div className={`border-t border-gray-700 pt-8 ${isRTL ? 'text-right' : 'text-center'}`}>
          <p className="text-gray-400 text-sm">
            {t('footer.copyright')}
          </p>
          <p className="text-[#C5A065] font-italic mt-2">
            {t('footer.slogan')}
          </p>
        </div>
      </div>
    </footer>
  );
}
