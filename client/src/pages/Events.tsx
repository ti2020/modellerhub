import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Calendar, MapPin, User } from 'lucide-react';

export default function Events() {
  const { t, isRTL, pick } = useLanguage();
  const { data: events, isLoading } = trpc.content.getAllEvents.useQuery();

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-5xl font-bold text-[#002B5C] mb-4">
            {t('nav.events')}
          </h1>
          <div className="w-16 h-1 bg-[#C5A065] rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Join our upcoming webinars, workshops, and community events.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#002B5C]" size={32} />
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event: any) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow border-0 bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-[#002B5C] to-[#003d7a] h-2"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-[#002B5C] text-lg">
                      {pick(event, 'title')}
                    </CardTitle>
                    {event.featured && (
                      <span className="bg-[#C5A065] text-black text-xs font-bold px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {pick(event, 'description')}
                  </p>
                  <div className={`space-y-2 text-sm ${isRTL ? 'text-right' : ''}`}>
                    {event.eventDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#C5A065]" />
                        <span className="text-gray-700">{formatDate(event.eventDate)}</span>
                      </div>
                    )}
                    {event.eventTime && (
                      <div className="flex items-center gap-2">
                        <span className="text-[#C5A065] font-bold">⏰</span>
                        <span className="text-gray-700">{event.eventTime}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#C5A065]" />
                        <span className="text-gray-700">{event.location}</span>
                      </div>
                    )}
                    {event.speaker && (
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-[#C5A065]" />
                        <span className="text-gray-700">{event.speaker}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events scheduled yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
