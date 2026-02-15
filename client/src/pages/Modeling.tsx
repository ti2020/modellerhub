import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Modeling() {
  const { t, isRTL } = useLanguage();
  const [modelingInfo, setModelingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const modelingQuery = trpc.content.getCommunityInfo.useQuery({ key: 'modeling_field' });

  useEffect(() => {
    if (modelingQuery.data) setModelingInfo(modelingQuery.data);
    if (!modelingQuery.isLoading) {
      setLoading(false);
    }
  }, [modelingQuery.data, modelingQuery.isLoading]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-5xl font-bold text-[#002B5C] mb-4">
            {t('nav.modeling')}
          </h1>
          <div className="w-16 h-1 bg-[#C5A065] rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Explore the world of financial modeling and its applications.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#002B5C]" size={32} />
          </div>
        ) : (
          <>
            {/* Main Content */}
            <Card className="border-0 bg-white shadow-lg mb-12">
              <CardHeader className="bg-gradient-to-r from-[#002B5C] to-[#003d7a] text-white pb-6">
                <CardTitle className="text-2xl">
                  {modelingInfo?.titleEn || modelingInfo?.titleAr || 'Financial Modeling Field'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <p className={`text-gray-700 leading-relaxed text-lg mb-6 ${isRTL ? 'text-right' : ''}`}>
                  {modelingInfo?.contentEn || modelingInfo?.contentAr || 'Financial modeling is a comprehensive field that encompasses...'}
                </p>
              </CardContent>
            </Card>

            {/* Key Areas */}
            <div className="mb-12">
              <h2 className={`text-3xl font-bold text-[#002B5C] mb-8 ${isRTL ? 'text-right' : ''}`}>
                Key Areas of Financial Modeling
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: TrendingUp,
                    title: 'Valuation Modeling',
                    description: 'Learn to value companies using DCF, comparable companies, and precedent transactions.',
                  },
                  {
                    icon: BarChart3,
                    title: 'Financial Statement Analysis',
                    description: 'Master the analysis and interpretation of financial statements and ratios.',
                  },
                  {
                    icon: PieChart,
                    title: 'Budget & Forecasting',
                    description: 'Develop skills in budgeting, forecasting, and scenario analysis.',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Investment Analysis',
                    description: 'Evaluate investment opportunities and build investment models.',
                  },
                  {
                    icon: BarChart3,
                    title: 'Risk Analysis',
                    description: 'Understand and model financial risks and sensitivity analysis.',
                  },
                  {
                    icon: PieChart,
                    title: 'Advanced Modeling',
                    description: 'Explore complex modeling scenarios and advanced Excel techniques.',
                  },
                ].map((area, idx) => {
                  const Icon = area.icon;
                  return (
                    <Card key={idx} className="border-0 bg-white hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <Icon size={28} className="text-[#C5A065]" />
                          <CardTitle className="text-[#002B5C]">{area.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-gray-600 text-sm ${isRTL ? 'text-right' : ''}`}>
                          {area.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Skills & Tools */}
            <div>
              <h2 className={`text-3xl font-bold text-[#002B5C] mb-8 ${isRTL ? 'text-right' : ''}`}>
                Essential Tools & Skills
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 bg-white">
                  <CardHeader className="bg-[#002B5C] text-white">
                    <CardTitle>Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className={`space-y-2 text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      <li>• Microsoft Excel (Advanced)</li>
                      <li>• Python & R for Data Analysis</li>
                      <li>• SQL & Database Management</li>
                      <li>• Tableau & Power BI</li>
                      <li>• Financial Software (Bloomberg, FactSet)</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-white">
                  <CardHeader className="bg-[#C5A065] text-black">
                    <CardTitle>Core Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className={`space-y-2 text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      <li>• Financial Analysis & Interpretation</li>
                      <li>• Quantitative Reasoning</li>
                      <li>• Problem Solving</li>
                      <li>• Attention to Detail</li>
                      <li>• Business Acumen</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
