'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea, Select } from '@/components/ui/Input';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function CreateEventPage() {
  const router = useRouter();
  const { success, error: showError, showLoading, hideLoading } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_tender: '',
    lokasi: '',
    deskripsi: '',
    budget: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status: 'planning',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    showLoading('Creating event...');

    try {
      const payload = {
        ...formData,
        budget: parseInt(formData.budget),
      };

      await api.post('/events', payload);
      success('Event created successfully!');
      router.push('/dashboard/events');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        showError('Please check the form for errors');
      } else {
        showError('Failed to create event');
      }
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-1">Add a new tender event</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Tender Name"
              placeholder="Enter tender name"
              value={formData.nama_tender}
              onChange={(e) =>
                setFormData({ ...formData, nama_tender: e.target.value })
              }
              error={errors.nama_tender}
              required
            />

            <Input
              label="Location"
              placeholder="Enter location"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              error={errors.lokasi}
              required
            />

            <Input
              label="Budget (IDR)"
              type="number"
              placeholder="Enter budget"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              error={errors.budget}
              required
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'planning', label: 'Planning' },
                { value: 'on_progress', label: 'On Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              error={errors.status}
            />

            <Input
              label="Start Date"
              type="date"
              value={formData.tanggal_mulai}
              onChange={(e) =>
                setFormData({ ...formData, tanggal_mulai: e.target.value })
              }
              error={errors.tanggal_mulai}
              required
            />

            <Input
              label="End Date"
              type="date"
              value={formData.tanggal_selesai}
              onChange={(e) =>
                setFormData({ ...formData, tanggal_selesai: e.target.value })
              }
              error={errors.tanggal_selesai}
              required
            />
          </div>

          <TextArea
            label="Description"
            placeholder="Enter description"
            rows={4}
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            error={errors.deskripsi}
          />

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
