export interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  plan?: string;
  planId?: string;
  courseTitle?: string;
  joined?: string;
  xp?: number;
  abandonBlockedUntil?: string;
  currentPeriodEnd?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  course?: { id: string; title: string };
}

export interface UpdateUserDTO {
  name: string;
  email: string;
  phone: string;
  planId: string | null;
}

export interface UserFormState {
  name: string;
  email: string;
  phone: string;
  planId: string;
}
