import { currentData as globalData } from './Main.js';

// Family-Friendly Loading Experience
export class FamilyLoader {
    constructor() {
        this.loadingMessages = [
            '🧸 מכינים את הדובים לטיול...',
            '🍫 אורזים שוקולד שוויצרי...',
            '🚂 מתדלקים את הרכבת ההרים...',
            '🏔️ מצחצחים את ההרים...',
            '🦢 מאכילים את הברבורים...',
            '⛷️ משחיזים את המגלשיים...',
            '🧀 חותכים גבינה שוויצרית...',
            '🎨 מציירים את הנוף...',
            '🚁 ממריאים לשמיים...',
            '🌊 ממלאים את האגם...'
        ];
        
        this.currentMessageIndex = 0;
        this.messageInterval = null;
    }
    
    show(target = document.body) {
        // Create loading overlay
        const loader = document.createElement('div');
        loader.id = 'family-loader';
        loader.className = 'fixed inset-0 bg-white z-[9999] flex items-center justify-center';
        loader.innerHTML = `
            <div class="text-center p-8 max-w-md">
                <div class="relative w-32 h-32 mx-auto mb-6">
                    <!-- Swiss flag animation -->
                    <div class="absolute inset-0 bg-red-500 rounded-lg animate-pulse"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="bg-white w-16 h-4"></div>
                        <div class="bg-white w-4 h-16 absolute"></div>
                    </div>
                    <!-- Animated plane -->
                    <div class="absolute -top-4 -right-4 text-4xl animate-bounce">✈️</div>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">הטיול שלכם נטען...</h2>
                <p id="loading-message" class="text-lg text-gray-600 animate-pulse"></p>
                <div class="mt-6 flex justify-center space-x-2 space-x-reverse">
                    <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                    <div class="w-3 h-3 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        
        target.appendChild(loader);
        
        // Start rotating messages
        this.updateMessage();
        this.messageInterval = setInterval(() => this.updateMessage(), 2000);
    }
    
    updateMessage() {
        const messageEl = document.getElementById('loading-message');
        if (messageEl) {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                messageEl.textContent = this.loadingMessages[this.currentMessageIndex];
                messageEl.style.opacity = '1';
                this.currentMessageIndex = (this.currentMessageIndex + 1) % this.loadingMessages.length;
            }, 200);
        }
    }
    
    hide() {
        const loader = document.getElementById('family-loader');
        if (loader) {
            clearInterval(this.messageInterval);
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }
}

// Create global instance
export const familyLoader = new FamilyLoader();

// Modal management system for handling nested modals and back navigation
class ModalManager {
    constructor() {
        this.modalStack = [];
        this.setupBackNavigation();
    }
    
    /**
     * Show loading state for modal
     */
    showModalLoading(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Add loading class for visual feedback
        modal.classList.add('modal-loading');
        
        // Show loading indicator if not already present
        let loadingIndicator = modal.querySelector('.modal-loading-indicator');
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'modal-loading-indicator';
            loadingIndicator.innerHTML = `
                <div class="loading-spinner"></div>
                <span>טוען...</span>
            `;
            modal.querySelector('.modal-content')?.prepend(loadingIndicator);
        }
        loadingIndicator.style.display = 'flex';
    }
    
    /**
     * Hide loading state for modal
     */
    hideModalLoading(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('modal-loading');
        
        const loadingIndicator = modal.querySelector('.modal-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    /**
     * Opens a modal dialog and optionally runs a callback to populate its content.
     * @param {string} modalId The ID of the modal element to open.
     * @param {function} [onOpenCallback] An optional function to run just before the modal is shown.
     */
    openModal(modalId, onOpenCallback) {
        console.log('🔍 Looking for modal:', modalId);
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`❌ Modal with ID '${modalId}' not found.`);
            return;
        }
        console.log('✅ Modal found:', modalId, modal);
        
        // Enhanced modal opening with better user feedback
        this.showModalLoading(modalId);
        
        // Add to modal stack for back navigation
        this.modalStack.push({
            id: modalId,
            element: modal,
            callback: onOpenCallback,
            scrollPosition: window.pageYOffset
        });
        
        // Update z-index based on stack position
        const baseZIndex = 1000;
        const zIndex = baseZIndex + (this.modalStack.length * 10);
        modal.style.zIndex = zIndex;
        
        // Run the callback function to build the modal's content just-in-time.
        if (onOpenCallback) {
            try {
                console.log('🔄 Running modal callback for:', modalId);
                onOpenCallback();
                console.log('✅ Modal callback completed for:', modalId);
            } catch (error) {
                console.error('❌ Error in modal callback:', error);
            } finally {
                // Hide loading after callback completes
                this.hideModalLoading(modalId);
            }
        } else {
            // Hide loading immediately if no callback
            this.hideModalLoading(modalId);
        }
        
        // Back button removed - using ESC key and browser back button only
        
        modal.classList.remove('hidden');
        modal.style.setProperty('display', 'flex', 'important'); // Force display to flex with !important
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        
        console.log('🎭 Modal shown, classes:', modal.className);
        console.log('🎭 Modal computed styles:', {
            display: getComputedStyle(modal).display,
            visibility: getComputedStyle(modal).visibility,
            opacity: getComputedStyle(modal).opacity,
            zIndex: getComputedStyle(modal).zIndex
        });
        
        // Add smooth fade-in animation
        setTimeout(() => {
            modal.style.opacity = '1';
            console.log('✨ Modal fade-in animation applied');
            console.log('✨ Modal final styles:', {
                display: getComputedStyle(modal).display,
                visibility: getComputedStyle(modal).visibility,
                opacity: getComputedStyle(modal).opacity,
                zIndex: getComputedStyle(modal).zIndex
            });
        }, 10);
        
        // Update browser history for back button support
        if (this.modalStack.length === 1) {
            history.pushState({ modalOpen: true }, '', window.location.href);
        }
    }
    
    /**
     * Closes the topmost modal or a specific modal
     * @param {HTMLElement|string} modal Modal element or modal ID
     */
    closeModal(modal) {
        console.log('🚪 closeModal called with:', modal);
        let modalElement;
        let modalId;
        
        if (typeof modal === 'string') {
            modalId = modal;
            modalElement = document.getElementById(modal);
        } else {
            modalElement = modal;
            modalId = modal?.id;
        }
        
        console.log('🔍 Modal element found:', modalElement?.id);
        if (!modalElement) {
            console.log('❌ No modal element found, returning');
            return;
        }
        
        // Find and remove from stack
        const stackIndex = this.modalStack.findIndex(item => item.id === modalId);
        if (stackIndex !== -1) {
            this.modalStack.splice(stackIndex, 1);
            console.log('📋 Removed modal from stack, remaining:', this.modalStack.length);
            console.log('📋 Current stack:', this.modalStack.map(m => m.id));
        } else {
            console.log('⚠️ Modal not found in stack, but closing anyway');
            console.log('📋 Current stack:', this.modalStack.map(m => m.id));
        }
        
        // Add fade-out animation
        modalElement.style.opacity = '0';
        console.log('🎭 Starting modal fade-out animation');
        
        setTimeout(() => {
            modalElement.classList.add('hidden');
            modalElement.style.opacity = ''; // Reset for next time
            modalElement.style.setProperty('display', 'none', 'important'); // Force hide
            console.log('🎭 Modal hidden and display set to none');
            
            // Clean up the stack and restore scroll
            this.cleanupModalStack();
            this.restoreBodyScroll();
            
            // Back button removal not needed - no back button exists
        }, 200);
    }
    
    /**
     * Restore body scroll with improved logic
     */
    restoreBodyScroll() {
        // Clean up the modal stack first - remove any modals that are actually hidden
        this.cleanupModalStack();
        
        // Check if any modals are actually visible (not just in stack)
        const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
        const actuallyVisibleModals = Array.from(visibleModals).filter(modal => {
            const style = window.getComputedStyle(modal);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        });
        
        console.log('🔍 Visible modals check:', {
            stackLength: this.modalStack.length,
            hiddenModals: visibleModals.length,
            actuallyVisible: actuallyVisibleModals.length
        });
        
        if (actuallyVisibleModals.length === 0 && this.modalStack.length === 0) {
            // Force remove overflow restrictions while preserving other styles
            document.body.style.overflow = 'auto';
            document.body.style.overflowY = 'auto';
            document.body.style.overflowX = 'hidden';
            console.log('🎭 Body scroll restored - overflow: auto, overflowY: auto, overflowX: hidden');
        } else {
            console.log('⚠️ Found actually visible modals or modals in stack, not restoring body overflow:', {
                visible: actuallyVisibleModals.length,
                inStack: this.modalStack.length
            });
        }
    }
    
    /**
     * Clean up the modal stack by removing hidden modals
     */
    cleanupModalStack() {
        const originalLength = this.modalStack.length;
        this.modalStack = this.modalStack.filter(modalInfo => {
            const modal = modalInfo.element;
            if (!modal) return false;
            
            const style = window.getComputedStyle(modal);
            const isHidden = modal.classList.contains('hidden') || 
                           style.display === 'none' || 
                           style.visibility === 'hidden' || 
                           style.opacity === '0';
            
            if (isHidden) {
                console.log('🧹 Removing hidden modal from stack:', modal.id);
                return false;
            }
            return true;
        });
        
        if (this.modalStack.length !== originalLength) {
            console.log('🧹 Modal stack cleaned up:', {
                original: originalLength,
                current: this.modalStack.length
            });
        }
    }
    
    /**
     * Goes back to the previous modal or closes all modals
     */
    goBack() {
        if (this.modalStack.length > 1) {
            // Close current modal and show previous one
            const currentModal = this.modalStack[this.modalStack.length - 1];
            this.closeModal(currentModal.element);
        } else if (this.modalStack.length === 1) {
            // Close the last modal
            const lastModal = this.modalStack[0];
            this.closeModal(lastModal.element);
            
            // Restore scroll position
            window.scrollTo(0, lastModal.scrollPosition);
        }
    }
    
    /**
     * Closes all open modals
     */
    closeAllModals() {
        const modalsToClose = [...this.modalStack];
        this.modalStack = [];
        
        modalsToClose.forEach(modalInfo => {
            modalInfo.element.style.opacity = '0';
            setTimeout(() => {
                modalInfo.element.classList.add('hidden');
                modalInfo.element.style.opacity = '';
                modalInfo.element.style.setProperty('display', 'none', 'important');
                this.removeBackButton(modalInfo.element);
            }, 200);
        });
        
        // Restore scroll position to the first modal's position
        if (modalsToClose.length > 0) {
            window.scrollTo(0, modalsToClose[0].scrollPosition);
        }
        
        // Use the improved restore logic
        setTimeout(() => {
            this.restoreBodyScroll();
        }, 250); // Slightly longer delay to ensure all modals are hidden
    }
    
    /**
     * Back button functionality removed - using ESC key and browser back button only
     * This provides a cleaner UI while maintaining navigation functionality
     */
    
    /**
     * Removes back button from modal (legacy method - no longer used)
     */
    removeBackButton(modal) {
        // Method kept for compatibility but no longer creates back buttons
        const backButton = modal.querySelector('.modal-back-btn');
        if (backButton) {
            backButton.remove();
        }
    }
    
    /**
     * Sets up browser back button and keyboard navigation
     */
    setupBackNavigation() {
        // Handle browser back button
        window.addEventListener('popstate', (e) => {
            if (this.modalStack.length > 0) {
                e.preventDefault();
                this.closeAllModals();
            }
        });
        
        // Handle ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                e.preventDefault();
                this.goBack();
            }
        });
        
        // Handle modal close button clicks
        document.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('[id*="close-"], .modal-close-btn');
            if (closeBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const modal = closeBtn.closest('.modal');
                if (modal) {
                    this.closeModal(modal);
                }
            }
        });
        
        // Handle modal backdrop clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && this.modalStack.length > 0) {
                e.preventDefault();
                this.goBack();
            }
        });
    }
}

// Create global modal manager instance
const modalManager = new ModalManager();

// Export the modal functions
export function openModal(modalId, onOpenCallback) {
    console.log('🚪 Opening modal:', modalId);
    modalManager.openModal(modalId, onOpenCallback);
}

export function closeModal(modal) {
    modalManager.closeModal(modal);
}

export function goBackModal() {
    modalManager.goBack();
}

export function closeAllModals() {
    modalManager.closeAllModals();
}

/**
 * Force restore body overflow - useful as a fallback
 */
export function forceRestoreBodyOverflow() {
    // Clear the modal stack completely
    modalManager.modalStack = [];
    
    // Force remove all overflow restrictions
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
    
    // Hide all modals
    const allModals = document.querySelectorAll('.modal');
    allModals.forEach(modal => {
        modal.classList.add('hidden');
        modal.style.setProperty('display', 'none', 'important');
        modal.style.opacity = '0';
    });
    
    console.log('🔧 Force restored body overflow and cleared all modals');
}

// Make the force restore function available globally for emergency use
window.forceRestoreBodyOverflow = forceRestoreBodyOverflow;

// Add global modal debugging function
window.debugModals = function() {
    console.log('🔍 Modal Debug Info:');
    console.log('📋 Modal Stack:', modalManager.modalStack.map(m => ({ id: m.id, element: m.element?.id })));
    console.log('🔍 All Modals:', Array.from(document.querySelectorAll('.modal')).map(m => ({
        id: m.id,
        classes: m.className,
        display: getComputedStyle(m).display,
        visibility: getComputedStyle(m).visibility,
        opacity: getComputedStyle(m).opacity
    })));
    console.log('🔒 Body Overflow:', document.body.style.overflow);
    console.log('🔒 Body OverflowY:', document.body.style.overflowY);
    console.log('🔒 Body OverflowX:', document.body.style.overflowX);
};

/**
 * Translates a weather code from the Open-Meteo API to a human-readable description and an icon.
 * @param {number} code The weather code from the API.
 * @returns {{description: string, icon: string}} An object with the description and emoji icon.
 */
export function getWeatherInfo(code) {
    const codes = {
        0: { description: "בהיר", icon: "☀️" },
        1: { description: "בהיר בעיקר", icon: "☀️" },
        2: { description: "מעונן חלקית", icon: "🌤️" },
        3: { description: "מעונן", icon: "☁️" },
        45: { description: "ערפילי", icon: "🌫️" },
        48: { description: "ערפילי", icon: "🌫️" },
        51: { description: "טפטוף קל", icon: "🌦️" },
        53: { description: "טפטוף", icon: "🌦️" },
        55: { description: "טפטוף חזק", icon: "🌦️" },
        61: { description: "גשם קל", icon: "🌧️" },
        63: { description: "גשם", icon: "🌧️" },
        65: { description: "גשם חזק", icon: "🌧️" },
        80: { description: "ממטרים קלים", icon: "🌦️" },
        81: { description: "ממטרים", icon: "🌦️" },
        82: { description: "ממטרים עזים", icon: "⛈️" },
        95: { description: "סופת רעמים", icon: "⛈️" }
    };
    return codes[code] || { description: "לא ידוע", icon: "🤷" };
}

/**
 * Returns a Tailwind CSS class string based on a flight's status.
 * @param {string} status The flight status string (e.g., 'On Time', 'Delayed').
 * @returns {string} Tailwind CSS classes for styling.
 */
export function getStatusClass(status) {
    const safeStatus = status?.toLowerCase() || 'unknown';
    switch (safeStatus) {
        case 'on time': return 'bg-green-100 text-green-800';
        case 'delayed': return 'bg-yellow-100 text-yellow-800';
        case 'canceled': return 'bg-red-100 text-red-800 font-bold';
        default: return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Intelligently gets the opening hours for an activity.
 * If called with a dayIndex (from the itinerary), it shows hours for that specific trip day.
 * If called without a dayIndex (from the general activities list), it shows hours for the current real-world day.
 * @param {object} activity The activity object from Firestore.
 * @param {number|null} dayIndex The zero-based index of the day in the trip, or null.
 * @returns {{today: string, week: string}} An object containing the formatted string for today's/trip day's hours and the full weekly schedule.
 */
export function getFormattedOpeningHours(activity, dayIndex = null) {
    if (!activity || typeof activity.openingHours !== 'object' || activity.openingHours === null) {
        return { today: 'שעות פתיחה לא זמינות', week: 'מידע לא זמין' };
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Format the full weekly schedule for the details dropdown.
    const weeklyHours = Object.entries(activity.openingHours)
        .map(([days, hours]) => `<div class="flex justify-between"><span class="font-semibold">${days}:</span><span>${hours}</span></div>`)
        .join('');

    let targetDate;
    // Determine the correct date to check: either a specific day of the trip or today.
    if (dayIndex !== null && globalData.tripTimeline && globalData.tripTimeline.length > 0) {
        // Calculate the specific date of the trip.
        const tripStartDate = new Date(globalData.tripTimeline[0].date);
        tripStartDate.setDate(tripStartDate.getDate() + dayIndex);
        targetDate = tripStartDate;
    } else {
        // Default to the current real-world date.
        targetDate = new Date();
    }
    
    const targetDayIndex = targetDate.getDay();
    const targetDayName = dayNames[targetDayIndex];
    let dailyHours = 'סגור ביום זה';

    // Find the matching opening hours for the target day.
    for (const key in activity.openingHours) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'everyday' || lowerKey.includes(targetDayName.toLowerCase())) {
            dailyHours = `פתוח: ${activity.openingHours[key]}`;
            break;
        }
        const days = key.split('-').map(d => d.trim());
        if (days.length === 2) {
            const startDay = dayNames.findIndex(d => d.toLowerCase() === days[0].toLowerCase());
            const endDay = dayNames.findIndex(d => d.toLowerCase() === days[1].toLowerCase());
            if (startDay !== -1 && endDay !== -1 && targetDayIndex >= startDay && targetDayIndex <= endDay) {
                dailyHours = `פתוח: ${activity.openingHours[key]}`;
                break;
            }
        }
    }
    
    const prefix = (dayIndex !== null) ? `${targetDate.toLocaleDateString('he-IL', { weekday: 'long' })}: ` : 'היום: ';
    
    return { today: prefix + dailyHours, week: weeklyHours };
}

/**
 * Converts a file to base64 string for API uploads
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 encoded string
 */
export function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Calculates the distance between two points using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point  
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - Sanitized HTML string
 */
export function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    
    // Create a temporary div element to parse the HTML
    const temp = document.createElement('div');
    temp.textContent = html; // This automatically escapes HTML entities
    
    // Get the escaped content and convert line breaks to <br> tags
    return temp.innerHTML
        .replace(/\n/g, '<br>')
        .replace(/\r\n/g, '<br>')
        .replace(/\r/g, '<br>');
}

