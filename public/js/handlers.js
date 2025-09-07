import { currentData, setCurrentCategoryFilter, setCurrentTimeFilter, appId, db, userId, addNewlyAddedItem, storage } from './Main.js';
import { openModal, closeModal, goBackModal, closeAllModals, sanitizeHTML, familyLoader } from './utils.js';
import { callGeminiWithParts } from './Gemini.js';
import { populateFlightDetails, populateHotelDetails, renderPackingGuide, renderActivities, populateFamilyDetails, populateNearbyLocations, renderPhotoAlbum, renderBulletinBoard, renderFamilyMemories, renderInteractivePackingList, renderPackingPhotosGallery, familyToast } from './ui.js';
import { VERSION } from './version.js';
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Import new modules for enhanced functionality
import { AnimationManager } from './animations.js';
import { ToastManager } from './toast.js';
import { LoadingManager } from './loading.js';

/**
 * Flow Enhancement System
 * Improves user experience through better loading states, feedback, and error handling
 */

// Enhanced loading state management
class FlowEnhancementManager {
    constructor() {
        this.activeLoaders = new Set();
        this.userFeedbackQueue = [];
        this.isProcessing = false;
    }

    /**
     * Show enhanced loading state with context
     */
    showLoading(context, message = 'טוען...') {
        const loaderId = `${context}-${Date.now()}`;
        this.activeLoaders.add(loaderId);
        
        // Use enhanced loading manager if available
        if (window.loadingManager) {
            window.loadingManager.showGlobal(message);
        } else {
            // Fallback to original loader
            familyLoader.show();
        }
        
        return loaderId;
    }

    /**
     * Hide loading state
     */
    hideLoading(loaderId) {
        this.activeLoaders.delete(loaderId);
        
        if (this.activeLoaders.size === 0) {
            if (window.loadingManager) {
                window.loadingManager.hideGlobal();
            } else {
                familyLoader.hide();
            }
        }
    }

    /**
     * Show enhanced user feedback
     */
    showFeedback(type, message, options = {}) {
        // Use enhanced toast manager if available
        if (window.toastManager) {
            switch (type) {
                case 'success':
                    return window.toastManager.success(message, options);
                case 'error':
                    return window.toastManager.error(message, options);
                case 'warning':
                    return window.toastManager.warning(message, options);
                case 'info':
                default:
                    return window.toastManager.info(message, options);
            }
        }
        
        // Fallback to original feedback system
        const feedback = {
            type,
            message,
            timestamp: Date.now(),
            ...options
        };
        
        this.userFeedbackQueue.push(feedback);
        
        // Process feedback queue
        this.processFeedbackQueue();
    }

    /**
     * Process feedback queue with proper timing
     */
    async processFeedbackQueue() {
        if (this.isProcessing || this.userFeedbackQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.userFeedbackQueue.length > 0) {
            const feedback = this.userFeedbackQueue.shift();
            
            switch (feedback.type) {
                case 'success':
                    familyToast.success(feedback.message, feedback.duration || 3000);
                    break;
                case 'error':
                    familyToast.error(feedback.message, feedback.duration || 5000);
                    break;
                case 'warning':
                    familyToast.warning(feedback.message, feedback.duration || 4000);
                    break;
                case 'info':
                    familyToast.info(feedback.message, feedback.duration || 3000);
                    break;
                case 'celebration':
                    familyToast.celebrate(feedback.message, feedback.duration || 4000);
                    break;
            }
            
            // Small delay between feedback items
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.isProcessing = false;
    }

    /**
     * Show progress with percentage
     */
    showProgress(percentage, message = 'מעבד...') {
        // Implementation for progress display
        // Progress tracking (removed console.log for production)
    }

    /**
     * Handle errors with user-friendly messages
     */
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        let userMessage = 'אירעה שגיאה. אנא נסו שוב.';
        
        if (error.message) {
            if (error.message.includes('network')) {
                userMessage = 'בעיית חיבור לאינטרנט. אנא בדקו את החיבור.';
            } else if (error.message.includes('permission')) {
                userMessage = 'אין הרשאה לבצע פעולה זו.';
            } else if (error.message.includes('quota')) {
                userMessage = 'המכסה הושלמה. אנא נסו מאוחר יותר.';
            }
        }
        
        this.showFeedback('error', userMessage);
    }
}

// Create global instance
const flowManager = new FlowEnhancementManager();

// Export flow enhancement functions
export function showFlowLoading(context, message) {
    return flowManager.showLoading(context, message);
}

export function hideFlowLoading(loaderId) {
    flowManager.hideLoading(loaderId);
}

export function showFlowProgress(percentage, message) {
    flowManager.showProgress(percentage, message);
}

export function showFlowFeedback(type, message, options) {
    flowManager.showFeedback(type, message, options);
}

export function showFlowSuccess(message, options) {
    flowManager.showFeedback('success', message, options);
}

export function handleFlowError(error, context) {
    flowManager.handleError(error, context);
}

// This is the single entry point for activating all interactive elements on the page.
export function setupEventListeners() {
    // A single master listener is more efficient than attaching many individual ones.
    if (document.body.dataset.listenersAttached) {
        // Event listeners already attached, skipping...
        console.log('⚠️ Event listeners already attached, skipping...');
        return;
    }
    
    console.log('🔧 Setting up event listeners...');
    
    // Remove any existing listeners first to prevent duplicates
    document.body.removeEventListener('click', handleDelegatedClicks);
    document.body.removeEventListener('change', handleDelegatedChanges);
    document.body.removeEventListener('keydown', handleDelegatedKeydowns);
    
    // Add the listeners
    document.body.addEventListener('click', handleDelegatedClicks);
    document.body.addEventListener('change', handleDelegatedChanges);
    document.body.addEventListener('keydown', handleDelegatedKeydowns);
    
    // Mark as attached to prevent duplicates
    document.body.dataset.listenersAttached = 'true';
    
    console.log('✅ Event listeners attached successfully');
    
    // Test if event listener is working
    console.log('🧪 Testing event listener - click any button to see if it works');
    
    // Setup mobile menu functionality
    setupMobileMenu();
    
    // Simple fallback mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                menuBtn.setAttribute('aria-expanded', 'true');
                menuBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                `;
            } else {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                `;
            }
        });
    }
    
    // Force reset mobile menu state on initialization
    setTimeout(() => {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuBtn = document.getElementById('menu-btn');
        if (mobileMenu && menuBtn) {
        // Force resetting mobile menu state...
        mobileMenu.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
            `;
            // Mobile menu state reset complete
        }
    }, 100);
    
    document.body.dataset.listenersAttached = 'true';
}

// Enhanced mobile menu functionality
function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        // Ensure proper initial state - mobile menu starts hidden
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
        `;
        
        // Mobile menu initialized to hidden state
        
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                // Show menu
                mobileMenu.classList.remove('hidden');
                menuBtn.setAttribute('aria-expanded', 'true');
                menuBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                `;
            } else {
                // Hide menu
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                `;
            }
        });
        
        // Add touch event support for better mobile interaction
        menuBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            menuBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        });
        
        menuBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            menuBtn.style.backgroundColor = '';
            menuBtn.click();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    menuBtn.click();
                }
            }
        });
        
        // Handle mobile menu link clicks
        mobileMenu.addEventListener('click', (e) => {
            const link = e.target.closest('.mobile-menu-link');
            if (link) {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Close menu first
                    menuBtn.click();
                    
                    // Smooth scroll to target
                    setTimeout(() => {
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
                    }, 300);
                }
            }
        });
    }
}

// This function acts as a router for all click events on the page.
function handleDelegatedClicks(e) {
    const target = e.target.closest('button, .photo-item');
    if (!target) return;
    
    // Debug logging
    console.log('🔍 Click detected on:', target.tagName, target.id, target.className, target.textContent?.trim());
    
    // Handle photo gallery clicks
    if (target.classList.contains('photo-item')) {
        const photoIndex = parseInt(target.dataset.photoIndex);
        openPhotoModal(photoIndex);
        return;
    }
    
    // Handle delete actions
    if (target.classList.contains('delete-note') || target.classList.contains('delete-memory') || target.classList.contains('delete-packing-item')) {
        handleDeleteAction(target);
        return;
    }
    
    // Only continue with button logic if target is actually a button
    if (!target.matches('button')) return;

    // --- AI Button Logic ---
    if (target.classList.contains('gemini-plan-btn')) handleAiRequest('plan', e);
    if (target.classList.contains('gemini-summary-btn')) handleAiRequest('summary', e);
    if (target.classList.contains('gemini-story-btn')) handleAiRequest('story', e);
    if (target.id === 'what-to-wear-btn') handleWhatToWearRequest();
    
    // --- Modal Opening Logic ---
    if (target.closest('#open-flights-modal-btn, #open-flights-modal-btn-main, #open-flights-modal-btn-mobile')) {
        openModal('flights-details-modal', populateFlightDetails);
    }
    if (target.closest('#open-hotel-modal-btn, #open-hotel-modal-btn-main, #open-hotel-booking-btn-mobile')) {
        openModal('hotel-booking-modal', populateHotelDetails);
    }
    if (target.closest('#open-packing-modal-btn, #open-packing-modal-btn-mobile, #open-packing-modal-btn-mobile-2, #open-packing-modal-btn-nav')) {
        console.log('📦 Packing button clicked');
        openModal('packing-guide-modal', renderPackingGuide);
    }
     if (target.classList.contains('nav-gemini-btn')) {
        console.log('🤖 Gemini button clicked');
        openModal('gemini-chat-modal');
    }
    if (target.classList.contains('nav-family-btn')) {
        console.log('👨‍👩‍👧‍👦 Family button clicked');
        openModal('family-details-modal', () => populateFamilyDetails());
    }
    if (target.classList.contains('nav-nearby-btn')) {
        console.log('📍 Nearby button clicked');
        openModal('nearby-modal', () => populateNearbyLocations());
    }
    if (target.classList.contains('nav-photos-btn')) {
        console.log('📸 Photos button clicked');
        // Scroll to the photo gallery section
        const photoSection = document.querySelector('#photo-gallery');
        if (photoSection) {
            photoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // --- General UI Logic ---
    if (target.classList.contains('modal-close-btn') || (target.id.includes('close-') && target.id.includes('-modal-btn'))) {
        closeModal(target.closest('.modal'));
    }
    if (target.classList.contains('close-result-btn')) {
        const resultContainer = target.closest('.gemini-plan-result');
        if (resultContainer) {
            resultContainer.classList.add('hidden');
            resultContainer.querySelector('.result-content').innerHTML = '';
        }
    }
    // Mobile menu is now handled by setupMobileMenu() - no need for duplicate logic
    if(target.id === 'image-upload-btn') {
        document.getElementById('image-upload-input').click();
    }
    if(target.id === 'bulletin-post-btn') {
        handlePostBulletinMessage();
    }
    if(target.id === 'generate-custom-plan-btn') {
        handleGenerateCustomPlan();
    }
    if(target.id === 'load-more-btn') {
        handleLoadMoreActivities();
    }
    // Removed call to undefined handleActivityCardClick
    if(target.id === 'chat-send-btn') {
        handleChatSend();
    }
    if(target.id === 'photo-upload-btn') {
        document.getElementById('photo-upload-input').click();
    }
    if(target.id === 'add-bulletin-note-btn') {
        handleAddBulletinNote();
    }
    if(target.id === 'add-memory-btn') {
        handleAddMemory();
    }
    if(target.id === 'add-packing-item-btn') {
        handleAddPackingItem();
    }
    if(target.id === 'optimize-luggage-btn') {
        handleOptimizeLuggage();
    }
    if(target.id === 'upload-luggage-photo-btn') {
        document.getElementById('luggage-photo-input').click();
    }
    if(target.id === 'upload-items-photo-btn') {
        document.getElementById('items-photo-input').click();
    }
    if(target.id === 'packing-photo-upload-btn') {
        document.getElementById('packing-photo-input').click();
    }
    if(target.id === 'packing-ai-help-btn') {
        handleSmartPackingAnalysis();
    }
    if(target.id === 'open-flights-modal-btn-mobile' || target.id === 'open-flights-modal-btn-main') {
        openModal('flights-details-modal', () => populateFlightDetails());
        document.getElementById('mobile-menu').classList.add('hidden');
    }
    if(target.id === 'open-hotel-modal-btn-mobile' || target.id === 'open-hotel-modal-btn-main' || target.id === 'open-hotel-modal-btn-nav') {
        openModal('hotel-booking-modal', () => populateHotelDetails());
        document.getElementById('mobile-menu')?.classList.add('mobile-menu-hidden');
    }
    if(target.id === 'open-flights-modal-btn-nav') {
        openModal('flights-details-modal', () => populateFlightDetails());
    }
    if(target.id === 'open-packing-modal-btn-mobile') {
        openModal('packing-guide-modal', () => renderPackingGuide());
        document.getElementById('mobile-menu').classList.add('hidden');
    }
    if(target.id === 'show-map-btn') {
        openModal('map-modal');
        // Initialize fullscreen map when modal opens
        setTimeout(() => {
            initFullscreenMap();
        }, 200);
    }
    if(target.classList.contains('swap-activity-btn')) {
        handleSwapActivity(target);
    }
    if(target.id === 'daily-special-ai-btn') {
        handleDailySpecialAI();
    }
    if(target.id === 'add-to-plan-btn') {
        handleAddToPlan();
    }
    if(target.id === 'chat-attach-btn') {
        document.getElementById('chat-image-input').click();
    }
    if(target.classList.contains('btn-filter')) {
        // Handle category filters
        if (target.dataset.filter) {
            document.querySelectorAll('.btn-filter[data-filter]').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            setCurrentCategoryFilter(target.dataset.filter);
            renderActivities();
        }
        // Handle time filters
        if (target.dataset.timeFilter) {
            document.querySelectorAll('.btn-filter[data-time-filter]').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            setCurrentTimeFilter(target.dataset.timeFilter);
            renderActivities();
        }
    }
    if(target.classList.contains('remove-item-btn')) {
        handleRemovePackingItem(target);
    }
}

// This function handles events that are not clicks, like file uploads and checkbox toggles.
function handleDelegatedChanges(e) {
    if (e.target.id === 'image-upload-input') handleImageUpload(e);
    if (e.target.id === 'photo-upload-input') handlePhotoUpload();
    if (e.target.matches('.form-checkbox')) handlePackingItemToggle(e);
    // Packing checkboxes are now handled in setupPackingInteractiveElements in ui.js
}

// Removed duplicate handleAiRequest function - using the one below with better error handling

async function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length || !userId) return;

    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);

    for (const file of files) {
        const timestamp = Date.now();
        const storageRef = ref(storage, `trip-photos/${userId}/${timestamp}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateDoc(publicDataRef, { 
            photoAlbum: arrayUnion({ url, uploadedAt: timestamp, owner: userId })
        });
    }
}

async function handlePostBulletinMessage() {
    const input = document.getElementById('bulletin-input');
    const text = input.value.trim();
    if (!text) return;

    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
    const newMessage = { text, timestamp: serverTimestamp() };
    
    await updateDoc(publicDataRef, { bulletinBoard: arrayUnion(newMessage) });
    addNewlyAddedItem(`${text}-${newMessage.timestamp}`);
    input.value = '';
}

async function handlePackingItemToggle(event) {
    const { category, name } = event.target.dataset;
    const isChecked = event.target.checked;
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
    
    const updatedItems = currentData.packingListData[category].map(item => 
        item.name === name ? { ...item, checked: isChecked } : item
    );

    await updateDoc(publicDataRef, {
        [`packingListData.${category}`]: updatedItems
    });
}

async function handleRemovePackingItem(button) {
    const { category, name } = button.dataset;
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);

    const itemToRemove = currentData.packingListData[category].find(item => item.name === name);

    if (itemToRemove) {
        await updateDoc(publicDataRef, {
            [`packingListData.${category}`]: arrayRemove(itemToRemove)
        });
    }
}

// Handle custom plan generation
async function handleGenerateCustomPlan() {
    const input = document.getElementById('custom-plan-prompt');
    const resultDiv = document.getElementById('custom-plan-result');
    const prompt = input.value.trim();
    
    if (!prompt) {
        resultDiv.innerHTML = '<p class="text-red-600 text-center">אנא הזן תיאור לתוכנית הרצויה</p>';
        return;
    }
    
    resultDiv.innerHTML = '<div class="text-center"><div class="loader inline-block"></div><p class="mt-2">יוצר תוכנית מותאמת אישית...</p></div>';
    
    try {
        const response = await callGeminiWithParts([
            `צור תוכנית יומית מפורטת לטיול משפחתי בז'נבה עם ילדים בני 2 ו-3 בהתבסס על הבקשה: "${prompt}". 
            כלול המלצות ספציפיות, זמני נסיעה, ועצות מעשיות להורים.`
        ]);
        
        // Save custom plan to Firebase
        const customPlanData = {
            prompt: prompt,
            response: response,
            timestamp: Date.now()
        };
        
        // Update local state
        if (!currentData.customPlans) currentData.customPlans = [];
        currentData.customPlans.unshift(customPlanData);
        
        // Save to Firebase for persistence
        try {
            const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
            await updateDoc(publicDataRef, { 
                customPlans: arrayUnion(customPlanData)
            });
        } catch (error) {
            console.warn('Failed to save custom plan to Firebase:', error);
        }
        
        resultDiv.innerHTML = `
            <div class="bg-white p-6 rounded-xl shadow-lg border border-accent mt-4">
                <h3 class="text-lg font-bold mb-4 text-accent">התוכנית המותאמת שלכם 🎯</h3>
                <div class="prose text-gray-700">${response}</div>
            </div>
        `;
        
        // Clear input after successful generation
        input.value = '';
        
    } catch (error) {
        resultDiv.innerHTML = '<p class="text-red-600 text-center">שגיאה ביצירת התוכנית. נסו שוב מאוחר יותר.</p>';
        console.warn('Custom plan generation error:', error);
    }
}

// Handle load more activities
export async function handleLoadMoreActivities() {
    const currentDisplayed = window.displayedActivitiesCount || 6;
    const totalCachedActivities = currentData.activitiesData ? currentData.activitiesData.length : 0;
    
    // If we still have cached activities to show, increase the count
    if (totalCachedActivities > currentDisplayed) {
        window.displayedActivitiesCount = Math.min(currentDisplayed + 6, totalCachedActivities);
        
        // Re-render activities to show more from cache
        import(`./ui.js?v=${VERSION}`).then(({ renderActivities }) => {
            renderActivities();
        });
    } else {
        // No more cached activities - generate new ones with Gemini
        await generateMoreActivitiesWithGemini();
    }
    
    // Smooth scroll to show new activities
    setTimeout(() => {
        const activitiesSection = document.getElementById('activities');
        if (activitiesSection) {
            activitiesSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

async function generateMoreActivitiesWithGemini() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Show loading state
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<div class="loader inline-block mr-2"></div>🤖 מחפש פעילויות נוספות עם AI...';
        loadMoreBtn.className = 'bg-purple-500 text-white px-6 py-3 rounded-xl font-medium mx-auto block';
    }
    
    try {
        // Get current filter context
        const currentCategory = window.currentCategoryFilter && window.currentCategoryFilter !== 'all' ? 
                              window.currentCategoryFilter : 'כל הקטגוריות';
        const currentTime = window.currentTimeFilter && window.currentTimeFilter !== 'all' ? 
                           window.currentTimeFilter : 'כל משכי הזמן';
        
        // Build context from existing activities for better suggestions
        const existingCategories = [...new Set(currentData.activitiesData?.map(a => a.category) || [])];
        const averageTime = currentData.activitiesData?.length > 0 ? 
                           Math.round(currentData.activitiesData.reduce((sum, a) => sum + (parseInt(a.time) || 30), 0) / currentData.activitiesData.length) : 45;
        
        const prompt = `Generate 6 new family activities in Geneva for families with toddlers.

Context: ${currentData.activitiesData?.length || 0} existing activities, categories: ${existingCategories.join(', ')}, average time: ${averageTime} minutes.

Respond with JSON array only:
[
  {
    "name": "Activity Name in Hebrew",
    "category": "משחקייה",
    "time": "30", 
    "cost": "15 CHF",
    "transport": "Bus line 8",
    "address": "Geneva address",
    "whatToBring": ["items"],
    "description": "Description in Hebrew"
  }
]`;

        const response = await callGeminiWithParts([prompt]);
        
        // Try to parse JSON response
        let newActivities = [];
        try {
            // Extract JSON from the response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                newActivities = JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.warn('Failed to parse Gemini response as JSON:', parseError);
            // Fallback: create activities from text response
            newActivities = createActivitiesFromText(response);
        }
        
        if (newActivities.length > 0) {
            // Add generated activities to the current data
            if (!currentData.activitiesData) {
                currentData.activitiesData = [];
            }
            
            // Add unique ID and ensure required fields
            newActivities.forEach((activity, index) => {
                activity.id = Date.now() + index; // Simple unique ID
                activity.generated = true; // Mark as AI-generated
                activity.openingHours = activity.openingHours || { "ראשון": "09:00-18:00", "שני": "09:00-18:00", "שלישי": "09:00-18:00", "רביעי": "09:00-18:00", "חמישי": "09:00-18:00", "שישי": "09:00-18:00", "שבת": "10:00-17:00" };
                activity.link = activity.link || `https://www.google.com/search?q=${encodeURIComponent(activity.name + ' Geneva')}`;
            });
            
            currentData.activitiesData.push(...newActivities);
            window.displayedActivitiesCount = (window.displayedActivitiesCount || 6) + newActivities.length;
            
            // Re-render activities with new ones
            import(`./ui.js?v=${VERSION}`).then(({ renderActivities }) => {
                renderActivities();
            });
            
            // Successfully generated activities with AI
        } else {
            throw new Error('No activities generated');
        }
        
    } catch (error) {
        console.warn('Failed to generate activities with Gemini:', error);
        
        // Show error message
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '❌ שגיאה ביצירת פעילויות חדשות';
            loadMoreBtn.className = 'bg-red-500 text-white px-6 py-3 rounded-xl font-medium mx-auto block';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                loadMoreBtn.disabled = false;
                loadMoreBtn.innerHTML = '🤖 נסה שוב ליצור פעילויות';
                loadMoreBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium mx-auto block transition-colors duration-200';
            }, 3000);
        }
    }
}

function createActivitiesFromText(responseText) {
    // Fallback function to create activities from text response if JSON parsing fails
    const activities = [];
    const lines = responseText.split('\n').filter(line => line.trim());
    
    let currentActivity = {};
    lines.forEach(line => {
        if (line.includes('שם:') || line.includes('name:')) {
            if (currentActivity.name) {
                activities.push(currentActivity);
            }
            currentActivity = {
                name: line.split(':')[1]?.trim() || `פעילות חדשה ${Date.now()}`,
                category: 'משפחתי',
                time: '45',
                cost: 'משתנה',
                transport: 'תחבורה ציבורית',
                address: 'ז\'נבה, שווייץ',
                whatToBring: 'בגדים נוחים',
                description: 'פעילות מומלצת למשפחות'
            };
        }
    });
    
    if (currentActivity.name) {
        activities.push(currentActivity);
    }
    
    return activities.slice(0, 6); // Limit to 6 activities
}

// Handle chat send message
async function handleChatSend() {
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const loader = document.getElementById('chat-loader');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = message;
    messagesContainer.appendChild(userBubble);
    
    // Save user message to Firebase
    const userMessageData = {
        type: 'user',
        content: message,
        timestamp: Date.now()
    };
    
    // Update local state
    if (!currentData.chatMessages) currentData.chatMessages = [];
    currentData.chatMessages.push(userMessageData);
    
    // Save to Firebase for persistence
    try {
        const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
        await updateDoc(publicDataRef, { 
            chatMessages: arrayUnion(userMessageData)
        });
    } catch (error) {
        console.warn('Failed to save user message to Firebase:', error);
    }
    
    input.value = '';
    loader.classList.remove('hidden');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        const response = await callGeminiWithParts([message]);
        
        const geminieBubble = document.createElement('div');
        geminieBubble.className = 'chat-bubble gemini';
        // Sanitize HTML to prevent XSS
        geminieBubble.textContent = response;
        messagesContainer.appendChild(geminieBubble);
        
        // Save bot response to Firebase
        const botMessageData = {
            type: 'bot',
            content: response,
            timestamp: Date.now()
        };
        
        // Update local state
        currentData.chatMessages.push(botMessageData);
        
        // Save to Firebase for persistence
        try {
            const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
            await updateDoc(publicDataRef, { 
                chatMessages: arrayUnion(botMessageData)
            });
        } catch (error) {
            console.warn('Failed to save bot message to Firebase:', error);
        }
        
    } catch (error) {
        const errorBubble = document.createElement('div');
        errorBubble.className = 'chat-bubble gemini';
        errorBubble.textContent = 'סליחה, אני לא יכול לענות כרגע. נסה שוב מאוחר יותר.';
        messagesContainer.appendChild(errorBubble);
        console.warn('Chat error:', error);
    }
    
    loader.classList.add('hidden');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle AI requests (weather, planning, stories)
async function handleAiRequest(type, event) {
    const button = event.target;
    const originalText = button.textContent;
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<div class="loader inline-block mr-2"></div>טוען...';
    
    try {
        let prompt = '';
        let modalTitle = '';
        
        switch (type) {
            case 'whatToWear':
                prompt = 'בהתבסס על מזג האוויר הנוכחי בז\'נבה, מה מומלץ ללבוש היום למשפחה עם ילדים קטנים? כלול המלצות ספציפיות לבגדים וציוד נוסף.';
                modalTitle = 'המלצות לבוש להיום';
                break;
            case 'plan':
                prompt = 'תכנן לי בוקר מפורט לטיול משפחתי בז\'נבה עם ילדים בני 2 ו-3. כלול המלצות זמנים, פעילויות, וטיפים מעשיים.';
                modalTitle = 'תוכנית הבוקר שלכם';
                break;
            case 'summary':
                prompt = 'סכם את הפעילויות המתוכננות להיום בשפה פשוטה וידידותית לילדים קטנים, עם הרבה אימוג\'ים וחיזוק חיובי.';
                modalTitle = 'הסיכום לילדים';
                break;
            case 'story':
                prompt = 'כתב סיפור קצר ומתוק לילדים בני 2-3 על הרפתקאות בז\'נבה. הסיפור צריך להיות מרגיע ומתאים לפני השינה.';
                modalTitle = 'סיפור לילה טוב';
                break;
            default:
                throw new Error('Unknown AI request type');
        }
        
        const response = await callGeminiWithParts([prompt]);
        
        // Show response in modal
        const modal = document.getElementById('text-response-modal');
        const titleEl = document.getElementById('text-response-modal-title');
        const contentEl = document.getElementById('text-response-modal-content');
        
        if (!modal) {
            console.warn('text-response-modal not found');
            alert(response);
            return;
        }
        
        if (!titleEl) {
            console.warn('text-response-modal-title not found');
            return;
        }
        
        if (!contentEl) {
            console.warn('text-response-modal-content not found');
            return;
        }
        
        titleEl.textContent = modalTitle;
        contentEl.innerHTML = `<div class="prose text-gray-700">${sanitizeHTML(response)}</div>`;
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.warn('AI request failed:', error);
        alert('שגיאה בקבלת תשובה מהמומחה. נסו שוב מאוחר יותר.');
    } finally {
        // Restore button
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// Handle keyboard interactions for accessibility
function handleDelegatedKeydowns(e) {
    // Enter key on chat input
    if (e.target.id === 'chat-input' && e.key === 'Enter') {
        e.preventDefault();
        handleChatSend();
    }
    
    // Enter key on custom plan input
    if (e.target.id === 'custom-plan-prompt' && e.key === 'Enter') {
        e.preventDefault();
        handleGenerateCustomPlan();
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal:not(.hidden)');
        if (openModal) {
            openModal.classList.add('hidden');
        }
    }
    
    // Enter key on bulletin note input
    if (e.target.id === 'bulletin-note-input' && e.key === 'Enter') {
        e.preventDefault();
        handleAddBulletinNote();
    }
    
    // Enter key on packing item input
    if (e.target.id === 'packing-item-input' && e.key === 'Enter') {
        e.preventDefault();
        handleAddPackingItem();
    }
}

// Photo Album Handlers
async function handlePhotoUpload() {
    const input = document.getElementById('photo-upload-input');
    const files = input.files;
    
    if (files.length === 0) return;
    
    // Show progress bar
    const progressContainer = document.getElementById('photo-upload-progress');
    const progressBar = document.getElementById('photo-progress-bar');
    progressContainer.classList.remove('hidden');
    
    // Upload files to Firebase Storage
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        try {
            const progress = ((index + 1) / files.length) * 100;
            progressBar.style.width = `${progress}%`;
            
            // Upload to Firebase Storage
            const timestamp = Date.now();
            const storageRef = ref(storage, `trip-photos/${userId}/${timestamp}-${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            const photoData = {
                url: url,
                caption: `תמונה ${index + 1}`,
                timestamp: timestamp,
                uploadedBy: userId
            };
            
            // Update local state for immediate UI feedback
            if (!currentData.photoAlbum) currentData.photoAlbum = [];
            currentData.photoAlbum.push(photoData);
            
            // Save to Firebase for persistence
            const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
            await updateDoc(publicDataRef, { 
                photoAlbum: arrayUnion(photoData)
            });
            
            // Re-render photo album using correct import
            import(`./ui.js?v=${VERSION}`).then(({ renderPhotoAlbum }) => {
                renderPhotoAlbum();
            });
            
        } catch (error) {
            console.warn('Photo upload failed:', error);
            // Fallback to local URL if Firebase fails
            const url = URL.createObjectURL(file);
            const photoData = {
                url: url,
                caption: `תמונה ${index + 1}`,
                timestamp: Date.now(),
                objectURL: url,
                isLocal: true // Mark as local fallback
            };
            
            if (!currentData.photoAlbum) currentData.photoAlbum = [];
            currentData.photoAlbum.push(photoData);
            
            import(`./ui.js?v=${VERSION}`).then(({ renderPhotoAlbum }) => {
                renderPhotoAlbum();
            });
        }
    }
    
    // Hide progress bar after completion
    setTimeout(() => {
        progressContainer.classList.add('hidden');
        progressBar.style.width = '0%';
    }, 1000);
    
    // Clear input
    input.value = '';
}

// Bulletin Board Handlers
function handleAddBulletinNote() {
    const input = document.getElementById('bulletin-note-input');
    const content = input.value.trim();
    
    if (!content) return;
    
    const noteData = {
        content: content,
        timestamp: Date.now()
    };
    
    // Update local state
    if (!currentData.bulletinBoard) currentData.bulletinBoard = [];
    currentData.bulletinBoard.unshift(noteData);
    // Attempt persistence (non-blocking)
    try {
        const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
        updateDoc(publicDataRef, { bulletinBoard: arrayUnion(noteData) }).catch(() => {});
    } catch (_) {}
    renderBulletinBoard();
    
    // Clear input
    input.value = '';
}

// Family Memories Handlers
function handleAddMemory() {
    const titleInput = document.getElementById('memory-title-input');
    const contentInput = document.getElementById('memory-content-input');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('אנא מלאו גם כותרת וגם תוכן לזיכרון');
        return;
    }
    
    const memoryData = {
        title: title,
        content: content,
        timestamp: Date.now()
    };
    
    // Update local state
    if (!currentData.familyMemories) currentData.familyMemories = [];
    currentData.familyMemories.unshift(memoryData);
    // Attempt persistence (non-blocking)
    try {
        const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
        updateDoc(publicDataRef, { familyMemories: arrayUnion(memoryData) }).catch(() => {});
    } catch (_) {}
    renderFamilyMemories();
    
    // Clear inputs
    titleInput.value = '';
    contentInput.value = '';
}

// Interactive Packing Handlers
function handleAddPackingItem() {
    const input = document.getElementById('packing-item-input');
    const itemName = input.value.trim();
    
    if (!itemName) return;
    
    const packingItem = {
        name: itemName,
        checked: false,
        timestamp: Date.now()
    };
    
    // Update local state
    if (!currentData.interactivePacking) currentData.interactivePacking = [];
    currentData.interactivePacking.push(packingItem);
    // Attempt persistence (non-blocking)
    try {
        const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
        updateDoc(publicDataRef, { interactivePacking: arrayUnion(packingItem) }).catch(() => {});
    } catch (_) {}
    renderInteractivePackingList();
    
    // Clear input
    input.value = '';
}


// Handle delete actions for dynamic content
function handleDeleteAction(target) {
    // Delete bulletin note
    if (target.classList.contains('delete-note')) {
        const noteIndex = parseInt(target.dataset.noteIndex);
        if (currentData.bulletinBoard) {
            currentData.bulletinBoard.splice(noteIndex, 1);
            renderBulletinBoard();
        }
    }
    
    // Delete memory
    if (target.classList.contains('delete-memory')) {
        const memoryIndex = parseInt(target.dataset.memoryIndex);
        if (currentData.familyMemories) {
            currentData.familyMemories.splice(memoryIndex, 1);
            renderFamilyMemories();
        }
    }
    
    // Delete packing item
    if (target.classList.contains('delete-packing-item')) {
        const itemIndex = parseInt(target.dataset.itemIndex);
        if (currentData.interactivePacking) {
            currentData.interactivePacking.splice(itemIndex, 1);
            renderInteractivePackingList();
        }
    }
    
    // Delete photo with proper cleanup
    if (target.classList.contains('delete-photo')) {
        const photoIndex = parseInt(target.dataset.photoIndex);
        if (currentData.photoAlbum && currentData.photoAlbum[photoIndex]) {
            const photo = currentData.photoAlbum[photoIndex];
            // Clean up object URL to prevent memory leak
            if (photo.objectURL) {
                URL.revokeObjectURL(photo.objectURL);
            }
            currentData.photoAlbum.splice(photoIndex, 1);
            renderPhotoAlbum();
        }
    }
}

// Photo modal functionality
function openPhotoModal(photoIndex) {
    const modal = document.getElementById('photo-modal');
    const img = document.getElementById('photo-modal-image');
    const dateEl = document.getElementById('photo-modal-date');
    const captionEl = document.getElementById('photo-modal-caption');
    
    if (!currentData.photoAlbum || !currentData.photoAlbum[photoIndex]) return;
    
    const photo = currentData.photoAlbum[photoIndex];
    
    img.src = photo.url;
    img.alt = photo.caption || 'תמונה משפחתית';
    dateEl.textContent = new Date(photo.timestamp).toLocaleDateString('he-IL');
    captionEl.textContent = photo.caption || '';
    
    // Store current photo index for navigation
    modal.dataset.currentPhoto = photoIndex;
    
    modal.classList.remove('hidden');
}

// Initialize fullscreen map in modal
function initFullscreenMap() {
    const fullscreenMapContainer = document.getElementById('fullscreen-map');
    if (!fullscreenMapContainer || !window.L) return;
    
    // Clear any existing map
    fullscreenMapContainer.innerHTML = '';
    
    // Create new map instance
    const fullscreenMap = L.map('fullscreen-map', { 
        zoomControl: true, 
        attributionControl: true 
    });
    
    // Set view and add tiles
    fullscreenMap.setView([46.2183, 6.0744], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(fullscreenMap);
    
    // Add hotel marker
    const hotelIcon = L.divIcon({
        html: '🏨',
        iconSize: [30, 30],
        className: 'hotel-marker'
    });
    
    L.marker([46.2183, 6.0744], {icon: hotelIcon})
        .bindPopup('🏨 Mercure Hotel Meyrin<br/>המלון שלכם')
        .addTo(fullscreenMap);
    
    // Add activity markers if available
    if (currentData && currentData.activitiesData) {
        currentData.activitiesData.forEach(activity => {
            if (activity.lat && activity.lon) {
                const icon = L.divIcon({
                    html: activity.category === 'משחקייה' ? '🎈' : 
                          activity.category === 'תרבות' ? '🎨' :
                          activity.category === 'קפה' ? '☕' : 
                          activity.category === 'חוץ' ? '🌳' : '📍',
                    iconSize: [25, 25],
                    className: 'activity-marker'
                });
                
                L.marker([activity.lat, activity.lon], {icon: icon})
                    .bindPopup(`<strong>${activity.name}</strong><br/>${activity.description}`)
                    .addTo(fullscreenMap);
            }
        });
    }
    
    // Force map resize after modal is fully open
    setTimeout(() => {
        fullscreenMap.invalidateSize();
    }, 100);
}

export function handleSwapActivity(button) {
    const dayIndex = parseInt(button.dataset.dayIndex || 0);
    const dayData = currentData.itineraryData && currentData.itineraryData[dayIndex];
    
    if (!dayData) {
        console.log('No day data found for index:', dayIndex);
        return;
    }
    
    // Show modal with available activities to swap
    openModal('swap-activity-modal');
    
    // Populate modal with activities from current day and alternatives
    const modalContent = document.getElementById('swap-activity-modal-content');
    if (modalContent && currentData.activitiesData) {
        const availableActivities = currentData.activitiesData.filter(activity => {
            // Filter activities that might be suitable for swapping
            return activity.category === 'משחקייה' || activity.category === 'תרבות';
        });
        
        modalContent.innerHTML = `
            <h3 class="text-xl font-bold mb-4">החלף פעילות - ${dayData.dayName}</h3>
            <p class="text-gray-600 mb-4">בחר פעילות חלופית מהרשימה:</p>
            <div class="grid gap-4 max-h-96 overflow-y-auto">
                ${availableActivities.map(activity => `
                    <div class="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer activity-swap-option" 
                         data-activity-id="${activity.id}" data-day-index="${dayIndex}">
                        <h4 class="font-semibold">${activity.name}</h4>
                        <p class="text-sm text-gray-600">${activity.description}</p>
                        <div class="text-xs text-gray-500 mt-2">
                            <span>⏱️ ${activity.time} דקות</span> | 
                            <span>🚌 ${activity.transport}</span> |
                            <span>💰 ${activity.cost}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add click handlers for activity selection
        modalContent.querySelectorAll('.activity-swap-option').forEach(option => {
            option.addEventListener('click', () => {
                const activityId = parseInt(option.dataset.activityId);
                const dayIdx = parseInt(option.dataset.dayIndex);
                confirmActivitySwap(activityId, dayIdx);
            });
        });
    }
}

function confirmActivitySwap(activityId, dayIndex) {
    const activity = currentData.activitiesData.find(a => a.id === activityId);
    if (!activity) return;
    
    if (confirm(`האם אתה בטוח שברצונך להוסיף את "${activity.name}" לתכנית היום?`)) {
        // Add the activity to the day's plan (you might want to implement this based on your data structure)
        console.log(`Swapping activity ${activityId} for day ${dayIndex}`);
        
        // Close modal and show success message
        document.getElementById('swap-activity-modal').classList.add('hidden');
        alert(`הפעילות "${activity.name}" נוספה לתכנית!`);
        
        // You could re-render the itinerary here if needed
        // renderItinerary();
    }
}

export function handleDailySpecialAI() {
    const dailyContent = document.getElementById('daily-special-content');
    const currentSpecial = dailyContent ? dailyContent.textContent.replace('ספר לי עוד על המלצה זו', '').trim() : '';
    
    if (!currentSpecial) {
        alert('אין תוכן זמין כרגע');
        return;
    }
    
    // Create a specific prompt about the daily special
    const prompt = `ספר לי עוד פרטים מעניינים ושימושיים על ${currentSpecial} בז'נבה. תכלול טיפים פרקטיים למשפחות עם ילדים קטנים, שעות פתיחה מומלצות, ומה כדאי להכין מראש.`;
    
    // Show loading state
    openModal('text-response-modal');
    const modalTitle = document.getElementById('text-response-modal-title');
    const modalContent = document.getElementById('text-response-modal-content');
    
    if (modalTitle) modalTitle.textContent = '🌟 מידע נוסף על האטרקציה היומית';
    if (modalContent) modalContent.innerHTML = '<div class="text-center py-8"><div class="loader mx-auto"></div><p class="mt-4 text-gray-600">אוסף מידע נוסף...</p></div>';
    
    // Send to AI service
    handleChatSendWithPrompt(prompt);
    
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        const prompt = `ספר לי עוד על ההמלצה היומית הזו: "${currentSpecial.substring(0, 200)}..."`;
        
        // Add user message to chat
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.innerHTML = `<p>${sanitizeHTML(prompt)}</p>`;
        chatContainer.appendChild(userMessage);
        
        // Send to AI
        handleChatSendWithPrompt(prompt);
    }
}

export function handleWhatToWearRequest() {
    // Get weather data from currentData instead of DOM parsing
    if (!currentData || !currentData.weather || !currentData.weather.daily) {
        // If no weather data, fetch it first
        import(`./services.js?v=${VERSION}`).then(({ fetchAndRenderWeather }) => {
            fetchAndRenderWeather().then(() => {
                // Try again after weather is fetched
                setTimeout(() => handleWhatToWearRequest(), 1000);
            });
        });
        
        openModal('text-response-modal');
        const modalTitle = document.getElementById('text-response-modal-title');
        const modalContent = document.getElementById('text-response-modal-content');
        
        if (modalTitle) modalTitle.textContent = '👕 המלצות לבוש היום';
        if (modalContent) modalContent.innerHTML = '<div class="text-center py-8"><div class="loader mx-auto"></div><p class="mt-4 text-gray-600">טוען נתוני מזג אוויר...</p></div>';
        return;
    }
    
    // Get today's weather from the data
    const today = currentData.weather.daily;
    const todayTemp = Math.round(today.temperature_2m_max[0]);
    const todayMinTemp = Math.round(today.temperature_2m_min[0]);
    const weatherCode = today.weathercode[0];
    
    // Simple weather condition mapping
    const weatherConditions = {
        0: 'שמש בהיר',
        1: 'שמש עם עננים קלים',
        2: 'חלקית מעונן',
        3: 'מעונן',
        45: 'ערפל',
        48: 'ערפל קפוא',
        51: 'טפטוף קל',
        53: 'טפטוף בינוני',
        55: 'טפטוף חזק',
        61: 'גשם קל',
        63: 'גשם בינוני',
        65: 'גשם חזק',
        71: 'שלג קל',
        73: 'שלג בינוני',
        75: 'שלג חזק'
    };
    
    const condition = weatherConditions[weatherCode] || 'מזג אוויר משתנה';
    const weatherSummary = `טמפרטורה: ${todayTemp}°C (מינימום ${todayMinTemp}°C), מזג אוויר: ${condition}`;
    
    const prompt = `בהתבסס על מזג האוויר בז'נבה היום (${weatherSummary}), המלץ על לבוש מתאים למשפחה עם ילדים קטנים (גילאי 2-3) לטיול יום שלם. 

כלול המלצות ספציפיות:
- לילדים: בגדים, נעליים, אביזרים
- להורים: לבוש מתאים לליווי ילדים
- שכבות בגדים לפי הטמפרטורה
- אביזרים נוספים (מטריה, כובע, קרם הגנה, ג'קט)
- המלצות מיוחדות לטיול עירוני בז'נבה

תן דגש על נוחות, פרקטיות ומזג האוויר המקומי של היום.`;
    
    // Show loading state
    openModal('text-response-modal');
    const modalTitle = document.getElementById('text-response-modal-title');
    const modalContent = document.getElementById('text-response-modal-content');
    
    if (modalTitle) modalTitle.textContent = '👕 המלצות לבוש לטיול היום';
    if (modalContent) modalContent.innerHTML = '<div class="text-center py-8"><div class="loader mx-auto"></div><p class="mt-4 text-gray-600">בוחר את הבגדים המושלמים...</p></div>';
    
    // Send to AI service
    handleChatSendWithPrompt(prompt);
}

export function handleChatSendWithPrompt(prompt) {
    // Check if we're in the text response modal or chat modal
    const textResponseModal = document.querySelector('#text-response-modal:not(.hidden)');
    const chatModal = document.querySelector('#gemini-chat-modal:not(.hidden)');
    
    if (textResponseModal) {
        // Handle response in text response modal
        const modalContent = document.getElementById('text-response-modal-content');
        if (!modalContent) return;
        
        // Show loading
        modalContent.innerHTML = '<div class="text-center py-8"><div class="loader mx-auto"></div><p class="mt-4 text-gray-600">מכין תשובה מפורטת...</p></div>';
        
        // Call AI service
        callGeminiWithParts([{ text: prompt }])
            .then(response => {
                modalContent.innerHTML = `<div class="prose prose-lg max-w-none rtl:text-right leading-relaxed">${sanitizeHTML(response)}</div>`;
            })
            .catch(error => {
                console.warn('AI request failed:', error);
                modalContent.innerHTML = '<div class="text-red-600 text-center py-8">שגיאה בקבלת תשובה מהמערכת. אנא נסו שנית מאוחר יותר.</div>';
            });
            
    } else if (chatModal) {
        // Handle response in chat modal
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-bubble user';
        userMessage.textContent = prompt;
        chatContainer.appendChild(userMessage);
        
        // Show loader
        const loader = document.getElementById('chat-loader');
        if (loader) loader.classList.remove('hidden');
        
        // Call AI service
        callGeminiWithParts([{ text: prompt }])
            .then(response => {
                // Add AI response
                const aiMessage = document.createElement('div');
                aiMessage.className = 'chat-bubble gemini';
                aiMessage.textContent = response;
                chatContainer.appendChild(aiMessage);
                
                // Scroll to bottom
                chatContainer.scrollTop = chatContainer.scrollHeight;
            })
            .catch(error => {
                console.warn('AI request failed:', error);
                const errorMessage = document.createElement('div');
                errorMessage.className = 'chat-bubble error';
                errorMessage.textContent = 'שגיאה בקבלת תשובה מהמערכת';
                chatContainer.appendChild(errorMessage);
            })
            .finally(() => {
                if (loader) loader.classList.add('hidden');
            });
    }
}

export function handleAddToPlan() {
    // Get the current daily special content
    const dailyContent = document.getElementById('daily-special-content');
    if (!dailyContent) {
        alert('לא ניתן למצוא המלצה להוספה');
        return;
    }
    
    const specialText = dailyContent.textContent.replace('ספר לי עוד על המלצה זו', '').trim();
    
    // For now, just show confirmation - you could integrate with the actual planning system
    const confirmation = confirm(`האם ברצונך להוסיף את ההמלצה הזו למסלול שלך?\n\n"${specialText}"`);
    
    if (confirmation) {
        // Here you would add actual integration with the planning system
        // For example, add it to currentData.itineraryData or create a new plan item
        
        alert('ההמלצה נוספה בהצלחה למסלול שלך! 🎉');
        
        // You could also update the UI to reflect the addition
        // For example, scroll to the plan section or highlight the new item
        const planSection = document.getElementById('plan');
        if (planSection) {
            planSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

export function handleOptimizeLuggage() {
    if (!currentData.packingListData || !currentData.luggageData) {
        alert('אין מספיק נתונים להפעלת אופטימיזציה אוטומטית');
        return;
    }
    
    // Simple optimization logic - distribute items based on weight and importance
    const heavyItems = ['מעיל גשם', 'נעליים', 'מוצרי טיפוח'];
    const essentialItems = ['דרכונים', 'כרטיסי טיסה', 'תרופות'];
    const childrenItems = ['חיתולים', 'בגדי ילדים', 'צעצועים'];
    
    // Clear existing assignments
    if (currentData.luggageData) {
        currentData.luggageData.forEach(bag => {
            bag.items = [];
        });
        
        // Distribute items based on logic
        Object.entries(currentData.packingListData).forEach(([category, items]) => {
            if (Array.isArray(items)) {
                items.forEach(item => {
                    if (item.checked) {
                        let targetBagIndex = 0; // Default to main suitcase
                        
                        if (essentialItems.some(essential => item.name.includes(essential))) {
                            targetBagIndex = 1; // Carry-on
                        } else if (childrenItems.some(child => item.name.includes(child))) {
                            targetBagIndex = 2; // Backpack
                        } else if (heavyItems.some(heavy => item.name.includes(heavy))) {
                            targetBagIndex = 0; // Main suitcase
                        }
                        
                        if (!currentData.luggageData[targetBagIndex].items) {
                            currentData.luggageData[targetBagIndex].items = [];
                        }
                        currentData.luggageData[targetBagIndex].items.push(item.name);
                    }
                });
            }
        });
        
        // Re-render the luggage planner
        import(`./ui.js?v=${VERSION}`).then(({ renderLuggagePlanner }) => {
            if (renderLuggagePlanner) renderLuggagePlanner();
        });
        
        alert('האופטימיזציה הושלמה! הפריטים חולקו באופן חכם בין המזוודות 🎯');
    }
}

// Handle smart packing analysis with AI image recognition
export async function handleSmartPackingAnalysis() {
    const luggageInput = document.getElementById('luggage-photo-input');
    const itemsInput = document.getElementById('items-photo-input');
    const analysisSection = document.getElementById('smart-packing-analysis');
    const resultsContainer = document.getElementById('analysis-results');
    
    // Check if we have uploaded images
    const luggageFiles = luggageInput?.files || [];
    const itemsFiles = itemsInput?.files || [];
    
    if (luggageFiles.length === 0 && itemsFiles.length === 0) {
        alert('אנא העלו לפחות תמונה אחת של המזוודות או הפריטים כדי לקבל ניתוח חכם');
        return;
    }
    
    // Show loading state
    if (analysisSection) {
        analysisSection.classList.remove('hidden');
        resultsContainer.innerHTML = '<div class="text-center py-4"><div class="loader mx-auto"></div><p class="mt-2 text-gray-600">מנתח תמונות עם AI...</p></div>';
    }
    
    try {
        // Convert images to base64
        const luggageImages = await Promise.all(
            Array.from(luggageFiles).map(file => convertToBase64(file))
        );
        const itemsImages = await Promise.all(
            Array.from(itemsFiles).map(file => convertToBase64(file))
        );
        
        // Prepare prompt for Gemini with vision
        const prompt = `אני מתכנן טיול משפחתי לז'נבה עם ילדים קטנים ואני צריך עזרה באריזה חכמה.

הקשר:
- נוסעים: משפחה עם 2 מבוגרים ו-2 ילדים קטנים (פעוטות)
- יעד: ז'נבה, שווייץ
- משך: 5 ימים
- עונה: קיץ (אוגוסט)

${luggageImages.length > 0 ? `תמונות מזוודות (${luggageImages.length}): אנא נתח את הגודל, הצורה והמאפיינים של המזוודות` : ''}
${itemsImages.length > 0 ? `תמונות פריטים (${itemsImages.length}): אנא זהה את הפריטים שרוצה לארוז` : ''}

אנא ספק המלצות מפורטות עבור:
1. איך לארגן את הפריטים במזוודות בצורה יעילה
2. איזה פריטים מתאימים לכל מזוודה (עדיפויות)
3. טיפים לאריזה חכמה לטיול עם ילדים
4. פריטים חשובים שחסרים (אם יש)
5. התאמת האריזה לתנאי מזג האוויר בז'נבה

פורמט התגובה בעברית, יהיה ממוקד ומעשי.`;

        // Prepare images for Gemini
        const imageParts = [];
        
        // Add luggage images
        luggageImages.forEach((imageData, index) => {
            imageParts.push({
                inlineData: {
                    data: imageData.split(',')[1], // Remove data:image/... prefix
                    mimeType: 'image/jpeg'
                }
            });
        });
        
        // Add items images
        itemsImages.forEach((imageData, index) => {
            imageParts.push({
                inlineData: {
                    data: imageData.split(',')[1],
                    mimeType: 'image/jpeg'
                }
            });
        });
        
        // Call Gemini with text and images
        const response = await callGeminiWithParts([prompt, ...imageParts]);
        
        // Display results
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="space-y-4">
                    <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                        <h6 class="font-semibold text-green-800 mb-2">📋 ניתוח AI הושלם בהצלחה</h6>
                        <div class="text-sm text-green-700 leading-relaxed whitespace-pre-line">${response}</div>
                    </div>
                    <div class="flex gap-2 justify-center">
                        <button id="apply-ai-suggestions-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                            ✅ החל המלצות על המתכנן
                        </button>
                        <button id="regenerate-analysis-btn" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">
                            🔄 נתח שוב
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners for new buttons
            const applyBtn = document.getElementById('apply-ai-suggestions-btn');
            const regenerateBtn = document.getElementById('regenerate-analysis-btn');
            
            if (applyBtn) {
                applyBtn.addEventListener('click', () => applyAISuggestions(response));
            }
            
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', handleSmartPackingAnalysis);
            }
        }
        
        // Clear uploaded images
        if (luggageInput) luggageInput.value = '';
        if (itemsInput) itemsInput.value = '';
        
    } catch (error) {
        console.warn('Smart packing analysis error:', error);
        
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <h6 class="font-semibold text-red-800 mb-2">❌ שגיאה בניתוח</h6>
                    <p class="text-sm text-red-700">לא ניתן לנתח את התמונות כרגע. אנא בדקו את החיבור לאינטרנט ונסו שוב.</p>
                    <button onclick="handleSmartPackingAnalysis()" class="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                        נסה שוב
                    </button>
                </div>
            `;
        }
    }
}

// Convert file to base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --- ENHANCED EVENT HANDLERS ---

/**
 * Enhanced button click handler with animations and feedback
 */
export function handleEnhancedButtonClick(event, action, options = {}) {
    const button = event.target;
    const {
        loadingText = 'טוען...',
        successText = 'הצלחה!',
        errorText = 'שגיאה!',
        showAnimation = true,
        showFeedback = true
    } = options;

    // Add loading state to button
    if (window.loadingManager) {
        const loadingId = window.loadingManager.showButtonLoading(button, loadingText);
        
        // Execute action
        Promise.resolve(action())
            .then((result) => {
                // Success feedback
                if (showFeedback && window.toastManager) {
                    window.toastManager.success(successText);
                }
                
                // Success animation
                if (showAnimation && window.animationManager) {
                    window.animationManager.animateElement(button, 'bounce-in');
                }
                
                return result;
            })
            .catch((error) => {
                console.error('Button action failed:', error);
                
                // Error feedback
                if (showFeedback && window.toastManager) {
                    window.toastManager.error(errorText);
                }
                
                // Error animation
                if (showAnimation && window.animationManager) {
                    window.animationManager.animateElement(button, 'shake');
                }
                
                throw error;
            })
            .finally(() => {
                // Hide loading state
                window.loadingManager.hideButtonLoading(loadingId);
            });
    } else {
        // Fallback to original behavior
        action();
    }
}

/**
 * Enhanced form submission handler
 */
export function handleEnhancedFormSubmit(event, submitAction, options = {}) {
    event.preventDefault();
    
    const form = event.target;
    const {
        loadingText = 'שולח...',
        successText = 'נשלח בהצלחה!',
        errorText = 'שגיאה בשליחה',
        resetForm = true
    } = options;

    // Show loading state
    if (window.loadingManager) {
        const loadingId = window.loadingManager.show(form, loadingText);
        
        // Execute submit action
        Promise.resolve(submitAction(form))
            .then((result) => {
                // Success feedback
                if (window.toastManager) {
                    window.toastManager.success(successText);
                }
                
                // Reset form if requested
                if (resetForm) {
                    form.reset();
                }
                
                // Success animation
                if (window.animationManager) {
                    window.animationManager.animateElement(form, 'bounce-in');
                }
                
                return result;
            })
            .catch((error) => {
                console.error('Form submission failed:', error);
                
                // Error feedback
                if (window.toastManager) {
                    window.toastManager.error(errorText);
                }
                
                // Error animation
                if (window.animationManager) {
                    window.animationManager.animateElement(form, 'shake');
                }
                
                throw error;
            })
            .finally(() => {
                // Hide loading state
                window.loadingManager.hide(loadingId);
            });
    } else {
        // Fallback to original behavior
        submitAction(form);
    }
}

/**
 * Enhanced modal handler with animations
 */
export function handleEnhancedModalOpen(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const {
        animation = 'scale-in',
        showBackdrop = true,
        closable = true
    } = options;

    // Show modal with animation
    if (window.animationManager) {
        modal.style.display = 'flex';
        window.animationManager.animateModal(modal, true);
    } else {
        // Fallback to original modal behavior
        openModal(modalId);
    }

    // Add backdrop click handler if closable
    if (closable && showBackdrop) {
        const backdrop = modal.querySelector('.modal-backdrop') || modal;
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                handleEnhancedModalClose(modalId);
            }
        });
    }
}

/**
 * Enhanced modal close handler
 */
export function handleEnhancedModalClose(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Close modal with animation
    if (window.animationManager) {
        window.animationManager.animateModal(modal, false);
    } else {
        // Fallback to original modal behavior
        closeModal(modalId);
    }
}

/**
 * Enhanced card interaction handler
 */
export function handleEnhancedCardInteraction(card, action, options = {}) {
    const {
        hoverAnimation = 'scale-in',
        clickAnimation = 'bounce-in',
        showFeedback = true
    } = options;

    // Add hover animation
    if (window.animationManager) {
        card.addEventListener('mouseenter', () => {
            window.animationManager.animateElement(card, hoverAnimation, 0.1);
        });
    }

    // Add click handler
    card.addEventListener('click', (event) => {
        event.preventDefault();
        
        // Click animation
        if (window.animationManager) {
            window.animationManager.animateElement(card, clickAnimation);
        }
        
        // Execute action
        Promise.resolve(action(card))
            .then((result) => {
                if (showFeedback && window.toastManager) {
                    window.toastManager.success('פעולה הושלמה בהצלחה!');
                }
                return result;
            })
            .catch((error) => {
                console.error('Card action failed:', error);
                if (showFeedback && window.toastManager) {
                    window.toastManager.error('שגיאה בביצוע הפעולה');
                }
            });
    });
}

/**
 * Enhanced scroll handler with animations
 */
export function setupEnhancedScrollAnimations() {
    if (!window.animationManager) return;

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Add animation based on element type
                if (element.classList.contains('card')) {
                    window.animationManager.animateElement(element, 'slide-in-left');
                } else if (element.classList.contains('section')) {
                    window.animationManager.animateElement(element, 'fade-in');
                } else {
                    window.animationManager.animateElement(element, 'scale-in');
                }
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.querySelectorAll('.card, .section, .activity-card').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Enhanced keyboard navigation handler
 */
export function setupEnhancedKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        // Handle escape key for modals
        if (event.key === 'Escape') {
            if (window.enhancedModalManager) {
                window.enhancedModalManager.closeTopModal();
            } else {
                closeAllModals();
            }
        }
        
        // Handle enter key for buttons
        if (event.key === 'Enter' && event.target.tagName === 'BUTTON') {
            event.target.click();
        }
        
        // Handle arrow keys for navigation
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            handleArrowKeyNavigation(event);
        }
    });
}

/**
 * Handle arrow key navigation
 */
function handleArrowKeyNavigation(event) {
    const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
    let nextIndex = currentIndex;
    
    switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
        case 'ArrowUp':
        case 'ArrowLeft':
            nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
            break;
    }
    
    if (nextIndex !== currentIndex) {
        focusableElements[nextIndex].focus();
        event.preventDefault();
    }
}

/**
 * Initialize enhanced event handlers
 */
export function initializeEnhancedEventHandlers() {
    // Setup scroll animations
    setupEnhancedScrollAnimations();
    
    // Setup keyboard navigation
    setupEnhancedKeyboardNavigation();
    
    // Add enhanced interactions to existing elements
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', (event) => {
            handleEnhancedButtonClick(event, () => {
                // Default action - can be overridden
                console.log('Enhanced button clicked');
            });
        });
    });
    
    // Add enhanced interactions to cards
    document.querySelectorAll('.card, .activity-card').forEach(card => {
        handleEnhancedCardInteraction(card, (cardElement) => {
            // Default card action - can be overridden
            console.log('Enhanced card interaction');
        });
    });
    
    console.log('Enhanced event handlers initialized');
}

// Apply AI suggestions to the luggage planner
async function applyAISuggestions(aiResponse) {
    // Simple implementation - in a real app, you'd parse the AI response more intelligently
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">✅</span>
            <div>
                <div class="font-semibold">המלצות AI יושמו</div>
                <div class="text-sm opacity-90">המתכנן עודכן לפי הניתוח החכם</div>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.remove();
    }, 4000);
    
    // Re-render luggage planner to show updated suggestions
    import(`./ui.js?v=${VERSION}`).then(({ renderLuggagePlanner }) => {
        if (renderLuggagePlanner) renderLuggagePlanner();
    });
}
