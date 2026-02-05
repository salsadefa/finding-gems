export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    username: string;
    avatar?: string | null;
    role: 'buyer' | 'creator' | 'admin';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface RegisterRequestBody {
    email: string;
    password: string;
    name: string;
    username: string;
    role?: 'buyer' | 'creator';
}
export interface LoginRequestBody {
    email: string;
    password: string;
}
export interface RefreshTokenRequestBody {
    refreshToken: string;
}
export interface AuthResponse {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}
export interface UserProfileResponse {
    user: Omit<User, 'password'>;
}
export interface MessageResponse {
    message: string;
}
export type SanitizedUser = Omit<User, 'password'>;
//# sourceMappingURL=auth.types.d.ts.map