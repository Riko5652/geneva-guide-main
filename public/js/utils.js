import { currentData as globalData } from './Main.js';

// Modal management system for handling nested modals and back navigation
class ModalManager {
    constructor() {
        this.modalStack = [];
        this.setupBackNavigation();
    }
    
    /**
     * Opens a modal dialog and optionally runs a callback to populate its content.
     * @param {string} modalId The ID of the modal element to open.
     * @param {function} [onOpenCallback] An optional function to run just before the modal is shown.
     */
    openModal(modalId, onOpenCallback) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal with ID '${modalId}' not found.`);
            return;
        }
        
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
            onOpenCallback();
        }
        
        // Add back button if this is a nested modal
        this.addBackButton(modal);
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        
        // Add smooth fade-in animation
        setTimeout(() => {
            modal.style.opacity = '1';
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
        let modalElement;
        let modalId;
        
        if (typeof modal === 'string') {
            modalId = modal;
            modalElement = document.getElementById(modal);
        } else {
            modalElement = modal;
            modalId = modal?.id;
        }
        
        if (!modalElement) return;
        
        // Find and remove from stack
        const stackIndex = this.modalStack.findIndex(item => item.id === modalId);
        if (stackIndex !== -1) {
            this.modalStack.splice(stackIndex, 1);
        }
        
        // Add fade-out animation
        modalElement.style.opacity = '0';
        
        setTimeout(() => {
            modalElement.classList.add('hidden');
            modalElement.style.opacity = ''; // Reset for next time
            
            // Restore scroll if no modals are open
            if (this.modalStack.length === 0) {
                document.body.style.overflow = '';
            }
            
            // Remove back button
            this.removeBackButton(modalElement);
        }, 200);
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
                this.removeBackButton(modalInfo.element);
            }, 200);
        });
        
        document.body.style.overflow = '';
        
        // Restore scroll position to the first modal's position
        if (modalsToClose.length > 0) {
            window.scrollTo(0, modalsToClose[0].scrollPosition);
        }
    }
    
    /**
     * Adds a back button to nested modals
     */
    addBackButton(modal) {
        if (this.modalStack.length <= 1) return;
        
        // Remove existing back button
        this.removeBackButton(modal);
        
        const backButton = document.createElement('button');
        backButton.className = 'modal-back-btn';
        backButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>חזרה</span>
        `;
        
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.goBack();
        });
        
        modal.appendChild(backButton);
    }
    
    /**
     * Removes back button from modal
     */
    removeBackButton(modal) {
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

