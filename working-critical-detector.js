/**
 * 🚨 WORKING CRITICAL ISSUES DETECTOR
 * 
 * A working version that detects the specific issues we keep missing
 */

import fs from 'fs';
import path from 'path';

console.log('🚨 WORKING CRITICAL ISSUES DETECTOR');
console.log('====================================');
console.log('');

try {
    const projectRoot = process.cwd();
    const issues = {
        layout: [],
        console: [],
        preload: [],
        cleanup: [],
        consistency: []
    };

    // 1. CHECK LAYOUT ISSUES
    console.log('🎨 CHECKING LAYOUT ISSUES...');
    
    const htmlPath = path.join(projectRoot, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Check header structure
        if (html.includes('<header')) {
            const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
            if (headerMatch) {
                const headerContent = headerMatch[1];
                
                // Check for desktop layout issues
                if (headerContent.includes('desktop') && !headerContent.includes('mobile')) {
                    issues.layout.push({
                        type: 'header_desktop_only',
                        severity: 'high',
                        description: 'Header has desktop-specific classes but no mobile fallback',
                        location: 'index.html'
                    });
                }
                
                // Check for burger menu issues
                if (headerContent.includes('burger') || headerContent.includes('menu-btn')) {
                    if (!headerContent.includes('mobile-menu') || !headerContent.includes('hidden')) {
                        issues.layout.push({
                            type: 'burger_menu_incomplete',
                            severity: 'high',
                            description: 'Burger menu found but mobile menu structure incomplete',
                            location: 'index.html'
                        });
                    }
                }
                
                // Check for navigation spacing
                if (headerContent.includes('nav') && headerContent.includes('flex')) {
                    if (!headerContent.includes('justify-between') && !headerContent.includes('space-between')) {
                        issues.layout.push({
                            type: 'navigation_spacing',
                            severity: 'medium',
                            description: 'Navigation uses flex but may have spacing issues',
                            location: 'index.html'
                        });
                    }
                }
            }
        }
    }
    
    // 2. CHECK CONSOLE ERRORS
    console.log('🐛 CHECKING CONSOLE ERRORS...');
    
    const jsFiles = [
        'Main.js', 'ui.js', 'handlers.js', 'Gemini.js', 'utils.js',
        'user-agent-adjuster.js', 'template-manager.js', 'template-demo.js'
    ];
    
    for (const jsFile of jsFiles) {
        const jsPath = path.join(projectRoot, 'public', 'js', jsFile);
        if (fs.existsSync(jsPath)) {
            const js = fs.readFileSync(jsPath, 'utf8');
            
            // Check for user-agent-adjuster specific issues
            if (jsFile === 'user-agent-adjuster.js') {
                if (js.includes('this.screenSize') && !js.includes('if (this.screenSize')) {
                    issues.console.push({
                        type: 'screenSize_undefined_check',
                        severity: 'high',
                        description: 'screenSize property accessed without null check',
                        location: `js/${jsFile}`
                    });
                }
            }
            
            // Check for template-manager specific issues
            if (jsFile === 'template-manager.js') {
                if (js.includes('this.setupEventListeners') && !js.includes('setupEventListeners()')) {
                    issues.console.push({
                        type: 'setupEventListeners_missing',
                        severity: 'high',
                        description: 'setupEventListeners is called but not defined',
                        location: `js/${jsFile}`
                    });
                }
            }
            
            // Check for undefined property access (more specific pattern)
            const undefinedAccess = js.match(/this\.\w+\s*=\s*this\.\w+\(\)/g);
            if (undefinedAccess) {
                for (const access of undefinedAccess) {
                    // Only flag if it's not a method call with parentheses
                    if (access.includes('this.') && access.includes('()')) {
                        // This is actually a method call, not undefined access
                        continue;
                    }
                }
            }
            
            // Check for actual undefined property access patterns
            const realUndefinedAccess = js.match(/this\.\w+\.\w+/g);
            if (realUndefinedAccess) {
                for (const access of realUndefinedAccess) {
                    // Check if there's a null check before this access
                    const lines = js.split('\n');
                    const accessLine = lines.find(line => line.includes(access));
                    if (accessLine && !accessLine.includes('if') && !accessLine.includes('?')) {
                        issues.console.push({
                            type: 'undefined_property_access',
                            severity: 'high',
                            description: `Potential undefined property access: ${access}`,
                            location: `js/${jsFile}`
                        });
                    }
                }
            }
        }
    }
    
    // 3. CHECK PRELOAD ISSUES
    console.log('⚡ CHECKING PRELOAD ISSUES...');
    
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Check for preload links
        const preloadMatches = html.match(/<link[^>]*rel="preload"[^>]*>/g);
        if (preloadMatches) {
            for (const preload of preloadMatches) {
                // Check for missing crossorigin attribute
                if (preload.includes('href=') && !preload.includes('crossorigin')) {
                    issues.preload.push({
                        type: 'missing_crossorigin',
                        severity: 'medium',
                        description: 'Preload link missing crossorigin attribute',
                        location: 'index.html'
                    });
                }
                
                // Check for missing as attribute
                if (preload.includes('href=') && !preload.includes('as=')) {
                    issues.preload.push({
                        type: 'missing_as_attribute',
                        severity: 'medium',
                        description: 'Preload link missing as attribute',
                        location: 'index.html'
                    });
                }
            }
        }
    }
    
    // 4. CHECK CONSISTENCY ISSUES
    console.log('🔄 CHECKING CONSISTENCY ISSUES...');
    
    const manifestPath = path.join(projectRoot, 'public', 'cache-manifest.json');
    if (fs.existsSync(manifestPath) && fs.existsSync(htmlPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Check build timestamp consistency
        const htmlTimestamp = html.match(/content="(\d+)"/);
        if (htmlTimestamp) {
            const htmlTime = htmlTimestamp[1];
            const manifestTime = manifest.version;
            
            if (htmlTime !== manifestTime) {
                issues.consistency.push({
                    type: 'timestamp_mismatch',
                    severity: 'high',
                    description: `HTML timestamp (${htmlTime}) doesn't match manifest timestamp (${manifestTime})`,
                    location: 'index.html vs cache-manifest.json'
                });
            }
        }
    }
    
    // 5. DISPLAY RESULTS
    console.log('\n📊 DETECTION RESULTS');
    console.log('====================');
    
    const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalIssues === 0) {
        console.log('✅ No critical issues detected!');
    } else {
        // Layout issues
        if (issues.layout.length > 0) {
            console.log('\n🎨 LAYOUT ISSUES:');
            for (const issue of issues.layout) {
                console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.type.toUpperCase()}`);
                console.log(`    ${issue.description}`);
                console.log(`    Location: ${issue.location}`);
                console.log('');
            }
        }
        
        // Console errors
        if (issues.console.length > 0) {
            console.log('\n🐛 CONSOLE ERRORS:');
            for (const issue of issues.console) {
                console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.type.toUpperCase()}`);
                console.log(`    ${issue.description}`);
                console.log(`    Location: ${issue.location}`);
                console.log('');
            }
        }
        
        // Preload issues
        if (issues.preload.length > 0) {
            console.log('\n⚡ PRELOAD ISSUES:');
            for (const issue of issues.preload) {
                console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.type.toUpperCase()}`);
                console.log(`    ${issue.description}`);
                console.log(`    Location: ${issue.location}`);
                console.log('');
            }
        }
        
        // Consistency issues
        if (issues.consistency.length > 0) {
            console.log('\n🔄 CONSISTENCY ISSUES:');
            for (const issue of issues.consistency) {
                console.log(`  ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.type.toUpperCase()}`);
                console.log(`    ${issue.description}`);
                console.log(`    Location: ${issue.location}`);
                console.log('');
            }
        }
        
        console.log(`\n📈 SUMMARY: ${totalIssues} total issues found`);
        console.log(`  🔴 High severity: ${Object.values(issues).flat().filter(i => i.severity === 'high').length}`);
        console.log(`  🟡 Medium severity: ${Object.values(issues).flat().filter(i => i.severity === 'medium').length}`);
    }
    
    // 6. GENERATE FIX RECOMMENDATIONS
    console.log('\n💡 CRITICAL FIX RECOMMENDATIONS');
    console.log('================================');
    
    const highSeverityIssues = Object.values(issues).flat().filter(i => i.severity === 'high');
    
    if (highSeverityIssues.length === 0) {
        console.log('✅ No high-severity issues requiring immediate attention!');
    } else {
        console.log('\n🔴 IMMEDIATE ACTION REQUIRED:');
        
        for (const issue of highSeverityIssues) {
            console.log(`\n📋 ${issue.type.toUpperCase().replace(/_/g, ' ')}:`);
            console.log(`  • ${issue.description}`);
            console.log(`  • Location: ${issue.location}`);
            
            // Provide specific fix recommendations
            switch (issue.type) {
                case 'screenSize_undefined_check':
                    console.log(`  • Fix: Add null check: if (this.screenSize && this.screenSize.width) { ... }`);
                    break;
                case 'setupEventListeners_missing':
                    console.log(`  • Fix: Define setupEventListeners method or move call to initialize() method`);
                    break;
                case 'timestamp_mismatch':
                    console.log(`  • Fix: Run node build-timestamp.js to synchronize timestamps`);
                    break;
                case 'header_desktop_only':
                    console.log(`  • Fix: Add mobile-responsive classes to header`);
                    break;
                case 'burger_menu_incomplete':
                    console.log(`  • Fix: Ensure mobile menu has proper show/hide functionality`);
                    break;
                default:
                    console.log(`  • Fix: Review and resolve manually`);
            }
        }
        
        console.log('\n🚀 RECOMMENDED ACTIONS:');
        console.log('1. Fix all high-severity issues immediately');
        console.log('2. Test the application after each fix');
        console.log('3. Run this detector again to verify fixes');
        console.log('4. Update cache and version systems');
        console.log('5. Deploy only after all issues are resolved');
    }
    
    // Save results
    const resultsPath = path.join(projectRoot, 'critical-issues-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(issues, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    console.log('\n🎉 CRITICAL ISSUES DETECTION COMPLETE!');
    
} catch (error) {
    console.error('❌ Detection failed:', error);
    process.exit(1);
}
