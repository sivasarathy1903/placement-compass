export interface User {
  id: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: string;
  email: string;
  roles: string[];
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string>;
}
