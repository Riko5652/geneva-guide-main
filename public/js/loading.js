/**
 * Loading State Manager
 * Provides loading indicators and states for various UI components
 */

class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
        this.globalLoading = null;
        this.init();
    }

    init() {
        this.addLoadingStyles();
        this.setupGlobalLoading();
    }

    addLoadingStyles() {
        if (document.getElementById('loading-styles')) return;

        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(4px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                border-radius: inherit;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 16px;
            }
            
            .loading-spinner.small {
                width: 20px;
                height: 20px;
                border-width: 2px;
                margin-bottom: 8px;
            }
            
            .loading-spinner.large {
                width: 60px;
                height: 60px;
                border-width: 6px;
                margin-bottom: 24px;
            }
            
            .loading-text {
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
                text-align: center;
                margin: 0;
            }
            
            .loading-dots {
                display: inline-block;
                position: relative;
                width: 80px;
                height: 80px;
            }
            
            .loading-dots div {
                position: absolute;
                top: 33px;
                width: 13px;
                height: 13px;
                border-radius: 50%;
                background: #3b82f6;
                animation-timing-function: cubic-bezier(0, 1, 1, 0);
            }
            
            .loading-dots div:nth-child(1) {
                left: 8px;
                animation: loading-dots1 0.6s infinite;
            }
            
            .loading-dots div:nth-child(2) {
                left: 8px;
                animation: loading-dots2 0.6s infinite;
            }
            
            .loading-dots div:nth-child(3) {
                left: 32px;
                animation: loading-dots2 0.6s infinite;
            }
            
            .loading-dots div:nth-child(4) {
                left: 56px;
                animation: loading-dots3 0.6s infinite;
            }
            
            @keyframes loading-dots1 {
                0% { transform: scale(0); }
                100% { transform: scale(1); }
            }
            
            @keyframes loading-dots3 {
                0% { transform: scale(1); }
                100% { transform: scale(0); }
            }
            
            @keyframes loading-dots2 {
                0% { transform: translate(0, 0); }
                100% { transform: translate(24px, 0); }
            }
            
            .loading-skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
            }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .loading-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .global-loading {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(8px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .global-loading.show {
                opacity: 1;
                visibility: visible;
            }
            
            .loading-progress {
                width: 200px;
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
                margin-top: 20px;
            }
            
            .loading-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                border-radius: 2px;
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .loading-percentage {
                color: #6b7280;
                font-size: 12px;
                margin-top: 8px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    setupGlobalLoading() {
        this.globalLoading = document.createElement('div');
        this.globalLoading.className = 'global-loading';
        this.globalLoading.innerHTML = `
            <div class="loading-dots">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <p class="loading-text">טוען...</p>
            <div class="loading-progress">
                <div class="loading-progress-bar"></div>
            </div>
            <div class="loading-percentage">0%</div>
        `;
        document.body.appendChild(this.globalLoading);
    }

    // Show loading overlay on specific element
    show(element, text = 'טוען...', size = 'normal') {
        if (!element) return null;

        const loadingId = this.generateId();
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.dataset.loadingId = loadingId;
        
        const spinnerClass = size === 'small' ? 'loading-spinner small' : 
                           size === 'large' ? 'loading-spinner large' : 
                           'loading-spinner';
        
        loadingOverlay.innerHTML = `
            <div class="${spinnerClass}"></div>
            <p class="loading-text">${text}</p>
        `;

        // Make element relatively positioned if it isn't already
        const originalPosition = element.style.position;
        if (!originalPosition || originalPosition === 'static') {
            element.style.position = 'relative';
        }

        element.appendChild(loadingOverlay);
        this.loadingStates.set(loadingId, { element, overlay: loadingOverlay });

        return loadingId;
    }

    // Hide loading overlay
    hide(loadingId) {
        if (!loadingId) return;

        const loadingState = this.loadingStates.get(loadingId);
        if (loadingState) {
            const { element, overlay } = loadingState;
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            this.loadingStates.delete(loadingId);
        }
    }

    // Show global loading
    showGlobal(text = 'טוען...', progress = null) {
        if (this.globalLoading) {
            const textElement = this.globalLoading.querySelector('.loading-text');
            if (textElement) {
                textElement.textContent = text;
            }

            if (progress !== null) {
                this.updateProgress(progress);
            }

            this.globalLoading.classList.add('show');
        }
    }

    // Hide global loading
    hideGlobal() {
        if (this.globalLoading) {
            this.globalLoading.classList.remove('show');
            this.updateProgress(0);
        }
    }

    // Update global loading progress
    updateProgress(percentage) {
        if (this.globalLoading) {
            const progressBar = this.globalLoading.querySelector('.loading-progress-bar');
            const percentageText = this.globalLoading.querySelector('.loading-percentage');
            
            if (progressBar) {
                progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
            }
            
            if (percentageText) {
                percentageText.textContent = `${Math.round(percentage)}%`;
            }
        }
    }

    // Show skeleton loading for content
    showSkeleton(element, count = 3) {
        if (!element) return null;

        const skeletonId = this.generateId();
        const skeletonContainer = document.createElement('div');
        skeletonContainer.className = 'skeleton-container';
        skeletonContainer.dataset.skeletonId = skeletonId;

        for (let i = 0; i < count; i++) {
            const skeletonItem = document.createElement('div');
            skeletonItem.className = 'loading-skeleton';
            skeletonItem.style.height = i === 0 ? '20px' : '16px';
            skeletonItem.style.marginBottom = '12px';
            skeletonItem.style.width = i === 0 ? '80%' : '60%';
            skeletonContainer.appendChild(skeletonItem);
        }

        element.appendChild(skeletonContainer);
        this.loadingStates.set(skeletonId, { element, overlay: skeletonContainer });

        return skeletonId;
    }

    // Hide skeleton loading
    hideSkeleton(skeletonId) {
        this.hide(skeletonId);
    }

    // Show loading state for buttons
    showButtonLoading(button, text = 'טוען...') {
        if (!button) return null;

        const loadingId = this.generateId();
        const originalText = button.textContent;
        const originalDisabled = button.disabled;

        button.disabled = true;
        button.textContent = text;
        button.classList.add('loading-pulse');

        this.loadingStates.set(loadingId, { 
            element: button, 
            originalText, 
            originalDisabled,
            type: 'button'
        });

        return loadingId;
    }

    // Hide button loading state
    hideButtonLoading(loadingId) {
        if (!loadingId) return;

        const loadingState = this.loadingStates.get(loadingId);
        if (loadingState && loadingState.type === 'button') {
            const { element: button, originalText, originalDisabled } = loadingState;
            
            button.disabled = originalDisabled;
            button.textContent = originalText;
            button.classList.remove('loading-pulse');
            
            this.loadingStates.delete(loadingId);
        }
    }

    // Show loading for async operations
    async withLoading(asyncFunction, element = null, text = 'טוען...') {
        let loadingId = null;
        
        try {
            if (element) {
                loadingId = this.show(element, text);
            } else {
                this.showGlobal(text);
            }
            
            const result = await asyncFunction();
            return result;
        } finally {
            if (loadingId) {
                this.hide(loadingId);
            } else {
                this.hideGlobal();
            }
        }
    }

    // Show loading with progress updates
    async withProgressLoading(asyncFunction, progressCallback = null) {
        this.showGlobal('מתחיל...', 0);
        
        try {
            const result = await asyncFunction((progress) => {
                if (progressCallback) {
                    progressCallback(progress);
                }
                this.updateProgress(progress);
            });
            
            this.updateProgress(100);
            setTimeout(() => this.hideGlobal(), 500);
            
            return result;
        } catch (error) {
            this.hideGlobal();
            throw error;
        }
    }

    // Generate unique ID
    generateId() {
        return 'loading_' + Math.random().toString(36).substr(2, 9);
    }

    // Clear all loading states
    clearAll() {
        this.loadingStates.forEach((state, id) => {
            this.hide(id);
        });
        this.hideGlobal();
    }

    // Check if any loading is active
    isLoading() {
        return this.loadingStates.size > 0 || 
               (this.globalLoading && this.globalLoading.classList.contains('show'));
    }
}

// Initialize loading manager
let loadingManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadingManager = new LoadingManager();
        window.loadingManager = loadingManager;
    });
} else {
    loadingManager = new LoadingManager();
    window.loadingManager = loadingManager;
}

// Export for ES6 modules
export { LoadingManager };
