import { useLanguage } from '@/contexts/LanguageContext';
import { MODELLER_NAME, MODELS } from '@/data/models';
import { FileSpreadsheet, PlayCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function Models() {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-[#002B5C] text-white">
        <div className="container mx-auto px-4 py-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('models.title', 'Model Library')}</h1>
          <div className="w-20 h-1 bg-[#C5A065] mb-4" />
          <p className="text-white/85 max-w-2xl">
            {t('models.intro').replace('{n}', String(MODELS.length)).replace('{name}', MODELLER_NAME)}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODELS.map(m => (
            <Link
              key={m.slug}
              href={`/models/${m.slug}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
            >
              <div className="h-2" style={{ background: m.accent }} />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h2 className="text-xl font-bold text-[#002B5C] group-hover:underline">{m.name}</h2>
                  <FileSpreadsheet style={{ color: m.accent }} className="shrink-0" />
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  {t('models.cardBy', 'Modelled by')} <span className="font-semibold" style={{ color: m.accent }}>{MODELLER_NAME}</span>
                </p>
                <div className="mt-auto flex items-center gap-4 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <FileSpreadsheet size={16} /> {t('models.viewModel', 'View model')}
                  </span>
                  {m.youtubeId && (
                    <span className="inline-flex items-center gap-1">
                      <PlayCircle size={16} /> {t('models.video', 'Video')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
