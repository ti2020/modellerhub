import { TELEGRAM_URL } from '@/const';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Home() {
  const { t, isRTL } = useLanguage();
  const { data: courses, isLoading: coursesLoading } = trpc.content.getFeaturedCourses.useQuery();
  const { data: events, isLoading: eventsLoading } = trpc.content.getFeaturedEvents.useQuery();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#002B5C] to-[#003d7a] text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A065] rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C5A065] rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
            {/* Text Content */}
            <div className={isRTL ? 'text-right' : ''}>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                {t('home.title')}
              </h1>
              <p className="text-2xl md:text-3xl font-serif text-[#C5A065] mb-4">
                {t('home.slogan')}
              </p>
              <p className="text-lg text-gray-200 mb-8 max-w-lg">
                {t('home.description')}
              </p>
              <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#C5A065] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#b39456] transition-colors"
                >
                  {t('home.joinTelegram')}
                  <ArrowRight size={20} />
                </a>
                <Link href="/courses">
                  <a className="inline-flex items-center gap-2 border-2 border-[#C5A065] text-[#C5A065] px-6 py-3 rounded-lg font-bold hover:bg-[#C5A065] hover:text-black transition-colors">
                    {t('home.exploreCourses')}
                    <ArrowRight size={20} />
                  </a>
                </Link>
              </div>
            </div>

            {/* Hero Image/Graphic */}
            <div className={`flex justify-center ${isRTL ? 'md:col-start-1' : ''}`}>
              <div className="relative w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-[#C5A065] mb-4">📊</div>
                    <h3 className="text-2xl font-bold mb-2">{t('home.subtitle')}</h3>
                    <p className="text-gray-200">
                      Elevating Financial Modeling Standards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
            <h2 className="text-4xl font-bold text-[#002B5C] mb-4">
              {t('home.featuredCourses')}
            </h2>
            <div className="w-16 h-1 bg-[#C5A065] rounded-full"></div>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#002B5C]" size={32} />
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow border-0 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#002B5C]">
                      {course.titleEn || course.titleAr}
                    </CardTitle>
                    <CardDescription className="text-[#C5A065] font-medium">
                      {course.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      {course.descriptionEn || course.descriptionAr}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#002B5C] bg-gray-100 px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                      {course.certification && (
                        <span className="text-xs text-[#C5A065] font-medium">
                          {course.certification}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <Link href="/courses">
              <a className="inline-flex items-center gap-2 text-[#002B5C] font-bold hover:text-[#C5A065] transition-colors">
                {t('home.exploreCourses')}
                <ArrowRight size={20} />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
            <h2 className="text-4xl font-bold text-[#002B5C] mb-4">
              {t('home.featuredEvents')}
            </h2>
            <div className="w-16 h-1 bg-[#C5A065] rounded-full"></div>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#002B5C]" size={32} />
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow border-0 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#002B5C]">
                      {event.titleEn || event.titleAr}
                    </CardTitle>
                    <CardDescription className="text-[#C5A065] font-medium">
                      {event.eventDate && new Date(event.eventDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      {event.descriptionEn || event.descriptionAr}
                    </p>
                    {event.speaker && (
                      <p className="text-xs text-[#002B5C] font-semibold">
                        Speaker: {event.speaker}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <Link href="/events">
              <a className="inline-flex items-center gap-2 text-[#002B5C] font-bold hover:text-[#C5A065] transition-colors">
                {t('home.viewEvents')}
                <ArrowRight size={20} />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#002B5C] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join?</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Connect with a global network of financial modeling professionals and elevate your skills.
          </p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#C5A065] text-black px-8 py-4 rounded-lg font-bold hover:bg-[#b39456] transition-colors text-lg"
          >
            {t('home.joinTelegram')}
          </a>
        </div>
      </section>
    </div>
  );
}
