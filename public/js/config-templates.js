/**
 * 🎯 TEMPLATIZED CONFIGURATION SYSTEM
 * 
 * This system allows easy addition of new inputs, time frames, and use cases
 * with minimal effort through configuration-driven architecture.
 */

// Base configuration structure
export const BASE_CONFIG = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    metadata: {
        title: "Geneva Family Guide",
        description: "Interactive family travel guide",
        author: "Dor Lipetz",
        defaultLanguage: "he",
        supportedLanguages: ["he", "en", "fr"]
    }
};

// Time frame configurations
export const TIME_FRAMES = {
    "1-day": {
        id: "1-day",
        name: "יום אחד",
        nameEn: "One Day",
        duration: 1,
        description: "טיול יום אחד בז'נבה",
        descriptionEn: "One day trip to Geneva",
        maxActivities: 4,
        maxMeals: 2,
        recommendedStartTime: "09:00",
        recommendedEndTime: "18:00",
        categories: ["must-see", "family-friendly", "quick-visit"]
    },
    "2-days": {
        id: "2-days",
        name: "יומיים",
        nameEn: "Two Days",
        duration: 2,
        description: "סוף שבוע בז'נבה",
        descriptionEn: "Weekend in Geneva",
        maxActivities: 8,
        maxMeals: 4,
        recommendedStartTime: "09:00",
        recommendedEndTime: "20:00",
        categories: ["must-see", "family-friendly", "cultural", "relaxation"]
    },
    "3-days": {
        id: "3-days",
        name: "שלושה ימים",
        nameEn: "Three Days",
        duration: 3,
        description: "חופשה קצרה בז'נבה",
        descriptionEn: "Short vacation in Geneva",
        maxActivities: 12,
        maxMeals: 6,
        recommendedStartTime: "09:00",
        recommendedEndTime: "20:00",
        categories: ["must-see", "family-friendly", "cultural", "outdoor", "shopping"]
    },
    "1-week": {
        id: "1-week",
        name: "שבוע",
        nameEn: "One Week",
        duration: 7,
        description: "חופשה משפחתית בז'נבה",
        descriptionEn: "Family vacation in Geneva",
        maxActivities: 20,
        maxMeals: 14,
        recommendedStartTime: "09:00",
        recommendedEndTime: "21:00",
        categories: ["must-see", "family-friendly", "cultural", "outdoor", "shopping", "day-trips", "relaxation"]
    },
    "custom": {
        id: "custom",
        name: "מותאם אישית",
        nameEn: "Custom",
        duration: null, // User defined
        description: "תוכנית מותאמת אישית",
        descriptionEn: "Custom itinerary",
        maxActivities: null, // User defined
        maxMeals: null, // User defined
        recommendedStartTime: "09:00",
        recommendedEndTime: "20:00",
        categories: ["all"] // All categories available
    }
};

// Use case configurations
export const USE_CASES = {
    "family-with-toddlers": {
        id: "family-with-toddlers",
        name: "משפחה עם פעוטות",
        nameEn: "Family with Toddlers",
        description: "משפחה עם ילדים קטנים (0-5 שנים)",
        descriptionEn: "Family with young children (0-5 years)",
        icon: "👶",
        priorities: ["safety", "convenience", "stroller-friendly", "quick-activities"],
        constraints: {
            maxWalkingDistance: 500, // meters
            maxActivityDuration: 60, // minutes
            requiresStrollerAccess: true,
            requiresChangingFacilities: true,
            requiresKidFriendlyFood: true
        },
        recommendedCategories: ["playgrounds", "museums", "parks", "family-restaurants"],
        excludedCategories: ["nightlife", "adult-only", "extreme-sports"]
    },
    "family-with-teens": {
        id: "family-with-teens",
        name: "משפחה עם בני נוער",
        nameEn: "Family with Teens",
        description: "משפחה עם בני נוער (13-18 שנים)",
        descriptionEn: "Family with teenagers (13-18 years)",
        icon: "👨‍👩‍👧‍👦",
        priorities: ["entertainment", "social-media-worthy", "variety", "independence"],
        constraints: {
            maxWalkingDistance: 1000, // meters
            maxActivityDuration: 120, // minutes
            requiresWifi: true,
            requiresPhotoOpportunities: true
        },
        recommendedCategories: ["museums", "shopping", "adventure", "cultural", "food"],
        excludedCategories: ["playgrounds", "toddler-specific"]
    },
    "senior-couples": {
        id: "senior-couples",
        name: "זוגות מבוגרים",
        nameEn: "Senior Couples",
        description: "זוגות מבוגרים (65+ שנים)",
        descriptionEn: "Senior couples (65+ years)",
        icon: "👴👵",
        priorities: ["accessibility", "comfort", "cultural", "relaxation"],
        constraints: {
            maxWalkingDistance: 300, // meters
            maxActivityDuration: 90, // minutes
            requiresElevatorAccess: true,
            requiresSeatingAreas: true,
            requiresRestroomAccess: true
        },
        recommendedCategories: ["museums", "cultural", "parks", "restaurants", "shopping"],
        excludedCategories: ["adventure", "extreme-sports", "nightlife"]
    },
    "business-travelers": {
        id: "business-travelers",
        name: "נוסעי עסקים",
        nameEn: "Business Travelers",
        description: "נוסעי עסקים עם זמן מוגבל",
        descriptionEn: "Business travelers with limited time",
        icon: "💼",
        priorities: ["efficiency", "convenience", "networking", "quick-access"],
        constraints: {
            maxWalkingDistance: 800, // meters
            maxActivityDuration: 45, // minutes
            requiresWifi: true,
            requiresBusinessFacilities: true
        },
        recommendedCategories: ["business", "quick-sights", "restaurants", "shopping"],
        excludedCategories: ["playgrounds", "family-specific", "long-duration"]
    },
    "budget-travelers": {
        id: "budget-travelers",
        name: "נוסעים בתקציב",
        nameEn: "Budget Travelers",
        description: "נוסעים עם תקציב מוגבל",
        descriptionEn: "Travelers with limited budget",
        icon: "💰",
        priorities: ["free-activities", "value", "local-experience", "walking"],
        constraints: {
            maxCostPerActivity: 20, // CHF
            prefersFreeActivities: true,
            maxWalkingDistance: 1500, // meters
        },
        recommendedCategories: ["free", "parks", "walking-tours", "local-markets"],
        excludedCategories: ["expensive", "luxury", "high-end-restaurants"]
    },
    "luxury-travelers": {
        id: "luxury-travelers",
        name: "נוסעי יוקרה",
        nameEn: "Luxury Travelers",
        description: "נוסעים המעדיפים חוויות יוקרה",
        descriptionEn: "Travelers preferring luxury experiences",
        icon: "💎",
        priorities: ["luxury", "exclusivity", "premium-service", "unique-experiences"],
        constraints: {
            minCostPerActivity: 50, // CHF
            requiresPremiumService: true,
            requiresExclusiveAccess: true
        },
        recommendedCategories: ["luxury", "fine-dining", "exclusive", "premium"],
        excludedCategories: ["budget", "free", "basic"]
    }
};

// Activity category configurations
export const ACTIVITY_CATEGORIES = {
    "must-see": {
        id: "must-see",
        name: "חובה לראות",
        nameEn: "Must See",
        icon: "⭐",
        color: "#FF6B6B",
        description: "אטרקציות חובה בז'נבה",
        priority: 1
    },
    "family-friendly": {
        id: "family-friendly",
        name: "ידידותי למשפחה",
        nameEn: "Family Friendly",
        icon: "👨‍👩‍👧‍👦",
        color: "#4ECDC4",
        description: "פעילויות מתאימות למשפחות",
        priority: 2
    },
    "cultural": {
        id: "cultural",
        name: "תרבות",
        nameEn: "Cultural",
        icon: "🎨",
        color: "#45B7D1",
        description: "מוזיאונים, גלריות ואתרים תרבותיים",
        priority: 3
    },
    "outdoor": {
        id: "outdoor",
        name: "חוץ",
        nameEn: "Outdoor",
        icon: "🌳",
        color: "#96CEB4",
        description: "פעילויות בחוץ וטבע",
        priority: 4
    },
    "food": {
        id: "food",
        name: "אוכל",
        nameEn: "Food",
        icon: "🍽️",
        color: "#FFEAA7",
        description: "מסעדות, קפה ומקומות אוכל",
        priority: 5
    },
    "shopping": {
        id: "shopping",
        name: "קניות",
        nameEn: "Shopping",
        icon: "🛍️",
        color: "#DDA0DD",
        description: "קניות ושווקים",
        priority: 6
    },
    "entertainment": {
        id: "entertainment",
        name: "בידור",
        nameEn: "Entertainment",
        icon: "🎭",
        color: "#FFB347",
        description: "בידור ופעילויות פנאי",
        priority: 7
    },
    "relaxation": {
        id: "relaxation",
        name: "הרפיה",
        nameEn: "Relaxation",
        icon: "🧘",
        color: "#98D8C8",
        description: "מקומות להרפיה ומנוחה",
        priority: 8
    }
};

// Dynamic form field configurations
export const FORM_FIELDS = {
    "basic-info": {
        id: "basic-info",
        name: "מידע בסיסי",
        fields: [
            {
                id: "trip-duration",
                type: "select",
                label: "משך הטיול",
                required: true,
                options: Object.values(TIME_FRAMES).map(tf => ({
                    value: tf.id,
                    label: tf.name,
                    description: tf.description
                }))
            },
            {
                id: "travel-group",
                type: "select",
                label: "סוג הקבוצה",
                required: true,
                options: Object.values(USE_CASES).map(uc => ({
                    value: uc.id,
                    label: uc.name,
                    description: uc.description,
                    icon: uc.icon
                }))
            },
            {
                id: "group-size",
                type: "number",
                label: "מספר אנשים",
                required: true,
                min: 1,
                max: 20,
                default: 4
            },
            {
                id: "budget-range",
                type: "select",
                label: "טווח תקציב",
                required: false,
                options: [
                    { value: "budget", label: "תקציב", description: "עד 100 CHF ליום" },
                    { value: "moderate", label: "בינוני", description: "100-300 CHF ליום" },
                    { value: "luxury", label: "יוקרה", description: "מעל 300 CHF ליום" }
                ]
            }
        ]
    },
    "preferences": {
        id: "preferences",
        name: "העדפות",
        fields: [
            {
                id: "interests",
                type: "checkbox-group",
                label: "תחומי עניין",
                required: false,
                options: Object.values(ACTIVITY_CATEGORIES).map(cat => ({
                    value: cat.id,
                    label: cat.name,
                    icon: cat.icon,
                    color: cat.color
                }))
            },
            {
                id: "accessibility-needs",
                type: "checkbox-group",
                label: "צרכי נגישות",
                required: false,
                options: [
                    { value: "wheelchair", label: "כיסא גלגלים", icon: "♿" },
                    { value: "stroller", label: "עגלה", icon: "👶" },
                    { value: "elevator", label: "מעלית", icon: "🛗" },
                    { value: "hearing", label: "שמיעה", icon: "👂" },
                    { value: "vision", label: "ראייה", icon: "👁️" }
                ]
            },
            {
                id: "dietary-restrictions",
                type: "checkbox-group",
                label: "הגבלות תזונתיות",
                required: false,
                options: [
                    { value: "vegetarian", label: "צמחוני", icon: "🥬" },
                    { value: "vegan", label: "טבעוני", icon: "🌱" },
                    { value: "gluten-free", label: "ללא גלוטן", icon: "🌾" },
                    { value: "halal", label: "חלאל", icon: "🕌" },
                    { value: "kosher", label: "כשר", icon: "✡️" }
                ]
            }
        ]
    },
    "logistics": {
        id: "logistics",
        name: "לוגיסטיקה",
        fields: [
            {
                id: "accommodation-location",
                type: "select",
                label: "מיקום הלינה",
                required: true,
                options: [
                    { value: "city-center", label: "מרכז העיר", description: "ליד האגם והעיר העתיקה" },
                    { value: "airport-area", label: "אזור שדה התעופה", description: "קרוב לשדה התעופה" },
                    { value: "business-district", label: "אזור עסקים", description: "אזור העסקים" },
                    { value: "residential", label: "אזור מגורים", description: "אזור מגורים שקט" }
                ]
            },
            {
                id: "transportation",
                type: "checkbox-group",
                label: "אמצעי תחבורה",
                required: true,
                options: [
                    { value: "walking", label: "הליכה", icon: "🚶" },
                    { value: "public-transport", label: "תחבורה ציבורית", icon: "🚌" },
                    { value: "taxi", label: "מונית", icon: "🚕" },
                    { value: "car", label: "רכב פרטי", icon: "🚗" },
                    { value: "bike", label: "אופניים", icon: "🚲" }
                ]
            },
            {
                id: "arrival-time",
                type: "time",
                label: "שעת הגעה",
                required: false,
                default: "09:00"
            },
            {
                id: "departure-time",
                type: "time",
                label: "שעת יציאה",
                required: false,
                default: "18:00"
            }
        ]
    }
};

// Dynamic content templates
export const CONTENT_TEMPLATES = {
    "welcome-message": {
        template: "ברוכים הבאים למדריך ז'נבה! 👋\n\nאני כאן לעזור לכם לתכנן את הטיול המושלם. בואו נתחיל בבחירת {timeFrame} עבור {useCase}.",
        variables: ["timeFrame", "useCase"]
    },
    "activity-suggestion": {
        template: "המלצה עבור {category}: {activityName}\n\n📍 {location}\n⏰ {duration}\n💰 {cost}\n\n{description}",
        variables: ["category", "activityName", "location", "duration", "cost", "description"]
    },
    "itinerary-summary": {
        template: "תוכנית הטיול שלכם:\n\n{days}\n\n📊 סיכום:\n• {totalActivities} פעילויות\n• {totalCost} CHF\n• {totalWalking} ק\"מ הליכה",
        variables: ["days", "totalActivities", "totalCost", "totalWalking"]
    }
};

// Export all configurations
export const TEMPLATE_CONFIG = {
    base: BASE_CONFIG,
    timeFrames: TIME_FRAMES,
    useCases: USE_CASES,
    activityCategories: ACTIVITY_CATEGORIES,
    formFields: FORM_FIELDS,
    contentTemplates: CONTENT_TEMPLATES
};

// Utility functions for template system
export const TemplateUtils = {
    /**
     * Get configuration by ID
     */
    getConfig(type, id) {
        return TEMPLATE_CONFIG[type]?.[id] || null;
    },

    /**
     * Get all configurations of a type
     */
    getAllConfigs(type) {
        return TEMPLATE_CONFIG[type] || {};
    },

    /**
     * Generate dynamic form based on configuration
     */
    generateForm(formId) {
        const formConfig = FORM_FIELDS[formId];
        if (!formConfig) return null;

        return {
            id: formConfig.id,
            name: formConfig.name,
            fields: formConfig.fields.map(field => ({
                ...field,
                // Add dynamic properties based on field type
                validation: this.getFieldValidation(field),
                styling: this.getFieldStyling(field)
            }))
        };
    },

    /**
     * Get field validation rules
     */
    getFieldValidation(field) {
        const validation = {};
        
        if (field.required) validation.required = true;
        if (field.min !== undefined) validation.min = field.min;
        if (field.max !== undefined) validation.max = field.max;
        if (field.type === 'email') validation.email = true;
        if (field.type === 'url') validation.url = true;
        
        return validation;
    },

    /**
     * Get field styling
     */
    getFieldStyling(field) {
        const styling = {
            className: `form-field form-field-${field.type}`
        };

        if (field.icon) styling.icon = field.icon;
        if (field.color) styling.color = field.color;
        
        return styling;
    },

    /**
     * Render content template with variables
     */
    renderTemplate(templateId, variables) {
        const template = CONTENT_TEMPLATES[templateId];
        if (!template) return '';

        let content = template.template;
        template.variables.forEach(variable => {
            const value = variables[variable] || `{${variable}}`;
            content = content.replace(new RegExp(`{${variable}}`, 'g'), value);
        });

        return content;
    },

    /**
     * Get filtered activities based on use case and time frame
     */
    getFilteredActivities(useCaseId, timeFrameId, allActivities) {
        const useCase = USE_CASES[useCaseId];
        const timeFrame = TIME_FRAMES[timeFrameId];
        
        if (!useCase || !timeFrame) return allActivities;

        return allActivities.filter(activity => {
            // Filter by use case constraints
            if (useCase.constraints.maxWalkingDistance && 
                activity.walkingDistance > useCase.constraints.maxWalkingDistance) {
                return false;
            }

            if (useCase.constraints.maxActivityDuration && 
                activity.duration > useCase.constraints.maxActivityDuration) {
                return false;
            }

            // Filter by excluded categories
            if (useCase.excludedCategories.includes(activity.category)) {
                return false;
            }

            // Filter by time frame categories
            if (!timeFrame.categories.includes('all') && 
                !timeFrame.categories.includes(activity.category)) {
                return false;
            }

            return true;
        });
    }
};

export default TEMPLATE_CONFIG;
