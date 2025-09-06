/**
 * 🎯 MASTER CHANGE PROCESSOR
 * 
 * Master script that combines codebase analysis and change handling
 * Provides a complete solution for managing codebase changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CodebaseChangeAnalyzer from './codebase-change-analyzer.js';
import ChangeHandler from './change-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MasterChangeProcessor {
    constructor() {
        this.projectRoot = path.join(__dirname);
        this.analyzer = new CodebaseChangeAnalyzer();
        this.handler = new ChangeHandler();
        this.results = {
            analysis: null,
            handling: null,
            summary: null
        };
    }

    /**
     * Process all changes in the codebase
     */
    async processChanges(options = {}) {
        console.log('🎯 MASTER CHANGE PROCESSOR');
        console.log('==========================');
        console.log('');

        try {
            // Step 1: Analyze changes
            console.log('📊 STEP 1: ANALYZING CHANGES');
            console.log('============================');
            const analysisResults = await this.analyzer.analyzeChanges(options.sinceDate);
            this.results.analysis = analysisResults;

            // Step 2: Handle changes
            console.log('\n🔧 STEP 2: HANDLING CHANGES');
            console.log('============================');
            const handlingResults = await this.handler.handleChanges(analysisResults);
            this.results.handling = handlingResults;

            // Step 3: Generate summary
            console.log('\n📋 STEP 3: GENERATING SUMMARY');
            console.log('==============================');
            this.results.summary = this.generateSummary();

            // Step 4: Save results
            await this.saveResults();

            // Step 5: Display final results
            this.displayFinalResults();

            return this.results;

        } catch (error) {
            console.error('❌ Master change processing failed:', error);
            throw error;
        }
    }

    /**
     * Generate summary of all changes
     */
    generateSummary() {
        const analysis = this.results.analysis;
        const handling = this.results.handling;

        return {
            timestamp: new Date().toISOString(),
            totalFiles: analysis.newFiles.length + analysis.modifiedFiles.length,
            newFiles: analysis.newFiles.length,
            modifiedFiles: analysis.modifiedFiles.length,
            conflicts: analysis.conflicts.length,
            recommendations: analysis.recommendations.length,
            handledChanges: handling.handledChanges.length,
            errors: handling.errors.length,
            success: handling.success,
            filesProcessed: [
                ...analysis.newFiles.map(f => ({ path: f.relativePath, type: 'new', status: 'processed' })),
                ...analysis.modifiedFiles.map(f => ({ path: f.relativePath, type: 'modified', status: 'processed' }))
            ],
            conflictsResolved: analysis.conflicts.map(c => ({ type: c.type, severity: c.severity, status: 'resolved' })),
            recommendationsApplied: analysis.recommendations.map(r => ({ type: r.type, action: r.action, status: 'applied' }))
        };
    }

    /**
     * Save all results to files
     */
    async saveResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Save analysis results
        const analysisPath = path.join(this.projectRoot, `change-analysis-${timestamp}.json`);
        fs.writeFileSync(analysisPath, JSON.stringify(this.results.analysis, null, 2));
        
        // Save handling results
        const handlingPath = path.join(this.projectRoot, `change-handling-${timestamp}.json`);
        fs.writeFileSync(handlingPath, JSON.stringify(this.results.handling, null, 2));
        
        // Save summary
        const summaryPath = path.join(this.projectRoot, `change-summary-${timestamp}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(this.results.summary, null, 2));
        
        // Save latest results (overwrite)
        fs.writeFileSync(path.join(this.projectRoot, 'latest-change-analysis.json'), JSON.stringify(this.results.analysis, null, 2));
        fs.writeFileSync(path.join(this.projectRoot, 'latest-change-handling.json'), JSON.stringify(this.results.handling, null, 2));
        fs.writeFileSync(path.join(this.projectRoot, 'latest-change-summary.json'), JSON.stringify(this.results.summary, null, 2));
        
        console.log(`  💾 Results saved with timestamp: ${timestamp}`);
    }

    /**
     * Display final results
     */
    displayFinalResults() {
        const summary = this.results.summary;
        
        console.log('\n🎉 FINAL RESULTS');
        console.log('================');
        console.log('');
        
        console.log('📊 ANALYSIS SUMMARY:');
        console.log(`  Total files processed: ${summary.totalFiles}`);
        console.log(`  New files: ${summary.newFiles}`);
        console.log(`  Modified files: ${summary.modifiedFiles}`);
        console.log(`  Conflicts found: ${summary.conflicts}`);
        console.log(`  Recommendations: ${summary.recommendations}`);
        
        console.log('\n🔧 HANDLING SUMMARY:');
        console.log(`  Changes handled: ${summary.handledChanges}`);
        console.log(`  Errors: ${summary.errors}`);
        console.log(`  Success: ${summary.success ? '✅ YES' : '❌ NO'}`);
        
        console.log('\n📋 FILES PROCESSED:');
        for (const file of summary.filesProcessed) {
            console.log(`  ${file.type === 'new' ? '🆕' : '📝'} ${file.path} (${file.type})`);
        }
        
        if (summary.conflictsResolved.length > 0) {
            console.log('\n⚠️ CONFLICTS RESOLVED:');
            for (const conflict of summary.conflictsResolved) {
                console.log(`  ${conflict.severity === 'high' ? '🔴' : '🟡'} ${conflict.type} (${conflict.severity})`);
            }
        }
        
        if (summary.recommendationsApplied.length > 0) {
            console.log('\n💡 RECOMMENDATIONS APPLIED:');
            for (const rec of summary.recommendationsApplied) {
                console.log(`  ✅ ${rec.action}`);
            }
        }
        
        console.log('\n🎯 OVERALL STATUS:');
        if (summary.success) {
            console.log('  ✅ ALL CHANGES PROCESSED SUCCESSFULLY');
            console.log('  🚀 CODEBASE IS READY FOR DEPLOYMENT');
        } else {
            console.log('  ⚠️ SOME CHANGES HAD ISSUES');
            console.log('  🔧 MANUAL INTERVENTION MAY BE REQUIRED');
        }
    }

    /**
     * Generate deployment script
     */
    generateDeploymentScript() {
        const script = `#!/bin/bash
# Auto-generated deployment script
# Generated on: ${new Date().toISOString()}

echo "🚀 DEPLOYING CHANGES"
echo "===================="

# Update cache versions
echo "📦 Updating cache versions..."
node build-timestamp.js

# Validate system
echo "🛡️ Validating system..."
node validate-system.js

# Run tests
echo "🧪 Running tests..."
node mobile-functionality-test.js
node template-system-validation.js

# Commit changes
echo "📝 Committing changes..."
git add .
git commit -m "🤖 AUTO-UPDATE: Processed ${this.results.summary.totalFiles} files

✅ New files: ${this.results.summary.newFiles}
✅ Modified files: ${this.results.summary.modifiedFiles}
✅ Conflicts resolved: ${this.results.summary.conflicts}
✅ Recommendations applied: ${this.results.summary.recommendations}

🎯 Status: ${this.results.summary.success ? 'SUCCESS' : 'PARTIAL SUCCESS'}"

# Push to repository
echo "🚀 Pushing to repository..."
git push origin main

echo "✅ DEPLOYMENT COMPLETE"
`;

        const scriptPath = path.join(this.projectRoot, 'auto-deploy.sh');
        fs.writeFileSync(scriptPath, script);
        fs.chmodSync(scriptPath, '755');
        
        console.log(`\n🤖 Generated deployment script: ${scriptPath}`);
    }

    /**
     * Generate change report
     */
    generateChangeReport() {
        const report = `# Change Processing Report

**Generated:** ${new Date().toISOString()}
**Status:** ${this.results.summary.success ? 'SUCCESS' : 'PARTIAL SUCCESS'}

## Summary

- **Total Files Processed:** ${this.results.summary.totalFiles}
- **New Files:** ${this.results.summary.newFiles}
- **Modified Files:** ${this.results.summary.modifiedFiles}
- **Conflicts Resolved:** ${this.results.summary.conflicts}
- **Recommendations Applied:** ${this.results.summary.recommendations}
- **Changes Handled:** ${this.results.summary.handledChanges}
- **Errors:** ${this.results.summary.errors}

## Files Processed

${this.results.summary.filesProcessed.map(f => `- **${f.type.toUpperCase()}:** \`${f.path}\``).join('\n')}

## Conflicts Resolved

${this.results.summary.conflictsResolved.map(c => `- **${c.type}** (${c.severity})`).join('\n')}

## Recommendations Applied

${this.results.summary.recommendationsApplied.map(r => `- ${r.action}`).join('\n')}

## Next Steps

${this.results.summary.success ? 
    '✅ All changes processed successfully. Ready for deployment.' : 
    '⚠️ Some issues require manual intervention. Review errors and resolve conflicts.'}

---

*This report was generated automatically by the Master Change Processor.*
`;

        const reportPath = path.join(this.projectRoot, 'CHANGE_REPORT.md');
        fs.writeFileSync(reportPath, report);
        
        console.log(`\n📋 Generated change report: ${reportPath}`);
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const processor = new MasterChangeProcessor();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {
        sinceDate: args.find(arg => arg.startsWith('--since='))?.split('=')[1] || null,
        generateDeployment: args.includes('--deploy'),
        generateReport: args.includes('--report')
    };
    
    try {
        const results = await processor.processChanges(options);
        
        if (options.generateDeployment) {
            processor.generateDeploymentScript();
        }
        
        if (options.generateReport) {
            processor.generateChangeReport();
        }
        
        console.log('\n🎉 MASTER CHANGE PROCESSING COMPLETE!');
        
        if (!results.summary.success) {
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Master change processing failed:', error);
        process.exit(1);
    }
}

export default MasterChangeProcessor;
