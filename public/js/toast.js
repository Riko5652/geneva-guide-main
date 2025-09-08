/**
 * Toast Notification System
 * Provides user-friendly notifications for various actions and states
 */

class ToastManager {
    constructor() {
        this.toasts = [];
        this.container = null;
        this.maxToasts = 5;
        this.defaultDuration = 4000;
        this.init();
    }

    init() {
        this.createContainer();
        this.addToastStyles();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    addToastStyles() {
        // Styles are now handled by consolidated.css
        // This method is kept for compatibility but does nothing
    }

    show(message, type = 'info', options = {}) {
        const {
            title = this.getDefaultTitle(type),
            duration = this.defaultDuration,
            persistent = false,
            actions = null,
            icon = this.getDefaultIcon(type)
        } = options;

        // Remove oldest toast if we've reached the limit
        if (this.toasts.length >= this.maxToasts) {
            this.removeToast(this.toasts[0]);
        }

        const toast = this.createToast(message, type, title, icon, actions);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto-remove if not persistent
        if (!persistent && duration > 0) {
            this.scheduleRemoval(toast, duration);
        }

        return toast;
    }

    createToast(message, type, title, icon, actions) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'toast-progress';
        progressBar.style.width = '100%';
        
        const iconElement = document.createElement('div');
        iconElement.className = 'toast-icon';
        iconElement.textContent = icon;
        
        const content = document.createElement('div');
        content.className = 'toast-content';
        
        const titleElement = document.createElement('div');
        titleElement.className = 'toast-title';
        titleElement.textContent = title;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'toast-message';
        messageElement.textContent = message;
        
        content.appendChild(titleElement);
        content.appendChild(messageElement);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        toast.appendChild(progressBar);
        toast.appendChild(iconElement);
        toast.appendChild(content);
        toast.appendChild(closeButton);
        
        // Add action buttons if provided
        if (actions && actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'toast-actions';
            actionsContainer.style.marginTop = '8px';
            actionsContainer.style.display = 'flex';
            actionsContainer.style.gap = '8px';
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.text;
                button.className = 'toast-action-btn';
                button.style.cssText = `
                    padding: 4px 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    background: white;
                    color: #374151;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                `;
                button.addEventListener('click', () => {
                    if (action.handler) action.handler();
                    this.removeToast(toast);
                });
                actionsContainer.appendChild(button);
            });
            
            content.appendChild(actionsContainer);
        }
        
        return toast;
    }

    scheduleRemoval(toast, duration) {
        const progressBar = toast.querySelector('.toast-progress');
        if (progressBar) {
            progressBar.style.transition = `width ${duration}ms linear`;
            progressBar.style.width = '0%';
        }
        
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.add('hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    getDefaultTitle(type) {
        const titles = {
            success: 'הצלחה',
            error: 'שגיאה',
            warning: 'אזהרה',
            info: 'מידע'
        };
        return titles[type] || 'הודעה';
    }

    getDefaultIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || 'ℹ';
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // Clear all toasts
    clear() {
        this.toasts.forEach(toast => {
            this.removeToast(toast);
        });
    }

    // Show loading toast
    loading(message = 'טוען...', options = {}) {
        return this.show(message, 'info', {
            ...options,
            persistent: true,
            icon: '⟳'
        });
    }

    // Update loading toast
    updateLoading(toast, message) {
        if (toast && toast.querySelector('.toast-message')) {
            toast.querySelector('.toast-message').textContent = message;
        }
    }

    // Hide loading toast
    hideLoading(toast) {
        if (toast) {
            this.removeToast(toast);
        }
    }
}

// Initialize toast manager
let toastManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        toastManager = new ToastManager();
        window.toastManager = toastManager;
    });
} else {
    toastManager = new ToastManager();
    window.toastManager = toastManager;
}

// Export for ES6 modules
export { ToastManager };
