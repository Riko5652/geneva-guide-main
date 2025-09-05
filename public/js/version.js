// Centralized cache busting - update this one number to refresh all modules
export const VERSION = '1757102250978';

// Auto-generated timestamp for development
export const BUILD_TIME = '2024-01-07T12:04:27.155Z';

// Helper function to append version to imports
export function v(path) {
    return `${path}?v=${VERSION}`;
}
