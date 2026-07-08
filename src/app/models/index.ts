export interface User {
  user_id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithMember extends User {
  member?: Member;
}

export interface Member {
  member_id: number;
  user_id: number | null;
  full_name: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  phone: string;
  email: string;
  address: string | null;
  join_date: string;
  created_at: string;
  updated_at: string;
  trainers?: Trainer[];
  payments?: Payment[];
  attendance?: Attendance[];
  user?: User;
}

export interface Trainer {
  trainer_id: number;
  trainer_name: string;
  phone: string;
  specialty: string | null;
  created_at: string;
  updated_at: string;
  members?: Member[];
}

export interface Membership {
  membership_id: number;
  membership_name: string;
  duration: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  payment_id: number;
  member_id: number;
  membership_id: number;
  amount: number;
  payment_date: string;
  created_at: string;
  updated_at: string;
  member?: Member;
  membership?: Membership;
}

export interface Attendance {
  attendance_id: number;
  member_id: number;
  check_in: string;
  check_out: string | null;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface Equipment {
  equipment_id: number;
  name: string;
  type: string;
  quantity: number;
  status: string;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  total_members: number;
  active_members: number;
  monthly_revenue: number;
  daily_check_ins: number;
  active_now: number;
  recent_payments: Payment[];
}

export interface MemberCreatePayload {
  full_name: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  phone: string;
  email: string;
  address?: string | null;
  join_date: string;
  create_user_account?: boolean;
  username?: string;
  password?: string;
  role?: 'admin' | 'receptionist' | 'member';
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
