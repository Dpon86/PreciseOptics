import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const AddGlaucomaAssessmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [formData, setFormData] = useState({
    patient: patientId || '',
    performed_by: '',
    test_date: new Date().toISOString().split('T')[0],
    right_eye_iop: '',
    left_eye_iop: '',
    iop_method: 'goldmann',
    right_eye_cct: '',
    left_eye_cct: '',
    right_angle: 'open',
    left_angle: 'open',
    right_cd_ratio: '',
    left_cd_ratio: '',
    glaucoma_type: 'suspect',
    target_iop: '',
    treatment_required: false,
    clinical_notes: '',
    recommendations: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);

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
      await api.create('glaucoma-assessments', payload);
      alert('Glaucoma assessment recorded!');
      navigate('/eye-tests');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="form-container">
      <h1>Add Glaucoma Assessment</h1>
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

        <h3>Intraocular Pressure (mmHg)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Right Eye IOP</label>
            <input type="number" step="0.1" name="right_eye_iop" value={formData.right_eye_iop} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Left Eye IOP</label>
            <input type="number" step="0.1" name="left_eye_iop" value={formData.left_eye_iop} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Method</label>
            <select name="iop_method" value={formData.iop_method} onChange={handleChange} className="form-input">
              <option value="goldmann">Goldmann</option>
              <option value="non_contact">Non-Contact</option>
              <option value="rebound">Rebound</option>
              <option value="schiotz">Schiotz</option>
            </select>
          </div>
        </div>

        <h3>Central Corneal Thickness (µm)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Right CCT</label>
            <input type="number" name="right_eye_cct" value={formData.right_eye_cct} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Left CCT</label>
            <input type="number" name="left_eye_cct" value={formData.left_eye_cct} onChange={handleChange} className="form-input" />
          </div>
        </div>

        <h3>Anterior Chamber Angle</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Right Angle</label>
            <select name="right_angle" value={formData.right_angle} onChange={handleChange} className="form-input">
              <option value="open">Open</option>
              <option value="narrow">Narrow</option>
              <option value="closed">Closed</option>
              <option value="occludable">Occludable</option>
            </select>
          </div>
          <div className="form-group">
            <label>Left Angle</label>
            <select name="left_angle" value={formData.left_angle} onChange={handleChange} className="form-input">
              <option value="open">Open</option>
              <option value="narrow">Narrow</option>
              <option value="closed">Closed</option>
              <option value="occludable">Occludable</option>
            </select>
          </div>
        </div>

        <h3>Cup-to-Disc Ratio</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Right C/D Ratio</label>
            <input type="number" step="0.1" min="0" max="1" name="right_cd_ratio" value={formData.right_cd_ratio} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Left C/D Ratio</label>
            <input type="number" step="0.1" min="0" max="1" name="left_cd_ratio" value={formData.left_cd_ratio} onChange={handleChange} className="form-input" />
          </div>
        </div>

        <h3>Diagnosis</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Glaucoma Type</label>
            <select name="glaucoma_type" value={formData.glaucoma_type} onChange={handleChange} className="form-input">
              <option value="normal">Normal</option>
              <option value="suspect">Glaucoma Suspect</option>
              <option value="poag">Primary Open Angle</option>
              <option value="pacg">Primary Angle Closure</option>
              <option value="nsg">Normal Tension</option>
              <option value="secondary">Secondary</option>
            </select>
          </div>
          <div className="form-group">
            <label>Target IOP (mmHg)</label>
            <input type="number" step="0.1" name="target_iop" value={formData.target_iop} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group checkbox-group">
            <label><input type="checkbox" name="treatment_required" checked={formData.treatment_required} onChange={handleChange} /> Treatment Required</label>
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

export default AddGlaucomaAssessmentPage;