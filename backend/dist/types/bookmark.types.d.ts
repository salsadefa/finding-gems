export interface CreateBookmarkRequest {
    websiteId: string;
}
export interface BookmarkResponse {
    id: string;
    websiteId: string;
    userId: string;
    createdAt: Date;
    website?: {
        id: string;
        name: string;
        slug: string;
        thumbnail: string;
        category: {
            name: string;
            slug: string;
        };
        creator: {
            name: string;
            username: string;
        };
    };
}
//# sourceMappingURL=bookmark.types.d.ts.map