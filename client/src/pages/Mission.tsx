import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Target, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Mission() {
  const { t, isRTL } = useLanguage();
  const [mission, setMission] = useState<any>(null);
  const [vision, setVision] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const missionQuery = trpc.content.getCommunityInfo.useQuery({ key: 'mission' });
  const visionQuery = trpc.content.getCommunityInfo.useQuery({ key: 'vision' });

  useEffect(() => {
    if (missionQuery.data) setMission(missionQuery.data);
    if (visionQuery.data) setVision(visionQuery.data);
    if (!missionQuery.isLoading && !visionQuery.isLoading) {
      setLoading(false);
    }
  }, [missionQuery.data, visionQuery.data, missionQuery.isLoading, visionQuery.isLoading]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-5xl font-bold text-[#002B5C] mb-4">
            {t('nav.mission')}
          </h1>
          <div className="w-16 h-1 bg-[#C5A065] rounded-full"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#002B5C]" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-[#002B5C] to-[#003d7a] text-white pb-6">
                <div className="flex items-center gap-3">
                  <Target size={32} className="text-[#C5A065]" />
                  <CardTitle className="text-2xl">
                    {mission?.titleEn || mission?.titleAr || 'Our Mission'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className={`text-gray-700 leading-relaxed text-lg ${isRTL ? 'text-right' : ''}`}>
                  {mission?.contentEn || mission?.contentAr || 'Mission statement coming soon.'}
                </p>
              </CardContent>
            </Card>

            {/* Vision Card */}
            <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-[#003d7a] to-[#002B5C] text-white pb-6">
                <div className="flex items-center gap-3">
                  <Eye size={32} className="text-[#C5A065]" />
                  <CardTitle className="text-2xl">
                    {vision?.titleEn || vision?.titleAr || 'Our Vision'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className={`text-gray-700 leading-relaxed text-lg ${isRTL ? 'text-right' : ''}`}>
                  {vision?.contentEn || vision?.contentAr || 'Vision statement coming soon.'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Core Values Section */}
        <div className="mt-16">
          <h2 className={`text-3xl font-bold text-[#002B5C] mb-8 ${isRTL ? 'text-right' : ''}`}>
            Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Excellence', description: 'We strive for the highest standards in financial modeling education.' },
              { title: 'Community', description: 'We believe in the power of collective learning and shared knowledge.' },
              { title: 'Innovation', description: 'We embrace new methodologies and tools to stay ahead in the industry.' },
            ].map((value, idx) => (
              <Card key={idx} className="border-0 bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-[#002B5C]">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-gray-600 ${isRTL ? 'text-right' : ''}`}>
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
