'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { User } from '@/types';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [formData, setFormData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setIsFetching(true);
      const response = await api.get(`/users/${userId}`);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setError('Failed to load user data.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Do not send empty password
    const { password, ...updateData } = formData;
    const payload = password ? formData : updateData;

    try {
      await api.put(`/users/${userId}`, payload);
      router.push(`/dashboard/users/${userId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');
      console.error('Failed to update user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
     return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Petugas</h1>
          <p className="text-gray-600 mt-1">Update detail akun untuk {formData.nama_lengkap}.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {
            error && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                {error}
              </div>
            )
          }
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="nama_lengkap" className="font-medium">Nama Lengkap</label>
              <Input
                id="nama_lengkap"
                name="nama_lengkap"
                value={formData.nama_lengkap || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password"  className="font-medium">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin mengubah"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="font-medium">Role</label>
              <Input
                id="role"
                name="role"
                value={formData.role || ''}
                onChange={handleChange}
                required
              />
               <p className="text-xs text-gray-500">Contoh: 'admin' atau 'petugas'.</p>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/users/${userId}`)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
