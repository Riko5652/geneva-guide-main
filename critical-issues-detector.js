/**
 * 🚨 CRITICAL ISSUES DETECTOR
 * 
 * Focuses on the specific weaknesses that keep recurring:
 * 1. Layout issues (especially top bar/header)
 * 2. Console errors (JavaScript runtime errors)
 * 3. Preload warnings
 * 4. Incomplete code cleanup
 * 5. CSS/HTML inconsistencies
 */

import fs from 'fs';
import path from 'path';

class CriticalIssuesDetector {
    constructor() {
        this.projectRoot = process.cwd();
        this.issues = {
            layout: [],
            console: [],
            preload: [],
            cleanup: [],
            consistency: []
        };
        this.criticalPatterns = {
            // Layout issues
            headerLayout: [
                /header.*?class.*?desktop/i,
                /top.*?bar.*?layout/i,
                /navigation.*?desktop/i,
                /burger.*?menu.*?desktop/i
            ],
            
            // Console errors
            runtimeErrors: [
                /TypeError.*?Cannot read properties of undefined/i,
                /TypeError.*?this\.\w+ is not a function/i,
                /TypeError.*?can't access property/i,
                /ReferenceError.*?is not defined/i,
                /Uncaught.*?TypeError/i
            ],
            
            // Preload issues
            preloadWarnings: [
                /preload.*?not used.*?credentials mode/i,
                /preload.*?not used within.*?seconds/i,
                /preload.*?appropriate.*?as.*?value/i
            ],
            
            // Cleanup issues
            deadCode: [
                /\/\/ TODO.*?remove/i,
                /\/\/ FIXME.*?cleanup/i,
                /\/\/ DEPRECATED/i,
                /\/\/ OLD.*?CODE/i,
                /console\.log.*?debug/i
            ],
            
            // Consistency issues
            versionMismatch: [
                /version.*?\d+.*?version.*?\d+/i,
                /timestamp.*?\d+.*?timestamp.*?\d+/i,
                /build.*?time.*?\d+.*?build.*?time.*?\d+/i
            ]
        };
    }

    async detectAllIssues() {
        console.log('🚨 CRITICAL ISSUES DETECTOR');
        console.log('============================');
        console.log('');

        try {
            // 1. Check layout issues
            await this.detectLayoutIssues();
            
            // 2. Check console errors
            await this.detectConsoleErrors();
            
            // 3. Check preload issues
            await this.detectPreloadIssues();
            
            // 4. Check cleanup issues
            await this.detectCleanupIssues();
            
            // 5. Check consistency issues
            await this.detectConsistencyIssues();
            
            // 6. Display results
            this.displayResults();
            
            // 7. Generate fix recommendations
            this.generateFixRecommendations();
            
            return this.issues;
            
        } catch (error) {
            console.error('❌ Detection failed:', error);
            throw error;
        }
    }

    async detectLayoutIssues() {
        console.log('🎨 DETECTING LAYOUT ISSUES...');
        
        // Check HTML structure
        const htmlPath = path.join(this.projectRoot, 'public', 'index.html');
        if (fs.existsSync(htmlPath)) {
            const html = fs.readFileSync(htmlPath, 'utf8');
            
            // Check for header layout issues
            if (html.includes('header')) {
                const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
                if (headerMatch) {
                    const headerContent = headerMatch[1];
                    
                    // Check for desktop-specific layout issues
                    if (headerContent.includes('desktop') && !headerContent.includes('mobile')) {
                        this.issues.layout.push({
                            type: 'header_desktop_only',
                            severity: 'high',
                            description: 'Header has desktop-specific classes but no mobile fallback',
                            location: 'index.html',
                            fix: 'Add mobile-responsive classes or ensure proper responsive design'
                        });
                    }
                    
                    // Check for burger menu issues
                    if (headerContent.includes('burger') || headerContent.includes('menu-btn')) {
                        if (!headerContent.includes('mobile-menu') || !headerContent.includes('hidden')) {
                            this.issues.layout.push({
                                type: 'burger_menu_incomplete',
                                severity: 'high',
                                description: 'Burger menu found but mobile menu structure incomplete',
                                location: 'index.html',
                                fix: 'Ensure mobile menu has proper show/hide functionality'
                            });
                        }
                    }
                    
                    // Check for navigation spacing issues
                    if (headerContent.includes('nav') && headerContent.includes('flex')) {
                        if (!headerContent.includes('justify-between') && !headerContent.includes('space-between')) {
                            this.issues.layout.push({
                                type: 'navigation_spacing',
                                severity: 'medium',
                                description: 'Navigation uses flex but may have spacing issues',
                                location: 'index.html',
                                fix: 'Add proper flex spacing classes (justify-between, space-between)'
                            });
                        }
                    }
                }
            }
        }
        
        // Check CSS for layout issues
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css'];
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                
                // Check for desktop-specific issues
                if (css.includes('@media (min-width:') && !css.includes('@media (max-width:')) {
                    this.issues.layout.push({
                        type: 'css_mobile_first_missing',
                        severity: 'high',
                        description: `CSS file ${cssFile} has desktop-first media queries but no mobile-first approach`,
                        location: `CSS/${cssFile}`,
                        fix: 'Add mobile-first media queries or ensure proper responsive design'
                    });
                }
                
                // Check for header-specific CSS issues
                if (css.includes('#header') || css.includes('.header')) {
                    if (!css.includes('position: sticky') && !css.includes('position: fixed')) {
                        this.issues.layout.push({
                            type: 'header_positioning',
                            severity: 'medium',
                            description: `Header CSS in ${cssFile} may have positioning issues`,
                            location: `CSS/${cssFile}`,
                            fix: 'Ensure header has proper positioning (sticky/fixed) for desktop'
                        });
                    }
                }
            }
        }
    }

    async detectConsoleErrors() {
        console.log('🐛 DETECTING CONSOLE ERRORS...');
        
        // Check JavaScript files for common error patterns
        const jsFiles = [
            'Main.js', 'ui.js', 'handlers.js', 'Gemini.js', 'utils.js',
            'user-agent-adjuster.js', 'template-manager.js', 'template-demo.js'
        ];
        
        for (const jsFile of jsFiles) {
            const jsPath = path.join(this.projectRoot, 'public', 'js', jsFile);
            if (fs.existsSync(jsPath)) {
                const js = fs.readFileSync(jsPath, 'utf8');
                
                // Check for undefined property access
                const undefinedAccess = js.match(/\.\w+\s*=\s*[^=].*?\.\w+/g);
                if (undefinedAccess) {
                    for (const access of undefinedAccess) {
                        if (access.includes('this.') && !access.includes('if') && !access.includes('?')) {
                            this.issues.console.push({
                                type: 'undefined_property_access',
                                severity: 'high',
                                description: `Potential undefined property access: ${access}`,
                                location: `js/${jsFile}`,
                                fix: 'Add null/undefined checks before property access'
                            });
                        }
                    }
                }
                
                // Check for missing function definitions
                const functionCalls = js.match(/this\.\w+\(/g);
                if (functionCalls) {
                    for (const call of functionCalls) {
                        const funcName = call.match(/this\.(\w+)\(/)[1];
                        if (!js.includes(`${funcName}(`) && !js.includes(`${funcName}:`)) {
                            this.issues.console.push({
                                type: 'missing_function_definition',
                                severity: 'high',
                                description: `Function ${funcName} is called but not defined`,
                                location: `js/${jsFile}`,
                                fix: `Define the ${funcName} function or fix the function call`
                            });
                        }
                    }
                }
                
                // Check for user-agent-adjuster specific issues
                if (jsFile === 'user-agent-adjuster.js') {
                    if (js.includes('this.screenSize') && !js.includes('if (this.screenSize')) {
                        this.issues.console.push({
                            type: 'screenSize_undefined_check',
                            severity: 'high',
                            description: 'screenSize property accessed without null check',
                            location: `js/${jsFile}`,
                            fix: 'Add null/undefined check before accessing screenSize properties'
                        });
                    }
                }
                
                // Check for template-manager specific issues
                if (jsFile === 'template-manager.js') {
                    if (js.includes('this.setupEventListeners') && !js.includes('setupEventListeners()')) {
                        this.issues.console.push({
                            type: 'setupEventListeners_missing',
                            severity: 'high',
                            description: 'setupEventListeners is called but not defined',
                            location: `js/${jsFile}`,
                            fix: 'Define setupEventListeners method or fix the method call'
                        });
                    }
                }
            }
        }
    }

    async detectPreloadIssues() {
        console.log('⚡ DETECTING PRELOAD ISSUES...');
        
        const htmlPath = path.join(this.projectRoot, 'public', 'index.html');
        if (fs.existsSync(htmlPath)) {
            const html = fs.readFileSync(htmlPath, 'utf8');
            
            // Check for preload links
            const preloadMatches = html.match(/<link[^>]*rel="preload"[^>]*>/g);
            if (preloadMatches) {
                for (const preload of preloadMatches) {
                    // Check for missing crossorigin attribute
                    if (preload.includes('href=') && !preload.includes('crossorigin')) {
                        this.issues.preload.push({
                            type: 'missing_crossorigin',
                            severity: 'medium',
                            description: 'Preload link missing crossorigin attribute',
                            location: 'index.html',
                            fix: 'Add crossorigin="anonymous" to preload links'
                        });
                    }
                    
                    // Check for missing as attribute
                    if (preload.includes('href=') && !preload.includes('as=')) {
                        this.issues.preload.push({
                            type: 'missing_as_attribute',
                            severity: 'medium',
                            description: 'Preload link missing as attribute',
                            location: 'index.html',
                            fix: 'Add as="script" or as="style" to preload links'
                        });
                    }
                    
                    // Check for unused preloads
                    const hrefMatch = preload.match(/href="([^"]+)"/);
                    if (hrefMatch) {
                        const href = hrefMatch[1];
                        if (href.includes('.js') && !html.includes(`src="${href}"`)) {
                            this.issues.preload.push({
                                type: 'unused_preload',
                                severity: 'low',
                                description: `Preload for ${href} but no corresponding script tag`,
                                location: 'index.html',
                                fix: 'Remove unused preload or add corresponding script tag'
                            });
                        }
                    }
                }
            }
        }
    }

    async detectCleanupIssues() {
        console.log('🧹 DETECTING CLEANUP ISSUES...');
        
        // Check for TODO/FIXME comments
        const allFiles = this.getAllProjectFiles();
        for (const file of allFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const relativePath = path.relative(this.projectRoot, file);
                
                // Check for TODO comments
                const todoMatches = content.match(/\/\/\s*TODO.*$/gm);
                if (todoMatches) {
                    for (const todo of todoMatches) {
                        this.issues.cleanup.push({
                            type: 'todo_comment',
                            severity: 'low',
                            description: `TODO comment found: ${todo.trim()}`,
                            location: relativePath,
                            fix: 'Address the TODO or remove if no longer needed'
                        });
                    }
                }
                
                // Check for FIXME comments
                const fixmeMatches = content.match(/\/\/\s*FIXME.*$/gm);
                if (fixmeMatches) {
                    for (const fixme of fixmeMatches) {
                        this.issues.cleanup.push({
                            type: 'fixme_comment',
                            severity: 'medium',
                            description: `FIXME comment found: ${fixme.trim()}`,
                            location: relativePath,
                            fix: 'Address the FIXME or remove if no longer needed'
                        });
                    }
                }
                
                // Check for debug console.log
                const debugLogs = content.match(/console\.log\([^)]*debug[^)]*\)/g);
                if (debugLogs) {
                    for (const log of debugLogs) {
                        this.issues.cleanup.push({
                            type: 'debug_console_log',
                            severity: 'low',
                            description: `Debug console.log found: ${log}`,
                            location: relativePath,
                            fix: 'Remove debug console.log statements'
                        });
                    }
                }
                
                // Check for unused imports
                if (file.endsWith('.js')) {
                    const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
                    if (importMatches) {
                        for (const imp of importMatches) {
                            const module = imp.match(/from\s+['"]([^'"]+)['"]/)[1];
                            if (module.startsWith('./') || module.startsWith('../')) {
                                const modulePath = path.resolve(path.dirname(file), module);
                                if (!fs.existsSync(modulePath) && !fs.existsSync(modulePath + '.js')) {
                                    this.issues.cleanup.push({
                                        type: 'unused_import',
                                        severity: 'high',
                                        description: `Import from non-existent module: ${module}`,
                                        location: relativePath,
                                        fix: 'Remove unused import or fix import path'
                                    });
                                }
                            }
                        }
                    }
                }
                
            } catch (error) {
                // Skip files that can't be read
            }
        }
    }

    async detectConsistencyIssues() {
        console.log('🔄 DETECTING CONSISTENCY ISSUES...');
        
        // Check version consistency
        const manifestPath = path.join(this.projectRoot, 'public', 'cache-manifest.json');
        const htmlPath = path.join(this.projectRoot, 'public', 'index.html');
        const versionPath = path.join(this.projectRoot, 'public', 'js', 'version.js');
        
        if (fs.existsSync(manifestPath) && fs.existsSync(htmlPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const html = fs.readFileSync(htmlPath, 'utf8');
            
            // Check build timestamp consistency
            const htmlTimestamp = html.match(/content="(\d+)"/);
            if (htmlTimestamp) {
                const htmlTime = htmlTimestamp[1];
                const manifestTime = manifest.version;
                
                if (htmlTime !== manifestTime) {
                    this.issues.consistency.push({
                        type: 'timestamp_mismatch',
                        severity: 'high',
                        description: `HTML timestamp (${htmlTime}) doesn't match manifest timestamp (${manifestTime})`,
                        location: 'index.html vs cache-manifest.json',
                        fix: 'Synchronize timestamps across all files'
                    });
                }
            }
        }
        
        // Check CSS file consistency
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css', 'dynamic-templates.css'];
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                // Check if CSS file is referenced in HTML
                if (!html.includes(cssFile)) {
                    this.issues.consistency.push({
                        type: 'css_not_referenced',
                        severity: 'medium',
                        description: `CSS file ${cssFile} exists but not referenced in HTML`,
                        location: `CSS/${cssFile}`,
                        fix: 'Add CSS file to HTML or remove if unused'
                    });
                }
            }
        }
        
        // Check JavaScript file consistency
        const jsFiles = [
            'Main.js', 'ui.js', 'handlers.js', 'Gemini.js', 'utils.js',
            'user-agent-adjuster.js', 'template-manager.js', 'template-demo.js',
            'config-templates.js', 'dynamic-form-generator.js', 'dynamic-content-renderer.js'
        ];
        
        for (const jsFile of jsFiles) {
            const jsPath = path.join(this.projectRoot, 'public', 'js', jsFile);
            if (fs.existsSync(jsPath)) {
                // Check if JS file is referenced in HTML
                if (!html.includes(jsFile)) {
                    this.issues.consistency.push({
                        type: 'js_not_referenced',
                        severity: 'medium',
                        description: `JavaScript file ${jsFile} exists but not referenced in HTML`,
                        location: `js/${jsFile}`,
                        fix: 'Add JavaScript file to HTML or remove if unused'
                    });
                }
            }
        }
    }

    getAllProjectFiles() {
        const files = [];
        const publicDir = path.join(this.projectRoot, 'public');
        
        const getFilesRecursively = (dirPath) => {
            try {
                const items = fs.readdirSync(dirPath);
                
                for (const item of items) {
                    const fullPath = path.join(dirPath, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        getFilesRecursively(fullPath);
                    } else if (stat.isFile()) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip directories that can't be read
            }
        };
        
        getFilesRecursively(publicDir);
        return files;
    }

    displayResults() {
        console.log('\n📊 DETECTION RESULTS');
        console.log('====================');
        
        const totalIssues = Object.values(this.issues).reduce((sum, arr) => sum + arr.length, 0);
        
        if (totalIssues === 0) {
            console.log('✅ No critical issues detected!');
            return;
        }
        
        // Layout issues
        if (this.issues.layout.length > 0) {
            console.log('\n🎨 LAYOUT ISSUES:');
            for (const issue of this.issues.layout) {
                console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.type.toUpperCase()}`);
                console.log(`    ${issue.description}`);
                console.log(`    Location: ${issue.location}`);
                console.log(`    Fix: ${issue.fix}`);
                console.log('');
            }
        }
        
        // Console errors
        if (this.issues.console.length > 0) {
            console.log('\n🐛 CONSOLE ERRORS:');
            for (const issue of this.issues.console) {
                console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.type.toUpperCase()}`);
                console.log(`    ${issue.description}`);
                console.log(`    Location: ${issue.location}`);
                console.log(`    Fix: ${issue.fix}`);
                console.log('');
            }
        }
        
        // Preload issues
        if (this.issues.preload.length > 0) {
            console.log('\n⚡ PRELOAD ISSUES:');
            for (const issue of this.issues.preload) {
                console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.type.toUpperCase()}`);
                console.log(`    ${issue.description}`);
                console.log(`    Location: ${issue.location}`);
                console.log(`    Fix: ${issue.fix}`);
                console.log('');
            }
        }
        
        // Cleanup issues
        if (this.issues.cleanup.length > 0) {
            console.log('\n🧹 CLEANUP ISSUES:');
            for (const issue of this.issues.cleanup) {
                console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.type.toUpperCase()}`);
                console.log(`    ${issue.description}`);
                console.log(`    Location: ${issue.location}`);
                console.log(`    Fix: ${issue.fix}`);
                console.log('');
            }
        }
        
        // Consistency issues
        if (this.issues.consistency.length > 0) {
            console.log('\n🔄 CONSISTENCY ISSUES:');
            for (const issue of this.issues.consistency) {
                console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.type.toUpperCase()}`);
                console.log(`    ${issue.description}`);
                console.log(`    Location: ${issue.location}`);
                console.log(`    Fix: ${issue.fix}`);
                console.log('');
            }
        }
        
        console.log(`\n📈 SUMMARY: ${totalIssues} total issues found`);
        console.log(`  🔴 High severity: ${Object.values(this.issues).flat().filter(i => i.severity === 'high').length}`);
        console.log(`  🟡 Medium severity: ${Object.values(this.issues).flat().filter(i => i.severity === 'medium').length}`);
        console.log(`  🟢 Low severity: ${Object.values(this.issues).flat().filter(i => i.severity === 'low').length}`);
    }

    generateFixRecommendations() {
        console.log('\n💡 CRITICAL FIX RECOMMENDATIONS');
        console.log('================================');
        
        const highSeverityIssues = Object.values(this.issues).flat().filter(i => i.severity === 'high');
        
        if (highSeverityIssues.length === 0) {
            console.log('✅ No high-severity issues requiring immediate attention!');
            return;
        }
        
        console.log('\n🔴 IMMEDIATE ACTION REQUIRED:');
        
        // Group by type for better recommendations
        const groupedIssues = highSeverityIssues.reduce((acc, issue) => {
            if (!acc[issue.type]) acc[issue.type] = [];
            acc[issue.type].push(issue);
            return acc;
        }, {});
        
        for (const [type, issues] of Object.entries(groupedIssues)) {
            console.log(`\n📋 ${type.toUpperCase().replace(/_/g, ' ')}:`);
            for (const issue of issues) {
                console.log(`  • ${issue.description}`);
                console.log(`    Fix: ${issue.fix}`);
            }
        }
        
        console.log('\n🚀 RECOMMENDED ACTIONS:');
        console.log('1. Fix all high-severity issues immediately');
        console.log('2. Test the application after each fix');
        console.log('3. Run this detector again to verify fixes');
        console.log('4. Update cache and version systems');
        console.log('5. Deploy only after all issues are resolved');
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const detector = new CriticalIssuesDetector();
    
    try {
        const results = await detector.detectAllIssues();
        
        // Save results
        const resultsPath = path.join(detector.projectRoot, 'critical-issues-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${resultsPath}`);
        
        const totalIssues = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
        if (totalIssues > 0) {
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Detection failed:', error);
        process.exit(1);
    }
}

export default CriticalIssuesDetector;
