/**
 * 🎨 WORKING DESIGN VALIDATOR
 * 
 * A working version that actually displays results
 */

import fs from 'fs';
import path from 'path';

console.log('🎨 WORKING DESIGN VALIDATOR');
console.log('============================');
console.log('');

try {
    const projectRoot = process.cwd();
    const issues = {
        design: [],
        aesthetics: [],
        bestPractices: [],
        accessibility: [],
        performance: [],
        responsive: [],
        crossBrowser: [],
        critical: []
    };

    // 1. CHECK DESIGN QUALITY
    console.log('🎨 CHECKING DESIGN QUALITY...');
    
    const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css', 'dynamic-templates.css'];
    
    for (const cssFile of cssFiles) {
        const cssPath = path.join(projectRoot, 'public', 'CSS', cssFile);
        if (fs.existsSync(cssPath)) {
            const css = fs.readFileSync(cssPath, 'utf8');
            
            // Check for design consistency
            const borderRadiusValues = css.match(/border-radius:\s*(\d+)px/g);
            if (borderRadiusValues) {
                const values = borderRadiusValues.map(match => {
                    const matchResult = match.match(/(\d+)px/);
                    return matchResult ? parseInt(matchResult[1]) : 0;
                });
                const uniqueValues = [...new Set(values)];
                
                if (uniqueValues.length > 3) {
                    issues.design.push({
                        type: 'inconsistent_border_radius',
                        severity: 'medium',
                        description: `Too many different border-radius values (${uniqueValues.length}): ${uniqueValues.join(', ')}px`,
                        location: `CSS/${cssFile}`,
                        fix: 'Standardize border-radius values (recommended: 4px, 8px, 12px)'
                    });
                }
            }
            
            // Check for spacing consistency
            const spacingValues = css.match(/margin|padding.*?(\d+)px/g);
            if (spacingValues) {
                const values = spacingValues.map(match => {
                    const matchResult = match.match(/(\d+)px/);
                    return matchResult ? parseInt(matchResult[1]) : 0;
                });
                const uniqueValues = [...new Set(values)];
                
                if (uniqueValues.length > 8) {
                    issues.design.push({
                        type: 'inconsistent_spacing',
                        severity: 'medium',
                        description: `Too many different spacing values (${uniqueValues.length}): ${uniqueValues.join(', ')}px`,
                        location: `CSS/${cssFile}`,
                        fix: 'Use consistent spacing scale (8px, 16px, 24px, 32px, 48px, 64px)'
                    });
                }
            }
            
            // Check for color usage
            const colorValues = css.match(/color:\s*(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))/g);
            if (colorValues) {
                const colors = colorValues.map(match => match.split(':')[1].trim());
                const uniqueColors = [...new Set(colors)];
                
                if (uniqueColors.length > 10) {
                    issues.aesthetics.push({
                        type: 'too_many_colors',
                        severity: 'medium',
                        description: `Too many different colors (${uniqueColors.length}): ${uniqueColors.slice(0, 5).join(', ')}...`,
                        location: `CSS/${cssFile}`,
                        fix: 'Limit color palette to 5-7 main colors for better consistency'
                    });
                }
            }
            
            // Check for hardcoded colors
            const hardcodedColors = css.match(/#[0-9a-fA-F]{6}/g);
            if (hardcodedColors && hardcodedColors.length > 5) {
                issues.bestPractices.push({
                    type: 'hardcoded_colors',
                    severity: 'medium',
                    description: `Too many hardcoded colors (${hardcodedColors.length})`,
                    location: `CSS/${cssFile}`,
                    fix: 'Use CSS custom properties (variables) for colors'
                });
            }
            
            // Check for font size consistency
            const fontSizes = css.match(/font-size:\s*(\d+)px/g);
            if (fontSizes) {
                const sizes = fontSizes.map(match => {
                    const matchResult = match.match(/(\d+)px/);
                    return matchResult ? parseInt(matchResult[1]) : 0;
                });
                const smallSizes = sizes.filter(size => size < 14);
                
                if (smallSizes.length > 0) {
                    issues.accessibility.push({
                        type: 'small_font_sizes',
                        severity: 'high',
                        description: `Font sizes too small for accessibility: ${smallSizes.join(', ')}px`,
                        location: `CSS/${cssFile}`,
                        fix: 'Use minimum 16px font size for body text, 14px minimum for UI elements'
                    });
                }
            }
            
            // Check for !important usage
            const importantUsage = css.match(/!important/g);
            if (importantUsage && importantUsage.length > 10) {
                issues.bestPractices.push({
                    type: 'excessive_important',
                    severity: 'medium',
                    description: `Too many !important declarations (${importantUsage.length})`,
                    location: `CSS/${cssFile}`,
                    fix: 'Reduce use of !important, improve CSS specificity instead'
                });
            }
        }
    }
    
    // 2. CHECK AESTHETIC STANDARDS
    console.log('✨ CHECKING AESTHETIC STANDARDS...');
    
    const htmlPath = path.join(projectRoot, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Check for proper DOCTYPE
        if (!html.includes('<!DOCTYPE html>')) {
            issues.bestPractices.push({
                type: 'missing_doctype',
                severity: 'high',
                description: 'Missing DOCTYPE declaration',
                location: 'index.html',
                fix: 'Add <!DOCTYPE html> at the beginning of the file'
            });
        }
        
        // Check for proper lang attribute
        if (!html.includes('lang=')) {
            issues.accessibility.push({
                type: 'missing_lang_attribute',
                severity: 'high',
                description: 'Missing lang attribute on html element',
                location: 'index.html',
                fix: 'Add lang attribute to html element (e.g., <html lang="he">)'
            });
        }
        
        // Check for proper viewport meta tag
        if (!html.includes('viewport')) {
            issues.responsive.push({
                type: 'missing_viewport_meta',
                severity: 'high',
                description: 'Missing viewport meta tag',
                location: 'index.html',
                fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
            });
        }
        
        // Check for alt attributes on images
        const images = html.match(/<img[^>]*>/g);
        if (images) {
            const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
            
            if (imagesWithoutAlt.length > 0) {
                issues.accessibility.push({
                    type: 'missing_alt_attributes',
                    severity: 'high',
                    description: `${imagesWithoutAlt.length} images missing alt attributes`,
                    location: 'index.html',
                    fix: 'Add alt attributes to all images for accessibility'
                });
            }
        }
        
        // Check for proper form labels
        const inputs = html.match(/<input[^>]*>/g);
        if (inputs) {
            const inputsWithoutLabels = inputs.filter(input => 
                !input.includes('aria-label') && !input.includes('aria-labelledby')
            );
            
            if (inputsWithoutLabels.length > 0) {
                issues.accessibility.push({
                    type: 'missing_input_labels',
                    severity: 'high',
                    description: `${inputsWithoutLabels.length} inputs missing labels`,
                    location: 'index.html',
                    fix: 'Add labels or aria-label attributes to all form inputs'
                });
            }
        }
    }
    
    // 3. CHECK PERFORMANCE
    console.log('⚡ CHECKING PERFORMANCE...');
    
    for (const cssFile of cssFiles) {
        const cssPath = path.join(projectRoot, 'public', 'CSS', cssFile);
        if (fs.existsSync(cssPath)) {
            const css = fs.readFileSync(cssPath, 'utf8');
            const fileSize = fs.statSync(cssPath).size;
            
            // Check file size
            if (fileSize > 100000) { // 100KB
                issues.performance.push({
                    type: 'large_css_file',
                    severity: 'medium',
                    description: `CSS file is large (${Math.round(fileSize / 1024)}KB)`,
                    location: `CSS/${cssFile}`,
                    fix: 'Consider splitting large CSS files or removing unused styles'
                });
            }
            
            // Check for unused CSS
            const selectors = css.match(/[.#][a-zA-Z-]+/g);
            if (selectors && selectors.length > 100) {
                issues.performance.push({
                    type: 'potentially_unused_css',
                    severity: 'low',
                    description: `Large number of CSS selectors (${selectors.length}) may indicate unused CSS`,
                    location: `CSS/${cssFile}`,
                    fix: 'Review and remove unused CSS selectors'
                });
            }
        }
    }
    
    // 4. CHECK RESPONSIVE DESIGN
    console.log('📱 CHECKING RESPONSIVE DESIGN...');
    
    for (const cssFile of cssFiles) {
        const cssPath = path.join(projectRoot, 'public', 'CSS', cssFile);
        if (fs.existsSync(cssPath)) {
            const css = fs.readFileSync(cssPath, 'utf8');
            
            // Check for responsive breakpoints
            const mediaQueries = css.match(/@media[^{]+{/g);
            if (mediaQueries) {
                const breakpoints = mediaQueries.map(query => {
                    const match = query.match(/(\d+)px/);
                    return match ? parseInt(match[1]) : 0;
                }).filter(bp => bp > 0);
                
                const uniqueBreakpoints = [...new Set(breakpoints)].sort((a, b) => a - b);
                
                // Check for standard breakpoints
                const standardBreakpoints = [320, 480, 768, 1024, 1200, 1440];
                const nonStandardBreakpoints = uniqueBreakpoints.filter(bp => 
                    !standardBreakpoints.some(std => Math.abs(bp - std) <= 20)
                );
                
                if (nonStandardBreakpoints.length > 2) {
                    issues.responsive.push({
                        type: 'non_standard_breakpoints',
                        severity: 'low',
                        description: `Non-standard breakpoints: ${nonStandardBreakpoints.join(', ')}px`,
                        location: `CSS/${cssFile}`,
                        fix: 'Use standard breakpoints: 320px, 480px, 768px, 1024px, 1200px, 1440px'
                    });
                }
            }
            
            // Check for flexible units
            const fixedUnits = css.match(/\d+px/g);
            const flexibleUnits = css.match(/\d+(?:\.\d+)?(?:em|rem|%|vw|vh)/g);
            
            if (fixedUnits && flexibleUnits) {
                const fixedCount = fixedUnits.length;
                const flexibleCount = flexibleUnits.length;
                
                if (fixedCount > flexibleCount * 2) {
                    issues.responsive.push({
                        type: 'excessive_fixed_units',
                        severity: 'low',
                        description: `Too many fixed units (${fixedCount}) vs flexible units (${flexibleCount})`,
                        location: `CSS/${cssFile}`,
                        fix: 'Use more flexible units (em, rem, %, vw, vh) for better responsiveness'
                    });
                }
            }
        }
    }
    
    // 5. DETECT CRITICAL ISSUES
    console.log('🚨 DETECTING CRITICAL ISSUES...');
    
    const criticalIssues = [
        ...issues.design.filter(issue => issue.severity === 'high'),
        ...issues.aesthetics.filter(issue => issue.severity === 'high'),
        ...issues.accessibility.filter(issue => issue.severity === 'high'),
        ...issues.bestPractices.filter(issue => issue.severity === 'high')
    ];
    
    issues.critical = criticalIssues;
    
    // 6. DISPLAY RESULTS
    console.log('\n📊 DESIGN & AESTHETIC VALIDATION RESULTS');
    console.log('==========================================');
    
    const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);
    const criticalIssuesCount = issues.critical.length;
    const highSeverityIssues = Object.values(issues).flat().filter(issue => issue.severity === 'high').length;
    const mediumSeverityIssues = Object.values(issues).flat().filter(issue => issue.severity === 'medium').length;
    const lowSeverityIssues = Object.values(issues).flat().filter(issue => issue.severity === 'low').length;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`  Total Issues: ${totalIssues}`);
    console.log(`  🔴 Critical: ${criticalIssuesCount}`);
    console.log(`  🔴 High Severity: ${highSeverityIssues}`);
    console.log(`  🟡 Medium Severity: ${mediumSeverityIssues}`);
    console.log(`  🟢 Low Severity: ${lowSeverityIssues}`);
    
    if (totalIssues === 0) {
        console.log('\n✅ No issues detected!');
    } else {
        // Display results by category
        const categories = [
            { name: 'Design Quality', issues: issues.design },
            { name: 'Aesthetic Standards', issues: issues.aesthetics },
            { name: 'Best Practices', issues: issues.bestPractices },
            { name: 'Accessibility', issues: issues.accessibility },
            { name: 'Performance', issues: issues.performance },
            { name: 'Responsive Design', issues: issues.responsive },
            { name: 'Critical Issues', issues: issues.critical }
        ];
        
        for (const category of categories) {
            if (category.issues.length > 0) {
                console.log(`\n🎯 ${category.name.toUpperCase()}:`);
                for (const issue of category.issues) {
                    console.log(`  ${issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'} ${issue.type.toUpperCase().replace(/_/g, ' ')}`);
                    console.log(`    ${issue.description}`);
                    console.log(`    Location: ${issue.location}`);
                    console.log(`    Fix: ${issue.fix}`);
                    console.log('');
                }
            }
        }
    }
    
    // Overall assessment
    console.log('\n🎯 OVERALL ASSESSMENT:');
    if (criticalIssuesCount === 0 && highSeverityIssues === 0) {
        console.log('  ✅ EXCELLENT - Design and aesthetics are production-ready');
    } else if (criticalIssuesCount === 0 && highSeverityIssues <= 2) {
        console.log('  🟡 GOOD - Minor issues need attention');
    } else if (criticalIssuesCount <= 1 && highSeverityIssues <= 5) {
        console.log('  🟠 FAIR - Several issues need attention');
    } else {
        console.log('  🔴 POOR - Major issues need immediate attention');
    }
    
    // 7. CREATE SITE PREVIEW
    console.log('\n🖼️ CREATING SITE PREVIEW...');
    
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Create preview HTML with validation results
        const previewHTML = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design & Aesthetic Validation Preview</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .preview-container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .preview-header { background: #0891b2; color: white; padding: 20px; text-align: center; }
        .preview-content { padding: 20px; }
        .validation-summary { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        .issue-item { background: white; border-left: 4px solid #dc3545; padding: 10px; margin: 10px 0; border-radius: 0 4px 4px 0; }
        .issue-medium { border-left-color: #ffc107; }
        .issue-low { border-left-color: #28a745; }
        .iframe-container { border: 1px solid #dee2e6; border-radius: 4px; overflow: hidden; }
        iframe { width: 100%; height: 600px; border: none; }
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            <h1>🎨 Design & Aesthetic Validation Preview</h1>
            <p>Complete site preview with validation results</p>
        </div>
        <div class="preview-content">
            <div class="validation-summary">
                <h3>📊 Validation Summary</h3>
                <p><strong>Total Issues:</strong> ${totalIssues}</p>
                <p><strong>Critical Issues:</strong> ${criticalIssuesCount}</p>
                <p><strong>High Severity:</strong> ${highSeverityIssues}</p>
                <p><strong>Medium Severity:</strong> ${mediumSeverityIssues}</p>
                <p><strong>Low Severity:</strong> ${lowSeverityIssues}</p>
            </div>
            
            <h3>🚨 Critical Issues</h3>
            ${issues.critical.map(issue => `
                <div class="issue-item">
                    <strong>${issue.type.replace(/_/g, ' ').toUpperCase()}</strong><br>
                    ${issue.description}<br>
                    <small>Location: ${issue.location}</small><br>
                    <small>Fix: ${issue.fix}</small>
                </div>
            `).join('')}
            
            <h3>🖼️ Site Preview</h3>
            <div class="iframe-container">
                <iframe src="index.html" title="Site Preview"></iframe>
            </div>
        </div>
    </div>
</body>
</html>`;
        
        const previewPath = path.join(projectRoot, 'design-aesthetic-preview.html');
        fs.writeFileSync(previewPath, previewHTML);
        
        console.log(`  ✅ Site preview created: ${previewPath}`);
        console.log(`  🌐 Open in browser: file://${previewPath}`);
    }
    
    // Save results
    const resultsPath = path.join(projectRoot, 'design-aesthetic-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(issues, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    console.log('\n🎉 DESIGN & AESTHETIC VALIDATION COMPLETE!');
    
} catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
}
