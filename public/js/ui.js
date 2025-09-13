import { currentData, currentCategoryFilter, currentTimeFilter, newlyAddedItems, clearNewlyAddedItems } from './Main.js';
import { fetchAndRenderWeather } from './services.js';
import { getFormattedOpeningHours, getStatusClass, getWeatherInfo } from './utils.js';
import { initMap } from './Map.js';
import { showFlowLoading, hideFlowLoading, showFlowProgress, showFlowFeedback, showFlowSuccess, handleFlowError } from './handlers.js';

// Import new modules for enhanced UI
import { AnimationManager } from './animations.js';
import { ToastManager } from './toast.js';
import { LoadingManager } from './loading.js';

// Helper functions for enhanced packing categories
function getCategoryIcon(category) {
    const iconMap = {
        'בגדים': '👕',
        'נעליים': '👟',
        'ציוד אישי': '🧴',
        'ציוד לתינוק': '🍼',
        'ציוד רפואי': '🏥',
        'מסמכים': '📄',
        'אלקטרוניקה': '📱',
        'ציוד נוסף': '🎒',
        'אוכל ושתייה': '🍎',
        'צעצועים': '🧸'
    };
    return iconMap[category] || '📦';
}

function getItemPriority(item) {
    if (item.priority === 'high' || item.essential) return 'priority-high';
    if (item.priority === 'medium') return 'priority-medium';
    return 'priority-low';
}

function getPriorityIcon(item) {
    if (item.priority === 'high' || item.essential) return '🔴';
    if (item.priority === 'medium') return '🟡';
    return '🟢';
}

// Fun Facts functionality for the hero section
export function initFunFacts() {
    const funFactBtn = document.getElementById('fun-fact-btn');
    const funFactResult = document.getElementById('fun-fact-result');
    const funFactContent = document.getElementById('fun-fact-content');
    
    if (!funFactBtn || !funFactResult || !funFactContent) return;
    
    const funFacts = [
        "בשוויץ יש יותר פסגות הרים גבוהות מכל מדינה אחרת באירופה.",
        "לא חוקי להחזיק רק חזיר ים אחד בשוויץ; הם נחשבים חיות חברתיות וחייבים להיות בזוגות.",
        "שוויץ היא אחת משתי המדינות היחידות בעולם עם דגל ריבועי.",
        "אלברט איינשטיין פיתח את תורת היחסות המפורסמת שלו, E=mc², בזמן שעבד בברן, שוויץ.",
        "שוויץ היא המדינה היחידה בעולם עם דמוקרטיה ישירה ברמה הלאומית.",
        "השעון השוויצרי המפורסם ביותר בעולם נמצא בתחנת הרכבת של ז'נבה.",
        "שוויץ מייצרת יותר שוקולד מכל מדינה אחרת בעולם.",
        "בשוויץ יש יותר מ-1,500 אגמים, מה שהופך אותה לאחת המדינות עם הכי הרבה אגמים באירופה."
    ];

    let factVisible = false;

    funFactBtn.addEventListener('click', () => {
        factVisible = !factVisible;
        if(factVisible) {
            const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
            funFactContent.textContent = randomFact;
            funFactResult.classList.remove('hidden');
            
            // Add a subtle animation when showing the fact
            funFactResult.style.opacity = '0';
            funFactResult.style.transform = 'translateY(10px)';
            setTimeout(() => {
                funFactResult.style.transition = 'all 0.3s ease-out';
                funFactResult.style.opacity = '1';
                funFactResult.style.transform = 'translateY(0)';
            }, 10);
        } else {
            funFactResult.style.transition = 'all 0.3s ease-out';
            funFactResult.style.opacity = '0';
            funFactResult.style.transform = 'translateY(10px)';
            setTimeout(() => {
                funFactResult.classList.add('hidden');
            }, 300);
        }
    });
}

// CTA Button functionality for "Let's start the adventure!"
export function initCTAButton() {
    const ctaButton = document.querySelector('.btn-cta-themed');
    
    if (!ctaButton) return;
    
    ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Add visual feedback
        ctaButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            ctaButton.style.transform = 'scale(1.05)';
        }, 150);
        
        // Show loading state
        const originalText = ctaButton.textContent;
        ctaButton.textContent = 'מתחילים את ההרפתקה... 🚀';
        ctaButton.style.pointerEvents = 'none';
        
        // Scroll to plan section with smooth animation
        const planSection = document.getElementById('plan');
        if (planSection) {
            // Add a small delay for better UX
            setTimeout(() => {
                planSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Add highlight effect to the plan section
                planSection.style.transition = 'all 0.5s ease-out';
                planSection.style.boxShadow = '0 0 30px rgba(13, 148, 136, 0.3)';
                planSection.style.transform = 'scale(1.02)';
                
                // Remove highlight after animation
                setTimeout(() => {
                    planSection.style.boxShadow = '';
                    planSection.style.transform = '';
                }, 2000);
                
                // Restore button state
                setTimeout(() => {
                    ctaButton.textContent = originalText;
                    ctaButton.style.pointerEvents = 'auto';
                    ctaButton.style.transform = '';
                }, 1000);
                
            }, 500);
        } else {
            // Fallback: scroll to top of activities section
            const activitiesSection = document.getElementById('activities');
            if (activitiesSection) {
                setTimeout(() => {
                    activitiesSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Restore button state
                    setTimeout(() => {
                        ctaButton.textContent = originalText;
                        ctaButton.style.pointerEvents = 'auto';
                        ctaButton.style.transform = '';
                    }, 1000);
                }, 500);
            } else {
                // Final fallback: restore button state
                setTimeout(() => {
                    ctaButton.textContent = originalText;
                    ctaButton.style.pointerEvents = 'auto';
                    ctaButton.style.transform = '';
                }, 1000);
            }
        }
        
        // Show success toast
        if (window.familyToast) {
            setTimeout(() => {
                window.familyToast.success('בואו נתחיל לתכנן את הטיול המושלם! 🎯');
            }, 1500);
        }
    });
}

// Family-Friendly Animations & Effects
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
        let currentX = x;
        let currentY = y;
        
        const animate = () => {
            currentX += vx;
            currentY += vy;
            vy += gravity;
            opacity -= 0.02;
            
            confetti.style.left = currentX + 'px';
            confetti.style.top = currentY + 'px';
            confetti.style.opacity = opacity;
            
            if (opacity > 0 && currentY < window.innerHeight + 100) {
                requestAnimationFrame(animate);
            } else {
                confetti.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Ripple effect for button clicks
    addRipple(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    // Floating heart animation
    floatHeart(element) {
        const heart = document.createElement('div');
        heart.innerHTML = '💖';
        heart.style.cssText = `
            position: absolute;
            font-size: 20px;
            pointer-events: none;
            z-index: 1000;
            animation: floatHeart 2s ease-out forwards;
        `;
        
        const rect = element.getBoundingClientRect();
        heart.style.left = rect.left + rect.width / 2 + 'px';
        heart.style.top = rect.top + 'px';
        
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
    
    // Count up animation
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
    
    easeOutQuad(t) {
        return t * (2 - t);
    }
    
    // Play sound effects (optional)
    playSound(type) {
        // Only play sounds if user hasn't disabled them
        if (localStorage.getItem('soundsEnabled') !== 'false') {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch (type) {
                case 'success':
                    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                    break;
                case 'error':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    break;
                case 'click':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    }
    
    init() {
        // Add CSS animations if not already present
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
                
                @keyframes floatHeart {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) scale(1.5);
                        opacity: 0;
                    }
                }
                
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-5deg); }
                    75% { transform: rotate(5deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize animations
const familyAnimations = new FamilyAnimations();
familyAnimations.init();

// Export for use in other modules
export { familyAnimations };

// Family-Friendly Toast Notifications
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
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }
    
    show(message, type = 'info', duration = 5000) {
        this.init();
        
        const toast = document.createElement('div');
        const toastId = `toast-${Date.now()}`;
        toast.id = toastId;
        toast.className = `
            max-w-sm w-full bg-sage-50 rounded-2xl shadow-2xl p-4 
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
            success: 'border-l-4 border-mint-500',
            error: 'border-l-4 border-rose-500',
            warning: 'border-l-4 border-amber-500',
            info: 'border-l-4 border-sage-500',
            love: 'border-l-4 border-rose-500',
            star: 'border-l-4 border-amber-400',
            rocket: 'border-l-4 border-sage-500',
            gift: 'border-l-4 border-mint-500'
        };
        return classes[type] || classes.info;
    }
    
    getProgressGradient(type) {
        const gradients = {
            success: 'from-mint-400 to-mint-600',
            error: 'from-rose-400 to-rose-600',
            warning: 'from-amber-400 to-amber-600',
            info: 'from-sage-400 to-sage-600',
            love: 'from-rose-400 to-rose-600',
            star: 'from-amber-300 to-amber-500',
            rocket: 'from-sage-400 to-sage-600',
            gift: 'from-mint-400 to-mint-600'
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

export function renderAllComponents() {
    console.log('🎨 renderAllComponents called, currentData:', !!currentData);
    
    try {
        // Show loading state for component rendering
        if (window.loadingManager) {
            window.loadingManager.showGlobal('מכין את הממשק...');
        }
        
        // Always render basic components, even without Firebase data
        console.log('🔧 Rendering basic components...');
    renderMobileMenu();
    renderQuickStatus();
        fetchAndRenderWeather();
        renderDailySpecial();
        
        // Only render Firebase-dependent components if data is available
        if (currentData) {
            console.log('✅ Rendering Firebase-dependent components');
            renderBookingInfo();
    renderPhotoAlbum();
    renderBulletinBoard();
    renderFamilyMemories();
    renderInteractivePackingList();
    renderPackingPhotosGallery();
    renderItinerary();
    renderActivities();
    initMap();
    clearNewlyAddedItems();
        } else {
            console.log('⚠️ No currentData available, rendering fallback content');
            renderFallbackContent();
        }
        
        console.log('✅ All components rendered successfully');
        
        // Hide loading state and show success
        if (window.loadingManager) {
            window.loadingManager.hideGlobal();
        }
        
        if (window.toastManager) {
            window.toastManager.success('הממשק נטען בהצלחה!');
        }
        
        // Add entrance animations to main sections
        if (window.animationManager) {
            setTimeout(() => {
                document.querySelectorAll('section').forEach((section, index) => {
                    window.animationManager.animateElement(section, 'fade-in', index * 0.1);
                });
            }, 500);
        }
        
    } catch (error) {
        console.error('❌ Error in renderAllComponents:', error);
        
        // Hide loading state on error
        if (window.loadingManager) {
            window.loadingManager.hideGlobal();
        }
        
        if (window.toastManager) {
            window.toastManager.error('שגיאה בטעינת הממשק');
        }
        
        // Ensure fallback content is shown on error
        renderFallbackContent();
    }
}

// Render fallback content when Firebase data isn't available
function renderFallbackContent() {
    // Render basic itinerary
    const itineraryContainer = document.getElementById('itinerary-container');
    if (itineraryContainer) {
        itineraryContainer.innerHTML = `
            <div class="bg-sage-50 p-6 rounded-xl shadow-lg border-r-4 border-accent">
                <h3 class="font-bold text-2xl mb-4 text-gray-800">טוען נתונים...</h3>
                <p class="text-gray-600">מתחבר לשרת לטעינת תוכנית הטיול...</p>
                <div class="mt-4">
                    <div class="animate-pulse bg-gray-200 h-4 rounded mb-2"></div>
                    <div class="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
            </div>
        `;
    }
    
    // Render basic activities
    const activitiesContainer = document.getElementById('activities-container');
    if (activitiesContainer) {
        activitiesContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-sage-50 rounded-xl shadow-lg overflow-hidden">
                    <div class="p-6">
                        <h3 class="font-bold text-xl mb-2">טוען פעילויות...</h3>
                        <p class="text-gray-600">מביא את הפעילויות הכי מומלצות בז'נבה</p>
                        <div class="mt-4">
                            <div class="animate-pulse bg-gray-200 h-3 rounded mb-2"></div>
                            <div class="animate-pulse bg-gray-200 h-3 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Show connection status in navigation bar (desktop and mobile)
    const statusElement = document.getElementById('nav-weather');
    if (statusElement) {
        statusElement.innerHTML = 'מתחבר...';
    }
    
    const mobileStatusElement = document.getElementById('mobile-nav-weather');
    if (mobileStatusElement) {
        mobileStatusElement.innerHTML = 'מתחבר...';
    }
}

function renderMobileMenu() {
    // Mobile menu is already properly structured in HTML
    // No need to regenerate it dynamically
    // This function is kept for compatibility but does nothing
    return;
}

function renderBookingInfo() {
    const bookingRef = document.getElementById('booking-ref-display');
    const hotelName = document.getElementById('hotel-name-display');
    const hotelBookingRef = document.getElementById('hotel-booking-ref-display');
    
    if (bookingRef && currentData.flightData) {
        bookingRef.textContent = `מספר הזמנה: ${currentData.flightData.bookingRef}`;
    }
    if (hotelName && currentData.hotelData) {
        hotelName.textContent = currentData.hotelData.name;
    }
    if (hotelBookingRef && currentData.hotelData) {
        hotelBookingRef.textContent = `מספר הזמנה: ${currentData.hotelData.bookingRef}`;
    }
}

function renderItinerary() {
    const container = document.getElementById('itinerary-container');
    if (!container) return;
    
    // Debug logging
    console.log('Rendering itinerary, currentData.itineraryData:', currentData.itineraryData);
    console.log('Available activities data:', currentData.activitiesData);
    
    if (!currentData.itineraryData || !Array.isArray(currentData.itineraryData)) {
        container.innerHTML = '<div class="text-center py-8 text-gray-600">טוען תכנית יומית...</div>';
        return;
    }
    
    // Helper function to render activity details
    const renderActivityDetails = (item) => {
        // If item has an activityId, look up the full activity details
        if (item.activityId && currentData.activitiesData) {
            const activity = currentData.activitiesData.find(a => a.id === item.activityId);
            if (activity) {
                const googleMapsUrl = activity.lat && activity.lon ? 
                    `https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lon}` : null;
                
            return `
                    <div class="activity-detail-card bg-sage-50 border border-sage-200 p-4 rounded-lg mb-2">
                        <h5 class="font-bold text-sage-800">${activity.name}</h5>
                        <div class="text-sm text-gray-700 mt-2 space-y-1">
                            <div><strong>⏱️ זמן נסיעה:</strong> ${activity.time || 'לא ידוע'} דקות</div>
                            ${activity.transport ? `<div><strong>🚌 תחבורה:</strong> ${activity.transport}</div>` : ''}
                            ${activity.address ? `<div><strong>📍 כתובת:</strong> ${activity.address}</div>` : ''}
                            ${activity.cost ? `<div><strong>💰 עלות:</strong> ${activity.cost}</div>` : ''}
                            ${activity.description ? `<div class="mt-2"><strong>תיאור:</strong> ${activity.description}</div>` : ''}
                            ${googleMapsUrl ? `<div class="mt-2"><a href="${googleMapsUrl}" target="_blank" class="text-sage-600 underline text-sm">🗺️ נווט באפליקציה</a></div>` : ''}
                        </div>
                    </div>
                `;
            }
        }
        
        // Fallback to simple description
        return `<li>${item.description || item}</li>`;
    };
    
    container.innerHTML = currentData.itineraryData.map(day => `
        <div class="bg-sage-50 p-6 rounded-xl shadow-lg border-r-4 border-accent" data-day-index="${day.dayIndex || day.day}">
            <h3 class="font-bold text-2xl mb-4 text-gray-800">${day.dayName} - ${day.date}</h3>
            <h4 class="text-lg font-semibold text-gray-700 mb-4">${day.title}</h4>
            <div class="space-y-4">
                ${day.mainPlan && day.mainPlan.items ? `
            <div>
                        <h4 class="font-semibold text-lg text-accent">${day.mainPlan.title || 'תוכנית עיקרית:'}</h4>
                        <div class="mt-2 space-y-2">
                            ${day.mainPlan.items.map(item => renderActivityDetails(item)).join('')}
                        </div>
                    </div>
                ` : ''}
                ${day.alternativePlan && day.alternativePlan.items ? `
                    <div class="border-t pt-4">
                        <h4 class="font-semibold text-lg text-gray-600">${day.alternativePlan.title || 'אפשרות חלופית:'}</h4>
                        <div class="mt-2 space-y-2">
                            ${day.alternativePlan.items.map(item => renderActivityDetails(item)).join('')}
                        </div>
                    </div>
                ` : ''}
                ${day.alternativePlan2 && day.alternativePlan2.items ? `
                    <div class="border-t pt-4">
                        <h4 class="font-semibold text-lg text-gray-600">${day.alternativePlan2.title || 'אפשרות נוספת:'}</h4>
                        <div class="mt-2 space-y-2">
                            ${day.alternativePlan2.items.map(item => renderActivityDetails(item)).join('')}
                        </div>
                    </div>
                ` : ''}
                                <div class="border-t pt-6 mt-6">
                            <h5 class="text-sm font-semibold text-gray-600 mb-4 text-center">פעולות חכמות ליום זה</h5>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                                <button class="btn btn-primary gemini-plan-btn text-sm md:text-base" data-day-index="${day.dayIndex || day.day}">
                                    <span class="flex items-center justify-center gap-1 md:gap-2">
                                        <span class="text-base md:text-lg">✨</span>
                                        <span class="whitespace-nowrap">תכנן בוקר</span>
                                    </span>
                                </button>
                                <button class="btn btn-secondary gemini-summary-btn text-sm md:text-base" data-day-index="${day.dayIndex || day.day}">
                                    <span class="flex items-center justify-center gap-1 md:gap-2">
                                        <span class="text-base md:text-lg">📝</span>
                                        <span class="whitespace-nowrap">סכם לילדים</span>
                                    </span>
                                </button>
                                <button class="btn btn-accent gemini-story-btn text-sm md:text-base" data-day-index="${day.dayIndex || day.day}">
                                    <span class="flex items-center justify-center gap-1 md:gap-2">
                                        <span class="text-base md:text-lg">📖</span>
                                        <span class="whitespace-nowrap">סיפור לילדים</span>
                                    </span>
                                </button>
                                <button class="btn btn-warm swap-activity-btn text-sm md:text-base" data-day-index="${day.dayIndex || day.day}">
                                    <span class="flex items-center justify-center gap-1 md:gap-2">
                                        <span class="text-base md:text-lg">🔄</span>
                                        <span class="whitespace-nowrap">החלף פעילות</span>
                                    </span>
                                </button>
                </div>
            </div>
                <div class="gemini-plan-result hidden mt-6 p-4 bg-gradient-to-r from-sage-50 to-mint-50 border border-sage-200 rounded-lg">
                            <div class="flex justify-between items-center mb-3">
                                <h6 class="font-semibold text-sage-800">תוצאת הבינה המלאכותית</h6>
                                <button class="close-result-btn text-sage-400 hover:text-sage-600 transition-colors duration-200" data-target="gemini-plan-result">✕</button>
                            </div>
                            <div class="result-content"></div>
                        </div>
                ${day.soloTip ? `
                    <div class="border-t pt-4 mt-4 bg-sage-50 border-l-4 border-sage-400 p-4 rounded-lg">
                        <h4 class="font-semibold text-lg text-sage-800">💡 טיפ להורה יחיד</h4>
                        <p class="mt-2 text-sage-700 text-sm">${day.soloTip}</p>
                    </div>
                ` : ''}
            </div>
            </div>
    `).join('');
}

// Helper function to get real images for known places, fallback to category-based images
function getActivityImage(category, name) {
    // Real images for known places in Geneva
    const realImages = {
        'Just Bloom': 'https://lh3.googleusercontent.com/p/AF1QipMXnZC1n-voXjVFzSsI3FgGFAaurrGx_U0qD-Vm=w408-h544-k-no',
        'Vitam Parc': 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqJpKF7GxCaLnlYnWlBrI7rDgldY3g6-4OBKZY9Z8nTeMDZV4S10z0A_NrNDZxNGIrHk3H3u6Ps8IAVpEeXPdeuEIr_7BUicVnCZUsngmqrhFLz9HI_okiyJaLYFypOCgiv-lw=w408-h306-k-no',
        'C5 Kids Party': 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4noS5YpRDqNpFkhUsOLUKYy5cTv-iqGnL7GrWy_Rl155uTjkNrNp_RnhsMHV8i3yBEtrLCts8Nw6j5V1yEkxWi9YbsfplcyPYWgY_6OgrTQkFI2pH3WfURz6soSHJV8UTgAwY3KY=w203-h152-k-no',
        'Bubbles Kids Club': 'https://bubblesclub.ch/wp-content/uploads/2023/02/Bubbles-kids-scaled.jpg',
        'TOTEM Escalade': 'https://lh3.googleusercontent.com/p/AF1QipPAyNsS1b9S8-9fhBGMa7eFnMVQOnktiirzokOj=w408-h305-k-no',
        'Airloop': 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4noj60sKpcHQbwJ9tTwVnjAbkRyN0GPav27xbET_wSLWzz7VdcpVyFuqo5n-eWCeRyqXmYNNo-yD9afsILY6_9bzIu7ioNuHAq8oWnfoBWyB01yMUVFoxiKfKyfBOzDblAdON_E=w426-h240-k-no',
        'מוזיאון הטבע': 'https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=Rq9p9JmZtBfCTSYUq8--eA&cb_client=search.gws-prod.gps&w=408&h=240&yaw=57.40184&pitch=0&thumbfov=100',
        'La Maison de la Créativité': 'https://lh3.googleusercontent.com/p/AF1QipPJpFGXygKM8Z2YGwbFe3OHb_pghexQ8VxZS6XA=w408-h306-k-no',
        'MAMCO': 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrinx_hH6m4bTvOHy2IU8E8V-p50vx4AJFLArKyCty2A1rS_qDzss6AtDFz5B5xrJutAHIVdgrMttDo5j39VZ4gPEH0fm3bbeEJB1F7cTzwRi8ef1_IbGXQYuPoL5BP6jTejfPD=w408-h543-k-no',
        'תיאטרון הבובות': 'https://www.marionnettes.ch/sites/default/files/styles/w1024/public/spectacles/2021-03/2019_TMG_LaPromesse_c_Eliphas_01.jpg?itok=zQ-a-6xJ',
        'Ludothèque de Meyrin': 'https://lh3.googleusercontent.com/p/AF1QipNQtGaxn5GS5hNT6lNRGoPGq96K3t3fwyNv3ESJ=w408-h306-k-no',
        'גן החיות של ז\'נבה': 'https://images.unsplash.com/photo-1549366021-9f761d77f8e0?w=400',
        'פארק באסטיון': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400'
    };
    
    // Check for exact name match first
    if (realImages[name]) {
        return realImages[name];
    }
    
    // Fallback to category-based images with better quality
    const categoryImages = {
        'משחקייה': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
        'תרבות': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center',
        'קפה': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop&crop=center',
        'חוץ': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center',
        'מוזיאונים': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center',
        'פארקים': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center',
        'אטרקציות': 'https://images.unsplash.com/photo-1549366021-9f761d77f8e0?w=400&h=300&fit=crop&crop=center',
        'מסעדות': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center',
        'קניות': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center',
        'תחבורה': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop&crop=center',
        'נוף': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
        'ספורט': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
        'בידור': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
        'טבע': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center',
        'משפחתי': 'https://images.unsplash.com/photo-1549366021-9f761d77f8e0?w=400&h=300&fit=crop&crop=center'
    };
    
    return categoryImages[category] || categoryImages['משפחתי'];
}

export function renderActivities() {
    const activitiesGrid = document.getElementById('activities-grid');
    if (!activitiesGrid) return;
    
    // Debug logging
    console.log('Rendering activities, currentData.activitiesData:', currentData.activitiesData);
    
    if (!currentData.activitiesData || !Array.isArray(currentData.activitiesData)) {
        activitiesGrid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-600">טוען פעילויות...</div>';
        return;
    }
    
    let filteredActivities = currentData.activitiesData;
    
    // Apply category filter
    if (currentCategoryFilter && currentCategoryFilter !== 'all') {
        filteredActivities = filteredActivities.filter(activity => 
            activity.category === currentCategoryFilter);
    }
    
    // Apply time filter
    if (currentTimeFilter && currentTimeFilter !== 'all') {
        filteredActivities = filteredActivities.filter(activity => {
            const travelTime = parseInt(activity.time || activity.travelTime) || 0;
            switch (currentTimeFilter) {
                case '20':
                    return travelTime <= 20;
                case '40':
                    return travelTime > 20 && travelTime <= 40;
                case '60':
                    return travelTime > 40;
                default:
                    return true;
            }
        });
    }
    
    const showNewItemsHighlight = (newlyAddedItems && typeof newlyAddedItems.size === 'number') ? newlyAddedItems.size > 0 : false;
    
    // Show load more button if there are more activities to show or we can generate more
    const displayedActivities = window.displayedActivitiesCount || 6;
    const activitiesToShow = filteredActivities.slice(0, displayedActivities);
    const hasMoreCached = displayedActivities < filteredActivities.length;
    const canGenerateMore = true; // Always allow AI generation of more activities
    
    activitiesGrid.innerHTML = activitiesToShow.map(activity => {
        const isNewItem = showNewItemsHighlight && newlyAddedItems.has(activity.name);
        const formattedHours = getFormattedOpeningHours(activity);
        const travelTime = activity.time || activity.travelTime || 'לא ידוע';
        const googleMapsUrl = activity.lat && activity.lon ? 
            `https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lon}` : null;
        
        // Add sample image for activities that don't have one
        const activityImage = activity.image || getActivityImage(activity.category, activity.name);
        
    return `
            <div class="activity-card bg-sage-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${isNewItem ? 'new-item-highlight' : ''}" 
                 data-category="${activity.category}" data-travel-time="${activity.time || '0'}" data-activity-id="${activity.id || activity.name}">
                
                ${activityImage ? `
                    <div class="relative h-48 overflow-hidden">
                        <img src="${activityImage}" 
                             alt="${activity.name}" 
                             class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                             onerror="this.onerror=null; this.src='https://placehold.co/400x300/F3EFEA/4A4A4A?text=${encodeURIComponent(activity.name)}'; this.alt='${activity.name} - תמונה לא זמינה';"
                             loading="lazy">
                        <div class="absolute top-2 right-2">
                            <span class="category-badge ${activity.category} px-2 py-1 text-xs rounded-full">${activity.category}</span>
                        </div>
                        ${activity.generated ? '<div class="absolute top-2 left-2 bg-sage-500 text-white px-2 py-1 text-xs rounded-full">🤖 AI</div>' : ''}
                    </div>
                ` : ''}
                
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="font-bold text-lg text-gray-800 leading-tight">${activity.name}</h3>
                        ${!activityImage ? `<span class="category-badge ${activity.category}">${activity.category}</span>` : ''}
                    </div>
                    
                    <div class="space-y-2 mb-4">
                        <p class="text-sm text-gray-600"><strong>⏱️ זמן נסיעה:</strong> ${travelTime} דקות</p>
                        <p class="text-sm"><strong>🕒 שעות:</strong> ${formattedHours.today}</p>
                        ${activity.cost ? `<p class="text-sm"><strong>💰 עלות:</strong> ${activity.cost}</p>` : ''}
                        ${activity.transport ? `<p class="text-sm"><strong>🚌 תחבורה:</strong> ${activity.transport}</p>` : ''}
                        ${activity.address ? `<p class="text-sm text-gray-500"><strong>📍 כתובת:</strong> ${activity.address}</p>` : ''}
                    </div>
                    
                    ${activity.description ? `<p class="text-gray-700 text-sm mb-4 line-clamp-3">${activity.description}</p>` : ''}
                    
                    ${activity.whatToBring && activity.whatToBring.length > 0 ? `
                        <div class="text-xs text-gray-600 mb-4 bg-sage-50 p-3 rounded-lg">
                            <strong>💡 מה לקחת:</strong> ${activity.whatToBring.join(', ')}
                        </div>
                    ` : ''}
                    
                    <div class="flex flex-wrap gap-2 justify-between md:justify-stretch">
                        ${activity.link ? `<a href="${activity.link}" target="_blank" class="btn btn-primary text-xs flex-1 md:flex-none md:flex-grow text-center">לאתר הרשמי</a>` : ''}
                        ${googleMapsUrl ? `<a href="${googleMapsUrl}" target="_blank" class="btn btn-accent text-xs flex-1 md:flex-none md:flex-grow text-center">🗺️ נווט</a>` : ''}
                        <button class="btn btn-filter activity-details-btn text-xs flex-1 md:flex-none md:flex-grow text-center" data-activity-id="${activity.id || activity.name}">
                            👁️ פרטים
                        </button>
                    </div>
                </div>
            </div>
    `;
    }).join('');
    
    // Show/hide load more button
    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) {
        // Always show load more button if we have activities and can generate more
        if (filteredActivities.length > 0 && canGenerateMore) {
            loadMoreContainer.classList.remove('hidden');
            const button = document.getElementById('load-more-btn');
            if (button) {
                if (hasMoreCached) {
                    button.innerHTML = `
                        <span class="flex items-center justify-center gap-2">
                            <span class="text-lg">🎈</span>
                            <span class="whitespace-nowrap">טען עוד פעילויות (${filteredActivities.length - displayedActivities} נותרו)</span>
                        </span>
                    `;
                } else {
                    button.innerHTML = `
                        <span class="flex items-center justify-center gap-2">
                            <span class="text-lg">🤖</span>
                            <span class="whitespace-nowrap">צור פעילויות חדשות עם AI</span>
                        </span>
                    `;
                }
                button.disabled = false;
                button.className = 'btn btn-accent';
                button.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        } else {
            loadMoreContainer.classList.add('hidden');
            const button = document.getElementById('load-more-btn');
            if (button) {
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }
}

// Packing list management
export function renderPackingGuide() {
    console.log('📦 renderPackingGuide called');
    const modal = document.getElementById('packing-guide-modal');
    if (!modal) {
        console.error('❌ Packing modal not found');
        return;
    }
    console.log('✅ Packing modal found, rendering content...');
    
    const modalContent = modal.querySelector('#packing-modal-content');
    console.log('🔍 Looking for modal content element:', modalContent);
    
    // Add interactive packing functionality to modal content
    if (!modalContent) {
        console.error('❌ Modal content element not found');
        return;
    }
    console.log('✅ Modal content element found, rendering...');
    
    // Default packing list if no Firebase data
    const defaultPackingList = {
        "מסמכים וכסף": [
            { name: "דרכונים", checked: false },
            { name: "צילומי דרכונים", checked: false },
            { name: "כרטיסי טיסה", checked: false },
            { name: "אישורי מלון", checked: false },
            { name: "רישיון נהיגה", checked: false },
            { name: "ביטוח נסיעות", checked: false },
            { name: "כסף מקומי (פרנק שוויצרי)", checked: false },
            { name: "כרטיסי אשראי", checked: false }
        ],
        "ביגוד (מבוגרים)": [
            { name: "מעיל גשם/רוח", checked: false },
            { name: "פליז/סווטשירט (3)", checked: false },
            { name: "חולצות קצרות (5)", checked: false },
            { name: "חולצות ארוכות (2)", checked: false },
            { name: "מכנסיים ארוכים (2)", checked: false },
            { name: "בגדי ערב (1)", checked: false },
            { name: "הלבשה תחתונה וגרביים (6 סטים)", checked: false }
        ],
        "ביגוד (ילדים)": [
            { name: "מעיל", checked: false },
            { name: "פליז/סווטשירט (3)", checked: false },
            { name: "חולצות קצרות (6)", checked: false },
            { name: "חולצות ארוכות (3)", checked: false },
            { name: "מכנסיים ארוכים (4)", checked: false },
            { name: "פיג'מות (2)", checked: false },
            { name: "גרביים ותחתונים (8 סטים)", checked: false },
            { name: "בגדי ים", checked: false },
            { name: "כובע ומשקפי שמש לכל ילד", checked: false },
            { name: "נעליים נוחות וסנדלים", checked: false },
            { name: "2 סטים של בגדים להחלפה", checked: false }
        ],
        "היגיינה ותרופות": [
            { name: "תיק עזרה ראשונה", checked: false },
            { name: "תרופות אישיות", checked: false },
            { name: "משחת שיניים ומברשות", checked: false },
            { name: "שמפו וסבון", checked: false },
            { name: "קרם הגנה", checked: false },
            { name: "אלכוג'ל", checked: false },
            { name: "מלאי חיתולים ומגבונים לכל יום", checked: false },
            { name: "מדחום, אקמולי ונורופן", checked: false },
            { name: "משחת החתלה", checked: false }
        ],
        "ציוד לילדים": [
            { name: "עגלת יויו", checked: false },
            { name: "מנשא לתינוק", checked: false },
            { name: "שקית חטיפים", checked: false },
            { name: "בקבוק מים לכל ילד", checked: false },
            { name: "מוצצים", checked: false },
            { name: "תמ\"ל (במידת הצורך)", checked: false },
            { name: "2 צעצועים קטנים וספר", checked: false },
            { name: "שמיכה קטנה לכל ילד", checked: false }
        ],
        "אלקטרוניקה": [
            { name: "טלפונים ומטענים", checked: false },
            { name: "אוזניות", checked: false },
            { name: "מטען נייד", checked: false },
            { name: "מתאם לשקע אירופאי", checked: false }
        ]
    };
    
    // Use Firebase data if available, otherwise use default
    const packingData = (currentData && currentData.packingListData && typeof currentData.packingListData === 'object') 
        ? currentData.packingListData 
        : defaultPackingList;
    
    console.log('🎨 Setting modal content HTML...');
    modalContent.innerHTML = `
        <div class="packing-modal-content">
            <!-- Master List Section -->
            <section id="packing-master-list" class="packing-section">
                <div class="section-header">
                    <div class="section-icon">📋</div>
                    <div class="section-title-group">
                        <h2 class="section-title">רשימה מלאה</h2>
                        <p class="section-subtitle">כל הפריטים הדרושים לטיול משפחתי מושלם</p>
                    </div>
                </div>
                
                <div class="section-content">
                    <div class="content-intro">
                        <p class="intro-text">רשימה מקיפה של כל הפריטים הדרושים לטיול משפחתי בז'נבה עם פעוטות. סמנו כל פריט שארזתם כדי לעקוב אחר ההתקדמות.</p>
                    </div>
                    
                    <div class="packing-categories-grid">
                    ${Object.entries(packingData).map(([category, items], categoryIndex) => `
                            <div class="category-card" data-category-index="${categoryIndex}">
                                <div class="category-header">
                                    <div class="category-icon">${getCategoryIcon(category)}</div>
                                    <div class="category-info">
                                        <h3 class="category-title">${category}</h3>
                                        <div class="category-progress">
                                            <div class="progress-bar-container">
                                                <div class="progress-bar" data-category="${category}"></div>
                                            </div>
                                            <span class="category-count">0/${Array.isArray(items) ? items.length : 0}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="category-content">
                                    <div class="packing-items-container">
                                        <ul class="packing-items-list">
                                        ${Array.isArray(items) ? items.map((item, index) => `
                                                <li class="packing-item">
                                                    <label class="packing-item-label">
                                                        <input type="checkbox" class="packing-checkbox" 
                                                       data-category="${category}" data-index="${index}" 
                                                               ${item.checked ? 'checked' : ''}>
                                                        <span class="checkbox-custom">
                                                            <span class="checkmark">✓</span>
                                                        </span>
                                                        <span class="item-text">${item.name}</span>
                                                        <span class="item-priority ${getItemPriority(item)}">${getPriorityIcon(item)}</span>
                                                    </label>
                                                </li>
                                            `).join('') : '<li class="packing-item"><div class="packing-item-label"><span class="item-text">אין פריטים זמינים</span></div></li>'}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>

            <section id="packing-arsenal" class="scroll-mt-24">
                <h2 class="text-2xl font-bold mb-4 text-right">🎒 ארסנל הכבודה</h2>
                <div class="bg-gradient-to-br from-white to-sage-300 p-6 rounded-xl shadow-sm border border-sage-400">
                    <p class="text-gray-700 mb-4">הפריטים החיוניים ביותר שאסור לשכוח:</p>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-rose-300 border-r-4 border-rose-500 p-4 rounded">
                            <h4 class="font-bold text-gray-800 mb-2">🚨 חיוני ביותר</h4>
                            <ul class="text-sm space-y-1">
                                <li>• דרכונים + צילומים</li>
                                <li>• כרטיסי טיסה</li>
                                <li>• ביטוח נסיעות</li>
                                <li>• תרופות אישיות</li>
                                <li>• מטען נייד</li>
                            </ul>
                        </div>
                        <div class="bg-mint-300 border-r-4 border-mint-500 p-4 rounded">
                            <h4 class="font-bold text-gray-800 mb-2">👶 ציוד לילדים</h4>
                            <ul class="text-sm space-y-1">
                                <li>• עגלת יויו</li>
                                <li>• חיתולים + מגבונים</li>
                                <li>• מדחום + נורופן</li>
                                <li>• 2 סטים בגדי החלפה</li>
                                <li>• צעצועים + ספר</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section id="packing-vacuum-guide" class="scroll-mt-24">
                <h2 class="text-2xl font-bold mb-4 text-right">💨 מדריך אריזת ואקום</h2>
                <div class="bg-gradient-to-br from-white to-mint-300 p-6 rounded-xl shadow-sm border border-mint-400">
                    <div class="space-y-4">
                        <p class="text-gray-700">טיפים לחיסכון במקום בתיק:</p>
                        <div class="bg-mint-300 p-4 rounded-lg">
                            <h4 class="font-semibold text-gray-800 mb-2">✅ מתאים לואקום</h4>
                            <ul class="text-sm space-y-1">
                                <li>• פליזים וסווטשירטים</li>
                                <li>• פיג'מות</li>
                                <li>• הלבשה תחתונה</li>
                                <li>• מגבות (אם לוקחים)</li>
                            </ul>
                        </div>
                        <div class="bg-warm-300 p-4 rounded-lg">
                            <h4 class="font-semibold text-gray-800 mb-2">❌ לא לואקום</h4>
                            <ul class="text-sm space-y-1">
                                <li>• בגדי ים</li>
                                <li>• נעליים</li>
                                <li>• מעילים מרופדים</li>
                                <li>• מצפני חירום</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section id="packing-plan" class="scroll-mt-24">
                <h2 class="text-xl sm:text-2xl font-bold mb-4 text-right">📅 תכנית אריזה</h2>
                <div class="bg-gradient-to-br from-sage-300 to-mint-300 p-4 sm:p-6 rounded-xl shadow-lg border border-sage-400">
                    <div class="space-y-4">
                        <h4 class="font-bold text-lg text-gray-800 mb-4">לוח זמנים מומלץ:</h4>
                        <div class="space-y-2 sm:space-y-3">
                            <div class="flex flex-col sm:flex-row sm:items-center bg-sage-300 p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-sage-500 hover:shadow-md transition-shadow duration-200">
                                <span class="font-bold text-gray-800 text-sm sm:text-base mb-1 sm:mb-0 sm:w-28 sm:flex-shrink-0 flex items-center">
                                    <span class="w-2 h-2 bg-sage-500 rounded-full mr-2"></span>
                                    שבוע לפני:
                                </span>
                                <span class="text-gray-700 text-sm sm:text-base">רכישת פריטים חסרים, ארגון מסמכים</span>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center bg-mint-300 p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-mint-500 hover:shadow-md transition-shadow duration-200">
                                <span class="font-bold text-gray-800 text-sm sm:text-base mb-1 sm:mb-0 sm:w-28 sm:flex-shrink-0 flex items-center">
                                    <span class="w-2 h-2 bg-mint-500 rounded-full mr-2"></span>
                                    3 יום לפני:
                                </span>
                                <span class="text-gray-700 text-sm sm:text-base">אריזת בגדים וציוד בסיסי</span>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center bg-warm-300 p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-warm-500 hover:shadow-md transition-shadow duration-200">
                                <span class="font-bold text-gray-800 text-sm sm:text-base mb-1 sm:mb-0 sm:w-28 sm:flex-shrink-0 flex items-center">
                                    <span class="w-2 h-2 bg-warm-500 rounded-full mr-2"></span>
                                    יום לפני:
                                </span>
                                <span class="text-gray-700 text-sm sm:text-base">ביקורת אחרונה, תיק יד, מטענים</span>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center bg-rose-300 p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-rose-500 hover:shadow-md transition-shadow duration-200">
                                <span class="font-bold text-gray-800 text-sm sm:text-base mb-1 sm:mb-0 sm:w-28 sm:flex-shrink-0 flex items-center">
                                    <span class="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
                                    בוקר הטיסה:
                                </span>
                                <span class="text-gray-700 text-sm sm:text-base">ביקורת מסמכים, סגירת תיקים</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="packing-assistant" class="scroll-mt-24">
                <h2 class="text-2xl font-bold mb-4 text-right">🤖 עוזר חכם</h2>
                <div class="bg-sage-300 p-6 rounded-lg shadow-md border border-sage-400">
                    <div class="text-center">
                        <div class="bg-gradient-to-r from-rose-300 to-warm-300 p-6 rounded-xl mb-4">
                            <h4 class="font-bold text-gray-800 mb-2">📸 מתכנן אריזה חכם עם AI</h4>
                            <p class="text-sm text-gray-700 mb-4">העלו תמונות של המזוודות והפריטים שרוצים לארוז - הבינה המלאכותית תנתח ותציע תוכנית אריזה מותאמת אישית</p>
                            <div class="grid md:grid-cols-2 gap-4 mb-4">
                                <div class="text-center">
                                    <input type="file" id="luggage-photo-input" class="hidden" accept="image/*" multiple>
                                    <button id="upload-luggage-photo-btn" class="btn-primary-standard w-full">
                                        📷 תמונת מזוודות
                                    </button>
                                </div>
                                <div class="text-center">
                                    <input type="file" id="items-photo-input" class="hidden" accept="image/*" multiple>
                                    <button id="upload-items-photo-btn" class="btn-secondary-standard w-full">
                                        🎒 תמונת פריטים
                                    </button>
                                </div>
                            </div>
                            <div id="smart-packing-analysis" class="hidden mb-4 p-4 bg-sage-300 rounded-lg border border-sage-400">
                                <h5 class="font-semibold mb-2 text-gray-800">📊 ניתוח התמונות:</h5>
                                <div id="analysis-results"></div>
                            </div>
                            <button id="packing-ai-help-btn" class="btn-accent-standard w-full">
                                ✨ נתח תמונות וצור תוכנית אריזה חכמה
                            </button>
                        </div>
                    </div>
            </div>
            </section>

            <section id="packing-action-plan" class="scroll-mt-24">
                <h2 class="text-2xl font-bold mb-4 text-right">🎯 תכנית פעולה</h2>
                <div class="bg-sage-300 p-6 rounded-lg shadow-md border border-sage-400">
                    <div class="space-y-4">
                        <h4 class="font-semibold">רגע האמת - מה לעשות עכשיו:</h4>
                        <div class="bg-gradient-to-br from-sage-300 to-mint-300 p-4 sm:p-6 rounded-xl border border-sage-400 shadow-sm">
                            <ol class="space-y-3 sm:space-y-4">
                                <li class="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-sage-400 hover:shadow-md transition-shadow duration-200">
                                    <span class="flex-shrink-0 w-6 h-6 bg-sage-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                    <span class="text-sm sm:text-base text-gray-800 leading-relaxed">עבור על הרשימה המלאה למעלה וסמן כל פריט <span class="text-mint-600 font-semibold">✅</span></span>
                                </li>
                                <li class="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-sage-400 hover:shadow-md transition-shadow duration-200">
                                    <span class="flex-shrink-0 w-6 h-6 bg-sage-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    <span class="text-sm sm:text-base text-gray-800 leading-relaxed">הכן ערימה של בגדים לכל בן משפחה <span class="text-sage-600">👕</span></span>
                                </li>
                                <li class="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-sage-400 hover:shadow-md transition-shadow duration-200">
                                    <span class="flex-shrink-0 w-6 h-6 bg-sage-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                    <span class="text-sm sm:text-base text-gray-800 leading-relaxed">ארוז תיק עזרה ראשונה עם תרופות אישיות <span class="text-rose-600">💊</span></span>
                                </li>
                                <li class="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-sage-400 hover:shadow-md transition-shadow duration-200">
                                    <span class="flex-shrink-0 w-6 h-6 bg-sage-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                    <span class="text-sm sm:text-base text-gray-800 leading-relaxed">הכן תיק יד עם מסמכים וחטיפים <span class="text-sage-600">✈️</span></span>
                                </li>
                                <li class="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-sage-400 hover:shadow-md transition-shadow duration-200">
                                    <span class="flex-shrink-0 w-6 h-6 bg-sage-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                                    <span class="text-sm sm:text-base text-gray-800 leading-relaxed">שקול כל תיק - מקס' 23 ק"ג <span class="text-amber-600">🏋️‍♂️</span></span>
                                </li>
                                <li class="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-sage-400 hover:shadow-md transition-shadow duration-200">
                                    <span class="flex-shrink-0 w-6 h-6 bg-sage-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                                    <span class="text-sm sm:text-base text-gray-800 leading-relaxed">עשה תמונה של הדרכונים (גיבוי) <span class="text-rose-600">📸</span></span>
                                </li>
                                <li class="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-sage-400 hover:shadow-md transition-shadow duration-200">
                                    <span class="flex-shrink-0 w-6 h-6 bg-sage-500 text-white rounded-full flex items-center justify-center text-xs font-bold">7</span>
                                    <span class="text-sm sm:text-base text-gray-800 leading-relaxed">הורד אפליקציית תרגום (Google Translate) <span class="text-mint-600">🗣️</span></span>
                                </li>
                            </ol>
                        </div>
                        <div class="text-center pt-4">
                            <button class="btn-secondary-standard">
                                🎉 סיימתי לארוז - אני מוכן לטיול!
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Interactive Packing List Section -->
            <div class="mt-6 sm:mt-8 bg-gradient-to-br from-sage-50 to-mint-50 p-4 sm:p-6 rounded-xl border-2 border-sage-200 shadow-lg">
                <h2 class="text-xl sm:text-2xl font-bold text-sage-800 mb-3 sm:mb-4">🎒 רשימת האריזה האינטראקטיבית</h2>
                <p class="text-sage-600 text-sm sm:text-base mb-4 sm:mb-6">עקבו אחר מה כבר ארזתם ומה עוד נשאר. ניתן להוסיף פריטים אישיים לרשימה.</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div class="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-sage-100 hover:shadow-md transition-shadow duration-200">
                        <h3 class="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-sage-800">📝 הוסיפו פריט לרשימה</h3>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <input type="text" id="packing-item-input" class="flex-1 border border-sage-300 rounded-lg py-2 px-3 text-sm sm:text-base focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all duration-200" placeholder="למשל: משקפי שמש לילדים">
                            <button id="add-packing-item-btn" class="btn-primary-standard px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap">➕ הוסף</button>
                        </div>
                    </div>

                    <div class="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-rose-100 hover:shadow-md transition-shadow duration-200">
                        <h3 class="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-rose-800">📷 הוסיפו תמונת ציוד</h3>
                        <div class="text-center">
                            <input type="file" id="packing-photo-input" class="hidden" accept="image/*" multiple>
                            <button id="packing-photo-upload-btn" class="btn-accent-standard px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base">📸 צלמו ציוד</button>
                            <p class="text-xs text-rose-600 mt-1">תמונות של מזוודות, ציוד וכו'</p>
                        </div>
                    </div>
                    
                    <div class="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-mint-100 hover:shadow-md transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
                        <h3 class="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-mint-800">📊 התקדמות האריזה</h3>
                        <div class="w-full bg-mint-200 rounded-full h-4 sm:h-6 shadow-inner">
                            <div id="packing-overall-progress" class="bg-gradient-to-r from-mint-500 to-sage-500 h-4 sm:h-6 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm" style="width: 0%">0%</div>
                        </div>
                        <p class="text-xs text-mint-600 mt-1">עקבו אחר ההתקדמות שלכם</p>
                    </div>
                </div>

                <!-- Luggage Planner Section -->
                <div class="mb-4 sm:mb-6 bg-gradient-to-br from-warm-50 to-rose-50 p-4 sm:p-6 rounded-xl border-2 border-warm-200 shadow-lg">
                    <h3 class="font-bold text-lg sm:text-xl mb-4 sm:mb-6 text-center text-warm-800">👜 מתכנן המזוודות - חלוקה לפי בן משפחה</h3>
                    <div id="luggage-planner" class="space-y-3 sm:space-y-4">
                        <!-- Luggage assignments will be populated by JavaScript -->
                    </div>
                    <div class="mt-4 sm:mt-6 text-center">
                        <button id="optimize-luggage-btn" class="btn-secondary-standard px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base">🎯 אופטימיזציה אוטומטית</button>
                    </div>
                </div>

                <!-- Packing Photos Gallery -->
                <div id="packing-photos-section" class="mb-6 bg-gradient-to-br from-rose-50 to-warm-50 p-4 sm:p-6 rounded-xl border-2 border-rose-200 shadow-lg">
                    <h3 class="font-bold text-lg mb-4 text-center text-rose-800">📸 גלריית תמונות ציוד</h3>
                    <div id="packing-photos-gallery" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <!-- Packing photos will be populated by JavaScript -->
                    </div>
                    <div id="packing-photo-upload-progress" class="hidden mt-4">
                        <div class="w-full bg-rose-200 rounded-full h-2 shadow-inner">
                            <div id="packing-photo-progress-bar" class="bg-rose-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                        <p class="text-center text-sm text-rose-700 mt-2 font-medium">מעלה תמונות ציוד...</p>
                    </div>
                </div>
                
                <div id="interactive-packing-list" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Interactive packing list will be populated by JavaScript -->
                </div>
            </div>
            </div>
        `;
    
    // Update progress bar after rendering
    updatePackingProgress();
    
    // Add event listeners to checkboxes
    modal.querySelectorAll('.packing-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handlePackingCheckboxToggle);
    });
    
    // Enhanced navigation with active state management
    modal.querySelectorAll('.packing-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            modal.querySelectorAll('.packing-nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Smooth scroll to target
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = modal.querySelector(`#${targetId}`);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                // Add visual feedback
                targetElement.style.transform = 'scale(1.02)';
                targetElement.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    targetElement.style.transform = 'scale(1)';
                }, 300);
            }
        });
    });
    
    // Intersection Observer for automatic active state updates
    const observerOptions = {
        root: modal.querySelector('#packing-modal-content'),
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0.1
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const correspondingNav = modal.querySelector(`[href="#${sectionId}"]`);
                if (correspondingNav) {
                    modal.querySelectorAll('.packing-nav-link').forEach(l => l.classList.remove('active'));
                    correspondingNav.classList.add('active');
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections
    modal.querySelectorAll('section[id^="packing-"]').forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Render additional packing components
    setTimeout(() => {
        console.log('🔄 Rendering additional packing components...');
        renderInteractivePackingList();
        renderPackingPhotosGallery(); 
        renderLuggagePlanner();
        
        // Add event listeners for interactive elements
        setupPackingInteractiveElements();
        console.log('✅ Packing guide rendering completed');
    }, 100);
}

// Setup packing interactive elements
function setupPackingInteractiveElements() {
    // Handle packing checkbox changes  
    document.addEventListener('change', (e) => {
        if (e.target.matches('.packing-checkbox')) {
            const checkbox = e.target;
            const category = checkbox.dataset.category;
            const index = parseInt(checkbox.dataset.index);
            const itemIndex = parseInt(checkbox.dataset.itemIndex);
            
            // Handle category-based checkboxes (from main packing list)
            if (category && !isNaN(index)) {
                if (!currentData.packingListData) currentData.packingListData = {};
                if (!currentData.packingListData[category]) currentData.packingListData[category] = [];
                if (currentData.packingListData[category][index]) {
                    currentData.packingListData[category][index].checked = checkbox.checked;
                    updatePackingProgress();
                }
            }
            // Handle custom packing items
            else if (!isNaN(itemIndex) && currentData.customPackingItems && currentData.customPackingItems[itemIndex]) {
                currentData.customPackingItems[itemIndex].checked = checkbox.checked;
                updatePackingProgress();
            }
        }
    });
    
    // Handle add packing item - now handled by global event delegation in handlers.js
    
    // Handle photo uploads
    const photoInput = document.getElementById('packing-photo-input');
    if (photoInput) {
        photoInput.addEventListener('change', handlePackingPhotoUpload);
    }
    
    // Render initial components
    renderInteractivePackingList();
    renderPackingPhotosGallery();
}

// Handle packing photo upload
async function handlePackingPhotoUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    
    // Enhanced user feedback
    const loaderId = showFlowLoading('photo-upload', `מעלה ${files.length} תמונות...`);
    
    try {
    const progressContainer = document.getElementById('packing-photo-upload-progress');
    const progressBar = document.getElementById('packing-photo-progress-bar');
    
    if (progressContainer) progressContainer.classList.remove('hidden');
    
        // Import Firebase functions dynamically
        const { ref, uploadBytes, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js");
        const { doc, updateDoc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            try {
                // Enhanced progress feedback
                showFlowProgress('photo-upload', index + 1, files.length, `מעלה תמונה ${index + 1} מתוך ${files.length}`);
                
            const progress = ((index + 1) / files.length) * 100;
            if (progressBar) progressBar.style.width = `${progress}%`;
            
                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`הקובץ ${file.name} גדול מדי (מקסימום 10MB)`);
                }
                
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    throw new Error(`הקובץ ${file.name} אינו תמונה תקינה`);
                }
                
                // Upload to Firebase Storage
                const timestamp = Date.now();
                const storageRef = ref(storage, `packing-photos/${userId}/${timestamp}-${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                
            const photoData = {
                    id: timestamp + index,
                url: url,
                filename: file.name,
                    timestamp: timestamp,
                    uploadedBy: userId,
                    size: file.size,
                    type: file.type
            };
            
                // Add to currentData for immediate UI update
            if (!currentData.packingPhotos) currentData.packingPhotos = { photos: [] };
            currentData.packingPhotos.photos.push(photoData);
            
                // Save to Firebase for persistence
                const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
                await updateDoc(publicDataRef, { 
                    packingPhotos: arrayUnion(photoData)
                });
                
                successCount++;
            
        } catch (error) {
            console.warn('Packing photo upload failed:', error);
                errorCount++;
                
                // Show individual file error
                showFlowFeedback('warning', `שגיאה בהעלאת ${file.name}: ${error.message}`, {
                    duration: 5000
                });
                
                // Fallback to local URL if Firebase fails
            const url = URL.createObjectURL(file);
            const photoData = {
                id: Date.now() + index,
                url: url,
                filename: file.name,
                    timestamp: Date.now(),
                    uploadedBy: userId,
                    size: file.size,
                    type: file.type,
                    isLocal: true // Mark as local fallback
                };
                
                // Add to currentData for immediate UI update
            if (!currentData.packingPhotos) currentData.packingPhotos = { photos: [] };
            currentData.packingPhotos.photos.push(photoData);
            }
        }
    
    // Hide progress bar
        if (progressContainer) progressContainer.classList.add('hidden');
        if (progressBar) progressBar.style.width = '0%';
    
        // Clear file input
    event.target.value = '';
            
            // Re-render gallery
            renderPackingPhotosGallery();
            
        // Show final feedback
        hideFlowLoading(loaderId);
        
        if (successCount > 0 && errorCount === 0) {
            showFlowSuccess(`הועלו בהצלחה ${successCount} תמונות!`);
        } else if (successCount > 0 && errorCount > 0) {
            showFlowFeedback('warning', `הועלו ${successCount} תמונות, ${errorCount} נכשלו`, {
                duration: 6000
            });
        } else {
            handleFlowError(new Error('כל ההעלאות נכשלו'), 'photo-upload', {
                files: files
            });
        }
        
    } catch (error) {
        hideFlowLoading(loaderId);
        handleFlowError(error, 'photo-upload', {
            files: files
        });
    }
}

// Handle add packing item - moved to handlers.js to avoid duplication


// Update packing progress bar
export function updatePackingProgress() {
    const packingData = (currentData && currentData.packingListData && typeof currentData.packingListData === 'object') 
        ? currentData.packingListData 
        : {};
    
    let totalItems = 0;
    let checkedItems = 0;
    
    Object.values(packingData).forEach(items => {
        if (Array.isArray(items)) {
            totalItems += items.length;
            checkedItems += items.filter(item => item.checked).length;
        }
    });
    
    const progressPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    
    // Update main progress bar with enhanced animation
    const progressBar = document.getElementById('packingProgressBar');
    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        
        // Update percentage display with animation
        const percentageDisplay = document.getElementById('progress-percentage');
        if (percentageDisplay) {
            animateNumber(percentageDisplay, parseInt(percentageDisplay.textContent) || 0, progressPercentage);
        }
    }
    
    // Update interactive packing progress
    const overallProgress = document.getElementById('packing-overall-progress');
    if (overallProgress) {
        overallProgress.style.width = `${progressPercentage}%`;
        overallProgress.textContent = `${progressPercentage}%`;
    }
    
    // Update category progress counters
    updateCategoryProgress();
    
    // Celebration animation at 100%
    if (progressPercentage === 100) {
        triggerCompletionCelebration();
    }
}

// Enhanced animation functions (using FamilyAnimations class)
function animateNumber(element, start, end) {
    familyAnimations.countUp(element, start, end, 500);
}

function updateCategoryProgress() {
    document.querySelectorAll('.category-card').forEach(card => {
        const checkboxes = card.querySelectorAll('.packing-checkbox');
        const checkedBoxes = card.querySelectorAll('.packing-checkbox:checked');
        const progressElement = card.querySelector('.category-count');
        
        if (progressElement && checkboxes.length > 0) {
            progressElement.textContent = `${checkedBoxes.length}/${checkboxes.length}`;
            
            // Add visual feedback for completed categories
            if (checkedBoxes.length === checkboxes.length) {
                card.classList.add('category-completed');
                // Add completion animation
                card.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 300);
            } else {
                card.classList.remove('category-completed');
            }
        }
    });
}

function triggerCompletionCelebration() {
    // Create celebration effect
    const modal = document.getElementById('packing-guide-modal');
    if (!modal) return;
    
    // Add confetti-like animation
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            createConfettiParticle();
        }, i * 100);
    }
    
    // Show completion message
    showCompletionToast();
}

function createConfettiParticle() {
    // Use FamilyAnimations class for confetti
    const centerX = Math.random() * window.innerWidth;
    const centerY = -10;
    familyAnimations.createConfetti(centerX, centerY);
}

function showCompletionToast() {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 600;
        z-index: 10001;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        animation: toast-slide-in 0.3s ease-out;
    `;
    toast.textContent = '🎉 כל הכבוד! סיימתם לארוז הכל!';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toast-slide-out 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Handle packing checkbox toggle
export function handlePackingCheckboxToggle(event) {
    const checkbox = event.target;
    const category = checkbox.dataset.category;
    const index = parseInt(checkbox.dataset.index);
    
    if (!currentData.packingListData) {
        currentData.packingListData = {};
    }
    
    if (!currentData.packingListData[category]) {
        currentData.packingListData[category] = [];
    }
    
    if (currentData.packingListData[category][index]) {
        currentData.packingListData[category][index].checked = checkbox.checked;
        
        // Update Firebase if possible
        // Persisting this checkbox is handled elsewhere via Firestore update flows
        
        // Update progress
        updatePackingProgress();
    }
}

// Render daily special content
export function renderDailySpecial() {
    const container = document.getElementById('daily-special-content');
    if (!container) return;
    
    if (!currentData.dailySpecials) {
        container.innerHTML = '<p>טוען המלצה יומית...</p>';
        return;
    }
    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Try to find today's special, or use the first available
    let specialContent = currentData.dailySpecials[today];
    if (!specialContent) {
        const availableSpecials = Object.values(currentData.dailySpecials);
        specialContent = availableSpecials.length > 0 ? availableSpecials[0] : 'אין המלצה מיוחדת להיום';
    }
    
    container.innerHTML = `
        <div class="space-y-4 md:space-y-6">
            <div class="mb-4 md:mb-6">
                <div class="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-amber-300 to-warm-400 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg md:shadow-xl">
                    <span class="text-2xl md:text-3xl">✨</span>
                </div>
                <div class="bg-white/60 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-white/30">
                    <p class="text-lg md:text-xl leading-relaxed text-gray-800 font-medium break-words">${specialContent}</p>
                </div>
            </div>
            
            <div class="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                <button id="daily-special-ai-btn" class="btn-accent-standard text-sm md:text-base">
                    <span class="flex items-center justify-center gap-1 md:gap-2">
                        <span class="text-base md:text-lg">✨</span>
                        <span class="whitespace-nowrap">ספר לי עוד על המלצה זו</span>
                    </span>
                </button>
                <button id="add-to-plan-btn" class="btn-secondary-standard text-sm md:text-base">
                    <span class="flex items-center justify-center gap-1 md:gap-2">
                        <span class="text-base md:text-lg">➕</span>
                        <span class="whitespace-nowrap">הוסף למסלול שלי</span>
                    </span>
                </button>
            </div>
        </div>
    `;
}

export function populateFlightDetails() {
    const modalContent = document.getElementById('flight-details-content');
    if (!modalContent || !currentData.flightData) return;
    
    const flights = currentData.flightData;
    
    modalContent.innerHTML = `
        <div class="space-y-6">
            <div class="text-center">
                <h2 class="text-2xl font-bold text-gray-800">📧 פרטי הטיסה המלאים</h2>
                <p class="text-lg text-gray-600">מספר הזמנה: <strong>${flights.bookingRef}</strong></p>
            </div>
            
            <!-- Outbound Flights -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200 shadow-sm">
                <h3 class="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                    <span class="w-6 h-6 mr-2">✈️</span>
                    טיסות יציאה
                </h3>
                ${flights.outbound.map((flight, index) => `
                    <div class="bg-white p-4 sm:p-5 rounded-lg mb-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200">
                        <div class="space-y-3">
                            <div>
                                <h4 class="font-bold text-lg text-gray-800">${flight.from} → ${flight.to}</h4>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                    <p class="text-sm text-gray-600 flex items-center">
                                        <span class="w-4 h-4 mr-1">📅</span>
                                        ${flight.date}
                                    </p>
                                    <p class="text-sm text-gray-600 flex items-center">
                                        <span class="w-4 h-4 mr-1">⏰</span>
                                        ${flight.time}
                                    </p>
                                    <p class="text-sm text-gray-600 flex items-center">
                                        <span class="w-4 h-4 mr-1">✈️</span>
                                        ${flight.airline} ${flight.flightNum}
                                    </p>
                                    <p class="text-sm text-gray-600 flex items-center">
                                        <span class="w-4 h-4 mr-1">🎫</span>
                                        קוד הזמנה: ${flight.airlineRef}
                                    </p>
                                </div>
                                <p class="text-sm font-semibold ${flight.status === 'On Time' ? 'text-green-600' : 'text-red-600'} mt-2 flex items-center">
                                    <span class="w-4 h-4 mr-1">📊</span>
                                    ${flight.status}
                                </p>
                            </div>
                            <div class="pt-2 border-t border-gray-100">
                                <a href="${flight.checkin}" target="_blank" class="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    <span class="w-4 h-4 mr-2">✅</span>
                                    צ'ק-אין אונליין
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('')}
                ${flights.connections.outbound ? `<p class="text-sm text-orange-600 font-semibold mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">🔄 זמן החלפה: ${flights.connections.outbound}</p>` : ''}
            </div>
            
            <!-- Inbound Flights -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200 shadow-sm">
                <h3 class="text-xl font-semibold text-green-800 mb-4 flex items-center">
                    <span class="w-6 h-6 mr-2">🏠</span>
                    טיסות חזרה
                </h3>
                ${flights.inbound.map((flight, index) => `
                    <div class="bg-white p-4 sm:p-5 rounded-lg mb-4 shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200">
                        <div class="space-y-3">
                            <div>
                                <h4 class="font-bold text-lg text-gray-800">${flight.from} → ${flight.to}</h4>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                    <p class="text-sm text-gray-600 flex items-center">
                                        <span class="w-4 h-4 mr-1">📅</span>
                                        ${flight.date}
                                    </p>
                                    <p class="text-sm text-gray-600 flex items-center">
                                        <span class="w-4 h-4 mr-1">⏰</span>
                                        ${flight.time}
                                    </p>
                                    <p class="text-sm text-gray-600 flex items-center">
                                        <span class="w-4 h-4 mr-1">✈️</span>
                                        ${flight.airline} ${flight.flightNum}
                                    </p>
                                    <p class="text-sm text-gray-600 flex items-center">
                                        <span class="w-4 h-4 mr-1">🎫</span>
                                        קוד הזמנה: ${flight.airlineRef}
                                    </p>
                                </div>
                                <p class="text-sm font-semibold ${flight.status === 'On Time' ? 'text-green-600' : 'text-red-600'} mt-2 flex items-center">
                                    <span class="w-4 h-4 mr-1">📊</span>
                                    ${flight.status}
                                </p>
                            </div>
                            <div class="pt-2 border-t border-gray-100">
                                <a href="${flight.checkin}" target="_blank" class="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    <span class="w-4 h-4 mr-2">✅</span>
                                    צ'ק-אין אונליין
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('')}
                ${flights.connections.inbound ? `<p class="text-sm text-orange-600 font-semibold mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">🔄 זמן החלפה: ${flights.connections.inbound}</p>` : ''}
            </div>
            
            <!-- Passenger Details -->
            <div class="bg-gradient-to-br from-gray-50 to-slate-50 p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span class="w-6 h-6 mr-2">👨‍👩‍👧‍👦</span>
                    פרטי נוסעים
                </h3>
                <div class="grid gap-4">
                    ${flights.passengers.map(passenger => `
                        <div class="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                            <div class="space-y-3">
                                <h4 class="font-bold text-lg text-gray-800 border-b border-gray-100 pb-2">${passenger.name}</h4>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div class="flex items-center p-2 bg-blue-50 rounded-lg">
                                        <span class="w-5 h-5 mr-2 text-blue-600">🎫</span>
                                        <div>
                                            <p class="text-xs text-blue-600 font-medium">מספר כרטיס</p>
                                            <p class="text-sm font-semibold text-gray-800">${passenger.ticket}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center p-2 bg-green-50 rounded-lg">
                                        <span class="w-5 h-5 mr-2 text-green-600">🧳</span>
                                        <div>
                                            <p class="text-xs text-green-600 font-medium">מטען</p>
                                            <p class="text-sm font-semibold text-gray-800">${passenger.baggage}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                                    <div class="flex items-center mb-2">
                                        <span class="w-5 h-5 mr-2 text-purple-600">🪑</span>
                                        <p class="text-sm font-semibold text-purple-800">מושבים</p>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">יציאה:</span>
                                            <span class="font-semibold text-gray-800">${passenger.seatOutbound1}, ${passenger.seatOutbound2}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">חזרה:</span>
                                            <span class="font-semibold text-gray-800">${passenger.seatInbound1}, ${passenger.seatInbound2}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Luggage Details -->
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h3 class="text-xl font-semibold text-yellow-800 mb-4">🧳 פרטי מטען</h3>
                <div class="grid gap-3">
                    ${currentData.luggageData ? currentData.luggageData.map(luggage => `
                        <div class="bg-white p-3 rounded-lg">
                            <h4 class="font-semibold">${luggage.name}</h4>
                            <p class="text-sm text-gray-600"><strong>בעלים:</strong> ${luggage.owner}</p>
                            <p class="text-sm text-gray-600"><strong>משקל:</strong> ${luggage.weight}</p>
                            <p class="text-sm text-gray-600"><strong>הערות:</strong> ${luggage.notes}</p>
                        </div>
                    `).join('') : '<p class="text-center text-gray-600">אין מידע על מטען</p>'}
                </div>
            </div>
        </div>
    `;
}

export function populateHotelDetails() {
    const modalContent = document.getElementById('hotel-booking-content');
    if (!modalContent || !currentData.hotelData) return;
    
    const hotel = currentData.hotelData;
    
    modalContent.innerHTML = `
        <div class="space-y-8">
            <!-- Enhanced Header Section -->
            <div class="text-center relative">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl opacity-50"></div>
                <div class="relative z-10 p-8">
                    <div class="flex items-center justify-center mb-4">
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span class="text-3xl">🏨</span>
                        </div>
                    </div>
                    <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        פרטי המלון המלאים
                    </h2>
                    <h3 class="text-2xl font-semibold text-gray-800 mb-2">${hotel.name || 'Mercure Geneva Airport'}</h3>
                    <div class="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full">
                        <span class="text-sm font-medium text-blue-800">מספר הזמנה:</span>
                        <span class="text-lg font-bold text-blue-900 ml-2">${hotel.bookingRef || 'PPMHBPDH'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Hotel Details -->
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-lg">
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                        <span class="text-white text-lg">📍</span>
                    </div>
                    <h3 class="text-xl font-bold text-blue-800">פרטי המלון</h3>
                </div>
                <div class="space-y-3">
                    <div class="flex items-start">
                        <span class="text-blue-600 mr-3 mt-1">🏠</span>
                        <div>
                            <span class="font-semibold text-blue-800">כתובת:</span>
                            <p class="text-blue-700">${hotel.address || 'Rue De La Bergere, Meyrin, 1217 GENEVA, Switzerland'}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-blue-600 mr-3 mt-1">📞</span>
                        <div>
                            <span class="font-semibold text-blue-800">טלפון:</span>
                            <p class="text-blue-700">${hotel.phone || '+41 22 989 90 00'}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-blue-600 mr-3 mt-1">📧</span>
                        <div>
                            <span class="font-semibold text-blue-800">אימייל:</span>
                            <p class="text-blue-700">${hotel.email || 'h1346@accor.com'}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-blue-600 mr-3 mt-1">🌐</span>
                        <div>
                            <span class="font-semibold text-blue-800">אתר:</span>
                            <a href="${hotel.website || 'https://www.mercure.com'}" target="_blank" class="text-blue-600 underline hover:text-blue-800 transition-colors">${hotel.website || 'www.mercure.com'}</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Check-in Details -->
            <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-lg">
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                        <span class="text-white text-lg">🗓️</span>
                    </div>
                    <h3 class="text-xl font-bold text-green-800">פרטי שהייה</h3>
                </div>
                <div class="space-y-3">
                    <div class="flex items-start">
                        <span class="text-green-600 mr-3 mt-1">📅</span>
                        <div>
                            <span class="font-semibold text-green-800">צ'ק-אין:</span>
                            <p class="text-green-700">${hotel.checkinDate || '24/08/2025'} החל מ-${hotel.checkinTime || '15:00'}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-green-600 mr-3 mt-1">📅</span>
                        <div>
                            <span class="font-semibold text-green-800">צ'ק-אאוט:</span>
                            <p class="text-green-700">${hotel.checkoutDate || '29/08/2025'} עד ${hotel.checkoutTime || '12:00'}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-green-600 mr-3 mt-1">🏠</span>
                        <div>
                            <span class="font-semibold text-green-800">סוג חדר:</span>
                            <p class="text-green-700">${hotel.roomType || 'Family Room with 1 double bed and 1 rollaway bed'}</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <span class="text-green-600 mr-3 mt-1">🍽️</span>
                        <div>
                            <span class="font-semibold text-green-800">ארוחת בוקר:</span>
                            <p class="text-green-700">${hotel.breakfast || 'כלול בהזמנה'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Additional Services -->
            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200 shadow-lg">
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                        <span class="text-white text-lg">🛎️</span>
                    </div>
                    <h3 class="text-xl font-bold text-yellow-800">שירותים נוספים</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${hotel.services && Array.isArray(hotel.services) && hotel.services.length > 0 
                        ? hotel.services.map(service => `
                            <div class="flex items-center">
                                <span class="text-yellow-600 mr-2">✨</span>
                                <span class="text-yellow-700">${service}</span>
                            </div>
                        `).join('')
                        : `
                            <div class="flex items-center">
                                <span class="text-yellow-600 mr-2">✨</span>
                                <span class="text-yellow-700">WiFi חופשי</span>
                            </div>
                            <div class="flex items-center">
                                <span class="text-yellow-600 mr-2">✨</span>
                                <span class="text-yellow-700">חניה חופשית</span>
                            </div>
                            <div class="flex items-center">
                                <span class="text-yellow-600 mr-2">✨</span>
                                <span class="text-yellow-700">שירות חדרים 24/7</span>
                            </div>
                            <div class="flex items-center">
                                <span class="text-yellow-600 mr-2">✨</span>
                                <span class="text-yellow-700">מרכז כושר</span>
                            </div>
                            <div class="flex items-center">
                                <span class="text-yellow-600 mr-2">✨</span>
                                <span class="text-yellow-700">בר ומסעדה</span>
                            </div>
                        `
                    }
                </div>
            </div>
        </div>
    `;
}

// Populate family details modal
export function populateFamilyDetails() {
    const content = document.getElementById('family-details-content');
    if (!currentData.familyData || !content) return;
    
    content.innerHTML = currentData.familyData.map(member => `
        <div class="border-b pb-2 mb-2">
            <p><strong>שם:</strong> ${member.name || 'לא זמין'}</p>
            <p><strong>דרכון:</strong> ${member.passport || 'לא זמין'}</p>
        </div>
    `).join('');
}

// Populate nearby locations modal
export function populateNearbyLocations() {
    const content = document.getElementById('nearby-results');
    if (!content) return;
    
    // This would typically use geolocation and filter activities by distance
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            // Filter and display nearby activities (simplified version)
            const nearbyActivities = currentData.activitiesData.filter(activity => 
                activity.travelTime && parseInt(activity.travelTime) <= 20
            ).slice(0, 5);
            
            content.innerHTML = nearbyActivities.length > 0 
                ? nearbyActivities.map(activity => `
                    <div class="border rounded-lg p-4 mb-3">
                        <h4 class="font-bold text-accent">${activity.name}</h4>
                        <p class="text-sm text-gray-600">${activity.category}</p>
                        <p class="text-sm">🕐 ${activity.travelTime} דקות מהמלון</p>
                    </div>
                `).join('')
                : '<p class="text-center text-gray-600">לא נמצאו מקומות קרובים</p>';
        }, (error) => {
            content.innerHTML = '<p class="text-center text-gray-600">לא ניתן לגשת למיקום הנוכחי</p>';
        });
    } else {
        content.innerHTML = '<p class="text-center text-gray-600">הדפדפן לא תומך בשירותי מיקום</p>';
    }
}

export function renderPhotoAlbum() {
    const gallery = document.getElementById('photo-gallery');
    if (!gallery) return;
    
    const photos = currentData.photoAlbum || [];
    
    if (photos.length === 0) {
        gallery.innerHTML = `
            <div class="col-span-full text-center py-8 md:py-12">
                <div class="text-4xl md:text-6xl mb-4">📷</div>
                <p class="text-gray-600 text-sm md:text-base">עדיין לא הועלו תמונות</p>
                <p class="text-xs md:text-sm text-gray-500 mt-2">לחצו על "הוסיפו תמונה" כדי להתחיל ליצור את האלבום שלכם</p>
            </div>
        `;
        return;
    }
    
    gallery.innerHTML = photos.map((photo, index) => `
        <div class="photo-item relative group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105" data-photo-index="${index}">
            <div class="relative overflow-hidden rounded-t-xl">
                <img src="${photo.url}" alt="${photo.caption || 'תמונה משפחתית'}" 
                     class="w-full h-32 md:h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='https://placehold.co/300x200/F3EFEA/4A4A4A?text=תמונה+לא+זמינה'; this.alt='תמונה לא זמינה';">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                </div>
            </div>
            <div class="p-2 md:p-3">
                ${photo.caption ? `<p class="text-xs md:text-sm text-gray-700 text-center font-medium truncate">${photo.caption}</p>` : '<p class="text-xs md:text-sm text-gray-500 text-center">תמונה משפחתית</p>'}
            </div>
        </div>
    `).join('');
}

export function renderBulletinBoard() {
    const container = document.getElementById('bulletin-notes');
    if (!container) return;
    
    const notes = currentData.bulletinBoard || [];
    
    if (notes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl mb-4">📝</div>
                <p class="text-gray-600">עדיין לא נוספו הערות</p>
                <p class="text-sm text-gray-500 mt-2">הוסיפו הערות, תזכורות או רשימות קניות כדי לעקוב אחרי הטיול</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notes.map((note, index) => `
        <div class="bulletin-note bg-yellow-100 border border-yellow-300 rounded-lg p-4 relative group">
            <button class="delete-note absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" data-note-index="${index}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <p class="text-gray-800 pr-6">${note.content}</p>
            <p class="text-xs text-gray-500 mt-2">${new Date(note.timestamp).toLocaleDateString('he-IL')} ${new Date(note.timestamp).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})}</p>
        </div>
    `).join('');
}

export function renderFamilyMemories() {
    const container = document.getElementById('family-memories-list');
    if (!container) return;
    
    const memories = currentData.familyMemories || [];
    
    if (memories.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl mb-4">✨</div>
                <p class="text-gray-600">עדיין לא נרשמו זיכרונות</p>
                <p class="text-sm text-gray-500 mt-2">שמרו כאן את הרגעים המיוחדים, התגליות והחוויות מהטיול</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = memories.map((memory, index) => `
        <div class="memory-card bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div class="flex justify-between items-start mb-3">
                <h4 class="text-lg font-bold text-gray-800">${memory.title}</h4>
                <button class="delete-memory text-red-500 opacity-70 hover:opacity-100" data-memory-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <p class="text-gray-700 leading-relaxed mb-3">${memory.content}</p>
            <p class="text-xs text-gray-500">${new Date(memory.timestamp).toLocaleDateString('he-IL')} ${new Date(memory.timestamp).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})}</p>
        </div>
    `).join('');
}

export function renderInteractivePackingList() {
    const container = document.getElementById('interactive-packing-list');
    const progressBar = document.getElementById('packing-overall-progress');
    if (!container || !progressBar) return;
    
    const packingItems = currentData.interactivePacking || [];
    
    if (packingItems.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="text-4xl mb-4">🎒</div>
                <p class="text-gray-600">עדיין לא נוספו פריטים לרשימה</p>
                <p class="text-sm text-gray-500 mt-2">הוסיפו פריטים לאריזה כדי לעקוב אחרי ההתקדמות</p>
            </div>
        `;
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        return;
    }
    
    const checkedItems = packingItems.filter(item => item.checked).length;
    const progress = Math.round((checkedItems / packingItems.length) * 100);
    
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${progress}%`;
    
    container.innerHTML = packingItems.map((item, index) => `
        <div class="packing-item bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div class="flex items-center">
                <input type="checkbox" id="packing-${index}" class="packing-checkbox mr-3" 
                       data-item-index="${index}" ${item.checked ? 'checked' : ''}>
                <label for="packing-${index}" class="${item.checked ? 'line-through text-gray-500' : 'text-gray-800'}">
                    ${item.name}
                </label>
            </div>
            <button class="delete-packing-item text-red-500 opacity-70 hover:opacity-100" data-item-index="${index}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Duplicate function removed - already defined above

// Global interval for time updates to prevent memory leaks
let timeUpdateInterval = null;

export function renderQuickStatus() {
    // Update current time in navigation bar (desktop and mobile)
    const updateTime = () => {
        const now = new Date();
        const genevaTime = now.toLocaleTimeString('he-IL', {
            timeZone: 'Europe/Zurich',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Update desktop nav
        const timeElement = document.getElementById('nav-time');
        if (timeElement) {
            timeElement.textContent = genevaTime;
        }
        
        // Update mobile nav
        const mobileTimeElement = document.getElementById('mobile-nav-time');
        if (mobileTimeElement) {
            mobileTimeElement.textContent = genevaTime;
        }
    };
    
    // Initial update
    updateTime();
    
    // Clear existing interval if any
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }
    
    // Set up new interval
    timeUpdateInterval = setInterval(updateTime, 60000);
    
    // Update weather status in navigation bar (desktop and mobile)
    const updateWeather = () => {
        let weatherContent = '🌤️ מזג אוויר';
        
        try {
            console.log('🌤️ Checking weather data:', currentData?.weather);
            if (currentData && currentData.weather && currentData.weather.daily && 
                currentData.weather.daily.temperature_2m_max && 
                currentData.weather.daily.temperature_2m_max[0] !== undefined &&
                currentData.weather.daily.weathercode && 
                currentData.weather.daily.weathercode[0] !== undefined) {
                const todayTemp = Math.round(currentData.weather.daily.temperature_2m_max[0]);
                const weatherCode = currentData.weather.daily.weathercode[0];
                const weatherInfo = getWeatherInfo(weatherCode);
                weatherContent = `${weatherInfo.icon} ${todayTemp}°C`;
                console.log('🌤️ Weather updated successfully:', weatherContent);
            } else {
                console.log('🌤️ Weather data not available or incomplete:', {
                    hasCurrentData: !!currentData,
                    hasWeather: !!(currentData?.weather),
                    hasDaily: !!(currentData?.weather?.daily),
                    hasTempMax: !!(currentData?.weather?.daily?.temperature_2m_max),
                    hasWeatherCode: !!(currentData?.weather?.daily?.weathercode)
                });
            }
        } catch (error) {
            console.error('🌤️ Error updating weather:', error);
            weatherContent = '🌤️ מזג אוויר';
        }
        
        // Update desktop nav
        const weatherElement = document.getElementById('nav-weather');
        if (weatherElement) {
            weatherElement.innerHTML = weatherContent;
        }
        
        // Update mobile nav
        const mobileWeatherElement = document.getElementById('mobile-nav-weather');
        if (mobileWeatherElement) {
            mobileWeatherElement.innerHTML = weatherContent;
        }
    };
    
    updateWeather();
    
    // Update transport status
    const transportElement = document.getElementById('quick-transport');
    if (transportElement) {
        // This could be dynamic based on data
        transportElement.textContent = '🚊 Geneva Card';
    }
}

export function renderLuggagePlanner() {
    const plannerContainer = document.getElementById('luggage-planner');
    if (!plannerContainer) return;
    
    // Default luggage data if not available
    const luggageData = currentData?.luggageData || [
        { name: "מזוודה גדולה", owner: "משותף", weight: "עד 23 ק\"ג", notes: "לשלוח לבטן המטוס. מכילה את רוב הבגדים והציוד.", items: [] },
        { name: "טרולי עלייה למטוס", owner: "דור", weight: "עד 8 ק\"ג", notes: "מכיל בגדים להחלפה, מסמכים חשובים וציוד חיוני.", items: [] },
        { name: "תיק גב", owner: "עדי", weight: "-", notes: "תיק החתלה עם כל מה שצריך לילדים בזמינות מיידית.", items: [] },
        { name: "עגלה", owner: "ילדים", weight: "-", notes: "נשלחת בשער העלייה למטוס.", items: [] }
    ];
    
    const familyMembers = ['דור', 'עדי', 'בר', 'רן', 'משותף'];
    
    plannerContainer.innerHTML = luggageData.map((bag, bagIndex) => `
        <div class="luggage-item bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-gray-200">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h4 class="font-bold text-lg text-gray-800">${bag.name}</h4>
                    <p class="text-sm text-gray-600">${bag.notes}</p>
                    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3 text-sm">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span class="font-semibold text-gray-700 flex items-center">
                                <span class="w-4 h-4 mr-1">👤</span>
                                אחראי:
                            </span>
                            <select class="luggage-owner-select border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 min-w-0 sm:min-w-24" data-bag-index="${bagIndex}">
                                ${familyMembers.map(member => 
                                    `<option value="${member}" ${bag.owner === member ? 'selected' : ''}>${member}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span class="font-semibold text-gray-700 flex items-center">
                                <span class="w-4 h-4 mr-1">⚖️</span>
                                משקל:
                            </span>
                            <select class="luggage-weight-select border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors duration-200 min-w-0 sm:min-w-32" data-bag-index="${bagIndex}">
                                <option value="עד 23 ק\"ג" ${bag.weight === 'עד 23 ק"ג' ? 'selected' : ''}>עד 23 ק"ג (גדולה)</option>
                                <option value="עד 15 ק\"ג" ${bag.weight === 'עד 15 ק"ג' ? 'selected' : ''}>עד 15 ק"ג (בינונית)</option>
                                <option value="עד 8 ק\"ג" ${bag.weight === 'עד 8 ק"ג' ? 'selected' : ''}>עד 8 ק"ג (קטנה)</option>
                                <option value="-" ${bag.weight === '-' ? 'selected' : ''}>ללא הגבלה</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Items in this bag -->
            <div class="luggage-items mt-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm">
                <h5 class="font-bold text-gray-800 mb-3 flex items-center">
                    <span class="w-5 h-5 mr-2">📦</span>
                    פריטים במזוודה:
                </h5>
                <div id="luggage-items-${bagIndex}" class="space-y-2 min-h-20 border-2 border-dashed border-gray-300 p-3 sm:p-4 rounded-lg bg-gray-50 hover:border-gray-400 transition-colors duration-200">
                    ${bag.items && bag.items.length > 0 
                        ? bag.items.map(item => `<div class="luggage-item-tag bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-2 rounded-full text-sm font-medium inline-block mr-2 mb-2 shadow-sm border border-blue-200 hover:shadow-md transition-shadow duration-200">${item}</div>`).join('')
                        : '<div class="text-center py-6"><p class="text-gray-500 text-sm sm:text-base">גררו פריטים מרשימת האריזה לכאן</p><p class="text-gray-400 text-xs mt-1">או הוסיפו פריטים ידנית למטה</p></div>'
                    }
                </div>
                <div class="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input type="text" placeholder="הוסיפו פריט ידנית..." class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors duration-200 manual-item-input">
                    <button class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 add-manual-item-btn" data-bag-index="${bagIndex}">
                        <span class="flex items-center justify-center">
                            <span class="mr-1">➕</span>
                            הוסף
                        </span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for owner selection
    plannerContainer.querySelectorAll('.luggage-owner-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const bagIndex = parseInt(e.target.dataset.bagIndex);
            if (currentData && currentData.luggageData && currentData.luggageData[bagIndex]) {
                currentData.luggageData[bagIndex].owner = e.target.value;
            }
        });
    });
    
    // Add event listeners for weight/size selection
    plannerContainer.querySelectorAll('.luggage-weight-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const bagIndex = parseInt(e.target.dataset.bagIndex);
            const newWeight = e.target.value;
            
            if (currentData && currentData.luggageData && currentData.luggageData[bagIndex]) {
                const oldWeight = currentData.luggageData[bagIndex].weight;
                currentData.luggageData[bagIndex].weight = newWeight;
                
                // Update bag name based on weight
                const bagNames = {
                    'עד 23 ק"ג': 'מזוודה גדולה',
                    'עד 15 ק"ג': 'מזוודה בינונית', 
                    'עד 8 ק"ג': 'טרולי/תיק עלייה',
                    '-': 'תיק גב/עגלה'
                };
                
                currentData.luggageData[bagIndex].name = bagNames[newWeight] || currentData.luggageData[bagIndex].name;
                
                // Re-render the luggage planner
                renderLuggagePlanner();
            }
        });
    });
    
    // Add event listeners for manual item addition
    plannerContainer.querySelectorAll('.add-manual-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bagIndex = parseInt(e.target.dataset.bagIndex);
            const input = e.target.previousElementSibling;
            const itemName = input.value.trim();
            if (itemName) {
                addItemToLuggage(bagIndex, itemName);
                input.value = '';
            }
        });
    });
}

function addItemToLuggage(bagIndex, itemName) {
    if (!currentData.luggageData) {
        currentData.luggageData = [];
    }
    if (!currentData.luggageData[bagIndex]) {
        currentData.luggageData[bagIndex] = { items: [] };
    }
    if (!currentData.luggageData[bagIndex].items) {
        currentData.luggageData[bagIndex].items = [];
    }
    
    currentData.luggageData[bagIndex].items.push(itemName);
    
    // Re-render the luggage planner
    renderLuggagePlanner();
}

// --- ENHANCED UI COMPONENTS ---

/**
 * Enhanced modal manager with animations
 */
export class EnhancedModalManager {
    constructor() {
        this.activeModals = new Set();
        this.init();
    }

    init() {
        this.addModalStyles();
        this.setupModalEventListeners();
    }

    addModalStyles() {
        if (document.getElementById('enhanced-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'enhanced-modal-styles';
        style.textContent = `
            .enhanced-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(8px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .enhanced-modal.show {
                opacity: 1;
                visibility: visible;
            }
            
            .enhanced-modal-content {
                background: white;
                border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                max-width: 90vw;
                max-height: 90vh;
                overflow: hidden;
                transform: scale(0.8) translateY(20px);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .enhanced-modal.show .enhanced-modal-content {
                transform: scale(1) translateY(0);
            }
            
            .enhanced-modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .enhanced-modal-title {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }
            
            .enhanced-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                border-radius: 6px;
                transition: all 0.2s ease;
            }
            
            .enhanced-modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .enhanced-modal-body {
                padding: 24px;
                overflow-y: auto;
                max-height: 60vh;
            }
            
            .enhanced-modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
        `;
        document.head.appendChild(style);
    }

    setupModalEventListeners() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.size > 0) {
                this.closeTopModal();
            }
        });

        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('enhanced-modal')) {
                this.closeModal(e.target);
            }
        });
    }

    show(options = {}) {
        const {
            title = 'הודעה',
            content = '',
            footer = null,
            size = 'medium',
            closable = true
        } = options;

        const modal = document.createElement('div');
        modal.className = 'enhanced-modal';
        modal.id = `modal-${Date.now()}`;

        const sizeClasses = {
            small: 'max-w-md',
            medium: 'max-w-2xl',
            large: 'max-w-4xl',
            fullscreen: 'max-w-full max-h-full'
        };

        modal.innerHTML = `
            <div class="enhanced-modal-content ${sizeClasses[size]}">
                <div class="enhanced-modal-header">
                    <h3 class="enhanced-modal-title">${title}</h3>
                    ${closable ? '<button class="enhanced-modal-close">&times;</button>' : ''}
                </div>
                <div class="enhanced-modal-body">
                    ${content}
                </div>
                ${footer ? `<div class="enhanced-modal-footer">${footer}</div>` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        this.activeModals.add(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.enhanced-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }

        // Trigger animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        return modal;
    }

    closeModal(modal) {
        if (!modal || !this.activeModals.has(modal)) return;

        modal.classList.remove('show');
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            this.activeModals.delete(modal);
        }, 300);
    }

    closeTopModal() {
        const modals = Array.from(this.activeModals);
        if (modals.length > 0) {
            this.closeModal(modals[modals.length - 1]);
        }
    }

    closeAll() {
        this.activeModals.forEach(modal => this.closeModal(modal));
    }
}

/**
 * Enhanced notification system
 */
export class EnhancedNotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
        this.addNotificationStyles();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'enhanced-notifications';
        this.container.className = 'enhanced-notifications-container';
        document.body.appendChild(this.container);
    }

    addNotificationStyles() {
        if (document.getElementById('enhanced-notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'enhanced-notification-styles';
        style.textContent = `
            .enhanced-notifications-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 400px;
            }
            
            .enhanced-notification {
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
                position: relative;
                overflow: hidden;
            }
            
            .enhanced-notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .enhanced-notification.success {
                border-left-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            }
            
            .enhanced-notification.error {
                border-left-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            }
            
            .enhanced-notification.warning {
                border-left-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            }
            
            .enhanced-notification.info {
                border-left-color: #3b82f6;
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            }
            
            .enhanced-notification-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 14px;
                color: white;
            }
            
            .enhanced-notification.success .enhanced-notification-icon {
                background: #10b981;
            }
            
            .enhanced-notification.error .enhanced-notification-icon {
                background: #ef4444;
            }
            
            .enhanced-notification.warning .enhanced-notification-icon {
                background: #f59e0b;
            }
            
            .enhanced-notification.info .enhanced-notification-icon {
                background: #3b82f6;
            }
            
            .enhanced-notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .enhanced-notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #1f2937;
                margin: 0 0 4px 0;
            }
            
            .enhanced-notification-message {
                font-size: 13px;
                color: #6b7280;
                margin: 0;
                line-height: 1.4;
            }
            
            .enhanced-notification-close {
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
            
            .enhanced-notification-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #374151;
            }
            
            .enhanced-notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 0 0 12px 12px;
                transition: width linear;
            }
            
            .enhanced-notification.success .enhanced-notification-progress {
                background: #10b981;
            }
            
            .enhanced-notification.error .enhanced-notification-progress {
                background: #ef4444;
            }
            
            .enhanced-notification.warning .enhanced-notification-progress {
                background: #f59e0b;
            }
            
            .enhanced-notification.info .enhanced-notification-progress {
                background: #3b82f6;
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info', options = {}) {
        const {
            title = this.getDefaultTitle(type),
            duration = 4000,
            persistent = false,
            icon = this.getDefaultIcon(type)
        } = options;

        const notification = document.createElement('div');
        notification.className = `enhanced-notification ${type}`;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'enhanced-notification-progress';
        progressBar.style.width = '100%';
        
        const iconElement = document.createElement('div');
        iconElement.className = 'enhanced-notification-icon';
        iconElement.textContent = icon;
        
        const content = document.createElement('div');
        content.className = 'enhanced-notification-content';
        
        const titleElement = document.createElement('div');
        titleElement.className = 'enhanced-notification-title';
        titleElement.textContent = title;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'enhanced-notification-message';
        messageElement.textContent = message;
        
        content.appendChild(titleElement);
        content.appendChild(messageElement);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'enhanced-notification-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        notification.appendChild(progressBar);
        notification.appendChild(iconElement);
        notification.appendChild(content);
        notification.appendChild(closeButton);
        
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-remove if not persistent
        if (!persistent && duration > 0) {
            this.scheduleRemoval(notification, duration);
        }

        return notification;
    }

    scheduleRemoval(notification, duration) {
        const progressBar = notification.querySelector('.enhanced-notification-progress');
        if (progressBar) {
            progressBar.style.transition = `width ${duration}ms linear`;
            progressBar.style.width = '0%';
        }
        
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    removeNotification(notification) {
        if (!notification || !notification.parentNode) return;
        
        notification.classList.remove('show');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
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

    clear() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }
}

// Create global instances
export const enhancedModalManager = new EnhancedModalManager();
export const enhancedNotificationSystem = new EnhancedNotificationSystem();

// Make them globally accessible
window.enhancedModalManager = enhancedModalManager;
window.enhancedNotificationSystem = enhancedNotificationSystem;

export function renderPackingPhotosGallery() {
    const gallery = document.getElementById('packing-photos-gallery');
    if (!gallery) return;
    
    const packingPhotos = currentData.packingPhotos?.photos || [];
    
    if (packingPhotos.length === 0) {
        gallery.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">📸</div>
                <p>עדיין לא הועלו תמונות ציוד</p>
                <p class="text-sm">לחצו על "צלמו ציוד" כדי להוסיף תמונות</p>
            </div>
        `;
        return;
    }
    
    const photosHTML = packingPhotos.map(photo => `
        <div class="packing-photo-item relative group cursor-pointer bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200" 
             data-photo-id="${photo.id}">
            <div class="aspect-square">
                <img src="${photo.url}" alt="${photo.filename}" class="w-full h-full object-cover">
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <button class="delete-packing-photo-btn opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 transition-all duration-200 hover:bg-red-600" 
                        data-photo-id="${photo.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <div class="p-2">
                <p class="text-xs text-gray-600 truncate">${photo.filename}</p>
            </div>
        </div>
    `).join('');
    
    gallery.innerHTML = photosHTML;
}