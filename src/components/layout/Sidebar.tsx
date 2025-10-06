'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: ['admin'],
  },
  {
    title: 'Events',
    icon: Calendar,
    href: '/dashboard/events',
    roles: ['admin'],
  },
  {
    title: 'Event Monitoring',
    icon: Briefcase,
    href: '/dashboard/supervisor',
    roles: ['supervisor'],
  },
  {
    title: 'My Events',
    icon: Briefcase,
    href: '/dashboard/petugas',
    roles: ['petugas'],
  },
  {
    title: 'Users',
    icon: Users,
    href: '/dashboard/users',
    roles: ['admin'],
  },
  {
    title: 'Reports',
    icon: FileText,
    href: '/dashboard/reports',
    roles: ['admin', 'supervisor'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Monitor Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Tender Management</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium">{user?.nama_lengkap}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
