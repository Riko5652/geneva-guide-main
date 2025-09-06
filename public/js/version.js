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
        { id: 'css-style', href: '/CSS/style.css' },
        { id: 'css-utilities', href: '/CSS/utilities.css' },
        { id: 'css-modal', href: '/CSS/modal-enhancements.css' },
        { id: 'css-cascade', href: '/CSS/css-cascade-fix.css' }
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
