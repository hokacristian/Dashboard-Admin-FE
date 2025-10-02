export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'supervisor' | 'petugas';
  nama_lengkap: string;
  foto_profil: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  nama_tender: string;
  lokasi: string;
  deskripsi: string;
  budget: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: 'planning' | 'on_progress' | 'completed' | 'cancelled';
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  event_id: string;
  nama_milestone: string;
  deskripsi: string;
  deadline: string;
  urutan: number;
  status: 'pending' | 'on_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ProgressReport {
  id: string;
  event_id?: string;
  milestone_id?: string;
  petugas_id?: string;
  description: string;
  tanggal_laporan?: string;
  persentase_progress: number;
  foto_progress?: string[];
  created_at: string;
  updated_at?: string;
  user?: User;
  petugas?: User;
  milestone?: Milestone;
  type?: string;
  title?: string;
  event?: Partial<Event>;
}

export interface DashboardStats {
  events: {
    planning: number;
    on_progress: number;
    completed: number;
    cancelled: number;
    total: number;
  };
  active_petugas: number;
  total_progress_reports: number;
  events_near_deadline: number;
  overdue_events: number;
  details: {
    events_near_deadline: any[];
    overdue_events: any[];
  };
}

export interface EventSummary extends Event {
  creator: User;
  assigned_petugas: { petugas: Partial<User> }[];
  milestones: Milestone[];
  progress_reports: ProgressReport[];
  _count: {
    milestones: number;
    progress_reports: number;
  };
  progress: {
    milestone_progress: number;
    latest_progress_percentage: number;
    overall_progress: number;
    completed_milestones: number;
    total_milestones: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  user: User;
}
