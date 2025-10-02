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
  Trash2,
  Eye,
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

  // Add Milestone Modal states
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [isEditMilestoneModalOpen, setIsEditMilestoneModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    nama_milestone: '',
    deskripsi: '',
    deadline: '',
    urutan: 1,
    status: 'pending' as 'pending' | 'on_progress' | 'completed'
  });
  const [milestoneLoading, setMilestoneLoading] = useState(false);
  const [milestoneError, setMilestoneError] = useState<string | null>(null);

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

  const handleMilestoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMilestoneFormData(prev => ({
      ...prev,
      [name]: name === 'urutan' ? parseInt(value) : value
    }));
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setMilestoneLoading(true);
    setMilestoneError(null);
    try {
      await api.post(`/events/${eventId}/milestones`, milestoneFormData);
      // Reset form
      setMilestoneFormData({
        nama_milestone: '',
        deskripsi: '',
        deadline: '',
        urutan: milestones.length + 1,
        status: 'pending'
      });
      setIsAddMilestoneModalOpen(false);
      // Refresh milestones
      fetchEventDetails();
    } catch (err: any) {
      setMilestoneError(err.response?.data?.message || 'Failed to add milestone.');
    } finally {
      setMilestoneLoading(false);
    }
  };

  const openAddMilestoneModal = () => {
    setMilestoneFormData({
      nama_milestone: '',
      deskripsi: '',
      deadline: '',
      urutan: milestones.length + 1,
      status: 'pending'
    });
    setMilestoneError(null);
    setIsAddMilestoneModalOpen(true);
  };


  const openEditMilestoneModal = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setMilestoneFormData({
      nama_milestone: milestone.nama_milestone,
      deskripsi: milestone.deskripsi || '',
      deadline: format(new Date(milestone.deadline), 'yyyy-MM-dd'),
      urutan: milestone.urutan || 1,
      status: milestone.status
    });
    setMilestoneError(null);
    setIsEditMilestoneModalOpen(true);
  };

  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    setMilestoneLoading(true);
    setMilestoneError(null);
    try {
      await api.put(`/milestones/${selectedMilestone.id}`, milestoneFormData);
      setIsEditMilestoneModalOpen(false);
      fetchEventDetails();
    } catch (err: any) {
      setMilestoneError(err.response?.data?.message || 'Failed to update milestone.');
    } finally {
      setMilestoneLoading(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      await api.delete(`/milestones/${milestoneId}`);
      fetchEventDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete milestone.');
    }
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
          <Button size="sm" className="flex items-center gap-2" onClick={openAddMilestoneModal}>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/milestones/${milestone.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditMilestoneModal(milestone)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Milestone"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Milestone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                        <p className="text-sm text-gray-600 mt-1">{progress.description}</p>
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

      {/* Add Milestone Modal */}
      <Modal
        isOpen={isAddMilestoneModalOpen}
        onClose={() => setIsAddMilestoneModalOpen(false)}
        title="Add New Milestone"
      >
        <form onSubmit={handleAddMilestone} className="space-y-4">
          {milestoneError && (
            <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50">
              {milestoneError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="nama_milestone" className="text-gray-700 font-medium">
              Nama Milestone
            </label>
            <input
              id="nama_milestone"
              name="nama_milestone"
              type="text"
              value={milestoneFormData.nama_milestone}
              onChange={handleMilestoneChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="deskripsi" className="text-gray-700 font-medium">
              Deskripsi
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={milestoneFormData.deskripsi}
              onChange={handleMilestoneChange}
              rows={3}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="deadline" className="text-gray-700 font-medium">
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={milestoneFormData.deadline}
                onChange={handleMilestoneChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="urutan" className="text-gray-700 font-medium">
                Urutan
              </label>
              <input
                id="urutan"
                name="urutan"
                type="number"
                min="1"
                value={milestoneFormData.urutan}
                onChange={handleMilestoneChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-gray-700 font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={milestoneFormData.status}
              onChange={handleMilestoneChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="pending">Pending</option>
              <option value="on_progress">On Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddMilestoneModalOpen(false)}
              disabled={milestoneLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={milestoneLoading}>
              {milestoneLoading ? 'Menyimpan...' : 'Tambah Milestone'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Milestone Modal */}
      <Modal
        isOpen={isEditMilestoneModalOpen}
        onClose={() => setIsEditMilestoneModalOpen(false)}
        title="Edit Milestone"
      >
        <form onSubmit={handleUpdateMilestone} className="space-y-4">
          {milestoneError && (
            <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50">
              {milestoneError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="edit_nama_milestone" className="text-gray-700 font-medium">
              Nama Milestone
            </label>
            <input
              id="edit_nama_milestone"
              name="nama_milestone"
              type="text"
              value={milestoneFormData.nama_milestone}
              onChange={handleMilestoneChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit_deskripsi" className="text-gray-700 font-medium">
              Deskripsi
            </label>
            <textarea
              id="edit_deskripsi"
              name="deskripsi"
              value={milestoneFormData.deskripsi}
              onChange={handleMilestoneChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit_deadline" className="text-gray-700 font-medium">
                Deadline
              </label>
              <input
                id="edit_deadline"
                name="deadline"
                type="date"
                value={milestoneFormData.deadline}
                onChange={handleMilestoneChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit_urutan" className="text-gray-700 font-medium">
                Urutan
              </label>
              <input
                id="edit_urutan"
                name="urutan"
                type="number"
                min="1"
                value={milestoneFormData.urutan}
                onChange={handleMilestoneChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit_status" className="text-gray-700 font-medium">
              Status
            </label>
            <select
              id="edit_status"
              name="status"
              value={milestoneFormData.status}
              onChange={handleMilestoneChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="pending">Pending</option>
              <option value="on_progress">On Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditMilestoneModalOpen(false)}
              disabled={milestoneLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={milestoneLoading}>
              {milestoneLoading ? 'Menyimpan...' : 'Update Milestone'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
