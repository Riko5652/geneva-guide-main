const fs = require('fs');
const path = require('path');

console.log('🔍 CURRENT STATE ANALYSIS AGAINST NFRs');
console.log('======================================');
console.log('');

// Analyze file sizes
const publicDir = './public';
const jsFiles = [];
const cssFiles = [];

function analyzeFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            analyzeFiles(filePath);
        } else {
            const size = stat.size;
            if (file.endsWith('.js')) {
                jsFiles.push({ name: file, size: size, path: filePath });
            } else if (file.endsWith('.css')) {
                cssFiles.push({ name: file, size: size, path: filePath });
            }
        }
    });
}

analyzeFiles(publicDir);

console.log('📊 BUNDLE SIZE ANALYSIS:');
console.log('=======================');
let totalJSSize = 0;
let totalCSSSize = 0;

console.log('JavaScript Files:');
jsFiles.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(1);
    totalJSSize += file.size;
    console.log(`  ${file.name}: ${sizeKB}KB`);
});

console.log('');
console.log('CSS Files:');
cssFiles.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(1);
    totalCSSSize += file.size;
    console.log(`  ${file.name}: ${sizeKB}KB`);
});

const totalSize = totalJSSize + totalCSSSize;
const totalSizeKB = (totalSize / 1024).toFixed(1);

console.log('');
console.log(`Total Bundle Size: ${totalSizeKB}KB`);
console.log(`NFR Target: < 500KB`);
console.log(`Status: ${totalSize < 500 * 1024 ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Check for critical issues
console.log('🚨 CRITICAL ISSUES ANALYSIS:');
console.log('============================');

// Check for missing error handling
const criticalFiles = [
    './public/js/Main.js',
    './public/js/ui.js',
    './public/js/handlers.js',
    './public/js/services.js'
];

let errorHandlingIssues = 0;
criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const tryCatchCount = (content.match(/try\s*{/g) || []).length;
        const catchCount = (content.match(/catch\s*\(/g) || []).length;
        
        if (tryCatchCount !== catchCount) {
            errorHandlingIssues++;
            console.log(`❌ ${file}: Mismatched try/catch blocks`);
        }
    }
});

if (errorHandlingIssues === 0) {
    console.log('✅ Error handling: Properly implemented');
} else {
    console.log(`❌ Error handling: ${errorHandlingIssues} issues found`);
}

// Check for accessibility issues
console.log('');
console.log('♿ ACCESSIBILITY ANALYSIS:');
console.log('=========================');

const htmlContent = fs.readFileSync('./public/index.html', 'utf8');
const ariaLabels = (htmlContent.match(/aria-label/g) || []).length;
const roleAttributes = (htmlContent.match(/role=/g) || []).length;
const altAttributes = (htmlContent.match(/alt=/g) || []).length;

console.log(`ARIA labels: ${ariaLabels}`);
console.log(`Role attributes: ${roleAttributes}`);
console.log(`Alt attributes: ${altAttributes}`);

if (ariaLabels > 10 && roleAttributes > 5) {
    console.log('✅ Accessibility: Good ARIA implementation');
} else {
    console.log('⚠️ Accessibility: Needs improvement');
}

// Check for security issues
console.log('');
console.log('🔒 SECURITY ANALYSIS:');
console.log('====================');

const netlifyConfig = fs.readFileSync('./netlify.toml', 'utf8');
const hasCSP = netlifyConfig.includes('Content-Security-Policy');
const hasHTTPS = netlifyConfig.includes('Strict-Transport-Security');

console.log(`CSP Headers: ${hasCSP ? '✅' : '❌'}`);
console.log(`HTTPS Enforcement: ${hasHTTPS ? '✅' : '❌'}`);

// Check for performance issues
console.log('');
console.log('🚀 PERFORMANCE ANALYSIS:');
console.log('========================');

const hasLazyLoading = htmlContent.includes('loading="lazy"');
const hasPreload = htmlContent.includes('rel="preload"');
const hasAsync = htmlContent.includes('async');

console.log(`Lazy Loading: ${hasLazyLoading ? '✅' : '❌'}`);
console.log(`Resource Preloading: ${hasPreload ? '✅' : '❌'}`);
console.log(`Async Loading: ${hasAsync ? '✅' : '❌'}`);

// Check for responsive design issues
console.log('');
console.log('📱 RESPONSIVE DESIGN ANALYSIS:');
console.log('==============================');

const cssContent = fs.readFileSync('./public/CSS/style.css', 'utf8');
const mediaQueries = (cssContent.match(/@media/g) || []).length;
const hasMobileBreakpoint = cssContent.includes('max-width: 640px') || cssContent.includes('max-width: 768px');
const hasTabletBreakpoint = cssContent.includes('768px') && cssContent.includes('1024px');
const hasDesktopBreakpoint = cssContent.includes('min-width: 1024px');

console.log(`Media Queries: ${mediaQueries}`);
console.log(`Mobile Breakpoint: ${hasMobileBreakpoint ? '✅' : '❌'}`);
console.log(`Tablet Breakpoint: ${hasTabletBreakpoint ? '✅' : '❌'}`);
console.log(`Desktop Breakpoint: ${hasDesktopBreakpoint ? '✅' : '❌'}`);

// Check for maintainability issues
console.log('');
console.log('🔧 MAINTAINABILITY ANALYSIS:');
console.log('============================');

let totalLines = 0;
let totalComments = 0;

jsFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
        const content = fs.readFileSync(file.path, 'utf8');
        const lines = content.split('\n').length;
        const comments = (content.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm) || []).length;
        totalLines += lines;
        totalComments += comments;
    }
});

const commentRatio = totalComments / totalLines;
console.log(`Total Lines of Code: ${totalLines}`);
console.log(`Total Comments: ${totalComments}`);
console.log(`Comment Ratio: ${(commentRatio * 100).toFixed(1)}%`);
console.log(`Maintainability: ${commentRatio > 0.1 ? '✅ Good' : '⚠️ Needs improvement'}`);

console.log('');
console.log('📋 NFR COMPLIANCE SUMMARY:');
console.log('==========================');
console.log('Performance: Bundle size analysis completed');
console.log('Security: CSP and HTTPS headers checked');
console.log('Accessibility: ARIA implementation verified');
console.log('Responsive Design: Breakpoints validated');
console.log('Maintainability: Code documentation assessed');
console.log('Error Handling: Try/catch blocks verified');
