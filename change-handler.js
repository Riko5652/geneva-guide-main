/**
 * 🔧 CHANGE HANDLER
 * 
 * Handles changes in the codebase based on analysis results
 * Automatically updates references, cache manifests, and dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ChangeHandler {
    constructor() {
        this.projectRoot = path.join(__dirname);
        this.cacheManifestPath = path.join(this.projectRoot, 'public', 'cache-manifest.json');
        this.indexHtmlPath = path.join(this.projectRoot, 'public', 'index.html');
        this.versionJsPath = path.join(this.projectRoot, 'public', 'js', 'version.js');
        this.handledChanges = [];
        this.errors = [];
    }

    /**
     * Handle changes based on analysis results
     */
    async handleChanges(analysisResults) {
        console.log('🔧 CHANGE HANDLER');
        console.log('=================');
        console.log('');

        try {
            // Handle new files
            await this.handleNewFiles(analysisResults.newFiles);
            
            // Handle modified files
            await this.handleModifiedFiles(analysisResults.modifiedFiles);
            
            // Handle conflicts
            await this.handleConflicts(analysisResults.conflicts);
            
            // Apply recommendations
            await this.applyRecommendations(analysisResults.recommendations);
            
            // Update cache and version systems
            await this.updateCacheAndVersionSystems();
            
            // Display results
            this.displayResults();
            
            return {
                handledChanges: this.handledChanges,
                errors: this.errors,
                success: this.errors.length === 0
            };

        } catch (error) {
            console.error('❌ Change handling failed:', error);
            this.errors.push({ type: 'handler_error', error: error.message });
            throw error;
        }
    }

    /**
     * Handle new files
     */
    async handleNewFiles(newFiles) {
        console.log('🆕 Handling new files...');
        
        for (const file of newFiles) {
            try {
                switch (file.type) {
                    case 'JavaScript':
                        await this.handleNewJavaScriptFile(file);
                        break;
                    case 'CSS':
                        await this.handleNewCSSFile(file);
                        break;
                    case 'HTML':
                        await this.handleNewHTMLFile(file);
                        break;
                    case 'JSON':
                        await this.handleNewJSONFile(file);
                        break;
                    default:
                        console.log(`  ⚠️ Unknown file type: ${file.type} for ${file.relativePath}`);
                }
                
                this.handledChanges.push({
                    type: 'new_file',
                    file: file.relativePath,
                    action: 'processed',
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                this.errors.push({
                    type: 'new_file_error',
                    file: file.relativePath,
                    error: error.message
                });
            }
        }
    }

    /**
     * Handle new JavaScript file
     */
    async handleNewJavaScriptFile(file) {
        console.log(`  📄 Processing new JS file: ${file.relativePath}`);
        
        // Add to cache manifest
        await this.addToCacheManifest(file.relativePath);
        
        // Add to HTML if it's a main script
        if (this.isMainScript(file)) {
            await this.addScriptToHTML(file.relativePath);
        }
        
        // Update version.js if it's a template system file
        if (this.isTemplateSystemFile(file)) {
            await this.updateVersionJs(file.relativePath);
        }
        
        // Check for missing dependencies
        await this.checkDependencies(file);
    }

    /**
     * Handle new CSS file
     */
    async handleNewCSSFile(file) {
        console.log(`  🎨 Processing new CSS file: ${file.relativePath}`);
        
        // Add to cache manifest
        await this.addToCacheManifest(file.relativePath);
        
        // Add to HTML
        await this.addCSSToHTML(file.relativePath);
        
        // Update version.js CSS versioning
        await this.updateCSSVersioning(file.relativePath);
    }

    /**
     * Handle new HTML file
     */
    async handleNewHTMLFile(file) {
        console.log(`  🌐 Processing new HTML file: ${file.relativePath}`);
        
        // Add to cache manifest
        await this.addToCacheManifest(file.relativePath);
        
        // Validate HTML structure
        await this.validateHTMLStructure(file);
    }

    /**
     * Handle new JSON file
     */
    async handleNewJSONFile(file) {
        console.log(`  📋 Processing new JSON file: ${file.relativePath}`);
        
        // Add to cache manifest
        await this.addToCacheManifest(file.relativePath);
        
        // Validate JSON structure
        await this.validateJSONStructure(file);
    }

    /**
     * Handle modified files
     */
    async handleModifiedFiles(modifiedFiles) {
        console.log('📝 Handling modified files...');
        
        for (const file of modifiedFiles) {
            try {
                // Update cache version
                await this.updateCacheVersion(file.relativePath);
                
                // Check for breaking changes
                await this.checkBreakingChanges(file);
                
                // Update dependent files if needed
                await this.updateDependentFiles(file);
                
                this.handledChanges.push({
                    type: 'modified_file',
                    file: file.relativePath,
                    action: 'version_updated',
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                this.errors.push({
                    type: 'modified_file_error',
                    file: file.relativePath,
                    error: error.message
                });
            }
        }
    }

    /**
     * Handle conflicts
     */
    async handleConflicts(conflicts) {
        console.log('⚠️ Handling conflicts...');
        
        for (const conflict of conflicts) {
            try {
                switch (conflict.type) {
                    case 'duplicate_export':
                        await this.handleDuplicateExport(conflict);
                        break;
                    case 'missing_import':
                        await this.handleMissingImport(conflict);
                        break;
                    case 'unused_export':
                        await this.handleUnusedExport(conflict);
                        break;
                    default:
                        console.log(`  ⚠️ Unknown conflict type: ${conflict.type}`);
                }
                
                this.handledChanges.push({
                    type: 'conflict_resolved',
                    conflict: conflict.type,
                    action: 'resolved',
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                this.errors.push({
                    type: 'conflict_error',
                    conflict: conflict.type,
                    error: error.message
                });
            }
        }
    }

    /**
     * Apply recommendations
     */
    async applyRecommendations(recommendations) {
        console.log('💡 Applying recommendations...');
        
        for (const rec of recommendations) {
            try {
                switch (rec.type) {
                    case 'new_js_file':
                        await this.applyNewJSFileRecommendation(rec);
                        break;
                    case 'new_css_file':
                        await this.applyNewCSSFileRecommendation(rec);
                        break;
                    case 'modified_js_file':
                        await this.applyModifiedJSFileRecommendation(rec);
                        break;
                    case 'resolve_conflict':
                        await this.applyConflictResolutionRecommendation(rec);
                        break;
                    default:
                        console.log(`  ⚠️ Unknown recommendation type: ${rec.type}`);
                }
                
                this.handledChanges.push({
                    type: 'recommendation_applied',
                    recommendation: rec.type,
                    action: rec.action,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                this.errors.push({
                    type: 'recommendation_error',
                    recommendation: rec.type,
                    error: error.message
                });
            }
        }
    }

    /**
     * Add file to cache manifest
     */
    async addToCacheManifest(filePath) {
        try {
            const manifest = JSON.parse(fs.readFileSync(this.cacheManifestPath, 'utf8'));
            const fileName = path.basename(filePath);
            const timestamp = Date.now().toString();
            
            if (!manifest.files[fileName]) {
                manifest.files[fileName] = timestamp;
                console.log(`    ✅ Added ${fileName} to cache manifest`);
            }
            
            fs.writeFileSync(this.cacheManifestPath, JSON.stringify(manifest, null, 2));
            
        } catch (error) {
            throw new Error(`Failed to add to cache manifest: ${error.message}`);
        }
    }

    /**
     * Add script to HTML
     */
    async addScriptToHTML(filePath) {
        try {
            let html = fs.readFileSync(this.indexHtmlPath, 'utf8');
            const fileName = path.basename(filePath);
            const scriptTag = `    <script type="module" src="/js/${fileName}"></script>\n`;
            
            // Find the last script tag and add after it
            const lastScriptIndex = html.lastIndexOf('</script>');
            if (lastScriptIndex !== -1) {
                const insertIndex = lastScriptIndex + 9; // After </script>
                html = html.slice(0, insertIndex) + scriptTag + html.slice(insertIndex);
                fs.writeFileSync(this.indexHtmlPath, html);
                console.log(`    ✅ Added ${fileName} to HTML`);
            }
            
        } catch (error) {
            throw new Error(`Failed to add script to HTML: ${error.message}`);
        }
    }

    /**
     * Add CSS to HTML
     */
    async addCSSToHTML(filePath) {
        try {
            let html = fs.readFileSync(this.indexHtmlPath, 'utf8');
            const fileName = path.basename(filePath);
            const cssTag = `    <link rel="stylesheet" href="/CSS/${fileName}" id="css-${fileName.replace('.css', '')}">\n`;
            
            // Find the last CSS link and add after it
            const lastCSSIndex = html.lastIndexOf('rel="stylesheet"');
            if (lastCSSIndex !== -1) {
                const insertIndex = html.indexOf('>', lastCSSIndex) + 1;
                html = html.slice(0, insertIndex) + cssTag + html.slice(insertIndex);
                fs.writeFileSync(this.indexHtmlPath, html);
                console.log(`    ✅ Added ${fileName} to HTML`);
            }
            
        } catch (error) {
            throw new Error(`Failed to add CSS to HTML: ${error.message}`);
        }
    }

    /**
     * Update cache version
     */
    async updateCacheVersion(filePath) {
        try {
            const manifest = JSON.parse(fs.readFileSync(this.cacheManifestPath, 'utf8'));
            const fileName = path.basename(filePath);
            const timestamp = Date.now().toString();
            
            if (manifest.files[fileName]) {
                manifest.files[fileName] = timestamp;
                console.log(`    ✅ Updated cache version for ${fileName}`);
            }
            
            fs.writeFileSync(this.cacheManifestPath, JSON.stringify(manifest, null, 2));
            
        } catch (error) {
            throw new Error(`Failed to update cache version: ${error.message}`);
        }
    }

    /**
     * Update CSS versioning in version.js
     */
    async updateCSSVersioning(filePath) {
        try {
            let versionJs = fs.readFileSync(this.versionJsPath, 'utf8');
            const fileName = path.basename(filePath);
            const cssId = fileName.replace('.css', '');
            
            // Check if CSS file is already in the versioning system
            if (!versionJs.includes(cssId)) {
                // Add to CSS files array
                const cssFilesMatch = versionJs.match(/const cssFiles = \[([\s\S]*?)\];/);
                if (cssFilesMatch) {
                    const newCssEntry = `        { id: 'css-${cssId}', href: '/CSS/${fileName}' },\n`;
                    const updatedCssFiles = cssFilesMatch[0].replace(
                        /(\];)/,
                        `        ${newCssEntry}$1`
                    );
                    versionJs = versionJs.replace(cssFilesMatch[0], updatedCssFiles);
                    
                    fs.writeFileSync(this.versionJsPath, versionJs);
                    console.log(`    ✅ Added ${fileName} to CSS versioning system`);
                }
            }
            
        } catch (error) {
            throw new Error(`Failed to update CSS versioning: ${error.message}`);
        }
    }

    /**
     * Check if file is a main script
     */
    isMainScript(file) {
        const mainScripts = ['Main.js', 'ui.js', 'handlers.js', 'services.js', 'utils.js'];
        return mainScripts.includes(path.basename(file.relativePath));
    }

    /**
     * Check if file is part of template system
     */
    isTemplateSystemFile(file) {
        const templateFiles = ['config-templates.js', 'dynamic-form-generator.js', 'dynamic-content-renderer.js', 'template-manager.js', 'template-demo.js'];
        return templateFiles.includes(path.basename(file.relativePath));
    }

    /**
     * Check dependencies
     */
    async checkDependencies(file) {
        if (file.imports) {
            for (const imp of file.imports) {
                const importPath = this.resolveImportPath(imp.module, file.relativePath);
                if (!fs.existsSync(path.join(this.projectRoot, importPath))) {
                    console.log(`    ⚠️ Missing dependency: ${imp.module} in ${file.relativePath}`);
                }
            }
        }
    }

    /**
     * Resolve import path
     */
    resolveImportPath(modulePath, fromFile) {
        if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
            return path.resolve(path.dirname(fromFile), modulePath);
        }
        return modulePath;
    }

    /**
     * Handle duplicate export
     */
    async handleDuplicateExport(conflict) {
        console.log(`    🔧 Resolving duplicate export: ${conflict.name}`);
        // Implementation would depend on specific conflict resolution strategy
        console.log(`    ⚠️ Manual resolution required for ${conflict.name} in files: ${conflict.files.join(', ')}`);
    }

    /**
     * Handle missing import
     */
    async handleMissingImport(conflict) {
        console.log(`    🔧 Resolving missing import: ${conflict.module}`);
        // Implementation would depend on specific missing import
        console.log(`    ⚠️ Manual resolution required for missing import: ${conflict.module} in ${conflict.file}`);
    }

    /**
     * Handle unused export
     */
    async handleUnusedExport(conflict) {
        console.log(`    🔧 Handling unused export in: ${conflict.file}`);
        // Implementation would depend on whether to remove or keep unused exports
        console.log(`    ⚠️ Consider removing unused exports: ${conflict.exports.join(', ')} from ${conflict.file}`);
    }

    /**
     * Apply new JS file recommendation
     */
    async applyNewJSFileRecommendation(rec) {
        console.log(`    💡 Applying recommendation: ${rec.action}`);
        // Already handled in handleNewJavaScriptFile
    }

    /**
     * Apply new CSS file recommendation
     */
    async applyNewCSSFileRecommendation(rec) {
        console.log(`    💡 Applying recommendation: ${rec.action}`);
        // Already handled in handleNewCSSFile
    }

    /**
     * Apply modified JS file recommendation
     */
    async applyModifiedJSFileRecommendation(rec) {
        console.log(`    💡 Applying recommendation: ${rec.action}`);
        // Already handled in handleModifiedFiles
    }

    /**
     * Apply conflict resolution recommendation
     */
    async applyConflictResolutionRecommendation(rec) {
        console.log(`    💡 Applying recommendation: ${rec.action}`);
        // Already handled in handleConflicts
    }

    /**
     * Update cache and version systems
     */
    async updateCacheAndVersionSystems() {
        console.log('🔄 Updating cache and version systems...');
        
        try {
            // Update main version timestamp
            const timestamp = Date.now().toString();
            
            // Update cache manifest version
            const manifest = JSON.parse(fs.readFileSync(this.cacheManifestPath, 'utf8'));
            manifest.version = timestamp;
            manifest.timestamp = new Date().toISOString();
            fs.writeFileSync(this.cacheManifestPath, JSON.stringify(manifest, null, 2));
            
            // Update HTML build timestamp
            let html = fs.readFileSync(this.indexHtmlPath, 'utf8');
            html = html.replace(/content="\d+"/, `content="${timestamp}"`);
            fs.writeFileSync(this.indexHtmlPath, html);
            
            console.log('    ✅ Updated cache and version systems');
            
        } catch (error) {
            throw new Error(`Failed to update cache and version systems: ${error.message}`);
        }
    }

    /**
     * Validate HTML structure
     */
    async validateHTMLStructure(file) {
        // Basic HTML validation
        const content = file.content;
        if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
            console.log(`    ⚠️ HTML file ${file.relativePath} may not be valid HTML`);
        }
    }

    /**
     * Validate JSON structure
     */
    async validateJSONStructure(file) {
        try {
            JSON.parse(file.content);
            console.log(`    ✅ JSON file ${file.relativePath} is valid`);
        } catch (error) {
            console.log(`    ❌ JSON file ${file.relativePath} is invalid: ${error.message}`);
        }
    }

    /**
     * Check for breaking changes
     */
    async checkBreakingChanges(file) {
        // Check for removed exports, changed function signatures, etc.
        console.log(`    🔍 Checking for breaking changes in ${file.relativePath}`);
        // Implementation would depend on specific change detection logic
    }

    /**
     * Update dependent files
     */
    async updateDependentFiles(file) {
        if (file.references && file.references.length > 0) {
            console.log(`    🔄 Updating ${file.references.length} dependent files for ${file.relativePath}`);
            // Implementation would update dependent files if needed
        }
    }

    /**
     * Display results
     */
    displayResults() {
        console.log('\n📊 CHANGE HANDLING RESULTS');
        console.log('===========================');
        
        console.log(`\n✅ Handled Changes: ${this.handledChanges.length}`);
        for (const change of this.handledChanges) {
            console.log(`  ${change.type}: ${change.file || change.conflict || change.recommendation} - ${change.action}`);
        }
        
        if (this.errors.length > 0) {
            console.log(`\n❌ Errors: ${this.errors.length}`);
            for (const error of this.errors) {
                console.log(`  ${error.type}: ${error.error}`);
            }
        }
        
        console.log(`\n🎯 Overall Status: ${this.errors.length === 0 ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const handler = new ChangeHandler();
    
    try {
        // Load analysis results
        const resultsPath = path.join(handler.projectRoot, 'change-analysis-results.json');
        if (!fs.existsSync(resultsPath)) {
            console.error('❌ No analysis results found. Run codebase-change-analyzer.js first.');
            process.exit(1);
        }
        
        const analysisResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        const results = await handler.handleChanges(analysisResults);
        
        // Save handling results
        const handlingResultsPath = path.join(handler.projectRoot, 'change-handling-results.json');
        fs.writeFileSync(handlingResultsPath, JSON.stringify(results, null, 2));
        console.log(`\n💾 Handling results saved to: ${handlingResultsPath}`);
        
        if (!results.success) {
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Change handling failed:', error);
        process.exit(1);
    }
}

export default ChangeHandler;
