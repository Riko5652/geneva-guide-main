/**
 * 🎯 TEMPLATE SYSTEM DEMO
 * 
 * Demonstrates the templated system functionality
 * Shows how easy it is to add new configurations
 */

import { templateManager } from './template-manager.js';

export class TemplateDemo {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the demo
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize template manager
            await templateManager.initialize();
            
            // Setup demo event listeners
            this.setupEventListeners();
            
            // Start the demo
            this.startDemo();
            
            this.initialized = true;
            console.log('🎯 Template Demo initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Template Demo:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for template manager events
        templateManager.addEventListener('formSubmit', (data) => {
            console.log('📝 Form submitted:', data);
            this.handleFormSubmit(data);
        });

        templateManager.addEventListener('contentGenerated', (data) => {
            console.log('🎯 Content generated:', data);
            this.handleContentGenerated(data);
        });

        templateManager.addEventListener('activityAdded', (data) => {
            console.log('🎯 Activity added:', data);
            this.showToast(`פעילות "${data.activity.name}" נוספה לתוכנית!`);
        });
    }

    /**
     * Start the demo
     */
    startDemo() {
        // Show the first form
        this.showFirstForm();
        
        // Add demo button to showcase adding new configurations
        this.addDemoButtons();
    }

    /**
     * Show the first form
     */
    showFirstForm() {
        const form = templateManager.showForm('basic-info', 'dynamic-form-container');
        if (form) {
            console.log('📝 First form displayed');
        }
    }

    /**
     * Handle form submission
     */
    handleFormSubmit(data) {
        const { formId, data: formData } = data;
        
        // Show welcome content after basic-info form
        if (formId === 'basic-info') {
            this.showWelcomeContent(formData);
        }
    }

    /**
     * Show welcome content
     */
    showWelcomeContent(formData) {
        // Hide form container
        const formContainer = document.getElementById('dynamic-form-container');
        if (formContainer) {
            formContainer.style.display = 'none';
        }

        // Show welcome content
        const welcomeContent = templateManager.showWelcomeContent(formData, 'welcome-content-container');
        if (welcomeContent) {
            document.getElementById('welcome-content-container').style.display = 'block';
            
            // Auto-advance to next form after 3 seconds
            setTimeout(() => {
                this.showNextForm();
            }, 3000);
        }
    }

    /**
     * Show next form
     */
    showNextForm() {
        // Hide welcome content
        const welcomeContainer = document.getElementById('welcome-content-container');
        if (welcomeContainer) {
            welcomeContainer.style.display = 'none';
        }

        // Show preferences form
        const form = templateManager.showForm('preferences', 'dynamic-form-container');
        if (form) {
            document.getElementById('dynamic-form-container').style.display = 'block';
        }
    }

    /**
     * Handle content generation
     */
    handleContentGenerated(data) {
        const { config, itinerary, summary } = data;
        
        // Hide form container
        const formContainer = document.getElementById('dynamic-form-container');
        if (formContainer) {
            formContainer.style.display = 'none';
        }

        // Show itinerary
        const itineraryContent = templateManager.showItineraryContent(itinerary, 'itinerary-content-container');
        if (itineraryContent) {
            document.getElementById('itinerary-content-container').style.display = 'block';
        }

        // Show summary
        const summaryContent = templateManager.showSummaryContent(summary, 'summary-content-container');
        if (summaryContent) {
            document.getElementById('summary-content-container').style.display = 'block';
        }

        // Show demo completion message
        this.showDemoCompletion();
    }

    /**
     * Show demo completion message
     */
    showDemoCompletion() {
        const completionDiv = document.createElement('div');
        completionDiv.className = 'demo-completion';
        completionDiv.innerHTML = `
            <div class="completion-card">
                <h3>🎉 הדמו הושלם בהצלחה!</h3>
                <p>המערכת יצרה תוכנית מותאמת אישית בהתבסס על התשובות שלכם.</p>
                <div class="completion-actions">
                    <button class="btn btn-primary" onclick="templateDemo.restartDemo()">התחל מחדש</button>
                    <button class="btn btn-secondary" onclick="templateDemo.showConfigDemo()">הצג אפשרויות תצורה</button>
                </div>
            </div>
        `;
        
        const container = document.getElementById('summary-content-container');
        if (container) {
            container.appendChild(completionDiv);
        }
    }

    /**
     * Add demo buttons to showcase configuration capabilities
     */
    addDemoButtons() {
        const demoContainer = document.querySelector('.template-system-demo');
        if (!demoContainer) return;

        const demoButtons = document.createElement('div');
        demoButtons.className = 'demo-buttons';
        demoButtons.innerHTML = `
            <div class="demo-buttons-container">
                <h4>🔧 אפשרויות תצורה</h4>
                <div class="demo-buttons-grid">
                    <button class="btn btn-outline btn-sm" onclick="templateDemo.addNewTimeFrame()">
                        ➕ הוסף זמן חדש
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="templateDemo.addNewUseCase()">
                        ➕ הוסף מקרה שימוש
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="templateDemo.addNewCategory()">
                        ➕ הוסף קטגוריה
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="templateDemo.showAvailableConfigs()">
                        📋 הצג תצורות זמינות
                    </button>
                </div>
            </div>
        `;
        
        demoContainer.appendChild(demoButtons);
    }

    /**
     * Add new time frame (demo)
     */
    addNewTimeFrame() {
        const newTimeFrame = {
            id: "2-weeks",
            name: "שבועיים",
            nameEn: "Two Weeks",
            duration: 14,
            description: "חופשה ארוכה בז'נבה",
            descriptionEn: "Long vacation in Geneva",
            maxActivities: 35,
            maxMeals: 28,
            recommendedStartTime: "09:00",
            recommendedEndTime: "21:00",
            categories: ["all"]
        };

        templateManager.addTimeFrame(newTimeFrame);
        this.showToast(`זמן חדש "${newTimeFrame.name}" נוסף למערכת!`);
        console.log('✅ New time frame added:', newTimeFrame);
    }

    /**
     * Add new use case (demo)
     */
    addNewUseCase() {
        const newUseCase = {
            id: "solo-traveler",
            name: "נוסע יחיד",
            nameEn: "Solo Traveler",
            description: "נוסע יחיד המעדיף חוויות אישיות",
            descriptionEn: "Solo traveler preferring personal experiences",
            icon: "🧑‍🦱",
            priorities: ["flexibility", "safety", "social", "unique-experiences"],
            constraints: {
                maxWalkingDistance: 2000,
                maxActivityDuration: 180,
                requiresWifi: true,
                requiresSocialOpportunities: true
            },
            recommendedCategories: ["cultural", "food", "entertainment", "social"],
            excludedCategories: ["family-specific", "group-only"]
        };

        templateManager.addUseCase(newUseCase);
        this.showToast(`מקרה שימוש חדש "${newUseCase.name}" נוסף למערכת!`);
        console.log('✅ New use case added:', newUseCase);
    }

    /**
     * Add new category (demo)
     */
    addNewCategory() {
        const newCategory = {
            id: "adventure",
            name: "הרפתקאות",
            nameEn: "Adventure",
            icon: "🏔️",
            color: "#FF6B35",
            description: "פעילויות הרפתקאות ואתגרים",
            priority: 9
        };

        templateManager.addActivityCategory(newCategory);
        this.showToast(`קטגוריה חדשה "${newCategory.name}" נוספה למערכת!`);
        console.log('✅ New category added:', newCategory);
    }

    /**
     * Show available configurations
     */
    showAvailableConfigs() {
        const configs = templateManager.getAvailableConfigs();
        
        const configDisplay = document.createElement('div');
        configDisplay.className = 'config-display';
        configDisplay.innerHTML = `
            <div class="config-display-content">
                <h4>📋 תצורות זמינות במערכת</h4>
                <div class="config-sections">
                    <div class="config-section">
                        <h5>זמנים (${configs.timeFrames.length}):</h5>
                        <p>${configs.timeFrames.join(', ')}</p>
                    </div>
                    <div class="config-section">
                        <h5>מקרי שימוש (${configs.useCases.length}):</h5>
                        <p>${configs.useCases.join(', ')}</p>
                    </div>
                    <div class="config-section">
                        <h5>קטגוריות פעילויות (${configs.activityCategories.length}):</h5>
                        <p>${configs.activityCategories.join(', ')}</p>
                    </div>
                    <div class="config-section">
                        <h5>תבניות טפסים (${configs.formFields.length}):</h5>
                        <p>${configs.formFields.join(', ')}</p>
                    </div>
                    <div class="config-section">
                        <h5>מעבדי תוכן (${configs.renderers.length}):</h5>
                        <p>${configs.renderers.join(', ')}</p>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">סגור</button>
            </div>
        `;
        
        document.body.appendChild(configDisplay);
    }

    /**
     * Show configuration demo
     */
    showConfigDemo() {
        this.showAvailableConfigs();
    }

    /**
     * Restart demo
     */
    restartDemo() {
        // Clear all containers
        const containers = [
            'dynamic-form-container',
            'welcome-content-container',
            'itinerary-content-container',
            'summary-content-container'
        ];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
                container.style.display = 'none';
            }
        });

        // Clear template manager config
        templateManager.clearConfig();
        
        // Restart demo
        this.startDemo();
        
        this.showToast('הדמו התחיל מחדש!');
    }

    /**
     * Show toast message
     */
    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'template-toast';
        toast.textContent = message;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Create global instance
window.templateDemo = new TemplateDemo();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.templateDemo.initialize();
    });
} else {
    window.templateDemo.initialize();
}

export default window.templateDemo;
