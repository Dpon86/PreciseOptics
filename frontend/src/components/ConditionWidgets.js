/**
 * Condition-Specific Dashboard Widgets
 * Displays individual cards for AMD, Diabetic Retinopathy, Glaucoma, and RVO
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import apiService from '../services/api';
import './ConditionWidgets.css';

const ConditionWidgets = ({ compact = false }) => {
    const [conditionsStats, setConditionsStats] = useState(null);
    const [patientConditions, setPatientConditions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConditionData();
    }, []);

    const fetchConditionData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsResponse, patientConditionsResponse] = await Promise.allSettled([
                apiService.getConditionStatistics(),
                apiService.getPatientConditions()
            ]);

            if (statsResponse.status === 'fulfilled') {
                setConditionsStats(statsResponse.value.data);
            }

            if (patientConditionsResponse.status === 'fulfilled') {
                setPatientConditions(patientConditionsResponse.value.data.results || patientConditionsResponse.value.data);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching condition data:', err);
            setError('Unable to load condition data');
            setLoading(false);
        }
    };

    // Helper function to get condition-specific data
    const getConditionData = (conditionCode, conditionName, category) => {
        if (!patientConditions || patientConditions.length === 0) {
            return {
                activePatients: 0,
                newDiagnoses: 0,
                severe: 0,
                improving: 0
            };
        }

        // Filter patient conditions by condition code or name
        const filteredConditions = patientConditions.filter(pc => {
            const matchesCode = pc.condition?.code === conditionCode;
            const matchesName = pc.condition?.name?.toLowerCase().includes(conditionName.toLowerCase());
            const matchesCategory = pc.condition?.category === category;
            return matchesCode || matchesName || matchesCategory;
        });

        const activePatients = filteredConditions.filter(pc => 
            pc.is_active && pc.current_status !== 'resolved'
        ).length;

        // New diagnoses (created in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newDiagnoses = filteredConditions.filter(pc => {
            const diagnosisDate = new Date(pc.diagnosis_date);
            return diagnosisDate >= thirtyDaysAgo;
        }).length;

        const severe = filteredConditions.filter(pc => 
            pc.severity === 'severe' || pc.severity === 'very_severe'
        ).length;

        const improving = filteredConditions.filter(pc => 
            pc.current_status === 'improving'
        ).length;

        return {
            activePatients,
            newDiagnoses,
            severe,
            improving
        };
    };

    if (loading) {
        return (
            <div className="condition-widgets-loading">
                <div className="spinner"></div>
                <span>Loading condition widgets...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="condition-widgets-error">
                <span className="error-icon">⚠</span>
                <span>{error}</span>
            </div>
        );
    }

    // Define condition configurations
    const conditions = [
        {
            code: 'AMD',
            name: 'Age-Related Macular Degeneration',
            shortName: 'AMD',
            category: 'retinal',
            icon: '🎯',
            color: '#e74c3c',
            bgGradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            reportPath: '/reports/condition-outcomes?type=amd'
        },
        {
            code: 'DIABETIC_RET',
            name: 'Diabetic Retinopathy',
            shortName: 'Diabetic Retinopathy',
            category: 'diabetic',
            icon: '🩸',
            color: '#9b59b6',
            bgGradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
            reportPath: '/reports/condition-outcomes?type=diabetic'
        },
        {
            code: 'GLAUCOMA',
            name: 'Glaucoma',
            shortName: 'Glaucoma',
            category: 'glaucoma',
            icon: '👁️',
            color: '#3498db',
            bgGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            reportPath: '/reports/condition-outcomes?type=glaucoma'
        },
        {
            code: 'RVO',
            name: 'Retinal Vein Occlusion',
            shortName: 'RVO',
            category: 'vascular',
            icon: '🔴',
            color: '#e67e22',
            bgGradient: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
            reportPath: '/reports/condition-outcomes?type=rvo'
        }
    ];

    return (
        <div className={`condition-widgets-container ${compact ? 'compact-mode' : ''}`}>
            <div className="condition-widgets-header">
                <h2>Condition-Specific Dashboards</h2>
                {!compact && <p className="subtitle">Quick overview of major eye conditions</p>}
            </div>

            <div className={`condition-widgets-grid ${compact ? 'compact-grid' : ''}`}>
                {conditions.map((condition) => {
                    const data = getConditionData(condition.code, condition.name, condition.category);
                    
                    return (
                        <div 
                            key={condition.code} 
                            className={`condition-widget ${compact ? 'compact-widget' : ''}`}
                            style={{ borderTop: `4px solid ${condition.color}` }}
                        >
                            {/* Header */}
                            <div 
                                className="widget-header"
                                style={{ background: condition.bgGradient }}
                            >
                                <div className="widget-icon">{condition.icon}</div>
                                <div className="widget-title">
                                    <h3>{condition.shortName}</h3>
                                    {!compact && <span className="widget-code">{condition.code}</span>}
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="widget-stats">
                                <div className="stat-item highlight">
                                    <div className="stat-value">{data.activePatients}</div>
                                    <div className="stat-label">Active Patients</div>
                                </div>

                                {!compact && (
                                    <>
                                        <div className="stat-row">
                                            <div className="stat-item small">
                                                <div className="stat-value">{data.newDiagnoses}</div>
                                                <div className="stat-label">New (30d)</div>
                                            </div>
                                            <div className="stat-item small">
                                                <div className="stat-value severe">{data.severe}</div>
                                                <div className="stat-label">Severe</div>
                                            </div>
                                        </div>

                                        <div className="stat-item success">
                                            <div className="stat-value">{data.improving}</div>
                                            <div className="stat-label">Improving</div>
                                        </div>
                                    </>
                                )}
                                
                                {compact && (
                                    <div className="stat-row compact-stats">
                                        <div className="stat-mini">
                                            <span className="stat-mini-value">{data.newDiagnoses}</span>
                                            <span className="stat-mini-label">New</span>
                                        </div>
                                        <div className="stat-mini">
                                            <span className="stat-mini-value severe">{data.severe}</span>
                                            <span className="stat-mini-label">Severe</span>
                                        </div>
                                        <div className="stat-mini">
                                            <span className="stat-mini-value success">{data.improving}</span>
                                            <span className="stat-mini-label">Better</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="widget-actions">
                                <Link 
                                    to={`/conditions?condition=${condition.code}`}
                                    className="widget-btn primary"
                                >
                                    {compact ? 'View' : 'View Patients'}
                                </Link>
                                {!compact && (
                                    <Link 
                                        to={condition.reportPath}
                                        className="widget-btn secondary"
                                    >
                                        View Report
                                    </Link>
                                )}
                            </div>

                            {/* Status Indicators */}
                            {!compact && (
                                <div className="widget-footer">
                                    <div className="status-indicators">
                                        {data.severe > 0 && (
                                            <span className="status-badge critical">
                                                {data.severe} Critical Case{data.severe !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {data.improving > 0 && (
                                            <span className="status-badge positive">
                                                {data.improving} Improving
                                            </span>
                                        )}
                                        {data.newDiagnoses > 0 && (
                                            <span className="status-badge info">
                                                {data.newDiagnoses} New
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary Footer */}
            <div className="widgets-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Active Conditions:</span>
                    <span className="summary-value">
                        {conditionsStats?.active_patient_conditions || 0}
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Recent Diagnoses (30 days):</span>
                    <span className="summary-value">
                        {conditionsStats?.recent_diagnoses || 0}
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Overdue Assessments:</span>
                    <span className="summary-value critical">
                        {conditionsStats?.overdue_assessments || 0}
                    </span>
                </div>
            </div>
        </div>
    );
};

ConditionWidgets.propTypes = {
    compact: PropTypes.bool
};

ConditionWidgets.defaultProps = {
    compact: false
};

export default ConditionWidgets;
