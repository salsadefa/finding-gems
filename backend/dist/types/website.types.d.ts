import { WebsiteStatus } from '@prisma/client';
export interface CreateWebsiteRequest {
    name: string;
    description: string;
    shortDescription: string;
    categoryId: string;
    externalUrl: string;
    thumbnail: string;
    screenshots?: string[];
    demoVideoUrl?: string;
    techStack?: string[];
    useCases?: string[];
    hasFreeTrial?: boolean;
    freeTrialDetails?: string;
}
export interface UpdateWebsiteRequest {
    name?: string;
    description?: string;
    shortDescription?: string;
    categoryId?: string;
    externalUrl?: string;
    thumbnail?: string;
    screenshots?: string[];
    demoVideoUrl?: string;
    techStack?: string[];
    useCases?: string[];
    hasFreeTrial?: boolean;
    freeTrialDetails?: string;
    status?: WebsiteStatus;
}
export interface WebsiteFilters {
    search?: string;
    category?: string;
    status?: WebsiteStatus;
    hasFreeTrial?: boolean;
    minRating?: number;
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
//# sourceMappingURL=website.types.d.ts.map