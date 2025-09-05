const fs = require('fs');
const path = require('path');

// Simple HTML template for documentation
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geneva Family Guide - Technical Documentation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        h1 { color: #0891b2; border-bottom: 3px solid #0891b2; padding-bottom: 10px; }
        h2 { color: #0891b2; margin-top: 30px; }
        h3 { color: #14b8a6; margin-top: 20px; }
        h4 { color: #374151; }
        
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            color: #7c3aed;
        }
        
        pre {
            background: #1f2937;
            color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
        }
        
        pre code {
            background: none;
            color: inherit;
            padding: 0;
        }
        
        blockquote {
            border-left: 4px solid #0891b2;
            padding-left: 15px;
            margin: 15px 0;
            color: #4b5563;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        
        th, td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
        }
        
        th {
            background: #f3f4f6;
            font-weight: 600;
        }
        
        .note {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        @media print {
            body { padding: 0; }
            h1, h2, h3 { page-break-after: avoid; }
            pre, table { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="note">
        <h2>📄 PDF Export Instructions</h2>
        <p><strong>To save this documentation as PDF:</strong></p>
        <ol>
            <li>Open this HTML file in your web browser (Chrome recommended)</li>
            <li>Press <code>Ctrl+P</code> (or <code>Cmd+P</code> on Mac)</li>
            <li>Select "Save as PDF" as the destination</li>
            <li>Choose "A4" paper size</li>
            <li>Enable "Background graphics" for colors</li>
            <li>Click "Save" and choose your location</li>
        </ol>
    </div>
    
    <h1>Geneva Family Guide - Technical Documentation</h1>
    <p><em>Generated: ${new Date().toLocaleDateString()}</em></p>
    
    {{CONTENT}}
</body>
</html>
`;

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Clean up
    html = html.replace(/<p><h/g, '<h');
    html = html.replace(/<\/h(\d)><\/p>/g, '</h$1>');
    html = html.replace(/<p><\/p>/g, '');
    
    return html;
}

// Combine both documents into one comprehensive guide
function createCombinedDocumentation() {
    console.log('📚 Creating combined documentation...\n');
    
    let combinedContent = '';
    
    // Read and combine documents
    try {
        // Technical Guide
        if (fs.existsSync('TECHNICAL_GUIDE.md')) {
            console.log('📄 Reading Technical Guide...');
            const technicalGuide = fs.readFileSync('TECHNICAL_GUIDE.md', 'utf8');
            combinedContent += technicalGuide + '\n\n<div style="page-break-after: always;"></div>\n\n';
        }
        
        // Architecture Review
        if (fs.existsSync('ARCHITECTURE_REVIEW.md')) {
            console.log('📄 Reading Architecture Review...');
            const architectureReview = fs.readFileSync('ARCHITECTURE_REVIEW.md', 'utf8');
            combinedContent += architectureReview;
        }
        
        // Convert to HTML
        console.log('🔄 Converting to HTML...');
        const htmlContent = convertMarkdownToHTML(combinedContent);
        
        // Create final HTML
        const finalHTML = htmlTemplate.replace('{{CONTENT}}', htmlContent);
        
        // Save HTML file
        const outputFile = 'Geneva_Family_Guide_Documentation.html';
        fs.writeFileSync(outputFile, finalHTML);
        
        console.log('\n✅ Documentation created successfully!');
        console.log(`📄 File: ${outputFile}`);
        console.log(`📏 Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
        console.log('\n📖 To create PDF:');
        console.log('   1. Open Geneva_Family_Guide_Documentation.html in Chrome');
        console.log('   2. Press Ctrl+P (or Cmd+P on Mac)');
        console.log('   3. Select "Save as PDF"');
        console.log('   4. Enable "Background graphics" option');
        console.log('   5. Click Save\n');
        
        // Also create a direct download link
        console.log('🌐 Alternative: Use online converter:');
        console.log('   - https://www.ilovepdf.com/html-to-pdf');
        console.log('   - https://pdfcrowd.com/');
        console.log('   - https://webtopdf.com/\n');
        
    } catch (error) {
        console.error('❌ Error creating documentation:', error);
    }
}

// Run the generation
createCombinedDocumentation();
