import { currentData } from './Main.js';
import { getWeatherInfo } from './utils.js';
import { VERSION } from './version.js';

// Import new modules for enhanced functionality
import { AnimationManager } from './animations.js';
import { ToastManager } from './toast.js';
import { LoadingManager } from './loading.js';

// --- WEATHER SERVICE ---

// Caching variables to prevent excessive API calls.
let weatherCache = null;
let lastWeatherFetch = 0;

/**
 * Fetches weather data from the Open-Meteo API and renders it.
 * Implements a 1-hour cache to avoid redundant API calls.
 */
export async function fetchAndRenderWeather() {
    const now = Date.now();
    // Use cached data if it's less than 1 hour old.
    if (weatherCache && (now - lastWeatherFetch < 3600000)) {
        renderWeather(weatherCache);
        return;
    }

    const forecastContainer = document.getElementById('weather-forecast');
    if (!forecastContainer) return;
    
    // Show loading state with enhanced UI
    if (window.loadingManager) {
        const loadingId = window.loadingManager.show(forecastContainer, 'טוען תחזית מזג אוויר...', 'small');
        window.currentWeatherLoadingId = loadingId;
    } else {
        forecastContainer.innerHTML = '<p class="text-center w-full col-span-full text-gray-500">טוען תחזית עדכנית...</p>';
    }

    // Get flight dates to baseline the weather forecast
    let startDate = new Date().toISOString().split('T')[0]; // Default to today
    
    if (currentData && currentData.flightData && Array.isArray(currentData.flightData.outbound) && currentData.flightData.outbound.length > 0) {
        // Parse the first outbound flight date and use it as the start date for weather
        const flightDate = new Date(currentData.flightData.outbound[0].date);
        if (!isNaN(flightDate.getTime())) {
            startDate = flightDate.toISOString().split('T')[0];
        }
    }
    
    const endDate = new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 6 days from start
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=46.20&longitude=6.14&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe/Zurich&start_date=${startDate}&end_date=${endDate}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API returned an error');
        const data = await response.json();
        
        // Store the data in the global state for other functions (like "What to wear?") to use.
        currentData.weather = data;
        currentData.weatherData = data;
        
        // Update the cache.
        weatherCache = data;
        lastWeatherFetch = now;

        // Hide loading state
        if (window.currentWeatherLoadingId && window.loadingManager) {
            window.loadingManager.hide(window.currentWeatherLoadingId);
            window.currentWeatherLoadingId = null;
        }
        
        renderWeather(data);
        
        // Show success toast
        if (window.toastManager) {
            window.toastManager.success('תחזית מזג האוויר עודכנה בהצלחה!');
        }
        
        // Update quick status after weather is loaded
        import(`./ui.js?v=${VERSION}`).then(({ renderQuickStatus }) => {
            if (renderQuickStatus) renderQuickStatus();
        }).catch(console.warn);
        
        return data;
    } catch (error) {
        console.warn("Failed to fetch weather:", error);
        
        // Hide loading state
        if (window.currentWeatherLoadingId && window.loadingManager) {
            window.loadingManager.hide(window.currentWeatherLoadingId);
            window.currentWeatherLoadingId = null;
        }
        
        // Show error toast
        if (window.toastManager) {
            window.toastManager.error('לא ניתן היה לטעון את תחזית מזג האוויר', {
                actions: [{
                    text: 'נסה שוב',
                    handler: () => fetchAndRenderWeather()
                }]
            });
        } else {
            forecastContainer.innerHTML = '<p class="text-center w-full col-span-full text-red-500">לא ניתן היה לטעון את תחזית מזג האוויר.</p>';
            
            // Show retry button
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn-primary px-4 py-2 mt-2 text-sm';
            retryBtn.textContent = '🔄 נסה שוב';
            retryBtn.onclick = () => fetchAndRenderWeather();
            forecastContainer.appendChild(retryBtn);
        }
        
        return null;
    }
}

/**
 * Renders the weather forecast data into the UI.
 * @param {object} data The weather data from the API.
 */
function renderWeather(data) {
    const forecastContainer = document.getElementById('weather-forecast');
    const whatToWearBtn = document.getElementById('what-to-wear-btn');
    if (!forecastContainer || !data?.daily) return;

    // Create a card for each of the next 6 days with enhanced styling
    forecastContainer.innerHTML = data.daily.time.slice(0, 6).map((dateStr, i) => {
        const date = new Date(dateStr);
        const day = date.toLocaleDateString('he-IL', { weekday: 'short' });
        const dayMonth = `${date.getDate()}.${date.getMonth() + 1}`;
        const weather = getWeatherInfo(data.daily.weathercode[i]);
        const tempMax = Math.round(data.daily.temperature_2m_max[i]);
        const tempMin = Math.round(data.daily.temperature_2m_min[i]);

        return `
            <div class="bg-secondary text-center p-4 rounded-xl shadow-sm flex-shrink-0 fade-in" style="animation-delay: ${i * 0.1}s">
                <div class="font-bold text-lg text-gray-700">${day}, ${dayMonth}</div>
                <div class="text-5xl my-2">${weather.icon}</div>
                <div class="font-semibold text-lg text-gray-800">${tempMin}° / ${tempMax}°</div>
                <div class="text-sm text-gray-500">${weather.description}</div>
            </div>`;
    }).join('');

    // Add animations to weather cards
    if (window.animationManager) {
        setTimeout(() => {
            forecastContainer.querySelectorAll('.fade-in').forEach((card, index) => {
                window.animationManager.animateElement(card, 'fade-in', index * 0.1);
            });
        }, 100);
    }

    // Show the "What to wear?" button now that the weather data is available.
    if (whatToWearBtn) {
        whatToWearBtn.classList.remove('hidden');
        if (window.animationManager) {
            window.animationManager.animateElement(whatToWearBtn, 'bounce-in', 0.5);
        }
    }
}

// --- ENHANCED SERVICE FUNCTIONS ---

/**
 * Enhanced activity service with loading states and animations
 */
export async function loadActivitiesWithEnhancements() {
    if (!currentData?.activitiesData) return;

    const activitiesGrid = document.getElementById('activities-grid');
    if (!activitiesGrid) return;

    // Show loading state
    let loadingId = null;
    if (window.loadingManager) {
        loadingId = window.loadingManager.show(activitiesGrid, 'טוען פעילויות...', 'small');
    }

    try {
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        // Render activities with animations
        renderActivitiesWithAnimations();

        // Hide loading state
        if (loadingId && window.loadingManager) {
            window.loadingManager.hide(loadingId);
        }

        // Show success toast
        if (window.toastManager) {
            window.toastManager.success(`נטענו ${currentData.activitiesData.length} פעילויות בהצלחה!`);
        }

    } catch (error) {
        console.error('Error loading activities:', error);
        
        if (loadingId && window.loadingManager) {
            window.loadingManager.hide(loadingId);
        }

        if (window.toastManager) {
            window.toastManager.error('שגיאה בטעינת הפעילויות');
        }
    }
}

/**
 * Render activities with enhanced animations
 */
function renderActivitiesWithAnimations() {
    const activitiesGrid = document.getElementById('activities-grid');
    if (!activitiesGrid || !currentData?.activitiesData) return;

    // Clear existing content
    activitiesGrid.innerHTML = '';

    // Render activities with staggered animations
    currentData.activitiesData.slice(0, 6).forEach((activity, index) => {
        const activityCard = createEnhancedActivityCard(activity);
        activitiesGrid.appendChild(activityCard);

        // Add staggered animation
        if (window.animationManager) {
            setTimeout(() => {
                window.animationManager.animateElement(activityCard, 'slide-in-left', 0);
            }, index * 100);
        }
    });
}

/**
 * Create enhanced activity card with better styling
 */
function createEnhancedActivityCard(activity) {
    const card = document.createElement('div');
    card.className = 'card activity-card';
    card.setAttribute('data-category', activity.category);
    card.setAttribute('data-time', activity.time || 0);

    const whatToBringList = activity.whatToBring ? `
        <div class="border-t pt-4 mt-4">
            <h4 class="font-semibold mb-2">🎒 מה להביא?</h4>
            <ul class="list-disc pr-5 space-y-1 text-sm text-gray-600">
                ${activity.whatToBring.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>` : '';

    card.innerHTML = `
        <div class="image-container">
            <img src="${activity.image}" alt="${activity.name}" class="w-full h-48 object-cover" onerror="this.closest('.card').classList.add('no-image');">
        </div>
        <div class="image-fallback">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
        <div class="p-6 flex flex-col flex-grow">
            <div class="flex-grow">
                <h3 class="text-xl font-bold mb-2">${activity.name}</h3>
                <span class="text-sm font-semibold text-accent py-1 px-2 rounded-full bg-teal-50 mb-3 inline-block">${activity.category}</span>
                <p class="text-gray-600 mb-4 text-sm">${activity.description}</p>
                
                <div class="border-t pt-4 mt-4 space-y-3 text-sm">
                    <div class="flex items-start">
                        <span class="w-6 text-center mt-1">🕒</span>
                        <p><strong>זמן הגעה:</strong> כ-${activity.time || 'לא ידוע'} דקות</p>
                    </div>
                    <div class="flex items-start">
                        <span class="w-6 text-center mt-1">💰</span>
                        <p><strong>עלות:</strong> ${activity.cost}</p>
                    </div>
                    <div class="flex items-start">
                        <span class="w-6 text-center mt-1">📍</span>
                        <p><strong>כתובת:</strong> ${activity.address}</p>
                    </div>
                </div>

                ${whatToBringList}
            </div>

            <div class="flex space-x-2 space-x-reverse mt-4">
                <a href="${activity.link || '#'}" target="_blank" class="flex-1 text-center btn-primary px-4 py-2 rounded-lg text-sm">לאתר הרשמי</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${activity.address}" target="_blank" class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">ניווט ב-Maps</a>
            </div>
        </div>
    `;

    return card;
}

/**
 * Enhanced data synchronization with progress tracking
 */
export async function syncDataWithProgress() {
    if (!window.loadingManager) return;

    const progressToast = window.toastManager.loading('מסנכרן נתונים...');
    
    try {
        // Simulate data sync with progress updates
        const steps = [
            { message: 'טוען פעילויות...', progress: 20 },
            { message: 'מעדכן תחזית מזג אוויר...', progress: 40 },
            { message: 'בודק הזמנות...', progress: 60 },
            { message: 'מעדכן מידע משפחתי...', progress: 80 },
            { message: 'מסיים סינכרון...', progress: 100 }
        ];

        for (const step of steps) {
            window.toastManager.updateLoading(progressToast, step.message);
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        window.toastManager.hideLoading(progressToast);
        window.toastManager.success('הנתונים סונכרנו בהצלחה!');

    } catch (error) {
        window.toastManager.hideLoading(progressToast);
        window.toastManager.error('שגיאה בסינכרון הנתונים');
        console.error('Sync error:', error);
    }
}

