// Geneva Family Guide Configuration
// Centralized configuration for the entire application

export const CONFIG = {
    // App Identity
    APP_NAME: 'ז\'נבה עם קטנטנים',
    APP_VERSION: '2.0.0',
    
    // Firebase Configuration
    APP_ID: 'lipetztrip-guide',
    
    // API Endpoints
    APIS: {
        WEATHER: {
            BASE_URL: 'https://api.open-meteo.com/v1/forecast',
            GENEVA_COORDS: { lat: 46.20, lon: 6.14 },
            TIMEZONE: 'Europe/Zurich',
            CACHE_DURATION: 3600000 // 1 hour
        },
        GEMINI: {
            ENDPOINT: '/api/gemini',
            TIMEOUT: 30000 // 30 seconds
        }
    },
    
    // UI Configuration
    UI: {
        INITIAL_ACTIVITIES_COUNT: 6,
        LOAD_MORE_INCREMENT: 6,
        ANIMATION_DURATION: 200,
        TOAST_DURATION: 5000,
        MODAL_FADE_DURATION: 200
    },
    
    // Family Members (for personalization)
    FAMILY: {
        PARENTS: ['דור', 'עדי'],
        KIDS: ['בר', 'רן'],
        TRIP_DURATION: 4 // days
    },
    
    // Theme Colors (matching CSS variables)
    THEME: {
        PRIMARY: '#0891b2',
        SECONDARY: '#14b8a6',
        ACCENT: '#fbbf24',
        SUCCESS: '#10b981',
        ERROR: '#ef4444',
        WARNING: '#f59e0b'
    },
    
    // Feature Flags
    FEATURES: {
        ENABLE_OFFLINE_MODE: true,
        ENABLE_PWA: true,
        ENABLE_ANALYTICS: false,
        ENABLE_ERROR_REPORTING: true,
        ENABLE_AI_FEATURES: true
    },
    
    // Cache Configuration
    CACHE: {
        VERSION_KEY: 'app-version',
        DATA_KEY: 'cached-data',
        WEATHER_KEY: 'weather-cache',
        PHOTOS_KEY: 'photo-cache'
    },
    
    // Default Data (Demo Mode)
    DEMO_DATA: {
        HOTEL: {
            name: 'Mercure Geneva Airport',
            bookingRef: 'DEMO-123456'
        },
        FLIGHT: {
            bookingRef: 'DEMO-FLIGHT-789'
        }
    }
};

// Helper function to get nested config values safely
export function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

// Environment detection
export const ENV = {
    IS_PRODUCTION: window.location.hostname !== 'localhost',
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    IS_TOUCH: 'ontouchstart' in window,
    IS_PWA: window.matchMedia('(display-mode: standalone)').matches
};
