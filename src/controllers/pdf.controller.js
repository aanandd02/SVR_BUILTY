const puppeteer = require('puppeteer');
const { generatePDFHTML } = require('../templates/builty.template');

const COPY_LABELS = {
  all: 'all-copies',
  office: 'office-copy',
  consignor: 'consignor-copy',
  consignee: 'consignee-copy'
};

async function generatePDF(req, res) {
  try {
    const formData = req.body;
    const copyType = COPY_LABELS[formData.copyType] ? formData.copyType : 'all';

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const htmlContent = generatePDFHTML(formData, copyType);
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '8mm', bottom: '10mm', left: '8mm' }
    });

    await browser.close();

    const filename = `builty-${formData.consignmentNo || 'SVR'}-${COPY_LABELS[copyType]}-${Date.now()}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}

module.exports = { generatePDF };
