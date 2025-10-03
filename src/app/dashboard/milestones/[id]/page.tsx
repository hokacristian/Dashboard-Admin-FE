'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  User,
  Image as ImageIcon,
  FileText,
  Edit,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { Milestone, ProgressReport } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface MilestoneDetail extends Milestone {
  event: {
    id: string;
    nama_tender: string;
    lokasi: string;
  };
  progress_reports: ProgressReport[];
}

export default function MilestoneDetailPage() {
  const router = useRouter();
  const params = useParams();
  const milestoneId = params.id as string;
  const { user } = useAuth();
  const { success, error: showError, showLoading, hideLoading } = useToast();

  const [milestone, setMilestone] = useState<MilestoneDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Edit/Delete Progress states
  const [isEditProgressModalOpen, setIsEditProgressModalOpen] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState<ProgressReport | null>(null);
  const [progressFormData, setProgressFormData] = useState({
    deskripsi: '',
    tanggal_laporan: '',
    persentase_progress: 0,
    existingPhotos: [] as string[],
    newPhotos: [] as File[],
  });
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    fetchMilestoneDetail();
  }, [milestoneId]);

  const fetchMilestoneDetail = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/milestones/${milestoneId}`);
      setMilestone(response.data.data);
    } catch (error) {
      console.error('Failed to fetch milestone details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const openEditProgressModal = (progress: ProgressReport) => {
    setSelectedProgress(progress);
    setProgressFormData({
      deskripsi: progress.deskripsi || progress.description || '',
      tanggal_laporan: progress.tanggal_laporan
        ? format(new Date(progress.tanggal_laporan), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      persentase_progress: progress.persentase_progress,
      existingPhotos: progress.foto_urls || [],
      newPhotos: [],
    });
    setProgressError(null);
    setIsEditProgressModalOpen(true);
  };

  const handleProgressFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProgressFormData((prev) => ({
      ...prev,
      [name]: name === 'persentase_progress' ? parseInt(value) || 0 : value,
    }));
  };

  const handleNewPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setProgressFormData((prev) => ({
        ...prev,
        newPhotos: Array.from(files),
      }));
    }
  };

  const removeExistingPhoto = (photoUrl: string) => {
    setProgressFormData((prev) => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter((url) => url !== photoUrl),
    }));
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgress) return;

    setProgressLoading(true);
    setProgressError(null);
    showLoading('Updating progress...');

    try {
      const formData = new FormData();
      formData.append('deskripsi', progressFormData.deskripsi);
      formData.append('tanggal_laporan', progressFormData.tanggal_laporan);
      formData.append('persentase_progress', progressFormData.persentase_progress.toString());

      // Add existing photos that weren't removed
      formData.append('existing_photos', JSON.stringify(progressFormData.existingPhotos));

      // Add new photos
      progressFormData.newPhotos.forEach((photo) => {
        formData.append('photos', photo);
      });

      await api.put(`/progress-reports/${selectedProgress.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsEditProgressModalOpen(false);
      fetchMilestoneDetail();
      success('Progress berhasil diupdate!');
    } catch (err: any) {
      setProgressError(err.response?.data?.message || 'Failed to update progress.');
      showError(err.response?.data?.message || 'Failed to update progress.');
    } finally {
      setProgressLoading(false);
      hideLoading();
    }
  };

  const handleDeleteProgress = async (progressId: string) => {
    // Manual confirmation using Modal would be better, but for now we'll use a simple check
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus progress report ini?');
    if (!confirmed) return;

    showLoading('Deleting progress...');
    try {
      await api.delete(`/progress-reports/${progressId}`);
      fetchMilestoneDetail();
      success('Progress berhasil dihapus!');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete progress.');
    } finally {
      hideLoading();
    }
  };

  const canEditProgress = (progress: ProgressReport) => {
    // User can edit if they are the petugas who created it
    return user?.id === progress.petugas_id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading milestone details...</p>
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Milestone not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{milestone.nama_milestone}</h1>
            <p className="text-gray-600 mt-1">Milestone Details</p>
          </div>
        </div>
        <StatusBadge status={milestone.status} />
      </div>

      {/* Event Info */}
      {milestone.event && (
        <Card>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Event</label>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {milestone.event.nama_tender}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{milestone.event.lokasi}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Milestone Information */}
      <Card title="Milestone Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Deskripsi</label>
              <p className="mt-1 text-gray-900">{milestone.deskripsi || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Deadline</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-gray-900">
                  {format(new Date(milestone.deadline), 'dd MMMM yyyy')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Urutan</label>
              <p className="mt-1 text-gray-900">{milestone.urutan || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Total Progress Reports</label>
              <p className="mt-1 text-gray-900 font-semibold">
                {milestone._count?.progress_reports || 0} reports
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
          <div>
            <label className="text-sm font-medium text-gray-600">Created At</label>
            <p className="text-sm text-gray-900 mt-1">
              {format(new Date(milestone.created_at), 'dd MMM yyyy HH:mm')}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Updated At</label>
            <p className="text-sm text-gray-900 mt-1">
              {format(new Date(milestone.updated_at), 'dd MMM yyyy HH:mm')}
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Reports */}
      <Card title="Progress Reports">
        {milestone.progress_reports && milestone.progress_reports.length > 0 ? (
          <div className="space-y-6">
            {milestone.progress_reports.map((report) => (
              <div key={report.id} className="p-4 bg-gray-50 rounded-lg space-y-4">
                {/* Report Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {report.petugas?.nama_lengkap || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(report.created_at), 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {report.persentase_progress}%
                      </div>
                      {report.tanggal_laporan && (
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(report.tanggal_laporan), 'dd MMM yyyy')}
                        </p>
                      )}
                    </div>
                    {canEditProgress(report) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditProgressModal(report)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Edit Progress"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProgress(report.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Progress"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="pl-13">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{report.deskripsi || report.description}</p>
                  </div>
                </div>

                {/* Photos */}
                {report.foto_urls && report.foto_urls.length > 0 && (
                  <div className="pl-13">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      <label className="text-sm font-medium text-gray-600">
                        Photos ({report.foto_urls.length})
                      </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {report.foto_urls.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openImageModal(url)}
                        >
                          <img
                            src={url}
                            alt={`Progress photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestone Info */}
                {report.milestone && (
                  <div className="pl-13 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Milestone: <span className="font-medium">{report.milestone.nama_milestone}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No progress reports yet</p>
          </div>
        )}
      </Card>

      {/* Image Preview Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Image Preview"
      >
        {selectedImage && (
          <div className="space-y-4">
            <div className="relative w-full">
              <img
                src={selectedImage}
                alt="Full size preview"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(selectedImage, '_blank')}
              >
                Open in New Tab
              </Button>
              <Button onClick={() => setIsImageModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Progress Modal */}
      <Modal
        isOpen={isEditProgressModalOpen}
        onClose={() => setIsEditProgressModalOpen(false)}
        title="Edit Progress Report"
      >
        <form onSubmit={handleUpdateProgress} className="space-y-4">
          {progressError && (
            <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50">{progressError}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="edit_deskripsi" className="text-gray-700 font-medium">
              Deskripsi Progress
            </label>
            <textarea
              id="edit_deskripsi"
              name="deskripsi"
              value={progressFormData.deskripsi}
              onChange={handleProgressFormChange}
              rows={4}
              required
              placeholder="Jelaskan progress yang telah dikerjakan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit_tanggal_laporan" className="text-gray-700 font-medium">
                Tanggal Laporan
              </label>
              <input
                id="edit_tanggal_laporan"
                name="tanggal_laporan"
                type="date"
                value={progressFormData.tanggal_laporan}
                onChange={handleProgressFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit_persentase_progress" className="text-gray-700 font-medium">
                Persentase Progress (%)
              </label>
              <input
                id="edit_persentase_progress"
                name="persentase_progress"
                type="number"
                min="0"
                max="100"
                value={progressFormData.persentase_progress}
                onChange={handleProgressFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Existing Photos */}
          {progressFormData.existingPhotos.length > 0 && (
            <div className="space-y-2">
              <label className="text-gray-700 font-medium">Foto Existing</label>
              <div className="grid grid-cols-3 gap-3">
                {progressFormData.existingPhotos.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/200x200?text=Error';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(url)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Photos */}
          <div className="space-y-2">
            <label htmlFor="edit_new_photos" className="text-gray-700 font-medium">
              Upload Foto Baru (Optional)
            </label>
            <input
              id="edit_new_photos"
              name="new_photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewPhotosChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {progressFormData.newPhotos.length > 0 && (
              <p className="text-sm text-gray-600">
                {progressFormData.newPhotos.length} new file(s) selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditProgressModalOpen(false)}
              disabled={progressLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={progressLoading}>
              {progressLoading ? 'Updating...' : 'Update Progress'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
