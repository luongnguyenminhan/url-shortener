export interface GoogleAuthRequest {
  id_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthResponse {
  user: UserResponse;
  token: TokenResponse;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  name?: string | null;
  google_uid: string;
  created_at: string;
  updated_at: string;
}

export type FirebaseLoginRequest = GoogleAuthRequest;
export type TokenRefreshRequest = RefreshTokenRequest;
export type UserProfile = CurrentUserResponse;
export type MeResponse = CurrentUserResponse;

