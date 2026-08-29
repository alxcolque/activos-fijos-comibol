export type UserRole = 'admin' | 'operador' | 'guest';

export interface UserItem {
  id: string;
  email: string;
  fullName: string;
  profession?: string | null;
  projectId?: string | null;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  } | null;
}

export type User = UserItem;

export interface CreateUserDTO {
  fullName: string;
  email: string;
  profession?: string | null;
  projectId?: string | null;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserDTO {
  fullName?: string;
  email?: string;
  profession?: string | null;
  projectId?: string | null;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
