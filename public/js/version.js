// Centralized cache busting - update this one number to refresh all modules
export const VERSION = '1757115123789';

// Auto-generated timestamp for development
export const BUILD_TIME = '2025-01-07T14:20:56.789Z';

// Helper function to append version to imports
export function v(path) {
    return `${path}?v=${VERSION}`;
}
