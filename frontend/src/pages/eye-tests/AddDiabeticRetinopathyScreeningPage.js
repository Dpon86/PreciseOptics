import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const AddDiabeticRetinopathyScreeningPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient');
  const [patients, setPatients] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);

  const [formData, setFormData] = useState({
    patient: patientId || '',
    performed_by: '',
    test_date: new Date().toISOString().split('T')[0],
    right_grading: 'r0',
    left_grading: 'r0',
    right_maculopathy: false,
    left_maculopathy: false,
    right_csme: false,
    left_csme: false,
    image_quality: 'good',
    referral_needed: false,
    follow_up_months: '12',
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
    setError('');
    try {
      const payload = { ...formData, performed_by: formData.performed_by || null };
      await api.create('diabetic-retinopathy-screenings', payload);
      alert('Diabetic retinopathy screening recorded!');
      navigate('/eye-tests');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally { setLoading(false); }
  };

  const gradeOptions = [
    { value: 'r0', label: 'R0 – No retinopathy' },
    { value: 'r1', label: 'R1 – Background/Mild NPDR' },
    { value: 'r2', label: 'R2 – Pre-proliferative/Moderate NPDR' },
    { value: 'r3', label: 'R3 – Proliferative DR' },
    { value: 'm1', label: 'M1 – Maculopathy present' },
  ];

  return (
    <div className="form-container">
      <h1>Add Diabetic Retinopathy Screening</h1>
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

        <h3>Grading (NHS DESP Scale)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Right Eye Grade</label>
            <select name="right_grading" value={formData.right_grading} onChange={handleChange} className="form-input">
              {gradeOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Left Eye Grade</label>
            <select name="left_grading" value={formData.left_grading} onChange={handleChange} className="form-input">
              {gradeOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
        </div>

        <h3>Maculopathy</h3>
        <div className="form-row">
          <div className="form-group checkbox-group">
            <label><input type="checkbox" name="right_maculopathy" checked={formData.right_maculopathy} onChange={handleChange} /> Right Maculopathy</label>
          </div>
          <div className="form-group checkbox-group">
            <label><input type="checkbox" name="left_maculopathy" checked={formData.left_maculopathy} onChange={handleChange} /> Left Maculopathy</label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Image Quality</label>
            <select name="image_quality" value={formData.image_quality} onChange={handleChange} className="form-input">
              <option value="good">Good</option>
              <option value="adequate">Adequate</option>
              <option value="poor">Poor</option>
              <option value="ungradable">Ungradable</option>
            </select>
          </div>
          <div className="form-group">
            <label>Follow-up (months)</label>
            <select name="follow_up_months" value={formData.follow_up_months} onChange={handleChange} className="form-input">
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="12">24 months</option>
            </select>
          </div>
          <div className="form-group checkbox-group">
            <label><input type="checkbox" name="referral_needed" checked={formData.referral_needed} onChange={handleChange} /> Referral to Ophthalmology Required</label>
          </div>
        </div>

        <div className="form-group">
          <label>Clinical Notes</label>
          <textarea name="clinical_notes" value={formData.clinical_notes} onChange={handleChange} rows="3" className="form-input" />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Screening'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddDiabeticRetinopathyScreeningPage;