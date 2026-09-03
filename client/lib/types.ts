export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}
