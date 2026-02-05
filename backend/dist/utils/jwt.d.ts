import { User } from '../types/auth.types';
export type UserRole = 'buyer' | 'creator' | 'admin';
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
}
export interface AuthenticatedRequest extends Request {
    user?: User;
}
/**
 * Generate access token
 */
export declare const generateAccessToken: (user: User) => string;
/**
 * Generate refresh token
 */
export declare const generateRefreshToken: (user: User) => string;
/**
 * Verify access token
 */
export declare const verifyAccessToken: (token: string) => JwtPayload;
/**
 * Verify refresh token
 */
export declare const verifyRefreshToken: (token: string) => JwtPayload;
/**
 * Generate both tokens
 */
export declare const generateTokens: (user: User) => {
    accessToken: string;
    refreshToken: string;
};
//# sourceMappingURL=jwt.d.ts.map