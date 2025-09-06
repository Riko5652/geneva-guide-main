/**
 * 📁 FILE REVIEWER
 * Reviews each single file in each single folder
 */

import fs from 'fs';
import path from 'path';

class FileReviewer {
    constructor() {
        this.projectRoot = process.cwd();
        this.results = { files: {}, folders: {} };
    }

    async reviewAll() {
        console.log('📁 FILE REVIEWER');
        console.log('================');
        
        try {
            await this.reviewProjectStructure();
            await this.reviewIndividualFiles();
            this.generateReport();
            return this.results;
        } catch (error) {
            console.error('❌ Review failed:', error);
            throw error;
        }
    }

    async reviewProjectStructure() {
        console.log('📂 REVIEWING PROJECT STRUCTURE...');
        
        const folders = ['public', 'public/CSS', 'public/js', 'netlify'];
        
        for (const folder of folders) {
            const folderPath = path.join(this.projectRoot, folder);
            if (fs.existsSync(folderPath)) {
                await this.reviewFolder(folder, folderPath);
            }
        }
    }

    async reviewFolder(folderName, folderPath) {
        const files = fs.readdirSync(folderPath, { recursive: true });
        const stats = {
            totalFiles: files.length,
            fileTypes: {},
            totalSize: 0,
            issues: []
        };
        
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const fileStat = fs.statSync(filePath);
            
            if (fileStat.isFile()) {
                const ext = path.extname(file);
                const type = this.getFileType(ext);
                
                if (!stats.fileTypes[type]) {
                    stats.fileTypes[type] = 0;
                }
                stats.fileTypes[type]++;
                stats.totalSize += fileStat.size;
                
                this.checkFileIssues(filePath, file, stats.issues);
            }
        }
        
        this.results.folders[folderName] = stats;
    }

    getFileType(extension) {
        const types = {
            '.html': 'html',
            '.css': 'css',
            '.js': 'js',
            '.json': 'json'
        };
        return types[extension] || 'other';
    }

    checkFileIssues(filePath, fileName, issues) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const ext = path.extname(fileName);
            
            if (content.length === 0) {
                issues.push({
                    type: 'empty_file',
                    severity: 'medium',
                    description: 'File is empty',
                    file: fileName
                });
            }
            
            if (content.length > 100000) {
                issues.push({
                    type: 'large_file',
                    severity: 'low',
                    description: `File is large (${Math.round(content.length / 1024)}KB)`,
                    file: fileName
                });
            }
            
            if (ext === '.html') {
                this.checkHTMLIssues(content, fileName, issues);
            } else if (ext === '.css') {
                this.checkCSSIssues(content, fileName, issues);
            } else if (ext === '.js') {
                this.checkJavaScriptIssues(content, fileName, issues);
            }
            
        } catch (error) {
            issues.push({
                type: 'read_error',
                severity: 'high',
                description: `Cannot read file: ${error.message}`,
                file: fileName
            });
        }
    }

    checkHTMLIssues(content, fileName, issues) {
        if (!content.includes('<!DOCTYPE html>')) {
            issues.push({
                type: 'missing_doctype',
                severity: 'high',
                description: 'Missing DOCTYPE declaration',
                file: fileName
            });
        }
        
        if (!content.includes('lang=')) {
            issues.push({
                type: 'missing_lang',
                severity: 'high',
                description: 'Missing lang attribute',
                file: fileName
            });
        }
    }

    checkCSSIssues(content, fileName, issues) {
        const selectors = content.match(/[.#][a-zA-Z-]+/g);
        if (selectors && selectors.length > 100) {
            issues.push({
                type: 'large_css_file',
                severity: 'low',
                description: `Large CSS file with ${selectors.length} selectors`,
                file: fileName
            });
        }
    }

    checkJavaScriptIssues(content, fileName, issues) {
        const asyncFunctions = content.match(/async\s+function/g);
        const tryCatchBlocks = content.match(/try\s*{/g);
        
        if (asyncFunctions && asyncFunctions.length > 0) {
            if (!tryCatchBlocks || tryCatchBlocks.length < asyncFunctions.length) {
                issues.push({
                    type: 'insufficient_error_handling',
                    severity: 'high',
                    description: 'Async functions without proper error handling',
                    file: fileName
                });
            }
        }
    }

    async reviewIndividualFiles() {
        console.log('📄 REVIEWING INDIVIDUAL FILES...');
        
        const importantFiles = [
            'public/index.html',
            'public/CSS/style.css',
            'public/CSS/device-responsive.css',
            'public/CSS/flow-enhancements.css',
            'public/CSS/dynamic-templates.css',
            'public/js/Main.js',
            'public/js/ui.js',
            'public/js/handlers.js',
            'public/js/utils.js',
            'public/js/Gemini.js',
            'public/js/user-agent-adjuster.js',
            'public/js/template-manager.js',
            'public/js/template-demo.js',
            'public/cache-manifest.json',
            'public/js/version.js',
            'netlify.toml'
        ];
        
        for (const file of importantFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                await this.reviewIndividualFile(file, filePath);
            }
        }
    }

    async reviewIndividualFile(fileName, filePath) {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const fileReview = {
            size: stats.size,
            lines: content.split('\n').length,
            lastModified: stats.mtime,
            issues: [],
            qualityScore: 0
        };
        
        this.analyzeFileContent(content, fileName, fileReview);
        this.calculateQualityScore(fileReview);
        
        this.results.files[fileName] = fileReview;
    }

    analyzeFileContent(content, fileName, fileReview) {
        const ext = path.extname(fileName);
        
        if (ext === '.js') {
            this.analyzeJavaScriptContent(content, fileName, fileReview);
        } else if (ext === '.css') {
            this.analyzeCSSContent(content, fileName, fileReview);
        } else if (ext === '.html') {
            this.analyzeHTMLContent(content, fileName, fileReview);
        }
    }

    analyzeJavaScriptContent(content, fileName, fileReview) {
        const functions = content.match(/function\s+\w+/g);
        
        if (functions && functions.length > 10) {
            fileReview.issues.push({
                type: 'many_functions',
                severity: 'low',
                description: `${functions.length} functions in single file`
            });
        }
        
        const errorHandling = content.match(/try\s*{|catch\s*\(/g);
        if (!errorHandling || errorHandling.length < 2) {
            fileReview.issues.push({
                type: 'insufficient_error_handling',
                severity: 'medium',
                description: 'Limited error handling'
            });
        }
    }

    analyzeCSSContent(content, fileName, fileReview) {
        const selectors = content.match(/[.#][a-zA-Z-]+/g);
        
        if (selectors && selectors.length > 50) {
            fileReview.issues.push({
                type: 'large_css_file',
                severity: 'low',
                description: `Large CSS file with ${selectors.length} selectors`
            });
        }
    }

    analyzeHTMLContent(content, fileName, fileReview) {
        const images = content.match(/<img/g);
        
        if (images && images.length > 0) {
            const imagesWithoutAlt = content.match(/<img[^>]*(?!alt=)[^>]*>/g);
            if (imagesWithoutAlt && imagesWithoutAlt.length > 0) {
                fileReview.issues.push({
                    type: 'missing_alt_attributes',
                    severity: 'high',
                    description: `${imagesWithoutAlt.length} images missing alt attributes`
                });
            }
        }
    }

    calculateQualityScore(fileReview) {
        let score = 100;
        
        for (const issue of fileReview.issues) {
            switch (issue.severity) {
                case 'high':
                    score -= 20;
                    break;
                case 'medium':
                    score -= 10;
                    break;
                case 'low':
                    score -= 5;
                    break;
            }
        }
        
        fileReview.qualityScore = Math.max(0, Math.min(100, score));
    }

    generateReport() {
        console.log('\n📊 FILE REVIEW REPORT');
        console.log('=====================');
        
        const totalFiles = Object.keys(this.results.files).length;
        const totalIssues = Object.values(this.results.files).reduce((sum, file) => sum + file.issues.length, 0);
        const averageQualityScore = Object.values(this.results.files).reduce((sum, file) => sum + file.qualityScore, 0) / totalFiles;
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`  Total Files Reviewed: ${totalFiles}`);
        console.log(`  Total Issues Found: ${totalIssues}`);
        console.log(`  Average Quality Score: ${Math.round(averageQualityScore)}/100`);
        
        console.log(`\n📄 FILES BY QUALITY SCORE:`);
        const filesByScore = Object.entries(this.results.files)
            .sort(([,a], [,b]) => b.qualityScore - a.qualityScore);
        
        for (const [fileName, fileReview] of filesByScore) {
            const score = fileReview.qualityScore;
            const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : score >= 50 ? '🟠' : '🔴';
            console.log(`  ${emoji} ${fileName}: ${score}/100`);
        }
        
        console.log(`\n🎯 OVERALL ASSESSMENT:`);
        if (averageQualityScore >= 90) {
            console.log('  ✅ EXCELLENT - All files are well-structured');
        } else if (averageQualityScore >= 70) {
            console.log('  🟡 GOOD - Most files are well-structured');
        } else if (averageQualityScore >= 50) {
            console.log('  🟠 FAIR - Several files need improvement');
        } else {
            console.log('  🔴 POOR - Major improvements needed');
        }
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const reviewer = new FileReviewer();
    
    try {
        const results = await reviewer.reviewAll();
        
        const resultsPath = path.join(reviewer.projectRoot, 'file-review-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${resultsPath}`);
        
    } catch (error) {
        console.error('❌ Review failed:', error);
        process.exit(1);
    }
}

export default FileReviewer;
