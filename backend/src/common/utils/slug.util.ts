/**
 * Generate a unique slug from a string
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug with timestamp
 */
export function generateUniqueSlug(text: string): string {
    const baseSlug = generateSlug(text);
    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
}
