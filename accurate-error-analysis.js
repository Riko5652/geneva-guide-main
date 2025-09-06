import fs from 'fs';

console.log('🔍 ACCURATE ERROR HANDLING ANALYSIS');
console.log('===================================');
console.log('');

const files = [
    './public/js/Main.js',
    './public/js/handlers.js',
    './public/js/services.js',
    './public/js/ui.js',
    './public/js/utils.js'
];

files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = filePath.split('/').pop();
        
        // Count try blocks
        const tryBlocks = (content.match(/try\s*{/g) || []).length;
        
        // Count catch blocks
        const catchBlocks = (content.match(/catch\s*\(/g) || []).length;
        
        // Count finally blocks
        const finallyBlocks = (content.match(/finally\s*{/g) || []).length;
        
        console.log(`${fileName}:`);
        console.log(`  Try blocks: ${tryBlocks}`);
        console.log(`  Catch blocks: ${catchBlocks}`);
        console.log(`  Finally blocks: ${finallyBlocks}`);
        
        if (tryBlocks !== catchBlocks) {
            console.log(`  ❌ MISMATCH: ${tryBlocks} try blocks but ${catchBlocks} catch blocks`);
        } else {
            console.log(`  ✅ Balanced: ${tryBlocks} try/catch pairs`);
        }
        console.log('');
    }
});

// Check for specific error handling patterns
console.log('🔍 ERROR HANDLING PATTERNS:');
console.log('===========================');

files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = filePath.split('/').pop();
        
        // Check for async/await error handling
        const asyncFunctions = (content.match(/async\s+function/g) || []).length;
        const awaitStatements = (content.match(/await\s+/g) || []).length;
        
        // Check for Promise error handling
        const promiseCatch = (content.match(/\.catch\s*\(/g) || []).length;
        
        // Check for console.error usage
        const consoleErrors = (content.match(/console\.error/g) || []).length;
        const consoleWarns = (content.match(/console\.warn/g) || []).length;
        
        console.log(`${fileName}:`);
        console.log(`  Async functions: ${asyncFunctions}`);
        console.log(`  Await statements: ${awaitStatements}`);
        console.log(`  Promise .catch(): ${promiseCatch}`);
        console.log(`  console.error: ${consoleErrors}`);
        console.log(`  console.warn: ${consoleWarns}`);
        
        // Check if async functions have proper error handling
        if (asyncFunctions > 0 && awaitStatements > 0) {
            const hasErrorHandling = tryBlocks > 0 || promiseCatch > 0;
            if (!hasErrorHandling) {
                console.log(`  ⚠️ Async functions without error handling`);
            } else {
                console.log(`  ✅ Good error handling for async code`);
            }
        }
        console.log('');
    }
});
