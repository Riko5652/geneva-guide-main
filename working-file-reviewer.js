/**
 * 📁 WORKING FILE REVIEWER
 * 
 * A working version that actually displays results
 */

import fs from 'fs';
import path from 'path';

console.log('📁 WORKING FILE REVIEWER');
console.log('=========================');
console.log('');

try {
    const projectRoot = process.cwd();
    const results = { files: {}, folders: {} };

    // Review project structure
    console.log('📂 REVIEWING PROJECT STRUCTURE...');
    
    const folders = ['public', 'public/CSS', 'public/js', 'netlify'];
    
    for (const folder of folders) {
        const folderPath = path.join(projectRoot, folder);
        if (fs.existsSync(folderPath)) {
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
                    const type = getFileType(ext);
                    
                    if (!stats.fileTypes[type]) {
                        stats.fileTypes[type] = 0;
                    }
                    stats.fileTypes[type]++;
                    stats.totalSize += fileStat.size;
                    
                    checkFileIssues(filePath, file, stats.issues);
                }
            }
            
            results.folders[folder] = stats;
        }
    }

    // Review individual files
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
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            
            const fileReview = {
                size: stats.size,
                lines: content.split('\n').length,
                lastModified: stats.mtime,
                issues: [],
                qualityScore: 0
            };
            
            analyzeFileContent(content, file, fileReview);
            calculateQualityScore(fileReview);
            
            results.files[file] = fileReview;
        }
    }

    // Generate report
    console.log('\n📊 FILE REVIEW REPORT');
    console.log('=====================');
    
    const totalFiles = Object.keys(results.files).length;
    const totalIssues = Object.values(results.files).reduce((sum, file) => sum + file.issues.length, 0);
    const averageQualityScore = Object.values(results.files).reduce((sum, file) => sum + file.qualityScore, 0) / totalFiles;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`  Total Files Reviewed: ${totalFiles}`);
    console.log(`  Total Issues Found: ${totalIssues}`);
    console.log(`  Average Quality Score: ${Math.round(averageQualityScore)}/100`);
    
    console.log(`\n📄 FILES BY QUALITY SCORE:`);
    const filesByScore = Object.entries(results.files)
        .sort(([,a], [,b]) => b.qualityScore - a.qualityScore);
    
    for (const [fileName, fileReview] of filesByScore) {
        const score = fileReview.qualityScore;
        const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : score >= 50 ? '🟠' : '🔴';
        console.log(`  ${emoji} ${fileName}: ${score}/100`);
        
        if (fileReview.issues.length > 0) {
            for (const issue of fileReview.issues) {
                console.log(`    ${issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢'} ${issue.description}`);
            }
        }
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
    
    // Save results
    const resultsPath = path.join(projectRoot, 'file-review-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    console.log('\n🎉 FILE REVIEW COMPLETE!');
    
} catch (error) {
    console.error('❌ Review failed:', error);
    process.exit(1);
}

function getFileType(extension) {
    const types = {
        '.html': 'html',
        '.css': 'css',
        '.js': 'js',
        '.json': 'json'
    };
    return types[extension] || 'other';
}

function checkFileIssues(filePath, fileName, issues) {
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
            checkHTMLIssues(content, fileName, issues);
        } else if (ext === '.css') {
            checkCSSIssues(content, fileName, issues);
        } else if (ext === '.js') {
            checkJavaScriptIssues(content, fileName, issues);
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

function checkHTMLIssues(content, fileName, issues) {
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

function checkCSSIssues(content, fileName, issues) {
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

function checkJavaScriptIssues(content, fileName, issues) {
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

function analyzeFileContent(content, fileName, fileReview) {
    const ext = path.extname(fileName);
    
    if (ext === '.js') {
        analyzeJavaScriptContent(content, fileName, fileReview);
    } else if (ext === '.css') {
        analyzeCSSContent(content, fileName, fileReview);
    } else if (ext === '.html') {
        analyzeHTMLContent(content, fileName, fileReview);
    }
}

function analyzeJavaScriptContent(content, fileName, fileReview) {
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

function analyzeCSSContent(content, fileName, fileReview) {
    const selectors = content.match(/[.#][a-zA-Z-]+/g);
    
    if (selectors && selectors.length > 50) {
        fileReview.issues.push({
            type: 'large_css_file',
            severity: 'low',
            description: `Large CSS file with ${selectors.length} selectors`
        });
    }
}

function analyzeHTMLContent(content, fileName, fileReview) {
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

function calculateQualityScore(fileReview) {
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
