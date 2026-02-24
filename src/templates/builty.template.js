const { logoBase64 } = require('../utils/logo');

function generatePDFHTML(data, copyType = 'all') {
  const rows = data.items || [{}];
  let itemsHTML = '';

  for (let i = 0; i < Math.max(rows.length, 5); i++) {
    const item = rows[i] || {};
    itemsHTML += `
      <tr>
        <td class="cell pkg">${item.packages || ''}</td>
        <td class="cell method">${item.methodOfPacking || ''}</td>
        <td class="cell goods">${item.nameOfGoods || ''}</td>
        <td class="cell mark">${item.privateMark || ''}</td>
        <td class="cell actual">${item.actualWeight || ''}</td>
        <td class="cell charged">${item.chargedWeight || ''}</td>
        <td class="cell rate">${item.rate || ''}</td>
      </tr>`;
  }

  const check = (cond) => cond ? '<span class="tick">&#9745;</span>' : '<span class="tick">&#9744;</span>';

  const totalPackages = (data.items || []).reduce((sum, item) => sum + (parseInt(item.packages) || 0), 0);

  function buildCopyPage(copyLabel) {
    return `
<div class="container">
  <div class="header">
    <div class="header-content">
      ${logoBase64 ? `<img src="${logoBase64}" class="header-logo header-logo-left" alt="SVR">` : ''}
      <div class="header-text">
        <div class="hindi-blessing">॥ जय माँ विन्ध्यवासिनी ॥</div>
        <div class="company-name">Shree Vishwanath Roadways</div>
        <div class="tagline">SERVICE THROUGH COMMITMENT</div>
        <div class="subtitle">[Transport Contractors & Fleet Owners]</div>
        <div class="address">Plot No. 136-9-A, Near National Plywoods, II Phase GIDC Vapi-396 195.</div>
        <div class="address">Ph. No. 8000785431, 9033900300</div>
        <div class="address">E-mail : shreevishwanthtoadways@gmail.com, shreevishwanathroadways81@gmail.com</div>
      </div>
    </div>
  </div>

  <div class="copy-type-banner">${copyLabel}</div>
  <div class="cn-title">CONSIGNMENT NOTE</div>

  <div class="info-row">
    <span><span class="field-label">Date:</span> <span class="field-value">${data.date || ''}</span></span>
    <span><span class="field-label">No.:</span> <span class="field-value">${data.consignmentNo || ''}</span></span>
    <span><span class="field-label">Code No.:</span> <span class="field-value">${data.codeNo || ''}</span></span>
  </div>
  <div class="mid-section">
    <div class="caution-box">
      <div class="caution-title">CAUTION</div>
      <p>This Consignment will not be detained, delivered, re-routed, re-booked without Consignee Bank's written permission. Will be delivered at the destination.</p>
    </div>
    <div class="tax-box">
      <div><span class="field-label">PAN :</span> APLPT4893E</div>
      <div><span class="field-label">GST :</span> 24APLPT4893E1ZF</div>
      <div style="margin-top:4px; font-size:9px;">
        <span class="field-label">Person liable for paying service tax:</span><br>
        ${check(data.serviceTaxLiable === 'consignor')} Consignor
        ${check(data.serviceTaxLiable === 'consignee')} Consignee
        ${check(data.serviceTaxLiable === 'gta')} Goods Transport Agency
      </div>
    </div>
  </div>

  <div class="insurance-section">
    <div><span class="field-label">LORRY No. :</span> ${data.lorryNo || ''}</div>
    <div style="margin-top:2px;"><span class="field-label">INSURANCE:</span>
      ${check(data.insuranceStatus === 'not_insured')} The Customer has stated that he has not Insured the consignment<br>
      ${check(data.insuranceStatus === 'insured')} he has Insured the consignment with<br>
      <span class="field-label">Company:</span> ${data.insuranceCompany || ''} &nbsp;
      <span class="field-label">Policy No.:</span> ${data.policyNo || ''} &nbsp;
      <span class="field-label">Date:</span> ${data.policyDate || ''}<br>
      <span class="field-label">Amount:</span> ${data.insuranceAmount || ''} &nbsp;
      <span class="field-label">Risk:</span> ${data.insuranceRisk || ''}
    </div>
  </div>

  <div class="transport-section">
    <div class="transport-mode">
      <span class="field-label">Transport Mode:</span><br>
      ${check(data.transportMode === 'road')} 1) By Road<br>
      ${check(data.transportMode === 'train')} 2) By Train<br>
      ${check(data.transportMode === 'air')} 3) By Air
    </div>
    <div class="from-to">
      <div><span class="field-label">From:</span> ${data.from || ''}</div>
      <div><span class="field-label">To:</span> ${data.to || ''}</div>
    </div>
  </div>

  <div class="consignor-section">
    <div class="consignor-box">
      <span class="field-label">Consignor's Name & Address:</span><br>
      ${data.consignorName || ''}<br>
      ${data.consignorAddress || ''}
    </div>
    <div class="consignee-box">
      <span class="field-label">Consignee Name & Address:</span><br>
      ${data.consigneeName || ''}<br>
      ${data.consigneeAddress || ''}
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Packages</th>
        <th>Method of Packing</th>
        <th>Name of Goods said to Contain</th>
        <th>Private Mark</th>
        <th>Actual Kg.</th>
        <th>Charged Kg.</th>
        <th>Rate</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <div class="items-summary">
    <span><span class="field-label">Total Packages:</span> <span class="field-value">${totalPackages || ''}</span></span>
    <span><span class="field-label">Value (Rs.):</span> <span class="field-value">${data.goodsValue || ''}</span></span>
  </div>

  <div class="charges-section">
    <div class="charges-left">
      <div class="charge-row"><span class="label">Freight Per Kg./Cft.:</span> <span class="value">${data.freightPer || ''}</span></div>
      <div class="charge-row"><span class="label">To pay / Paid / Due:</span> <span class="value">${data.paymentStatus || ''}</span></div>
      <div class="endorsement-in-charges">
        <div class="endorsement-title">ENDORSEMENT:</div>
        <p>1. Not Negotiable with any Bank of Financial Institute.</p>
        <p>2. Not responsible for any leakage and breakage.</p>
      </div>
    </div>
    <div class="charges-right">
      <div class="charge-row"><span class="label">Service Tax:</span> <span class="value">Rs. ${data.serviceTax || ''}</span></div>
      <div class="charge-row"><span class="label">Cover Charge:</span> <span class="value">Rs. ${data.coverCharge || ''}</span></div>
      <div class="charge-row"><span class="label">Hamali Charges:</span> <span class="value">Rs. ${data.hamaliCharges || ''}</span></div>
      <div class="charge-row"><span class="label">C.P. Charge:</span> <span class="value">Rs. ${data.cpCharge || ''}</span></div>
      <div class="charge-row"><span class="label">Statistical Charges:</span> <span class="value">Rs. ${data.statisticalCharges || ''}</span></div>
      <div class="charge-row"><span class="label">Amount:</span> <span class="value">Rs. ${data.amount || ''}</span></div>
    </div>
  </div>

  <div class="total-row">
    <span>Total</span>
    <span>Rs. ${data.total || ''}</span>
  </div>

  <div class="footer-section">
    <div class="sig-block">
      <div class="sig-value">${data.bookingOfficerSig || ''}</div>
      <div class="sig-label">Signature of Booking Officer</div>
    </div>
  </div>
</div>`;
  }

  const termsPage = `
<div class="terms-page">
  <div class="terms">
    <div class="terms-title">TERMS AND CONDITIONS OF CARRIAGE AT OWNER'S RISK</div>
    <p><strong>1.</strong> Where a Bank has agreed to accept this Lorry Receipt, a consignee, endorsee or holder thereof in any other capacity, for the purpose of giving advance to and/or collection or discounting bills of any of its customers, whether before or after the entrustment of the goods to the Transport Operator for carriage, the Transport Operator hereby agrees, in consideration of the same, to hold themselves liable and shall be deemed to have held themselves liable at all material times directly to the Bank concerned, as if the Bank were a party, to the extent of the full value of the goods handed over to the Transport Operator for carriage, storage and delivery.</p>
    <p><strong>2.</strong> The Transport Operator undertakes to and shall deliver the goods in the order and condition as received, subject to any deterioration in the condition of goods resulting from natural causes like effect of temperature, weather conditions, etc., to the consignee, bank or to their order or their assigns, on the relative receipt being surrendered to the Transport Operator duly discharged by the bank and accepted for lending, or to the collection of or discharged by the holder of the receipt, along with a letter from such bank authorising delivery of the goods. Only the bank and holder of the receipt entitled as aforesaid shall have right of recourse against the Transport Operator for all claims.</p>
    <p><strong>3.</strong> The Transport Operator shall have the right to entrust the goods to any other lorry or service for transport. In the event of the goods being so entrusted by the Transport Operator to another carrier, the other carrier shall, as between the consignor and consignee bank and the Transport Operator, be deemed to be the agent of the Transport Operator. The Transport Operator shall, notwithstanding the delivery of the goods to the other carrier, continue to be responsible for the safety of the goods and for their due delivery at the destination.</p>
    <p><strong>4.</strong> The consignor shall be primarily liable to pay the transport charges and all other incidental charges, if any, at the head office of the Transport Operator or at any other agreed place.</p>
    <p><strong>5.</strong> The Transport Operator shall have the right to dispose of perishable goods lying undelivered after 48 hours of arrival without any notice.</p>
    <p><strong>6.</strong> The consignor is responsible for all consequences of any incorrect or false declaration.</p>
    <p><strong>7.</strong> Where the goods have been lost, destroyed, damaged or have deteriorated, the compensation payable by the Transport Operator shall not exceed 10% of the value declared.</p>
  </div>
</div>`;

  const styles = `
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 14px;
    line-height: 1.4;
    color: #000;
    background: #fff;
  }
  .container {
    width: 100%;
    padding: 6mm;
    border: 2px solid #000;
  }
  .header {
    text-align: center;
    border-bottom: 3px double #8B0000;
    padding: 10px 5px 8px;
    margin-bottom: 4px;
    position: relative;
    min-height: 110px;
  }
  .header-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .header-logo {
    width: 95px;
    height: 95px;
    border-radius: 50%;
    object-fit: cover;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .header-logo-left { left: 2px; }
  .tick {
    font-size: 18px;
    line-height: 1;
    vertical-align: middle;
  }
  .copy-type-banner {
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    letter-spacing: 3px;
    padding: 4px 0;
    border-bottom: 2px solid #000;
    background: #f0ead8;
    color: #8B0000;
  }
  .hindi-blessing {
    font-size: 13px;
    font-weight: bold;
    color: #8B0000;
    margin-bottom: 2px;
  }
  .header-text { text-align: center; }
  .company-name {
    font-family: 'Pinyon Script', cursive;
    font-size: 34px;
    font-weight: normal;
    color: #000;
    letter-spacing: 1px;
  }
  .tagline { font-size: 13px; font-weight: bold; color: #006400; letter-spacing: 3px; }
  .subtitle { font-size: 12px; font-style: italic; }
  .address { font-size: 11px; margin-top: 2px; }
  .cn-title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    text-decoration: underline;
    margin: 5px 0;
    letter-spacing: 2px;
    background: #f8f6f0;
    padding: 4px 0;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid #ccc;
  }
  .field-label { font-weight: bold; font-size: 13px; }
  .field-value { font-size: 13px; min-width: 100px; border-bottom: 1px dotted #000; padding-left: 4px; }
  .mid-section { display: flex; border-bottom: 1px solid #000; }
  .caution-box { width: 55%; border-right: 1px solid #000; padding: 6px; font-size: 12px; }
  .caution-title { font-weight: bold; font-size: 13px; text-decoration: underline; color: #8B0000; }
  .tax-box { width: 45%; padding: 6px; font-size: 12px; }
  .insurance-section { border-bottom: 1px solid #000; padding: 6px; font-size: 12px; }
  .transport-section { display: flex; border-bottom: 1px solid #000; padding: 3px 0; }
  .transport-mode { width: 40%; padding: 6px; border-right: 1px solid #000; font-size: 13px; }
  .from-to { width: 60%; padding: 6px; font-size: 13px; }
  .consignor-section { display: flex; border-bottom: 1px solid #000; }
  .consignor-box, .consignee-box { width: 50%; padding: 6px; min-height: 55px; font-size: 13px; }
  .consignor-box { border-right: 1px solid #000; }
  table.items { width: 100%; border-collapse: collapse; }
  table.items th, table.items td { border: 1px solid #000; padding: 4px 5px; text-align: center; font-size: 12px; }
  table.items th { background: #f0ead8; font-weight: bold; font-size: 11px; }
  .items-summary {
    display: flex;
    justify-content: space-around;
    padding: 5px 6px;
    border: 1px solid #000;
    border-top: none;
    font-size: 13px;
  }
  .charges-section { display: flex; border-bottom: 1px solid #000; }
  .charges-left { width: 50%; border-right: 1px solid #000; padding: 6px; }
  .charges-right { width: 50%; }
  .charge-row { display: flex; justify-content: space-between; padding: 3px 6px; border-bottom: 1px solid #ddd; font-size: 13px; }
  .charge-row .label { font-weight: bold; }
  .charge-row .value { min-width: 60px; text-align: right; }
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 6px;
    font-weight: bold;
    font-size: 15px;
    border-bottom: 1px solid #000;
    background: #f8f6f0;
    color: #8B0000;
  }
  .footer-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 6px;
    border-bottom: 1px solid #000;
    min-height: 60px;
  }
  .sig-block { display: flex; flex-direction: column; }
  .sig-value { font-size: 14px; min-width: 180px; border-bottom: 1px solid #000; min-height: 28px; padding: 3px 4px; }
  .sig-label { font-size: 11px; font-weight: bold; margin-top: 3px; }
  .endorsement-in-charges { padding: 8px 6px 4px; font-size: 11px; border-top: 1px solid #ddd; }
  .endorsement-in-charges p { margin-bottom: 3px; }
  .endorsement-title { font-weight: bold; color: #8B0000; font-size: 12px; margin-bottom: 3px; }
  .page-break { page-break-before: always; }
  .terms-page { padding: 8mm; border: 2px solid #000; }
  .terms { padding: 12px 16px; font-size: 13px; line-height: 1.6; color: #222; }
  .terms-title { font-weight: bold; font-size: 16px; text-align: center; margin-bottom: 14px; text-decoration: underline; color: #000; }
  .terms p { margin-bottom: 10px; }
  .terms p strong { color: #000; }`;

  function buildPages(copyType) {
    const pages = [];

    if (copyType === 'all' || copyType === 'consignee') {
      pages.push(buildCopyPage('CONSIGNEE COPY'));
      pages.push(termsPage);
    }

    if (copyType === 'all' || copyType === 'consignor') {
      pages.push(buildCopyPage('CONSIGNOR COPY'));
    }

    if (copyType === 'all' || copyType === 'office') {
      pages.push(buildCopyPage('OFFICE COPY'));
    }

    return pages.join('\n<div class="page-break"></div>\n');
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" rel="stylesheet">
<style>${styles}</style>
</head>
<body>
${buildPages(copyType)}
</body>
</html>`;
}

module.exports = { generatePDFHTML };
