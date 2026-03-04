"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = generateSlug;
exports.generateUniqueSlug = generateUniqueSlug;
exports.isValidSlug = isValidSlug;
function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function generateUniqueSlug(text) {
    const baseSlug = generateSlug(text);
    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
}
function isValidSlug(slug) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
}
//# sourceMappingURL=slug.util.js.map