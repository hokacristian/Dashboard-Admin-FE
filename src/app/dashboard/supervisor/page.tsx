'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { Event, Milestone } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/context/ToastContext';

interface EventWithMilestones extends Event {
  milestones: Milestone[];
  assigned_petugas: {
    id: string;
    event_id: string;
    petugas_id: string;
    assigned_by: string;
    assigned_at: string;
    petugas: {
      id: string;
      username: string;
      nama_lengkap: string;
      foto_profil: string | null;
    };
  }[];
  _count: {
    milestones: number;
    progress_reports: number;
  };
}

export default function SupervisorPage() {
  const router = useRouter();
  const { showLoading, hideLoading } = useToast();
  const [events, setEvents] = useState<EventWithMilestones[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setIsLoading(true);
      showLoading('Loading events...');
      const response = await api.get('/events');
      const allEvents = response.data.data;
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supervisor - Event Monitoring</h1>
        <p className="text-gray-600 mt-1">Monitor semua event dan progress yang sedang berjalan</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada event tersedia</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {events.map((event) => (
            <Card key={event.id}>
              <div className="space-y-4">
                {/* Event Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{event.nama_tender}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.lokasi}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(event.tanggal_mulai), 'dd MMM')} -{' '}
                        {format(new Date(event.tanggal_selesai), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={event.status} />
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      Rp {formatCurrency(event.budget || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Assigned Petugas</p>
                    <p className="text-lg font-bold text-purple-600 mt-1">
                      {event.assigned_petugas?.length || 0} Petugas
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Progress Reports</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {event._count?.progress_reports || 0} Reports
                    </p>
                  </div>
                </div>

                {/* Petugas List */}
                {event.assigned_petugas && event.assigned_petugas.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Assigned Petugas</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.assigned_petugas.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                            {assignment.petugas.nama_lengkap.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {assignment.petugas.nama_lengkap}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Milestones ({event.milestones?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {event.milestones && event.milestones.length > 0 ? (
                      event.milestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{milestone.nama_milestone}</h5>
                            <p className="text-sm text-gray-600 mt-1">{milestone.deskripsi}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Deadline: {format(new Date(milestone.deadline), 'dd MMM yyyy')}
                              </span>
                              <StatusBadge status={milestone.status} />
                              {milestone._count && milestone._count.progress_reports > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {milestone._count.progress_reports} reports
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/dashboard/milestones/${milestone.id}`)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">Belum ada milestone</p>
                    )}
                  </div>
                </div>

                {/* View Event Detail Button */}
                <div className="border-t pt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/events/${event.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Event Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
