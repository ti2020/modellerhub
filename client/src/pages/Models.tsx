import { useLanguage } from '@/contexts/LanguageContext';
import { MODELLER, MODELS } from '@/data/models';
import { ArrowRight, Lock } from 'lucide-react';
import { Link } from 'wouter';

export default function Models() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className={`mb-10 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-5xl font-bold text-[#002B5C] mb-4">{t('models.title')}</h1>
          <div className={`w-16 h-1 bg-[#C5A065] rounded-full ${isRTL ? 'ml-auto' : ''}`}></div>
          <p className="text-gray-600 mt-4 max-w-2xl">{t('models.intro')}</p>
          <p className={`text-sm text-gray-500 mt-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <Lock size={14} aria-hidden="true" /> {t('models.readOnly')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODELS.map((m, i) => (
            <Link key={m.slug} href={`/models/${m.slug}`}>
              <a className="group block bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#C5A065]">
                <div className="px-5 py-4 text-white" style={{ background: m.color }}>
                  <p className="text-xs opacity-90 font-mono">#{String(i + 1).padStart(2, '0')} · {MODELLER}</p>
                  <h2 className="text-xl font-bold mt-1">{m.name}</h2>
                </div>
                <div className="p-5">
                  <p className="text-gray-700 text-sm leading-relaxed">{m.focus}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {m.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-700">{tag}</span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium mt-4 text-[#002B5C] group-hover:underline">
                    {t('models.open')} <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
