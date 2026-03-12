import React, { useMemo, useState } from 'react';
import { apiFetch } from '../apiClient.js';

const CHARGE_FIELDS = ['serviceTax', 'coverCharge', 'hamaliCharges', 'cpCharge', 'statisticalCharges', 'amount'];
const RISK_PRESETS = ['Owner Risk', 'Carrier Risk'];
const PAYMENT_OPTIONS = ['To pay', 'Paid', 'Due'];
const TRANSPORT_MODES = ['road', 'train', 'air'];

const emptyItem = {
  packages: '',
  methodOfPacking: '',
  nameOfGoods: '',
  privateMark: '',
  actualWeight: '',
  chargedWeight: '',
  rate: ''
};

const createInitialForm = () => ({
  date: new Date().toISOString().split('T')[0],
  consignmentNo: '',
  codeNo: '',
  serviceTaxLiable: '',
  lorryNo: '',
  insuranceStatus: 'not_insured',
  insuranceCompany: '',
  policyNo: '',
  policyDate: '',
  insuranceAmount: '',
  insuranceRisk: RISK_PRESETS[0],
  transportMode: TRANSPORT_MODES[0],
  from: '',
  to: '',
  consignorName: '',
  consignorAddress: '',
  consigneeName: '',
  consigneeAddress: '',
  freightPer: '',
  paymentStatus: PAYMENT_OPTIONS[0],
  serviceTax: '',
  coverCharge: '',
  hamaliCharges: '',
  cpCharge: '',
  statisticalCharges: '',
  amount: '',
  bookingOfficerSig: 'Dheeraj Tiwari',
  goodsValue: '',
  items: [
    { ...emptyItem },
    { ...emptyItem },
    { ...emptyItem }
  ]
});

function BuiltyForm({ user, onLogout, onAuthFail }) {
  const [form, setForm] = useState(createInitialForm());
  const [modalOpen, setModalOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState('');
  const [toast, setToast] = useState('');
  const displayName = user?.name && user.name !== 'Administrator' ? user.name : 'SVR';

  const totalPackages = useMemo(
    () => form.items.reduce((sum, row) => sum + (parseInt(row.packages, 10) || 0), 0),
    [form.items]
  );

  const totalCharges = useMemo(
    () => CHARGE_FIELDS.reduce((sum, key) => sum + (parseFloat(form[key]) || 0), 0),
    [form]
  );

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, key, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, items };
    });
  };

  const addItemRow = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));
  };

  const resetForm = () => {
    setForm(createInitialForm());
    setToast('Form cleared');
  };

  const triggerDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sendToServer = async (copyType) => {
    setCopyLoading(copyType);
    setToast('');
    try {
      const payload = { ...form, copyType, total: totalCharges, totalPackages };
      const res = await apiFetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        onAuthFail();
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'PDF generation failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename = `builty-${form.consignmentNo || 'SVR'}-${
        copyType === 'all' ? 'all-copies' : `${copyType}-copy`
      }.pdf`;
      triggerDownload(url, filename);
      setToast('PDF ready 🎉');
    } catch (err) {
      setToast(err.message);
    } finally {
      setCopyLoading('');
      setModalOpen(false);
    }
  };

  const hasMinimumData = Boolean(
    form.consignmentNo.trim() && form.consignorName.trim() && form.consigneeName.trim()
  );

  const handleGenerate = () => {
    if (!hasMinimumData) {
      setToast('Add Consignment No., Consignor and Consignee to proceed.');
      return;
    }
    setModalOpen(true);
  };

  return (
    <div className="page-shell">
      <div className="toolbar">
        <div className="toolbar-brand">
          <img src="/Logo.png" alt="SVR" className="toolbar-logo" />
          <div className="toolbar-title">SVR Builty</div>
        </div>
        <div className="toolbar-actions">
          <button className="btn-secondary" onClick={addItemRow}>+ Row</button>
          <button className="btn-secondary" onClick={resetForm}>Reset</button>
          <button className="btn-primary" onClick={handleGenerate}>Generate PDF</button>
          <div className="toolbar-divider" />
          <button className="btn-text" onClick={onLogout}>Sign out</button>
        </div>
      </div>

      <main className="content">
        <header className="page-header">
          <div>
            <div className="eyebrow">Consignment Note</div>
            <h1>Shree Vishwanath Roadways</h1>
            <p>Service through commitment • Vapi</p>
          </div>
          <div className="badge">Draft</div>
        </header>

        {toast && <div className="toast">{toast}</div>}

        <section className="card">
          <div className="section-title">Reference</div>
          <div className="grid grid-3">
            <label className="field">
              <span>Code No.</span>
              <input value={form.codeNo} onChange={(e) => updateField('codeNo', e.target.value)} />
            </label>
            <label className="field">
              <span>Consignment No.</span>
              <input value={form.consignmentNo} onChange={(e) => updateField('consignmentNo', e.target.value)} />
            </label>
            <label className="field">
              <span>Date</span>
              <input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
            </label>
          </div>
        </section>

        <section className="card two-col">
          <div>
            <div className="section-title">Caution</div>
            <p className="muted">
              This consignment will not be detained, delivered, re-routed or re-booked without written permission from the consignee bank.
            </p>
            <div className="note">Double‑check lorry number and route before printing.</div>
            <div className="field">
              <span>Lorry No.</span>
              <input value={form.lorryNo} onChange={(e) => updateField('lorryNo', e.target.value)} placeholder="GJ xx xx" />
            </div>
            <div className="field">
              <span>Service tax payable by</span>
              <div className="chip-row">
                {['consignor', 'consignee', 'gta'].map((val) => (
                  <label key={val} className={form.serviceTaxLiable === val ? 'chip active' : 'chip'}>
                    <input
                      type="radio"
                    name="serviceTaxLiable"
                    value={val}
                    checked={form.serviceTaxLiable === val}
                    onChange={(e) => updateField('serviceTaxLiable', e.target.value)}
                  />
                    {val === 'gta' ? 'GOODS TRANSPORT AGENCY' : val.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="section-title">Insurance</div>
            <div className="chip-row">
              {['not_insured', 'insured'].map((val) => (
                <label key={val} className={form.insuranceStatus === val ? 'chip active' : 'chip'}>
                  <input
                    type="radio"
                    name="insuranceStatus"
                    value={val}
                    checked={form.insuranceStatus === val}
                    onChange={(e) => updateField('insuranceStatus', e.target.value)}
                  />
                  {val === 'insured' ? 'Insured' : 'Not insured'}
                </label>
              ))}
            </div>
            <div className="grid grid-2">
              <label className="field">
                <span>Company</span>
                <input value={form.insuranceCompany} onChange={(e) => updateField('insuranceCompany', e.target.value)} />
              </label>
              <label className="field">
                <span>Policy No.</span>
                <input value={form.policyNo} onChange={(e) => updateField('policyNo', e.target.value)} />
              </label>
              <label className="field">
                <span>Policy Date</span>
                <input type="date" value={form.policyDate} onChange={(e) => updateField('policyDate', e.target.value)} />
              </label>
              <label className="field">
                <span>Insured Amount</span>
                <input value={form.insuranceAmount} onChange={(e) => updateField('insuranceAmount', e.target.value)} />
              </label>
            </div>
            <label className="field">
              <span>Risk / Notes</span>
              <div className="chip-row">
                {RISK_PRESETS.map((risk) => (
                  <button
                    key={risk}
                    type="button"
                    className={form.insuranceRisk === risk ? 'chip active' : 'chip'}
                    onClick={() => updateField('insuranceRisk', risk)}
                  >
                    {risk}
                  </button>
                ))}
                <button
                  type="button"
                  className={!RISK_PRESETS.includes(form.insuranceRisk) ? 'chip active' : 'chip'}
                  onClick={() => updateField('insuranceRisk', '')}
                >
                  Custom
                </button>
              </div>
              <input
                value={form.insuranceRisk}
                onChange={(e) => updateField('insuranceRisk', e.target.value)}
                placeholder="Owner Risk / Carrier Risk / Custom note"
              />
            </label>
          </div>
        </section>

        <section className="card two-col">
          <div>
            <div className="section-title">Route</div>
            <div className="grid grid-2">
              <label className="field">
                <span>From</span>
                <input value={form.from} onChange={(e) => updateField('from', e.target.value)} />
              </label>
              <label className="field">
                <span>To</span>
                <input value={form.to} onChange={(e) => updateField('to', e.target.value)} />
              </label>
            </div>
            <div className="chip-row">
              {TRANSPORT_MODES.map((mode) => (
                <label key={mode} className={form.transportMode === mode ? 'chip active' : 'chip'}>
                  <input
                    type="radio"
                    name="transportMode"
                    value={mode}
                    checked={form.transportMode === mode}
                    onChange={(e) => updateField('transportMode', e.target.value)}
                  />
                  {mode.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="section-title">Goods Value</div>
            <label className="field">
              <span>Declared Value (₹)</span>
              <input value={form.goodsValue} onChange={(e) => updateField('goodsValue', e.target.value)} />
            </label>
            <label className="field">
              <span>Consignment Note By</span>
              <input value={form.bookingOfficerSig} onChange={(e) => updateField('bookingOfficerSig', e.target.value)} placeholder="Booking officer" />
            </label>
          </div>
        </section>

        <section className="card">
          <div className="section-title">Parties</div>
          <div className="grid grid-2">
            <label className="field textarea">
              <span>Consignor</span>
              <textarea rows="4" value={form.consignorName ? `${form.consignorName}\n${form.consignorAddress}`.trim() : form.consignorAddress}
                onChange={(e) => {
                  const [firstLine, ...rest] = e.target.value.split('\n');
                  updateField('consignorName', firstLine || '');
                  updateField('consignorAddress', rest.join('\n'));
                }}
                placeholder="Name and address" />
            </label>
            <label className="field textarea">
              <span>Consignee</span>
              <textarea rows="4" value={form.consigneeName ? `${form.consigneeName}\n${form.consigneeAddress}`.trim() : form.consigneeAddress}
                onChange={(e) => {
                  const [firstLine, ...rest] = e.target.value.split('\n');
                  updateField('consigneeName', firstLine || '');
                  updateField('consigneeAddress', rest.join('\n'));
                }}
                placeholder="Name and address" />
            </label>
          </div>
        </section>

        <section className="card">
          <div className="section-title">Items</div>
          <div className="table-wrap">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Packages</th>
                  <th>Method of Packing</th>
                  <th>Name of Goods</th>
                  <th>Private Mark</th>
                  <th>Actual Kg.</th>
                  <th>Charged Kg.</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((row, idx) => (
                  <tr key={idx}>
                    <td><input value={row.packages} onChange={(e) => updateItem(idx, 'packages', e.target.value)} /></td>
                    <td><input value={row.methodOfPacking} onChange={(e) => updateItem(idx, 'methodOfPacking', e.target.value)} /></td>
                    <td><input value={row.nameOfGoods} onChange={(e) => updateItem(idx, 'nameOfGoods', e.target.value)} /></td>
                    <td><input value={row.privateMark} onChange={(e) => updateItem(idx, 'privateMark', e.target.value)} /></td>
                    <td><input value={row.actualWeight} onChange={(e) => updateItem(idx, 'actualWeight', e.target.value)} /></td>
                    <td><input value={row.chargedWeight} onChange={(e) => updateItem(idx, 'chargedWeight', e.target.value)} /></td>
                    <td><input value={row.rate} onChange={(e) => updateItem(idx, 'rate', e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="items-footer">
            <div className="muted">Total packages: <strong>{totalPackages || 0}</strong></div>
            <button className="btn-secondary" onClick={addItemRow}>Add row</button>
          </div>
        </section>

        <section className="card two-col">
          <div>
            <div className="section-title">Charges</div>
            <div className="grid grid-2">
              <label className="field">
                <span>Service Tax</span>
                <input value={form.serviceTax} onChange={(e) => updateField('serviceTax', e.target.value)} />
              </label>
              <label className="field">
                <span>Cover Charge</span>
                <input value={form.coverCharge} onChange={(e) => updateField('coverCharge', e.target.value)} />
              </label>
              <label className="field">
                <span>Hamali Charges</span>
                <input value={form.hamaliCharges} onChange={(e) => updateField('hamaliCharges', e.target.value)} />
              </label>
              <label className="field">
                <span>C.P. Charge</span>
                <input value={form.cpCharge} onChange={(e) => updateField('cpCharge', e.target.value)} />
              </label>
              <label className="field">
                <span>Statistical Charges</span>
                <input value={form.statisticalCharges} onChange={(e) => updateField('statisticalCharges', e.target.value)} />
              </label>
              <label className="field">
                <span>Other Amount</span>
                <input value={form.amount} onChange={(e) => updateField('amount', e.target.value)} />
              </label>
            </div>
            <label className="field">
              <span>Freight per Kg./Cft.</span>
              <input value={form.freightPer} onChange={(e) => updateField('freightPer', e.target.value)} />
            </label>
            <label className="field">
              <span>Payment Status</span>
              <div className="chip-row compact">
                {PAYMENT_OPTIONS.map((option) => (
                  <label key={option} className={form.paymentStatus === option ? 'chip active' : 'chip'}>
                    <input
                      type="radio"
                      name="paymentStatus"
                      value={option}
                      checked={form.paymentStatus === option}
                      onChange={(e) => updateField('paymentStatus', e.target.value)}
                    />
                    {option}
                  </label>
                ))}
              </div>
              <input
                value={form.paymentStatus}
                onChange={(e) => updateField('paymentStatus', e.target.value)}
                placeholder="Pick above or type a custom status"
              />
            </label>
          </div>
          <div className="panel">
            <div className="total-box">
              <div className="total-label">Total Charges</div>
              <div className="total-value">₹ {totalCharges.toFixed(2)}</div>
              <div className="muted small">Auto-calculated from charge fields</div>
            </div>
            <div className="summary-row">
              <span>Total Packages</span>
              <strong>{totalPackages || 0}</strong>
            </div>
            <div className="summary-row">
              <span>Transport Mode</span>
              <strong>{form.transportMode.toUpperCase()}</strong>
            </div>
          </div>
        </section>
      </main>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Download PDF</h3>
            <p>Select the copy you want to generate.</p>
            <div className="modal-grid">
              <button className="modal-card" onClick={() => sendToServer('all')} disabled={!!copyLoading}>
                <span className="label">All Copies</span>
                <span className="desc">Consignee • Consignor • Office</span>
              </button>
              <button className="modal-card" onClick={() => sendToServer('consignee')} disabled={!!copyLoading}>
                <span className="label">Consignee</span>
                <span className="desc">With T&C</span>
              </button>
              <button className="modal-card" onClick={() => sendToServer('consignor')} disabled={!!copyLoading}>
                <span className="label">Consignor</span>
                <span className="desc">Without T&C</span>
              </button>
              <button className="modal-card" onClick={() => sendToServer('office')} disabled={!!copyLoading}>
                <span className="label">Office Copy</span>
                <span className="desc">Internal</span>
              </button>
            </div>
            <button className="btn-text" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {copyLoading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <img src="/Logo.png" alt="SVR" className="loading-logo" />
            <div className="spinner" />
            <div className="loading-text">Generating {copyLoading} copy...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuiltyForm;
