import fs from 'fs';

console.log('🎨 CREATING CONSOLIDATED CSS');
console.log('============================');
console.log('');

// Read the main style.css file
const styleContent = fs.readFileSync('./public/CSS/style.css', 'utf8');

// Read css-cleanup.css and extract only essential rules
const cleanupContent = fs.readFileSync('./public/CSS/css-cleanup.css', 'utf8');

// Read ui-perfection.css
const uiPerfectionContent = fs.readFileSync('./public/CSS/ui-perfection.css', 'utf8');

console.log('📊 Original file sizes:');
console.log(`style.css: ${(styleContent.length / 1024).toFixed(1)}KB`);
console.log(`css-cleanup.css: ${(cleanupContent.length / 1024).toFixed(1)}KB`);
console.log(`ui-perfection.css: ${(uiPerfectionContent.length / 1024).toFixed(1)}KB`);
console.log('');

// Extract essential rules from css-cleanup.css (only loading screen and critical fixes)
const essentialCleanupRules = `
/* ESSENTIAL CLEANUP RULES - Loading Screen and Critical Fixes */
#family-loader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    visibility: visible;
}

/* Critical z-index hierarchy */
.toast-container { z-index: 9998; }
#family-loader { z-index: 99999; }
.modal-back-btn { z-index: 10002; }

/* Essential modal backdrop */
.modal {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
`;

// Extract essential rules from ui-perfection.css (only unique enhancements)
const essentialUIRules = `
/* ESSENTIAL UI PERFECTION RULES - Unique Enhancements Only */

/* Enhanced button states */
.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Enhanced card interactions */
.card:hover, .activity-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Enhanced modal animations */
.modal {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal:not(.hidden) {
    opacity: 1;
    transform: scale(1);
}

/* Enhanced scrollable containers */
.scrollable-container {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
}

.scrollable-container::-webkit-scrollbar {
    width: 6px;
}

.scrollable-container::-webkit-scrollbar-track {
    background: #f7fafc;
    border-radius: 3px;
}

.scrollable-container::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
}

/* Enhanced loading states */
.btn-loading {
    position: relative;
    color: transparent;
}

.btn-loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Create consolidated CSS
const consolidatedCSS = styleContent + '\n\n' + essentialCleanupRules + '\n\n' + essentialUIRules;

// Write consolidated CSS
fs.writeFileSync('./public/CSS/style-consolidated.css', consolidatedCSS);

console.log('✅ Consolidated CSS created: style-consolidated.css');
console.log(`📊 New file size: ${(consolidatedCSS.length / 1024).toFixed(1)}KB`);

// Calculate reduction
const originalTotal = styleContent.length + cleanupContent.length + uiPerfectionContent.length;
const reduction = ((originalTotal - consolidatedCSS.length) / originalTotal * 100).toFixed(1);

console.log(`📈 Size reduction: ${reduction}%`);
console.log('');

console.log('🔄 Next steps:');
console.log('1. Replace style.css with style-consolidated.css');
console.log('2. Update HTML to remove css-cleanup.css and ui-perfection.css');
console.log('3. Test the application');
console.log('4. Delete old CSS files');
console.log('');

console.log('✅ This will eliminate CSS conflicts and improve performance');
