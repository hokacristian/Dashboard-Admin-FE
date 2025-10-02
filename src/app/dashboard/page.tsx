'use client';

import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { StatCard } from '@/components/ui/Card';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { DashboardStats, EventSummary, ProgressReport } from '@/types';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [eventsSummary, setEventsSummary] = useState<EventSummary[]>([]);
  const [recentActivities, setRecentActivities] = useState<ProgressReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eventsRes, activitiesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/events-summary?limit=5'),
        api.get('/dashboard/recent-activities?limit=10'),
      ]);

      setStats(statsRes.data.data);
      setEventsSummary(eventsRes.data.data);
      setRecentActivities(activitiesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={stats?.events.total || 0}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Active Petugas"
          value={stats?.active_petugas || 0}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Progress Reports"
          value={stats?.total_progress_reports || 0}
          icon={<FileText className="w-6 h-6" />}
          color="yellow"
        />
      </div>

      {/* Events Status Overview */}
      <Card title="Events by Status">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Planning</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {stats?.events.planning || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">On Progress</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {stats?.events.on_progress || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {stats?.events.completed || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {stats?.events.cancelled || 0}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card title="Recent Events">
          <div className="space-y-4">
            {eventsSummary.length > 0 ? (
              eventsSummary.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.nama_tender}</h4>
                    <p className="text-sm text-gray-600 mt-1">{event.lokasi}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={event.status} />
                      <span className="text-xs text-gray-500">
                        {event.assigned_petugas.length} Petugas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {event.progress.overall_progress || 0}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Progress</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No events found</p>
            )}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card title="Recent Activities">
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user?.nama_lengkap}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.description.substring(0, 60)}
                      {activity.description.length > 60 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-600">
                      {activity.persentase_progress}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent activities</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
