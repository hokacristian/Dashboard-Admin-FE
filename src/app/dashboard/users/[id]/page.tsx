'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, User as UserIcon, Mail, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { User } from '@/types';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/users/${userId}`);
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{user.nama_lengkap}</h1>
            <p className="text-gray-600 mt-1">Detail Petugas</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/users/${userId}/edit`)}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Petugas
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-semibold mb-4">
                {user.nama_lengkap?.charAt(0) || 'U'}
            </div>
            <h2 className="text-2xl font-bold">{user.nama_lengkap}</h2>
            <p className="text-gray-500">{user.email}</p>
        </Card>

        <Card className="lg:col-span-2 p-6">
            <h3 className="text-xl font-bold mb-4">Informasi Akun</h3>
            <div className="space-y-4">
                <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-gray-500 mr-4" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">Nama Lengkap</p>
                        <p className="font-semibold">{user.nama_lengkap}</p>
                    </div>
                </div>
                 <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-500 mr-4" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{user.email}</p>
                    </div>
                </div>
                 <div className="flex items-center">
                    <Shield className="w-5 h-5 text-gray-500 mr-4" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">Role</p>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                    </div>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
