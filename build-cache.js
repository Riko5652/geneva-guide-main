#!/usr/bin/env node

/**
 * Auto Cache Busting Script
 * Run this script to automatically update all cache-busting versions
 * Usage: node build-cache.js
 */

import fs from 'fs';
import path from 'path';

// Generate version based on current timestamp
const VERSION = Date.now().toString();

console.log(`🔄 Updating cache versions to: ${VERSION}`);

// Files to update with their import patterns
const files = [
    {
        path: 'public/index.html',
        pattern: /src="\/js\/Main\.js\?v=[^"]*"/g,
        replacement: `src="/js/Main.js?v=${VERSION}"`
    },
    {
        path: 'public/js/Main.js',
        patterns: [
            { pattern: /from '\.\/ui\.js\?v=[^']*'/g, replacement: `from './ui.js?v=${VERSION}'` },
            { pattern: /from '\.\/handlers\.js\?v=[^']*'/g, replacement: `from './handlers.js?v=${VERSION}'` },
            { pattern: /from "\.\/Gemini\.js\?v=[^"]*"/g, replacement: `from "./Gemini.js?v=${VERSION}"` }
        ]
    },
    {
        path: 'public/js/handlers.js',
        patterns: [
            { pattern: /from '\.\/Main\.js\?v=[^']*'/g, replacement: `from './Main.js?v=${VERSION}'` },
            { pattern: /from '\.\/utils\.js\?v=[^']*'/g, replacement: `from './utils.js?v=${VERSION}'` },
            { pattern: /from '\.\/Gemini\.js\?v=[^']*'/g, replacement: `from './Gemini.js?v=${VERSION}'` },
            { pattern: /from '\.\/ui\.js\?v=[^']*'/g, replacement: `from './ui.js?v=${VERSION}'` },
            // dynamic imports
            { pattern: /import\('\.\/ui\.js\?v=[^']*'\)/g, replacement: `import('./ui.js?v=${VERSION}')` }
        ]
    },
    {
        path: 'public/js/ui.js',
        patterns: [
            { pattern: /from '\.\/Main\.js\?v=[^']*'/g, replacement: `from './Main.js?v=${VERSION}'` },
            { pattern: /from '\.\/services\.js\?v=[^']*'/g, replacement: `from './services.js?v=${VERSION}'` },
            { pattern: /from '\.\/utils\.js\?v=[^']*'/g, replacement: `from './utils.js?v=${VERSION}'` },
            { pattern: /from '\.\/Map\.js\?v=[^']*'/g, replacement: `from './Map.js?v=${VERSION}'` }
        ]
    },
    {
        path: 'public/js/services.js',
        patterns: [
            { pattern: /from '\.\/Main\.js\?v=[^']*'/g, replacement: `from './Main.js?v=${VERSION}'` },
            { pattern: /from '\.\/utils\.js\?v=[^']*'/g, replacement: `from './utils.js?v=${VERSION}'` },
            // dynamic imports
            { pattern: /import\('\.\/ui\.js\?v=[^']*'\)/g, replacement: `import('./ui.js?v=${VERSION}')` }
        ]
    },
    {
        path: 'public/js/utils.js',
        patterns: [
            { pattern: /from '\.\/Main\.js\?v=[^']*'/g, replacement: `from './Main.js?v=${VERSION}'` }
        ]
    },
    {
        path: 'public/js/Gemini.js',
        patterns: [
            { pattern: /from "\.\/utils\.js\?v=[^"]*"/g, replacement: `from "./utils.js?v=${VERSION}"` }
        ]
    },
    {
        path: 'public/js/Map.js',
        patterns: [
            { pattern: /from '\.\/Main\.js\?v=[^']*'/g, replacement: `from './Main.js?v=${VERSION}'` },
            { pattern: /from '\.\/utils\.js\?v=[^']*'/g, replacement: `from './utils.js?v=${VERSION}'` }
        ]
    }
];

// Process each file
files.forEach(fileConfig => {
    const filePath = fileConfig.path;
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    if (fileConfig.pattern && fileConfig.replacement) {
        // Single pattern replacement
        if (fileConfig.pattern.test(content)) {
            content = content.replace(fileConfig.pattern, fileConfig.replacement);
            updated = true;
        }
    } else if (fileConfig.patterns) {
        // Multiple pattern replacements
        fileConfig.patterns.forEach(({ pattern, replacement }) => {
            if (pattern.test(content)) {
                content = content.replace(pattern, replacement);
                updated = true;
            }
        });
    }
    
    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated: ${filePath}`);
    } else {
        console.log(`⏭️  No changes: ${filePath}`);
    }
});

console.log(`\n🎉 Cache busting complete! Version: ${VERSION}`);
console.log(`💡 All files now use version: ?v=${VERSION}`);
console.log(`🚀 Deploy your site for the changes to take effect.`);
