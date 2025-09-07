import { currentData, map, setMap } from './Main.js';
import { calculateDistance } from './utils.js';

/**
 * Enhanced Map Manager with advanced features
 * Provides interactive maps with clustering, filtering, and enhanced UI
 */
class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.markerClusterGroup = null;
        this.currentFilter = 'all';
        this.userLocation = null;
        this.userMarker = null;
        this.routingControl = null;
        this.init();
    }

    init() {
        this.addMapStyles();
        this.setupMapControls();
    }

    addMapStyles() {
        if (document.getElementById('map-styles')) return;

        const style = document.createElement('style');
        style.id = 'map-styles';
        style.textContent = `
            .map-container {
                position: relative;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .map-controls {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .map-control-btn {
                background: white;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 8px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
            }
            
            .map-control-btn:hover {
                background: #f9fafb;
                border-color: #9ca3af;
            }
            
            .map-control-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .map-legend {
                position: absolute;
                bottom: 10px;
                left: 10px;
                background: white;
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                font-size: 12px;
            }
            
            .map-legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 4px;
            }
            
            .map-legend-icon {
                width: 16px;
                height: 16px;
                border-radius: 50%;
            }
            
            .map-popup {
                max-width: 300px;
                direction: rtl;
            }
            
            .map-popup-title {
                font-weight: bold;
                margin-bottom: 8px;
                color: #1f2937;
            }
            
            .map-popup-content {
                font-size: 14px;
                line-height: 1.4;
            }
            
            .map-popup-actions {
                margin-top: 12px;
                display: flex;
                gap: 8px;
            }
            
            .map-popup-btn {
                padding: 6px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                color: #374151;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .map-popup-btn:hover {
                background: #f3f4f6;
            }
            
            .map-popup-btn.primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .map-popup-btn.primary:hover {
                background: #2563eb;
            }
            
            .fullscreen-map {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
                background: white;
            }
            
            .fullscreen-map .map-controls {
                top: 20px;
                right: 20px;
            }
            
            .fullscreen-map .map-legend {
                bottom: 20px;
                left: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    setupMapControls() {
        // Create map controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'map-controls';
        controlsContainer.innerHTML = `
            <button class="map-control-btn" id="map-locate-btn" title="מצא את מיקומי">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            </button>
            <button class="map-control-btn" id="map-fullscreen-btn" title="מסך מלא">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
            </button>
            <button class="map-control-btn" id="map-filter-btn" title="סינון פעילויות">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                </svg>
            </button>
        `;

        // Add controls to map container when map is initialized
        this.controlsContainer = controlsContainer;
    }

    /**
     * Initializes or re-initializes the Leaflet map with enhanced features
     */
    initMap() {
        const mapContainer = document.getElementById('map') || document.getElementById('fullscreen-map');
        
        if (!window.L || !mapContainer) {
            console.log('Map initialization skipped: Leaflet not loaded or map container not found');
            return;
        }
        
        // Clear existing map if it exists
        if (this.map) {
            this.map.remove();
        }

        // Create new map instance
        this.map = L.map(mapContainer.id, {
            zoomControl: true,
            attributionControl: true,
            zoom: 12,
            center: [46.2183, 6.0744] // Hotel location
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Initialize marker cluster group
        this.markerClusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 50
        });

        // Add controls to map container
        if (!mapContainer.querySelector('.map-controls')) {
            mapContainer.appendChild(this.controlsContainer);
        }

        // Setup event listeners
        this.setupMapEventListeners();

        // Add hotel marker
        this.addHotelMarker();

        // Add activity markers
        this.addActivityMarkers();

        // Add legend
        this.addMapLegend(mapContainer);

        // Store map instance globally
        setMap(this.map);
        if (typeof window !== 'undefined') {
            window.__APP_LEAFLET_MAP__ = this.map;
        }

        console.log('Enhanced map initialized successfully');
    }

    setupMapEventListeners() {
        // Locate button
        const locateBtn = document.getElementById('map-locate-btn');
        if (locateBtn) {
            locateBtn.addEventListener('click', () => this.locateUser());
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('map-fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Filter button
        const filterBtn = document.getElementById('map-filter-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.showFilterMenu());
        }
    }

    addHotelMarker() {
        const hotelLocation = { lat: 46.2183, lon: 6.0744, name: "Mercure Hotel Meyrin" };
        
        const hotelIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const hotelMarker = L.marker([hotelLocation.lat, hotelLocation.lon], { icon: hotelIcon });
        
        hotelMarker.bindPopup(`
            <div class="map-popup">
                <div class="map-popup-title">${hotelLocation.name}</div>
                <div class="map-popup-content">
                    נקודת המוצא שלכם!<br>
                    מלון נוח עם גישה נוחה לתחבורה הציבורית.
                </div>
                <div class="map-popup-actions">
                    <button class="map-popup-btn primary" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${hotelLocation.lat},${hotelLocation.lon}', '_blank')">
                        ניווט
                    </button>
                </div>
            </div>
        `);

        this.map.addLayer(hotelMarker);
        this.markers.push(hotelMarker);
    }

    addActivityMarkers() {
        if (!currentData?.activitiesData) return;

        // Clear existing activity markers
        this.markerClusterGroup.clearLayers();

        currentData.activitiesData.forEach(activity => {
            if (activity.lat && activity.lon) {
                const marker = this.createActivityMarker(activity);
                this.markerClusterGroup.addLayer(marker);
                this.markers.push(marker);
            }
        });

        this.map.addLayer(this.markerClusterGroup);
    }

    createActivityMarker(activity) {
        const categoryIcons = {
            'משחקייה': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            'תרבות': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            'קפה': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
            'חוץ': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
            'בית מרקחת': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-purple.png'
        };

        const iconUrl = categoryIcons[activity.category] || categoryIcons['משחקייה'];

        const activityIcon = L.icon({
            iconUrl: iconUrl,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const marker = L.marker([activity.lat, activity.lon], { 
            icon: activityIcon,
            activityData: activity
        });

        marker.bindPopup(`
            <div class="map-popup">
                <div class="map-popup-title">${activity.name}</div>
                <div class="map-popup-content">
                    <strong>קטגוריה:</strong> ${activity.category}<br>
                    <strong>זמן נסיעה:</strong> כ-${activity.time || '?'} דקות<br>
                    <strong>עלות:</strong> ${activity.cost || 'לא ידוע'}<br>
                    <strong>כתובת:</strong> ${activity.address}
                </div>
                <div class="map-popup-actions">
                    <button class="map-popup-btn primary" onclick="window.open('${activity.link || '#'}', '_blank')">
                        אתר רשמי
                    </button>
                    <button class="map-popup-btn" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lon}', '_blank')">
                        ניווט
                    </button>
                </div>
            </div>
        `);

        return marker;
    }

    addMapLegend(container) {
        const legend = document.createElement('div');
        legend.className = 'map-legend';
        legend.innerHTML = `
            <div class="map-legend-item">
                <div class="map-legend-icon" style="background: #ef4444;"></div>
                <span>מלון</span>
            </div>
            <div class="map-legend-item">
                <div class="map-legend-icon" style="background: #3b82f6;"></div>
                <span>משחקיות</span>
            </div>
            <div class="map-legend-item">
                <div class="map-legend-icon" style="background: #10b981;"></div>
                <span>תרבות</span>
            </div>
            <div class="map-legend-item">
                <div class="map-legend-icon" style="background: #f59e0b;"></div>
                <span>קפה</span>
            </div>
            <div class="map-legend-item">
                <div class="map-legend-icon" style="background: #eab308;"></div>
                <span>חוץ</span>
            </div>
            <div class="map-legend-item">
                <div class="map-legend-icon" style="background: #8b5cf6;"></div>
                <span>בית מרקחת</span>
            </div>
        `;

        container.appendChild(legend);
    }

    locateUser() {
        if (!navigator.geolocation) {
            if (window.toastManager) {
                window.toastManager.error('שירותי מיקום אינם נתמכים בדפדפן זה');
            }
            return;
        }

        const locateBtn = document.getElementById('map-locate-btn');
        if (locateBtn) {
            locateBtn.classList.add('loading-spinner');
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.userLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };

                // Remove existing user marker
                if (this.userMarker) {
                    this.map.removeLayer(this.userMarker);
                }

                // Add user location marker
                const userIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lon], { icon: userIcon });
                this.userMarker.bindPopup('<div class="map-popup"><div class="map-popup-title">מיקומך הנוכחי</div></div>');
                this.map.addLayer(this.userMarker);

                // Center map on user location
                this.map.setView([this.userLocation.lat, this.userLocation.lon], 15);

                if (window.toastManager) {
                    window.toastManager.success('מיקומך נמצא בהצלחה!');
                }

                if (locateBtn) {
                    locateBtn.classList.remove('loading-spinner');
                }
            },
            (error) => {
                if (window.toastManager) {
                    window.toastManager.error('לא ניתן לקבל את מיקומך');
                }
                if (locateBtn) {
                    locateBtn.classList.remove('loading-spinner');
                }
            }
        );
    }

    toggleFullscreen() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        if (mapContainer.classList.contains('fullscreen-map')) {
            // Exit fullscreen
            mapContainer.classList.remove('fullscreen-map');
            document.body.style.overflow = '';
        } else {
            // Enter fullscreen
            mapContainer.classList.add('fullscreen-map');
            document.body.style.overflow = 'hidden';
        }

        // Resize map after transition
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 300);
    }

    showFilterMenu() {
        // Create filter menu
        const filterMenu = document.createElement('div');
        filterMenu.className = 'map-filter-menu';
        filterMenu.style.cssText = `
            position: absolute;
            top: 60px;
            right: 10px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 12px;
            z-index: 1001;
            min-width: 200px;
        `;

        const categories = ['הכל', 'משחקייה', 'תרבות', 'קפה', 'חוץ', 'בית מרקחת'];
        
        filterMenu.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">סינון פעילויות</div>
            ${categories.map(category => `
                <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; cursor: pointer;">
                    <input type="radio" name="map-filter" value="${category}" ${this.currentFilter === category ? 'checked' : ''}>
                    <span>${category}</span>
                </label>
            `).join('')}
        `;

        // Add event listeners
        filterMenu.querySelectorAll('input[name="map-filter"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.filterActivities(e.target.value);
                filterMenu.remove();
            });
        });

        // Remove existing filter menu
        const existingMenu = document.querySelector('.map-filter-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // Add to map container
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.appendChild(filterMenu);
        }

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!filterMenu.contains(e.target) && !e.target.closest('#map-filter-btn')) {
                    filterMenu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    filterActivities(category) {
        this.currentFilter = category;
        
        if (category === 'הכל') {
            // Show all markers
            this.markerClusterGroup.eachLayer(marker => {
                marker.setOpacity(1);
            });
        } else {
            // Hide/show markers based on category
            this.markerClusterGroup.eachLayer(marker => {
                const activityData = marker.options.activityData;
                if (activityData && activityData.category === category) {
                    marker.setOpacity(1);
                } else {
                    marker.setOpacity(0.3);
                }
            });
        }

        if (window.toastManager) {
            window.toastManager.info(`מציג פעילויות: ${category}`);
        }
    }

    // Public method to reinitialize map (for compatibility)
    reinitialize() {
        this.initMap();
    }
}

// Create global map manager instance
let mapManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mapManager = new MapManager();
        window.mapManager = mapManager;
    });
} else {
    mapManager = new MapManager();
    window.mapManager = mapManager;
}

// Export functions for compatibility
export function initMap() {
    if (mapManager) {
        mapManager.initMap();
    }
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


