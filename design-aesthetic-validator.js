/**
 * 🎨 DESIGN & AESTHETIC VALIDATOR
 * 
 * Comprehensive design validation system with extreme emphasis on:
 * - Visual aesthetics and design quality
 * - UI/UX best practices
 * - Cross-browser compatibility
 * - Responsive design perfection
 * - Accessibility standards
 * - Performance optimization
 */

import fs from 'fs';
import path from 'path';

class DesignAestheticValidator {
    constructor() {
        this.projectRoot = process.cwd();
        this.validationResults = {
            design: [],
            aesthetics: [],
            bestPractices: [],
            accessibility: [],
            performance: [],
            responsive: [],
            crossBrowser: [],
            critical: []
        };
        this.designStandards = {
            colorContrast: { min: 4.5, enhanced: 7.0 },
            touchTargets: { min: 44, recommended: 48 },
            fontSizes: { min: 16, recommended: 18 },
            spacing: { min: 8, recommended: 16 },
            borderRadius: { min: 4, recommended: 8 },
            shadows: { min: 2, recommended: 4 },
            animations: { max: 300, recommended: 200 }
        };
    }

    async validateAll() {
        console.log('🎨 DESIGN & AESTHETIC VALIDATOR');
        console.log('================================');
        console.log('');

        try {
            // 1. Design Quality Validation
            await this.validateDesignQuality();
            
            // 2. Aesthetic Standards Validation
            await this.validateAestheticStandards();
            
            // 3. Best Practices Validation
            await this.validateBestPractices();
            
            // 4. Accessibility Validation
            await this.validateAccessibility();
            
            // 5. Performance Validation
            await this.validatePerformance();
            
            // 6. Responsive Design Validation
            await this.validateResponsiveDesign();
            
            // 7. Cross-Browser Compatibility
            await this.validateCrossBrowserCompatibility();
            
            // 8. Critical Issues Detection
            await this.detectCriticalIssues();
            
            // 9. Generate Comprehensive Report
            this.generateComprehensiveReport();
            
            // 10. Create Site Preview
            await this.createSitePreview();
            
            return this.validationResults;
            
        } catch (error) {
            console.error('❌ Validation failed:', error);
            throw error;
        }
    }

    async validateDesignQuality() {
        console.log('🎨 VALIDATING DESIGN QUALITY...');
        
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css', 'dynamic-templates.css'];
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                
                // Check for design consistency
                this.checkDesignConsistency(css, cssFile);
                
                // Check for visual hierarchy
                this.checkVisualHierarchy(css, cssFile);
                
                // Check for color usage
                this.checkColorUsage(css, cssFile);
                
                // Check for typography
                this.checkTypography(css, cssFile);
                
                // Check for spacing
                this.checkSpacing(css, cssFile);
                
                // Check for shadows and effects
                this.checkShadowsAndEffects(css, cssFile);
            }
        }
    }

    checkDesignConsistency(css, file) {
        // Check for consistent border radius
        const borderRadiusValues = css.match(/border-radius:\s*(\d+)px/g);
        if (borderRadiusValues) {
            const values = borderRadiusValues.map(match => parseInt(match.match(/(\d+)px/)[1]));
            const uniqueValues = [...new Set(values)];
            
            if (uniqueValues.length > 3) {
                this.validationResults.design.push({
                    type: 'inconsistent_border_radius',
                    severity: 'medium',
                    description: `Too many different border-radius values (${uniqueValues.length}): ${uniqueValues.join(', ')}px`,
                    location: `CSS/${file}`,
                    fix: 'Standardize border-radius values (recommended: 4px, 8px, 12px)'
                });
            }
        }
        
        // Check for consistent spacing
        const spacingValues = css.match(/margin|padding.*?(\d+)px/g);
        if (spacingValues) {
            const values = spacingValues.map(match => parseInt(match.match(/(\d+)px/)[1]));
            const uniqueValues = [...new Set(values)];
            
            if (uniqueValues.length > 8) {
                this.validationResults.design.push({
                    type: 'inconsistent_spacing',
                    severity: 'medium',
                    description: `Too many different spacing values (${uniqueValues.length}): ${uniqueValues.join(', ')}px`,
                    location: `CSS/${file}`,
                    fix: 'Use consistent spacing scale (8px, 16px, 24px, 32px, 48px, 64px)'
                });
            }
        }
    }

    checkVisualHierarchy(css, file) {
        // Check for proper heading hierarchy
        const headingSizes = css.match(/h[1-6].*?font-size:\s*(\d+)px/g);
        if (headingSizes) {
            const sizes = headingSizes.map(match => parseInt(match.match(/(\d+)px/)[1]));
            
            // Check if sizes create proper hierarchy
            if (sizes.length > 1) {
                const sortedSizes = [...sizes].sort((a, b) => b - a);
                const isHierarchical = sortedSizes.every((size, index) => 
                    index === 0 || size < sortedSizes[index - 1]
                );
                
                if (!isHierarchical) {
                    this.validationResults.design.push({
                        type: 'poor_visual_hierarchy',
                        severity: 'high',
                        description: 'Heading sizes do not create proper visual hierarchy',
                        location: `CSS/${file}`,
                        fix: 'Ensure heading sizes decrease from h1 to h6 (e.g., 32px, 28px, 24px, 20px, 18px, 16px)'
                    });
                }
            }
        }
    }

    checkColorUsage(css, file) {
        // Check for color contrast
        const colorValues = css.match(/color:\s*(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))/g);
        if (colorValues) {
            const colors = colorValues.map(match => match.split(':')[1].trim());
            const uniqueColors = [...new Set(colors)];
            
            if (uniqueColors.length > 10) {
                this.validationResults.aesthetics.push({
                    type: 'too_many_colors',
                    severity: 'medium',
                    description: `Too many different colors (${uniqueColors.length}): ${uniqueColors.slice(0, 5).join(', ')}...`,
                    location: `CSS/${file}`,
                    fix: 'Limit color palette to 5-7 main colors for better consistency'
                });
            }
        }
        
        // Check for hardcoded colors
        const hardcodedColors = css.match(/#[0-9a-fA-F]{6}/g);
        if (hardcodedColors && hardcodedColors.length > 5) {
            this.validationResults.bestPractices.push({
                type: 'hardcoded_colors',
                severity: 'medium',
                description: `Too many hardcoded colors (${hardcodedColors.length})`,
                location: `CSS/${file}`,
                fix: 'Use CSS custom properties (variables) for colors'
            });
        }
    }

    checkTypography(css, file) {
        // Check for font size consistency
        const fontSizes = css.match(/font-size:\s*(\d+)px/g);
        if (fontSizes) {
            const sizes = fontSizes.map(match => parseInt(match.match(/(\d+)px/)[1]));
            const smallSizes = sizes.filter(size => size < 14);
            
            if (smallSizes.length > 0) {
                this.validationResults.accessibility.push({
                    type: 'small_font_sizes',
                    severity: 'high',
                    description: `Font sizes too small for accessibility: ${smallSizes.join(', ')}px`,
                    location: `CSS/${file}`,
                    fix: 'Use minimum 16px font size for body text, 14px minimum for UI elements'
                });
            }
        }
        
        // Check for line height
        const lineHeights = css.match(/line-height:\s*(\d+(?:\.\d+)?)/g);
        if (lineHeights) {
            const heights = lineHeights.map(match => parseFloat(match.match(/(\d+(?:\.\d+)?)/)[1]));
            const poorHeights = heights.filter(height => height < 1.4);
            
            if (poorHeights.length > 0) {
                this.validationResults.accessibility.push({
                    type: 'poor_line_height',
                    severity: 'medium',
                    description: `Line height too tight for readability: ${poorHeights.join(', ')}`,
                    location: `CSS/${file}`,
                    fix: 'Use line-height of 1.4-1.6 for better readability'
                });
            }
        }
    }

    checkSpacing(css, file) {
        // Check for consistent spacing scale
        const spacingValues = css.match(/(?:margin|padding)(?:-top|-right|-bottom|-left)?:\s*(\d+)px/g);
        if (spacingValues) {
            const values = spacingValues.map(match => parseInt(match.match(/(\d+)px/)[1]));
            const uniqueValues = [...new Set(values)];
            
            // Check if values follow a consistent scale
            const recommendedScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
            const nonStandardValues = uniqueValues.filter(value => !recommendedScale.includes(value));
            
            if (nonStandardValues.length > 3) {
                this.validationResults.design.push({
                    type: 'inconsistent_spacing_scale',
                    severity: 'medium',
                    description: `Non-standard spacing values: ${nonStandardValues.join(', ')}px`,
                    location: `CSS/${file}`,
                    fix: 'Use consistent spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px'
                });
            }
        }
    }

    checkShadowsAndEffects(css, file) {
        // Check for consistent shadow usage
        const shadows = css.match(/box-shadow:\s*[^;]+/g);
        if (shadows) {
            const shadowCount = shadows.length;
            
            if (shadowCount > 10) {
                this.validationResults.performance.push({
                    type: 'too_many_shadows',
                    severity: 'low',
                    description: `Too many box-shadows (${shadowCount}) may impact performance`,
                    location: `CSS/${file}`,
                    fix: 'Consider reducing shadow usage or using CSS custom properties'
                });
            }
        }
        
        // Check for consistent border usage
        const borders = css.match(/border(?:-width)?:\s*[^;]+/g);
        if (borders) {
            const borderValues = borders.map(border => border.split(':')[1].trim());
            const uniqueBorders = [...new Set(borderValues)];
            
            if (uniqueBorders.length > 5) {
                this.validationResults.design.push({
                    type: 'inconsistent_borders',
                    severity: 'low',
                    description: `Too many different border styles (${uniqueBorders.length})`,
                    location: `CSS/${file}`,
                    fix: 'Standardize border styles for consistency'
                });
            }
        }
    }

    async validateAestheticStandards() {
        console.log('✨ VALIDATING AESTHETIC STANDARDS...');
        
        const htmlPath = path.join(this.projectRoot, 'public', 'index.html');
        if (fs.existsSync(htmlPath)) {
            const html = fs.readFileSync(htmlPath, 'utf8');
            
            // Check for proper semantic HTML
            this.checkSemanticHTML(html);
            
            // Check for proper structure
            this.checkHTMLStructure(html);
            
            // Check for accessibility attributes
            this.checkAccessibilityAttributes(html);
        }
    }

    checkSemanticHTML(html) {
        // Check for proper heading structure
        const headings = html.match(/<h[1-6][^>]*>/g);
        if (headings) {
            const headingLevels = headings.map(h => parseInt(h.match(/h(\d)/)[1]));
            
            // Check for proper hierarchy
            let currentLevel = 0;
            for (const level of headingLevels) {
                if (level > currentLevel + 1) {
                    this.validationResults.aesthetics.push({
                        type: 'heading_hierarchy_skip',
                        severity: 'high',
                        description: `Heading hierarchy skips from h${currentLevel} to h${level}`,
                        location: 'index.html',
                        fix: 'Ensure heading hierarchy is sequential (h1 → h2 → h3, etc.)'
                    });
                }
                currentLevel = level;
            }
        }
        
        // Check for proper use of semantic elements
        const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
        const missingElements = semanticElements.filter(element => !html.includes(`<${element}`));
        
        if (missingElements.length > 2) {
            this.validationResults.aesthetics.push({
                type: 'missing_semantic_elements',
                severity: 'medium',
                description: `Missing semantic HTML elements: ${missingElements.join(', ')}`,
                location: 'index.html',
                fix: 'Use semantic HTML elements for better structure and accessibility'
            });
        }
    }

    checkHTMLStructure(html) {
        // Check for proper DOCTYPE
        if (!html.includes('<!DOCTYPE html>')) {
            this.validationResults.bestPractices.push({
                type: 'missing_doctype',
                severity: 'high',
                description: 'Missing DOCTYPE declaration',
                location: 'index.html',
                fix: 'Add <!DOCTYPE html> at the beginning of the file'
            });
        }
        
        // Check for proper lang attribute
        if (!html.includes('lang=')) {
            this.validationResults.accessibility.push({
                type: 'missing_lang_attribute',
                severity: 'high',
                description: 'Missing lang attribute on html element',
                location: 'index.html',
                fix: 'Add lang attribute to html element (e.g., <html lang="he">)'
            });
        }
        
        // Check for proper viewport meta tag
        if (!html.includes('viewport')) {
            this.validationResults.responsive.push({
                type: 'missing_viewport_meta',
                severity: 'high',
                description: 'Missing viewport meta tag',
                location: 'index.html',
                fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
            });
        }
    }

    checkAccessibilityAttributes(html) {
        // Check for alt attributes on images
        const images = html.match(/<img[^>]*>/g);
        if (images) {
            const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
            
            if (imagesWithoutAlt.length > 0) {
                this.validationResults.accessibility.push({
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
                this.validationResults.accessibility.push({
                    type: 'missing_input_labels',
                    severity: 'high',
                    description: `${inputsWithoutLabels.length} inputs missing labels`,
                    location: 'index.html',
                    fix: 'Add labels or aria-label attributes to all form inputs'
                });
            }
        }
    }

    async validateBestPractices() {
        console.log('📋 VALIDATING BEST PRACTICES...');
        
        // Check CSS best practices
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css', 'dynamic-templates.css'];
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                
                // Check for CSS custom properties usage
                this.checkCSSCustomProperties(css, cssFile);
                
                // Check for mobile-first approach
                this.checkMobileFirst(css, cssFile);
                
                // Check for performance optimizations
                this.checkPerformanceOptimizations(css, cssFile);
            }
        }
        
        // Check JavaScript best practices
        const jsFiles = ['Main.js', 'ui.js', 'handlers.js', 'utils.js'];
        
        for (const jsFile of jsFiles) {
            const jsPath = path.join(this.projectRoot, 'public', 'js', jsFile);
            if (fs.existsSync(jsPath)) {
                const js = fs.readFileSync(jsPath, 'utf8');
                
                // Check for modern JavaScript practices
                this.checkModernJavaScript(js, jsFile);
                
                // Check for error handling
                this.checkErrorHandling(js, jsFile);
            }
        }
    }

    checkCSSCustomProperties(css, file) {
        const customProperties = css.match(/--[a-zA-Z-]+:/g);
        const hardcodedValues = css.match(/#[0-9a-fA-F]{6}|rgb\([^)]+\)/g);
        
        if (hardcodedValues && hardcodedValues.length > 5 && (!customProperties || customProperties.length < 3)) {
            this.validationResults.bestPractices.push({
                type: 'insufficient_css_variables',
                severity: 'medium',
                description: 'Too many hardcoded values, insufficient CSS custom properties',
                location: `CSS/${file}`,
                fix: 'Use CSS custom properties for colors, spacing, and other repeated values'
            });
        }
    }

    checkMobileFirst(css, file) {
        const mediaQueries = css.match(/@media[^{]+{/g);
        if (mediaQueries) {
            const minWidthQueries = mediaQueries.filter(query => query.includes('min-width'));
            const maxWidthQueries = mediaQueries.filter(query => query.includes('max-width'));
            
            if (minWidthQueries.length > maxWidthQueries.length) {
                this.validationResults.bestPractices.push({
                    type: 'not_mobile_first',
                    severity: 'medium',
                    description: 'CSS appears to use desktop-first approach instead of mobile-first',
                    location: `CSS/${file}`,
                    fix: 'Use mobile-first approach with max-width media queries'
                });
            }
        }
    }

    checkPerformanceOptimizations(css, file) {
        // Check for unused CSS
        const selectors = css.match(/[.#][a-zA-Z-]+/g);
        if (selectors && selectors.length > 100) {
            this.validationResults.performance.push({
                type: 'potentially_unused_css',
                severity: 'low',
                description: `Large number of CSS selectors (${selectors.length}) may indicate unused CSS`,
                location: `CSS/${file}`,
                fix: 'Review and remove unused CSS selectors'
            });
        }
        
        // Check for complex selectors
        const complexSelectors = css.match(/[.#][a-zA-Z-]+\s+[.#][a-zA-Z-]+\s+[.#][a-zA-Z-]+/g);
        if (complexSelectors && complexSelectors.length > 5) {
            this.validationResults.performance.push({
                type: 'complex_css_selectors',
                severity: 'low',
                description: `${complexSelectors.length} complex CSS selectors may impact performance`,
                location: `CSS/${file}`,
                fix: 'Simplify CSS selectors for better performance'
            });
        }
    }

    checkModernJavaScript(js, file) {
        // Check for modern JavaScript features
        const modernFeatures = {
            'const/let': /(?:const|let)\s+\w+/g,
            'arrow functions': /=>/g,
            'template literals': /`[^`]*\${[^}]*}[^`]*`/g,
            'destructuring': /const\s*{\s*\w+/g,
            'async/await': /(?:async|await)/g
        };
        
        const featureCounts = {};
        for (const [feature, regex] of Object.entries(modernFeatures)) {
            const matches = js.match(regex);
            featureCounts[feature] = matches ? matches.length : 0;
        }
        
        const totalModernFeatures = Object.values(featureCounts).reduce((sum, count) => sum + count, 0);
        
        if (totalModernFeatures < 5) {
            this.validationResults.bestPractices.push({
                type: 'insufficient_modern_js',
                severity: 'low',
                description: 'Limited use of modern JavaScript features',
                location: `js/${file}`,
                fix: 'Consider using modern JavaScript features for better code quality'
            });
        }
    }

    checkErrorHandling(js, file) {
        const tryCatchBlocks = js.match(/try\s*{/g);
        const errorHandling = js.match(/catch\s*\(/g);
        
        if (tryCatchBlocks && tryCatchBlocks.length > 0) {
            if (!errorHandling || errorHandling.length < tryCatchBlocks.length) {
                this.validationResults.bestPractices.push({
                    type: 'incomplete_error_handling',
                    severity: 'medium',
                    description: 'Try blocks without corresponding catch blocks',
                    location: `js/${file}`,
                    fix: 'Ensure all try blocks have corresponding catch blocks'
                });
            }
        }
    }

    async validateAccessibility() {
        console.log('♿ VALIDATING ACCESSIBILITY...');
        
        const htmlPath = path.join(this.projectRoot, 'public', 'index.html');
        if (fs.existsSync(htmlPath)) {
            const html = fs.readFileSync(htmlPath, 'utf8');
            
            // Check for ARIA attributes
            this.checkARIAAttributes(html);
            
            // Check for keyboard navigation
            this.checkKeyboardNavigation(html);
            
            // Check for focus management
            this.checkFocusManagement(html);
        }
    }

    checkARIAAttributes(html) {
        // Check for proper ARIA usage
        const interactiveElements = html.match(/<button|<input|<select|<textarea/g);
        const ariaElements = html.match(/aria-[a-zA-Z-]+/g);
        
        if (interactiveElements && interactiveElements.length > 5) {
            if (!ariaElements || ariaElements.length < interactiveElements.length) {
                this.validationResults.accessibility.push({
                    type: 'insufficient_aria_attributes',
                    severity: 'medium',
                    description: 'Interactive elements missing ARIA attributes',
                    location: 'index.html',
                    fix: 'Add appropriate ARIA attributes to interactive elements'
                });
            }
        }
    }

    checkKeyboardNavigation(html) {
        // Check for proper tabindex usage
        const tabindexElements = html.match(/tabindex/g);
        if (tabindexElements) {
            const negativeTabindex = html.match(/tabindex="-1"/g);
            const positiveTabindex = html.match(/tabindex="[1-9]/g);
            
            if (positiveTabindex && positiveTabindex.length > 0) {
                this.validationResults.accessibility.push({
                    type: 'positive_tabindex',
                    severity: 'medium',
                    description: 'Positive tabindex values can break keyboard navigation',
                    location: 'index.html',
                    fix: 'Avoid positive tabindex values, use 0 or -1 instead'
                });
            }
        }
    }

    checkFocusManagement(html) {
        // Check for focus indicators
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css'];
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                
                if (!css.includes(':focus') && !css.includes(':focus-visible')) {
                    this.validationResults.accessibility.push({
                        type: 'missing_focus_indicators',
                        severity: 'high',
                        description: 'Missing focus indicators for keyboard navigation',
                        location: `CSS/${cssFile}`,
                        fix: 'Add focus indicators for all interactive elements'
                    });
                }
            }
        }
    }

    async validatePerformance() {
        console.log('⚡ VALIDATING PERFORMANCE...');
        
        // Check CSS performance
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css', 'dynamic-templates.css'];
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                const fileSize = fs.statSync(cssPath).size;
                
                // Check file size
                if (fileSize > 100000) { // 100KB
                    this.validationResults.performance.push({
                        type: 'large_css_file',
                        severity: 'medium',
                        description: `CSS file is large (${Math.round(fileSize / 1024)}KB)`,
                        location: `CSS/${cssFile}`,
                        fix: 'Consider splitting large CSS files or removing unused styles'
                    });
                }
                
                // Check for expensive CSS properties
                const expensiveProperties = css.match(/box-shadow|filter|transform|opacity/g);
                if (expensiveProperties && expensiveProperties.length > 20) {
                    this.validationResults.performance.push({
                        type: 'expensive_css_properties',
                        severity: 'low',
                        description: `Many expensive CSS properties (${expensiveProperties.length})`,
                        location: `CSS/${cssFile}`,
                        fix: 'Consider reducing use of expensive CSS properties'
                    });
                }
            }
        }
        
        // Check JavaScript performance
        const jsFiles = ['Main.js', 'ui.js', 'handlers.js', 'utils.js'];
        
        for (const jsFile of jsFiles) {
            const jsPath = path.join(this.projectRoot, 'public', 'js', jsFile);
            if (fs.existsSync(jsPath)) {
                const js = fs.readFileSync(jsPath, 'utf8');
                const fileSize = fs.statSync(jsPath).size;
                
                // Check file size
                if (fileSize > 50000) { // 50KB
                    this.validationResults.performance.push({
                        type: 'large_js_file',
                        severity: 'medium',
                        description: `JavaScript file is large (${Math.round(fileSize / 1024)}KB)`,
                        location: `js/${jsFile}`,
                        fix: 'Consider splitting large JavaScript files or removing unused code'
                    });
                }
                
                // Check for performance anti-patterns
                const domQueries = js.match(/document\.(?:getElementById|querySelector|querySelectorAll)/g);
                if (domQueries && domQueries.length > 20) {
                    this.validationResults.performance.push({
                        type: 'excessive_dom_queries',
                        severity: 'low',
                        description: `Many DOM queries (${domQueries.length}) may impact performance`,
                        location: `js/${jsFile}`,
                        fix: 'Cache DOM queries or use event delegation'
                    });
                }
            }
        }
    }

    async validateResponsiveDesign() {
        console.log('📱 VALIDATING RESPONSIVE DESIGN...');
        
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css'];
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                
                // Check for responsive breakpoints
                this.checkResponsiveBreakpoints(css, cssFile);
                
                // Check for flexible units
                this.checkFlexibleUnits(css, cssFile);
                
                // Check for responsive images
                this.checkResponsiveImages(css, cssFile);
            }
        }
    }

    checkResponsiveBreakpoints(css, file) {
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
                this.validationResults.responsive.push({
                    type: 'non_standard_breakpoints',
                    severity: 'low',
                    description: `Non-standard breakpoints: ${nonStandardBreakpoints.join(', ')}px`,
                    location: `CSS/${file}`,
                    fix: 'Use standard breakpoints: 320px, 480px, 768px, 1024px, 1200px, 1440px'
                });
            }
        }
    }

    checkFlexibleUnits(css, file) {
        const fixedUnits = css.match(/\d+px/g);
        const flexibleUnits = css.match(/\d+(?:\.\d+)?(?:em|rem|%|vw|vh)/g);
        
        if (fixedUnits && flexibleUnits) {
            const fixedCount = fixedUnits.length;
            const flexibleCount = flexibleUnits.length;
            
            if (fixedCount > flexibleCount * 2) {
                this.validationResults.responsive.push({
                    type: 'excessive_fixed_units',
                    severity: 'low',
                    description: `Too many fixed units (${fixedCount}) vs flexible units (${flexibleCount})`,
                    location: `CSS/${file}`,
                    fix: 'Use more flexible units (em, rem, %, vw, vh) for better responsiveness'
                });
            }
        }
    }

    checkResponsiveImages(css, file) {
        // Check for responsive image techniques
        const responsiveImageTechniques = [
            /max-width:\s*100%/g,
            /object-fit/g,
            /srcset/g,
            /sizes/g
        ];
        
        const techniqueCount = responsiveImageTechniques.reduce((count, technique) => {
            return count + (css.match(technique) ? 1 : 0);
        }, 0);
        
        if (techniqueCount < 2) {
            this.validationResults.responsive.push({
                type: 'insufficient_responsive_images',
                severity: 'medium',
                description: 'Limited responsive image techniques',
                location: `CSS/${file}`,
                fix: 'Implement responsive image techniques (max-width, object-fit, srcset)'
            });
        }
    }

    async validateCrossBrowserCompatibility() {
        console.log('🌐 VALIDATING CROSS-BROWSER COMPATIBILITY...');
        
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css', 'dynamic-templates.css'];
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                
                // Check for vendor prefixes
                this.checkVendorPrefixes(css, cssFile);
                
                // Check for modern CSS features
                this.checkModernCSSFeatures(css, cssFile);
            }
        }
    }

    checkVendorPrefixes(css, file) {
        const modernProperties = [
            'display: flex',
            'display: grid',
            'transform',
            'transition',
            'animation'
        ];
        
        const missingPrefixes = modernProperties.filter(property => {
            if (css.includes(property)) {
                const propertyName = property.split(':')[0].trim();
                const webkitPrefix = `-webkit-${propertyName}`;
                const mozPrefix = `-moz-${propertyName}`;
                const msPrefix = `-ms-${propertyName}`;
                
                return !css.includes(webkitPrefix) && !css.includes(mozPrefix) && !css.includes(msPrefix);
            }
            return false;
        });
        
        if (missingPrefixes.length > 0) {
            this.validationResults.crossBrowser.push({
                type: 'missing_vendor_prefixes',
                severity: 'low',
                description: `Missing vendor prefixes for: ${missingPrefixes.join(', ')}`,
                location: `CSS/${file}`,
                fix: 'Add vendor prefixes for better cross-browser compatibility'
            });
        }
    }

    checkModernCSSFeatures(css, file) {
        const modernFeatures = [
            'css-grid',
            'flexbox',
            'custom-properties',
            'calc()',
            'clamp()',
            'min()',
            'max()'
        ];
        
        const usedFeatures = modernFeatures.filter(feature => {
            switch (feature) {
                case 'css-grid':
                    return css.includes('display: grid') || css.includes('grid-');
                case 'flexbox':
                    return css.includes('display: flex') || css.includes('flex-');
                case 'custom-properties':
                    return css.includes('--');
                case 'calc()':
                    return css.includes('calc(');
                case 'clamp()':
                    return css.includes('clamp(');
                case 'min()':
                    return css.includes('min(');
                case 'max()':
                    return css.includes('max(');
                default:
                    return false;
            }
        });
        
        if (usedFeatures.length < 2) {
            this.validationResults.crossBrowser.push({
                type: 'limited_modern_css',
                severity: 'low',
                description: 'Limited use of modern CSS features',
                location: `CSS/${file}`,
                fix: 'Consider using more modern CSS features for better functionality'
            });
        }
    }

    async detectCriticalIssues() {
        console.log('🚨 DETECTING CRITICAL ISSUES...');
        
        // Check for critical design issues
        const criticalIssues = [
            ...this.validationResults.design.filter(issue => issue.severity === 'high'),
            ...this.validationResults.aesthetics.filter(issue => issue.severity === 'high'),
            ...this.validationResults.accessibility.filter(issue => issue.severity === 'high'),
            ...this.validationResults.bestPractices.filter(issue => issue.severity === 'high')
        ];
        
        this.validationResults.critical = criticalIssues;
    }

    generateComprehensiveReport() {
        console.log('\n📊 COMPREHENSIVE DESIGN & AESTHETIC REPORT');
        console.log('==========================================');
        
        const totalIssues = Object.values(this.validationResults).reduce((sum, arr) => sum + arr.length, 0);
        const criticalIssues = this.validationResults.critical.length;
        const highSeverityIssues = Object.values(this.validationResults).flat().filter(issue => issue.severity === 'high').length;
        const mediumSeverityIssues = Object.values(this.validationResults).flat().filter(issue => issue.severity === 'medium').length;
        const lowSeverityIssues = Object.values(this.validationResults).flat().filter(issue => issue.severity === 'low').length;
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`  Total Issues: ${totalIssues}`);
        console.log(`  🔴 Critical: ${criticalIssues}`);
        console.log(`  🔴 High Severity: ${highSeverityIssues}`);
        console.log(`  🟡 Medium Severity: ${mediumSeverityIssues}`);
        console.log(`  🟢 Low Severity: ${lowSeverityIssues}`);
        
        // Display results by category
        const categories = [
            { name: 'Design Quality', issues: this.validationResults.design },
            { name: 'Aesthetic Standards', issues: this.validationResults.aesthetics },
            { name: 'Best Practices', issues: this.validationResults.bestPractices },
            { name: 'Accessibility', issues: this.validationResults.accessibility },
            { name: 'Performance', issues: this.validationResults.performance },
            { name: 'Responsive Design', issues: this.validationResults.responsive },
            { name: 'Cross-Browser', issues: this.validationResults.crossBrowser },
            { name: 'Critical Issues', issues: this.validationResults.critical }
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
        
        // Overall assessment
        console.log('\n🎯 OVERALL ASSESSMENT:');
        if (criticalIssues === 0 && highSeverityIssues === 0) {
            console.log('  ✅ EXCELLENT - Design and aesthetics are production-ready');
        } else if (criticalIssues === 0 && highSeverityIssues <= 2) {
            console.log('  🟡 GOOD - Minor issues need attention');
        } else if (criticalIssues <= 1 && highSeverityIssues <= 5) {
            console.log('  🟠 FAIR - Several issues need attention');
        } else {
            console.log('  🔴 POOR - Major issues need immediate attention');
        }
    }

    async createSitePreview() {
        console.log('\n🖼️ CREATING SITE PREVIEW...');
        
        const htmlPath = path.join(this.projectRoot, 'public', 'index.html');
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
                <p><strong>Total Issues:</strong> ${Object.values(this.validationResults).reduce((sum, arr) => sum + arr.length, 0)}</p>
                <p><strong>Critical Issues:</strong> ${this.validationResults.critical.length}</p>
                <p><strong>High Severity:</strong> ${Object.values(this.validationResults).flat().filter(issue => issue.severity === 'high').length}</p>
                <p><strong>Medium Severity:</strong> ${Object.values(this.validationResults).flat().filter(issue => issue.severity === 'medium').length}</p>
                <p><strong>Low Severity:</strong> ${Object.values(this.validationResults).flat().filter(issue => issue.severity === 'low').length}</p>
            </div>
            
            <h3>🚨 Critical Issues</h3>
            ${this.validationResults.critical.map(issue => `
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
            
            const previewPath = path.join(this.projectRoot, 'design-aesthetic-preview.html');
            fs.writeFileSync(previewPath, previewHTML);
            
            console.log(`  ✅ Site preview created: ${previewPath}`);
            console.log(`  🌐 Open in browser: file://${previewPath}`);
        }
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new DesignAestheticValidator();
    
    try {
        const results = await validator.validateAll();
        
        // Save results
        const resultsPath = path.join(validator.projectRoot, 'design-aesthetic-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${resultsPath}`);
        
        const criticalIssues = results.critical.length;
        const highSeverityIssues = Object.values(results).flat().filter(issue => issue.severity === 'high').length;
        
        if (criticalIssues > 0 || highSeverityIssues > 2) {
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error);
        process.exit(1);
    }
}

export default DesignAestheticValidator;
