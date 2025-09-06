/**
 * 🔍 CODEBASE CHANGE ANALYZER
 * 
 * Analyzes new files based on creation date and crawls through the entire codebase
 * to find references and handle changes appropriately based on the type of change
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CodebaseChangeAnalyzer {
    constructor() {
        this.projectRoot = path.join(__dirname);
        this.analysisResults = {
            newFiles: [],
            modifiedFiles: [],
            removedFiles: [],
            references: new Map(),
            conflicts: [],
            recommendations: []
        };
        this.fileTypes = {
            js: 'JavaScript',
            css: 'CSS',
            html: 'HTML',
            json: 'JSON',
            md: 'Markdown',
            txt: 'Text'
        };
        this.changeTypes = {
            ADD: 'adding',
            UPDATE: 'updating', 
            REMOVE: 'removing'
        };
    }

    /**
     * Main analysis method
     */
    async analyzeChanges(sinceDate = null) {
        console.log('🔍 CODEBASE CHANGE ANALYZER');
        console.log('==========================');
        console.log('');

        try {
            // Get all files in the project
            const allFiles = await this.getAllProjectFiles();
            
            // Filter files by creation date if specified
            const filteredFiles = sinceDate ? 
                this.filterFilesByDate(allFiles, sinceDate) : 
                this.getRecentFiles(allFiles);

            // Analyze each file
            for (const file of filteredFiles) {
                await this.analyzeFile(file);
            }

            // Find references and dependencies
            await this.findReferences();

            // Detect conflicts
            this.detectConflicts();

            // Generate recommendations
            this.generateRecommendations();

            // Display results
            this.displayResults();

            return this.analysisResults;

        } catch (error) {
            console.error('❌ Analysis failed:', error);
            throw error;
        }
    }

    /**
     * Get all files in the project
     */
    async getAllProjectFiles() {
        const files = [];
        const directories = ['public', 'netlify', '.github'];

        for (const dir of directories) {
            const dirPath = path.join(this.projectRoot, dir);
            if (fs.existsSync(dirPath)) {
                const dirFiles = await this.getFilesRecursively(dirPath);
                files.push(...dirFiles);
            }
        }

        // Add root files
        const rootFiles = await this.getFilesRecursively(this.projectRoot, 1);
        files.push(...rootFiles.filter(f => !directories.includes(path.basename(f))));

        return files;
    }

    /**
     * Get files recursively from a directory
     */
    async getFilesRecursively(dirPath, maxDepth = Infinity, currentDepth = 0) {
        const files = [];
        
        if (currentDepth >= maxDepth) return files;

        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip node_modules, .git, and other common directories
                    if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
                        const subFiles = await this.getFilesRecursively(fullPath, maxDepth, currentDepth + 1);
                        files.push(...subFiles);
                    }
                } else if (stat.isFile()) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.warn(`⚠️ Could not read directory ${dirPath}:`, error.message);
        }

        return files;
    }

    /**
     * Filter files by creation date
     */
    filterFilesByDate(files, sinceDate) {
        const since = new Date(sinceDate);
        return files.filter(file => {
            try {
                const stats = fs.statSync(file);
                return stats.birthtime >= since;
            } catch (error) {
                return false;
            }
        });
    }

    /**
     * Get recent files (last 24 hours)
     */
    getRecentFiles(files) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return this.filterFilesByDate(files, oneDayAgo);
    }

    /**
     * Analyze a single file
     */
    async analyzeFile(filePath) {
        const relativePath = path.relative(this.projectRoot, filePath);
        const stats = fs.statSync(filePath);
        const ext = path.extname(filePath).slice(1);
        const fileName = path.basename(filePath);

        console.log(`📄 Analyzing: ${relativePath}`);

        const fileInfo = {
            path: filePath,
            relativePath: relativePath,
            name: fileName,
            extension: ext,
            type: this.fileTypes[ext] || 'Unknown',
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            isNew: this.isNewFile(stats.birthtime),
            isModified: this.isModifiedFile(stats.mtime),
            content: null,
            exports: [],
            imports: [],
            functions: [],
            classes: [],
            references: []
        };

        // Read file content
        try {
            fileInfo.content = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.warn(`⚠️ Could not read file ${relativePath}:`, error.message);
            return;
        }

        // Analyze based on file type
        switch (ext) {
            case 'js':
                this.analyzeJavaScriptFile(fileInfo);
                break;
            case 'css':
                this.analyzeCSSFile(fileInfo);
                break;
            case 'html':
                this.analyzeHTMLFile(fileInfo);
                break;
            case 'json':
                this.analyzeJSONFile(fileInfo);
                break;
        }

        // Categorize file
        if (fileInfo.isNew) {
            this.analysisResults.newFiles.push(fileInfo);
        } else if (fileInfo.isModified) {
            this.analysisResults.modifiedFiles.push(fileInfo);
        }
    }

    /**
     * Check if file is new (created in last 24 hours)
     */
    isNewFile(birthtime) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return birthtime >= oneDayAgo;
    }

    /**
     * Check if file is modified (modified in last 24 hours)
     */
    isModifiedFile(mtime) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return mtime >= oneDayAgo;
    }

    /**
     * Analyze JavaScript file
     */
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

        // Find DOM references
        const domMatches = content.match(/document\.(?:getElementById|querySelector|querySelectorAll)\s*\(\s*['"]([^'"]+)['"]/g);
        if (domMatches) {
            fileInfo.domReferences = domMatches.map(match => {
                const id = match.match(/['"]([^'"]+)['"]/)[1];
                return { id, type: 'DOM' };
            });
        }
    }

    /**
     * Analyze CSS file
     */
    analyzeCSSFile(fileInfo) {
        const content = fileInfo.content;

        // Find CSS classes and IDs
        const selectorMatches = content.match(/([.#][\w-]+)/g);
        if (selectorMatches) {
            fileInfo.selectors = [...new Set(selectorMatches)].map(selector => ({
                name: selector,
                type: selector.startsWith('.') ? 'class' : 'id'
            }));
        }

        // Find CSS custom properties
        const customPropMatches = content.match(/--[\w-]+/g);
        if (customPropMatches) {
            fileInfo.customProperties = [...new Set(customPropMatches)];
        }

        // Find media queries
        const mediaMatches = content.match(/@media\s+[^{]+/g);
        if (mediaMatches) {
            fileInfo.mediaQueries = mediaMatches;
        }
    }

    /**
     * Analyze HTML file
     */
    analyzeHTMLFile(fileInfo) {
        const content = fileInfo.content;

        // Find script references
        const scriptMatches = content.match(/<script[^>]*src\s*=\s*['"]([^'"]+)['"]/g);
        if (scriptMatches) {
            fileInfo.scriptReferences = scriptMatches.map(match => {
                const src = match.match(/src\s*=\s*['"]([^'"]+)['"]/)[1];
                return { src, type: 'script' };
            });
        }

        // Find CSS references
        const cssMatches = content.match(/<link[^>]*href\s*=\s*['"]([^'"]+)['"][^>]*rel\s*=\s*['"]stylesheet['"]/g);
        if (cssMatches) {
            fileInfo.cssReferences = cssMatches.map(match => {
                const href = match.match(/href\s*=\s*['"]([^'"]+)['"]/)[1];
                return { href, type: 'stylesheet' };
            });
        }

        // Find element IDs
        const idMatches = content.match(/id\s*=\s*['"]([^'"]+)['"]/g);
        if (idMatches) {
            fileInfo.elementIds = idMatches.map(match => {
                const id = match.match(/['"]([^'"]+)['"]/)[1];
                return { id, type: 'element' };
            });
        }

        // Find element classes
        const classMatches = content.match(/class\s*=\s*['"]([^'"]+)['"]/g);
        if (classMatches) {
            fileInfo.elementClasses = classMatches.map(match => {
                const classes = match.match(/['"]([^'"]+)['"]/)[1];
                return { classes, type: 'element' };
            });
        }
    }

    /**
     * Analyze JSON file
     */
    analyzeJSONFile(fileInfo) {
        try {
            const json = JSON.parse(fileInfo.content);
            fileInfo.jsonStructure = this.analyzeJSONStructure(json);
        } catch (error) {
            fileInfo.jsonError = error.message;
        }
    }

    /**
     * Analyze JSON structure
     */
    analyzeJSONStructure(obj, path = '') {
        const structure = {};
        
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                structure[key] = this.analyzeJSONStructure(value, currentPath);
            } else {
                structure[key] = typeof value;
            }
        }
        
        return structure;
    }

    /**
     * Get export type
     */
    getExportType(exportMatch) {
        if (exportMatch.includes('default')) return 'default';
        if (exportMatch.includes('function')) return 'function';
        if (exportMatch.includes('class')) return 'class';
        if (exportMatch.includes('const') || exportMatch.includes('let') || exportMatch.includes('var')) return 'variable';
        return 'unknown';
    }

    /**
     * Find references to analyzed files
     */
    async findReferences() {
        console.log('\n🔗 Finding references...');

        const allFiles = await this.getAllProjectFiles();
        
        for (const analyzedFile of [...this.analysisResults.newFiles, ...this.analysisResults.modifiedFiles]) {
            const references = [];
            
            for (const file of allFiles) {
                if (file === analyzedFile.path) continue;
                
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    const relativePath = path.relative(this.projectRoot, file);
                    
                    // Check for direct file references
                    if (content.includes(analyzedFile.relativePath)) {
                        references.push({
                            file: relativePath,
                            type: 'direct_reference',
                            context: this.getReferenceContext(content, analyzedFile.relativePath)
                        });
                    }
                    
                    // Check for function/class references
                    if (analyzedFile.functions) {
                        for (const func of analyzedFile.functions) {
                            if (content.includes(func.name)) {
                                references.push({
                                    file: relativePath,
                                    type: 'function_reference',
                                    name: func.name,
                                    context: this.getReferenceContext(content, func.name)
                                });
                            }
                        }
                    }
                    
                    if (analyzedFile.classes) {
                        for (const cls of analyzedFile.classes) {
                            if (content.includes(cls.name)) {
                                references.push({
                                    file: relativePath,
                                    type: 'class_reference',
                                    name: cls.name,
                                    context: this.getReferenceContext(content, cls.name)
                                });
                            }
                        }
                    }
                    
                } catch (error) {
                    // Skip files that can't be read
                }
            }
            
            analyzedFile.references = references;
            this.analysisResults.references.set(analyzedFile.relativePath, references);
        }
    }

    /**
     * Get reference context
     */
    getReferenceContext(content, searchTerm, contextLength = 100) {
        const index = content.indexOf(searchTerm);
        if (index === -1) return null;
        
        const start = Math.max(0, index - contextLength);
        const end = Math.min(content.length, index + searchTerm.length + contextLength);
        
        return content.substring(start, end).trim();
    }

    /**
     * Detect conflicts
     */
    detectConflicts() {
        console.log('\n⚠️ Detecting conflicts...');

        // Check for duplicate exports
        const allExports = new Map();
        for (const file of [...this.analysisResults.newFiles, ...this.analysisResults.modifiedFiles]) {
            if (file.exports) {
                for (const exp of file.exports) {
                    if (allExports.has(exp.name)) {
                        this.analysisResults.conflicts.push({
                            type: 'duplicate_export',
                            name: exp.name,
                            files: [allExports.get(exp.name), file.relativePath],
                            severity: 'high'
                        });
                    } else {
                        allExports.set(exp.name, file.relativePath);
                    }
                }
            }
        }

        // Check for missing imports
        for (const file of [...this.analysisResults.newFiles, ...this.analysisResults.modifiedFiles]) {
            if (file.imports) {
                for (const imp of file.imports) {
                    const importPath = this.resolveImportPath(imp.module, file.relativePath);
                    if (!fs.existsSync(path.join(this.projectRoot, importPath))) {
                        this.analysisResults.conflicts.push({
                            type: 'missing_import',
                            module: imp.module,
                            file: file.relativePath,
                            severity: 'high'
                        });
                    }
                }
            }
        }

        // Check for unused exports
        for (const file of [...this.analysisResults.newFiles, ...this.analysisResults.modifiedFiles]) {
            if (file.exports && file.references.length === 0) {
                this.analysisResults.conflicts.push({
                    type: 'unused_export',
                    file: file.relativePath,
                    exports: file.exports.map(e => e.name),
                    severity: 'medium'
                });
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
     * Generate recommendations
     */
    generateRecommendations() {
        console.log('\n💡 Generating recommendations...');

        // Recommendations for new files
        for (const file of this.analysisResults.newFiles) {
            if (file.type === 'JavaScript') {
                this.analysisResults.recommendations.push({
                    type: 'new_js_file',
                    file: file.relativePath,
                    action: 'Add to cache manifest and version system',
                    priority: 'high'
                });
            }
            
            if (file.type === 'CSS') {
                this.analysisResults.recommendations.push({
                    type: 'new_css_file',
                    file: file.relativePath,
                    action: 'Add to HTML and CSS versioning system',
                    priority: 'high'
                });
            }
        }

        // Recommendations for modified files
        for (const file of this.analysisResults.modifiedFiles) {
            if (file.type === 'JavaScript' && file.references.length > 0) {
                this.analysisResults.recommendations.push({
                    type: 'modified_js_file',
                    file: file.relativePath,
                    action: 'Update cache version and test dependent files',
                    priority: 'medium'
                });
            }
        }

        // Recommendations for conflicts
        for (const conflict of this.analysisResults.conflicts) {
            this.analysisResults.recommendations.push({
                type: 'resolve_conflict',
                conflict: conflict,
                action: this.getConflictResolutionAction(conflict),
                priority: conflict.severity === 'high' ? 'high' : 'medium'
            });
        }
    }

    /**
     * Get conflict resolution action
     */
    getConflictResolutionAction(conflict) {
        switch (conflict.type) {
            case 'duplicate_export':
                return 'Rename one of the exports or consolidate functionality';
            case 'missing_import':
                return 'Create missing file or fix import path';
            case 'unused_export':
                return 'Remove unused exports or add proper usage';
            default:
                return 'Review and resolve manually';
        }
    }

    /**
     * Display analysis results
     */
    displayResults() {
        console.log('\n📊 ANALYSIS RESULTS');
        console.log('===================');

        // New files
        if (this.analysisResults.newFiles.length > 0) {
            console.log('\n🆕 NEW FILES:');
            for (const file of this.analysisResults.newFiles) {
                console.log(`  📄 ${file.relativePath} (${file.type})`);
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
        if (this.analysisResults.modifiedFiles.length > 0) {
            console.log('\n📝 MODIFIED FILES:');
            for (const file of this.analysisResults.modifiedFiles) {
                console.log(`  📄 ${file.relativePath} (${file.type})`);
                if (file.references.length > 0) {
                    console.log(`    Referenced by: ${file.references.length} files`);
                }
            }
        }

        // Conflicts
        if (this.analysisResults.conflicts.length > 0) {
            console.log('\n⚠️ CONFLICTS:');
            for (const conflict of this.analysisResults.conflicts) {
                console.log(`  ${conflict.severity === 'high' ? '🔴' : '🟡'} ${conflict.type.toUpperCase()}`);
                console.log(`    ${JSON.stringify(conflict, null, 2)}`);
            }
        }

        // Recommendations
        if (this.analysisResults.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            for (const rec of this.analysisResults.recommendations) {
                console.log(`  ${rec.priority === 'high' ? '🔴' : '🟡'} ${rec.action}`);
                console.log(`    File: ${rec.file || 'N/A'}`);
            }
        }

        // Summary
        console.log('\n📈 SUMMARY:');
        console.log(`  New files: ${this.analysisResults.newFiles.length}`);
        console.log(`  Modified files: ${this.analysisResults.modifiedFiles.length}`);
        console.log(`  Conflicts: ${this.analysisResults.conflicts.length}`);
        console.log(`  Recommendations: ${this.analysisResults.recommendations.length}`);
    }

    /**
     * Generate change handling script
     */
    generateChangeHandlingScript() {
        const script = `
// Auto-generated change handling script
import fs from 'fs';
import path from 'path';

const changes = ${JSON.stringify(this.analysisResults, null, 2)};

// Handle new files
for (const file of changes.newFiles) {
    console.log(\`Handling new file: \${file.relativePath}\`);
    
    if (file.type === 'JavaScript') {
        // Add to cache manifest
        console.log(\`Adding \${file.relativePath} to cache manifest\`);
    }
    
    if (file.type === 'CSS') {
        // Add to HTML
        console.log(\`Adding \${file.relativePath} to HTML\`);
    }
}

// Handle conflicts
for (const conflict of changes.conflicts) {
    console.log(\`Resolving conflict: \${conflict.type}\`);
    // Add specific resolution logic here
}

// Handle recommendations
for (const rec of changes.recommendations) {
    console.log(\`Applying recommendation: \${rec.action}\`);
    // Add specific action logic here
}
`;

        fs.writeFileSync(path.join(this.projectRoot, 'auto-change-handler.js'), script);
        console.log('\n🤖 Generated auto-change-handler.js');
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const analyzer = new CodebaseChangeAnalyzer();
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const sinceDate = args[0] || null;
    const generateScript = args.includes('--generate-script');
    
    try {
        const results = await analyzer.analyzeChanges(sinceDate);
        
        if (generateScript) {
            analyzer.generateChangeHandlingScript();
        }
        
        // Save results to file
        const resultsPath = path.join(analyzer.projectRoot, 'change-analysis-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${resultsPath}`);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
    }
}

export default CodebaseChangeAnalyzer;
