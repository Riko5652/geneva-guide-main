const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

// Custom CSS for beautiful PDF output
const pdfStyles = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono&display=swap');
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: #1f2937;
        background: #ffffff;
        padding: 40px;
        max-width: 210mm;
        margin: 0 auto;
    }
    
    h1 {
        color: #0891b2;
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 3px solid #0891b2;
        page-break-after: avoid;
    }
    
    h2 {
        color: #0891b2;
        font-size: 2rem;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 1rem;
        page-break-after: avoid;
    }
    
    h3 {
        color: #14b8a6;
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        page-break-after: avoid;
    }
    
    h4 {
        color: #374151;
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
    }
    
    p {
        margin-bottom: 1rem;
        text-align: justify;
    }
    
    ul, ol {
        margin-bottom: 1rem;
        padding-left: 2rem;
    }
    
    li {
        margin-bottom: 0.5rem;
    }
    
    code {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        background-color: #f3f4f6;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.875em;
        color: #7c3aed;
    }
    
    pre {
        background-color: #1f2937;
        color: #f9fafb;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        line-height: 1.5;
        page-break-inside: avoid;
    }
    
    pre code {
        background-color: transparent;
        color: inherit;
        padding: 0;
    }
    
    blockquote {
        border-left: 4px solid #0891b2;
        padding-left: 1rem;
        margin: 1rem 0;
        font-style: italic;
        color: #4b5563;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
        page-break-inside: avoid;
    }
    
    th, td {
        border: 1px solid #e5e7eb;
        padding: 0.75rem;
        text-align: left;
    }
    
    th {
        background-color: #f3f4f6;
        font-weight: 600;
        color: #374151;
    }
    
    hr {
        border: none;
        border-top: 2px solid #e5e7eb;
        margin: 2rem 0;
    }
    
    a {
        color: #0891b2;
        text-decoration: none;
    }
    
    strong {
        font-weight: 600;
        color: #111827;
    }
    
    .page-break {
        page-break-after: always;
    }
    
    .cover-page {
        text-align: center;
        padding: 100px 40px;
        page-break-after: always;
    }
    
    .cover-page h1 {
        font-size: 3rem;
        border: none;
        margin-bottom: 2rem;
    }
    
    .cover-page .subtitle {
        font-size: 1.5rem;
        color: #6b7280;
        margin-bottom: 3rem;
    }
    
    .cover-page .date {
        font-size: 1rem;
        color: #9ca3af;
    }
    
    .toc {
        page-break-after: always;
    }
    
    .toc h2 {
        margin-bottom: 2rem;
    }
    
    .toc ul {
        list-style: none;
        padding-left: 0;
    }
    
    .toc li {
        margin-bottom: 0.75rem;
        padding-left: 2rem;
        position: relative;
    }
    
    .toc li:before {
        content: "▸";
        position: absolute;
        left: 0;
        color: #0891b2;
    }
    
    @media print {
        body {
            padding: 0;
        }
    }
</style>
`;

async function generatePDF(markdownFile, outputFile) {
    try {
        console.log(`📄 Reading ${markdownFile}...`);
        const markdown = fs.readFileSync(markdownFile, 'utf8');
        
        console.log('🔄 Converting markdown to HTML...');
        const htmlContent = marked(markdown);
        
        // Create full HTML document with styles
        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geneva Family Guide - Technical Documentation</title>
    ${pdfStyles}
</head>
<body>
    <div class="cover-page">
        <h1>Geneva Family Guide</h1>
        <p class="subtitle">Technical Documentation & Architecture Guide</p>
        <p class="date">Generated: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}</p>
    </div>
    
    ${htmlContent}
    
    <div class="page-break"></div>
    <div style="text-align: center; padding: 40px; color: #6b7280;">
        <p><strong>Geneva Family Guide</strong></p>
        <p>Version 2.0.0</p>
        <p>Built with ❤️ for family adventures</p>
    </div>
</body>
</html>
        `;
        
        console.log('🚀 Launching Puppeteer...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        console.log('📝 Setting HTML content...');
        await page.setContent(fullHtml, {
            waitUntil: 'networkidle0'
        });
        
        console.log('🎨 Generating PDF...');
        await page.pdf({
            path: outputFile,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            },
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="width: 100%; font-size: 10px; color: #6b7280; text-align: center; padding: 10px 0;">
                    Geneva Family Guide - Technical Documentation
                </div>
            `,
            footerTemplate: `
                <div style="width: 100%; font-size: 10px; color: #6b7280; display: flex; justify-content: space-between; padding: 10px 40px;">
                    <span>© 2025 Dor Lipetz</span>
                    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                </div>
            `
        });
        
        await browser.close();
        
        console.log(`✅ PDF generated successfully: ${outputFile}`);
        console.log(`📏 File size: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        process.exit(1);
    }
}

// Generate PDFs for both documents
async function generateAllPDFs() {
    console.log('🎯 Starting PDF generation...\n');
    
    // Generate Technical Guide PDF
    await generatePDF('TECHNICAL_GUIDE.md', 'Geneva_Family_Guide_Technical_Documentation.pdf');
    
    console.log('\n');
    
    // Generate Architecture Review PDF
    await generatePDF('ARCHITECTURE_REVIEW.md', 'Geneva_Family_Guide_Architecture_Review.pdf');
    
    console.log('\n✨ All PDFs generated successfully!');
    console.log('📁 Files created:');
    console.log('   - Geneva_Family_Guide_Technical_Documentation.pdf');
    console.log('   - Geneva_Family_Guide_Architecture_Review.pdf');
}

// Run the generation
generateAllPDFs();
