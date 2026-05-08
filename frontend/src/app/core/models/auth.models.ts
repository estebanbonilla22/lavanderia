export type Role = 'ADMIN' | 'USER';

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: Role;
  expiresIn: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: Role;
}

export interface SessionUser {
  userId: number;
  username: string;
  email: string;
  role: Role;
  token: string;
}
