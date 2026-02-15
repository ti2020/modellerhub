import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#002B5C] mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin panel.</p>
          <Link href="/">
            <a className="inline-block bg-[#002B5C] text-white px-6 py-2 rounded-lg hover:bg-[#003d7a] transition-colors">
              Return Home
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Courses', href: '/admin/courses' },
    { label: 'Events', href: '/admin/events' },
    { label: 'Batches', href: '/admin/batches' },
    { label: 'Team', href: '/admin/team' },
    { label: 'Community Info', href: '/admin/community' },
    { label: 'Export Templates', href: '/admin/export' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-[#002B5C] text-white fixed md:static h-screen overflow-y-auto z-40`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C5A065] rounded-full flex items-center justify-center">
              M
            </div>
            Admin
          </h1>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    location === item.href
                      ? 'bg-[#C5A065] text-black font-semibold'
                      : 'text-gray-200 hover:bg-[#003d7a]'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-300 mb-4">
              Logged in as: <span className="font-semibold">{user.name}</span>
            </p>
            <Button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-[#002B5C] text-white p-4 flex items-center justify-between">
          <h1 className="font-bold">ModellerHub Admin</h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-[#003d7a] rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
