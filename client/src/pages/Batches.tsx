import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Users } from 'lucide-react';

export default function Batches() {
  const { t, isRTL } = useLanguage();
  const { data: batches, isLoading } = trpc.content.getBatches.useQuery();

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-5xl font-bold text-[#002B5C] mb-4">
            {t('nav.batches')}
          </h1>
          <div className="w-16 h-1 bg-[#C5A065] rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Enroll in our upcoming training batches and start your learning journey.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#002B5C]" size={32} />
          </div>
        ) : batches && batches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {batches.map((batch: any) => (
              <Card key={batch.id} className="hover:shadow-lg transition-shadow border-0 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-[#002B5C] text-lg">
                      {batch.nameEn || batch.nameAr}
                    </CardTitle>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(batch.enrollmentStatus)}`}>
                      {batch.enrollmentStatus.toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {batch.descriptionEn || batch.descriptionAr}
                  </p>
                  <div className={`space-y-3 text-sm ${isRTL ? 'text-right' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-semibold text-[#002B5C]">
                        {formatDate(batch.startDate)}
                      </span>
                    </div>
                    {batch.endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-semibold text-[#002B5C]">
                          {formatDate(batch.endDate)}
                        </span>
                      </div>
                    )}
                    {batch.capacity && (
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-[#C5A065]" />
                          <span className="text-gray-600">Enrollment</span>
                        </div>
                        <span className="font-semibold text-[#002B5C]">
                          {batch.enrolled || 0} / {batch.capacity}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No batches available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
