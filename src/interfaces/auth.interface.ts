export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  avatar?: string;
  role?: string;
  isActive: boolean;
  lastLogin?: string | null;
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  token: string;
  user: UserProfile;
};
