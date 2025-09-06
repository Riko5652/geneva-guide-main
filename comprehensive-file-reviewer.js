#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE FILE REVIEWER
 * 
 * This system reviews ALL files in the project, not just public directory:
 * - Root configuration files
 * - Documentation files
 * - Build scripts
 * - Netlify functions
 * - Source files
 * - All project assets
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

class ComprehensiveFileReviewer {
    constructor() {
        this.allFiles = [];
        this.issues = [];
        this.fixes = [];
        this.categories = {
            config: [],
            documentation: [],
            scripts: [],
            netlify: [],
            public: [],
            source: [],
            other: []
        };
    }

    // Discover ALL files in the project
    discoverAllFiles() {
        log('\n🔍 DISCOVERING ALL PROJECT FILES...', 'cyan');
        
        // Root directory files
        const rootFiles = fs.readdirSync('.').filter(file => {
            const stat = fs.statSync(file);
            return stat.isFile() && !file.startsWith('.') && file !== 'node_modules';
        });
        
        // Netlify functions
        const netlifyFiles = this.findFilesRecursive('netlify', ['.js', '.toml']);
        
        // Public directory (already reviewed but including for completeness)
        const publicFiles = this.findFilesRecursive('public', ['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt']);
        
        // Source directory
        const sourceFiles = this.findFilesRecursive('src', ['.css', '.js', '.ts', '.scss']);
        
        // Combine all files
        this.allFiles = [
            ...rootFiles.map(f => ({ path: f, category: this.categorizeFile(f) })),
            ...netlifyFiles.map(f => ({ path: f, category: 'netlify' })),
            ...publicFiles.map(f => ({ path: f, category: 'public' })),
            ...sourceFiles.map(f => ({ path: f, category: 'source' }))
        ];
        
        // Categorize files
        this.categorizeAllFiles();
        
        log(`✅ Found ${this.allFiles.length} total files to review`, 'green');
        this.printFileCategories();
        
        return this.allFiles;
    }

    findFilesRecursive(dir, extensions) {
        if (!fs.existsSync(dir)) return [];
        
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && item !== 'node_modules') {
                files.push(...this.findFilesRecursive(fullPath, extensions));
            } else if (stat.isFile()) {
                const ext = path.extname(item);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
        
        return files;
    }

    categorizeFile(filename) {
        const ext = path.extname(filename).toLowerCase();
        const name = filename.toLowerCase();
        
        if (['.md', '.txt', '.html'].includes(ext) || name.includes('readme') || name.includes('guide')) {
            return 'documentation';
        } else if (['.js', '.bat'].includes(ext) && (name.includes('build') || name.includes('deploy') || name.includes('update'))) {
            return 'scripts';
        } else if (['.json', '.toml', '.config'].includes(ext) || name.includes('package') || name.includes('netlify')) {
            return 'config';
        } else {
            return 'other';
        }
    }

    categorizeAllFiles() {
        this.allFiles.forEach(file => {
            this.categories[file.category].push(file.path);
        });
    }

    printFileCategories() {
        log('\n📁 FILE CATEGORIES:', 'blue');
        Object.entries(this.categories).forEach(([category, files]) => {
            if (files.length > 0) {
                log(`  ${category.toUpperCase()}: ${files.length} files`, 'blue');
                files.forEach(file => {
                    log(`    - ${file}`, 'blue');
                });
            }
        });
    }

    // Review each file comprehensively
    reviewAllFiles() {
        log('\n📖 REVIEWING ALL FILES...', 'cyan');
        
        for (const file of this.allFiles) {
            this.reviewFile(file.path, file.category);
        }
        
        log(`\n✅ Completed review of ${this.allFiles.length} files`, 'green');
    }

    reviewFile(filePath, category) {
        log(`\n📄 Reviewing: ${filePath} [${category}]`, 'blue');
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            const issues = [];
            
            // Category-specific checks
            switch (category) {
                case 'config':
                    issues.push(...this.checkConfigFile(content, filePath));
                    break;
                case 'documentation':
                    issues.push(...this.checkDocumentationFile(content, filePath));
                    break;
                case 'scripts':
                    issues.push(...this.checkScriptFile(content, filePath));
                    break;
                case 'netlify':
                    issues.push(...this.checkNetlifyFile(content, filePath));
                    break;
                case 'public':
                    issues.push(...this.checkPublicFile(content, filePath));
                    break;
                case 'source':
                    issues.push(...this.checkSourceFile(content, filePath));
                    break;
                default:
                    issues.push(...this.checkGenericFile(content, filePath));
            }
            
            // Universal checks
            issues.push(...this.checkUniversalIssues(content, filePath));
            
            this.issues.push(...issues);
            
            if (issues.length === 0) {
                log(`✅ No issues found in ${filePath}`, 'green');
            } else {
                log(`⚠️ Found ${issues.length} issues in ${filePath}`, 'yellow');
                issues.forEach(issue => {
                    log(`  - ${issue.severity.toUpperCase()}: ${issue.message}`, 
                        issue.severity === 'error' ? 'red' : 'yellow');
                });
            }
            
        } catch (error) {
            log(`❌ Error reading ${filePath}: ${error.message}`, 'red');
            this.issues.push({
                type: 'file_access',
                severity: 'error',
                message: `Cannot read file: ${error.message}`,
                file: filePath,
                line: 0
            });
        }
    }

    checkConfigFile(content, filePath) {
        const issues = [];
        
        // Check for package.json
        if (filePath === 'package.json') {
            try {
                const pkg = JSON.parse(content);
                
                if (!pkg.name) {
                    issues.push({
                        type: 'config',
                        severity: 'error',
                        message: 'Missing package name',
                        file: filePath,
                        line: 0
                    });
                }
                
                if (!pkg.version) {
                    issues.push({
                        type: 'config',
                        severity: 'warning',
                        message: 'Missing package version',
                        file: filePath,
                        line: 0
                    });
                }
                
                if (!pkg.scripts || !pkg.scripts.build) {
                    issues.push({
                        type: 'config',
                        severity: 'warning',
                        message: 'Missing build script',
                        file: filePath,
                        line: 0
                    });
                }
                
            } catch (error) {
                issues.push({
                    type: 'config',
                    severity: 'error',
                    message: 'Invalid JSON format',
                    file: filePath,
                    line: 0
                });
            }
        }
        
        // Check for netlify.toml
        if (filePath === 'netlify.toml') {
            if (!content.includes('[build]')) {
                issues.push({
                    type: 'config',
                    severity: 'error',
                    message: 'Missing [build] section',
                    file: filePath,
                    line: 0
                });
            }
            
            if (!content.includes('publish = "public"')) {
                issues.push({
                    type: 'config',
                    severity: 'warning',
                    message: 'Publish directory not explicitly set',
                    file: filePath,
                    line: 0
                });
            }
        }
        
        return issues;
    }

    checkDocumentationFile(content, filePath) {
        const issues = [];
        
        // Check for proper markdown structure
        if (filePath.endsWith('.md')) {
            if (!content.includes('# ')) {
                issues.push({
                    type: 'documentation',
                    severity: 'warning',
                    message: 'Missing main heading',
                    file: filePath,
                    line: 0
                });
            }
            
            // Check for TODO/FIXME in documentation
            if (content.includes('TODO') || content.includes('FIXME')) {
                issues.push({
                    type: 'documentation',
                    severity: 'info',
                    message: 'Contains TODO/FIXME items',
                    file: filePath,
                    line: 0
                });
            }
        }
        
        return issues;
    }

    checkScriptFile(content, filePath) {
        const issues = [];
        
        // Check for proper error handling
        if (filePath.endsWith('.js')) {
            if (content.includes('require(') && !content.includes('try') && !content.includes('catch')) {
                issues.push({
                    type: 'script',
                    severity: 'warning',
                    message: 'Missing error handling for require statements',
                    file: filePath,
                    line: 0
                });
            }
            
            // Check for console.log in production scripts
            if (content.includes('console.log') && !filePath.includes('test')) {
                issues.push({
                    type: 'script',
                    severity: 'warning',
                    message: 'Console.log in production script',
                    file: filePath,
                    line: 0
                });
            }
        }
        
        // Check for batch files
        if (filePath.endsWith('.bat')) {
            if (!content.includes('@echo off')) {
                issues.push({
                    type: 'script',
                    severity: 'warning',
                    message: 'Batch file missing @echo off',
                    file: filePath,
                    line: 0
                });
            }
        }
        
        return issues;
    }

    checkNetlifyFile(content, filePath) {
        const issues = [];
        
        // Check for proper exports.handler
        if (filePath.endsWith('.js')) {
            const handlerCount = (content.match(/exports\.handler/g) || []).length;
            if (handlerCount === 0) {
                issues.push({
                    type: 'netlify',
                    severity: 'error',
                    message: 'Missing exports.handler function',
                    file: filePath,
                    line: 0
                });
            } else if (handlerCount > 1) {
                issues.push({
                    type: 'netlify',
                    severity: 'error',
                    message: 'Multiple exports.handler functions',
                    file: filePath,
                    line: 0
                });
            }
        }
        
        return issues;
    }

    checkPublicFile(content, filePath) {
        const issues = [];
        
        // Check for cache versioning
        if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
            if (!content.includes('v=') && !filePath.includes('version.js')) {
                issues.push({
                    type: 'public',
                    severity: 'warning',
                    message: 'Missing cache versioning',
                    file: filePath,
                    line: 0
                });
            }
        }
        
        return issues;
    }

    checkSourceFile(content, filePath) {
        const issues = [];
        
        // Check for proper source file structure
        if (filePath.endsWith('.css')) {
            if (!content.includes('@tailwind') && !content.includes('@import')) {
                issues.push({
                    type: 'source',
                    severity: 'warning',
                    message: 'CSS file missing imports',
                    file: filePath,
                    line: 0
                });
            }
        }
        
        return issues;
    }

    checkGenericFile(content, filePath) {
        const issues = [];
        
        // Generic file checks
        if (content.length === 0) {
            issues.push({
                type: 'generic',
                severity: 'warning',
                message: 'Empty file',
                file: filePath,
                line: 0
            });
        }
        
        return issues;
    }

    checkUniversalIssues(content, filePath) {
        const issues = [];
        
        // Check for merge conflict markers (but not in automation scripts that detect them)
        if ((content.includes('<<<<<<<') || content.includes('>>>>>>>') || content.includes('=======')) && 
            !filePath.includes('automated-code-review.js') && 
            !filePath.includes('comprehensive-file-reviewer.js') &&
            !filePath.includes('e2e-validation.js') &&
            !filePath.includes('master-automation.js') &&
            !filePath.includes('validate-system.js')) {
            issues.push({
                type: 'merge',
                severity: 'error',
                message: 'Merge conflict markers found',
                file: filePath,
                line: 0
            });
        }
        
        // Check for encoding issues
        if (content.includes('\uFFFD')) {
            issues.push({
                type: 'encoding',
                severity: 'error',
                message: 'Encoding issues detected',
                file: filePath,
                line: 0
            });
        }
        
        // Check for very long lines
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.length > 200) {
                issues.push({
                    type: 'style',
                    severity: 'warning',
                    message: `Line too long (${line.length} characters)`,
                    file: filePath,
                    line: index + 1
                });
            }
        });
        
        return issues;
    }

    // Fix critical issues automatically
    fixCriticalIssues() {
        log('\n🔧 FIXING CRITICAL ISSUES...', 'cyan');
        
        const criticalIssues = this.issues.filter(issue => issue.severity === 'error');
        
        for (const issue of criticalIssues) {
            this.fixIssue(issue);
        }
        
        log(`✅ Fixed ${this.fixes.length} critical issues`, 'green');
    }

    fixIssue(issue) {
        try {
            const content = fs.readFileSync(issue.file, 'utf8');
            let newContent = content;
            
            switch (issue.type) {
                case 'merge':
                    newContent = this.fixMergeConflicts(content);
                    break;
                case 'netlify':
                    if (issue.message.includes('Multiple exports.handler')) {
                        newContent = this.fixDuplicateHandlers(content);
                    }
                    break;
            }
            
            if (newContent !== content) {
                fs.writeFileSync(issue.file, newContent, 'utf8');
                this.fixes.push(issue);
                log(`✅ Fixed: ${issue.message} in ${issue.file}`, 'green');
            }
            
        } catch (error) {
            log(`❌ Failed to fix ${issue.message}: ${error.message}`, 'red');
        }
    }

    fixMergeConflicts(content) {
        return content
            .replace(/<<<<<<<.*?\n/g, '')
            .replace(/=======.*?\n/g, '')
            .replace(/>>>>>>>.*?\n/g, '');
    }

    fixDuplicateHandlers(content) {
        // Remove duplicate exports.handler functions
        const lines = content.split('\n');
        let handlerCount = 0;
        const newLines = [];
        
        for (const line of lines) {
            if (line.includes('exports.handler')) {
                handlerCount++;
                if (handlerCount === 1) {
                    newLines.push(line);
                }
            } else {
                newLines.push(line);
            }
        }
        
        return newLines.join('\n');
    }

    // Generate comprehensive report
    generateReport() {
        log('\n📊 COMPREHENSIVE FILE REVIEW REPORT', 'magenta');
        log('===================================', 'magenta');
        
        log(`\n📁 TOTAL FILES REVIEWED: ${this.allFiles.length}`, 'blue');
        log(`🐛 ISSUES FOUND: ${this.issues.length}`, 'yellow');
        log(`🔧 ISSUES FIXED: ${this.fixes.length}`, 'green');
        
        // Group issues by category
        const categoryIssues = {};
        this.issues.forEach(issue => {
            const category = this.getFileCategory(issue.file);
            if (!categoryIssues[category]) categoryIssues[category] = [];
            categoryIssues[category].push(issue);
        });
        
        log(`\n📋 ISSUES BY CATEGORY:`, 'blue');
        Object.entries(categoryIssues).forEach(([category, issues]) => {
            const errors = issues.filter(i => i.severity === 'error').length;
            const warnings = issues.filter(i => i.severity === 'warning').length;
            const info = issues.filter(i => i.severity === 'info').length;
            
            log(`  ${category.toUpperCase()}: ${issues.length} total (${errors} errors, ${warnings} warnings, ${info} info)`, 
                errors > 0 ? 'red' : warnings > 0 ? 'yellow' : 'green');
        });
        
        // Show remaining critical issues
        const remainingErrors = this.issues.filter(issue => 
            issue.severity === 'error' && 
            !this.fixes.some(fix => fix.file === issue.file)
        );
        
        if (remainingErrors.length > 0) {
            log(`\n❌ REMAINING CRITICAL ISSUES:`, 'red');
            remainingErrors.forEach(issue => {
                log(`  ${issue.file}: ${issue.message}`, 'red');
            });
        }
        
        const success = remainingErrors.length === 0;
        
        log(`\n🎯 OVERALL STATUS:`, 'magenta');
        if (success) {
            log(`✅ COMPREHENSIVE REVIEW COMPLETED SUCCESSFULLY`, 'green');
            log(`✅ All ${this.allFiles.length} files validated`, 'green');
        } else {
            log(`❌ COMPREHENSIVE REVIEW COMPLETED WITH CRITICAL ISSUES`, 'red');
            log(`⚠️ ${remainingErrors.length} critical issues need attention`, 'red');
        }
        
        return {
            totalFiles: this.allFiles.length,
            totalIssues: this.issues.length,
            fixedIssues: this.fixes.length,
            remainingErrors: remainingErrors.length,
            success: success
        };
    }

    getFileCategory(filePath) {
        const file = this.allFiles.find(f => f.path === filePath);
        return file ? file.category : 'unknown';
    }

    // Main execution method
    async run() {
        log('🔍 COMPREHENSIVE FILE REVIEWER', 'magenta');
        log('==============================', 'magenta');
        
        try {
            // Step 1: Discover all files
            this.discoverAllFiles();
            
            // Step 2: Review all files
            this.reviewAllFiles();
            
            // Step 3: Fix critical issues
            this.fixCriticalIssues();
            
            // Step 4: Generate report
            const report = this.generateReport();
            
            return report.success;
            
        } catch (error) {
            log(`❌ Comprehensive review failed: ${error.message}`, 'red');
            return false;
        }
    }
}

// Run comprehensive file review
if (require.main === module) {
    const reviewer = new ComprehensiveFileReviewer();
    reviewer.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = ComprehensiveFileReviewer;
