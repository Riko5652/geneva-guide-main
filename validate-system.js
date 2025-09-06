#!/usr/bin/env node

/**
 * 🛡️ COMPREHENSIVE SYSTEM VALIDATION SCRIPT
 * 
 * This script validates the entire project for:
 * - File dependencies
 * - CSS cascade integrity
 * - Cache version synchronization
 * - Responsive breakpoint consistency
 * - JavaScript import/export integrity
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
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

function validateFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        log(`✅ ${description}: ${filePath}`, 'green');
        return true;
    } else {
        log(`❌ ${description}: ${filePath} - FILE MISSING`, 'red');
        return false;
    }
}

function validateCSSFiles() {
    log('\n🎨 VALIDATING CSS FILES...', 'cyan');
    
    const cssFiles = [
        'public/CSS/style.css',
        'public/CSS/utilities.css',
        'public/CSS/modal-enhancements.css',
        'public/CSS/css-cascade-fix.css',
        'public/CSS/desktop-layout-fix.css'
    ];
    
    let allValid = true;
    cssFiles.forEach(file => {
        if (!validateFileExists(file, 'CSS File')) {
            allValid = false;
        }
    });
    
    return allValid;
}

function validateJSFiles() {
    log('\n📜 VALIDATING JAVASCRIPT FILES...', 'cyan');
    
    const jsFiles = [
        'public/js/Main.js',
        'public/js/ui.js',
        'public/js/handlers.js',
        'public/js/Gemini.js',
        'public/js/config.js',
        'public/js/loading.js',
        'public/js/toast.js',
        'public/js/animations.js',
        'public/js/version.js',
        'public/js/utils.js',
        'public/js/services.js',
        'public/js/Map.js'
    ];
    
    let allValid = true;
    jsFiles.forEach(file => {
        if (!validateFileExists(file, 'JS File')) {
            allValid = false;
        }
    });
    
    return allValid;
}

function validateCacheManifest() {
    log('\n📦 VALIDATING CACHE MANIFEST...', 'cyan');
    
    try {
        const manifestPath = 'public/cache-manifest.json';
        if (!fs.existsSync(manifestPath)) {
            log('❌ Cache manifest missing', 'red');
            return false;
        }
        
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Check if all expected files are in manifest
        const expectedFiles = [
            'Main.js', 'handlers.js', 'ui.js', 'services.js', 'utils.js',
            'Map.js', 'Gemini.js', 'version.js', 'style.css', 'utilities.css',
            'modal-enhancements.css', 'css-cascade-fix.css', 'desktop-layout-fix.css', 'index.html'
        ];
        
        let allFilesPresent = true;
        expectedFiles.forEach(file => {
            if (!manifest.files[file]) {
                log(`❌ Missing file in cache manifest: ${file}`, 'red');
                allFilesPresent = false;
            }
        });
        
        // Check version consistency
        const mainVersion = manifest.version;
        let versionConsistent = true;
        
        Object.entries(manifest.files).forEach(([file, version]) => {
            if (version !== mainVersion) {
                log(`❌ Version mismatch: ${file} (${version}) vs main (${mainVersion})`, 'red');
                versionConsistent = false;
            }
        });
        
        if (allFilesPresent && versionConsistent) {
            log(`✅ Cache manifest valid - Version: ${mainVersion}`, 'green');
            return true;
        }
        
        return false;
        
    } catch (error) {
        log(`❌ Error validating cache manifest: ${error.message}`, 'red');
        return false;
    }
}

function validateHTMLStructure() {
    log('\n🌐 VALIDATING HTML STRUCTURE...', 'cyan');
    
    try {
        const htmlPath = 'public/index.html';
        if (!fs.existsSync(htmlPath)) {
            log('❌ index.html missing', 'red');
            return false;
        }
        
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Check CSS loading order
        const cssOrder = [
            'style.css',
            'utilities.css',
            'modal-enhancements.css',
            'css-cascade-fix.css',
            'desktop-layout-fix.css'
        ];
        
        let cssOrderValid = true;
        let lastIndex = -1;
        
        cssOrder.forEach(cssFile => {
            const index = html.indexOf(cssFile);
            if (index === -1) {
                log(`❌ CSS file not found in HTML: ${cssFile}`, 'red');
                cssOrderValid = false;
            } else if (index < lastIndex) {
                log(`❌ CSS loading order incorrect: ${cssFile}`, 'red');
                cssOrderValid = false;
            } else {
                lastIndex = index;
            }
        });
        
        // Check for build timestamp
        const hasBuildTime = html.includes('meta name="build-time"');
        if (!hasBuildTime) {
            log('❌ Build timestamp meta tag missing', 'red');
            cssOrderValid = false;
        }
        
        if (cssOrderValid && hasBuildTime) {
            log('✅ HTML structure valid', 'green');
            return true;
        }
        
        return false;
        
    } catch (error) {
        log(`❌ Error validating HTML: ${error.message}`, 'red');
        return false;
    }
}

function validateResponsiveBreakpoints() {
    log('\n📱 VALIDATING RESPONSIVE BREAKPOINTS...', 'cyan');
    
    try {
        const cssFiles = [
            'public/CSS/style.css',
            'public/CSS/css-cascade-fix.css',
            'public/CSS/desktop-layout-fix.css'
        ];
        
        let breakpointsValid = true;
        
        cssFiles.forEach(file => {
            if (!fs.existsSync(file)) return;
            
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for conflicting breakpoints
            const mobileMax = (content.match(/@media.*max-width.*768px/g) || []).length;
            const desktopMin = (content.match(/@media.*min-width.*769px/g) || []).length;
            const desktopMin1024 = (content.match(/@media.*min-width.*1024px/g) || []).length;
            
            if (desktopMin > 0 && desktopMin1024 > 0) {
                log(`⚠️ Conflicting desktop breakpoints in ${file}`, 'yellow');
                breakpointsValid = false;
            }
        });
        
        if (breakpointsValid) {
            log('✅ Responsive breakpoints consistent', 'green');
            return true;
        }
        
        return false;
        
    } catch (error) {
        log(`❌ Error validating breakpoints: ${error.message}`, 'red');
        return false;
    }
}

function validateJSImports() {
    log('\n🔗 VALIDATING JAVASCRIPT IMPORTS...', 'cyan');
    
    try {
        const mainJsPath = 'public/js/Main.js';
        if (!fs.existsSync(mainJsPath)) {
            log('❌ Main.js missing', 'red');
            return false;
        }
        
        const mainJs = fs.readFileSync(mainJsPath, 'utf8');
        
        // Extract import statements
        const imports = mainJs.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
        let importsValid = true;
        
        imports.forEach(importStatement => {
            const match = importStatement.match(/from\s+['"]([^'"]+)['"]/);
            if (match) {
                const importPath = match[1];
                
                // Check if it's a relative import
                if (importPath.startsWith('./')) {
                    const fullPath = path.join('public/js', importPath);
                    if (!fs.existsSync(fullPath)) {
                        log(`❌ Import target missing: ${importPath}`, 'red');
                        importsValid = false;
                    }
                }
            }
        });
        
        if (importsValid) {
            log('✅ JavaScript imports valid', 'green');
            return true;
        }
        
        return false;
        
    } catch (error) {
        log(`❌ Error validating imports: ${error.message}`, 'red');
        return false;
    }
}

function main() {
    log('🛡️ COMPREHENSIVE SYSTEM VALIDATION', 'magenta');
    log('=====================================', 'magenta');
    
    const results = {
        cssFiles: validateCSSFiles(),
        jsFiles: validateJSFiles(),
        cacheManifest: validateCacheManifest(),
        htmlStructure: validateHTMLStructure(),
        responsiveBreakpoints: validateResponsiveBreakpoints(),
        jsImports: validateJSImports()
    };
    
    log('\n📊 VALIDATION SUMMARY', 'cyan');
    log('====================', 'cyan');
    
    const allValid = Object.values(results).every(result => result);
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        const color = passed ? 'green' : 'red';
        log(`${status} ${test}`, color);
    });
    
    log('\n🎯 OVERALL STATUS', 'magenta');
    log('================', 'magenta');
    
    if (allValid) {
        log('✅ SYSTEM VALIDATION PASSED - Ready for deployment', 'green');
        process.exit(0);
    } else {
        log('❌ SYSTEM VALIDATION FAILED - Issues must be resolved', 'red');
        process.exit(1);
    }
}

// Run validation
main();
