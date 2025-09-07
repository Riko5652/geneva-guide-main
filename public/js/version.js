// Auto-generated build info: 2025-09-06T06:35:09.867Z (1757140509867)
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

// Short helper function
export function v(path) {
    return `${path}?v=${VERSION}`;
}

// CSS versioning system - automatically updates CSS files with cache busting
export function initCSSVersioning() {
        const cssFiles = [
            // No CSS files to version - using simple style.css
        ];
    
    // Update CSS files in order to maintain proper cascade
    cssFiles.forEach(({ id, href }, index) => {
        const link = document.getElementById(id);
        if (link) {
            const newHref = `${href}?v=${VERSION}`;
            if (link.href !== newHref) {
                link.href = newHref;
                console.log(`🎨 Updated CSS ${index + 1}/${cssFiles.length}: ${id}`);
            }
        } else {
            console.warn(`⚠️ CSS link not found: ${id}`);
        }
    });
    
    console.log('✅ CSS versioning completed');
}
