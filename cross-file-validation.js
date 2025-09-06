import fs from 'fs';
import path from 'path';

console.log('🔍 CROSS-FILE VALIDATION & CONFLICT DETECTION');
console.log('=============================================');
console.log('');

// Read all JavaScript files and analyze imports/exports
const jsFiles = [
    './public/js/Main.js',
    './public/js/ui.js',
    './public/js/handlers.js',
    './public/js/services.js',
    './public/js/utils.js',
    './public/js/flow-enhancements.js',
    './public/js/Gemini.js',
    './public/js/Map.js',
    './public/js/config.js',
    './public/js/version.js',
    './public/js/user-agent-adjuster.js',
    './public/js/loading.js',
    './public/js/toast.js',
    './public/js/animations.js'
];

const htmlFile = './public/index.html';
const cssFiles = [
    './public/CSS/style.css',
    './public/CSS/css-cleanup.css',
    './public/CSS/device-responsive.css',
    './public/CSS/ui-perfection.css',
    './public/CSS/flow-enhancements.css'
];

console.log('📋 IMPORT/EXPORT VALIDATION:');
console.log('============================');

const imports = new Map();
const exports = new Map();
const functions = new Map();
const variables = new Map();

// Analyze JavaScript files
jsFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        // Find imports
        const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
        const importSources = importMatches.map(imp => {
            const match = imp.match(/from\s+['"]([^'"]+)['"]/);
            return match ? match[1] : null;
        }).filter(Boolean);
        
        imports.set(fileName, importSources);
        
        // Find exports
        const exportMatches = content.match(/export\s+(?:function|const|let|var|class)\s+(\w+)/g) || [];
        const exportNames = exportMatches.map(exp => {
            const match = exp.match(/export\s+(?:function|const|let|var|class)\s+(\w+)/);
            return match ? match[1] : null;
        }).filter(Boolean);
        
        exports.set(fileName, exportNames);
        
        // Find function definitions
        const functionMatches = content.match(/function\s+(\w+)/g) || [];
        const functionNames = functionMatches.map(fn => {
            const match = fn.match(/function\s+(\w+)/);
            return match ? match[1] : null;
        }).filter(Boolean);
        
        functions.set(fileName, functionNames);
        
        // Find variable declarations
        const varMatches = content.match(/(?:const|let|var)\s+(\w+)/g) || [];
        const varNames = varMatches.map(v => {
            const match = v.match(/(?:const|let|var)\s+(\w+)/);
            return match ? match[1] : null;
        }).filter(Boolean);
        
        variables.set(fileName, varNames);
    }
});

// Check for import/export mismatches
console.log('Import/Export Analysis:');
let importIssues = 0;
imports.forEach((imports, file) => {
    imports.forEach(imp => {
        if (imp.startsWith('./') || imp.startsWith('../')) {
            const targetFile = imp.replace('./', '').replace('../', '');
            if (!exports.has(targetFile) && !fs.existsSync(`./public/js/${targetFile}`)) {
                console.log(`❌ ${file}: Import '${imp}' not found`);
                importIssues++;
            }
        }
    });
});

if (importIssues === 0) {
    console.log('✅ All imports are valid');
} else {
    console.log(`❌ Found ${importIssues} import issues`);
}

// Check for duplicate function names
console.log('');
console.log('🔍 DUPLICATE FUNCTION DETECTION:');
console.log('===============================');

const allFunctions = new Map();
functions.forEach((funcs, file) => {
    funcs.forEach(func => {
        if (allFunctions.has(func)) {
            console.log(`❌ Duplicate function '${func}' in ${file} and ${allFunctions.get(func)}`);
        } else {
            allFunctions.set(func, file);
        }
    });
});

// Check for duplicate variable names
console.log('');
console.log('🔍 DUPLICATE VARIABLE DETECTION:');
console.log('===============================');

const allVariables = new Map();
variables.forEach((vars, file) => {
    vars.forEach(variable => {
        if (allVariables.has(variable)) {
            console.log(`❌ Duplicate variable '${variable}' in ${file} and ${allVariables.get(variable)}`);
        } else {
            allVariables.set(variable, file);
        }
    });
});

// Analyze HTML references
console.log('');
console.log('🌐 HTML REFERENCE VALIDATION:');
console.log('============================');

const htmlContent = fs.readFileSync(htmlFile, 'utf8');

// Check CSS references
const cssRefs = htmlContent.match(/href="[^"]*\.css"/g) || [];
console.log('CSS References in HTML:');
cssRefs.forEach(ref => {
    const match = ref.match(/href="([^"]*\.css)"/);
    if (match) {
        const cssPath = match[1].replace('/', './public/');
        if (fs.existsSync(cssPath)) {
            console.log(`✅ ${match[1]}`);
        } else {
            console.log(`❌ ${match[1]} - File not found`);
        }
    }
});

// Check JavaScript references
const jsRefs = htmlContent.match(/src="[^"]*\.js"/g) || [];
console.log('');
console.log('JavaScript References in HTML:');
jsRefs.forEach(ref => {
    const match = ref.match(/src="([^"]*\.js)"/);
    if (match) {
        const jsPath = match[1].replace('/', './public/');
        if (fs.existsSync(jsPath)) {
            console.log(`✅ ${match[1]}`);
        } else {
            console.log(`❌ ${match[1]} - File not found`);
        }
    }
});

// Check for DOM element references
console.log('');
console.log('🎯 DOM ELEMENT REFERENCE VALIDATION:');
console.log('====================================');

const domRefs = new Set();
jsFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const getElementMatches = content.match(/getElementById\(['"]([^'"]+)['"]\)/g) || [];
        const querySelectorMatches = content.match(/querySelector\(['"]([^"]+)['"]\)/g) || [];
        
        getElementMatches.forEach(match => {
            const idMatch = match.match(/getElementById\(['"]([^'"]+)['"]\)/);
            if (idMatch) {
                domRefs.add(`#${idMatch[1]}`);
            }
        });
        
        querySelectorMatches.forEach(match => {
            const selectorMatch = match.match(/querySelector\(['"]([^"]+)['"]\)/);
            if (selectorMatch) {
                domRefs.add(selectorMatch[1]);
            }
        });
    }
});

// Check if DOM references exist in HTML
let domIssues = 0;
domRefs.forEach(selector => {
    if (selector.startsWith('#')) {
        const id = selector.substring(1);
        if (!htmlContent.includes(`id="${id}"`)) {
            console.log(`❌ Element with id '${id}' not found in HTML`);
            domIssues++;
        }
    } else if (selector.startsWith('.')) {
        const className = selector.substring(1);
        if (!htmlContent.includes(`class="${className}"`) && !htmlContent.includes(`class="[^"]*${className}[^"]*"`)) {
            console.log(`❌ Element with class '${className}' not found in HTML`);
            domIssues++;
        }
    }
});

if (domIssues === 0) {
    console.log('✅ All DOM references are valid');
} else {
    console.log(`❌ Found ${domIssues} DOM reference issues`);
}

// Check for CSS class conflicts
console.log('');
console.log('🎨 CSS CLASS CONFLICT DETECTION:');
console.log('===============================');

const cssClasses = new Map();
cssFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        // Find CSS class definitions
        const classMatches = content.match(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g) || [];
        const classes = [...new Set(classMatches.map(match => match.substring(1)))];
        
        classes.forEach(className => {
            if (cssClasses.has(className)) {
                console.log(`⚠️ Class '${className}' defined in both ${fileName} and ${cssClasses.get(className)}`);
            } else {
                cssClasses.set(className, fileName);
            }
        });
    }
});

// Check for CSS specificity conflicts
console.log('');
console.log('🎯 CSS SPECIFICITY ANALYSIS:');
console.log('============================');

cssFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        const importantCount = (content.match(/!important/g) || []).length;
        const idSelectors = (content.match(/#[a-zA-Z][a-zA-Z0-9_-]*/g) || []).length;
        const classSelectors = (content.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g) || []).length;
        
        console.log(`${fileName}:`);
        console.log(`  !important declarations: ${importantCount}`);
        console.log(`  ID selectors: ${idSelectors}`);
        console.log(`  Class selectors: ${classSelectors}`);
        
        if (importantCount > 50) {
            console.log(`  ⚠️ High !important usage may indicate specificity issues`);
        }
    }
});

console.log('');
console.log('📊 CROSS-FILE VALIDATION SUMMARY:');
console.log('=================================');
console.log('Import/Export validation: Completed');
console.log('Duplicate detection: Completed');
console.log('HTML reference validation: Completed');
console.log('DOM element validation: Completed');
console.log('CSS conflict detection: Completed');
console.log('CSS specificity analysis: Completed');
