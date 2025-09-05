import { currentData, map, setMap } from './Main.js?v=1757094267155';
import { calculateDistance } from './utils.js?v=1757094267155';

/**
 * Initializes or re-initializes the Leaflet map.
 * It clears any existing markers and adds new ones for the hotel and all activities.
 * This function is called by main.js during the initial application render.
 */
export function initMap() {
    // Check for map containers - could be main map or fullscreen map
    const mapContainer = document.getElementById('map') || document.getElementById('fullscreen-map');
    
    // Abort if Leaflet library is not loaded or no map container exists.
    if (!window.L || !mapContainer) {
        console.log('Map initialization skipped: Leaflet not loaded or map container not found');
        return;
    }
    
    // Prefer a single shared map instance across any duplicate module loads
    let localMap = (typeof window !== 'undefined' && window.__APP_LEAFLET_MAP__) || map;

    // If the map object already exists, clear all previous layers (markers, etc.).
    if (localMap) {
        localMap.eachLayer(layer => {
            if (layer.options.pane === 'markerPane') { // A reliable way to check if it's a marker
                localMap.removeLayer(layer);
            }
        });
    } else {
        // If it's the first time, create the map instance.
        const mapId = mapContainer.id; // Use the found container's ID
        if ((mapContainer)._leaflet_id) {
            // A map is already attached to this container by another module instance; reuse it
            localMap = (typeof window !== 'undefined' && window.__APP_LEAFLET_MAP__) || map;
        } else {
            localMap = L.map(mapId, { zoomControl: true, attributionControl: true });
        }
        setMap(localMap); // Store the map instance globally.
        if (typeof window !== 'undefined') window.__APP_LEAFLET_MAP__ = localMap;
    }

    const hotelLocation = { lat: 46.2183, lon: 6.0744, name: "Mercure Hotel Meyrin" };
    // Set the map's view centered on the hotel with an appropriate zoom level.
    localMap.setView([hotelLocation.lat, hotelLocation.lon], 12);

    // Add the base map layer from OpenStreetMap.
    // Add the base layer only once
    let hasBaseLayer = false;
    localMap.eachLayer(layer => {
        if (layer.getAttribution && layer.getAttribution()) hasBaseLayer = true;
    });
    if (!hasBaseLayer) {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(localMap);
    }

    // Define custom icons to differentiate the hotel from other activities.
    const hotelIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    const activityIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    // Add a marker for the hotel.
    L.marker([hotelLocation.lat, hotelLocation.lon], { icon: hotelIcon })
        .addTo(localMap)
        .bindTooltip(`<div dir="rtl" style="font-weight: bold;">${hotelLocation.name}<br>נקודת המוצא שלכם!</div>`)
        .openTooltip();

    // Loop through all activities in the current data and add a marker for each one.
    currentData?.activitiesData?.forEach(activity => {
        // Only add a marker if the activity has valid latitude and longitude.
        if (activity.lat && activity.lon) {
            L.marker([activity.lat, activity.lon], { icon: activityIcon })
                .addTo(localMap)
                .bindTooltip(`<div dir="rtl"><b>${activity.name || ''}</b><br>כ-${activity.time || '?'} דקות נסיעה מהמלון</div>`);
        }
    });
}

/**
 * Finds and displays nearby points of interest based on the user's current location.
 * This function is called by handlers.js when the "Find Nearby" feature is triggered.
 * @param {number} latitude The user's current latitude.
 * @param {number} longitude The user's current longitude.
 */
export function findAndDisplayNearby(latitude, longitude) {
    const resultsContainer = document.getElementById('nearby-results');
    if (!resultsContainer) return;
    
    if (!currentData?.activitiesData) {
        resultsContainer.innerHTML = '<p>לא ניתן לטעון את רשימת הפעילויות כרגע.</p>';
        return;
    }

    // Filter for relevant categories, calculate distance for each, and sort them.
    const nearbyPlaces = currentData.activitiesData
        .filter(place => ['משחקייה', 'חוץ', 'בית מרקחת'].includes(place.category) && place.lat && place.lon)
        .map(place => ({
            ...place,
            calculatedDistance: calculateDistance(latitude, longitude, place.lat, place.lon)
        }))
        .sort((a, b) => a.calculatedDistance - b.calculatedDistance);

    // Get the top 5 playgrounds/parks and top 3 pharmacies.
    const playgrounds = nearbyPlaces.filter(p => ['משחקייה', 'חוץ'].includes(p.category)).slice(0, 5);
    const pharmacies = nearbyPlaces.filter(p => p.category === 'בית מרקחת').slice(0, 3);

    // Build the HTML to display the results in the modal.
    resultsContainer.innerHTML = `
        <div dir="rtl">
            <h4 class="font-bold text-lg mb-2 text-gray-800">🤸‍♂️ משחקיות ופארקים קרובים:</h4>
            ${playgrounds.length > 0 ? `
                <ul class="list-disc pr-5 space-y-2 text-gray-700">
                    ${playgrounds.map(p => `<li><strong>${p.name}</strong> - כ-${p.calculatedDistance.toFixed(1)} ק"מ</li>`).join('')}
                </ul>
            ` : '<p class="text-gray-500">לא נמצאו פארקים בקרבת מקום.</p>'}
        </div>
        <div class="border-t pt-4 mt-4" dir="rtl">
            <h4 class="font-bold text-lg mb-2 text-gray-800">⚕️ בתי מרקחת קרובים:</h4>
            ${pharmacies.length > 0 ? `
                <ul class="list-disc pr-5 space-y-2 text-gray-700">
                    ${pharmacies.map(p => `<li><strong>${p.name}</strong> - כ-${p.calculatedDistance.toFixed(1)} ק"מ</li>`).join('')}
                </ul>
            ` : '<p class="text-gray-500">לא נמצאו בתי מרקחת בקרבת מקום.</p>'}
        </div>`;
}

