/**
 * 🔧 WORKING CHANGE PROCESSOR
 * 
 * A working version that processes changes and displays results
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 WORKING CHANGE PROCESSOR');
console.log('===========================');
console.log('');

try {
    const projectRoot = process.cwd();
    const publicDir = path.join(projectRoot, 'public');
    
    console.log(`📁 Project root: ${projectRoot}`);
    console.log(`📁 Public directory: ${publicDir}`);
    console.log('');
    
    // Get all files in public directory
    const files = [];
    const getFilesRecursively = (dirPath) => {
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    getFilesRecursively(fullPath);
                } else if (stat.isFile()) {
                    files.push({
                        path: fullPath,
                        relativePath: path.relative(projectRoot, fullPath),
                        name: item,
                        extension: path.extname(item).slice(1),
                        size: stat.size,
                        created: stat.birthtime,
                        modified: stat.mtime
                    });
                }
            }
        } catch (error) {
            console.warn(`⚠️ Could not read directory ${dirPath}:`, error.message);
        }
    };
    
    getFilesRecursively(publicDir);
    console.log(`📊 Found ${files.length} files in public directory`);
    
    // Filter recent files (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentFiles = files.filter(file => {
        return file.created >= oneDayAgo || file.modified >= oneDayAgo;
    });
    
    console.log(`📊 Found ${recentFiles.length} recent files (last 24 hours)`);
    console.log('');
    
    // Categorize files
    const newFiles = recentFiles.filter(f => f.created >= oneDayAgo);
    const modifiedFiles = recentFiles.filter(f => f.modified >= oneDayAgo && f.created < oneDayAgo);
    
    console.log('🆕 NEW FILES:');
    for (const file of newFiles) {
        console.log(`  📄 ${file.relativePath} (${file.extension.toUpperCase()})`);
    }
    
    console.log('\n📝 MODIFIED FILES:');
    for (const file of modifiedFiles) {
        console.log(`  📄 ${file.relativePath} (${file.extension.toUpperCase()})`);
    }
    
    // Analyze JavaScript files
    const jsFiles = recentFiles.filter(f => f.extension === 'js');
    if (jsFiles.length > 0) {
        console.log('\n🔍 JAVASCRIPT ANALYSIS:');
        for (const file of jsFiles) {
            console.log(`  📄 ${file.relativePath}:`);
            
            try {
                const content = fs.readFileSync(file.path, 'utf8');
                
                // Find exports
                const exports = content.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g);
                if (exports) {
                    console.log(`    Exports: ${exports.length}`);
                    exports.forEach(exp => {
                        const name = exp.match(/(?:function|class|const|let|var)\s+(\w+)/)[1];
                        console.log(`      - ${name}`);
                    });
                }
                
                // Find imports
                const imports = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
                if (imports) {
                    console.log(`    Imports: ${imports.length}`);
                    imports.forEach(imp => {
                        const module = imp.match(/from\s+['"]([^'"]+)['"]/)[1];
                        console.log(`      - ${module}`);
                    });
                }
                
                // Find functions
                const functions = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g);
                if (functions) {
                    console.log(`    Functions: ${functions.length}`);
                }
                
                // Find classes
                const classes = content.match(/(?:export\s+)?class\s+(\w+)/g);
                if (classes) {
                    console.log(`    Classes: ${classes.length}`);
                }
                
            } catch (error) {
                console.log(`    ❌ Error reading file: ${error.message}`);
            }
        }
    }
    
    // Analyze CSS files
    const cssFiles = recentFiles.filter(f => f.extension === 'css');
    if (cssFiles.length > 0) {
        console.log('\n🎨 CSS ANALYSIS:');
        for (const file of cssFiles) {
            console.log(`  📄 ${file.relativePath}:`);
            
            try {
                const content = fs.readFileSync(file.path, 'utf8');
                
                // Find CSS selectors
                const selectors = content.match(/([.#][\w-]+)/g);
                if (selectors) {
                    const uniqueSelectors = [...new Set(selectors)];
                    console.log(`    Selectors: ${uniqueSelectors.length}`);
                }
                
                // Find custom properties
                const customProps = content.match(/--[\w-]+/g);
                if (customProps) {
                    const uniqueProps = [...new Set(customProps)];
                    console.log(`    Custom Properties: ${uniqueProps.length}`);
                }
                
                // Find media queries
                const mediaQueries = content.match(/@media\s+[^{]+/g);
                if (mediaQueries) {
                    console.log(`    Media Queries: ${mediaQueries.length}`);
                }
                
            } catch (error) {
                console.log(`    ❌ Error reading file: ${error.message}`);
            }
        }
    }
    
    // Generate recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    // New JS files
    const newJsFiles = newFiles.filter(f => f.extension === 'js');
    if (newJsFiles.length > 0) {
        console.log('  🔴 HIGH PRIORITY:');
        for (const file of newJsFiles) {
            console.log(`    - Add ${file.relativePath} to cache manifest and version system`);
        }
    }
    
    // New CSS files
    const newCssFiles = newFiles.filter(f => f.extension === 'css');
    if (newCssFiles.length > 0) {
        console.log('  🔴 HIGH PRIORITY:');
        for (const file of newCssFiles) {
            console.log(`    - Add ${file.relativePath} to HTML and CSS versioning system`);
        }
    }
    
    // Modified files
    if (modifiedFiles.length > 0) {
        console.log('  🟡 MEDIUM PRIORITY:');
        for (const file of modifiedFiles) {
            console.log(`    - Update cache version for ${file.relativePath}`);
        }
    }
    
    // Handle changes
    console.log('\n🔧 HANDLING CHANGES:');
    
    // Update cache manifest
    console.log('📦 Updating cache manifest...');
    try {
        const manifestPath = path.join(projectRoot, 'public', 'cache-manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const timestamp = Date.now().toString();
        
        // Update version
        manifest.version = timestamp;
        manifest.timestamp = new Date().toISOString();
        
        // Add new files
        for (const file of newFiles) {
            const fileName = path.basename(file.relativePath);
            if (!manifest.files[fileName]) {
                manifest.files[fileName] = timestamp;
                console.log(`  ✅ Added ${fileName} to cache manifest`);
            }
        }
        
        // Update modified files
        for (const file of modifiedFiles) {
            const fileName = path.basename(file.relativePath);
            if (manifest.files[fileName]) {
                manifest.files[fileName] = timestamp;
                console.log(`  ✅ Updated cache version for ${fileName}`);
            }
        }
        
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log('  ✅ Cache manifest updated');
        
    } catch (error) {
        console.error('  ❌ Failed to update cache manifest:', error.message);
    }
    
    // Update HTML
    console.log('🌐 Updating HTML...');
    try {
        const htmlPath = path.join(projectRoot, 'public', 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Update build timestamp
        const timestamp = Date.now().toString();
        html = html.replace(/content="\d+"/, `content="${timestamp}"`);
        
        // Add new CSS files
        for (const file of newCssFiles) {
            const fileName = path.basename(file.relativePath);
            const cssTag = `    <link rel="stylesheet" href="/CSS/${fileName}" id="css-${fileName.replace('.css', '')}">\n`;
            
            // Check if already exists
            if (!html.includes(`href="/CSS/${fileName}"`)) {
                // Find the last CSS link and add after it
                const lastCSSIndex = html.lastIndexOf('rel="stylesheet"');
                if (lastCSSIndex !== -1) {
                    const insertIndex = html.indexOf('>', lastCSSIndex) + 1;
                    html = html.slice(0, insertIndex) + cssTag + html.slice(insertIndex);
                    console.log(`  ✅ Added ${fileName} to HTML`);
                }
            }
        }
        
        // Add new JS files
        for (const file of newJsFiles) {
            const fileName = path.basename(file.relativePath);
            const scriptTag = `    <script type="module" src="/js/${fileName}"></script>\n`;
            
            // Check if already exists
            if (!html.includes(`src="/js/${fileName}"`)) {
                // Find the last script tag and add after it
                const lastScriptIndex = html.lastIndexOf('</script>');
                if (lastScriptIndex !== -1) {
                    const insertIndex = lastScriptIndex + 9; // After </script>
                    html = html.slice(0, insertIndex) + scriptTag + html.slice(insertIndex);
                    console.log(`  ✅ Added ${fileName} to HTML`);
                }
            }
        }
        
        fs.writeFileSync(htmlPath, html);
        console.log('  ✅ HTML updated');
        
    } catch (error) {
        console.error('  ❌ Failed to update HTML:', error.message);
    }
    
    // Save results
    const results = {
        timestamp: new Date().toISOString(),
        totalFiles: recentFiles.length,
        newFiles: newFiles.length,
        modifiedFiles: modifiedFiles.length,
        jsFiles: jsFiles.length,
        cssFiles: cssFiles.length,
        files: recentFiles.map(f => ({
            path: f.relativePath,
            type: f.created >= oneDayAgo ? 'new' : 'modified',
            extension: f.extension,
            size: f.size
        }))
    };
    
    const resultsPath = path.join(projectRoot, 'change-processing-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsPath}`);
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`  Total files processed: ${recentFiles.length}`);
    console.log(`  New files: ${newFiles.length}`);
    console.log(`  Modified files: ${modifiedFiles.length}`);
    console.log(`  JavaScript files: ${jsFiles.length}`);
    console.log(`  CSS files: ${cssFiles.length}`);
    
    console.log('\n🎉 CHANGE PROCESSING COMPLETE!');
    
} catch (error) {
    console.error('❌ Change processing failed:', error);
    process.exit(1);
}
