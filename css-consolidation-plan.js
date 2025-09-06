import fs from 'fs';

console.log('🎨 CSS CONSOLIDATION PLAN');
console.log('========================');
console.log('');

// Read all CSS files
const cssFiles = [
    './public/CSS/style.css',
    './public/CSS/css-cleanup.css',
    './public/CSS/device-responsive.css',
    './public/CSS/ui-perfection.css',
    './public/CSS/flow-enhancements.css'
];

const allClasses = new Map();
const fileClasses = new Map();

// Analyze each CSS file
cssFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = filePath.split('/').pop();
        
        // Extract class definitions
        const classMatches = content.match(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g) || [];
        const classes = [...new Set(classMatches.map(match => match.substring(1)))];
        
        fileClasses.set(fileName, classes);
        
        classes.forEach(className => {
            if (allClasses.has(className)) {
                allClasses.get(className).push(fileName);
            } else {
                allClasses.set(className, [fileName]);
            }
        });
    }
});

// Find conflicts
const conflicts = [];
allClasses.forEach((files, className) => {
    if (files.length > 1) {
        conflicts.push({ className, files });
    }
});

console.log(`📊 ANALYSIS RESULTS:`);
console.log(`Total unique classes: ${allClasses.size}`);
console.log(`Conflicts found: ${conflicts.length}`);
console.log('');

console.log('🔍 CONFLICT ANALYSIS:');
console.log('====================');

// Group conflicts by severity
const highConflicts = conflicts.filter(c => c.files.length > 2);
const mediumConflicts = conflicts.filter(c => c.files.length === 2);

console.log(`High severity conflicts (3+ files): ${highConflicts.length}`);
console.log(`Medium severity conflicts (2 files): ${mediumConflicts.length}`);
console.log('');

// Show top conflicts
console.log('🚨 TOP 20 CONFLICTS:');
console.log('===================');
conflicts.slice(0, 20).forEach((conflict, index) => {
    console.log(`${index + 1}. ${conflict.className} - Found in: ${conflict.files.join(', ')}`);
});

console.log('');
console.log('📋 CONSOLIDATION STRATEGY:');
console.log('==========================');
console.log('');
console.log('1. KEEP style.css as the main CSS file (base styles)');
console.log('2. MERGE css-cleanup.css into style.css (remove duplicates)');
console.log('3. KEEP device-responsive.css (responsive-specific styles)');
console.log('4. MERGE ui-perfection.css into style.css (UI enhancements)');
console.log('5. KEEP flow-enhancements.css (flow-specific styles)');
console.log('');
console.log('6. REMOVE duplicate class definitions');
console.log('7. ORGANIZE CSS by component/feature');
console.log('8. REDUCE !important usage');
console.log('9. IMPLEMENT proper CSS cascade');
console.log('');

// Generate consolidation plan
console.log('🛠️ IMPLEMENTATION PLAN:');
console.log('======================');
console.log('');
console.log('Step 1: Backup current CSS files');
console.log('Step 2: Create new consolidated style.css');
console.log('Step 3: Merge css-cleanup.css into style.css');
console.log('Step 4: Merge ui-perfection.css into style.css');
console.log('Step 5: Update HTML to load only 3 CSS files:');
console.log('   - style.css (consolidated base + cleanup + UI perfection)');
console.log('   - device-responsive.css (responsive styles)');
console.log('   - flow-enhancements.css (flow-specific styles)');
console.log('Step 6: Test and validate');
console.log('');

// Calculate expected reduction
const totalClasses = Array.from(allClasses.keys()).length;
const uniqueClasses = conflicts.length;
const consolidatedClasses = totalClasses - uniqueClasses;

console.log('📈 EXPECTED RESULTS:');
console.log('===================');
console.log(`Current total classes: ${totalClasses}`);
console.log(`Conflicts to resolve: ${uniqueClasses}`);
console.log(`Expected unique classes: ${consolidatedClasses}`);
console.log(`Reduction: ${((uniqueClasses / totalClasses) * 100).toFixed(1)}%`);
console.log('');
console.log('✅ This will eliminate all CSS conflicts and improve maintainability');
