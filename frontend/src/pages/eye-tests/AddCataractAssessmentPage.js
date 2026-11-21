import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const AddCataractAssessmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient');
  const [patients, setPatients] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);

  const [formData, setFormData] = useState({
    patient: patientId || '',
    performed_by: '',
    test_date: new Date().toISOString().split('T')[0],
    right_bcva: '',
    left_bcva: '',
    right_iop: '',
    left_iop: '',
    right_pco_grading: '',
    left_pco_grading: '',
    right_cataract_type: '',
    left_cataract_type: '',
    right_cataract_grade: '',
    left_cataract_grade: '',
    surgery_recommended: false,
    yag_capsulotomy_needed: false,
    yag_capsulotomy_outcome: '',
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
      await api.create('cataract-assessments', { ...formData, performed_by: formData.performed_by || null });
      alert('Cataract assessment recorded!');
      navigate('/eye-tests');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally { setLoading(false); }
  };

  const cataractTypes = [
    { value: 'nuclear', label: 'Nuclear Sclerotic' },
    { value: 'cortical', label: 'Cortical' },
    { value: 'posterior_subcapsular', label: 'Posterior Subcapsular' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'congenital', label: 'Congenital' },
    { value: 'traumatic', label: 'Traumatic' },
    { value: 'none', label: 'No Cataract' },
  ];

  const grades = [
    { value: '1', label: 'Grade 1 – Mild' },
    { value: '2', label: 'Grade 2 – Moderate' },
    { value: '3', label: 'Grade 3 – Significant' },
    { value: '4', label: 'Grade 4 – Advanced/Dense' },
  ];

  const pcoGrades = [
    { value: '0', label: '0 – None' },
    { value: '1', label: '1 – Mild' },
    { value: '2', label: '2 – Moderate' },
    { value: '3', label: '3 – Significant/Surgical' },
  ];

  return (
    <div className="form-container">
      <h1>Add Cataract Assessment</h1>
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

        <h3>Best Corrected Visual Acuity</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Right BCVA</label>
            <input type="text" name="right_bcva" value={formData.right_bcva} onChange={handleChange} className="form-input" placeholder="e.g. 6/12 or 0.3" />
          </div>
          <div className="form-group">
            <label>Left BCVA</label>
            <input type="text" name="left_bcva" value={formData.left_bcva} onChange={handleChange} className="form-input" placeholder="e.g. 6/9 or 0.2" />
          </div>
        </div>

        <h3>Intraocular Pressure (mmHg)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Right IOP</label>
            <input type="number" step="0.1" name="right_iop" value={formData.right_iop} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Left IOP</label>
            <input type="number" step="0.1" name="left_iop" value={formData.left_iop} onChange={handleChange} className="form-input" />
          </div>
        </div>

        <h3>Cataract Type & Grade</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Right Type</label>
            <select name="right_cataract_type" value={formData.right_cataract_type} onChange={handleChange} className="form-input">
              <option value="">— Select —</option>
              {cataractTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Right Grade</label>
            <select name="right_cataract_grade" value={formData.right_cataract_grade} onChange={handleChange} className="form-input">
              <option value="">— Select —</option>
              {grades.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Left Type</label>
            <select name="left_cataract_type" value={formData.left_cataract_type} onChange={handleChange} className="form-input">
              <option value="">— Select —</option>
              {cataractTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Left Grade</label>
            <select name="left_cataract_grade" value={formData.left_cataract_grade} onChange={handleChange} className="form-input">
              <option value="">— Select —</option>
              {grades.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        </div>

        <h3>Posterior Capsule Opacification (PCO)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Right PCO Grade</label>
            <select name="right_pco_grading" value={formData.right_pco_grading} onChange={handleChange} className="form-input">
              <option value="">— N/A —</option>
              {pcoGrades.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Left PCO Grade</label>
            <select name="left_pco_grading" value={formData.left_pco_grading} onChange={handleChange} className="form-input">
              <option value="">— N/A —</option>
              {pcoGrades.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        </div>

        <h3>Management</h3>
        <div className="form-row">
          <div className="form-group checkbox-group">
            <label><input type="checkbox" name="surgery_recommended" checked={formData.surgery_recommended} onChange={handleChange} /> Surgery Recommended</label>
          </div>
          <div className="form-group checkbox-group">
            <label><input type="checkbox" name="yag_capsulotomy_needed" checked={formData.yag_capsulotomy_needed} onChange={handleChange} /> YAG Capsulotomy Needed</label>
          </div>
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

export default AddCataractAssessmentPage;