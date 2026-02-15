import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { BookOpen, Calendar, Users, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const coursesQuery = trpc.content.getAllCourses.useQuery();
  const eventsQuery = trpc.content.getAllEvents.useQuery();
  const batchesQuery = trpc.content.getBatches.useQuery();
  const teamQuery = trpc.content.getTeamMembers.useQuery();

  const stats = [
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: coursesQuery.data?.length || 0,
      color: 'bg-blue-500',
    },
    {
      icon: Calendar,
      label: 'Total Events',
      value: eventsQuery.data?.length || 0,
      color: 'bg-purple-500',
    },
    {
      icon: Layers,
      label: 'Total Batches',
      value: batchesQuery.data?.length || 0,
      color: 'bg-green-500',
    },
    {
      icon: Users,
      label: 'Team Members',
      value: teamQuery.data?.length || 0,
      color: 'bg-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-[#002B5C] mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-[#002B5C] mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 bg-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/admin/courses"
                className="p-4 border-2 border-[#002B5C] rounded-lg hover:bg-[#002B5C] hover:text-white transition-colors text-center font-semibold"
              >
                Manage Courses
              </a>
              <a
                href="/admin/events"
                className="p-4 border-2 border-[#002B5C] rounded-lg hover:bg-[#002B5C] hover:text-white transition-colors text-center font-semibold"
              >
                Manage Events
              </a>
              <a
                href="/admin/batches"
                className="p-4 border-2 border-[#002B5C] rounded-lg hover:bg-[#002B5C] hover:text-white transition-colors text-center font-semibold"
              >
                Manage Batches
              </a>
              <a
                href="/admin/team"
                className="p-4 border-2 border-[#002B5C] rounded-lg hover:bg-[#002B5C] hover:text-white transition-colors text-center font-semibold"
              >
                Manage Team
              </a>
              <a
                href="/admin/community"
                className="p-4 border-2 border-[#002B5C] rounded-lg hover:bg-[#002B5C] hover:text-white transition-colors text-center font-semibold"
              >
                Community Info
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 bg-white mt-8">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Welcome to ModellerHub Admin Panel</span>
              </p>
              <p>
                Use the navigation menu on the left to manage courses, events, batches, and community information.
              </p>
              <p>
                All changes are saved automatically to the database and will be reflected on the public website immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
