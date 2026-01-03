import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Loader2, Search, User, LogIn, UserPlus, Edit, Trash2, FileText, Monitor, Smartphone } from 'lucide-react';
import { gasApi, type GasLogData } from '../../lib/adminApi';
import '../../styles/AdminStyles.css';

const actionIcons: Record<string, React.ReactNode> = {
    'REGISTER': <UserPlus size={16} />,
    'LOGIN': <LogIn size={16} />,
    'UPDATE_USER': <Edit size={16} />,
    'DELETE_USER': <Trash2 size={16} />,
    'DEFAULT': <FileText size={16} />,
};

const actionLabels: Record<string, string> = {
    'REGISTER': 'Daftar Akun',
    'LOGIN': 'Login',
    'UPDATE_USER': 'Edit Akun',
    'DELETE_USER': 'Hapus Akun',
};

const LogActivityPage: React.FC = () => {
    const [logs, setLogs] = useState<GasLogData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filterAction, setFilterAction] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await gasApi.getAllLogs();
            if (result.success && result.logs) {
                setLogs(result.logs);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat log');
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique actions
    const uniqueActions = useMemo(() => [...new Set(logs.map(l => l.action))], [logs]);

    // Filtered logs
    const filteredLogs = useMemo(() => {
        return logs.filter(l => {
            const matchAction = !filterAction || l.action === filterAction;
            const matchSearch = !searchQuery ||
                l.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.details?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchAction && matchSearch;
        });
    }, [logs, filterAction, searchQuery]);

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    const getActionIcon = (action: string) => {
        return actionIcons[action] || actionIcons['DEFAULT'];
    };

    const getActionLabel = (action: string) => {
        return actionLabels[action] || action;
    };

    const getActionClass = (action: string) => {
        switch (action) {
            case 'REGISTER': return 'action-register';
            case 'LOGIN': return 'action-login';
            case 'UPDATE_USER': return 'action-update';
            case 'DELETE_USER': return 'action-delete';
            default: return '';
        }
    };

    if (isLoading) {
        return (
            <div className="log-activity-page">
                <div className="loading-state">
                    <Loader2 className="spinner" size={40} />
                    <p>Memuat log aktifitas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="log-activity-page">
                <div className="error-state">
                    <p>⚠️ {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>
                        <RefreshCw size={16} /> Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="log-activity-page">
            <div className="page-header">
                <h1 className="page-title">📜 Log Aktifitas</h1>
                <button className="btn btn-secondary btn-sm" onClick={loadData}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-group">
                    <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="filter-select">
                        <option value="">Semua Aktifitas</option>
                        {uniqueActions.map(a => (
                            <option key={a} value={a}>{getActionLabel(a)}</option>
                        ))}
                    </select>
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Cari username atau detail..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '180px' }}>Waktu</th>
                            <th style={{ width: '150px' }}>Aktifitas</th>
                            <th style={{ width: '150px' }}>Username</th>
                            <th style={{ width: '120px' }}>Perangkat</th>
                            <th>Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr><td colSpan={4} className="text-center text-muted">Belum ada log aktifitas</td></tr>
                        ) : (
                            filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="text-muted">{formatDateTime(log.timestamp)}</td>
                                    <td>
                                        <span className={`action-badge ${getActionClass(log.action)}`}>
                                            {getActionIcon(log.action)}
                                            {getActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="username-cell">
                                            <User size={14} />
                                            @{log.username || '-'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="device-info" title={log.userAgent}>
                                            {(log.userAgent?.includes('Mobile') || log.userAgent?.includes('Android') || log.userAgent?.includes('iPhone'))
                                                ? <Smartphone size={14} className="text-muted" />
                                                : <Monitor size={14} className="text-muted" />
                                            }
                                            <span className="text-xs text-muted ms-1">
                                                {log.userAgent?.includes('Windows') ? 'Windows' :
                                                    log.userAgent?.includes('Mac') ? 'Mac' :
                                                        log.userAgent?.includes('Android') ? 'Android' :
                                                            log.userAgent?.includes('iPhone') ? 'iPhone' :
                                                                log.userAgent?.includes('Linux') ? 'Linux' :
                                                                    log.userAgent ? 'Device' : '-'}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="text-muted">{log.details || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pane-footer">
                <p className="footer-note">📊 Total: {filteredLogs.length} log</p>
            </div>
        </div>
    );
};

export default LogActivityPage;
