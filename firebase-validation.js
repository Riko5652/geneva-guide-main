#!/usr/bin/env node

/**
 * 🔥 FIREBASE VALIDATION SCRIPT
 * 
 * This script validates:
 * 1. Firebase configuration and environment variables
 * 2. Firebase imports and versions
 * 3. Firebase initialization process
 * 4. Firebase connection stability
 * 5. Firebase error handling
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

class FirebaseValidator {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.success = [];
    }

    // Validate Firebase configuration
    validateFirebaseConfig() {
        log('\n🔥 VALIDATING FIREBASE CONFIGURATION...', 'cyan');
        
        try {
            // Check config.js
            const configPath = 'public/js/config.js';
            if (!fs.existsSync(configPath)) {
                this.issues.push('config.js file missing');
                return false;
            }
            
            const configContent = fs.readFileSync(configPath, 'utf8');
            
            // Check for required config values
            const requiredConfigs = [
                'APP_ID',
                'APIS.GEMINI.ENDPOINT',
                'FEATURES.ENABLE_AI_FEATURES'
            ];
            
            requiredConfigs.forEach(config => {
                if (!configContent.includes(config.split('.')[0])) {
                    this.warnings.push(`Missing config: ${config}`);
                } else {
                    this.success.push(`✅ Config found: ${config}`);
                }
            });
            
            // Check for APP_ID value
            const appIdMatch = configContent.match(/APP_ID:\s*['"]([^'"]+)['"]/);
            if (appIdMatch) {
                const appId = appIdMatch[1];
                this.success.push(`✅ APP_ID configured: ${appId}`);
            } else {
                this.issues.push('APP_ID not properly configured');
            }
            
            return this.issues.length === 0;
            
        } catch (error) {
            this.issues.push(`Error reading config: ${error.message}`);
            return false;
        }
    }

    // Validate Firebase imports and versions
    validateFirebaseImports() {
        log('\n📦 VALIDATING FIREBASE IMPORTS...', 'cyan');
        
        const jsFiles = [
            'public/js/Main.js',
            'public/js/handlers.js'
        ];
        
        let allValid = true;
        
        jsFiles.forEach(file => {
            if (!fs.existsSync(file)) {
                this.issues.push(`${file} missing`);
                allValid = false;
                return;
            }
            
            const content = fs.readFileSync(file, 'utf8');
            
            // Check Firebase imports
            const firebaseImports = [
                'firebase-app.js',
                'firebase-auth.js',
                'firebase-firestore.js',
                'firebase-storage.js'
            ];
            
            firebaseImports.forEach(import_ => {
                if (content.includes(import_)) {
                    this.success.push(`✅ ${file}: ${import_} imported`);
                } else if (file === 'public/js/Main.js') {
                    this.issues.push(`${file}: Missing ${import_}`);
                    allValid = false;
                }
            });
            
            // Check Firebase version
            const versionMatch = content.match(/firebasejs\/([0-9.]+)/);
            if (versionMatch) {
                const version = versionMatch[1];
                this.success.push(`✅ ${file}: Firebase version ${version}`);
                
                // Check if version is current
                if (version !== '10.12.2') {
                    this.warnings.push(`${file}: Firebase version ${version} may not be latest`);
                }
            } else {
                this.issues.push(`${file}: Firebase version not found`);
                allValid = false;
            }
        });
        
        return allValid;
    }

    // Validate Firebase initialization process
    validateFirebaseInitialization() {
        log('\n🚀 VALIDATING FIREBASE INITIALIZATION...', 'cyan');
        
        try {
            const mainJsPath = 'public/js/Main.js';
            if (!fs.existsSync(mainJsPath)) {
                this.issues.push('Main.js missing');
                return false;
            }
            
            const content = fs.readFileSync(mainJsPath, 'utf8');
            
            // Check for required Firebase initialization functions
            const requiredFunctions = [
                'initializeApp',
                'getAuth',
                'getFirestore',
                'getStorage',
                'signInAnonymously',
                'onAuthStateChanged',
                'onSnapshot'
            ];
            
            requiredFunctions.forEach(func => {
                if (content.includes(func)) {
                    this.success.push(`✅ Firebase function: ${func}`);
                } else {
                    this.issues.push(`Missing Firebase function: ${func}`);
                }
            });
            
            // Check for Firebase config endpoint
            if (content.includes('/api/get-config')) {
                this.success.push('✅ Firebase config endpoint configured');
            } else {
                this.issues.push('Firebase config endpoint not found');
            }
            
            // Check for error handling
            const errorHandling = [
                'try',
                'catch',
                'error',
                'console.error'
            ];
            
            let errorHandlingCount = 0;
            errorHandling.forEach(handler => {
                if (content.includes(handler)) {
                    errorHandlingCount++;
                }
            });
            
            if (errorHandlingCount >= 3) {
                this.success.push('✅ Firebase error handling present');
            } else {
                this.warnings.push('Firebase error handling may be insufficient');
            }
            
            return this.issues.length === 0;
            
        } catch (error) {
            this.issues.push(`Error validating initialization: ${error.message}`);
            return false;
        }
    }

    // Validate Firebase connection management
    validateFirebaseConnectionManagement() {
        log('\n🔗 VALIDATING FIREBASE CONNECTION MANAGEMENT...', 'cyan');
        
        try {
            const mainJsPath = 'public/js/Main.js';
            const content = fs.readFileSync(mainJsPath, 'utf8');
            
            // Check for connection management features
            const connectionFeatures = [
                'firebaseListenerActive',
                'firebaseUnsubscribe',
                'firebaseRetryCount',
                'firebaseReconnecting',
                'cleanupFirebaseConnections',
                'handleFirebaseReconnection',
                'setupFirebaseListeners'
            ];
            
            connectionFeatures.forEach(feature => {
                if (content.includes(feature)) {
                    this.success.push(`✅ Connection feature: ${feature}`);
                } else {
                    this.issues.push(`Missing connection feature: ${feature}`);
                }
            });
            
            // Check for event listeners
            const eventListeners = [
                'beforeunload',
                'online',
                'offline',
                'visibilitychange'
            ];
            
            eventListeners.forEach(event => {
                if (content.includes(event)) {
                    this.success.push(`✅ Event listener: ${event}`);
                } else {
                    this.warnings.push(`Missing event listener: ${event}`);
                }
            });
            
            return this.issues.length === 0;
            
        } catch (error) {
            this.issues.push(`Error validating connection management: ${error.message}`);
            return false;
        }
    }

    // Validate Firebase serverless function
    validateFirebaseFunction() {
        log('\n⚡ VALIDATING FIREBASE SERVERLESS FUNCTION...', 'cyan');
        
        try {
            const functionPath = 'netlify/functions/get-config.js';
            if (!fs.existsSync(functionPath)) {
                this.issues.push('Firebase config function missing');
                return false;
            }
            
            const content = fs.readFileSync(functionPath, 'utf8');
            
            // Check for required environment variables
            const envVars = [
                'VITE_FIREBASE_API_KEY',
                'VITE_FIREBASE_AUTH_DOMAIN',
                'VITE_FIREBASE_PROJECT_ID',
                'VITE_FIREBASE_STORAGE_BUCKET',
                'VITE_FIREBASE_MESSAGING_SENDER_ID',
                'VITE_FIREBASE_APP_ID'
            ];
            
            envVars.forEach(envVar => {
                if (content.includes(envVar)) {
                    this.success.push(`✅ Environment variable: ${envVar}`);
                } else {
                    this.issues.push(`Missing environment variable: ${envVar}`);
                }
            });
            
            // Check for error handling
            if (content.includes('statusCode: 500') && content.includes('statusCode: 200')) {
                this.success.push('✅ Function error handling present');
            } else {
                this.warnings.push('Function error handling may be insufficient');
            }
            
            // Check for proper response format
            const hasContentType = content.includes('Content-Type: application/json');
            const hasCORS = content.includes('Access-Control-Allow-Origin');
            
            if (hasContentType && hasCORS) {
                this.success.push('✅ Proper response headers with CORS');
            } else if (hasContentType) {
                this.success.push('✅ Basic response headers');
            } else {
                // Check if it's the old format without CORS
                if (content.includes('"Content-Type": "application/json"')) {
                    this.success.push('✅ Response headers present');
                } else {
                    this.issues.push('Missing proper response headers');
                }
            }
            
            return this.issues.length === 0;
            
        } catch (error) {
            this.issues.push(`Error validating function: ${error.message}`);
            return false;
        }
    }

    // Validate Firebase data structure
    validateFirebaseDataStructure() {
        log('\n📊 VALIDATING FIREBASE DATA STRUCTURE...', 'cyan');
        
        try {
            const mainJsPath = 'public/js/Main.js';
            const content = fs.readFileSync(mainJsPath, 'utf8');
            
            // Check for data structure references
            const dataStructures = [
                'artifacts/',
                'genevaGuide',
                'activitiesData',
                'photoAlbum',
                'hotelData',
                'flightData'
            ];
            
            dataStructures.forEach(structure => {
                if (content.includes(structure)) {
                    this.success.push(`✅ Data structure: ${structure}`);
                } else {
                    this.warnings.push(`Data structure not found: ${structure}`);
                }
            });
            
            return true;
            
        } catch (error) {
            this.issues.push(`Error validating data structure: ${error.message}`);
            return false;
        }
    }

    // Generate comprehensive report
    generateReport() {
        log('\n📊 FIREBASE VALIDATION REPORT', 'magenta');
        log('============================', 'magenta');
        
        log(`\n✅ SUCCESSES: ${this.success.length}`, 'green');
        this.success.forEach(success => {
            log(`  ${success}`, 'green');
        });
        
        if (this.warnings.length > 0) {
            log(`\n⚠️ WARNINGS: ${this.warnings.length}`, 'yellow');
            this.warnings.forEach(warning => {
                log(`  ${warning}`, 'yellow');
            });
        }
        
        if (this.issues.length > 0) {
            log(`\n❌ ISSUES: ${this.issues.length}`, 'red');
            this.issues.forEach(issue => {
                log(`  ${issue}`, 'red');
            });
        }
        
        const overallSuccess = this.issues.length === 0;
        
        log(`\n🎯 OVERALL STATUS:`, 'magenta');
        if (overallSuccess) {
            log(`✅ FIREBASE VALIDATION PASSED`, 'green');
            log(`🔥 Firebase configuration is properly set up`, 'green');
        } else {
            log(`❌ FIREBASE VALIDATION FAILED`, 'red');
            log(`🔥 Firebase configuration needs attention`, 'red');
        }
        
        return {
            success: overallSuccess,
            issues: this.issues.length,
            warnings: this.warnings.length,
            successes: this.success.length
        };
    }

    // Main validation method
    async run() {
        log('🔥 FIREBASE VALIDATION SCRIPT', 'magenta');
        log('=============================', 'magenta');
        
        try {
            // Run all validation checks
            this.validateFirebaseConfig();
            this.validateFirebaseImports();
            this.validateFirebaseInitialization();
            this.validateFirebaseConnectionManagement();
            this.validateFirebaseFunction();
            this.validateFirebaseDataStructure();
            
            // Generate comprehensive report
            const report = this.generateReport();
            
            return report.success;
            
        } catch (error) {
            log(`❌ Firebase validation failed: ${error.message}`, 'red');
            return false;
        }
    }
}

// Run Firebase validation
if (require.main === module) {
    const validator = new FirebaseValidator();
    validator.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = FirebaseValidator;
