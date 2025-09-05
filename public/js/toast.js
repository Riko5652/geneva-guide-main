// Family-Friendly Toast Notifications
// Warm, playful notifications that kids will love

export class FamilyToast {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.icons = {
            success: '🎉',
            error: '😔',
            warning: '⚠️',
            info: 'ℹ️',
            love: '❤️',
            star: '⭐',
            rocket: '🚀',
            gift: '🎁'
        };
    }
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'fixed top-4 right-4 z-[9998] flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(this.container);
        }
    }
    
    show(message, type = 'info', duration = 5000) {
        this.init();
        
        const toast = document.createElement('div');
        const toastId = `toast-${Date.now()}`;
        toast.id = toastId;
        toast.className = `
            max-w-sm w-full bg-white rounded-2xl shadow-2xl p-4 
            transform translate-x-full transition-all duration-300 
            pointer-events-auto cursor-pointer
            ${this.getTypeClasses(type)}
        `;
        
        const icon = this.icons[type] || this.icons.info;
        
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="text-3xl animate-bounce">${icon}</div>
                <div class="flex-1">
                    <p class="text-gray-800 font-medium">${message}</p>
                </div>
                <button class="text-gray-400 hover:text-gray-600 text-xl" onclick="familyToast.hide('${toastId}')">
                    ×
                </button>
            </div>
            <div class="toast-progress mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r ${this.getProgressGradient(type)} transition-all duration-${duration}"
                     style="width: 100%; transition: width ${duration}ms linear;"></div>
            </div>
        `;
        
        this.container.appendChild(toast);
        this.toasts.push({ id: toastId, element: toast });
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Start progress bar animation
        setTimeout(() => {
            const progressBar = toast.querySelector('.toast-progress > div');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }, 100);
        
        // Auto hide
        setTimeout(() => this.hide(toastId), duration);
        
        // Click to dismiss
        toast.addEventListener('click', () => this.hide(toastId));
        
        return toastId;
    }
    
    hide(toastId) {
        const toastIndex = this.toasts.findIndex(t => t.id === toastId);
        if (toastIndex === -1) return;
        
        const toast = this.toasts[toastIndex];
        toast.element.style.transform = 'translateX(120%)';
        toast.element.style.opacity = '0';
        
        setTimeout(() => {
            toast.element.remove();
            this.toasts.splice(toastIndex, 1);
        }, 300);
    }
    
    getTypeClasses(type) {
        const classes = {
            success: 'border-l-4 border-green-500',
            error: 'border-l-4 border-red-500',
            warning: 'border-l-4 border-yellow-500',
            info: 'border-l-4 border-blue-500',
            love: 'border-l-4 border-pink-500',
            star: 'border-l-4 border-yellow-400',
            rocket: 'border-l-4 border-purple-500',
            gift: 'border-l-4 border-teal-500'
        };
        return classes[type] || classes.info;
    }
    
    getProgressGradient(type) {
        const gradients = {
            success: 'from-green-400 to-green-600',
            error: 'from-red-400 to-red-600',
            warning: 'from-yellow-400 to-yellow-600',
            info: 'from-blue-400 to-blue-600',
            love: 'from-pink-400 to-pink-600',
            star: 'from-yellow-300 to-yellow-500',
            rocket: 'from-purple-400 to-purple-600',
            gift: 'from-teal-400 to-teal-600'
        };
        return gradients[type] || gradients.info;
    }
    
    // Convenience methods
    success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
    
    love(message, duration) {
        return this.show(message, 'love', duration);
    }
    
    celebrate(message, duration) {
        return this.show(message, 'star', duration);
    }
}

// Create global instance
export const familyToast = new FamilyToast();

// Make it globally accessible for inline onclick handlers
window.familyToast = familyToast;
