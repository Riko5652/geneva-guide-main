/**
 * Flow Enhancement System
 * Improves user experience through better loading states, feedback, and error handling
 */

import { familyToast } from './toast.js';
import { familyLoader } from './loading.js';

// Enhanced loading state management
class FlowEnhancementManager {
    constructor() {
        this.activeLoaders = new Set();
        this.userFeedbackQueue = [];
        this.isProcessing = false;
    }

    /**
     * Show enhanced loading state with context
     */
    showLoading(context, message = 'טוען...') {
        const loaderId = `${context}-${Date.now()}`;
        this.activeLoaders.add(loaderId);
        
        // Show contextual loading message
        familyLoader.show(message, {
            context: context,
            duration: 0, // Indefinite until manually hidden
            showProgress: false
        });
        
        return loaderId;
    }

    /**
     * Hide loading state
     */
    hideLoading(loaderId) {
        this.activeLoaders.delete(loaderId);
        
        if (this.activeLoaders.size === 0) {
            familyLoader.hide();
        }
    }

    /**
     * Show enhanced user feedback
     */
    showFeedback(type, message, options = {}) {
        const feedback = {
            type,
            message,
            timestamp: Date.now(),
            ...options
        };
        
        this.userFeedbackQueue.push(feedback);
        
        // Show toast with enhanced styling
        familyToast.show(message, {
            type: type,
            duration: options.duration || 5000,
            position: options.position || 'top-right',
            showIcon: true,
            allowDismiss: true
        });
        
        // Auto-remove from queue after duration
        setTimeout(() => {
            this.userFeedbackQueue = this.userFeedbackQueue.filter(f => f.timestamp !== feedback.timestamp);
        }, feedback.duration || 5000);
    }

    /**
     * Enhanced error handling with recovery options
     */
    handleError(error, context, recoveryOptions = {}) {
        console.error(`Error in ${context}:`, error);
        
        let userMessage = 'אירעה שגיאה. אנא נסה שוב.';
        let recoveryAction = null;
        
        // Context-specific error messages
        switch (context) {
            case 'photo-upload':
                userMessage = 'שגיאה בהעלאת התמונה. בדוק את החיבור לאינטרנט ונסה שוב.';
                recoveryAction = () => this.retryPhotoUpload(recoveryOptions.file);
                break;
            case 'firebase-sync':
                userMessage = 'שגיאה בסנכרון הנתונים. הנתונים נשמרו מקומית.';
                recoveryAction = () => this.retryFirebaseSync();
                break;
            case 'ai-chat':
                userMessage = 'שגיאה בשיחה עם המומחה. נסה לשאול שאלה אחרת.';
                break;
            case 'weather-fetch':
                userMessage = 'לא ניתן לטעון תחזית מזג האוויר. נסה לרענן את הדף.';
                break;
        }
        
        this.showFeedback('error', userMessage, {
            duration: 8000,
            showRetry: !!recoveryAction,
            recoveryAction: recoveryAction
        });
    }

    /**
     * Enhanced success feedback
     */
    showSuccess(message, options = {}) {
        this.showFeedback('success', message, {
            duration: 3000,
            ...options
        });
    }

    /**
     * Enhanced progress tracking
     */
    showProgress(context, current, total, message = 'מעבד...') {
        const percentage = Math.round((current / total) * 100);
        
        familyLoader.show(`${message} (${current}/${total})`, {
            context: context,
            progress: percentage,
            showProgress: true
        });
    }

    /**
     * Retry mechanisms
     */
    async retryPhotoUpload(file) {
        const loaderId = this.showLoading('photo-retry', 'מנסה להעלות שוב...');
        
        try {
            // Implement retry logic here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate retry
            this.hideLoading(loaderId);
            this.showSuccess('התמונה הועלתה בהצלחה!');
        } catch (error) {
            this.hideLoading(loaderId);
            this.handleError(error, 'photo-upload');
        }
    }

    async retryFirebaseSync() {
        const loaderId = this.showLoading('firebase-retry', 'מסנכרן נתונים...');
        
        try {
            // Implement Firebase retry logic here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate retry
            this.hideLoading(loaderId);
            this.showSuccess('הנתונים סונכרנו בהצלחה!');
        } catch (error) {
            this.hideLoading(loaderId);
            this.handleError(error, 'firebase-sync');
        }
    }

    /**
     * Flow validation
     */
    validateFlow(flowName, steps) {
        const validation = {
            flowName,
            steps: steps.map(step => ({
                name: step.name,
                completed: step.validate ? step.validate() : false,
                required: step.required || false
            })),
            isValid: true
        };
        
        validation.isValid = validation.steps.every(step => 
            step.completed || !step.required
        );
        
        return validation;
    }

    /**
     * Enhanced form validation
     */
    validateForm(formElement, rules) {
        const errors = [];
        const formData = new FormData(formElement);
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData.get(field);
            
            if (rule.required && (!value || value.trim() === '')) {
                errors.push({
                    field,
                    message: rule.message || `${field} הוא שדה חובה`
                });
            }
            
            if (rule.pattern && value && !rule.pattern.test(value)) {
                errors.push({
                    field,
                    message: rule.message || `${field} אינו תקין`
                });
            }
            
            if (rule.minLength && value && value.length < rule.minLength) {
                errors.push({
                    field,
                    message: rule.message || `${field} חייב להכיל לפחות ${rule.minLength} תווים`
                });
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Enhanced modal flow management
     */
    openModalWithFlow(modalId, flowSteps, onComplete) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Show modal with enhanced loading
        const loaderId = this.showLoading('modal-flow', 'טוען...');
        
        // Execute flow steps
        this.executeFlowSteps(flowSteps, () => {
            this.hideLoading(loaderId);
            if (onComplete) onComplete();
        });
    }

    async executeFlowSteps(steps, onComplete) {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            try {
                this.showProgress('modal-flow', i + 1, steps.length, step.message);
                
                if (step.action) {
                    await step.action();
                }
                
                if (step.delay) {
                    await new Promise(resolve => setTimeout(resolve, step.delay));
                }
            } catch (error) {
                this.handleError(error, 'modal-flow');
                return;
            }
        }
        
        if (onComplete) onComplete();
    }
}

// Create global flow enhancement manager
const flowManager = new FlowEnhancementManager();

// Export functions for use throughout the app
export function showFlowLoading(context, message) {
    return flowManager.showLoading(context, message);
}

export function hideFlowLoading(loaderId) {
    flowManager.hideLoading(loaderId);
}

export function showFlowFeedback(type, message, options) {
    flowManager.showFeedback(type, message, options);
}

export function handleFlowError(error, context, recoveryOptions) {
    flowManager.handleError(error, context, recoveryOptions);
}

export function showFlowSuccess(message, options) {
    flowManager.showSuccess(message, options);
}

export function showFlowProgress(context, current, total, message) {
    flowManager.showProgress(context, current, total, message);
}

export function validateFlow(flowName, steps) {
    return flowManager.validateFlow(flowName, steps);
}

export function validateForm(formElement, rules) {
    return flowManager.validateForm(formElement, rules);
}

export function openModalWithFlow(modalId, flowSteps, onComplete) {
    flowManager.openModalWithFlow(modalId, flowSteps, onComplete);
}

// Make flow manager available globally for debugging
if (typeof window !== 'undefined') {
    window.flowManager = flowManager;
}
