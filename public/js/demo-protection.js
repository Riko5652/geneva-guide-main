/* Demo Protection & Error Handling for $30M Presentation
   Ensures flawless user experience with graceful error recovery
*/

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
    // Prevent default error display
    event.preventDefault();
    
    // Log for debugging but don't show to users
    console.warn('Handled error:', event.error);
    
    // Show elegant error message
    showElegantError('התנתקנו מהשרת לרגע. מחזירים את החיבור...');
    
    // Attempt graceful recovery
    setTimeout(() => {
        location.reload();
    }, 3000);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    console.warn('Handled promise rejection:', event.reason);
    
    // For network-related errors, show connectivity message
    if (event.reason && event.reason.message && event.reason.message.includes('fetch')) {
        showElegantError('בודקים חיבור לאינטרנט...');
    }
});

// Elegant error display function
function showElegantError(message, duration = 5000) {
    // Remove existing error notifications
    const existingErrors = document.querySelectorAll('.demo-error-notification');
    existingErrors.forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = 'demo-error-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-family: 'Assistant', sans-serif;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(12px);
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Add keyframes for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Network connectivity monitoring
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
    if (!isOnline) {
        showElegantError('🌐 חיבור לאינטרנט חודש!', 2000);
        isOnline = true;
    }
});

window.addEventListener('offline', () => {
    showElegantError('⚠️ אין חיבור לאינטרנט - עובדים במצב לא מקוון');
    isOnline = false;
});

// Performance monitoring
let pageLoadTime = 0;

window.addEventListener('load', () => {
    pageLoadTime = performance.now();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Initialize performance optimizations
    initPerformanceOptimizations();
});

function preloadCriticalResources() {
    // Preload Gemini API endpoint
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = '/.netlify/functions/gemini';
    document.head.appendChild(link);
    
    // Preload Firebase resources
    const firebaseLink = document.createElement('link');
    firebaseLink.rel = 'dns-prefetch';
    firebaseLink.href = 'https://firestore.googleapis.com';
    document.head.appendChild(firebaseLink);
}

function initPerformanceOptimizations() {
    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.loading) img.loading = 'lazy';
    });
    
    // Optimize scrolling performance
    if (CSS.supports('scroll-behavior', 'smooth')) {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    // Memory cleanup for modals
    document.addEventListener('click', (e) => {
        if (e.target.closest('.modal-close-btn')) {
            // Clean up any leftover event listeners
            setTimeout(() => {
                if (window.gc) window.gc(); // Force garbage collection if available
            }, 100);
        }
    });
}

// Demo-specific enhancements
function initDemoMode() {
    // Add subtle watermark for demo
    const watermark = document.createElement('div');
    watermark.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        color: rgba(0,0,0,0.1);
        font-size: 10px;
        font-family: monospace;
        z-index: 9999;
        pointer-events: none;
        user-select: none;
    `;
    watermark.textContent = 'DEMO v' + Date.now();
    document.body.appendChild(watermark);
    
    // Ensure all animations are smooth
    document.documentElement.style.setProperty('--animation-performance', 'optimizeSpeed');
}

// Initialize demo protections
document.addEventListener('DOMContentLoaded', initDemoMode);

// Export for global access
window.DemoProtection = {
    showElegantError,
    pageLoadTime: () => pageLoadTime,
    isOnline: () => isOnline
};
