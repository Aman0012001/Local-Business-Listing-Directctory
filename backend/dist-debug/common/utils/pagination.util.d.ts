import { PaginationMeta, PaginatedResponse } from '../interfaces/pagination.interface';
export declare function createPaginationMeta(page: number, limit: number, total: number): PaginationMeta;
export declare function createPaginatedResponse<T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T>;
export declare function calculateSkip(page: number, limit: number): number;
