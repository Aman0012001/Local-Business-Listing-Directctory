import { PaginationMeta, PaginatedResponse } from '../interfaces/pagination.interface';

export function createPaginationMeta(
    page: number,
    limit: number,
    total: number,
): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
        page,
        limit,
        total,
        totalPages,
        hasMore,
    };
}

export function createPaginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
): PaginatedResponse<T> {
    return {
        data,
        meta: createPaginationMeta(page, limit, total),
    };
}

export function calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
}
