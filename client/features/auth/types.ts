export interface AuthUser {
  userId: number;
  email: string;
  displayName: string;
  profilePhotoUrl?: string;
  role?: string;
  isEmailVerified?: boolean;
}

export interface AuthResponse extends AuthUser {
  token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
