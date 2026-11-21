import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const AddRetinalAssessmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient');
  const [patients, setPatients] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);

  const [formData, setFormData] = useState({
    patient: patientId || '',
    performed_by: '',
    test_date: new Date().toISOString().split('T')[0],
    right_retina_findings: '',
    left_retina_findings: '',
    right_macula_normal: true,
    left_macula_normal: true,
    right_macula_findings: '',
    left_macula_findings: '',
    arteriovenous_nicking: false,
    cotton_wool_spots: false,
    hard_exudates: false,
    dot_blot_haemorrhages: false,
    flame_haemorrhages: false,
    microaneurysms: false,
    neovascularisation: false,
    retinal_detachment: false,
    posterior_vitreous_detachment: false,
    clinical_notes: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [pRes, dRes] = await Promise.allSettled([
        api.getPatients({ page_size: 200 }),
        api.getDoctors(),
      ]);
      if (pRes.status === 'fulfilled') setPatients(pRes.value.data?.results || pRes.value.data || []);
      if (dRes.status === 'fulfilled') setDoctorsList(dRes.value.data?.results || dRes.value.data || []);
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.create('retinal-assessments', { ...formData, performed_by: formData.performed_by || null });
      alert('Retinal assessment recorded!');
      navigate('/eye-tests');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally { setLoading(false); }
  };

  const findings = [
    { name: 'arteriovenous_nicking', label: 'A-V Nicking' },
    { name: 'cotton_wool_spots', label: 'Cotton Wool Spots' },
    { name: 'hard_exudates', label: 'Hard Exudates' },
    { name: 'dot_blot_haemorrhages', label: 'Dot/Blot Haemorrhages' },
    { name: 'flame_haemorrhages', label: 'Flame Haemorrhages' },
    { name: 'microaneurysms', label: 'Microaneurysms' },
    { name: 'neovascularisation', label: 'Neovascularisation' },
    { name: 'retinal_detachment', label: 'Retinal Detachment' },
    { name: 'posterior_vitreous_detachment', label: 'Posterior Vitreous Detachment' },
  ];

  return (
    <div className="form-container">
      <h1>Add Retinal Assessment</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Patient *</label>
            {patientId ? (
              <input type="text" value={`Patient ID: ${patientId}`} disabled className="form-input" />
            ) : (
              <select name="patient" value={formData.patient} onChange={handleChange} required className="form-input">
                <option value="">— Select —</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.patient_id})</option>)}
              </select>
            )}
          </div>
          <div className="form-group">
            <label>Test Date *</label>
            <input type="date" name="test_date" value={formData.test_date} onChange={handleChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label>Performed By</label>
            <select name="performed_by" value={formData.performed_by} onChange={handleChange} className="form-input">
              <option value="">— Select —</option>
              {doctorsList.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
            </select>
          </div>
        </div>

        <h3>Retina Findings</h3>
        <div className="form-row">
          <div className="form-group full-width">
            <label>Right Retina Findings</label>
            <textarea name="right_retina_findings" value={formData.right_retina_findings} onChange={handleChange} rows="2" className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label>Left Retina Findings</label>
            <textarea name="left_retina_findings" value={formData.left_retina_findings} onChange={handleChange} rows="2" className="form-input" />
          </div>
        </div>

        <h3>Macula Assessment</h3>
        <div className="form-row">
          <div className="form-group">
            <label><input type="checkbox" name="right_macula_normal" checked={formData.right_macula_normal} onChange={handleChange} /> Right Macula Normal</label>
          </div>
          <div className="form-group">
            <label><input type="checkbox" name="left_macula_normal" checked={formData.left_macula_normal} onChange={handleChange} /> Left Macula Normal</label>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label>Right Macula Findings</label>
            <textarea name="right_macula_findings" value={formData.right_macula_findings} onChange={handleChange} rows="1" className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label>Left Macula Findings</label>
            <textarea name="left_macula_findings" value={formData.left_macula_findings} onChange={handleChange} rows="1" className="form-input" />
          </div>
        </div>

        <h3>Specific Findings</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          {findings.map(f => (
            <label key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
              <input type="checkbox" name={f.name} checked={formData[f.name]} onChange={handleChange} />
              {f.label}
            </label>
          ))}
        </div>

        <div className="form-group">
          <label>Clinical Notes</label>
          <textarea name="clinical_notes" value={formData.clinical_notes} onChange={handleChange} rows="3" className="form-input" />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Assessment'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddRetinalAssessmentPage;