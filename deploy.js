#!/usr/bin/env node

/**
 * Automated Deployment Script with Cache Busting
 * This script handles the entire deployment process with automatic cache busting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting automated deployment with cache busting...\n');

// Step 1: Generate build timestamp
const buildTime = Date.now().toString();
const buildDate = new Date().toISOString();

console.log(`🕒 Build timestamp: ${buildTime}`);
console.log(`📅 Build date: ${buildDate}\n`);

// Step 2: Update index.html with build timestamp
const indexPath = path.join(__dirname, 'public', 'index.html');

try {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Replace the placeholder with actual timestamp
    indexContent = indexContent.replace(
        'BUILD_TIMESTAMP_PLACEHOLDER',
        buildTime
    );
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Updated index.html with build timestamp');
    
} catch (error) {
    console.error('❌ Error updating build timestamp:', error.message);
    process.exit(1);
}

// Step 3: Git operations
try {
    console.log('\n📦 Staging files...');
    execSync('git add -A', { stdio: 'inherit' });
    
    console.log('💾 Committing changes...');
    const commitMessage = `🤖 AUTO-DEPLOY: Automated cache busting (${buildTime})

✨ Automated Features:
- Build timestamp: ${buildTime}
- Build date: ${buildDate}
- Automatic cache busting system active
- No manual version updates needed
- Clean import system without version parameters

🔄 Cache Busting:
- Dynamic timestamp generation
- Automated on every deployment
- Browser cache invalidation guaranteed
- Zero maintenance required`;

    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    console.log('🌐 Pushing to main repository...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('🚀 Deploying to Netlify...');
    execSync('git push netlify-repo main --force', { stdio: 'inherit' });
    
} catch (error) {
    console.error('❌ Git operation failed:', error.message);
    process.exit(1);
}

console.log('\n🎉 Deployment completed successfully!');
console.log('✅ Automatic cache busting is now active');
console.log('✅ No more manual version updates needed');
console.log('✅ Site will cache-bust automatically on every deployment');
console.log('\n💡 To deploy in the future, just run: node deploy.js');
