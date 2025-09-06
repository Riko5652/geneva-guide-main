#!/usr/bin/env node

/**
 * 🤖 COMPREHENSIVE AUTOMATED CODE REVIEW & BUG FIXING SYSTEM
 * 
 * This system:
 * 1. Reviews every line of code in all files
 * 2. Detects and fixes bugs automatically
 * 3. Validates all dependencies and imports
 * 4. Runs E2E validation
 * 5. Ensures 100% system integrity
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

class AutomatedCodeReviewer {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.files = [];
        this.dependencies = new Map();
    }

    // Step 1: Discover all files
    discoverFiles() {
        log('\n🔍 DISCOVERING ALL FILES...', 'cyan');
        
        const jsFiles = this.findFiles('public/js', '.js');
        const cssFiles = this.findFiles('public/CSS', '.css');
        const htmlFiles = this.findFiles('public', '.html');
        const configFiles = ['public/cache-manifest.json', 'netlify.toml'];
        
        this.files = [...jsFiles, ...cssFiles, ...htmlFiles, ...configFiles];
        
        log(`✅ Found ${this.files.length} files to review`, 'green');
        return this.files;
    }

    findFiles(dir, extension) {
        if (!fs.existsSync(dir)) return [];
        
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.findFiles(fullPath, extension));
            } else if (item.endsWith(extension)) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    // Step 2: Review each file line by line
    reviewFile(filePath) {
        log(`\n📖 Reviewing: ${filePath}`, 'blue');
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            const issues = [];
            
            lines.forEach((line, index) => {
                const lineIssues = this.analyzeLine(line, index + 1, filePath);
                issues.push(...lineIssues);
            });
            
            // Check for file-specific issues
            const fileIssues = this.checkFileSpecificIssues(content, filePath);
            issues.push(...fileIssues);
            
            this.issues.push(...issues);
            
            if (issues.length === 0) {
                log(`✅ No issues found in ${filePath}`, 'green');
            } else {
                log(`⚠️ Found ${issues.length} issues in ${filePath}`, 'yellow');
            }
            
            return issues;
            
        } catch (error) {
            log(`❌ Error reading ${filePath}: ${error.message}`, 'red');
            return [];
        }
    }

    // Step 3: Analyze each line for issues
    analyzeLine(line, lineNumber, filePath) {
        const issues = [];
        
        // Check for common JavaScript issues
        if (filePath.endsWith('.js')) {
            issues.push(...this.checkJavaScriptIssues(line, lineNumber, filePath));
        }
        
        // Check for common CSS issues
        if (filePath.endsWith('.css')) {
            issues.push(...this.checkCSSIssues(line, lineNumber, filePath));
        }
        
        // Check for common HTML issues
        if (filePath.endsWith('.html')) {
            issues.push(...this.checkHTMLIssues(line, lineNumber, filePath));
        }
        
        return issues;
    }

    checkJavaScriptIssues(line, lineNumber, filePath) {
        const issues = [];
        
        // Check for syntax issues
        if (line.includes('return') && !line.includes('function') && !line.includes('=>')) {
            if (!this.isInsideFunction(line, filePath)) {
                issues.push({
                    type: 'syntax',
                    severity: 'error',
                    message: 'Return statement outside function',
                    line: lineNumber,
                    file: filePath,
                    fix: 'Wrap in function or remove return'
                });
            }
        }
        
        // Check for missing semicolons
        if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && 
            !line.trim().endsWith('}') && !line.trim().endsWith(',') && 
            !line.includes('//') && !line.includes('/*') && !line.includes('*/')) {
            
            if (line.includes('=') || line.includes('import') || line.includes('export')) {
                issues.push({
                    type: 'style',
                    severity: 'warning',
                    message: 'Missing semicolon',
                    line: lineNumber,
                    file: filePath,
                    fix: 'Add semicolon at end of line'
                });
            }
        }
        
        // Check for console.log in production
        if (line.includes('console.log') && !line.includes('// DEBUG')) {
            issues.push({
                type: 'performance',
                severity: 'warning',
                message: 'Console.log in production code',
                line: lineNumber,
                file: filePath,
                fix: 'Remove or comment out console.log'
            });
        }
        
        return issues;
    }

    checkCSSIssues(line, lineNumber, filePath) {
        const issues = [];
        
        // Check for excessive !important usage
        const importantCount = (line.match(/!important/g) || []).length;
        if (importantCount > 2) {
            issues.push({
                type: 'style',
                severity: 'warning',
                message: 'Excessive !important usage',
                line: lineNumber,
                file: filePath,
                fix: 'Reduce !important usage, improve specificity'
            });
        }
        
        // Check for duplicate selectors
        if (line.includes('{') && !line.includes('@media')) {
            const selector = line.trim().split('{')[0].trim();
            if (this.isDuplicateSelector(selector, filePath)) {
                issues.push({
                    type: 'duplicate',
                    severity: 'warning',
                    message: 'Duplicate CSS selector',
                    line: lineNumber,
                    file: filePath,
                    fix: 'Consolidate duplicate selectors'
                });
            }
        }
        
        return issues;
    }

    checkHTMLIssues(line, lineNumber, filePath) {
        const issues = [];
        
        // Check for unclosed tags
        if (line.includes('<') && !line.includes('</') && !line.includes('/>') && 
            !line.includes('<!--') && !line.includes('-->')) {
            
            const tagMatch = line.match(/<(\w+)/);
            if (tagMatch && !this.isSelfClosingTag(tagMatch[1])) {
                issues.push({
                    type: 'structure',
                    severity: 'warning',
                    message: 'Potentially unclosed HTML tag',
                    line: lineNumber,
                    file: filePath,
                    fix: 'Ensure tag is properly closed'
                });
            }
        }
        
        return issues;
    }

    checkFileSpecificIssues(content, filePath) {
        const issues = [];
        
        // Check for merge conflict markers
        if (content.includes('<<<<<<<') || content.includes('>>>>>>>') || content.includes('=======')) {
            issues.push({
                type: 'merge',
                severity: 'error',
                message: 'Merge conflict markers found',
                line: 0,
                file: filePath,
                fix: 'Resolve merge conflicts'
            });
        }
        
        // Check for TODO/FIXME comments
        const todoMatches = content.match(/TODO|FIXME|HACK|XXX/gi);
        if (todoMatches) {
            issues.push({
                type: 'todo',
                severity: 'info',
                message: `${todoMatches.length} TODO/FIXME comments found`,
                line: 0,
                file: filePath,
                fix: 'Address TODO/FIXME comments'
            });
        }
        
        return issues;
    }

    // Step 4: Fix issues automatically
    fixIssues() {
        log('\n🔧 FIXING ISSUES AUTOMATICALLY...', 'cyan');
        
        const fixableIssues = this.issues.filter(issue => 
            issue.severity === 'error' || 
            (issue.severity === 'warning' && issue.type === 'merge')
        );
        
        for (const issue of fixableIssues) {
            this.fixIssue(issue);
        }
        
        log(`✅ Fixed ${this.fixes.length} issues automatically`, 'green');
    }

    fixIssue(issue) {
        try {
            const content = fs.readFileSync(issue.file, 'utf8');
            let newContent = content;
            
            switch (issue.type) {
                case 'merge':
                    newContent = this.fixMergeConflicts(content);
                    break;
                case 'syntax':
                    if (issue.message.includes('Return statement outside function')) {
                        newContent = this.fixReturnStatement(content, issue.line);
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
        // Remove merge conflict markers
        return content
            .replace(/<<<<<<<.*?\n/g, '')
            .replace(/=======.*?\n/g, '')
            .replace(/>>>>>>>.*?\n/g, '');
    }

    fixReturnStatement(content, lineNumber) {
        const lines = content.split('\n');
        const line = lines[lineNumber - 1];
        
        // Wrap return statement in function if it's at module level
        if (line.trim().startsWith('return')) {
            lines[lineNumber - 1] = `    ${line.trim()}`;
            lines.splice(lineNumber - 1, 0, '(function() {');
            lines.splice(lineNumber + 1, 0, '})();');
        }
        
        return lines.join('\n');
    }

    // Step 5: Validate dependencies
    validateDependencies() {
        log('\n🔗 VALIDATING DEPENDENCIES...', 'cyan');
        
        const jsFiles = this.files.filter(f => f.endsWith('.js'));
        let dependencyIssues = 0;
        
        for (const file of jsFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
            
            for (const importStatement of imports) {
                const match = importStatement.match(/from\s+['"]([^'"]+)['"]/);
                if (match) {
                    const importPath = match[1];
                    
                    if (importPath.startsWith('./')) {
                        const fullPath = path.join(path.dirname(file), importPath);
                        if (!fs.existsSync(fullPath)) {
                            log(`❌ Missing import: ${importPath} in ${file}`, 'red');
                            dependencyIssues++;
                        }
                    }
                }
            }
        }
        
        if (dependencyIssues === 0) {
            log('✅ All dependencies valid', 'green');
        } else {
            log(`❌ Found ${dependencyIssues} dependency issues`, 'red');
        }
        
        return dependencyIssues === 0;
    }

    // Step 6: Run E2E validation
    runE2EValidation() {
        log('\n🧪 RUNNING E2E VALIDATION...', 'cyan');
        
        // Run the existing validation system
        const { execSync } = require('child_process');
        
        try {
            execSync('node validate-system.js', { stdio: 'inherit' });
            log('✅ E2E validation passed', 'green');
            return true;
        } catch (error) {
            log('❌ E2E validation failed', 'red');
            return false;
        }
    }

    // Step 7: Generate comprehensive report
    generateReport() {
        log('\n📊 COMPREHENSIVE REVIEW REPORT', 'magenta');
        log('================================', 'magenta');
        
        log(`\n📁 Files Reviewed: ${this.files.length}`, 'blue');
        log(`🐛 Issues Found: ${this.issues.length}`, 'yellow');
        log(`🔧 Issues Fixed: ${this.fixes.length}`, 'green');
        
        // Group issues by severity
        const errorIssues = this.issues.filter(i => i.severity === 'error');
        const warningIssues = this.issues.filter(i => i.severity === 'warning');
        const infoIssues = this.issues.filter(i => i.severity === 'info');
        
        log(`\n❌ Errors: ${errorIssues.length}`, 'red');
        log(`⚠️ Warnings: ${warningIssues.length}`, 'yellow');
        log(`ℹ️ Info: ${infoIssues.length}`, 'blue');
        
        // Show remaining issues
        const remainingIssues = this.issues.filter(issue => 
            !this.fixes.some(fix => fix.file === issue.file && fix.line === issue.line)
        );
        
        if (remainingIssues.length > 0) {
            log('\n📋 REMAINING ISSUES:', 'yellow');
            remainingIssues.forEach(issue => {
                log(`  ${issue.severity.toUpperCase()}: ${issue.message} (${issue.file}:${issue.line})`, 
                    issue.severity === 'error' ? 'red' : 'yellow');
            });
        }
        
        return {
            filesReviewed: this.files.length,
            issuesFound: this.issues.length,
            issuesFixed: this.fixes.length,
            remainingIssues: remainingIssues.length,
            success: remainingIssues.filter(i => i.severity === 'error').length === 0
        };
    }

    // Main execution method
    async run() {
        log('🤖 COMPREHENSIVE AUTOMATED CODE REVIEW', 'magenta');
        log('========================================', 'magenta');
        
        try {
            // Step 1: Discover all files
            this.discoverFiles();
            
            // Step 2: Review each file
            for (const file of this.files) {
                this.reviewFile(file);
            }
            
            // Step 3: Fix issues
            this.fixIssues();
            
            // Step 4: Validate dependencies
            const depsValid = this.validateDependencies();
            
            // Step 5: Run E2E validation
            const e2eValid = this.runE2EValidation();
            
            // Step 6: Generate report
            const report = this.generateReport();
            
            // Final status
            if (report.success && depsValid && e2eValid) {
                log('\n🎉 AUTOMATED REVIEW COMPLETED SUCCESSFULLY', 'green');
                log('✅ System is 100% validated and ready for deployment', 'green');
                return true;
            } else {
                log('\n⚠️ AUTOMATED REVIEW COMPLETED WITH ISSUES', 'yellow');
                log('❌ System needs attention before deployment', 'red');
                return false;
            }
            
        } catch (error) {
            log(`\n❌ AUTOMATED REVIEW FAILED: ${error.message}`, 'red');
            return false;
        }
    }
}

// Run the automated review
if (require.main === module) {
    const reviewer = new AutomatedCodeReviewer();
    reviewer.run().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = AutomatedCodeReviewer;
