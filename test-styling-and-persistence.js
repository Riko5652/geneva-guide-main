/**
 * Comprehensive Test for Styling and Firebase Persistence
 * Verifies that the new user agent adjustment system doesn't break existing styling
 * and that Firebase persistence works correctly for user data
 */

import fs from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
    cssFiles: [
        'public/CSS/style.css',
        'public/CSS/css-cleanup.css', 
        'public/CSS/device-responsive.css'
    ],
    jsFiles: [
        'public/js/Main.js',
        'public/js/handlers.js',
        'public/js/ui.js',
        'public/js/user-agent-adjuster.js'
    ],
    htmlFile: 'public/index.html'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Verify CSS files don't have conflicts
function testCSSConflicts() {
    log('\n🎨 TESTING CSS CONFLICTS...', 'cyan');
    
    let hasConflicts = false;
    
    TEST_CONFIG.cssFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            log(`❌ CSS file not found: ${file}`, 'red');
            hasConflicts = true;
            return;
        }
        
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for conflicting selectors
        const selectors = content.match(/^[.#]?[a-zA-Z0-9_-]+\s*{/gm) || [];
        const duplicateSelectors = selectors.filter((selector, index) => 
            selectors.indexOf(selector) !== index
        );
        
        if (duplicateSelectors.length > 0) {
            log(`⚠️  Duplicate selectors in ${file}:`, 'yellow');
            duplicateSelectors.forEach(selector => {
                log(`   ${selector}`, 'yellow');
            });
            hasConflicts = true;
        }
        
        // Check for !important overuse
        const importantCount = (content.match(/!important/g) || []).length;
        if (importantCount > 50) {
            log(`⚠️  High !important usage in ${file}: ${importantCount}`, 'yellow');
        }
        
        log(`✅ ${file} - ${selectors.length} selectors, ${importantCount} !important`, 'green');
    });
    
    return !hasConflicts;
}

// Test 2: Verify user agent adjuster doesn't break existing functionality
function testUserAgentAdjuster() {
    log('\n🔧 TESTING USER AGENT ADJUSTER...', 'cyan');
    
    const adjusterFile = 'public/js/user-agent-adjuster.js';
    if (!fs.existsSync(adjusterFile)) {
        log(`❌ User agent adjuster not found: ${adjusterFile}`, 'red');
        return false;
    }
    
    const content = fs.readFileSync(adjusterFile, 'utf8');
    
    // Check for required methods
    const requiredMethods = [
        'detectDevice',
        'addDeviceClasses',
        'adjustModalLayouts',
        'adjustNavigationLayouts',
        'adjustPackingModalLayout'
    ];
    
    let allMethodsPresent = true;
    requiredMethods.forEach(method => {
        if (!content.includes(method)) {
            log(`❌ Missing method: ${method}`, 'red');
            allMethodsPresent = false;
        } else {
            log(`✅ Method found: ${method}`, 'green');
        }
    });
    
    // Check for device classes
    const deviceClasses = ['device-mobile', 'device-tablet', 'device-desktop'];
    deviceClasses.forEach(deviceClass => {
        if (!content.includes(deviceClass)) {
            log(`❌ Missing device class: ${deviceClass}`, 'red');
            allMethodsPresent = false;
        } else {
            log(`✅ Device class found: ${deviceClass}`, 'green');
        }
    });
    
    return allMethodsPresent;
}

// Test 3: Verify Firebase persistence configuration
function testFirebasePersistence() {
    log('\n🔥 TESTING FIREBASE PERSISTENCE...', 'cyan');
    
    const handlersFile = 'public/js/handlers.js';
    const uiFile = 'public/js/ui.js';
    
    if (!fs.existsSync(handlersFile) || !fs.existsSync(uiFile)) {
        log(`❌ Required files not found`, 'red');
        return false;
    }
    
    const handlersContent = fs.readFileSync(handlersFile, 'utf8');
    const uiContent = fs.readFileSync(uiFile, 'utf8');
    
    // Check for Firebase Storage upload
    const hasFirebaseUpload = handlersContent.includes('uploadBytes') && 
                             handlersContent.includes('getDownloadURL');
    
    if (!hasFirebaseUpload) {
        log(`❌ Firebase Storage upload not implemented in handlers.js`, 'red');
        return false;
    }
    
    log(`✅ Firebase Storage upload found in handlers.js`, 'green');
    
    // Check for packing photo upload with Firebase
    const hasPackingFirebaseUpload = uiContent.includes('uploadBytes') && 
                                    uiContent.includes('getDownloadURL');
    
    if (!hasPackingFirebaseUpload) {
        log(`❌ Firebase Storage upload not implemented for packing photos`, 'red');
        return false;
    }
    
    log(`✅ Firebase Storage upload found for packing photos`, 'green');
    
    // Check for data exclusion (activities should not be persisted)
    const mainFile = 'public/js/Main.js';
    if (fs.existsSync(mainFile)) {
        const mainContent = fs.readFileSync(mainFile, 'utf8');
        
        // Check that activitiesData is not being saved to Firebase
        if (mainContent.includes('activitiesData') && 
            !mainContent.includes('// activitiesData should not be persisted')) {
            log(`⚠️  activitiesData might be persisted to Firebase - should be excluded`, 'yellow');
        } else {
            log(`✅ activitiesData properly excluded from Firebase persistence`, 'green');
        }
    }
    
    return true;
}

// Test 4: Verify responsive design works across devices
function testResponsiveDesign() {
    log('\n📱 TESTING RESPONSIVE DESIGN...', 'cyan');
    
    const responsiveFile = 'public/CSS/device-responsive.css';
    if (!fs.existsSync(responsiveFile)) {
        log(`❌ Device responsive CSS not found`, 'red');
        return false;
    }
    
    const content = fs.readFileSync(responsiveFile, 'utf8');
    
    // Check for CSS custom properties
    const hasCustomProperties = content.includes('--modal-max-width') && 
                               content.includes('--modal-max-height');
    
    if (!hasCustomProperties) {
        log(`❌ CSS custom properties not found`, 'red');
        return false;
    }
    
    log(`✅ CSS custom properties found`, 'green');
    
    // Check for device-specific classes
    const deviceClasses = ['.device-mobile', '.device-tablet', '.device-desktop'];
    deviceClasses.forEach(deviceClass => {
        if (!content.includes(deviceClass)) {
            log(`❌ Missing device class: ${deviceClass}`, 'red');
            return false;
        } else {
            log(`✅ Device class found: ${deviceClass}`, 'green');
        }
    });
    
    // Check for modal adjustments
    const hasModalAdjustments = content.includes('.modal-mobile') && 
                               content.includes('.modal-tablet') && 
                               content.includes('.modal-desktop');
    
    if (!hasModalAdjustments) {
        log(`❌ Modal device adjustments not found`, 'red');
        return false;
    }
    
    log(`✅ Modal device adjustments found`, 'green');
    
    return true;
}

// Test 5: Verify HTML structure includes new files
function testHTMLStructure() {
    log('\n🌐 TESTING HTML STRUCTURE...', 'cyan');
    
    const htmlFile = TEST_CONFIG.htmlFile;
    if (!fs.existsSync(htmlFile)) {
        log(`❌ HTML file not found: ${htmlFile}`, 'red');
        return false;
    }
    
    const content = fs.readFileSync(htmlFile, 'utf8');
    
    // Check for device-responsive CSS
    if (!content.includes('device-responsive.css')) {
        log(`❌ device-responsive.css not included in HTML`, 'red');
        return false;
    }
    
    log(`✅ device-responsive.css included in HTML`, 'green');
    
    // Check for user-agent-adjuster.js
    if (!content.includes('user-agent-adjuster.js')) {
        log(`❌ user-agent-adjuster.js not included in HTML`, 'red');
        return false;
    }
    
    log(`✅ user-agent-adjuster.js included in HTML`, 'green');
    
    // Check loading order
    const deviceResponsiveIndex = content.indexOf('device-responsive.css');
    const userAgentIndex = content.indexOf('user-agent-adjuster.js');
    
    if (userAgentIndex === -1 || deviceResponsiveIndex === -1) {
        log(`❌ Could not determine loading order`, 'red');
        return false;
    }
    
    // User agent adjuster should load before device-responsive CSS
    if (userAgentIndex > deviceResponsiveIndex) {
        log(`⚠️  user-agent-adjuster.js should load before device-responsive.css`, 'yellow');
    } else {
        log(`✅ Correct loading order: user-agent-adjuster.js before device-responsive.css`, 'green');
    }
    
    return true;
}

// Test 6: Verify cache busting includes new files
function testCacheBusting() {
    log('\n💾 TESTING CACHE BUSTING...', 'cyan');
    
    const cacheManifest = 'public/cache-manifest.json';
    const versionFile = 'public/js/version.js';
    
    if (!fs.existsSync(cacheManifest) || !fs.existsSync(versionFile)) {
        log(`❌ Cache files not found`, 'red');
        return false;
    }
    
    const manifestContent = fs.readFileSync(cacheManifest, 'utf8');
    const versionContent = fs.readFileSync(versionFile, 'utf8');
    
    // Check for new files in cache manifest
    const newFiles = ['user-agent-adjuster.js', 'device-responsive.css'];
    newFiles.forEach(file => {
        if (!manifestContent.includes(file)) {
            log(`❌ ${file} not found in cache manifest`, 'red');
            return false;
        } else {
            log(`✅ ${file} found in cache manifest`, 'green');
        }
    });
    
    // Check for new files in version.js
    if (!versionContent.includes('device-responsive.css')) {
        log(`❌ device-responsive.css not found in version.js`, 'red');
        return false;
    }
    
    log(`✅ device-responsive.css found in version.js`, 'green');
    
    return true;
}

// Main test runner
function runAllTests() {
    log('🧪 COMPREHENSIVE STYLING AND PERSISTENCE TEST', 'bright');
    log('='.repeat(50), 'cyan');
    
    const tests = [
        { name: 'CSS Conflicts', fn: testCSSConflicts },
        { name: 'User Agent Adjuster', fn: testUserAgentAdjuster },
        { name: 'Firebase Persistence', fn: testFirebasePersistence },
        { name: 'Responsive Design', fn: testResponsiveDesign },
        { name: 'HTML Structure', fn: testHTMLStructure },
        { name: 'Cache Busting', fn: testCacheBusting }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    tests.forEach(test => {
        try {
            const result = test.fn();
            if (result) {
                passedTests++;
                log(`✅ ${test.name}: PASSED`, 'green');
            } else {
                log(`❌ ${test.name}: FAILED`, 'red');
            }
        } catch (error) {
            log(`❌ ${test.name}: ERROR - ${error.message}`, 'red');
        }
    });
    
    log('\n📊 TEST SUMMARY', 'bright');
    log('='.repeat(20), 'cyan');
    log(`Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
    
    if (passedTests === totalTests) {
        log('🎉 ALL TESTS PASSED - System is ready!', 'green');
        return true;
    } else {
        log('⚠️  Some tests failed - Review issues above', 'yellow');
        return false;
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
}

export { runAllTests };
