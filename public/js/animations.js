/**
 * Animation Utilities
 * Provides smooth animations and transitions for UI elements
 */

class AnimationManager {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.init();
    }

    init() {
        // Add CSS for animations if not already present
        this.addAnimationStyles();
        
        // Setup intersection observer for scroll animations
        this.setupScrollAnimations();
        
        // Setup hover animations
        this.setupHoverAnimations();
    }

    addAnimationStyles() {
        if (document.getElementById('animation-styles')) return;

        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            .fade-in {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }
            
            .fade-in.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .slide-in-left {
                opacity: 0;
                transform: translateX(-30px);
                transition: opacity 0.5s ease-out, transform 0.5s ease-out;
            }
            
            .slide-in-left.visible {
                opacity: 1;
                transform: translateX(0);
            }
            
            .slide-in-right {
                opacity: 0;
                transform: translateX(30px);
                transition: opacity 0.5s ease-out, transform 0.5s ease-out;
            }
            
            .slide-in-right.visible {
                opacity: 1;
                transform: translateX(0);
            }
            
            .scale-in {
                opacity: 0;
                transform: scale(0.8);
                transition: opacity 0.4s ease-out, transform 0.4s ease-out;
            }
            
            .scale-in.visible {
                opacity: 1;
                transform: scale(1);
            }
            
            .bounce-in {
                opacity: 0;
                transform: scale(0.3);
                transition: opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .bounce-in.visible {
                opacity: 1;
                transform: scale(1);
            }
            
            .pulse {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .shake {
                animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            .loading-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, .bounce-in').forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverAnimations() {
        // Add hover effects to cards
        document.querySelectorAll('.card, .activity-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateElement(card, 'scale-in', 0.1);
            });
        });

        // Add hover effects to buttons
        document.querySelectorAll('.btn-primary, .btn-filter').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.animateElement(btn, 'pulse', 0.2);
            });
        });
    }

    animateElement(element, animationType, delay = 0) {
        if (delay > 0) {
            setTimeout(() => {
                this.performAnimation(element, animationType);
            }, delay * 1000);
        } else {
            this.performAnimation(element, animationType);
        }
    }

    performAnimation(element, animationType) {
        if (!element) return;

        // Remove existing animation classes
        element.classList.remove('fade-in', 'slide-in-left', 'slide-in-right', 'scale-in', 'bounce-in', 'pulse', 'shake');
        
        // Add the new animation class
        element.classList.add(animationType);
        
        // For temporary animations, remove the class after completion
        if (['pulse', 'shake'].includes(animationType)) {
            setTimeout(() => {
                element.classList.remove(animationType);
            }, animationType === 'pulse' ? 2000 : 500);
        }
    }

    // Queue animations for sequential execution
    queueAnimation(element, animationType, delay = 0) {
        this.animationQueue.push({ element, animationType, delay });
        this.processQueue();
    }

    processQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) return;
        
        this.isAnimating = true;
        const { element, animationType, delay } = this.animationQueue.shift();
        
        this.animateElement(element, animationType, delay);
        
        setTimeout(() => {
            this.isAnimating = false;
            this.processQueue();
        }, (delay + 0.5) * 1000);
    }

    // Animate page transitions
    animatePageTransition(callback) {
        const body = document.body;
        body.style.opacity = '0';
        body.style.transform = 'translateY(20px)';
        body.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        
        setTimeout(() => {
            if (callback) callback();
            
            body.style.opacity = '1';
            body.style.transform = 'translateY(0)';
        }, 300);
    }

    // Animate modal appearance
    animateModal(modal, show = true) {
        if (!modal) return;

        if (show) {
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.8)';
            modal.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            }, 10);
        } else {
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // Animate loading states
    showLoading(element, text = 'טוען...') {
        if (!element) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${text}</p>
        `;
        
        element.style.position = 'relative';
        element.appendChild(loadingDiv);
    }

    hideLoading(element) {
        if (!element) return;
        
        const loadingOverlay = element.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    // Animate success/error states
    showSuccess(element, message = 'הצלחה!') {
        this.showStatus(element, 'success', message);
    }

    showError(element, message = 'שגיאה!') {
        this.showStatus(element, 'error', message);
    }

    showStatus(element, type, message) {
        if (!element) return;

        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;
        
        element.appendChild(statusDiv);
        
        setTimeout(() => {
            statusDiv.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            statusDiv.classList.remove('visible');
            setTimeout(() => {
                statusDiv.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize animation manager
let animationManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        animationManager = new AnimationManager();
        window.animationManager = animationManager;
    });
} else {
    animationManager = new AnimationManager();
    window.animationManager = animationManager;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}
