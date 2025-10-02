'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';
import { User } from '@/types';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsModalOpen(true);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsModalOpen(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.delete(`/users/${userToDelete.id}`);
      fetchUsers(); // Refresh list
      closeDeleteModal();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Gagal menghapus petugas.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { header: 'Nama Lengkap', accessor: 'nama_lengkap' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: (user: User) => <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge> 
    },
    {
      header: 'Aksi',
      accessor: (user: User) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/users/${user.id}/edit`); }}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); openDeleteModal(user); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Petugas</h1>
            <p className="text-gray-600 mt-1">Kelola semua akun petugas di sistem.</p>
          </div>
          <Button onClick={() => router.push('/dashboard/users/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Petugas
          </Button>
        </div>

        <Card>
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <Table columns={columns} data={users} onRowClick={(user) => router.push(`/dashboard/users/${user.id}`)} />
          )}
        </Card>
      </div>

      {userToDelete && (
        <Modal isOpen={isModalOpen} onClose={closeDeleteModal} title="Konfirmasi Hapus Petugas">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="mb-4">Apakah Anda yakin ingin menghapus petugas <span className="font-bold">{userToDelete.nama_lengkap}</span>? Tindakan ini tidak dapat dibatalkan.</p>
            {deleteError && <p className="text-red-600 text-sm mb-4">{deleteError}</p>}
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={closeDeleteModal} disabled={deleteLoading}>Batal</Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteLoading}>
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
