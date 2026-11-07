import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

export default function Courses() {
  const { t, isRTL, pick } = useLanguage();
  const { data: courses, isLoading } = trpc.content.getAllCourses.useQuery();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-5xl font-bold text-[#002B5C] mb-4">
            {t('nav.courses')}
          </h1>
          <div className="w-16 h-1 bg-[#C5A065] rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Explore our comprehensive range of financial modeling courses designed to elevate your skills.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#002B5C]" size={32} />
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow border-0 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-[#002B5C] text-lg">
                      {pick(course, 'title')}
                    </CardTitle>
                    {course.featured && (
                      <span className="bg-[#C5A065] text-black text-xs font-bold px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-[#C5A065] font-medium">
                    {course.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {pick(course, 'description')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-[#002B5C] bg-gray-100 px-3 py-1 rounded-full">
                      {course.level}
                    </span>
                    {course.certification && (
                      <span className="text-xs text-white bg-[#C5A065] px-3 py-1 rounded-full font-medium">
                        {course.certification}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
