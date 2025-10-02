'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, CheckCircle, Upload, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { Event, Milestone } from '@/types';
import { format } from 'date-fns';

interface EventWithMilestones extends Event {
  milestones: Milestone[];
  assigned_petugas: {
    id: string;
    petugas: {
      id: string;
      username: string;
      nama_lengkap: string;
    };
  }[];
  _count: {
    milestones: number;
    progress_reports: number;
  };
}

export default function PetugasPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventWithMilestones[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventWithMilestones | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Upload form states
  const [uploadFormData, setUploadFormData] = useState({
    deskripsi: '',
    tanggal_laporan: format(new Date(), 'yyyy-MM-dd'),
    persentase_progress: 0,
    photos: [] as File[],
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      // Get events where current user is assigned as petugas
      const response = await api.get('/events');
      // Filter events where current petugas is assigned
      const allEvents = response.data.data;
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openUploadModal = (event: EventWithMilestones, milestone: Milestone) => {
    setSelectedEvent(event);
    setSelectedMilestone(milestone);
    setUploadFormData({
      deskripsi: '',
      tanggal_laporan: format(new Date(), 'yyyy-MM-dd'),
      persentase_progress: 0,
      photos: [],
    });
    setUploadError(null);
    setIsUploadModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadFormData((prev) => ({
      ...prev,
      [name]: name === 'persentase_progress' ? parseInt(value) || 0 : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadFormData((prev) => ({
        ...prev,
        photos: Array.from(files),
      }));
    }
  };

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedMilestone) return;

    setUploadLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('deskripsi', uploadFormData.deskripsi);
      formData.append('tanggal_laporan', uploadFormData.tanggal_laporan);
      formData.append('persentase_progress', uploadFormData.persentase_progress.toString());
      formData.append('milestone_id', selectedMilestone.id);

      // Append photos
      uploadFormData.photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      await api.post(`/events/${selectedEvent.id}/progress`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsUploadModalOpen(false);
      fetchMyEvents();
      alert('Progress berhasil diupload!');
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload progress.');
    } finally {
      setUploadLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <p className="text-gray-600 mt-1">Upload progress foto untuk setiap milestone</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Anda belum memiliki event yang ditugaskan</p>
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
                            <Button
                              size="sm"
                              onClick={() => openUploadModal(event, milestone)}
                              className="flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Upload Progress
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">Belum ada milestone</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Progress Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Progress"
      >
        <form onSubmit={handleSubmitProgress} className="space-y-4">
          {uploadError && (
            <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50">{uploadError}</div>
          )}

          {selectedEvent && selectedMilestone && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Event: {selectedEvent.nama_tender}</p>
              <p className="text-sm text-blue-700 mt-1">
                Milestone: {selectedMilestone.nama_milestone}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="deskripsi" className="text-gray-700 font-medium">
              Deskripsi Progress
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={uploadFormData.deskripsi}
              onChange={handleFormChange}
              rows={4}
              required
              placeholder="Jelaskan progress yang telah dikerjakan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="tanggal_laporan" className="text-gray-700 font-medium">
                Tanggal Laporan
              </label>
              <input
                id="tanggal_laporan"
                name="tanggal_laporan"
                type="date"
                value={uploadFormData.tanggal_laporan}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="persentase_progress" className="text-gray-700 font-medium">
                Persentase Progress (%)
              </label>
              <input
                id="persentase_progress"
                name="persentase_progress"
                type="number"
                min="0"
                max="100"
                value={uploadFormData.persentase_progress}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="photos" className="text-gray-700 font-medium">
              Upload Foto Progress
            </label>
            <input
              id="photos"
              name="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadFormData.photos.length > 0 && (
              <p className="text-sm text-gray-600">
                {uploadFormData.photos.length} file(s) selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={uploadLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={uploadLoading}>
              {uploadLoading ? 'Uploading...' : 'Submit Progress'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
