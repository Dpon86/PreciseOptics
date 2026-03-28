import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Enhanced statistics
    const [conditionsStats, setConditionsStats] = useState(null);
    const [protocolsStats, setProtocolsStats] = useState(null);
    const [referralsStats, setReferralsStats] = useState(null);

    useEffect(() => {
        fetchAllData();
        fetchEnhancedStatistics();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/api/data/all-models/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data: ' + err.message);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnhancedStatistics = async () => {
        try {
            // Fetch enhanced statistics in parallel
            const [conditions, protocols, referrals] = await Promise.allSettled([
                apiService.getConditionStatistics(),
                apiService.getProtocolStatistics(),
                apiService.getReferralStatistics()
            ]);

            if (conditions.status === 'fulfilled') {
                setConditionsStats(conditions.value.data);
            }

            if (protocols.status === 'fulfilled') {
                setProtocolsStats(protocols.value.data);
            }

            if (referrals.status === 'fulfilled') {
                setReferralsStats(referrals.value.data);
            }
        } catch (err) {
            console.error('Error fetching enhanced statistics:', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading">Loading all system data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="error">
                    <h3>Error Loading Data</h3>
                    <p>{error}</p>
                    <button onClick={fetchAllData} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="admin-dashboard">
                <div className="no-data">No data available</div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'patients', label: 'Patients', icon: '👥' },
        { id: 'staff', label: 'Staff', icon: '👨‍⚕️' },
        { id: 'visits', label: 'Visits', icon: '🏥' },
        { id: 'consultations', label: 'Consultations', icon: '💬' },
        { id: 'medications', label: 'Medications', icon: '💊' },
        { id: 'prescriptions', label: 'Prescriptions', icon: '📋' },
        { id: 'eye-tests', label: 'Eye Tests', icon: '👁️' },
        { id: 'audit', label: 'Audit Logs', icon: '📝' },
    ];

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h1>🏥 PreciseOptics - Complete System Data</h1>
                <button onClick={fetchAllData} className="refresh-btn">
                    🔄 Refresh Data
                </button>
            </header>

            <nav className="dashboard-nav">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </nav>

            <main className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <h2>System Overview</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <h3>{data.stats.total_patients}</h3>
                                    <p>Total Patients</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">👨‍⚕️</div>
                                <div className="stat-info">
                                    <h3>{data.stats.total_staff}</h3>
                                    <p>Medical Staff</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🏥</div>
                                <div className="stat-info">
                                    <h3>{data.stats.total_visits}</h3>
                                    <p>Patient Visits</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💬</div>
                                <div className="stat-info">
                                    <h3>{data.stats.total_consultations}</h3>
                                    <p>Consultations</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💊</div>
                                <div className="stat-info">
                                    <h3>{data.stats.total_medications}</h3>
                                    <p>Medications</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📋</div>
                                <div className="stat-info">
                                    <h3>{data.stats.active_prescriptions}</h3>
                                    <p>Active Prescriptions</p>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Statistics Sections */}
                        <div className="enhanced-stats-container">
                            {/* Conditions Analytics */}
                            {conditionsStats && (
                                <div className="enhanced-stat-section">
                                    <h3 className="section-title">
                                        <span className="section-icon">👁️</span>
                                        Conditions Analytics
                                    </h3>
                                    <div className="enhanced-stats-grid">
                                        <div className="enhanced-stat-card">
                                            <div className="stat-title">Active Patient Conditions</div>
                                            <div className="stat-value large">{conditionsStats.active_patient_conditions || 0}</div>
                                            <div className="stat-breakdown">
                                                <div className="breakdown-item">
                                                    <span>Total Conditions:</span>
                                                    <strong>{conditionsStats.active_conditions || 0}</strong>
                                                </div>
                                                <div className="breakdown-item">
                                                    <span>Recent Diagnoses (30 days):</span>
                                                    <strong>{conditionsStats.recent_diagnoses || 0}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="enhanced-stat-card">
                                            <div className="stat-title">Assessment Schedule</div>
                                            <div className="stat-details-list">
                                                <div className="detail-row">
                                                    <span className="detail-label">Upcoming (7 days):</span>
                                                    <span className="detail-value">{conditionsStats.upcoming_assessments || 0}</span>
                                                </div>
                                                {conditionsStats.overdue_assessments > 0 && (
                                                    <div className="detail-row alert">
                                                        <span className="detail-label">⚠ Overdue:</span>
                                                        <span className="detail-value urgent">{conditionsStats.overdue_assessments}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {conditionsStats.conditions_by_severity && Object.keys(conditionsStats.conditions_by_severity).length > 0 && (
                                            <div className="enhanced-stat-card">
                                                <div className="stat-title">Conditions by Severity</div>
                                                <div className="severity-breakdown">
                                                    {Object.entries(conditionsStats.conditions_by_severity).map(([severity, count]) => (
                                                        <div key={severity} className="severity-item">
                                                            <span className={`severity-badge ${severity.toLowerCase()}`}>
                                                                {severity}
                                                            </span>
                                                            <span className="severity-count">{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Protocols Analytics */}
                            {protocolsStats && (
                                <div className="enhanced-stat-section">
                                    <h3 className="section-title">
                                        <span className="section-icon">📋</span>
                                        Protocol Performance
                                    </h3>
                                    <div className="enhanced-stats-grid">
                                        <div className="enhanced-stat-card">
                                            <div className="stat-title">Active Patient Protocols</div>
                                            <div className="stat-value large">{protocolsStats.active_patient_protocols || 0}</div>
                                            <div className="stat-breakdown">
                                                <div className="breakdown-item">
                                                    <span>Completed:</span>
                                                    <strong>{protocolsStats.completed_patient_protocols || 0}</strong>
                                                </div>
                                                <div className="breakdown-item">
                                                    <span>Available Protocols:</span>
                                                    <strong>{protocolsStats.active_protocols || 0}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        {protocolsStats.avg_adherence && (
                                            <div className="enhanced-stat-card">
                                                <div className="stat-title">Protocol Adherence</div>
                                                <div className="stat-value large">{protocolsStats.avg_adherence.toFixed(1)}%</div>
                                                <div className="stat-subtitle">Average adherence rate</div>
                                            </div>
                                        )}
                                        {protocolsStats.pending_consents > 0 && (
                                            <div className="enhanced-stat-card alert-card">
                                                <div className="stat-title">⚠ Pending Consents</div>
                                                <div className="stat-value large urgent">{protocolsStats.pending_consents}</div>
                                                <div className="stat-subtitle">Require patient consent</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Referrals Analytics */}
                            {referralsStats && (
                                <div className="enhanced-stat-section">
                                    <h3 className="section-title">
                                        <span className="section-icon">🔄</span>
                                        Referral Management
                                    </h3>
                                    <div className="enhanced-stats-grid">
                                        <div className="enhanced-stat-card">
                                            <div className="stat-title">Total Referrals</div>
                                            <div className="stat-value large">{referralsStats.total_referrals || 0}</div>
                                            <div className="stat-breakdown">
                                                <div className="breakdown-item">
                                                    <span>Incoming:</span>
                                                    <strong>{referralsStats.incoming_referrals || 0}</strong>
                                                </div>
                                                <div className="breakdown-item">
                                                    <span>Outgoing:</span>
                                                    <strong>{referralsStats.outgoing_referrals || 0}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="enhanced-stat-card">
                                            <div className="stat-title">Referral Status</div>
                                            <div className="stat-details-list">
                                                <div className="detail-row">
                                                    <span className="detail-label">Pending:</span>
                                                    <span className="detail-value">{referralsStats.pending_count || 0}</span>
                                                </div>
                                                {referralsStats.overdue_count > 0 && (
                                                    <div className="detail-row alert">
                                                        <span className="detail-label">⚠ Overdue:</span>
                                                        <span className="detail-value urgent">{referralsStats.overdue_count}</span>
                                                    </div>
                                                )}
                                                <div className="detail-row">
                                                    <span className="detail-label">Completed:</span>
                                                    <span className="detail-value">{referralsStats.completed_count || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="enhanced-stat-card">
                                            <div className="stat-title">Referral Sources</div>
                                            <div className="stat-value large">{referralsStats.active_sources || 0}</div>
                                            <div className="stat-subtitle">
                                                {referralsStats.preferred_sources || 0} preferred sources
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'patients' && (
                    <div className="patients-section">
                        <h2>Patients ({data.patients.length})</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Patient ID</th>
                                        <th>Name</th>
                                        <th>Age</th>
                                        <th>Gender</th>
                                        <th>Phone</th>
                                        <th>Registration Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.patients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td>{patient.patient_id}</td>
                                            <td>{patient.name}</td>
                                            <td>{patient.age}</td>
                                            <td>{patient.gender}</td>
                                            <td>{patient.phone_number}</td>
                                            <td>{formatDate(patient.registration_date)}</td>
                                            <td>
                                                <span className={`status ${patient.is_active ? 'active' : 'inactive'}`}>
                                                    {patient.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div className="staff-section">
                        <h2>Medical Staff ({data.staff_profiles.length})</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Specialization</th>
                                        <th>License</th>
                                        <th>Experience</th>
                                        <th>Consultant</th>
                                        <th>Can Prescribe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.staff_profiles.map((staff) => (
                                        <tr key={staff.id}>
                                            <td>{staff.name}</td>
                                            <td>{staff.department}</td>
                                            <td>{staff.specialization || 'N/A'}</td>
                                            <td>{staff.license_number}</td>
                                            <td>{staff.years_of_experience} years</td>
                                            <td>
                                                <span className={`badge ${staff.is_consultant ? 'yes' : 'no'}`}>
                                                    {staff.is_consultant ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${staff.can_prescribe ? 'yes' : 'no'}`}>
                                                    {staff.can_prescribe ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'visits' && (
                    <div className="visits-section">
                        <h2>Patient Visits ({data.visits.length})</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Type</th>
                                        <th>Doctor</th>
                                        <th>Status</th>
                                        <th>Chief Complaint</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.visits.map((visit) => (
                                        <tr key={visit.id}>
                                            <td>{formatDateTime(visit.scheduled_date)}</td>
                                            <td>{visit.patient_name}</td>
                                            <td>{visit.visit_type}</td>
                                            <td>{visit.primary_doctor}</td>
                                            <td>
                                                <span className={`status ${visit.status}`}>
                                                    {visit.status}
                                                </span>
                                            </td>
                                            <td>{visit.chief_complaint}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'consultations' && (
                    <div className="consultations-section">
                        <h2>Consultations ({data.consultations.length})</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Primary Diagnosis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.consultations.map((consultation) => (
                                        <tr key={consultation.id}>
                                            <td>{formatDateTime(consultation.scheduled_time)}</td>
                                            <td>{consultation.patient_name}</td>
                                            <td>{consultation.consulting_doctor}</td>
                                            <td>{consultation.consultation_type}</td>
                                            <td>
                                                <span className={`status ${consultation.status}`}>
                                                    {consultation.status}
                                                </span>
                                            </td>
                                            <td>{consultation.diagnosis_primary || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'medications' && (
                    <div className="medications-section">
                        <h2>Medications ({data.medications.length})</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Generic Name</th>
                                        <th>Type</th>
                                        <th>Strength</th>
                                        <th>Stock</th>
                                        <th>Price</th>
                                        <th>Stock Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.medications.map((medication) => (
                                        <tr key={medication.id}>
                                            <td>{medication.name}</td>
                                            <td>{medication.generic_name}</td>
                                            <td>{medication.medication_type}</td>
                                            <td>{medication.strength}</td>
                                            <td>{medication.current_stock}</td>
                                            <td>£{medication.unit_price}</td>
                                            <td>
                                                <span className={`badge ${medication.is_low_stock ? 'low' : 'ok'}`}>
                                                    {medication.is_low_stock ? 'Low Stock' : 'OK'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'prescriptions' && (
                    <div className="prescriptions-section">
                        <h2>Prescriptions ({data.prescriptions.length})</h2>
                        <div className="prescriptions-grid">
                            {data.prescriptions.map((prescription) => (
                                <div key={prescription.id} className="prescription-card">
                                    <div className="prescription-header">
                                        <h3>RX: {prescription.prescription_number}</h3>
                                        <span className={`status ${prescription.status}`}>
                                            {prescription.status}
                                        </span>
                                    </div>
                                    <div className="prescription-info">
                                        <p><strong>Patient:</strong> {prescription.patient_name}</p>
                                        <p><strong>Doctor:</strong> {prescription.prescribing_doctor}</p>
                                        <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                                        <p><strong>Date:</strong> {formatDateTime(prescription.date_prescribed)}</p>
                                        <p><strong>Valid Until:</strong> {formatDate(prescription.valid_until)}</p>
                                    </div>
                                    <div className="prescription-items">
                                        <h4>Medications:</h4>
                                        {prescription.items.map((item, index) => (
                                            <div key={index} className="medication-item">
                                                <strong>{item.medication_name}</strong> - {item.dosage} {item.frequency} for {item.duration_days} days
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'eye-tests' && (
                    <div className="eye-tests-section">
                        <h2>Eye Tests</h2>
                        
                        <div className="test-category">
                            <h3>Visual Acuity Tests ({data.visual_acuity_tests.length})</h3>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Patient</th>
                                            <th>Performed By</th>
                                            <th>Right Eye (Distance)</th>
                                            <th>Left Eye (Distance)</th>
                                            <th>Right Eye (Near)</th>
                                            <th>Left Eye (Near)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.visual_acuity_tests.map((test) => (
                                            <tr key={test.id}>
                                                <td>{formatDate(test.test_date)}</td>
                                                <td>{test.patient_name}</td>
                                                <td>{test.performed_by}</td>
                                                <td>{test.right_eye_distance}</td>
                                                <td>{test.left_eye_distance}</td>
                                                <td>{test.right_eye_near}</td>
                                                <td>{test.left_eye_near}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="test-category">
                            <h3>Glaucoma Assessments ({data.glaucoma_tests.length})</h3>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Patient</th>
                                            <th>Performed By</th>
                                            <th>IOP Right</th>
                                            <th>IOP Left</th>
                                            <th>Risk Level</th>
                                            <th>Findings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.glaucoma_tests.map((test) => (
                                            <tr key={test.id}>
                                                <td>{formatDate(test.assessment_date)}</td>
                                                <td>{test.patient_name}</td>
                                                <td>{test.performed_by}</td>
                                                <td>{test.iop_right_eye} mmHg</td>
                                                <td>{test.iop_left_eye} mmHg</td>
                                                <td>
                                                    <span className={`badge risk-${test.risk_level}`}>
                                                        {test.risk_level}
                                                    </span>
                                                </td>
                                                <td>{test.findings}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="audit-section">
                        <h2>Recent Audit Logs ({data.audit_logs.length})</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Model</th>
                                        <th>IP Address</th>
                                        <th>Changes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.audit_logs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{formatDateTime(log.timestamp)}</td>
                                            <td>{log.user}</td>
                                            <td>
                                                <span className={`action ${log.action}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>{log.model_name}</td>
                                            <td>{log.ip_address}</td>
                                            <td className="changes">{log.changes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;