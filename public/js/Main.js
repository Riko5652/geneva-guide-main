import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import { renderAllComponents } from './ui.js';
import { setupEventListeners } from './handlers.js';
import { setupGeminiChat } from "./Gemini.js";
import { CONFIG } from './config.js';
import { familyLoader } from './utils.js';
import { familyToast, familyAnimations } from './ui.js';

// Import new modules
import { initMap } from './Map.js';
import { AnimationManager } from './animations.js';
import { ToastManager } from './toast.js';
import { LoadingManager } from './loading.js';

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

// New module instances
export let animationManager = null;
export let toastManager = null;
export let loadingManager = null;

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
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('Performance metrics:', {
                        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
                        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
                    });
                }
            }, 0);
        });
    }
    
    // Global error handler for better debugging
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (window.familyToast) {
            window.familyToast.error('אירעה שגיאה. אנא רענן את הדף.');
        }
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        if (window.familyToast) {
            window.familyToast.error('אירעה שגיאה בחיבור לשרת.');
        }
    });
    
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
    
    // Initialize new modules
    console.log('🎨 Initializing animation manager...');
    animationManager = new AnimationManager();
    window.animationManager = animationManager;
    
    console.log('🔔 Initializing toast manager...');
    toastManager = new ToastManager();
    window.toastManager = toastManager;
    
    console.log('⏳ Initializing loading manager...');
    loadingManager = new LoadingManager();
    window.loadingManager = loadingManager;
    
    // Only show loader if page isn't already fully loaded and no existing loader
    const existingLoader = document.getElementById('family-loader');
    const pageLoaded = document.readyState === 'complete';
    
    if (!existingLoader && !pageLoaded) {
        console.log('📱 Showing family loader...');
        familyLoader.show();
    } else {
        console.log('⏭️ Skipping loader - page already loaded or loader exists');
    }
    
    // Set a timeout to ensure the page loads even if Firebase fails
    const fallbackTimer = setTimeout(() => {
        console.log('⏰ Fallback timer triggered - loading basic app');
        setupBasicApp();
    }, 5000); // 5 second timeout
    
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
        
        // Clear the fallback timer since Firebase succeeded
        clearTimeout(fallbackTimer);
        
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
        // Clear the fallback timer since we're handling the error
        clearTimeout(fallbackTimer);
        // Continue without Firebase for static functionality
        setupBasicApp();
    }
}

function setupBasicApp() {
    console.log("🔧 Setting up basic app without Firebase");
    
    try {
        // Load demo data for basic functionality
        currentData = {
            activitiesData: [
                {
                    id: "demo-1",
                    name: "גן החיות של ז'נבה",
                    category: "ילדים",
                    time: "בוקר",
                    description: "גן חיות מושלם למשפחות עם פעוטות",
                    location: "Route de Valavran 28, 1292 Chambésy",
                    duration: "2-3 שעות",
                    ageRange: "כל הגילאים",
                    price: "חינם",
                    image: "https://images.unsplash.com/photo-1549366021-9f761d77f8e0?w=400"
                },
                {
                    id: "demo-2", 
                    name: "פארק באסטיון",
                    category: "פארקים",
                    time: "אחר הצהריים",
                    description: "פארק ירוק מושלם לפיקניק משפחתי",
                    location: "Parc des Bastions, 1204 Genève",
                    duration: "1-2 שעות",
                    ageRange: "כל הגילאים",
                    price: "חינם",
                    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400"
                }
            ],
            itineraryData: [
                {
                    day: 1,
                    activities: [
                        { id: "demo-1", time: "10:00", name: "גן החיות של ז'נבה" },
                        { id: "demo-2", time: "14:00", name: "פארק באסטיון" }
                    ]
                }
            ],
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
        
        // Initialize enhanced map
        console.log("🗺️ Initializing enhanced map...");
        if (typeof initMap === 'function') {
            initMap();
        }
        
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
    // Prevent multiple listeners from being created
    if (window.firebaseListenerActive) {
        console.log('🔄 Firebase listener already active, skipping setup');
        return;
    }
    
    // Clean up any existing listener first
    if (window.firebaseUnsubscribe && typeof window.firebaseUnsubscribe === 'function') {
        try {
            window.firebaseUnsubscribe();
            window.firebaseUnsubscribe = null;
            console.log('🧹 Cleaned up existing Firebase listener');
        } catch (error) {
            console.warn('⚠️ Error cleaning up existing listener:', error);
        }
    }
    
    const publicDataRef = doc(db, `artifacts/${appId}/public/genevaGuide`);
    
    // Mark listener as active
    window.firebaseListenerActive = true;
    
    // Enhanced Firebase listener with connection resilience and abort prevention
    const unsubscribe = onSnapshot(publicDataRef, 
        {
            // Add options to prevent connection aborts
            includeMetadataChanges: false, // Reduce unnecessary updates
        },
        // Success callback
        (snapshot) => {
            try {
                if (snapshot.exists()) {
                    currentData = { ...currentData, ...snapshot.data() };
                    console.log("✅ Firebase data updated:", Object.keys(currentData));
                    renderAllComponents();
                    
                    // Hide loading screen on first successful data load
                    console.log("🎯 Hiding loading screen after Firebase data load");
                    familyLoader.hide();
                    
                    // Ensure main content is visible
                    const mainContent = document.getElementById('main-content');
                    if (mainContent) {
                        mainContent.style.display = 'block';
                        mainContent.style.visibility = 'visible';
                        mainContent.style.opacity = '1';
                        console.log("✅ Main content visibility ensured");
                    }
                    
                    // Reset retry counter and reconnection flag on successful connection
                    if (window.firebaseRetryCount) {
                        window.firebaseRetryCount = 0;
                        window.firebaseReconnecting = false;
                        console.log("🔄 Firebase connection restored");
                        familyToast.success('חיבור לשרת הוחזר! ✅');
                    }
                } else {
                    console.log("⚠️ No Firebase data found, using defaults");
                    setupBasicApp();
                }
            } catch (callbackError) {
                console.error("🔥 Error in Firebase success callback:", callbackError);
                setupBasicApp();
            }
        }, 
        // Error callback with enhanced handling
        (error) => {
            console.warn("🔥 Firebase listener error:", error.code, error.message);
            
            // Mark listener as inactive on error
            window.firebaseListenerActive = false;
            
            // Handle specific error types with better logic
            switch (error.code) {
                case 'cancelled':
                    console.log("🔄 Firebase listener cancelled (likely during cleanup)");
                    // Don't retry or show error for cancelled connections
                    return;
                    
                case 'unavailable':
                case 'deadline-exceeded':
                case 'resource-exhausted':
                    console.log("🔄 Network/resource issue detected, will retry connection...");
                    // Don't immediately retry on these errors - let the reconnection handler manage it
                    setTimeout(() => handleFirebaseReconnection(unsubscribe), 1000);
                    break;
                    
                case 'permission-denied':
                    console.error("🚫 Firebase permission denied");
                    familyToast.error('בעיית הרשאות - נסה להתחבר מחדש');
                    window.firebaseListenerActive = false;
                    setupBasicApp();
                    break;
                    
                case 'failed-precondition':
                case 'invalid-argument':
                    console.error("🚫 Firebase configuration error:", error.message);
                    familyToast.error('בעיית תצורה - נסה לרענן את הדף');
                    window.firebaseListenerActive = false;
                    setupBasicApp();
                    break;
                    
                default:
                    console.log("🔄 Unknown Firebase error, attempting recovery...");
                    setTimeout(() => handleFirebaseReconnection(unsubscribe), 2000);
            }
            
            // Always ensure basic app functionality continues
            setupBasicApp();
        }
    );
    
    // Store unsubscribe function for cleanup
    window.firebaseUnsubscribe = unsubscribe;
    
    // Note: Cleanup is handled by the main cleanupFirebaseConnections function
    // to avoid duplicate event listeners
}

// Enhanced Firebase reconnection handler with connection abort prevention
function handleFirebaseReconnection(currentUnsubscribe) {
    // Prevent multiple concurrent reconnection attempts
    if (window.firebaseReconnecting) {
        console.log('🔄 Firebase reconnection already in progress, skipping...');
        return;
    }
    
    window.firebaseReconnecting = true;
    
    // Initialize retry counter
    if (!window.firebaseRetryCount) {
        window.firebaseRetryCount = 0;
    }
    
    window.firebaseRetryCount++;
    const maxRetries = 3; // Reduced from 5 to prevent connection abuse
    const baseDelay = 3000; // Increased to 3 seconds
    const delay = Math.min(baseDelay * Math.pow(1.5, window.firebaseRetryCount - 1), 15000); // Max 15 seconds
    
    if (window.firebaseRetryCount <= maxRetries) {
        console.log(`🔄 Attempting Firebase reconnection ${window.firebaseRetryCount}/${maxRetries} in ${delay/1000}s...`);
        
        // Clean up current listener gracefully
        if (currentUnsubscribe && typeof currentUnsubscribe === 'function') {
            try {
                currentUnsubscribe();
                console.log('✅ Previous Firebase listener cleaned up');
            } catch (cleanupError) {
                console.warn('⚠️ Error cleaning up Firebase listener:', cleanupError);
            }
        }
        
        // Show user-friendly message only once
        if (window.firebaseRetryCount === 1) {
            familyToast.info('מתחבר מחדש לשרת... 🔄');
        }
        
        // Retry connection after delay with abort protection
        const reconnectTimeout = setTimeout(() => {
            try {
                // Check if we're still online before attempting reconnection
                if (!navigator.onLine) {
                    console.log('📴 Device is offline, skipping Firebase reconnection');
                    window.firebaseReconnecting = false;
                    return;
                }
                
                console.log('🔄 Attempting Firebase reconnection...');
                setupFirebaseListeners();
                window.firebaseReconnecting = false;
                
            } catch (retryError) {
                console.error("🔥 Firebase retry failed:", retryError);
                window.firebaseReconnecting = false;
                
                if (window.firebaseRetryCount >= maxRetries) {
                    familyToast.warning('עובדים במצב לא מקוון');
                    setupBasicApp(); // Fallback to basic functionality
                }
            }
        }, delay);
        
        // Store timeout ID for potential cleanup
        window.firebaseReconnectTimeout = reconnectTimeout;
        
    } else {
        console.warn("🔥 Max Firebase retry attempts reached, switching to offline mode");
        familyToast.warning('עובדים במצב לא מקוון');
        window.firebaseRetryCount = 0; // Reset for future attempts
        window.firebaseReconnecting = false;
        setupBasicApp(); // Ensure app continues to work
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
    
    // Handle online/offline events with improved Firebase management
    window.addEventListener('online', () => {
        console.log('🌐 Network connection restored');
        familyToast.success('חיבור לאינטרנט חזר! 🌐');
        
        // Clean up any existing reconnection attempts
        if (window.firebaseReconnectTimeout) {
            clearTimeout(window.firebaseReconnectTimeout);
            window.firebaseReconnectTimeout = null;
        }
        
        // Reset Firebase connection state
        window.firebaseRetryCount = 0;
        window.firebaseReconnecting = false;
        window.firebaseListenerActive = false;
        
        // Clean up existing listener before creating new one
        if (window.firebaseUnsubscribe && typeof window.firebaseUnsubscribe === 'function') {
            try {
                window.firebaseUnsubscribe();
                console.log('✅ Cleaned up Firebase listener before reconnection');
            } catch (cleanupError) {
                console.warn('⚠️ Error cleaning up Firebase listener:', cleanupError);
            }
        }
        
        // Attempt fresh connection after network restoration
        setTimeout(() => {
            if (db && auth) {
                console.log('🔄 Attempting fresh Firebase connection after network restoration');
                setupFirebaseListeners();
            }
        }, 2000); // Give network time to stabilize
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 Network connection lost');
        familyToast.warning('אין חיבור לאינטרנט');
        
        // Clean up Firebase connections when going offline
        if (window.firebaseUnsubscribe && typeof window.firebaseUnsubscribe === 'function') {
            try {
                window.firebaseUnsubscribe();
                window.firebaseListenerActive = false;
                console.log('✅ Firebase listener cleaned up due to offline status');
            } catch (cleanupError) {
                console.warn('⚠️ Error cleaning up Firebase when offline:', cleanupError);
            }
        }
        
        // Clear any pending reconnection attempts
        if (window.firebaseReconnectTimeout) {
            clearTimeout(window.firebaseReconnectTimeout);
            window.firebaseReconnectTimeout = null;
        }
        
        window.firebaseReconnecting = false;
    });
}

// Cleanup function for page unload
function cleanupFirebaseConnections() {
    if (window.firebaseUnsubscribe && typeof window.firebaseUnsubscribe === 'function') {
        try {
            window.firebaseUnsubscribe();
            window.firebaseUnsubscribe = null;
            window.firebaseListenerActive = false;
            console.log('🧹 Firebase listeners cleaned up');
        } catch (error) {
            console.warn('⚠️ Error cleaning up Firebase listeners:', error);
        }
    }
}

// Enhanced Firebase connection monitoring and management
function setupEnhancedFirebaseMonitoring() {
    // Connection state tracking
    window.firebaseConnectionState = {
        isConnected: false,
        lastConnected: null,
        retryCount: 0,
        maxRetries: 5,
        baseDelay: 2000
    };
    
    // Enhanced connection monitoring
    const connectionMonitor = setInterval(() => {
        if (window.firebaseConnectionState.retryCount > 0) {
            console.log(`🔄 Firebase connection monitoring: ${window.firebaseConnectionState.retryCount} retries`);
        }
    }, 30000);
    
    // Enhanced visibility change handler
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && window.firebaseConnectionState.retryCount > 0) {
            console.log('🔄 Page became visible, attempting Firebase reconnection...');
            window.firebaseConnectionState.retryCount = 0;
            if (window.firebaseUnsubscribe) {
                window.firebaseUnsubscribe();
            }
            setTimeout(() => setupFirebaseListeners(), 1000);
        }
    });
    
    // Enhanced online/offline handling with exponential backoff
    window.addEventListener('online', () => {
        console.log('🌐 Network connection restored');
        
        // Clear any existing timeouts
        if (window.firebaseReconnectTimeout) {
            clearTimeout(window.firebaseReconnectTimeout);
            window.firebaseReconnectTimeout = null;
        }
        
        // Reset connection state
        window.firebaseConnectionState.retryCount = 0;
        window.firebaseReconnecting = false;
        window.firebaseListenerActive = false;
        
        // Clean up existing listener
        if (window.firebaseUnsubscribe && typeof window.firebaseUnsubscribe === 'function') {
            try {
                window.firebaseUnsubscribe();
                console.log('✅ Cleaned up Firebase listener before reconnection');
            } catch (error) {
                console.warn('⚠️ Error cleaning up listener:', error);
            }
        }
        
        // Reconnect with delay
        setTimeout(() => {
            setupFirebaseListeners();
        }, 1000);
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 Network connection lost');
        
        // Clean up Firebase connections
        if (window.firebaseUnsubscribe && typeof window.firebaseUnsubscribe === 'function') {
            try {
                window.firebaseUnsubscribe();
                window.firebaseListenerActive = false;
                console.log('✅ Firebase listener cleaned up due to offline status');
            } catch (error) {
                console.warn('⚠️ Error cleaning up listener:', error);
            }
        }
        
        // Clear pending reconnection attempts
        if (window.firebaseReconnectTimeout) {
            clearTimeout(window.firebaseReconnectTimeout);
            window.firebaseReconnectTimeout = null;
        }
        
        window.firebaseReconnecting = false;
    });
    
    // Enhanced error handling for NS_BINDING_ABORTED
    window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('NS_BINDING_ABORTED')) {
            console.warn('⚠️ NS_BINDING_ABORTED detected, attempting graceful recovery...');
            if (window.firebaseConnectionState.retryCount < window.firebaseConnectionState.maxRetries) {
                window.firebaseConnectionState.retryCount++;
                const delay = window.firebaseConnectionState.baseDelay * Math.pow(2, window.firebaseConnectionState.retryCount - 1);
                console.log(`🔄 Scheduling Firebase reconnection in ${delay}ms (attempt ${window.firebaseConnectionState.retryCount})`);
                
                window.firebaseReconnectTimeout = setTimeout(() => {
                    if (window.firebaseUnsubscribe) {
                        window.firebaseUnsubscribe();
                    }
                    setupFirebaseListeners();
                }, delay);
            }
        }
    });
    
    console.log('🛡️ Enhanced Firebase monitoring setup complete');
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
    setupEnhancedFirebaseMonitoring();
    window.addEventListener('beforeunload', cleanupFirebaseConnections);
    window.addEventListener('beforeunload', cleanupObjectURLs);
    
    // Expose renderAllComponents and familyLoader globally for debugging and force refresh
    import('./ui.js').then(uiModule => {
        window.renderAllComponents = uiModule.renderAllComponents;
        console.log('🌐 renderAllComponents exposed globally');
    });
    
    // Expose familyLoader globally
    import('./utils.js').then(utilsModule => {
        window.familyLoader = utilsModule.familyLoader;
        console.log('🌐 familyLoader exposed globally');
    });
}

// Export the initialization function
export { initApp };

// Export the initialization function for external use
// The initialization is now handled above with proper checks