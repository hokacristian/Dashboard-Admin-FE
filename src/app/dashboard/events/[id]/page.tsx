'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Plus,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { Event, Milestone, User, ProgressReport } from '@/types';
import { format } from 'date-fns';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [assignedPetugas, setAssignedPetugas] = useState<User[]>([]);
  const [recentProgress, setRecentProgress] = useState<ProgressReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const [eventRes, milestonesRes, petugasRes, progressRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/milestones`),
        api.get(`/events/${eventId}/petugas`),
        api.get(`/events/${eventId}/progress?limit=5`),
      ]);

      setEvent(eventRes.data.data);
      setMilestones(milestonesRes.data.data);
      setAssignedPetugas(petugasRes.data.data);
      setRecentProgress(progressRes.data.data.data || progressRes.data.data);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Event not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.nama_tender}</h1>
            <p className="text-gray-600 mt-1">Event Details</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Event
        </Button>
      </div>

      {/* Event Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold text-gray-900">{event.lokasi}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Budget</p>
              <p className="font-semibold text-gray-900 text-sm">
                {formatCurrency(event.budget)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="font-semibold text-gray-900 text-xs">
                {format(new Date(event.tanggal_mulai), 'MMM dd')} -{' '}
                {format(new Date(event.tanggal_selesai), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned Petugas</p>
              <p className="font-semibold text-gray-900">{assignedPetugas.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description & Status */}
        <Card title="Event Information" className="lg:col-span-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">
                <StatusBadge status={event.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="mt-1 text-gray-900">{event.deskripsi || 'No description'}</p>
            </div>
          </div>
        </Card>

        {/* Assigned Petugas */}
        <Card title="Assigned Petugas">
          <div className="space-y-3">
            {assignedPetugas.length > 0 ? (
              assignedPetugas.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {assignment.petugas.nama_lengkap?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{assignment.petugas.nama_lengkap || 'Nama tidak tersedia'}</p>
                    <p className="text-xs text-gray-500">{assignment.petugas.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No petugas assigned</p>
            )}
          </div>
        </Card>
      </div>

      {/* Milestones */}
      <Card
        title="Milestones"
        action={
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Milestone
          </Button>
        }
      >
        <div className="space-y-3">
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{milestone.nama_milestone}</h4>
                  <p className="text-sm text-gray-600 mt-1">{milestone.deskripsi}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Deadline: {format(new Date(milestone.deadline), 'MMM dd, yyyy')}
                    </span>
                    <StatusBadge status={milestone.status} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No milestones yet</p>
          )}
        </div>
      </Card>

      {/* Recent Progress */}
      <Card title="Recent Progress Reports">
        <div className="space-y-4">
          {recentProgress.length > 0 ? (
            recentProgress.map((progress) => (
              <div key={progress.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {progress.petugas?.nama_lengkap}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{progress.deskripsi}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(progress.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">
                      {progress.persentase_progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No progress reports yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}
