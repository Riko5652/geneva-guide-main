import { currentData } from './Main.js?v=1757102250978';
import { getWeatherInfo } from './utils.js?v=1757102250978';

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
    forecastContainer.innerHTML = '<p class="text-center w-full col-span-full text-gray-500">טוען תחזית עדכנית...</p>';

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

        renderWeather(data);
        
        // Update quick status after weather is loaded
        import('./ui.js?v=1757102250978').then(({ renderQuickStatus }) => {
            if (renderQuickStatus) renderQuickStatus();
        }).catch(console.warn);
        
        return data;
    } catch (error) {
        console.warn("Failed to fetch weather:", error);
        forecastContainer.innerHTML = '<p class="text-center w-full col-span-full text-red-500">לא ניתן היה לטעון את תחזית מזג האוויר.</p>';
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

    // Create a card for each of the next 6 days.
    forecastContainer.innerHTML = data.daily.time.slice(0, 6).map((dateStr, i) => {
        const date = new Date(dateStr);
        const day = date.toLocaleDateString('he-IL', { weekday: 'short' });
        const dayMonth = `${date.getDate()}.${date.getMonth() + 1}`;
        const weather = getWeatherInfo(data.daily.weathercode[i]);
        const tempMax = Math.round(data.daily.temperature_2m_max[i]);
        const tempMin = Math.round(data.daily.temperature_2m_min[i]);

        return `
            <div class="bg-gray-100 text-center p-4 rounded-xl shadow-sm flex-shrink-0">
                <div class="font-bold text-lg text-gray-700">${day}, ${dayMonth}</div>
                <div class="text-5xl my-2">${weather.icon}</div>
                <div class="font-semibold text-lg text-gray-800">${tempMin}° / ${tempMax}°</div>
                <div class="text-sm text-gray-500">${weather.description}</div>
            </div>`;
    }).join('');

    // Show the "What to wear?" button now that the weather data is available.
    if (whatToWearBtn) whatToWearBtn.classList.remove('hidden');
}

