// Automated Cache Busting System
// No more manual version updates needed!

// Generate version automatically based on deployment time
export const VERSION = (() => {
    // Try to get build time from meta tag (set during build)
    const buildMeta = document.querySelector('meta[name="build-time"]');
    if (buildMeta) {
        return buildMeta.content;
    }
    
    // Fallback: Use current timestamp (will cache-bust on every page load)
    return Date.now().toString();
})();

// Build time for reference
export const BUILD_TIME = new Date().toISOString();

// Helper function to create versioned import URLs
export function versionedImport(path) {
    return `${path}?v=${VERSION}`;
}

// Helper function for dynamic imports
export function dynamicImport(path) {
    return import(versionedImport(path));
}
export function v(path) {
    return `${path}?v=${VERSION}`;
}
