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
        if (document.getElementById('toast-styles')) return;

        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            }
            
            .toast {
                background: white;
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                border-left: 4px solid;
                display: flex;
                align-items: center;
                gap: 12px;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: auto;
                position: relative;
                overflow: hidden;
            }
            
            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .toast.hide {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .toast.success {
                border-left-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            }
            
            .toast.error {
                border-left-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            }
            
            .toast.warning {
                border-left-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            }
            
            .toast.info {
                border-left-color: #3b82f6;
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            }
            
            .toast-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 14px;
            }
            
            .toast.success .toast-icon {
                background: #10b981;
                color: white;
            }
            
            .toast.error .toast-icon {
                background: #ef4444;
                color: white;
            }
            
            .toast.warning .toast-icon {
                background: #f59e0b;
                color: white;
            }
            
            .toast.info .toast-icon {
                background: #3b82f6;
                color: white;
            }
            
            .toast-content {
                flex: 1;
                min-width: 0;
            }
            
            .toast-title {
                font-weight: 600;
                font-size: 14px;
                color: #1f2937;
                margin: 0 0 4px 0;
            }
            
            .toast-message {
                font-size: 13px;
                color: #6b7280;
                margin: 0;
                line-height: 1.4;
            }
            
            .toast-close {
                width: 20px;
                height: 20px;
                border: none;
                background: none;
                cursor: pointer;
                color: #9ca3af;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            
            .toast-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #374151;
            }
            
            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 0 0 12px 12px;
                transition: width linear;
            }
            
            .toast.success .toast-progress {
                background: #10b981;
            }
            
            .toast.error .toast-progress {
                background: #ef4444;
            }
            
            .toast.warning .toast-progress {
                background: #f59e0b;
            }
            
            .toast.info .toast-progress {
                background: #3b82f6;
            }
            
            @media (max-width: 640px) {
                .toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
                
                .toast {
                    padding: 14px 16px;
                }
                
                .toast-title {
                    font-size: 13px;
                }
                
                .toast-message {
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
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

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastManager;
}
