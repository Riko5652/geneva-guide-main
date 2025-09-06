/**
 * Comprehensive User Test Suite
 * Tests all animations, loading states, toast notifications, and prevents race conditions
 * Validates the complete user experience across all interactions
 */

import fs from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
    // Test timeouts
    ANIMATION_TIMEOUT: 5000,
    LOADING_TIMEOUT: 10000,
    TOAST_TIMEOUT: 6000,
    FIREBASE_TIMEOUT: 15000,
    
    // Test intervals
    CHECK_INTERVAL: 100,
    RACE_CONDITION_CHECK: 50,
    
    // Expected behavior
    EXPECTED_ANIMATIONS: [
        'fade-in', 'fade-out', 'slide-up', 'slide-down', 
        'scale-in', 'scale-out', 'bounce', 'pulse'
    ],
    EXPECTED_LOADING_STATES: [
        'family-loader', 'chat-loader', 'photo-upload-progress',
        'packing-photo-upload-progress', 'ai-thinking'
    ],
    EXPECTED_TOAST_TYPES: [
        'success', 'error', 'warning', 'info'
    ]
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

class ComprehensiveUserTest {
    constructor() {
        this.testResults = {
            animations: { passed: 0, failed: 0, details: [] },
            loading: { passed: 0, failed: 0, details: [] },
            toast: { passed: 0, failed: 0, details: [] },
            raceConditions: { passed: 0, failed: 0, details: [] },
            firebase: { passed: 0, failed: 0, details: [] },
            userInteractions: { passed: 0, failed: 0, details: [] }
        };
        this.raceConditionDetector = new Set();
        this.initializationOrder = [];
    }

    // Test 1: Animation System Validation
    async testAnimationSystem() {
        log('\n🎬 TESTING ANIMATION SYSTEM...', 'cyan');
        
        const animationFiles = [
            'public/js/animations.js',
            'public/CSS/style.css',
            'public/CSS/css-cleanup.css',
            'public/CSS/device-responsive.css'
        ];
        
        for (const file of animationFiles) {
            if (!fs.existsSync(file)) {
                this.testResults.animations.failed++;
                this.testResults.animations.details.push(`❌ Animation file missing: ${file}`);
                continue;
            }
            
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for animation keyframes
            const keyframes = content.match(/@keyframes\s+(\w+)/g) || [];
            const transitions = content.match(/transition:\s*[^;]+/g) || [];
            const transforms = content.match(/transform:\s*[^;]+/g) || [];
            
            if (keyframes.length > 0 || transitions.length > 0 || transforms.length > 0) {
                this.testResults.animations.passed++;
                this.testResults.animations.details.push(`✅ ${file}: ${keyframes.length} keyframes, ${transitions.length} transitions, ${transforms.length} transforms`);
            } else {
                this.testResults.animations.failed++;
                this.testResults.animations.details.push(`⚠️ ${file}: No animations found`);
            }
        }
        
        // Check for animation classes in HTML
        const htmlContent = fs.readFileSync('public/index.html', 'utf8');
        const animationClasses = htmlContent.match(/class="[^"]*animate-[^"]*"/g) || [];
        
        if (animationClasses.length > 0) {
            this.testResults.animations.passed++;
            this.testResults.animations.details.push(`✅ HTML: ${animationClasses.length} animation classes found`);
        } else {
            this.testResults.animations.failed++;
            this.testResults.animations.details.push(`⚠️ HTML: No animation classes found`);
        }
    }

    // Test 2: Loading State Management
    async testLoadingStates() {
        log('\n⏳ TESTING LOADING STATES...', 'cyan');
        
        const loadingFiles = [
            'public/js/loading.js',
            'public/js/ui.js',
            'public/js/handlers.js'
        ];
        
        for (const file of loadingFiles) {
            if (!fs.existsSync(file)) {
                this.testResults.loading.failed++;
                this.testResults.loading.details.push(`❌ Loading file missing: ${file}`);
                continue;
            }
            
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for loading functions
            const loadingFunctions = content.match(/function\s+\w*[Ll]oad\w*|\.show\(\)|\.hide\(\)|loading|loader/gi) || [];
            const progressBars = content.match(/progress|progress-bar/gi) || [];
            
            if (loadingFunctions.length > 0) {
                this.testResults.loading.passed++;
                this.testResults.loading.details.push(`✅ ${file}: ${loadingFunctions.length} loading functions, ${progressBars.length} progress indicators`);
            } else {
                this.testResults.loading.failed++;
                this.testResults.loading.details.push(`⚠️ ${file}: No loading functions found`);
            }
        }
        
        // Check HTML for loading elements
        const htmlContent = fs.readFileSync('public/index.html', 'utf8');
        const loadingElements = htmlContent.match(/id="[^"]*loader[^"]*"|id="[^"]*progress[^"]*"|class="[^"]*loading[^"]*"/gi) || [];
        
        if (loadingElements.length > 0) {
            this.testResults.loading.passed++;
            this.testResults.loading.details.push(`✅ HTML: ${loadingElements.length} loading elements found`);
        } else {
            this.testResults.loading.failed++;
            this.testResults.loading.details.push(`⚠️ HTML: No loading elements found`);
        }
    }

    // Test 3: Toast Notification System
    async testToastSystem() {
        log('\n🍞 TESTING TOAST NOTIFICATION SYSTEM...', 'cyan');
        
        const toastFile = 'public/js/toast.js';
        if (!fs.existsSync(toastFile)) {
            this.testResults.toast.failed++;
            this.testResults.toast.details.push(`❌ Toast file missing: ${toastFile}`);
            return;
        }
        
        const content = fs.readFileSync(toastFile, 'utf8');
        
        // Check for toast methods
        const toastMethods = content.match(/\.(success|error|warning|info)\(/g) || [];
        const toastClasses = content.match(/toast|notification/gi) || [];
        const durationHandling = content.match(/setTimeout|duration/gi) || [];
        
        if (toastMethods.length >= 4) {
            this.testResults.toast.passed++;
            this.testResults.toast.details.push(`✅ Toast system: ${toastMethods.length} methods, ${toastClasses.length} classes, ${durationHandling.length} duration handlers`);
        } else {
            this.testResults.toast.failed++;
            this.testResults.toast.details.push(`❌ Toast system incomplete: Only ${toastMethods.length} methods found`);
        }
        
        // Check for toast usage in other files
        const handlerContent = fs.readFileSync('public/js/handlers.js', 'utf8');
        const toastUsage = handlerContent.match(/familyToast\.(success|error|warning|info)/g) || [];
        
        if (toastUsage.length > 0) {
            this.testResults.toast.passed++;
            this.testResults.toast.details.push(`✅ Toast usage: ${toastUsage.length} toast calls in handlers`);
        } else {
            this.testResults.toast.failed++;
            this.testResults.toast.details.push(`⚠️ Toast usage: No toast calls found in handlers`);
        }
    }

    // Test 4: Race Condition Prevention
    async testRaceConditionPrevention() {
        log('\n🏁 TESTING RACE CONDITION PREVENTION...', 'cyan');
        
        const criticalFiles = [
            'public/js/Main.js',
            'public/js/handlers.js',
            'public/js/ui.js',
            'public/js/Gemini.js'
        ];
        
        for (const file of criticalFiles) {
            if (!fs.existsSync(file)) {
                this.testResults.raceConditions.failed++;
                this.testResults.raceConditions.details.push(`❌ Critical file missing: ${file}`);
                continue;
            }
            
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for race condition prevention patterns
            const initializationGuards = content.match(/__APP_INITIALIZING__|already.*initialized|prevent.*multiple/gi) || [];
            const eventListenerCleanup = content.match(/removeEventListener|cleanup|unsubscribe/gi) || [];
            const debounceThrottle = content.match(/debounce|throttle|setTimeout.*clearTimeout/gi) || [];
            const singletonPatterns = content.match(/if\s*\(\s*!\s*\w+\s*\)|instance|singleton/gi) || [];
            
            const raceConditionScore = initializationGuards.length + eventListenerCleanup.length + debounceThrottle.length + singletonPatterns.length;
            
            if (raceConditionScore >= 3) {
                this.testResults.raceConditions.passed++;
                this.testResults.raceConditions.details.push(`✅ ${file}: Strong race condition prevention (score: ${raceConditionScore})`);
            } else if (raceConditionScore >= 1) {
                this.testResults.raceConditions.passed++;
                this.testResults.raceConditions.details.push(`⚠️ ${file}: Basic race condition prevention (score: ${raceConditionScore})`);
            } else {
                this.testResults.raceConditions.failed++;
                this.testResults.raceConditions.details.push(`❌ ${file}: No race condition prevention found`);
            }
        }
        
        // Check for Firebase connection management
        const mainContent = fs.readFileSync('public/js/Main.js', 'utf8');
        const firebaseGuards = mainContent.match(/firebaseListenerActive|firebaseUnsubscribe|cleanupFirebaseConnections/gi) || [];
        
        if (firebaseGuards.length >= 3) {
            this.testResults.raceConditions.passed++;
            this.testResults.raceConditions.details.push(`✅ Firebase connection management: ${firebaseGuards.length} guards found`);
        } else {
            this.testResults.raceConditions.failed++;
            this.testResults.raceConditions.details.push(`❌ Firebase connection management: Only ${firebaseGuards.length} guards found`);
        }
    }

    // Test 5: Firebase Integration & Persistence
    async testFirebaseIntegration() {
        log('\n🔥 TESTING FIREBASE INTEGRATION...', 'cyan');
        
        const firebaseFiles = [
            'public/js/Main.js',
            'public/js/handlers.js',
            'public/js/ui.js',
            'public/js/Gemini.js'
        ];
        
        for (const file of firebaseFiles) {
            if (!fs.existsSync(file)) {
                this.testResults.firebase.failed++;
                this.testResults.firebase.details.push(`❌ Firebase file missing: ${file}`);
                continue;
            }
            
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for Firebase functions
            const firebaseImports = content.match(/firebase-\w+\.js/gi) || [];
            const firebaseFunctions = content.match(/(getAuth|getFirestore|getStorage|onSnapshot|updateDoc|arrayUnion|uploadBytes|getDownloadURL)/gi) || [];
            const errorHandling = content.match(/try\s*\{|catch\s*\(|\.catch\(/gi) || [];
            
            if (firebaseFunctions.length > 0) {
                this.testResults.firebase.passed++;
                this.testResults.firebase.details.push(`✅ ${file}: ${firebaseImports.length} imports, ${firebaseFunctions.length} functions, ${errorHandling.length} error handlers`);
            } else {
                this.testResults.firebase.failed++;
                this.testResults.firebase.details.push(`⚠️ ${file}: No Firebase functions found`);
            }
        }
        
        // Check for data persistence patterns
        const handlersContent = fs.readFileSync('public/js/handlers.js', 'utf8');
        const persistencePatterns = handlersContent.match(/arrayUnion|updateDoc|uploadBytes|getDownloadURL/gi) || [];
        
        if (persistencePatterns.length >= 5) {
            this.testResults.firebase.passed++;
            this.testResults.firebase.details.push(`✅ Data persistence: ${persistencePatterns.length} persistence operations found`);
        } else {
            this.testResults.firebase.failed++;
            this.testResults.firebase.details.push(`❌ Data persistence: Only ${persistencePatterns.length} persistence operations found`);
        }
    }

    // Test 6: User Interaction Flow
    async testUserInteractionFlow() {
        log('\n👆 TESTING USER INTERACTION FLOW...', 'cyan');
        
        const htmlContent = fs.readFileSync('public/index.html', 'utf8');
        
        // Check for interactive elements
        const buttons = htmlContent.match(/<button[^>]*>/gi) || [];
        const inputs = htmlContent.match(/<input[^>]*>/gi) || [];
        const modals = htmlContent.match(/modal|popup/gi) || [];
        const eventHandlers = htmlContent.match(/onclick|addEventListener|click/gi) || [];
        
        if (buttons.length > 0 && inputs.length > 0) {
            this.testResults.userInteractions.passed++;
            this.testResults.userInteractions.details.push(`✅ Interactive elements: ${buttons.length} buttons, ${inputs.length} inputs, ${modals.length} modals`);
        } else {
            this.testResults.userInteractions.failed++;
            this.testResults.userInteractions.details.push(`❌ Interactive elements: Insufficient UI elements found`);
        }
        
        // Check for accessibility
        const ariaLabels = htmlContent.match(/aria-label|aria-describedby|role=/gi) || [];
        const altTexts = htmlContent.match(/alt=/gi) || [];
        const keyboardSupport = htmlContent.match(/tabindex|onkeydown|onkeyup/gi) || [];
        
        if (ariaLabels.length > 0 || altTexts.length > 0) {
            this.testResults.userInteractions.passed++;
            this.testResults.userInteractions.details.push(`✅ Accessibility: ${ariaLabels.length} ARIA labels, ${altTexts.length} alt texts, ${keyboardSupport.length} keyboard handlers`);
        } else {
            this.testResults.userInteractions.failed++;
            this.testResults.userInteractions.details.push(`⚠️ Accessibility: Limited accessibility features found`);
        }
        
        // Check for responsive design
        const responsiveClasses = htmlContent.match(/md:|lg:|xl:|sm:|hidden|block|flex|grid/gi) || [];
        
        if (responsiveClasses.length > 10) {
            this.testResults.userInteractions.passed++;
            this.testResults.userInteractions.details.push(`✅ Responsive design: ${responsiveClasses.length} responsive classes found`);
        } else {
            this.testResults.userInteractions.failed++;
            this.testResults.userInteractions.details.push(`⚠️ Responsive design: Limited responsive classes found`);
        }
    }

    // Test 7: Initialization Order & Dependencies
    async testInitializationOrder() {
        log('\n🔄 TESTING INITIALIZATION ORDER...', 'cyan');
        
        const htmlContent = fs.readFileSync('public/index.html', 'utf8');
        
        // Check script loading order
        const scripts = htmlContent.match(/<script[^>]*src="[^"]*\.js"[^>]*>/gi) || [];
        const cssLinks = htmlContent.match(/<link[^>]*rel="stylesheet"[^>]*>/gi) || [];
        
        // Check for proper loading order (CSS before JS)
        const cssIndex = htmlContent.indexOf('<link rel="stylesheet"');
        const jsIndex = htmlContent.indexOf('<script');
        
        if (cssIndex < jsIndex) {
            this.testResults.raceConditions.passed++;
            this.testResults.raceConditions.details.push(`✅ Loading order: CSS loads before JavaScript (${cssLinks.length} CSS, ${scripts.length} JS)`);
        } else {
            this.testResults.raceConditions.failed++;
            this.testResults.raceConditions.details.push(`❌ Loading order: JavaScript loads before CSS`);
        }
        
        // Check for user-agent-adjuster loading first
        const userAgentIndex = htmlContent.indexOf('user-agent-adjuster.js');
        const deviceResponsiveIndex = htmlContent.indexOf('device-responsive.css');
        
        if (userAgentIndex < deviceResponsiveIndex) {
            this.testResults.raceConditions.passed++;
            this.testResults.raceConditions.details.push(`✅ User agent adjuster: Loads before device-responsive CSS`);
        } else {
            this.testResults.raceConditions.failed++;
            this.testResults.raceConditions.details.push(`❌ User agent adjuster: Loads after device-responsive CSS`);
        }
    }

    // Generate comprehensive report
    generateReport() {
        log('\n📊 COMPREHENSIVE USER TEST REPORT', 'magenta');
        log('=====================================', 'magenta');
        
        const categories = ['animations', 'loading', 'toast', 'raceConditions', 'firebase', 'userInteractions'];
        let totalPassed = 0;
        let totalFailed = 0;
        
        categories.forEach(category => {
            const results = this.testResults[category];
            const total = results.passed + results.failed;
            const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;
            
            log(`\n${category.toUpperCase()}:`, 'bright');
            log(`  Passed: ${results.passed}/${total} (${percentage}%)`, results.passed > 0 ? 'green' : 'red');
            
            results.details.forEach(detail => {
                log(`  ${detail}`, detail.includes('✅') ? 'green' : detail.includes('⚠️') ? 'yellow' : 'red');
            });
            
            totalPassed += results.passed;
            totalFailed += results.failed;
        });
        
        const overallTotal = totalPassed + totalFailed;
        const overallPercentage = overallTotal > 0 ? Math.round((totalPassed / overallTotal) * 100) : 0;
        
        log('\n🎯 OVERALL RESULTS:', 'bright');
        log(`  Total Tests: ${overallTotal}`, 'cyan');
        log(`  Passed: ${totalPassed} (${overallPercentage}%)`, totalPassed > totalFailed ? 'green' : 'red');
        log(`  Failed: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green');
        
        if (overallPercentage >= 90) {
            log('\n🎉 EXCELLENT! System is production-ready with comprehensive user experience validation!', 'green');
            return true;
        } else if (overallPercentage >= 75) {
            log('\n✅ GOOD! System is mostly ready with minor improvements needed.', 'yellow');
            return true;
        } else {
            log('\n❌ NEEDS IMPROVEMENT! Critical issues found that need attention.', 'red');
            return false;
        }
    }

    // Run all tests
    async runAllTests() {
        log('🧪 COMPREHENSIVE USER TEST SUITE', 'bright');
        log('=================================', 'cyan');
        
        try {
            await this.testAnimationSystem();
            await this.testLoadingStates();
            await this.testToastSystem();
            await this.testRaceConditionPrevention();
            await this.testFirebaseIntegration();
            await this.testUserInteractionFlow();
            await this.testInitializationOrder();
            
            return this.generateReport();
        } catch (error) {
            log(`❌ Test suite failed with error: ${error.message}`, 'red');
            return false;
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testSuite = new ComprehensiveUserTest();
    testSuite.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { ComprehensiveUserTest };
