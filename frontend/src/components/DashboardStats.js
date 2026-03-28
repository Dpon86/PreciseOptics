/**
 * Dashboard Statistics Component
 * Displays system-wide statistics for conditions, protocols, referrals, and alerts
 */
import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './DashboardStats.css';

const DashboardStats = () => {
    const [conditionsStats, setConditionsStats] = useState(null);
    const [protocolsStats, setProtocolsStats] = useState(null);
    const [referralsStats, setReferralsStats] = useState(null);
    const [alertsStats, setAlertsStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllStatistics();
    }, []);

    const fetchAllStatistics = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all statistics in parallel
            const [conditions, protocols, referrals, alerts] = await Promise.allSettled([
                apiService.getConditionStatistics(),
                apiService.getProtocolStatistics(),
                apiService.getReferralStatistics(),
                apiService.getAlertStatistics()
            ]);

            // Set conditions stats
            if (conditions.status === 'fulfilled') {
                setConditionsStats(conditions.value.data);
            }

            // Set protocols stats
            if (protocols.status === 'fulfilled') {
                setProtocolsStats(protocols.value.data);
            }

            // Set referrals stats
            if (referrals.status === 'fulfilled') {
                setReferralsStats(referrals.value.data);
            }

            // Set alerts stats (may not be implemented yet)
            if (alerts.status === 'fulfilled') {
                setAlertsStats(alerts.value.data);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching statistics:', err);
            setError('Unable to load statistics');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-stats-loading">
                <div className="spinner"></div>
                <span>Loading statistics...</span>
            </div>
        );
    }

    if (error && !conditionsStats && !protocolsStats && !referralsStats) {
        return (
            <div className="dashboard-stats-error">
                <span className="error-icon">⚠</span>
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="dashboard-stats-container">
            <h2 className="dashboard-stats-title">System Overview</h2>
            
            <div className="dashboard-stats-grid">
                {/* Conditions Statistics */}
                {conditionsStats && (
                    <div className="stat-card conditions-card">
                        <div className="stat-card-header">
                            <span className="stat-icon">👁️</span>
                            <h3>Conditions</h3>
                        </div>
                        <div className="stat-card-body">
                            <div className="stat-main">
                                <div className="stat-number">{conditionsStats.active_patient_conditions || 0}</div>
                                <div className="stat-label">Active Patient Conditions</div>
                            </div>
                            <div className="stat-details">
                                <div className="stat-detail-item">
                                    <span className="detail-label">Total Conditions:</span>
                                    <span className="detail-value">{conditionsStats.active_conditions || 0}</span>
                                </div>
                                {conditionsStats.overdue_assessments > 0 && (
                                    <div className="stat-detail-item alert">
                                        <span className="detail-label">⚠ Overdue Assessments:</span>
                                        <span className="detail-value urgent">{conditionsStats.overdue_assessments}</span>
                                    </div>
                                )}
                                <div className="stat-detail-item">
                                    <span className="detail-label">Upcoming Assessments (7 days):</span>
                                    <span className="detail-value">{conditionsStats.upcoming_assessments || 0}</span>
                                </div>
                                <div className="stat-detail-item">
                                    <span className="detail-label">Recent Diagnoses (30 days):</span>
                                    <span className="detail-value">{conditionsStats.recent_diagnoses || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card-footer">
                            <a href="/conditions" className="stat-link">View All Conditions →</a>
                        </div>
                    </div>
                )}

                {/* Protocols Statistics */}
                {protocolsStats && (
                    <div className="stat-card protocols-card">
                        <div className="stat-card-header">
                            <span className="stat-icon">📋</span>
                            <h3>Protocols</h3>
                        </div>
                        <div className="stat-card-body">
                            <div className="stat-main">
                                <div className="stat-number">{protocolsStats.active_patient_protocols || 0}</div>
                                <div className="stat-label">Active Patient Protocols</div>
                            </div>
                            <div className="stat-details">
                                <div className="stat-detail-item">
                                    <span className="detail-label">Available Protocols:</span>
                                    <span className="detail-value">{protocolsStats.active_protocols || 0}</span>
                                </div>
                                <div className="stat-detail-item">
                                    <span className="detail-label">Completed Protocols:</span>
                                    <span className="detail-value">{protocolsStats.completed_patient_protocols || 0}</span>
                                </div>
                                {protocolsStats.avg_adherence && (
                                    <div className="stat-detail-item">
                                        <span className="detail-label">Average Adherence:</span>
                                        <span className="detail-value">{protocolsStats.avg_adherence.toFixed(1)}%</span>
                                    </div>
                                )}
                                {protocolsStats.pending_consents > 0 && (
                                    <div className="stat-detail-item alert">
                                        <span className="detail-label">⚠ Pending Consents:</span>
                                        <span className="detail-value">{protocolsStats.pending_consents}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="stat-card-footer">
                            <a href="/protocols" className="stat-link">View All Protocols →</a>
                        </div>
                    </div>
                )}

                {/* Referrals Statistics */}
                {referralsStats && (
                    <div className="stat-card referrals-card">
                        <div className="stat-card-header">
                            <span className="stat-icon">🔄</span>
                            <h3>Referrals</h3>
                        </div>
                        <div className="stat-card-body">
                            <div className="stat-main">
                                <div className="stat-number">{referralsStats.total_referrals || 0}</div>
                                <div className="stat-label">Total Active Referrals</div>
                            </div>
                            <div className="stat-details">
                                <div className="stat-detail-item">
                                    <span className="detail-label">Incoming:</span>
                                    <span className="detail-value">{referralsStats.incoming_referrals || 0}</span>
                                </div>
                                <div className="stat-detail-item">
                                    <span className="detail-label">Outgoing:</span>
                                    <span className="detail-value">{referralsStats.outgoing_referrals || 0}</span>
                                </div>
                                {referralsStats.pending_count > 0 && (
                                    <div className="stat-detail-item">
                                        <span className="detail-label">Pending:</span>
                                        <span className="detail-value">{referralsStats.pending_count}</span>
                                    </div>
                                )}
                                {referralsStats.overdue_count > 0 && (
                                    <div className="stat-detail-item alert">
                                        <span className="detail-label">⚠ Overdue:</span>
                                        <span className="detail-value urgent">{referralsStats.overdue_count}</span>
                                    </div>
                                )}
                                <div className="stat-detail-item">
                                    <span className="detail-label">Completed:</span>
                                    <span className="detail-value">{referralsStats.completed_count || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card-footer">
                            <a href="/referrals" className="stat-link">View All Referrals →</a>
                        </div>
                    </div>
                )}

                {/* Alerts Statistics */}
                {alertsStats && (
                    <div className="stat-card alerts-card">
                        <div className="stat-card-header">
                            <span className="stat-icon">🔔</span>
                            <h3>Alerts</h3>
                        </div>
                        <div className="stat-card-body">
                            <div className="stat-main">
                                <div className="stat-number">{alertsStats.total_active || 0}</div>
                                <div className="stat-label">Active Alerts</div>
                            </div>
                            <div className="stat-details">
                                {alertsStats.critical_count > 0 && (
                                    <div className="stat-detail-item alert">
                                        <span className="detail-label">🔴 Critical:</span>
                                        <span className="detail-value critical">{alertsStats.critical_count}</span>
                                    </div>
                                )}
                                {alertsStats.urgent_count > 0 && (
                                    <div className="stat-detail-item alert">
                                        <span className="detail-label">🟠 Urgent:</span>
                                        <span className="detail-value urgent">{alertsStats.urgent_count}</span>
                                    </div>
                                )}
                                <div className="stat-detail-item">
                                    <span className="detail-label">Warning:</span>
                                    <span className="detail-value">{alertsStats.warning_count || 0}</span>
                                </div>
                                <div className="stat-detail-item">
                                    <span className="detail-label">Acknowledged:</span>
                                    <span className="detail-value">{alertsStats.acknowledged_count || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card-footer">
                            <a href="/alerts" className="stat-link">View All Alerts →</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardStats;
