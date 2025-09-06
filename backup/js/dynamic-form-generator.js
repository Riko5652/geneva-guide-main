/**
 * 🎯 DYNAMIC FORM GENERATOR
 * 
 * Generates forms dynamically based on configuration templates
 * Allows easy addition of new form fields and validation rules
 */

import { TemplateUtils, FORM_FIELDS, TIME_FRAMES, USE_CASES } from './config-templates.js';

export class DynamicFormGenerator {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.setupDefaultValidators();
    }

    /**
     * Setup default validation rules
     */
    setupDefaultValidators() {
        this.validators.set('required', (value) => {
            return value !== null && value !== undefined && value !== '';
        });

        this.validators.set('min', (value, min) => {
            return Number(value) >= min;
        });

        this.validators.set('max', (value, max) => {
            return Number(value) <= max;
        });

        this.validators.set('email', (value) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        });

        this.validators.set('url', (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });

        this.validators.set('time', (value) => {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        });
    }

    /**
     * Generate a complete form
     */
    generateForm(formId, containerId, options = {}) {
        const formConfig = TemplateUtils.generateForm(formId);
        if (!formConfig) {
            console.error(`Form configuration not found: ${formId}`);
            return null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return null;
        }

        // Clear container
        container.innerHTML = '';

        // Create form element
        const form = document.createElement('form');
        form.id = `dynamic-form-${formId}`;
        form.className = 'dynamic-form';
        form.setAttribute('data-form-id', formId);

        // Add form header
        if (options.showHeader !== false) {
            const header = this.createFormHeader(formConfig);
            form.appendChild(header);
        }

        // Generate form fields
        formConfig.fields.forEach(fieldConfig => {
            const fieldElement = this.generateField(fieldConfig);
            if (fieldElement) {
                form.appendChild(fieldElement);
            }
        });

        // Add form actions
        if (options.showActions !== false) {
            const actions = this.createFormActions(formId, options);
            form.appendChild(actions);
        }

        // Add form to container
        container.appendChild(form);

        // Store form reference
        this.forms.set(formId, {
            element: form,
            config: formConfig,
            data: {}
        });

        // Setup form event listeners
        this.setupFormEventListeners(formId);

        return form;
    }

    /**
     * Create form header
     */
    createFormHeader(formConfig) {
        const header = document.createElement('div');
        header.className = 'form-header';
        
        const title = document.createElement('h3');
        title.className = 'form-title';
        title.textContent = formConfig.name;
        
        header.appendChild(title);
        return header;
    }

    /**
     * Generate individual form field
     */
    generateField(fieldConfig) {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'form-field-container';
        fieldContainer.setAttribute('data-field-id', fieldConfig.id);

        // Create label
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = fieldConfig.label;
        if (fieldConfig.required) {
            label.innerHTML += ' <span class="required">*</span>';
        }
        fieldContainer.appendChild(label);

        // Generate field based on type
        let fieldElement;
        switch (fieldConfig.type) {
            case 'text':
            case 'email':
            case 'url':
            case 'number':
            case 'time':
                fieldElement = this.createInputField(fieldConfig);
                break;
            case 'select':
                fieldElement = this.createSelectField(fieldConfig);
                break;
            case 'checkbox-group':
                fieldElement = this.createCheckboxGroupField(fieldConfig);
                break;
            case 'radio-group':
                fieldElement = this.createRadioGroupField(fieldConfig);
                break;
            case 'textarea':
                fieldElement = this.createTextareaField(fieldConfig);
                break;
            default:
                console.warn(`Unknown field type: ${fieldConfig.type}`);
                return null;
        }

        if (fieldElement) {
            fieldContainer.appendChild(fieldElement);
            
            // Add field description if available
            if (fieldConfig.description) {
                const description = document.createElement('div');
                description.className = 'form-field-description';
                description.textContent = fieldConfig.description;
                fieldContainer.appendChild(description);
            }

            // Add validation error container
            const errorContainer = document.createElement('div');
            errorContainer.className = 'form-field-error';
            errorContainer.style.display = 'none';
            fieldContainer.appendChild(errorContainer);
        }

        return fieldContainer;
    }

    /**
     * Create input field
     */
    createInputField(fieldConfig) {
        const input = document.createElement('input');
        input.type = fieldConfig.type;
        input.id = fieldConfig.id;
        input.name = fieldConfig.id;
        input.className = 'form-input';
        
        if (fieldConfig.placeholder) {
            input.placeholder = fieldConfig.placeholder;
        }
        
        if (fieldConfig.default) {
            input.value = fieldConfig.default;
        }
        
        if (fieldConfig.min !== undefined) {
            input.min = fieldConfig.min;
        }
        
        if (fieldConfig.max !== undefined) {
            input.max = fieldConfig.max;
        }
        
        if (fieldConfig.required) {
            input.required = true;
        }

        return input;
    }

    /**
     * Create select field
     */
    createSelectField(fieldConfig) {
        const select = document.createElement('select');
        select.id = fieldConfig.id;
        select.name = fieldConfig.id;
        select.className = 'form-select';
        
        if (fieldConfig.required) {
            select.required = true;
        }

        // Add default option if not required
        if (!fieldConfig.required) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'בחר אפשרות...';
            select.appendChild(defaultOption);
        }

        // Add options
        fieldConfig.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            
            if (option.description) {
                optionElement.title = option.description;
            }
            
            select.appendChild(optionElement);
        });

        return select;
    }

    /**
     * Create checkbox group field
     */
    createCheckboxGroupField(fieldConfig) {
        const container = document.createElement('div');
        container.className = 'checkbox-group';

        fieldConfig.options.forEach(option => {
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${fieldConfig.id}-${option.value}`;
            checkbox.name = fieldConfig.id;
            checkbox.value = option.value;
            checkbox.className = 'form-checkbox';

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.className = 'checkbox-label';
            
            if (option.icon) {
                label.innerHTML = `${option.icon} ${option.label}`;
            } else {
                label.textContent = option.label;
            }

            if (option.description) {
                label.title = option.description;
            }

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            container.appendChild(checkboxContainer);
        });

        return container;
    }

    /**
     * Create radio group field
     */
    createRadioGroupField(fieldConfig) {
        const container = document.createElement('div');
        container.className = 'radio-group';

        fieldConfig.options.forEach(option => {
            const radioContainer = document.createElement('div');
            radioContainer.className = 'radio-item';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `${fieldConfig.id}-${option.value}`;
            radio.name = fieldConfig.id;
            radio.value = option.value;
            radio.className = 'form-radio';

            const label = document.createElement('label');
            label.htmlFor = radio.id;
            label.className = 'radio-label';
            label.textContent = option.label;

            if (option.description) {
                label.title = option.description;
            }

            radioContainer.appendChild(radio);
            radioContainer.appendChild(label);
            container.appendChild(radioContainer);
        });

        return container;
    }

    /**
     * Create textarea field
     */
    createTextareaField(fieldConfig) {
        const textarea = document.createElement('textarea');
        textarea.id = fieldConfig.id;
        textarea.name = fieldConfig.id;
        textarea.className = 'form-textarea';
        
        if (fieldConfig.placeholder) {
            textarea.placeholder = fieldConfig.placeholder;
        }
        
        if (fieldConfig.rows) {
            textarea.rows = fieldConfig.rows;
        }
        
        if (fieldConfig.cols) {
            textarea.cols = fieldConfig.cols;
        }
        
        if (fieldConfig.required) {
            textarea.required = true;
        }

        return textarea;
    }

    /**
     * Create form actions
     */
    createFormActions(formId, options) {
        const actions = document.createElement('div');
        actions.className = 'form-actions';

        // Previous button
        if (options.showPrevious !== false) {
            const prevButton = document.createElement('button');
            prevButton.type = 'button';
            prevButton.className = 'btn btn-secondary form-prev-btn';
            prevButton.textContent = 'הקודם';
            prevButton.addEventListener('click', () => {
                this.triggerFormEvent(formId, 'previous');
            });
            actions.appendChild(prevButton);
        }

        // Next/Submit button
        const nextButton = document.createElement('button');
        nextButton.type = 'submit';
        nextButton.className = 'btn btn-primary form-next-btn';
        nextButton.textContent = options.submitText || 'הבא';
        actions.appendChild(nextButton);

        // Skip button
        if (options.showSkip) {
            const skipButton = document.createElement('button');
            skipButton.type = 'button';
            skipButton.className = 'btn btn-outline form-skip-btn';
            skipButton.textContent = 'דלג';
            skipButton.addEventListener('click', () => {
                this.triggerFormEvent(formId, 'skip');
            });
            actions.appendChild(skipButton);
        }

        return actions;
    }

    /**
     * Setup form event listeners
     */
    setupFormEventListeners(formId) {
        const form = this.forms.get(formId);
        if (!form) return;

        // Form submit
        form.element.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(formId);
        });

        // Field validation on change
        const fields = form.element.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.addEventListener('change', () => {
                this.validateField(formId, field.name);
            });
        });
    }

    /**
     * Handle form submission
     */
    handleFormSubmit(formId) {
        const form = this.forms.get(formId);
        if (!form) return;

        // Validate all fields
        const isValid = this.validateForm(formId);
        if (!isValid) {
            this.triggerFormEvent(formId, 'validation-error');
            return;
        }

        // Collect form data
        const formData = this.collectFormData(formId);
        form.data = formData;

        // Trigger submit event
        this.triggerFormEvent(formId, 'submit', formData);
    }

    /**
     * Validate entire form
     */
    validateForm(formId) {
        const form = this.forms.get(formId);
        if (!form) return false;

        let isValid = true;
        const fields = form.element.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            const fieldValid = this.validateField(formId, field.name);
            if (!fieldValid) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Validate individual field
     */
    validateField(formId, fieldName) {
        const form = this.forms.get(formId);
        if (!form) return false;

        const field = form.element.querySelector(`[name="${fieldName}"]`);
        if (!field) return true;

        const fieldConfig = form.config.fields.find(f => f.id === fieldName);
        if (!fieldConfig) return true;

        const value = this.getFieldValue(field);
        const validation = fieldConfig.validation || {};

        // Run validation rules
        for (const [rule, ruleValue] of Object.entries(validation)) {
            const validator = this.validators.get(rule);
            if (validator && !validator(value, ruleValue)) {
                this.showFieldError(formId, fieldName, this.getErrorMessage(rule, ruleValue));
                return false;
            }
        }

        // Clear error if validation passes
        this.clearFieldError(formId, fieldName);
        return true;
    }

    /**
     * Get field value
     */
    getFieldValue(field) {
        if (field.type === 'checkbox') {
            return Array.from(document.querySelectorAll(`[name="${field.name}"]:checked`))
                .map(cb => cb.value);
        } else if (field.type === 'radio') {
            const checked = document.querySelector(`[name="${field.name}"]:checked`);
            return checked ? checked.value : null;
        } else {
            return field.value;
        }
    }

    /**
     * Get error message for validation rule
     */
    getErrorMessage(rule, ruleValue) {
        const messages = {
            required: 'שדה זה נדרש',
            min: `ערך מינימלי: ${ruleValue}`,
            max: `ערך מקסימלי: ${ruleValue}`,
            email: 'כתובת אימייל לא תקינה',
            url: 'כתובת URL לא תקינה',
            time: 'זמן לא תקין'
        };
        return messages[rule] || 'ערך לא תקין';
    }

    /**
     * Show field error
     */
    showFieldError(formId, fieldName, message) {
        const form = this.forms.get(formId);
        if (!form) return;

        const fieldContainer = form.element.querySelector(`[data-field-id="${fieldName}"]`);
        if (!fieldContainer) return;

        const errorContainer = fieldContainer.querySelector('.form-field-error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }

        const field = fieldContainer.querySelector('input, select, textarea');
        if (field) {
            field.classList.add('error');
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(formId, fieldName) {
        const form = this.forms.get(formId);
        if (!form) return;

        const fieldContainer = form.element.querySelector(`[data-field-id="${fieldName}"]`);
        if (!fieldContainer) return;

        const errorContainer = fieldContainer.querySelector('.form-field-error');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }

        const field = fieldContainer.querySelector('input, select, textarea');
        if (field) {
            field.classList.remove('error');
        }
    }

    /**
     * Collect form data
     */
    collectFormData(formId) {
        const form = this.forms.get(formId);
        if (!form) return {};

        const formData = new FormData(form.element);
        const data = {};

        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    /**
     * Trigger form events
     */
    triggerFormEvent(formId, eventType, data = null) {
        const event = new CustomEvent('formEvent', {
            detail: {
                formId,
                eventType,
                data
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get form data
     */
    getFormData(formId) {
        const form = this.forms.get(formId);
        return form ? form.data : null;
    }

    /**
     * Set form data
     */
    setFormData(formId, data) {
        const form = this.forms.get(formId);
        if (!form) return;

        Object.entries(data).forEach(([key, value]) => {
            const field = form.element.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    const checkboxes = form.element.querySelectorAll(`[name="${key}"]`);
                    checkboxes.forEach(cb => {
                        cb.checked = Array.isArray(value) ? value.includes(cb.value) : value === cb.value;
                    });
                } else if (field.type === 'radio') {
                    const radio = form.element.querySelector(`[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    field.value = value;
                }
            }
        });

        form.data = data;
    }

    /**
     * Clear form
     */
    clearForm(formId) {
        const form = this.forms.get(formId);
        if (!form) return;

        form.element.reset();
        form.data = {};

        // Clear all errors
        const errorContainers = form.element.querySelectorAll('.form-field-error');
        errorContainers.forEach(container => {
            container.style.display = 'none';
        });

        const errorFields = form.element.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
    }
}

// Export singleton instance
export const formGenerator = new DynamicFormGenerator();
export default formGenerator;
