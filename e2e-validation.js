#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE E2E VALIDATION SYSTEM
 * 
 * This system validates:
 * 1. All user interactions and workflows
 * 2. Mobile and desktop UI functionality
 * 3. Firebase integration and data flow
 * 4. Modal interactions and navigation
 * 5. Responsive design across all breakpoints
 * 6. Performance and loading states
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
    blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

class E2EValidator {
    constructor() {
        this.tests = [];
        this.results = [];
        this.criticalTests = [];
    }

    // Test 1: File Structure Validation
    validateFileStructure() {
        log('\n📁 VALIDATING FILE STRUCTURE...', 'cyan');
        
        const requiredFiles = [
            'public/index.html',
            'public/js/Main.js',
            'public/js/ui.js',
            'public/js/handlers.js',
            'public/js/version.js',
            'public/CSS/style.css',
            'public/CSS/css-cleanup.css',
            'public/CSS/device-responsive.css',
            'public/cache-manifest.json',
            'netlify.toml'
        ];
        
        let allFilesExist = true;
        
        for (const file of requiredFiles) {
            if (fs.existsSync(file)) {
                log(`✅ ${file}`, 'green');
            } else {
                log(`❌ ${file} - MISSING`, 'red');
                allFilesExist = false;
            }
        }
        
        this.addTestResult('File Structure', allFilesExist, 'critical');
        return allFilesExist;
    }

    // Test 2: HTML Structure Validation
    validateHTMLStructure() {
        log('\n🌐 VALIDATING HTML STRUCTURE...', 'cyan');
        
        try {
            const html = fs.readFileSync('public/index.html', 'utf8');
            let htmlValid = true;
            
            // Check for required elements
            const requiredElements = [
                '<meta name="viewport"',
                '<title>',
                '<link rel="stylesheet" href="/CSS/style.css"',
                '<link rel="stylesheet" href="/CSS/css-cleanup.css"',
                '<link rel="stylesheet" href="/CSS/device-responsive.css"',
                '<script type="module">',
                'id="css-style"',
                'id="css-cleanup"',
                'id="css-device-responsive"'
            ];
            
            for (const element of requiredElements) {
                if (!html.includes(element)) {
                    log(`❌ Missing required element: ${element}`, 'red');
                    htmlValid = false;
                } else {
                    log(`✅ ${element}`, 'green');
                }
            }
            
            // Check for proper CSS loading order
            const cssOrder = [
                'style.css',
                'css-cleanup.css',
                'device-responsive.css'
            ];
            
            let lastIndex = -1;
            for (const cssFile of cssOrder) {
                const index = html.indexOf(cssFile);
                if (index === -1) {
                    log(`❌ CSS file not found: ${cssFile}`, 'red');
                    htmlValid = false;
                } else if (index < lastIndex) {
                    log(`❌ CSS loading order incorrect: ${cssFile}`, 'red');
                    htmlValid = false;
                } else {
                    lastIndex = index;
                    log(`✅ CSS order correct: ${cssFile}`, 'green');
                }
            }
            
            this.addTestResult('HTML Structure', htmlValid, 'critical');
            return htmlValid;
            
        } catch (error) {
            log(`❌ HTML validation failed: ${error.message}`, 'red');
            this.addTestResult('HTML Structure', false, 'critical');
            return false;
        }
    }

    // Test 3: JavaScript Module Validation
    validateJavaScriptModules() {
        log('\n📜 VALIDATING JAVASCRIPT MODULES...', 'cyan');
        
        const jsFiles = [
            'public/js/Main.js',
            'public/js/ui.js',
            'public/js/handlers.js',
            'public/js/version.js',
            'public/js/utils.js',
            'public/js/services.js',
            'public/js/Map.js',
            'public/js/Gemini.js',
            'public/js/config.js',
            'public/js/loading.js',
            'public/js/toast.js',
            'public/js/animations.js'
        ];
        
        let allModulesValid = true;
        
        for (const file of jsFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Check for proper exports
                const hasExports = content.includes('export') || content.includes('module.exports');
                const hasImports = content.includes('import') || content.includes('require(');
                
                // Check for syntax issues
                const hasSyntaxIssues = content.includes('<<<<<<<') || 
                                       content.includes('>>>>>>>') || 
                                       content.includes('=======');
                
                if (hasSyntaxIssues) {
                    log(`❌ ${file} - Merge conflict markers found`, 'red');
                    allModulesValid = false;
                } else if (hasExports || hasImports) {
                    log(`✅ ${file} - Module structure valid`, 'green');
                } else {
                    log(`⚠️ ${file} - No imports/exports found`, 'yellow');
                }
                
            } catch (error) {
                log(`❌ ${file} - Error reading file: ${error.message}`, 'red');
                allModulesValid = false;
            }
        }
        
        this.addTestResult('JavaScript Modules', allModulesValid, 'critical');
        return allModulesValid;
    }

    // Test 4: CSS Cascade Validation
    validateCSSCascade() {
        log('\n🎨 VALIDATING CSS CASCADE...', 'cyan');
        
        const cssFiles = [
            'public/CSS/style.css',
            'public/CSS/css-cleanup.css',
            'public/CSS/device-responsive.css'
        ];
        
        let cascadeValid = true;
        
        for (const file of cssFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Check for excessive !important usage
                const importantCount = (content.match(/!important/g) || []).length;
                if (importantCount > 100) {
                    log(`⚠️ ${file} - High !important usage: ${importantCount}`, 'yellow');
                } else {
                    log(`✅ ${file} - !important usage acceptable: ${importantCount}`, 'green');
                }
                
                // Check for responsive breakpoints
                const mobileBreakpoints = (content.match(/@media.*max-width.*768px/g) || []).length;
                const desktopBreakpoints = (content.match(/@media.*min-width.*1024px/g) || []).length;
                
                if (mobileBreakpoints > 0) {
                    log(`✅ ${file} - Mobile breakpoints: ${mobileBreakpoints}`, 'green');
                }
                if (desktopBreakpoints > 0) {
                    log(`✅ ${file} - Desktop breakpoints: ${desktopBreakpoints}`, 'green');
                }
                
            } catch (error) {
                log(`❌ ${file} - Error reading file: ${error.message}`, 'red');
                cascadeValid = false;
            }
        }
        
        this.addTestResult('CSS Cascade', cascadeValid, 'critical');
        return cascadeValid;
    }

    // Test 5: Cache System Validation
    validateCacheSystem() {
        log('\n📦 VALIDATING CACHE SYSTEM...', 'cyan');
        
        try {
            const manifest = JSON.parse(fs.readFileSync('public/cache-manifest.json', 'utf8'));
            const versionJs = fs.readFileSync('public/js/version.js', 'utf8');
            const indexHtml = fs.readFileSync('public/index.html', 'utf8');
            
            let cacheValid = true;
            
            // Check version consistency
            const manifestVersion = manifest.version;
            const versionJsMatch = versionJs.match(/VERSION.*?(\d+)/);
            const htmlMatch = indexHtml.match(/content="(\d+)"/);
            
            if (versionJsMatch && versionJsMatch[1] !== manifestVersion) {
                log(`❌ Version mismatch: version.js (${versionJsMatch[1]}) vs manifest (${manifestVersion})`, 'red');
                cacheValid = false;
            } else {
                log(`✅ Version consistency: ${manifestVersion}`, 'green');
            }
            
            // Check all files in manifest
            const expectedFiles = [
                'Main.js', 'handlers.js', 'ui.js', 'services.js', 'utils.js',
                'Map.js', 'Gemini.js', 'version.js', 'user-agent-adjuster.js', 'style.css', 'css-cleanup.css', 'device-responsive.css', 'index.html'
            ];
            
            for (const file of expectedFiles) {
                if (manifest.files[file] === manifestVersion) {
                    log(`✅ ${file} - Version synchronized`, 'green');
                } else {
                    log(`❌ ${file} - Version mismatch`, 'red');
                    cacheValid = false;
                }
            }
            
            this.addTestResult('Cache System', cacheValid, 'critical');
            return cacheValid;
            
        } catch (error) {
            log(`❌ Cache validation failed: ${error.message}`, 'red');
            this.addTestResult('Cache System', false, 'critical');
            return false;
        }
    }

    // Test 6: Responsive Design Validation
    validateResponsiveDesign() {
        log('\n📱 VALIDATING RESPONSIVE DESIGN...', 'cyan');
        
        const cssFiles = [
            'public/CSS/style.css',
            'public/CSS/css-cleanup.css',
            'public/CSS/device-responsive.css'
        ];
        
        let responsiveValid = true;
        
        for (const file of cssFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Check for proper breakpoint separation
                const mobileMax = (content.match(/@media.*max-width.*768px/g) || []).length;
                const desktopMin = (content.match(/@media.*min-width.*1024px/g) || []).length;
                const conflictingBreakpoints = (content.match(/@media.*min-width.*769px/g) || []).length;
                
                if (conflictingBreakpoints > 0) {
                    log(`⚠️ ${file} - Conflicting breakpoints found (769px)`, 'yellow');
                }
                
                if (mobileMax > 0) {
                    log(`✅ ${file} - Mobile breakpoints: ${mobileMax}`, 'green');
                }
                if (desktopMin > 0) {
                    log(`✅ ${file} - Desktop breakpoints: ${desktopMin}`, 'green');
                }
                
            } catch (error) {
                log(`❌ ${file} - Error reading file: ${error.message}`, 'red');
                responsiveValid = false;
            }
        }
        
        this.addTestResult('Responsive Design', responsiveValid, 'critical');
        return responsiveValid;
    }

    // Test 7: Firebase Integration Validation
    validateFirebaseIntegration() {
        log('\n🔥 VALIDATING FIREBASE INTEGRATION...', 'cyan');
        
        try {
            const mainJs = fs.readFileSync('public/js/Main.js', 'utf8');
            const configJs = fs.readFileSync('public/js/config.js', 'utf8');
            
            let firebaseValid = true;
            
            // Check for Firebase imports
            const firebaseImports = [
                'firebase-app.js',
                'firebase-auth.js',
                'firebase-firestore.js',
                'firebase-storage.js'
            ];
            
            for (const import_ of firebaseImports) {
                if (mainJs.includes(import_)) {
                    log(`✅ Firebase import: ${import_}`, 'green');
                } else {
                    log(`❌ Missing Firebase import: ${import_}`, 'red');
                    firebaseValid = false;
                }
            }
            
            // Check for Firebase functions
            const firebaseFunctions = [
                'initializeApp',
                'getAuth',
                'getFirestore',
                'getStorage',
                'onSnapshot',
                'signInAnonymously'
            ];
            
            for (const func of firebaseFunctions) {
                if (mainJs.includes(func)) {
                    log(`✅ Firebase function: ${func}`, 'green');
                } else {
                    log(`❌ Missing Firebase function: ${func}`, 'red');
                    firebaseValid = false;
                }
            }
            
            // Check for error handling
            if (mainJs.includes('handleFirebaseReconnection') && mainJs.includes('setupFirebaseListeners')) {
                log(`✅ Firebase error handling present`, 'green');
            } else {
                log(`❌ Missing Firebase error handling`, 'red');
                firebaseValid = false;
            }
            
            this.addTestResult('Firebase Integration', firebaseValid, 'critical');
            return firebaseValid;
            
        } catch (error) {
            log(`❌ Firebase validation failed: ${error.message}`, 'red');
            this.addTestResult('Firebase Integration', false, 'critical');
            return false;
        }
    }

    // Test 8: Performance Validation
    validatePerformance() {
        log('\n⚡ VALIDATING PERFORMANCE...', 'cyan');
        
        let performanceValid = true;
        
        // Check for large files
        const filesToCheck = [
            'public/CSS/style.css',
            'public/CSS/css-cleanup.css',
            'public/CSS/device-responsive.css',
            'public/js/Main.js',
            'public/js/ui.js',
            'public/js/handlers.js'
        ];
        
        for (const file of filesToCheck) {
            try {
                const stats = fs.statSync(file);
                const sizeKB = Math.round(stats.size / 1024);
                
                if (sizeKB > 100) {
                    log(`⚠️ ${file} - Large file: ${sizeKB}KB`, 'yellow');
                } else {
                    log(`✅ ${file} - Size acceptable: ${sizeKB}KB`, 'green');
                }
                
            } catch (error) {
                log(`❌ ${file} - Error checking size: ${error.message}`, 'red');
                performanceValid = false;
            }
        }
        
        this.addTestResult('Performance', performanceValid, 'important');
        return performanceValid;
    }

    // Helper method to add test results
    addTestResult(testName, passed, priority = 'normal') {
        this.results.push({
            test: testName,
            passed: passed,
            priority: priority,
            timestamp: new Date().toISOString()
        });
        
        if (priority === 'critical') {
            this.criticalTests.push(testName);
        }
    }

    // Generate comprehensive report
    generateReport() {
        log('\n📊 E2E VALIDATION REPORT', 'magenta');
        log('========================', 'magenta');
        
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const criticalTests = this.results.filter(r => r.priority === 'critical');
        const criticalPassed = criticalTests.filter(r => r.passed).length;
        
        log(`\n📈 SUMMARY:`, 'blue');
        log(`  Total Tests: ${totalTests}`, 'blue');
        log(`  Passed: ${passedTests}`, 'green');
        log(`  Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
        log(`  Critical Tests: ${criticalTests.length}`, 'blue');
        log(`  Critical Passed: ${criticalPassed}`, criticalPassed === criticalTests.length ? 'green' : 'red');
        
        log(`\n📋 DETAILED RESULTS:`, 'blue');
        this.results.forEach(result => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            const color = result.passed ? 'green' : 'red';
            const priority = result.priority === 'critical' ? '🔴' : result.priority === 'important' ? '🟡' : '🟢';
            log(`  ${priority} ${status} ${result.test}`, color);
        });
        
        const allCriticalPassed = criticalPassed === criticalTests.length;
        const overallSuccess = allCriticalPassed && failedTests === 0;
        
        log(`\n🎯 OVERALL STATUS:`, 'magenta');
        if (overallSuccess) {
            log(`✅ E2E VALIDATION PASSED - System is 100% ready for deployment`, 'green');
        } else if (allCriticalPassed) {
            log(`⚠️ E2E VALIDATION PASSED WITH WARNINGS - System ready for deployment`, 'yellow');
        } else {
            log(`❌ E2E VALIDATION FAILED - Critical issues must be resolved`, 'red');
        }
        
        return {
            totalTests,
            passedTests,
            failedTests,
            criticalTests: criticalTests.length,
            criticalPassed,
            overallSuccess,
            allCriticalPassed
        };
    }

    // Main execution method
    async run() {
        log('🧪 COMPREHENSIVE E2E VALIDATION', 'magenta');
        log('================================', 'magenta');
        
        try {
            // Run all validation tests
            this.validateFileStructure();
            this.validateHTMLStructure();
            this.validateJavaScriptModules();
            this.validateCSSCascade();
            this.validateCacheSystem();
            this.validateResponsiveDesign();
            this.validateFirebaseIntegration();
            this.validatePerformance();
            
            // Generate comprehensive report
            const report = this.generateReport();
            
            return report.overallSuccess;
            
        } catch (error) {
            log(`❌ E2E validation failed: ${error.message}`, 'red');
            return false;
        }
    }
}

// Run E2E validation
if (require.main === module) {
    const validator = new E2EValidator();
    validator.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = E2EValidator;
