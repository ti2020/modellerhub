import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

export default function About() {
  const { t, isRTL, pick } = useLanguage();
  const { data: teamMembers, isLoading } = trpc.content.getTeamMembers.useQuery();

  const founders = teamMembers?.filter((m: any) => m.role === 'founder') || [];
  const admins = teamMembers?.filter((m: any) => m.role === 'admin') || [];
  const mentors = teamMembers?.filter((m: any) => m.role === 'mentor') || [];

  const renderTeamSection = (title: string, members: any[]) => {
    if (members.length === 0) return null;

    return (
      <div className="mb-16">
        <h2 className={`text-3xl font-bold text-[#002B5C] mb-8 ${isRTL ? 'text-right' : ''}`}>
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member: any) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow border-0 bg-white overflow-hidden">
              {member.photoUrl && (
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={member.photoUrl}
                    alt={pick(member, 'name')}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-[#002B5C]">
                  {pick(member, 'name')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  {pick(member, 'bio')}
                </p>
                {member.credentials && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-[#C5A065] font-semibold">
                      {member.credentials}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-5xl font-bold text-[#002B5C] mb-4">
            {t('nav.about')}
          </h1>
          <div className="w-16 h-1 bg-[#C5A065] rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-2xl">
            Meet the passionate professionals behind ModellerHub Community.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#002B5C]" size={32} />
          </div>
        ) : (
          <>
            {renderTeamSection('Founder', founders)}
            {renderTeamSection('Administrators', admins)}
            {renderTeamSection('Mentors', mentors)}
            {teamMembers && teamMembers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Team members information coming soon.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
