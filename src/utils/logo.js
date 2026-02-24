const path = require('path');
const fs = require('fs');

const logoPath = path.join(__dirname, '..', '..', 'public', 'assets', 'Logo.png');

const logoBase64 = fs.existsSync(logoPath)
  ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
  : '';

module.exports = { logoBase64 };
