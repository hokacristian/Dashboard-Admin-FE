'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, X, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { Event, User } from '@/types';
import { format } from 'date-fns';

interface PetugasAssignment {
  id: string;
  petugas_id: string;
  petugas: User;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  // Form states
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status states
  const [newStatus, setNewStatus] = useState<Event['status']>('planning');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Petugas states
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assignedPetugas, setAssignedPetugas] = useState<PetugasAssignment[]>([]);
  const [selectedPetugasIds, setSelectedPetugasIds] = useState<string[]>([]);
  const [petugasLoading, setPetugasLoading] = useState(false);
  const [petugasError, setPetugasError] = useState<string | null>(null);
  const [petugasToRemove, setPetugasToRemove] = useState<PetugasAssignment | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  // Delete Event states
  const [isDeleteEventModalOpen, setIsDeleteEventModalOpen] = useState(false);
  const [deleteEventLoading, setDeleteEventLoading] = useState(false);
  const [deleteEventError, setDeleteEventError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchAllUsers();
      fetchAssignedPetugas();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setIsFetching(true);
      const response = await api.get(`/events/${eventId}`);
      const eventData = response.data.data;
      eventData.tanggal_mulai = format(new Date(eventData.tanggal_mulai), 'yyyy-MM-dd');
      eventData.tanggal_selesai = format(new Date(eventData.tanggal_selesai), 'yyyy-MM-dd');
      setFormData(eventData);
      setNewStatus(eventData.status);
    } catch (error) { console.error(error); setError('Failed to load event data.'); } finally { setIsFetching(false); }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data.data);
    } catch (error) { console.error(error); }
  };

  const fetchAssignedPetugas = async () => {
    try {
      const response = await api.get(`/events/${eventId}/petugas`);
      setAssignedPetugas(response.data.data);
      setSelectedPetugasIds(response.data.data.map((p: any) => p.petugas_id));
    } catch (error) { console.error(error); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    try {
      await api.put(`/events/${eventId}`, formData);
      router.push(`/dashboard/events/${eventId}`);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to update event.'); } finally { setIsLoading(false); }
  };

  const handleStatusChange = async () => {
    setStatusLoading(true); setStatusError(null);
    try {
      await api.put(`/events/${eventId}/status`, { status: newStatus });
      setFormData(prev => ({...prev, status: newStatus}));
    } catch (err: any) { setStatusError(err.response?.data?.message || 'Failed to update status.'); } finally { setStatusLoading(false); }
  };

  const handlePetugasSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPetugasIds(Array.from(e.target.selectedOptions, option => option.value));
  };

  const handleAssignPetugas = async () => {
    setPetugasLoading(true); setPetugasError(null);
    try {
      await api.post(`/events/${eventId}/petugas`, { petugas_ids: selectedPetugasIds });
      fetchAssignedPetugas();
    } catch (err: any) { setPetugasError(err.response?.data?.message || 'Failed to assign petugas.'); } finally { setPetugasLoading(false); }
  };

  const openRemoveModal = (assignment: PetugasAssignment) => {
    setPetugasToRemove(assignment);
    setIsRemoveModalOpen(true);
    setPetugasError(null);
  };

  const closeRemoveModal = () => {
    setPetugasToRemove(null);
    setIsRemoveModalOpen(false);
  };

  const handleRemovePetugas = async () => {
    if (!petugasToRemove) return;
    setPetugasLoading(true); setPetugasError(null);
    try {
      await api.delete(`/events/${eventId}/petugas/${petugasToRemove.petugas_id}`);
      fetchAssignedPetugas();
      closeRemoveModal();
    } catch (err: any) { setPetugasError(err.response?.data?.message || 'Failed to remove petugas.'); } finally { setPetugasLoading(false); }
  };

  const handleDeleteEvent = async () => {
    setDeleteEventLoading(true);
    setDeleteEventError(null);
    try {
      await api.delete(`/events/${eventId}`);
      router.push('/dashboard'); // Redirect to dashboard after deletion
    } catch (err: any) {
      setDeleteEventError(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleteEventLoading(false);
    }
  };

  if (isFetching) return <div className="text-center py-12">Loading...</div>;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-6 h-6" /></button>
          <div><h1 className="text-3xl font-bold text-gray-900">Edit Event</h1><p className="text-gray-700 mt-1">Update detail untuk event {formData.nama_tender}.</p></div>
        </div>

        {/* Main Details Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Detail Utama</h3>
            {error && <div className="p-4 my-4 text-sm text-red-800 rounded-lg bg-red-50">{error}</div>}
            <div className="space-y-2"><label htmlFor="nama_tender" className="text-gray-700 font-medium">Nama Tender</label><Input id="nama_tender" name="nama_tender" value={formData.nama_tender || ''} onChange={handleChange} required /></div>
            <div className="space-y-2"><label htmlFor="deskripsi" className="text-gray-700 font-medium">Deskripsi</label><textarea id="deskripsi" name="deskripsi" value={formData.deskripsi || ''} onChange={handleChange} rows={4} className="w-full p-2 border rounded-md text-gray-900"></textarea></div>
            <div className="grid md:grid-cols-2 gap-6"><div className="space-y-2"><label htmlFor="lokasi" className="text-gray-700 font-medium">Lokasi</label><Input id="lokasi" name="lokasi" value={formData.lokasi || ''} onChange={handleChange} required /></div><div className="space-y-2"><label htmlFor="budget" className="text-gray-700 font-medium">Budget</label><Input id="budget" name="budget" type="number" value={formData.budget || ''} onChange={handleChange} required /></div></div>
            <div className="grid md:grid-cols-2 gap-6"><div className="space-y-2"><label htmlFor="tanggal_mulai" className="text-gray-700 font-medium">Tanggal Mulai</label><Input id="tanggal_mulai" name="tanggal_mulai" type="date" value={formData.tanggal_mulai || ''} onChange={handleChange} required /></div><div className="space-y-2"><label htmlFor="tanggal_selesai" className="text-gray-700 font-medium">Tanggal Selesai</label><Input id="tanggal_selesai" name="tanggal_selesai" type="date" value={formData.tanggal_selesai || ''} onChange={handleChange} required /></div></div>
            <div className="flex justify-end gap-4"><Button type="button" variant="outline" onClick={() => router.push(`/dashboard/events/${eventId}`)}>Batal</Button><Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button></div>
          </form>
        </Card>

        {/* Status Change Card */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Ubah Status</h3>
            {statusError && <div className="p-4 my-4 text-sm text-red-800 rounded-lg bg-red-50">{statusError}</div>}
            <div className="mt-4 flex items-center gap-4"><select value={newStatus} onChange={(e) => setNewStatus(e.target.value as Event['status'])} className="flex-grow p-2 border rounded-md bg-white text-gray-900"><option value="planning">Planning</option><option value="on_progress">On Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><Button onClick={handleStatusChange} disabled={statusLoading}>{statusLoading ? 'Menyimpan...' : 'Simpan Status'}</Button></div>
          </div>
        </Card>

        {/* Petugas Management Card */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Kelola Petugas</h3>
            {petugasError && <div className="p-4 my-4 text-sm text-red-800 rounded-lg bg-red-50">{petugasError}</div>}
            <div className="mt-4"><label htmlFor="petugas-select" className="font-medium text-gray-700">Tambahkan Petugas</label><select multiple id="petugas-select" value={selectedPetugasIds} onChange={handlePetugasSelectionChange} className="w-full p-2 mt-2 border rounded-md bg-white text-gray-900 h-40">{allUsers.map(user => (<option key={user.id} value={user.id}>{user.nama_lengkap} ({user.email})</option>))}</select><Button onClick={handleAssignPetugas} disabled={petugasLoading} className="mt-4">{petugasLoading ? 'Menyimpan...' : 'Simpan Petugas Terpilih'}</Button></div>
            <div className="mt-6"><h4 className="font-medium text-gray-900">Petugas yang Ditugaskan</h4><div className="mt-2 space-y-2">{assignedPetugas.length > 0 ? assignedPetugas.map(assignment => (<div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium text-gray-900">{assignment.petugas.nama_lengkap}</p><p className="text-sm text-gray-500">{assignment.petugas.email}</p></div><Button size="sm" variant="destructive" onClick={() => openRemoveModal(assignment)}><X className="w-4 h-4" /></Button></div>)) : (<p className="text-gray-500">Belum ada petugas yang ditugaskan.</p>)}</div></div>
          </div>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-red-500">
            <div className="p-6">
                <h3 className="text-lg font-medium text-red-600">Zona Berbahaya</h3>
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Hapus Event Ini</p>
                        <p className="text-sm text-gray-500">Setelah dihapus, event ini tidak dapat dipulihkan.</p>
                    </div>
                    <Button variant="destructive" onClick={() => setIsDeleteEventModalOpen(true)}>Hapus Event</Button>
                </div>
            </div>
        </Card>
      </div>

      {/* Remove Petugas Modal */}
      {petugasToRemove && (
        <Modal isOpen={isRemoveModalOpen} onClose={closeRemoveModal} title="Konfirmasi Hapus Petugas">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="mb-4">Apakah Anda yakin ingin menghapus <span className="font-bold">{petugasToRemove.petugas.nama_lengkap}</span> dari event ini?</p>
            {petugasError && <p className="text-red-600 text-sm mb-4">{petugasError}</p>}
            <div className="flex justify-center gap-4"><Button variant="outline" onClick={closeRemoveModal} disabled={petugasLoading}>Batal</Button><Button variant="destructive" onClick={handleRemovePetugas} disabled={petugasLoading}>{petugasLoading ? 'Menghapus...' : 'Ya, Hapus'}</Button></div>
          </div>
        </Modal>
      )}

      {/* Delete Event Modal */}
      <Modal isOpen={isDeleteEventModalOpen} onClose={() => setIsDeleteEventModalOpen(false)} title="Konfirmasi Hapus Event">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="mb-4">Apakah Anda benar-benar yakin ingin menghapus event <span className="font-bold">{formData.nama_tender}</span>? Tindakan ini tidak dapat dibatalkan.</p>
          {deleteEventError && <p className="text-red-600 text-sm mb-4">{deleteEventError}</p>}
          <div className="flex justify-center gap-4"><Button variant="outline" onClick={() => setIsDeleteEventModalOpen(false)} disabled={deleteEventLoading}>Batal</Button><Button variant="destructive" onClick={handleDeleteEvent} disabled={deleteEventLoading}>{deleteEventLoading ? 'Menghapus...' : 'Ya, Hapus Event'}</Button></div>
        </div>
      </Modal>
    </>
  );
}
