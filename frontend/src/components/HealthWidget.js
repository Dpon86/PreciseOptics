/**
 * System Health Widget
 * Displays real-time system health status from the backend health check endpoints
 */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './HealthWidget.css';

const HealthWidget = ({ compact = false }) => {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const fetchHealthData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch detailed health check (no auth required)
            const response = await fetch('http://localhost:8000/health/detailed/');
            const data = await response.json();
            
            setHealthData(data);
            setLastUpdate(new Date());
            setLoading(false);
        } catch (err) {
            console.error('Health check failed:', err);
            setError('Unable to connect to server');
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchHealthData();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchHealthData, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'healthy': return 'green';
            case 'degraded': return 'orange';
            case 'unhealthy': return 'red';
            default: return 'gray';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'healthy': return '✓';
            case 'degraded': return '⚠';
            case 'unhealthy': return '✗';
            default: return '?';
        }
    };

    if (loading && !healthData) {
        return (
            <div className={`health-widget ${compact ? 'compact' : ''}`}>
                <div className="health-widget-loading">
                    <div className="spinner"></div>
                    <span>Checking system health...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`health-widget ${compact ? 'compact' : ''}`}>
                <div className="health-widget-error">
                    <span className="error-icon">⚠</span>
                    <div>
                        <div className="error-title">Health Check Failed</div>
                        <div className="error-message">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!healthData) return null;

    const {status, checks, timestamp} = healthData;
    const overallColor = getStatusColor(status);

    if (compact) {
        return (
            <div className="health-widget compact">
                <div className="health-status-compact">
                    <span className={`status-indicator ${overallColor}`}>
                        {getStatusIcon(status)}
                    </span>
                    <span className="status-text">
                        System {status === 'healthy' ? 'Healthy' : status === 'degraded' ? 'Degraded' : 'Unhealthy'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="health-widget">
            <div className="health-widget-header">
                <h3>System Health</h3>
                <button onClick={fetchHealthData} className="refresh-btn" title="Refresh">
                    🔄
                </button>
            </div>

            <div className="health-overall-status">
                <span className={`status-circle ${overallColor}`}>
                    {getStatusIcon(status)}
                </span>
                <div className="status-info">
                    <div className="status-title">
                        Overall Status: <strong className={overallColor}>{status.toUpperCase()}</strong>
                    </div>
                    {lastUpdate && (
                        <div className="last-update">
                            Last updated: {lastUpdate.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            <div className="health-checks">
                {/* Database Status */}
                {checks?.database && (
                    <div className="health-check-item">
                        <span className={`check-status ${getStatusColor(checks.database.status)}`}>
                            {getStatusIcon(checks.database.status)}
                        </span>
                        <div className="check-details">
                            <div className="check-name">Database</div>
                            <div className="check-info">
                                {checks.database.engine?.split('.').pop()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Cache Status */}
                {checks?.cache && (
                    <div className="health-check-item">
                        <span className={`check-status ${getStatusColor(checks.cache.status)}`}>
                            {getStatusIcon(checks.cache.status)}
                        </span>
                        <div className="check-details">
                            <div className="check-name">Cache</div>
                            <div className="check-info">
                                {checks.cache.backend?.split('.').pop()}
                            </div>
                        </div>
                    </div>
                )}

                {/* System Info */}
                {checks?.system && (
                    <div className="health-check-item">
                        <span className={`check-status ${getStatusColor(checks.system.status)}`}>
                            {getStatusIcon(checks.system.status)}
                        </span>
                        <div className="check-details">
                            <div className="check-name">Application</div>
                            <div className="check-info">
                                Django {checks.system.django_version}
                                {checks.system.debug_mode && <span className="debug-badge">DEBUG</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Core Modules */}
                {checks?.applications?.core_modules && (
                    <div className="health-check-item">
                        <span className={`check-status ${getStatusColor(checks.applications.status)}`}>
                            {getStatusIcon(checks.applications.status)}
                        </span>
                        <div className="check-details">
                            <div className="check-name">Core Modules</div>
                            <div className="check-info">
                                {Object.values(checks.applications.core_modules).filter(Boolean).length} modules active
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {checks?.system?.debug_mode && (
                <div className="health-warning">
                    ⚠ Debug mode is enabled. Not suitable for production.
                </div>
            )}
        </div>
    );
};

export default HealthWidget;
