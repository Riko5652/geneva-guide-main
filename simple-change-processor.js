/**
 * 🔧 SIMPLE CHANGE PROCESSOR
 * 
 * Simplified version that works with the current project structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleChangeProcessor {
    constructor() {
        this.projectRoot = __dirname;
        this.results = {
            newFiles: [],
            modifiedFiles: [],
            recommendations: []
        };
    }

    async processChanges() {
        console.log('🔧 SIMPLE CHANGE PROCESSOR');
        console.log('==========================');
        console.log('');

        try {
            // Get all files in public directory
            const publicDir = path.join(this.projectRoot, 'public');
            const files = this.getFilesRecursively(publicDir);
            
            // Filter recent files
            const recentFiles = this.filterRecentFiles(files);
            
            // Analyze files
            for (const file of recentFiles) {
                await this.analyzeFile(file);
            }
            
            // Generate recommendations
            this.generateRecommendations();
            
            // Display results
            this.displayResults();
            
            // Handle changes
            await this.handleChanges();
            
            return this.results;
            
        } catch (error) {
            console.error('❌ Processing failed:', error);
            throw error;
        }
    }

    getFilesRecursively(dirPath) {
        const files = [];
        
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    const subFiles = this.getFilesRecursively(fullPath);
                    files.push(...subFiles);
                } else if (stat.isFile()) {
                    files.push({
                        path: fullPath,
                        relativePath: path.relative(this.projectRoot, fullPath),
                        name: item,
                        extension: path.extname(item).slice(1),
                        size: stat.size,
                        created: stat.birthtime,
                        modified: stat.mtime
                    });
                }
            }
        } catch (error) {
            console.warn(`⚠️ Could not read directory ${dirPath}:`, error.message);
        }
        
        return files;
    }

    filterRecentFiles(files) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        return files.filter(file => {
            return file.created >= oneDayAgo || file.modified >= oneDayAgo;
        });
    }

    async analyzeFile(file) {
        console.log(`📄 Analyzing: ${file.relativePath}`);
        
        const fileInfo = {
            ...file,
            isNew: file.created >= new Date(Date.now() - 24 * 60 * 60 * 1000),
            isModified: file.modified >= new Date(Date.now() - 24 * 60 * 60 * 1000),
            content: null,
            exports: [],
            imports: [],
            functions: [],
            classes: []
        };

        // Read file content
        try {
            fileInfo.content = fs.readFileSync(file.path, 'utf8');
        } catch (error) {
            console.warn(`⚠️ Could not read file ${file.relativePath}:`, error.message);
            return;
        }

        // Analyze based on file type
        if (file.extension === 'js') {
            this.analyzeJavaScriptFile(fileInfo);
        }

        // Categorize file
        if (fileInfo.isNew) {
            this.results.newFiles.push(fileInfo);
        } else if (fileInfo.isModified) {
            this.results.modifiedFiles.push(fileInfo);
        }
    }

    analyzeJavaScriptFile(fileInfo) {
        const content = fileInfo.content;

        // Find exports
        const exportMatches = content.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g);
        if (exportMatches) {
            fileInfo.exports = exportMatches.map(match => {
                const name = match.match(/(?:function|class|const|let|var)\s+(\w+)/)[1];
                return { name, type: this.getExportType(match) };
            });
        }

        // Find imports
        const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
        if (importMatches) {
            fileInfo.imports = importMatches.map(match => {
                const module = match.match(/from\s+['"]([^'"]+)['"]/)[1];
                return { module, type: 'module' };
            });
        }

        // Find functions
        const functionMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g);
        if (functionMatches) {
            fileInfo.functions = functionMatches.map(match => {
                const name = match.match(/function\s+(\w+)/)[1];
                return { name, type: 'function' };
            });
        }

        // Find classes
        const classMatches = content.match(/(?:export\s+)?class\s+(\w+)/g);
        if (classMatches) {
            fileInfo.classes = classMatches.map(match => {
                const name = match.match(/class\s+(\w+)/)[1];
                return { name, type: 'class' };
            });
        }
    }

    getExportType(exportMatch) {
        if (exportMatch.includes('default')) return 'default';
        if (exportMatch.includes('function')) return 'function';
        if (exportMatch.includes('class')) return 'class';
        if (exportMatch.includes('const') || exportMatch.includes('let') || exportMatch.includes('var')) return 'variable';
        return 'unknown';
    }

    generateRecommendations() {
        console.log('\n💡 Generating recommendations...');

        // Recommendations for new files
        for (const file of this.results.newFiles) {
            if (file.extension === 'js') {
                this.results.recommendations.push({
                    type: 'new_js_file',
                    file: file.relativePath,
                    action: 'Add to cache manifest and version system',
                    priority: 'high'
                });
            }
            
            if (file.extension === 'css') {
                this.results.recommendations.push({
                    type: 'new_css_file',
                    file: file.relativePath,
                    action: 'Add to HTML and CSS versioning system',
                    priority: 'high'
                });
            }
        }

        // Recommendations for modified files
        for (const file of this.results.modifiedFiles) {
            if (file.extension === 'js') {
                this.results.recommendations.push({
                    type: 'modified_js_file',
                    file: file.relativePath,
                    action: 'Update cache version and test dependent files',
                    priority: 'medium'
                });
            }
        }
    }

    displayResults() {
        console.log('\n📊 ANALYSIS RESULTS');
        console.log('===================');

        // New files
        if (this.results.newFiles.length > 0) {
            console.log('\n🆕 NEW FILES:');
            for (const file of this.results.newFiles) {
                console.log(`  📄 ${file.relativePath} (${file.extension.toUpperCase()})`);
                if (file.exports && file.exports.length > 0) {
                    console.log(`    Exports: ${file.exports.map(e => e.name).join(', ')}`);
                }
                if (file.functions && file.functions.length > 0) {
                    console.log(`    Functions: ${file.functions.map(f => f.name).join(', ')}`);
                }
                if (file.classes && file.classes.length > 0) {
                    console.log(`    Classes: ${file.classes.map(c => c.name).join(', ')}`);
                }
            }
        }

        // Modified files
        if (this.results.modifiedFiles.length > 0) {
            console.log('\n📝 MODIFIED FILES:');
            for (const file of this.results.modifiedFiles) {
                console.log(`  📄 ${file.relativePath} (${file.extension.toUpperCase()})`);
            }
        }

        // Recommendations
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            for (const rec of this.results.recommendations) {
                console.log(`  ${rec.priority === 'high' ? '🔴' : '🟡'} ${rec.action}`);
                console.log(`    File: ${rec.file}`);
            }
        }

        // Summary
        console.log('\n📈 SUMMARY:');
        console.log(`  New files: ${this.results.newFiles.length}`);
        console.log(`  Modified files: ${this.results.modifiedFiles.length}`);
        console.log(`  Recommendations: ${this.results.recommendations.length}`);
    }

    async handleChanges() {
        console.log('\n🔧 HANDLING CHANGES');
        console.log('===================');

        // Update cache manifest
        await this.updateCacheManifest();
        
        // Update HTML if needed
        await this.updateHTML();
        
        // Update version system
        await this.updateVersionSystem();
    }

    async updateCacheManifest() {
        console.log('📦 Updating cache manifest...');
        
        try {
            const manifestPath = path.join(this.projectRoot, 'public', 'cache-manifest.json');
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const timestamp = Date.now().toString();
            
            // Update version
            manifest.version = timestamp;
            manifest.timestamp = new Date().toISOString();
            
            // Add new files
            for (const file of this.results.newFiles) {
                const fileName = path.basename(file.relativePath);
                if (!manifest.files[fileName]) {
                    manifest.files[fileName] = timestamp;
                    console.log(`  ✅ Added ${fileName} to cache manifest`);
                }
            }
            
            // Update modified files
            for (const file of this.results.modifiedFiles) {
                const fileName = path.basename(file.relativePath);
                if (manifest.files[fileName]) {
                    manifest.files[fileName] = timestamp;
                    console.log(`  ✅ Updated cache version for ${fileName}`);
                }
            }
            
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
            console.log('  ✅ Cache manifest updated');
            
        } catch (error) {
            console.error('  ❌ Failed to update cache manifest:', error.message);
        }
    }

    async updateHTML() {
        console.log('🌐 Updating HTML...');
        
        try {
            const htmlPath = path.join(this.projectRoot, 'public', 'index.html');
            let html = fs.readFileSync(htmlPath, 'utf8');
            
            // Update build timestamp
            const timestamp = Date.now().toString();
            html = html.replace(/content="\d+"/, `content="${timestamp}"`);
            
            // Add new CSS files
            for (const file of this.results.newFiles) {
                if (file.extension === 'css') {
                    const fileName = path.basename(file.relativePath);
                    const cssTag = `    <link rel="stylesheet" href="/CSS/${fileName}" id="css-${fileName.replace('.css', '')}">\n`;
                    
                    // Check if already exists
                    if (!html.includes(`href="/CSS/${fileName}"`)) {
                        // Find the last CSS link and add after it
                        const lastCSSIndex = html.lastIndexOf('rel="stylesheet"');
                        if (lastCSSIndex !== -1) {
                            const insertIndex = html.indexOf('>', lastCSSIndex) + 1;
                            html = html.slice(0, insertIndex) + cssTag + html.slice(insertIndex);
                            console.log(`  ✅ Added ${fileName} to HTML`);
                        }
                    }
                }
            }
            
            // Add new JS files
            for (const file of this.results.newFiles) {
                if (file.extension === 'js') {
                    const fileName = path.basename(file.relativePath);
                    const scriptTag = `    <script type="module" src="/js/${fileName}"></script>\n`;
                    
                    // Check if already exists
                    if (!html.includes(`src="/js/${fileName}"`)) {
                        // Find the last script tag and add after it
                        const lastScriptIndex = html.lastIndexOf('</script>');
                        if (lastScriptIndex !== -1) {
                            const insertIndex = lastScriptIndex + 9; // After </script>
                            html = html.slice(0, insertIndex) + scriptTag + html.slice(insertIndex);
                            console.log(`  ✅ Added ${fileName} to HTML`);
                        }
                    }
                }
            }
            
            fs.writeFileSync(htmlPath, html);
            console.log('  ✅ HTML updated');
            
        } catch (error) {
            console.error('  ❌ Failed to update HTML:', error.message);
        }
    }

    async updateVersionSystem() {
        console.log('🔄 Updating version system...');
        
        try {
            const versionPath = path.join(this.projectRoot, 'public', 'js', 'version.js');
            let versionJs = fs.readFileSync(versionPath, 'utf8');
            
            // Add new CSS files to versioning system
            for (const file of this.results.newFiles) {
                if (file.extension === 'css') {
                    const fileName = path.basename(file.relativePath);
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
                            
                            console.log(`  ✅ Added ${fileName} to CSS versioning system`);
                        }
                    }
                }
            }
            
            fs.writeFileSync(versionPath, versionJs);
            console.log('  ✅ Version system updated');
            
        } catch (error) {
            console.error('  ❌ Failed to update version system:', error.message);
        }
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const processor = new SimpleChangeProcessor();
    
    try {
        const results = await processor.processChanges();
        
        // Save results
        const resultsPath = path.join(processor.projectRoot, 'change-processing-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${resultsPath}`);
        
        console.log('\n🎉 CHANGE PROCESSING COMPLETE!');
        
    } catch (error) {
        console.error('❌ Change processing failed:', error);
        process.exit(1);
    }
}

export default SimpleChangeProcessor;
