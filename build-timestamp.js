#!/usr/bin/env node

/**
 * Automated Build Timestamp Injection
 * This script automatically injects the current timestamp into index.html
 * Run this before deployment to ensure automatic cache busting
 */

const fs = require('fs');
const path = require('path');

// Generate current timestamp
const buildTime = Date.now().toString();
const buildDate = new Date().toISOString();

console.log(`🕒 Generating build timestamp: ${buildTime}`);
console.log(`📅 Build date: ${buildDate}`);

// Update index.html with build timestamp
const indexPath = path.join(__dirname, 'public', 'index.html');

try {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Replace the placeholder with actual timestamp
    indexContent = indexContent.replace(
        'BUILD_TIMESTAMP_PLACEHOLDER',
        buildTime
    );
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Successfully updated index.html with build timestamp');
    
} catch (error) {
    console.error('❌ Error updating build timestamp:', error.message);
    process.exit(1);
}

// Update version.js with build info (optional)
const versionPath = path.join(__dirname, 'public', 'js', 'version.js');

try {
    let versionContent = fs.readFileSync(versionPath, 'utf8');
    
    // Add build info as comment
    const buildInfo = `// Auto-generated build info: ${buildDate} (${buildTime})\n`;
    
    if (!versionContent.includes('Auto-generated build info:')) {
        versionContent = buildInfo + versionContent;
        fs.writeFileSync(versionPath, versionContent);
        console.log('✅ Successfully updated version.js with build info');
    }
    
} catch (error) {
    console.log('⚠️  Could not update version.js (this is optional)');
}

console.log('🚀 Build timestamp injection complete!');
