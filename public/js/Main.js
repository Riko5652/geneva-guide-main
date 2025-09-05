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
if (typeof window !== 'undefined') {
    if (window.__APP_BOOTSTRAPPED__) {
        console.log('App already bootstrapped, skipping');
    } else {
        window.__APP_BOOTSTRAPPED__ = true;
        document.addEventListener('DOMContentLoaded', initApp);
    }
}

async function initApp() {
    // Show family-friendly loader
    familyLoader.show();
    
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
        
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                console.log("User signed in:", userId);
                setupFirebaseListeners();
            } else {
                console.log("No user signed in, attempting anonymous sign-in");
                signInAnonymously(auth).catch(error => {
                    console.warn("Anonymous sign-in failed:", error);
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
    console.log("Setting up basic app without Firebase");
    setupEventListeners();
    setupGeminiChat();
    
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
    
    renderAllComponents();
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
    
    setupEventListeners();
    setupGeminiChat();
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

// Initialize connection monitoring
if (typeof window !== 'undefined') {
    monitorFirebaseConnection();
    window.addEventListener('beforeunload', cleanupFirebaseConnections);
}

// Export the initialization function
export { initApp };

// Auto-initialize when loaded directly (for backward compatibility)
// Only auto-initialize if not being imported as a module
if (typeof window !== 'undefined' && !window.moduleInitialized) {
    // Mark that we're handling initialization
    window.moduleInitialized = true;
    
    // Check if we're being loaded as a module or directly
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // Small delay to ensure DOM is ready
        setTimeout(initApp, 100);
    }
}