"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationMeta = createPaginationMeta;
exports.createPaginatedResponse = createPaginatedResponse;
exports.calculateSkip = calculateSkip;
function createPaginationMeta(page, limit, total) {
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
function createPaginatedResponse(data, page, limit, total) {
    return {
        data,
        meta: createPaginationMeta(page, limit, total),
    };
}
function calculateSkip(page, limit) {
    return (page - 1) * limit;
}
//# sourceMappingURL=pagination.util.js.map