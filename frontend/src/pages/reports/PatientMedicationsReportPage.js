import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './PatientMedicationsReportPage.css';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const PatientMedicationsReportPage = () => {
  const navigate = useNavigate();

  const [medications, setMedications] = useState([]);
  const [medsLoading, setMedsLoading] = useState(false);

  // Lookup state
  const [selectedMedId, setSelectedMedId] = useState('');
  const [batchInput, setBatchInput]       = useState('');
  const [medSearch, setMedSearch]         = useState('');

  // Results
  const [matchedMeds, setMatchedMeds]     = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [summary, setSummary]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [searched, setSearched]           = useState(false);

  // Search filter on results
  const [patientSearch, setPatientSearch] = useState('');

  // Load medication dropdown
  useEffect(() => {
    setMedsLoading(true);
    api.getMedications()
      .then(r => setMedications(r.data?.results || r.data || []))
      .catch(() => {})
      .finally(() => setMedsLoading(false));
  }, []);

  const filteredMedOptions = medications.filter(m =>
    !medSearch || m.name.toLowerCase().includes(medSearch.toLowerCase())
  );

  const handleSearch = useCallback(async () => {
    if (!selectedMedId && !batchInput.trim()) {
      setError('Please select a medication or enter a batch number.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSearched(false);
      const params = {};
      if (selectedMedId)      params.medication_id = selectedMedId;
      if (batchInput.trim())  params.batch_number  = batchInput.trim();
      const res = await api.getMedicationPatientsReport(params);
      if (res.data.success) {
        setMatchedMeds(res.data.data.medications);
        setPrescriptions(res.data.data.prescriptions);
        setSummary(res.data.data.summary);
      } else {
        setError(res.data.error || 'Report failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run report');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [selectedMedId, batchInput]);

  const handleClear = () => {
    setSelectedMedId('');
    setBatchInput('');
    setMedSearch('');
    setPatientSearch('');
    setMatchedMeds([]);
    setPrescriptions([]);
    setSummary(null);
    setError('');
    setSearched(false);
  };

  const exportCSV = () => {
    if (!prescriptions.length) return;
    const headers = ['Patient Name','Patient Ref','DOB','Phone','Email','Medication','Batch No','Strength','Dosage','Frequency','Eye Side','Prescribed Date','Prescribed By'];
    const rows = prescriptions.map(p => [
      p.patient_name, p.patient_ref, p.date_of_birth || '', p.phone, p.email,
      p.medication_name, p.batch_number, p.strength, p.dosage, p.frequency,
      p.eye_side, p.prescription_date ? fmt(p.prescription_date) : '', p.prescribed_by,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `medication-patients-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const visiblePrescriptions = prescriptions.filter(p => {
    if (!patientSearch) return true;
    const s = patientSearch.toLowerCase();
    return (
      p.patient_name?.toLowerCase().includes(s) ||
      p.patient_ref?.toLowerCase().includes(s) ||
      p.phone?.includes(s) ||
      p.email?.toLowerCase().includes(s)
    );
  });

  const eyeSideLabel = { both: 'Both Eyes', left: 'Left Eye', right: 'Right Eye' };

  return (
    <div className="pmr-page">
      {/* Header */}
      <div className="pmr-header">
        <div className="pmr-header__left">
          <button className="pmr-btn pmr-btn--ghost" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <h1>Medication Patient Lookup</h1>
            <p>Find all patients who received a specific medication or batch number</p>
          </div>
        </div>
      </div>

      {/* Search Panel */}
      <div className="pmr-search-panel">
        <div className="pmr-search-grid">
          {/* Medication dropdown */}
          <div className="pmr-field">
            <label className="pmr-label">Medication</label>
            <input
              className="pmr-input"
              placeholder="Type to filter medications…"
              value={medSearch}
              onChange={e => { setMedSearch(e.target.value); setSelectedMedId(''); }}
            />
            {medSearch && filteredMedOptions.length > 0 && !selectedMedId && (
              <div className="pmr-dropdown">
                {filteredMedOptions.slice(0, 12).map(m => (
                  <div
                    key={m.id}
                    className="pmr-dropdown__item"
                    onClick={() => { setSelectedMedId(m.id); setMedSearch(m.name); }}
                  >
                    <strong>{m.name}</strong>
                    {m.strength && <span className="pmr-dropdown__sub"> · {m.strength}</span>}
                    {m.batch_number && <span className="pmr-dropdown__batch"> Batch: {m.batch_number}</span>}
                  </div>
                ))}
              </div>
            )}
            {selectedMedId && (
              <div className="pmr-selected-tag">
                ✔ {medSearch}
                <button onClick={() => { setSelectedMedId(''); setMedSearch(''); }} className="pmr-tag-remove">✕</button>
              </div>
            )}
          </div>

          {/* Batch number input */}
          <div className="pmr-field">
            <label className="pmr-label">Batch Number</label>
            <input
              className="pmr-input"
              placeholder="Enter batch number to check all medications…"
              value={batchInput}
              onChange={e => setBatchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <span className="pmr-hint">Finds any medication with a matching batch number</span>
          </div>

          {/* Actions */}
          <div className="pmr-field pmr-field--actions">
            <label className="pmr-label">&nbsp;</label>
            <div className="pmr-actions">
              <button
                className="pmr-btn pmr-btn--primary"
                onClick={handleSearch}
                disabled={loading || (!selectedMedId && !batchInput.trim())}
              >
                {loading ? 'Searching…' : '🔍 Search'}
              </button>
              <button className="pmr-btn pmr-btn--ghost" onClick={handleClear}>Clear</button>
            </div>
          </div>
        </div>

        {error && <div className="pmr-error">{error}</div>}
      </div>

      {/* ── Batch Checker Results ── */}
      {searched && matchedMeds.length > 0 && (
        <div className="pmr-section">
          <h2 className="pmr-section__title">
            🔬 Batch Checker — {matchedMeds.length} medication{matchedMeds.length !== 1 ? 's' : ''} found
            {batchInput && <span className="pmr-section__sub"> matching batch "{batchInput}"</span>}
          </h2>
          <div className="pmr-table-wrap">
            <table className="pmr-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Generic Name</th>
                  <th>Strength</th>
                  <th>Batch Number</th>
                  <th>Expiry Date</th>
                  <th>Stock</th>
                  <th>Manufacturer</th>
                </tr>
              </thead>
              <tbody>
                {matchedMeds.map(m => (
                  <tr key={m.id} className="pmr-row">
                    <td><strong>{m.name}</strong></td>
                    <td>{m.generic_name || '—'}</td>
                    <td>{m.strength || '—'}</td>
                    <td>
                      {m.batch_number
                        ? <span className="pmr-batch-tag">{m.batch_number}</span>
                        : <span className="pmr-muted">None</span>}
                    </td>
                    <td>{m.expiry_date ? fmt(m.expiry_date) : '—'}</td>
                    <td>{m.current_stock ?? '—'}</td>
                    <td>{m.manufacturer || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {searched && matchedMeds.length === 0 && (
        <div className="pmr-empty">
          <div className="pmr-empty__icon">🔍</div>
          <p>No medications found matching your search.</p>
        </div>
      )}

      {/* ── Summary Stats ── */}
      {summary && summary.total_prescriptions > 0 && (
        <div className="pmr-summary-strip">
          <div className="pmr-stat">
            <div className="pmr-stat__val">{summary.total_medications}</div>
            <div className="pmr-stat__lbl">Medication{summary.total_medications !== 1 ? 's' : ''}</div>
          </div>
          <div className="pmr-stat pmr-stat--blue">
            <div className="pmr-stat__val">{summary.total_patients}</div>
            <div className="pmr-stat__lbl">Unique Patients</div>
          </div>
          <div className="pmr-stat pmr-stat--purple">
            <div className="pmr-stat__val">{summary.total_prescriptions}</div>
            <div className="pmr-stat__lbl">Prescription Items</div>
          </div>
          <div className="pmr-summary-actions">
            <button className="pmr-btn pmr-btn--ghost" onClick={exportCSV}>📥 Export CSV</button>
            <button
              className="pmr-btn pmr-btn--warning"
              onClick={() => navigate('/medications/recalls')}
              title="Go to Recall Centre to issue a recall for this medication/batch"
            >
              ⚠️ Issue Recall
            </button>
          </div>
        </div>
      )}

      {/* ── Patient Contact List ── */}
      {summary && summary.total_prescriptions > 0 && (
        <div className="pmr-section">
          <div className="pmr-section__bar">
            <h2 className="pmr-section__title">
              👤 Patients Who Received This Medication
            </h2>
            <input
              className="pmr-input pmr-input--search"
              placeholder="Filter by name, ref, phone or email…"
              value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
            />
          </div>

          <div className="pmr-table-wrap">
            <table className="pmr-table pmr-table--patients">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Ref</th>
                  <th>DOB</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Medication</th>
                  <th>Batch</th>
                  <th>Dosage</th>
                  <th>Eye Side</th>
                  <th>Prescribed</th>
                  <th>By</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visiblePrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="pmr-empty-cell">No results match your filter.</td>
                  </tr>
                ) : (
                  visiblePrescriptions.map((p, i) => (
                    <tr key={i} className="pmr-row">
                      <td className="pmr-cell--name"><strong>{p.patient_name}</strong></td>
                      <td className="pmr-muted">{p.patient_ref}</td>
                      <td className="pmr-muted">{p.date_of_birth ? fmt(p.date_of_birth) : '—'}</td>
                      <td>
                        {p.phone
                          ? <a href={`tel:${p.phone}`} className="pmr-contact-link">📞 {p.phone}</a>
                          : <span className="pmr-muted">—</span>}
                      </td>
                      <td>
                        {p.email
                          ? <a href={`mailto:${p.email}`} className="pmr-contact-link">✉️ {p.email}</a>
                          : <span className="pmr-muted">—</span>}
                      </td>
                      <td><strong>{p.medication_name}</strong>{p.strength && <span className="pmr-muted"> {p.strength}</span>}</td>
                      <td>
                        {p.batch_number
                          ? <span className="pmr-batch-tag">{p.batch_number}</span>
                          : <span className="pmr-muted">—</span>}
                      </td>
                      <td>{p.dosage} {p.frequency}</td>
                      <td>{eyeSideLabel[p.eye_side] || p.eye_side || '—'}</td>
                      <td className="pmr-muted">{p.prescription_date ? fmt(p.prescription_date) : '—'}</td>
                      <td className="pmr-muted">{p.prescribed_by || '—'}</td>
                      <td>
                        <button
                          className="pmr-btn pmr-btn--sm pmr-btn--ghost"
                          onClick={() => navigate(`/patients/${p.patient_id}`)}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {visiblePrescriptions.length > 0 && (
            <div className="pmr-record-count">
              Showing {visiblePrescriptions.length} of {prescriptions.length} records
            </div>
          )}
        </div>
      )}

      {/* Empty state after search with no prescriptions */}
      {searched && summary && summary.total_prescriptions === 0 && matchedMeds.length > 0 && (
        <div className="pmr-info-box">
          ℹ️ The medication{matchedMeds.length !== 1 ? 's' : ''} found {matchedMeds.length !== 1 ? 'have' : 'has'} not been prescribed to any patients yet.
        </div>
      )}
    </div>
  );
};

export default PatientMedicationsReportPage;

