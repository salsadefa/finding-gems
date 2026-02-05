import { UserRole } from '@prisma/client';
export interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
    username: string;
    role?: UserRole;
    isActive?: boolean;
}
export interface UpdateUserRequest {
    email?: string;
    name?: string;
    username?: string;
    role?: UserRole;
    isActive?: boolean;
    avatar?: string;
}
export interface UserFilters {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
//# sourceMappingURL=user.types.d.ts.map