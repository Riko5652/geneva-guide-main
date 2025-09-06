/**
 * 🔄 TRIPLE VALIDATION SYSTEM
 * 
 * Creates 3 independent validation layers that check each other
 * Ensures bulletproof validation before deployment
 */

import fs from 'fs';
import path from 'path';
import DesignAestheticValidator from './design-aesthetic-validator.js';

class TripleValidationSystem {
    constructor() {
        this.projectRoot = process.cwd();
        this.validationLayers = {
            layer1: null,
            layer2: null,
            layer3: null
        };
        this.crossValidationResults = {
            agreements: [],
            disagreements: [],
            consensus: null
        };
    }

    async runTripleValidation() {
        console.log('🔄 TRIPLE VALIDATION SYSTEM');
        console.log('============================');
        console.log('');

        try {
            // Layer 1: Design & Aesthetic Validator
            console.log('🎨 LAYER 1: Design & Aesthetic Validation');
            console.log('==========================================');
            const layer1Validator = new DesignAestheticValidator();
            this.validationLayers.layer1 = await layer1Validator.validateAll();
            
            // Layer 2: Code Quality Validator
            console.log('\n🔍 LAYER 2: Code Quality Validation');
            console.log('====================================');
            this.validationLayers.layer2 = await this.runCodeQualityValidation();
            
            // Layer 3: Performance & Security Validator
            console.log('\n⚡ LAYER 3: Performance & Security Validation');
            console.log('==============================================');
            this.validationLayers.layer3 = await this.runPerformanceSecurityValidation();
            
            // Cross-validation
            console.log('\n🔄 CROSS-VALIDATION');
            console.log('===================');
            await this.performCrossValidation();
            
            // Generate final report
            this.generateFinalReport();
            
            return {
                layers: this.validationLayers,
                crossValidation: this.crossValidationResults
            };
            
        } catch (error) {
            console.error('❌ Triple validation failed:', error);
            throw error;
        }
    }

    async runCodeQualityValidation() {
        const results = {
            codeStructure: [],
            bestPractices: [],
            maintainability: [],
            documentation: [],
            testing: []
        };

        // Check code structure
        const jsFiles = ['Main.js', 'ui.js', 'handlers.js', 'utils.js', 'Gemini.js'];
        
        for (const jsFile of jsFiles) {
            const jsPath = path.join(this.projectRoot, 'public', 'js', jsFile);
            if (fs.existsSync(jsPath)) {
                const js = fs.readFileSync(jsPath, 'utf8');
                
                // Check for proper function structure
                this.checkFunctionStructure(js, jsFile, results);
                
                // Check for proper class structure
                this.checkClassStructure(js, jsFile, results);
                
                // Check for proper error handling
                this.checkErrorHandling(js, jsFile, results);
                
                // Check for proper documentation
                this.checkDocumentation(js, jsFile, results);
            }
        }

        // Check CSS structure
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css', 'dynamic-templates.css'];
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                
                // Check for CSS organization
                this.checkCSSOrganization(css, cssFile, results);
                
                // Check for CSS best practices
                this.checkCSSBestPractices(css, cssFile, results);
            }
        }

        return results;
    }

    checkFunctionStructure(js, file, results) {
        // Check for function length
        const functions = js.match(/function\s+\w+\([^)]*\)\s*{[\s\S]*?}/g);
        if (functions) {
            const longFunctions = functions.filter(func => {
                const lines = func.split('\n').length;
                return lines > 50;
            });
            
            if (longFunctions.length > 0) {
                results.codeStructure.push({
                    type: 'long_functions',
                    severity: 'medium',
                    description: `${longFunctions.length} functions are too long (>50 lines)`,
                    location: `js/${file}`,
                    fix: 'Break down long functions into smaller, more manageable functions'
                });
            }
        }
        
        // Check for proper parameter count
        const functionParams = js.match(/function\s+\w+\(([^)]*)\)/g);
        if (functionParams) {
            const manyParams = functionParams.filter(params => {
                const paramCount = params.match(/,/g) ? params.match(/,/g).length + 1 : 1;
                return paramCount > 4;
            });
            
            if (manyParams.length > 0) {
                results.codeStructure.push({
                    type: 'too_many_parameters',
                    severity: 'low',
                    description: `${manyParams.length} functions have too many parameters (>4)`,
                    location: `js/${file}`,
                    fix: 'Consider using objects or destructuring for functions with many parameters'
                });
            }
        }
    }

    checkClassStructure(js, file, results) {
        // Check for proper class organization
        const classes = js.match(/class\s+\w+[\s\S]*?}/g);
        if (classes) {
            const largeClasses = classes.filter(cls => {
                const lines = cls.split('\n').length;
                return lines > 100;
            });
            
            if (largeClasses.length > 0) {
                results.codeStructure.push({
                    type: 'large_classes',
                    severity: 'medium',
                    description: `${largeClasses.length} classes are too large (>100 lines)`,
                    location: `js/${file}`,
                    fix: 'Break down large classes into smaller, more focused classes'
                });
            }
        }
    }

    checkErrorHandling(js, file, results) {
        // Check for proper error handling
        const asyncFunctions = js.match(/async\s+function/g);
        const tryCatchBlocks = js.match(/try\s*{/g);
        
        if (asyncFunctions && asyncFunctions.length > 0) {
            if (!tryCatchBlocks || tryCatchBlocks.length < asyncFunctions.length) {
                results.bestPractices.push({
                    type: 'insufficient_error_handling',
                    severity: 'high',
                    description: 'Async functions without proper error handling',
                    location: `js/${file}`,
                    fix: 'Add try-catch blocks or proper error handling for async functions'
                });
            }
        }
    }

    checkDocumentation(js, file, results) {
        // Check for JSDoc comments
        const functions = js.match(/function\s+\w+/g);
        const jsdocComments = js.match(/\/\*\*[\s\S]*?\*\//g);
        
        if (functions && functions.length > 5) {
            if (!jsdocComments || jsdocComments.length < functions.length * 0.5) {
                results.documentation.push({
                    type: 'insufficient_documentation',
                    severity: 'low',
                    description: 'Functions missing JSDoc documentation',
                    location: `js/${file}`,
                    fix: 'Add JSDoc comments to document function parameters and return values'
                });
            }
        }
    }

    checkCSSOrganization(css, file, results) {
        // Check for CSS organization
        const selectors = css.match(/[.#][a-zA-Z-]+/g);
        if (selectors && selectors.length > 50) {
            // Check if CSS is organized in sections
            const sectionComments = css.match(/\/\*[\s\S]*?\*\//g);
            if (!sectionComments || sectionComments.length < 3) {
                results.codeStructure.push({
                    type: 'unorganized_css',
                    severity: 'low',
                    description: 'CSS file lacks organization and section comments',
                    location: `CSS/${file}`,
                    fix: 'Organize CSS into logical sections with comments'
                });
            }
        }
    }

    checkCSSBestPractices(css, file, results) {
        // Check for CSS best practices
        const importantUsage = css.match(/!important/g);
        if (importantUsage && importantUsage.length > 10) {
            results.bestPractices.push({
                type: 'excessive_important',
                severity: 'medium',
                description: `Too many !important declarations (${importantUsage.length})`,
                location: `CSS/${file}`,
                fix: 'Reduce use of !important, improve CSS specificity instead'
            });
        }
        
        // Check for inline styles
        const inlineStyles = css.match(/style\s*=/g);
        if (inlineStyles && inlineStyles.length > 0) {
            results.bestPractices.push({
                type: 'inline_styles',
                severity: 'low',
                description: `${inlineStyles.length} inline styles found`,
                location: `CSS/${file}`,
                fix: 'Move inline styles to CSS classes'
            });
        }
    }

    async runPerformanceSecurityValidation() {
        const results = {
            performance: [],
            security: [],
            optimization: [],
            caching: []
        };

        // Check performance
        await this.checkPerformance(results);
        
        // Check security
        await this.checkSecurity(results);
        
        // Check optimization
        await this.checkOptimization(results);
        
        // Check caching
        await this.checkCaching(results);

        return results;
    }

    async checkPerformance(results) {
        // Check file sizes
        const files = [
            'public/index.html',
            'public/CSS/style.css',
            'public/CSS/device-responsive.css',
            'public/CSS/flow-enhancements.css',
            'public/CSS/dynamic-templates.css',
            'public/js/Main.js',
            'public/js/ui.js',
            'public/js/handlers.js'
        ];

        for (const file of files) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                const sizeKB = Math.round(stats.size / 1024);
                
                if (sizeKB > 100) {
                    results.performance.push({
                        type: 'large_file_size',
                        severity: 'medium',
                        description: `File is large (${sizeKB}KB): ${file}`,
                        location: file,
                        fix: 'Consider minification, compression, or code splitting'
                    });
                }
            }
        }
    }

    async checkSecurity(results) {
        // Check for security issues
        const htmlPath = path.join(this.projectRoot, 'public', 'index.html');
        if (fs.existsSync(htmlPath)) {
            const html = fs.readFileSync(htmlPath, 'utf8');
            
            // Check for inline scripts
            const inlineScripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/g);
            if (inlineScripts && inlineScripts.length > 0) {
                results.security.push({
                    type: 'inline_scripts',
                    severity: 'medium',
                    description: `${inlineScripts.length} inline scripts found`,
                    location: 'index.html',
                    fix: 'Move inline scripts to external files for better security'
                });
            }
            
            // Check for external resources
            const externalResources = html.match(/https?:\/\/[^"'\s]+/g);
            if (externalResources && externalResources.length > 0) {
                results.security.push({
                    type: 'external_resources',
                    severity: 'low',
                    description: `${externalResources.length} external resources loaded`,
                    location: 'index.html',
                    fix: 'Consider using subresource integrity for external resources'
                });
            }
        }
    }

    async checkOptimization(results) {
        // Check for optimization opportunities
        const cssFiles = ['style.css', 'device-responsive.css', 'flow-enhancements.css', 'dynamic-templates.css'];
        
        for (const cssFile of cssFiles) {
            const cssPath = path.join(this.projectRoot, 'public', 'CSS', cssFile);
            if (fs.existsSync(cssPath)) {
                const css = fs.readFileSync(cssPath, 'utf8');
                
                // Check for unused CSS
                const selectors = css.match(/[.#][a-zA-Z-]+/g);
                if (selectors && selectors.length > 100) {
                    results.optimization.push({
                        type: 'potentially_unused_css',
                        severity: 'low',
                        description: `Large number of selectors (${selectors.length}) in ${cssFile}`,
                        location: `CSS/${cssFile}`,
                        fix: 'Review and remove unused CSS selectors'
                    });
                }
            }
        }
    }

    async checkCaching(results) {
        // Check cache manifest
        const manifestPath = path.join(this.projectRoot, 'public', 'cache-manifest.json');
        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            // Check for cache version consistency
            const files = Object.keys(manifest.files);
            const versions = Object.values(manifest.files);
            const uniqueVersions = [...new Set(versions)];
            
            if (uniqueVersions.length > 1) {
                results.caching.push({
                    type: 'inconsistent_cache_versions',
                    severity: 'high',
                    description: `Inconsistent cache versions: ${uniqueVersions.length} different versions`,
                    location: 'cache-manifest.json',
                    fix: 'Synchronize all cache versions to the same timestamp'
                });
            }
        }
    }

    async performCrossValidation() {
        // Compare results from all three layers
        const layer1Issues = this.getAllIssues(this.validationLayers.layer1);
        const layer2Issues = this.getAllIssues(this.validationLayers.layer2);
        const layer3Issues = this.getAllIssues(this.validationLayers.layer3);
        
        // Find agreements
        const agreements = this.findAgreements(layer1Issues, layer2Issues, layer3Issues);
        this.crossValidationResults.agreements = agreements;
        
        // Find disagreements
        const disagreements = this.findDisagreements(layer1Issues, layer2Issues, layer3Issues);
        this.crossValidationResults.disagreements = disagreements;
        
        // Determine consensus
        this.crossValidationResults.consensus = this.determineConsensus(agreements, disagreements);
        
        console.log(`  ✅ Agreements: ${agreements.length}`);
        console.log(`  ⚠️ Disagreements: ${disagreements.length}`);
        console.log(`  🎯 Consensus: ${this.crossValidationResults.consensus}`);
    }

    getAllIssues(layer) {
        if (!layer) return [];
        
        const issues = [];
        for (const category of Object.values(layer)) {
            if (Array.isArray(category)) {
                issues.push(...category);
            }
        }
        return issues;
    }

    findAgreements(layer1, layer2, layer3) {
        const agreements = [];
        
        // Find issues that appear in at least 2 layers
        const allIssues = [...layer1, ...layer2, ...layer3];
        const issueCounts = {};
        
        for (const issue of allIssues) {
            const key = `${issue.type}-${issue.location}`;
            issueCounts[key] = (issueCounts[key] || 0) + 1;
        }
        
        for (const [key, count] of Object.entries(issueCounts)) {
            if (count >= 2) {
                const [type, location] = key.split('-');
                agreements.push({ type, location, agreementCount: count });
            }
        }
        
        return agreements;
    }

    findDisagreements(layer1, layer2, layer3) {
        const disagreements = [];
        
        // Find issues that appear in only 1 layer
        const allIssues = [...layer1, ...layer2, ...layer3];
        const issueCounts = {};
        
        for (const issue of allIssues) {
            const key = `${issue.type}-${issue.location}`;
            issueCounts[key] = (issueCounts[key] || 0) + 1;
        }
        
        for (const [key, count] of Object.entries(issueCounts)) {
            if (count === 1) {
                const [type, location] = key.split('-');
                disagreements.push({ type, location, layer: 'single' });
            }
        }
        
        return disagreements;
    }

    determineConsensus(agreements, disagreements) {
        const totalIssues = agreements.length + disagreements.length;
        
        if (totalIssues === 0) {
            return 'EXCELLENT';
        }
        
        const agreementRatio = agreements.length / totalIssues;
        
        if (agreementRatio >= 0.8) {
            return 'HIGH_CONSENSUS';
        } else if (agreementRatio >= 0.6) {
            return 'MODERATE_CONSENSUS';
        } else if (agreementRatio >= 0.4) {
            return 'LOW_CONSENSUS';
        } else {
            return 'POOR_CONSENSUS';
        }
    }

    generateFinalReport() {
        console.log('\n📊 FINAL TRIPLE VALIDATION REPORT');
        console.log('==================================');
        
        const totalIssues = Object.values(this.validationLayers).reduce((sum, layer) => {
            return sum + this.getAllIssues(layer).length;
        }, 0);
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`  Total Issues Found: ${totalIssues}`);
        console.log(`  Layer 1 (Design): ${this.getAllIssues(this.validationLayers.layer1).length}`);
        console.log(`  Layer 2 (Code Quality): ${this.getAllIssues(this.validationLayers.layer2).length}`);
        console.log(`  Layer 3 (Performance/Security): ${this.getAllIssues(this.validationLayers.layer3).length}`);
        
        console.log(`\n🔄 CROSS-VALIDATION:`);
        console.log(`  Agreements: ${this.crossValidationResults.agreements.length}`);
        console.log(`  Disagreements: ${this.crossValidationResults.disagreements.length}`);
        console.log(`  Consensus: ${this.crossValidationResults.consensus}`);
        
        // Overall assessment
        console.log(`\n🎯 OVERALL ASSESSMENT:`);
        if (this.crossValidationResults.consensus === 'EXCELLENT') {
            console.log('  ✅ EXCELLENT - All validation layers agree, ready for deployment');
        } else if (this.crossValidationResults.consensus === 'HIGH_CONSENSUS') {
            console.log('  🟡 GOOD - High consensus, minor issues to address');
        } else if (this.crossValidationResults.consensus === 'MODERATE_CONSENSUS') {
            console.log('  🟠 FAIR - Moderate consensus, several issues to address');
        } else {
            console.log('  🔴 POOR - Low consensus, major issues need attention');
        }
        
        // Deployment recommendation
        console.log(`\n🚀 DEPLOYMENT RECOMMENDATION:`);
        if (this.crossValidationResults.consensus === 'EXCELLENT' || this.crossValidationResults.consensus === 'HIGH_CONSENSUS') {
            console.log('  ✅ APPROVED - Safe to deploy');
        } else {
            console.log('  ❌ NOT APPROVED - Address issues before deployment');
        }
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new TripleValidationSystem();
    
    try {
        const results = await validator.runTripleValidation();
        
        // Save results
        const resultsPath = path.join(validator.projectRoot, 'triple-validation-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${resultsPath}`);
        
        // Exit with appropriate code
        if (results.crossValidation.consensus === 'EXCELLENT' || results.crossValidation.consensus === 'HIGH_CONSENSUS') {
            process.exit(0);
        } else {
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Triple validation failed:', error);
        process.exit(1);
    }
}

export default TripleValidationSystem;
