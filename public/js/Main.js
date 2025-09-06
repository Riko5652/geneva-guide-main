import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import { renderAllComponents } from './ui.js';
import { setupEventListeners } from './handlers.js';
import { setupGeminiChat } from "./Gemini.js";
import { CONFIG } from './config.js';
import { familyLoader } from './loading.js';
import { familyToast } from './toast.js';
import { animations } from './animations.js';

// --- Global State ---
export let db, auth, storage, userId;
export let currentData = { activitiesData: [] };
export let currentCategoryFilter = 'all';
export let currentTimeFilter = 'all';
export let newlyAddedItems = new Set();
export const appId = "lipetztrip-guide";

// Map state for Leaflet integration
export let map = null;
export function setMap(newMap) { map = newMap; }

// --- State Modifiers ---
export function addNewlyAddedItem(id) { try { newlyAddedItems.add(id); } catch (e) {} }
export function clearNewlyAddedItems() { newlyAddedItems = new Set(); }
export function setCurrentCategoryFilter(filter) { 
    currentCategoryFilter = filter; 
    if (typeof window !== 'undefined') window.currentCategoryFilter = filter;
}
export function setCurrentTimeFilter(filter) { 
    currentTimeFilter = filter; 
    if (typeof window !== 'undefined') window.currentTimeFilter = filter;
}

// --- Initialize Global UI State ---
if (typeof window !== 'undefined') {
    window.displayedActivitiesCount = 6; // Initial number of activities to display
    window.currentCategoryFilter = currentCategoryFilter;
    window.currentTimeFilter = currentTimeFilter;
}

// --- INITIALIZATION ---
// Only initialize if not already done and not being imported as module
if (typeof window !== 'undefined' && !window.__APP_BOOTSTRAPPED__) {
    window.__APP_BOOTSTRAPPED__ = true;
    
    // Check if DOM is already ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM is already ready, initialize immediately
        setTimeout(initApp, 0);
    }
}

async function initApp() {
    console.log('🚀 initApp starting...');
    
    // Only show loader if page isn't already fully loaded and no existing loader
    const existingLoader = document.getElementById('family-loader');
    const pageLoaded = document.readyState === 'complete';
    
    if (!existingLoader && !pageLoaded) {
        console.log('📱 Showing family loader...');
        familyLoader.show();
    } else {
        console.log('⏭️ Skipping loader - page already loaded or loader exists');
    }
    
    try {
        const response = await fetch('/api/get-config');
        if (!response.ok) throw new Error('Failed to get Firebase config');
        const firebaseConfig = await response.json();
        
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        
        console.log("Firebase initialized successfully");
        familyToast.success('מתחברים לטיול שלכם... 🚀');
        
        // Setup event listeners and chat once (with coordination)
        console.log('🔧 Setting up event listeners...');
        setupEventListeners();
        
        console.log('🤖 Setting up Gemini chat...');
        setupGeminiChat();
        
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                console.log("✅ User signed in:", userId);
                setupFirebaseListeners();
            } else {
                console.log("⚠️ No user signed in, attempting anonymous sign-in");
                signInAnonymously(auth).then(result => {
                    console.log("✅ Anonymous sign-in successful");
                    setupFirebaseListeners();
                }).catch(error => {
                    console.warn("❌ Anonymous sign-in failed:", error);
                    familyToast.warning('עובדים במצב לא מקוון');
                    // Continue without auth for basic functionality
                    setupBasicApp();
                });
            }
        });
        
    } catch (error) {
        console.warn("Firebase initialization failed:", error);
        familyToast.info('עובדים במצב הדגמה');
        // Continue without Firebase for static functionality
        setupBasicApp();
    }
}

function setupBasicApp() {
    console.log("🔧 Setting up basic app without Firebase");
    
    try {
        // Load demo data for basic functionality
        currentData = {
            activitiesData: [],
            itineraryData: [],
            flightData: { bookingRef: "Demo Mode" },
            hotelData: { name: "Demo Hotel", bookingRef: "DEMO123" },
            familyData: [{ name: "Demo Family", passport: "DEMO" }],
            packingListData: {},
            bulletinBoard: [],
            photoAlbum: [],
            familyMemories: [],
            interactivePacking: []
        };
        
        console.log("🎨 Calling renderAllComponents from setupBasicApp");
        renderAllComponents();
        
        // Hide loading screen and any other loaders
        console.log("🎯 Hiding all loading screens...");
        familyLoader.hide();
        
        // Demo loading screen was removed, no cleanup needed
        
    } catch (error) {
        console.error("🔥 Error in setupBasicApp:", error);
        // Force render even if there's an error
        try {
            renderAllComponents();
        } catch (renderError) {
            console.error("🔥 Critical render error:", renderError);
        }
        familyLoader.hide();
    }
}

function setupFirebaseListeners() {
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
    
    // Enhanced Firebase listener with connection resilience
    const unsubscribe = onSnapshot(publicDataRef, 
        // Success callback
        (snapshot) => {
            if (snapshot.exists()) {
                currentData = { ...currentData, ...snapshot.data() };
                console.log("✅ Firebase data updated:", Object.keys(currentData));
                renderAllComponents();
                
                // Hide loading screen on first successful data load
                console.log("🎯 Hiding loading screen after Firebase data load");
                familyLoader.hide();
                
                // Reset retry counter on successful connection
                if (window.firebaseRetryCount) {
                    window.firebaseRetryCount = 0;
                    console.log("🔄 Firebase connection restored");
                }
            } else {
                console.log("⚠️ No Firebase data found, using defaults");
                setupBasicApp();
            }
        }, 
        // Error callback with enhanced handling
        (error) => {
            console.warn("🔥 Firebase listener error:", error.code, error.message);
            
            // Handle specific error types
            switch (error.code) {
                case 'unavailable':
                case 'deadline-exceeded':
                case 'resource-exhausted':
                    console.log("🔄 Network issue detected, will retry connection...");
                    handleFirebaseReconnection(unsubscribe);
                    break;
                    
                case 'permission-denied':
                    console.error("🚫 Firebase permission denied");
                    familyToast.error('בעיית הרשאות - נסה להתחבר מחדש');
                    break;
                    
                default:
                    console.log("🔄 Unknown Firebase error, attempting recovery...");
                    handleFirebaseReconnection(unsubscribe);
            }
            
            // Continue with basic app functionality
            setupBasicApp();
        }
    );
    
    // Store unsubscribe function for cleanup
    window.firebaseUnsubscribe = unsubscribe;
}

// Enhanced Firebase reconnection handler
function handleFirebaseReconnection(currentUnsubscribe) {
    // Initialize retry counter
    if (!window.firebaseRetryCount) {
        window.firebaseRetryCount = 0;
    }
    
    window.firebaseRetryCount++;
    const maxRetries = 5;
    const baseDelay = 2000; // 2 seconds
    const delay = Math.min(baseDelay * Math.pow(2, window.firebaseRetryCount - 1), 30000); // Max 30 seconds
    
    if (window.firebaseRetryCount <= maxRetries) {
        console.log(`🔄 Attempting Firebase reconnection ${window.firebaseRetryCount}/${maxRetries} in ${delay/1000}s...`);
        
        // Clean up current listener
        if (currentUnsubscribe) {
            currentUnsubscribe();
        }
        
        // Show user-friendly message
        if (window.firebaseRetryCount === 1) {
            familyToast.info('מתחבר מחדש לשרת... 🔄');
        }
        
        // Retry connection after delay
        setTimeout(() => {
            try {
                setupFirebaseListeners();
            } catch (retryError) {
                console.error("🔥 Firebase retry failed:", retryError);
                if (window.firebaseRetryCount >= maxRetries) {
                    familyToast.warning('עובדים במצב לא מקוון');
                }
            }
        }, delay);
    } else {
        console.warn("🔥 Max Firebase retry attempts reached, continuing offline");
        familyToast.warning('עובדים במצב לא מקוון');
        window.firebaseRetryCount = 0; // Reset for future attempts
    }
}

// Connection health monitoring
function monitorFirebaseConnection() {
    // Check connection health every 30 seconds
    setInterval(() => {
        if (window.firebaseRetryCount > 0) {
            console.log(`🔄 Firebase connection status: ${window.firebaseRetryCount} retries`);
        }
    }, 30000);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && window.firebaseRetryCount > 0) {
            console.log('🔄 Page became visible, checking Firebase connection...');
            // Reset retry count and attempt reconnection
            window.firebaseRetryCount = 0;
            if (window.firebaseUnsubscribe) {
                window.firebaseUnsubscribe();
            }
            setTimeout(() => setupFirebaseListeners(), 1000);
        }
    });
    
    // Handle online/offline events
    window.addEventListener('online', () => {
        console.log('🌐 Network connection restored');
        familyToast.success('חיבור לאינטרנט חזר! 🌐');
        if (window.firebaseRetryCount > 0) {
            window.firebaseRetryCount = 0;
            setTimeout(() => setupFirebaseListeners(), 1000);
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 Network connection lost');
        familyToast.warning('אין חיבור לאינטרנט');
    });
}

// Cleanup function for page unload
function cleanupFirebaseConnections() {
    if (window.firebaseUnsubscribe) {
        window.firebaseUnsubscribe();
        console.log('🧹 Firebase listeners cleaned up');
    }
}

// Cleanup function for object URLs to prevent memory leaks
function cleanupObjectURLs() {
    // Clean up photo album object URLs
    if (currentData.photoAlbum && Array.isArray(currentData.photoAlbum)) {
        currentData.photoAlbum.forEach(photo => {
            if (photo.objectURL) {
                URL.revokeObjectURL(photo.objectURL);
            }
        });
    }
    
    // Clean up packing photos object URLs
    if (currentData.packingPhotos && currentData.packingPhotos.photos && Array.isArray(currentData.packingPhotos.photos)) {
        currentData.packingPhotos.photos.forEach(photo => {
            if (photo.objectURL) {
                URL.revokeObjectURL(photo.objectURL);
            }
        });
    }
    
    console.log('🧹 Object URLs cleaned up');
}

// Initialize connection monitoring and expose global functions
if (typeof window !== 'undefined') {
    monitorFirebaseConnection();
    window.addEventListener('beforeunload', cleanupFirebaseConnections);
    window.addEventListener('beforeunload', cleanupObjectURLs);
    
    // Expose renderAllComponents and familyLoader globally for debugging and force refresh
    import('./ui.js').then(uiModule => {
        window.renderAllComponents = uiModule.renderAllComponents;
        console.log('🌐 renderAllComponents exposed globally');
    });
    
    // Expose familyLoader globally
    import('./loading.js').then(loadingModule => {
        window.familyLoader = loadingModule.familyLoader;
        console.log('🌐 familyLoader exposed globally');
    });
}

// Export the initialization function
export { initApp };

// Export the initialization function for external use
// The initialization is now handled above with proper checks