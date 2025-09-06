/**
 * 🎯 TEMPLATE MANAGER
 * 
 * Central manager for all templated functionality
 * Provides easy API for adding new templates and configurations
 */

import { TemplateUtils, TEMPLATE_CONFIG } from './config-templates.js';
import { formGenerator } from './dynamic-form-generator.js';
import { contentRenderer } from './dynamic-content-renderer.js';

export class TemplateManager {
    constructor() {
        this.initialized = false;
        this.currentConfig = null;
        this.eventListeners = new Map();
        // setupEventListeners will be called in initialize() method
    }

    /**
     * Initialize the template system
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Load CSS for dynamic templates
            this.loadDynamicTemplatesCSS();
            
            // Setup form event listeners
            this.setupFormEventListeners();
            
            // Setup content event listeners
            this.setupContentEventListeners();
            
            this.initialized = true;
            console.log('🎯 Template Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Template Manager:', error);
        }
    }

    /**
     * Load dynamic templates CSS
     */
    loadDynamicTemplatesCSS() {
        const existingLink = document.querySelector('link[href*="dynamic-templates.css"]');
        if (existingLink) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/CSS/dynamic-templates.css';
        link.id = 'dynamic-templates-css';
        document.head.appendChild(link);
    }

    /**
     * Setup form event listeners
     */
    setupFormEventListeners() {
        document.addEventListener('formEvent', (event) => {
            const { formId, eventType, data } = event.detail;
            this.handleFormEvent(formId, eventType, data);
        });
    }

    /**
     * Setup content event listeners
     */
    setupContentEventListeners() {
        document.addEventListener('activityEvent', (event) => {
            const { eventType, activity } = event.detail;
            this.handleActivityEvent(eventType, activity);
        });
    }

    /**
     * Handle form events
     */
    handleFormEvent(formId, eventType, data) {
        console.log(`📝 Form event: ${formId} - ${eventType}`, data);

        switch (eventType) {
            case 'submit':
                this.handleFormSubmit(formId, data);
                break;
            case 'previous':
                this.handleFormPrevious(formId);
                break;
            case 'skip':
                this.handleFormSkip(formId);
                break;
            case 'validation-error':
                this.handleFormValidationError(formId);
                break;
        }
    }

    /**
     * Handle activity events
     */
    handleActivityEvent(eventType, activity) {
        console.log(`🎯 Activity event: ${eventType}`, activity);

        switch (eventType) {
            case 'add':
                this.handleActivityAdd(activity);
                break;
            case 'info':
                this.handleActivityInfo(activity);
                break;
        }
    }

    /**
     * Handle form submission
     */
    handleFormSubmit(formId, data) {
        // Store form data
        if (!this.currentConfig) {
            this.currentConfig = {};
        }
        this.currentConfig[formId] = data;

        // Trigger custom event
        this.triggerEvent('formSubmit', { formId, data });

        // Auto-advance to next form if available
        const nextForm = this.getNextForm(formId);
        if (nextForm) {
            this.showForm(nextForm);
        } else {
            // All forms completed, generate content
            this.generateFinalContent();
        }
    }

    /**
     * Handle form previous
     */
    handleFormPrevious(formId) {
        const prevForm = this.getPreviousForm(formId);
        if (prevForm) {
            this.showForm(prevForm);
        }
    }

    /**
     * Handle form skip
     */
    handleFormSkip(formId) {
        // Mark form as skipped
        if (!this.currentConfig) {
            this.currentConfig = {};
        }
        this.currentConfig[formId] = { skipped: true };

        // Auto-advance to next form
        const nextForm = this.getNextForm(formId);
        if (nextForm) {
            this.showForm(nextForm);
        } else {
            this.generateFinalContent();
        }
    }

    /**
     * Handle form validation error
     */
    handleFormValidationError(formId) {
        this.triggerEvent('formValidationError', { formId });
    }

    /**
     * Handle activity add
     */
    handleActivityAdd(activity) {
        if (!this.currentConfig) {
            this.currentConfig = {};
        }
        if (!this.currentConfig.selectedActivities) {
            this.currentConfig.selectedActivities = [];
        }
        this.currentConfig.selectedActivities.push(activity);

        this.triggerEvent('activityAdded', { activity });
    }

    /**
     * Handle activity info
     */
    handleActivityInfo(activity) {
        this.triggerEvent('activityInfo', { activity });
    }

    /**
     * Show a specific form
     */
    showForm(formId, containerId = 'dynamic-form-container') {
        const form = formGenerator.generateForm(formId, containerId, {
            showHeader: true,
            showActions: true,
            showPrevious: this.hasPreviousForm(formId),
            showSkip: this.canSkipForm(formId)
        });

        if (form) {
            // Load existing data if available
            const existingData = this.currentConfig?.[formId];
            if (existingData && !existingData.skipped) {
                formGenerator.setFormData(formId, existingData);
            }

            this.triggerEvent('formShown', { formId });
        }

        return form;
    }

    /**
     * Show welcome content
     */
    showWelcomeContent(data, containerId = 'welcome-content-container') {
        const content = contentRenderer.render('welcome', data, containerId);
        this.triggerEvent('welcomeShown', { data });
        return content;
    }

    /**
     * Show itinerary content
     */
    showItineraryContent(data, containerId = 'itinerary-content-container') {
        const content = contentRenderer.render('itinerary', data, containerId);
        this.triggerEvent('itineraryShown', { data });
        return content;
    }

    /**
     * Show summary content
     */
    showSummaryContent(data, containerId = 'summary-content-container') {
        const content = contentRenderer.render('summary', data, containerId);
        this.triggerEvent('summaryShown', { data });
        return content;
    }

    /**
     * Generate final content based on all form data
     */
    generateFinalContent() {
        if (!this.currentConfig) {
            console.warn('No configuration data available');
            return;
        }

        // Generate itinerary based on configuration
        const itinerary = this.generateItinerary();
        
        // Show itinerary content
        this.showItineraryContent(itinerary);
        
        // Generate and show summary
        const summary = this.generateSummary();
        this.showSummaryContent(summary);

        this.triggerEvent('contentGenerated', { 
            config: this.currentConfig, 
            itinerary, 
            summary 
        });
    }

    /**
     * Generate itinerary based on current configuration
     */
    generateItinerary() {
        const config = this.currentConfig;
        const timeFrame = TIME_FRAMES[config['basic-info']?.tripDuration] || TIME_FRAMES['1-day'];
        const useCase = USE_CASES[config['basic-info']?.travelGroup] || USE_CASES['family-with-toddlers'];

        // Generate days
        const days = [];
        for (let i = 1; i <= timeFrame.duration; i++) {
            const day = {
                dayNumber: i,
                date: this.getDateForDay(i),
                activities: this.generateActivitiesForDay(i, timeFrame, useCase)
            };
            days.push(day);
        }

        return {
            duration: timeFrame.duration,
            days: days,
            summary: this.generateItinerarySummary(days)
        };
    }

    /**
     * Generate activities for a specific day
     */
    generateActivitiesForDay(dayNumber, timeFrame, useCase) {
        // This would typically fetch from a database or API
        // For now, return sample activities
        const sampleActivities = [
            {
                id: `activity-${dayNumber}-1`,
                name: `פעילות ${dayNumber} - בוקר`,
                category: 'must-see',
                description: 'פעילות מומלצת לבוקר',
                location: 'מרכז ז\'נבה',
                duration: 60,
                cost: 25,
                rating: 4.5
            },
            {
                id: `activity-${dayNumber}-2`,
                name: `פעילות ${dayNumber} - צהריים`,
                category: 'family-friendly',
                description: 'פעילות משפחתית לצהריים',
                location: 'פארק ז\'נבה',
                duration: 90,
                cost: 15,
                rating: 4.2
            }
        ];

        return sampleActivities;
    }

    /**
     * Generate itinerary summary
     */
    generateItinerarySummary(days) {
        const totalActivities = days.reduce((sum, day) => sum + day.activities.length, 0);
        const totalCost = days.reduce((sum, day) => 
            sum + day.activities.reduce((daySum, activity) => daySum + (activity.cost || 0), 0), 0);
        const totalWalking = totalActivities * 0.5; // Estimate 0.5km per activity
        const totalTime = days.reduce((sum, day) => 
            sum + day.activities.reduce((daySum, activity) => daySum + (activity.duration || 0), 0), 0);

        return {
            totalActivities,
            totalCost,
            totalWalking: Math.round(totalWalking * 10) / 10,
            totalTime: Math.round(totalTime / 60 * 10) / 10,
            daysText: days.map(day => `יום ${day.dayNumber}: ${day.activities.length} פעילויות`).join('\n')
        };
    }

    /**
     * Generate summary
     */
    generateSummary() {
        const config = this.currentConfig;
        const itinerary = this.generateItinerary();
        
        return {
            ...itinerary.summary,
            recommendations: this.generateRecommendations(config)
        };
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(config) {
        return [
            {
                icon: '🍽️',
                title: 'המלצת מסעדה',
                description: 'מסעדה מקומית מומלצת',
                action: 'הזמן מקום'
            },
            {
                icon: '🚌',
                title: 'תחבורה',
                description: 'כרטיס תחבורה ציבורית',
                action: 'קנה כרטיס'
            },
            {
                icon: '🏨',
                title: 'לינה',
                description: 'המלצות לינה באזור',
                action: 'הזמן חדר'
            }
        ];
    }

    /**
     * Get date for specific day
     */
    getDateForDay(dayNumber) {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayNumber - 1);
        return targetDate.toLocaleDateString('he-IL');
    }

    /**
     * Get next form in sequence
     */
    getNextForm(currentFormId) {
        const formSequence = ['basic-info', 'preferences', 'logistics'];
        const currentIndex = formSequence.indexOf(currentFormId);
        return currentIndex < formSequence.length - 1 ? formSequence[currentIndex + 1] : null;
    }

    /**
     * Get previous form in sequence
     */
    getPreviousForm(currentFormId) {
        const formSequence = ['basic-info', 'preferences', 'logistics'];
        const currentIndex = formSequence.indexOf(currentFormId);
        return currentIndex > 0 ? formSequence[currentIndex - 1] : null;
    }

    /**
     * Check if form has previous form
     */
    hasPreviousForm(formId) {
        return this.getPreviousForm(formId) !== null;
    }

    /**
     * Check if form can be skipped
     */
    canSkipForm(formId) {
        // All forms except basic-info can be skipped
        return formId !== 'basic-info';
    }

    /**
     * Add custom event listener
     */
    addEventListener(eventType, callback) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(eventType, callback) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Trigger custom event
     */
    triggerEvent(eventType, data) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Get current configuration
     */
    getCurrentConfig() {
        return this.currentConfig;
    }

    /**
     * Set configuration
     */
    setConfig(config) {
        this.currentConfig = config;
    }

    /**
     * Clear configuration
     */
    clearConfig() {
        this.currentConfig = null;
    }

    /**
     * Add new time frame
     */
    addTimeFrame(timeFrameConfig) {
        TEMPLATE_CONFIG.timeFrames[timeFrameConfig.id] = timeFrameConfig;
    }

    /**
     * Add new use case
     */
    addUseCase(useCaseConfig) {
        TEMPLATE_CONFIG.useCases[useCaseConfig.id] = useCaseConfig;
    }

    /**
     * Add new activity category
     */
    addActivityCategory(categoryConfig) {
        TEMPLATE_CONFIG.activityCategories[categoryConfig.id] = categoryConfig;
    }

    /**
     * Add new form field configuration
     */
    addFormField(formId, fieldConfig) {
        if (!TEMPLATE_CONFIG.formFields[formId]) {
            TEMPLATE_CONFIG.formFields[formId] = {
                id: formId,
                name: formId,
                fields: []
            };
        }
        TEMPLATE_CONFIG.formFields[formId].fields.push(fieldConfig);
    }

    /**
     * Add new content template
     */
    addContentTemplate(templateId, templateConfig) {
        TEMPLATE_CONFIG.contentTemplates[templateId] = templateConfig;
    }

    /**
     * Register custom renderer
     */
    registerRenderer(type, renderer) {
        contentRenderer.registerRenderer(type, renderer);
    }

    /**
     * Get available configurations
     */
    getAvailableConfigs() {
        return {
            timeFrames: Object.keys(TEMPLATE_CONFIG.timeFrames),
            useCases: Object.keys(TEMPLATE_CONFIG.useCases),
            activityCategories: Object.keys(TEMPLATE_CONFIG.activityCategories),
            formFields: Object.keys(TEMPLATE_CONFIG.formFields),
            contentTemplates: Object.keys(TEMPLATE_CONFIG.contentTemplates),
            renderers: contentRenderer.getAvailableRenderers()
        };
    }
}

// Export singleton instance
export const templateManager = new TemplateManager();
export default templateManager;
