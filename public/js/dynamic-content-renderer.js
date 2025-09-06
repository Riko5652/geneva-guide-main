/**
 * 🎯 DYNAMIC CONTENT RENDERER
 * 
 * Renders content dynamically based on configuration templates
 * Allows easy addition of new content types and layouts
 */

import { TemplateUtils, CONTENT_TEMPLATES, TIME_FRAMES, USE_CASES, ACTIVITY_CATEGORIES } from './config-templates.js';

export class DynamicContentRenderer {
    constructor() {
        this.renderers = new Map();
        this.setupDefaultRenderers();
    }

    /**
     * Setup default content renderers
     */
    setupDefaultRenderers() {
        this.renderers.set('welcome', this.renderWelcomeContent.bind(this));
        this.renderers.set('itinerary', this.renderItineraryContent.bind(this));
        this.renderers.set('activity-card', this.renderActivityCard.bind(this));
        this.renderers.set('summary', this.renderSummaryContent.bind(this));
        this.renderers.set('recommendations', this.renderRecommendationsContent.bind(this));
    }

    /**
     * Render content based on type and data
     */
    render(type, data, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return null;
        }

        const renderer = this.renderers.get(type);
        if (!renderer) {
            console.error(`Renderer not found: ${type}`);
            return null;
        }

        // Clear container
        if (options.clear !== false) {
            container.innerHTML = '';
        }

        // Render content
        const element = renderer(data, options);
        if (element) {
            container.appendChild(element);
        }

        return element;
    }

    /**
     * Render welcome content
     */
    renderWelcomeContent(data, options = {}) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-content';

        // Get time frame and use case info
        const timeFrame = TIME_FRAMES[data.timeFrame] || TIME_FRAMES['1-day'];
        const useCase = USE_CASES[data.useCase] || USE_CASES['family-with-toddlers'];

        // Render welcome message using template
        const welcomeMessage = TemplateUtils.renderTemplate('welcome-message', {
            timeFrame: timeFrame.name,
            useCase: useCase.name
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = 'welcome-message';
        messageDiv.innerHTML = this.formatMessage(welcomeMessage);

        // Add time frame info
        const timeFrameDiv = this.createTimeFrameInfo(timeFrame);
        
        // Add use case info
        const useCaseDiv = this.createUseCaseInfo(useCase);

        // Add group size info
        const groupSizeDiv = this.createGroupSizeInfo(data.groupSize);

        welcomeDiv.appendChild(messageDiv);
        welcomeDiv.appendChild(timeFrameDiv);
        welcomeDiv.appendChild(useCaseDiv);
        welcomeDiv.appendChild(groupSizeDiv);

        return welcomeDiv;
    }

    /**
     * Render itinerary content
     */
    renderItineraryContent(data, options = {}) {
        const itineraryDiv = document.createElement('div');
        itineraryDiv.className = 'itinerary-content';

        // Create header
        const header = document.createElement('div');
        header.className = 'itinerary-header';
        
        const title = document.createElement('h2');
        title.textContent = 'תוכנית הטיול שלכם';
        title.className = 'itinerary-title';
        
        const subtitle = document.createElement('p');
        subtitle.textContent = `משך הטיול: ${data.duration} ימים`;
        subtitle.className = 'itinerary-subtitle';
        
        header.appendChild(title);
        header.appendChild(subtitle);
        itineraryDiv.appendChild(header);

        // Create days
        if (data.days && Array.isArray(data.days)) {
            data.days.forEach((day, index) => {
                const dayElement = this.createDayElement(day, index + 1);
                itineraryDiv.appendChild(dayElement);
            });
        }

        // Add summary
        if (data.summary) {
            const summaryElement = this.createItinerarySummary(data.summary);
            itineraryDiv.appendChild(summaryElement);
        }

        return itineraryDiv;
    }

    /**
     * Render activity card
     */
    renderActivityCard(activity, options = {}) {
        const card = document.createElement('div');
        card.className = 'activity-card dynamic-activity-card';
        card.setAttribute('data-activity-id', activity.id);

        // Get category info
        const category = ACTIVITY_CATEGORIES[activity.category] || ACTIVITY_CATEGORIES['must-see'];

        // Create card header
        const header = document.createElement('div');
        header.className = 'activity-card-header';
        
        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'activity-category-badge';
        categoryBadge.style.backgroundColor = category.color;
        categoryBadge.innerHTML = `${category.icon} ${category.name}`;
        
        const title = document.createElement('h3');
        title.className = 'activity-title';
        title.textContent = activity.name;
        
        header.appendChild(categoryBadge);
        header.appendChild(title);
        card.appendChild(header);

        // Create card content
        const content = document.createElement('div');
        content.className = 'activity-card-content';
        
        if (activity.description) {
            const description = document.createElement('p');
            description.className = 'activity-description';
            description.textContent = activity.description;
            content.appendChild(description);
        }

        // Create activity details
        const details = document.createElement('div');
        details.className = 'activity-details';
        
        if (activity.location) {
            const location = document.createElement('div');
            location.className = 'activity-detail';
            location.innerHTML = `📍 ${activity.location}`;
            details.appendChild(location);
        }
        
        if (activity.duration) {
            const duration = document.createElement('div');
            duration.className = 'activity-detail';
            duration.innerHTML = `⏰ ${activity.duration} דקות`;
            details.appendChild(duration);
        }
        
        if (activity.cost) {
            const cost = document.createElement('div');
            cost.className = 'activity-detail';
            cost.innerHTML = `💰 ${activity.cost} CHF`;
            details.appendChild(cost);
        }
        
        if (activity.rating) {
            const rating = document.createElement('div');
            rating.className = 'activity-detail';
            rating.innerHTML = `⭐ ${activity.rating}/5`;
            details.appendChild(rating);
        }

        content.appendChild(details);
        card.appendChild(content);

        // Create card actions
        const actions = document.createElement('div');
        actions.className = 'activity-card-actions';
        
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary btn-sm';
        addButton.textContent = 'הוסף לתוכנית';
        addButton.addEventListener('click', () => {
            this.triggerActivityEvent('add', activity);
        });
        
        const infoButton = document.createElement('button');
        infoButton.className = 'btn btn-outline btn-sm';
        infoButton.textContent = 'מידע נוסף';
        infoButton.addEventListener('click', () => {
            this.triggerActivityEvent('info', activity);
        });
        
        actions.appendChild(addButton);
        actions.appendChild(infoButton);
        card.appendChild(actions);

        return card;
    }

    /**
     * Render summary content
     */
    renderSummaryContent(data, options = {}) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary-content';

        // Create summary header
        const header = document.createElement('div');
        header.className = 'summary-header';
        
        const title = document.createElement('h2');
        title.textContent = 'סיכום הטיול';
        title.className = 'summary-title';
        
        header.appendChild(title);
        summaryDiv.appendChild(header);

        // Create summary stats
        const stats = document.createElement('div');
        stats.className = 'summary-stats';
        
        const statsData = [
            { label: 'פעילויות', value: data.totalActivities || 0, icon: '🎯' },
            { label: 'עלות כוללת', value: `${data.totalCost || 0} CHF`, icon: '💰' },
            { label: 'הליכה', value: `${data.totalWalking || 0} ק"מ`, icon: '🚶' },
            { label: 'זמן כולל', value: `${data.totalTime || 0} שעות`, icon: '⏰' }
        ];
        
        statsData.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.className = 'summary-stat';
            
            const icon = document.createElement('div');
            icon.className = 'stat-icon';
            icon.textContent = stat.icon;
            
            const value = document.createElement('div');
            value.className = 'stat-value';
            value.textContent = stat.value;
            
            const label = document.createElement('div');
            label.className = 'stat-label';
            label.textContent = stat.label;
            
            statElement.appendChild(icon);
            statElement.appendChild(value);
            statElement.appendChild(label);
            stats.appendChild(statElement);
        });
        
        summaryDiv.appendChild(stats);

        // Add recommendations if available
        if (data.recommendations && data.recommendations.length > 0) {
            const recommendationsDiv = this.createRecommendationsSection(data.recommendations);
            summaryDiv.appendChild(recommendationsDiv);
        }

        return summaryDiv;
    }

    /**
     * Render recommendations content
     */
    renderRecommendationsContent(data, options = {}) {
        const recommendationsDiv = document.createElement('div');
        recommendationsDiv.className = 'recommendations-content';

        // Create header
        const header = document.createElement('div');
        header.className = 'recommendations-header';
        
        const title = document.createElement('h2');
        title.textContent = 'המלצות נוספות';
        title.className = 'recommendations-title';
        
        header.appendChild(title);
        recommendationsDiv.appendChild(header);

        // Create recommendations grid
        const grid = document.createElement('div');
        grid.className = 'recommendations-grid';
        
        data.forEach(recommendation => {
            const recommendationElement = this.createRecommendationCard(recommendation);
            grid.appendChild(recommendationElement);
        });
        
        recommendationsDiv.appendChild(grid);

        return recommendationsDiv;
    }

    /**
     * Create time frame info element
     */
    createTimeFrameInfo(timeFrame) {
        const div = document.createElement('div');
        div.className = 'time-frame-info info-card';
        
        div.innerHTML = `
            <div class="info-icon">📅</div>
            <div class="info-content">
                <h4>${timeFrame.name}</h4>
                <p>${timeFrame.description}</p>
                <div class="info-details">
                    <span>משך: ${timeFrame.duration} ימים</span>
                    <span>פעילויות: עד ${timeFrame.maxActivities}</span>
                </div>
            </div>
        `;
        
        return div;
    }

    /**
     * Create use case info element
     */
    createUseCaseInfo(useCase) {
        const div = document.createElement('div');
        div.className = 'use-case-info info-card';
        
        div.innerHTML = `
            <div class="info-icon">${useCase.icon}</div>
            <div class="info-content">
                <h4>${useCase.name}</h4>
                <p>${useCase.description}</p>
                <div class="info-details">
                    <span>עדיפויות: ${useCase.priorities.join(', ')}</span>
                </div>
            </div>
        `;
        
        return div;
    }

    /**
     * Create group size info element
     */
    createGroupSizeInfo(groupSize) {
        const div = document.createElement('div');
        div.className = 'group-size-info info-card';
        
        div.innerHTML = `
            <div class="info-icon">👥</div>
            <div class="info-content">
                <h4>גודל הקבוצה</h4>
                <p>${groupSize} אנשים</p>
            </div>
        `;
        
        return div;
    }

    /**
     * Create day element
     */
    createDayElement(day, dayNumber) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-container';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        const dayTitle = document.createElement('h3');
        dayTitle.textContent = `יום ${dayNumber}`;
        dayTitle.className = 'day-title';
        
        const dayDate = document.createElement('p');
        dayDate.textContent = day.date || '';
        dayDate.className = 'day-date';
        
        dayHeader.appendChild(dayTitle);
        dayHeader.appendChild(dayDate);
        dayDiv.appendChild(dayHeader);
        
        // Add activities
        if (day.activities && Array.isArray(day.activities)) {
            const activitiesContainer = document.createElement('div');
            activitiesContainer.className = 'day-activities';
            
            day.activities.forEach(activity => {
                const activityElement = this.renderActivityCard(activity);
                activitiesContainer.appendChild(activityElement);
            });
            
            dayDiv.appendChild(activitiesContainer);
        }
        
        return dayDiv;
    }

    /**
     * Create itinerary summary
     */
    createItinerarySummary(summary) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'itinerary-summary';
        
        const summaryText = TemplateUtils.renderTemplate('itinerary-summary', {
            days: summary.daysText || '',
            totalActivities: summary.totalActivities || 0,
            totalCost: summary.totalCost || 0,
            totalWalking: summary.totalWalking || 0
        });
        
        summaryDiv.innerHTML = this.formatMessage(summaryText);
        
        return summaryDiv;
    }

    /**
     * Create recommendations section
     */
    createRecommendationsSection(recommendations) {
        const section = document.createElement('div');
        section.className = 'recommendations-section';
        
        const title = document.createElement('h3');
        title.textContent = 'המלצות נוספות';
        title.className = 'recommendations-section-title';
        
        const grid = document.createElement('div');
        grid.className = 'recommendations-grid';
        
        recommendations.forEach(recommendation => {
            const card = this.createRecommendationCard(recommendation);
            grid.appendChild(card);
        });
        
        section.appendChild(title);
        section.appendChild(grid);
        
        return section;
    }

    /**
     * Create recommendation card
     */
    createRecommendationCard(recommendation) {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        card.innerHTML = `
            <div class="recommendation-icon">${recommendation.icon || '💡'}</div>
            <div class="recommendation-content">
                <h4>${recommendation.title}</h4>
                <p>${recommendation.description}</p>
                ${recommendation.action ? `<button class="btn btn-sm btn-primary">${recommendation.action}</button>` : ''}
            </div>
        `;
        
        return card;
    }

    /**
     * Format message with line breaks and styling
     */
    formatMessage(message) {
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    /**
     * Trigger activity events
     */
    triggerActivityEvent(eventType, activity) {
        const event = new CustomEvent('activityEvent', {
            detail: {
                eventType,
                activity
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Register custom renderer
     */
    registerRenderer(type, renderer) {
        this.renderers.set(type, renderer);
    }

    /**
     * Get available renderer types
     */
    getAvailableRenderers() {
        return Array.from(this.renderers.keys());
    }
}

// Export singleton instance
export const contentRenderer = new DynamicContentRenderer();
export default contentRenderer;
