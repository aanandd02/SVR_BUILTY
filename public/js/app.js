async function handleLogout() {
  if (!confirm('Are you sure you want to sign out?')) return;
  try {
    await fetch('/auth/logout', { method: 'POST' });
  } catch (e) {}
  window.location.href = '/login';
}

async function loadUser() {
  try {
    const res = await fetch('/auth/me');
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        const nameEl = document.getElementById('toolbarUser');
        const avatarEl = document.getElementById('userAvatar');
        if (nameEl) nameEl.textContent = data.user.name;
        if (avatarEl) avatarEl.textContent = data.user.name.charAt(0).toUpperCase();
      }
    }
  } catch (e) {}
}

function addItemRow() {
  const tbody = document.getElementById('itemsBody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" name="packages[]"></td>
    <td><input type="text" name="methodOfPacking[]"></td>
    <td><input type="text" name="nameOfGoods[]"></td>
    <td><input type="text" name="privateMark[]"></td>
    <td><input type="text" name="actualWeight[]"></td>
    <td><input type="text" name="chargedWeight[]"></td>
    <td><input type="text" name="rate[]"></td>
  `;
  tbody.appendChild(tr);
}

function collectFormData() {
  const data = {
    date: document.getElementById('date').value,
    consignmentNo: document.getElementById('consignmentNo').value,
    codeNo: document.getElementById('codeNo').value,
    serviceTaxLiable: document.querySelector('input[name="serviceTaxLiable"]:checked')?.value || '',
    lorryNo: document.getElementById('lorryNo').value,
    insuranceStatus: document.querySelector('input[name="insuranceStatus"]:checked')?.value || 'not_insured',
    insuranceCompany: document.getElementById('insuranceCompany').value,
    policyNo: document.getElementById('policyNo').value,
    policyDate: document.getElementById('policyDate').value,
    insuranceAmount: document.getElementById('insuranceAmount').value,
    insuranceRisk: document.getElementById('insuranceRisk').value,
    transportMode: document.querySelector('input[name="transportMode"]:checked')?.value || 'road',
    from: document.getElementById('from').value,
    to: document.getElementById('to').value,
    consignorName: document.getElementById('consignorName').value,
    consignorAddress: document.getElementById('consignorAddress').value,
    consigneeName: document.getElementById('consigneeName').value,
    consigneeAddress: document.getElementById('consigneeAddress').value,
    freightPer: document.getElementById('freightPer').value,
    paymentStatus: document.getElementById('paymentStatus').value,
    serviceTax: document.getElementById('serviceTax').value,
    coverCharge: document.getElementById('coverCharge').value,
    hamaliCharges: document.getElementById('hamaliCharges').value,
    cpCharge: document.getElementById('cpCharge').value,
    statisticalCharges: document.getElementById('statisticalCharges').value,
    amount: document.getElementById('amount').value,
    total: document.getElementById('total').value,
    bookingOfficerSig: document.getElementById('bookingOfficerSig').value,
    goodsValue: document.getElementById('goodsValue').value,
    items: []
  };

  const rows = document.querySelectorAll('#itemsBody tr');
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    data.items.push({
      packages: inputs[0].value,
      methodOfPacking: inputs[1].value,
      nameOfGoods: inputs[2].value,
      privateMark: inputs[3].value,
      actualWeight: inputs[4].value,
      chargedWeight: inputs[5].value,
      rate: inputs[6].value
    });
  });

  return data;
}

let _pdfBlobUrl = null;
let _pdfFilename = null;
let _lastFormData = null;

async function generatePDF() {
  const data = collectFormData();
  _lastFormData = data;
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('active');

  try {
    data.copyType = 'all';
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to generate PDF');
    }

    const blob = await response.blob();
    overlay.classList.remove('active');

    if (_pdfBlobUrl) URL.revokeObjectURL(_pdfBlobUrl);
    _pdfBlobUrl = URL.createObjectURL(blob);
    _pdfFilename = `builty-${data.consignmentNo || 'SVR'}-all-copies.pdf`;

    document.getElementById('btnDownloadPdf').onclick = downloadAllCopies;
    document.getElementById('successModal').classList.add('active');
  } catch (error) {
    overlay.classList.remove('active');
    alert('Error: ' + error.message);
  }
}

function downloadAllCopies() {
  if (!_pdfBlobUrl) return;
  triggerDownload(_pdfBlobUrl, _pdfFilename);
}

async function downloadCopy(copyType) {
  if (!_lastFormData) return;

  const btn = event.currentTarget;
  const origHTML = btn.innerHTML;
  btn.disabled = true;
  btn.style.opacity = '0.6';
  btn.querySelector('.copy-card-desc').textContent = 'Generating...';

  try {
    const data = { ..._lastFormData, copyType };
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to generate PDF');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const filename = `builty-${_lastFormData.consignmentNo || 'SVR'}-${copyType}-copy.pdf`;
    triggerDownload(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = origHTML;
  }
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function closeModal() {
  document.getElementById('successModal').classList.remove('active');
}

function resetForm() {
  if (confirm('Are you sure you want to reset the form?')) {
    document.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach(el => el.value = '');
    document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    document.querySelector('input[name="insuranceStatus"][value="not_insured"]').checked = true;
    document.querySelector('input[name="transportMode"][value="road"]').checked = true;

    const tbody = document.getElementById('itemsBody');
    while (tbody.rows.length > 3) {
      tbody.deleteRow(tbody.rows.length - 1);
    }
  }
}

const chargeFields = ['serviceTax', 'coverCharge', 'hamaliCharges', 'cpCharge', 'statisticalCharges', 'amount'];

function calculateTotal() {
  let total = 0;
  chargeFields.forEach(field => {
    const val = parseFloat(document.getElementById(field).value) || 0;
    total += val;
  });
  document.getElementById('total').value = total.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
  loadUser();

  chargeFields.forEach(field => {
    document.getElementById(field).addEventListener('input', calculateTotal);
  });

  document.getElementById('itemsBody').addEventListener('input', function(e) {
    if (e.target.name === 'packages[]') {
      let totalPkg = 0;
      document.querySelectorAll('input[name="packages[]"]').forEach(inp => {
        totalPkg += parseInt(inp.value) || 0;
      });
      document.getElementById('totalPackages').value = totalPkg || '';
    }
  });
});
