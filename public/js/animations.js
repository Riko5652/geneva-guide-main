// Family-Friendly Animations & Effects
// Adds warmth and playfulness to the UI

export class FamilyAnimations {
    constructor() {
        this.confettiColors = ['#0891b2', '#14b8a6', '#fbbf24', '#10b981', '#ef4444', '#7c3aed'];
    }
    
    // Confetti celebration for completed tasks
    celebrate(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 30; i++) {
            this.createConfetti(centerX, centerY);
        }
        
        // Add celebration sound effect (optional)
        this.playSound('success');
    }
    
    createConfetti(x, y) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)]};
            left: ${x}px;
            top: ${y}px;
            opacity: 1;
            transform: rotate(${Math.random() * 360}deg);
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(confetti);
        
        // Animate confetti
        const angle = (Math.random() * Math.PI * 2);
        const velocity = 5 + Math.random() * 5;
        const gravity = 0.3;
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity - 5;
        let opacity = 1;
        
        const animate = () => {
            vy += gravity;
            x += vx;
            y += vy;
            opacity -= 0.02;
            
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.opacity = opacity;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                confetti.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Ripple effect for buttons
    addRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    // Floating hearts for favorite activities
    floatHeart(element) {
        const heart = document.createElement('div');
        const rect = element.getBoundingClientRect();
        
        heart.innerHTML = '❤️';
        heart.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top}px;
            font-size: 24px;
            pointer-events: none;
            z-index: 9999;
            animation: float-up 2s ease-out forwards;
        `;
        
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 2000);
    }
    
    // Wiggle animation for attention
    wiggle(element) {
        element.style.animation = 'wiggle 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
    
    // Smooth number counter animation
    countUp(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * this.easeOutQuad(progress));
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
    
    // Easing function for smooth animations
    easeOutQuad(t) {
        return t * (2 - t);
    }
    
    // Sound effects (optional, requires audio files)
    playSound(type) {
        if (!this.sounds) {
            this.sounds = {
                success: '/sounds/success.mp3',
                click: '/sounds/click.mp3',
                whoosh: '/sounds/whoosh.mp3'
            };
        }
        
        // Only play if user has interacted with the page
        if (document.hidden || !document.hasFocus()) return;
        
        try {
            const audio = new Audio(this.sounds[type]);
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore autoplay errors
        } catch (e) {
            // Ignore audio errors
        }
    }
    
    // Initialize animations
    init() {
        // Add ripple effect to all buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn-primary, .btn-secondary');
            if (button) {
                const mockEvent = { ...e, currentTarget: button };
                this.addRipple(mockEvent);
            }
        });
        
        // Add CSS animations
        if (!document.getElementById('family-animations-css')) {
            const style = document.createElement('style');
            style.id = 'family-animations-css';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                
                @keyframes float-up {
                    0% {
                        transform: translateY(0) scale(0);
                        opacity: 1;
                    }
                    50% {
                        transform: translateY(-20px) scale(1.2);
                    }
                    100% {
                        transform: translateY(-60px) scale(0.8);
                        opacity: 0;
                    }
                }
                
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-5deg); }
                    75% { transform: rotate(5deg); }
                }
                
                @keyframes slide-in-bottom {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fade-in-scale {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-slide-in {
                    animation: slide-in-bottom 0.3s ease-out;
                }
                
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.3s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Create global instance
export const animations = new FamilyAnimations();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => animations.init());
} else {
    animations.init();
}
