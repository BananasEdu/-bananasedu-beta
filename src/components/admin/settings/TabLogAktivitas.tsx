import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Clock, User, Settings, LogIn, LogOut, PlusCircle, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { dataStore, formatTimestamp } from '../../../store/dataStore';
import type { ActivityLog, Admin } from '../../../store/dataStore';

const actionIcons: { [key: string]: React.ReactNode } = {
    login: <LogIn size={14} />,
    logout: <LogOut size={14} />,
    create: <PlusCircle size={14} />,
    update: <Edit size={14} />,
    delete: <Trash2 size={14} />,
    approve: <CheckCircle size={14} />,
    reject: <XCircle size={14} />,
    settings: <Settings size={14} />,
};

const actionLabels: { [key: string]: string } = {
    login: 'Login',
    logout: 'Logout',
    create: 'Tambah',
    update: 'Edit',
    delete: 'Hapus',
    approve: 'Approve',
    reject: 'Reject',
    settings: 'Settings',
};

const actionColors: { [key: string]: string } = {
    login: 'success',
    logout: 'muted',
    create: 'primary',
    update: 'warning',
    delete: 'danger',
    approve: 'success',
    reject: 'danger',
    settings: 'primary',
};

const TabLogAktivitas: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

    // Filters
    const [filterAdmin, setFilterAdmin] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLogs(dataStore.getActivityLogs());
        setAdmins(dataStore.getAdmins());
        setCurrentAdmin(dataStore.getCurrentAdmin());
    };

    const isSuperAdmin = currentAdmin?.role === 'super_admin';

    const filteredLogs = useMemo(() => {
        let result = logs;

        if (filterAdmin) {
            result = result.filter(l => l.adminId === filterAdmin);
        }
        if (filterAction) {
            result = result.filter(l => l.action === filterAction);
        }
        if (filterDateStart) {
            const start = new Date(filterDateStart);
            result = result.filter(l => new Date(l.timestamp) >= start);
        }
        if (filterDateEnd) {
            const end = new Date(filterDateEnd);
            end.setHours(23, 59, 59);
            result = result.filter(l => new Date(l.timestamp) <= end);
        }

        // Sort by newest first
        return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, filterAdmin, filterAction, filterDateStart, filterDateEnd]);

    const clearFilters = () => {
        setFilterAdmin('');
        setFilterAction('');
        setFilterDateStart('');
        setFilterDateEnd('');
    };

    if (!isSuperAdmin) {
        return (
            <div className="tab-pane">
                <div className="empty-state">
                    <div className="empty-icon">🔒</div>
                    <div className="empty-title">Akses Ditolak</div>
                    <div className="empty-text">Hanya Super Admin yang bisa melihat log aktivitas</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            <div className="pane-header">
                <h3 className="section-title">📜 Log Aktivitas</h3>
                <button className="btn btn-secondary btn-sm" onClick={loadData}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-group">
                    <select value={filterAdmin} onChange={(e) => setFilterAdmin(e.target.value)} className="filter-select">
                        <option value="">Semua Admin</option>
                        {admins.map(a => (
                            <option key={a.id} value={a.id}>{a.username}</option>
                        ))}
                    </select>
                    <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="filter-select">
                        <option value="">Semua Aktivitas</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                        <option value="create">Tambah Data</option>
                        <option value="update">Edit Data</option>
                        <option value="delete">Hapus Data</option>
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                        <option value="settings">Settings</option>
                    </select>
                    <input
                        type="date"
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                        className="filter-input"
                        placeholder="Dari tanggal"
                    />
                    <input
                        type="date"
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                        className="filter-input"
                        placeholder="Sampai tanggal"
                    />
                    <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                        Clear
                    </button>
                </div>
            </div>

            {/* Log List */}
            {filteredLogs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <div className="empty-title">Tidak ada log aktivitas</div>
                    <div className="empty-text">Belum ada aktivitas yang tercatat</div>
                </div>
            ) : (
                <div className="log-list">
                    {filteredLogs.slice(0, 50).map((log) => (
                        <div key={log.id} className="log-item glass-card">
                            <div className={`log-icon ${actionColors[log.action] || 'muted'}`}>
                                {actionIcons[log.action] || <Clock size={14} />}
                            </div>
                            <div className="log-content">
                                <div className="log-header">
                                    <span className="log-admin">
                                        <User size={12} /> {log.adminName}
                                    </span>
                                    <span className={`log-action ${actionColors[log.action]}`}>
                                        {actionLabels[log.action] || log.action}
                                    </span>
                                    <span className="log-target">{log.target}</span>
                                </div>
                                <div className="log-details">{log.details}</div>
                                <div className="log-time">
                                    <Clock size={10} /> {formatTimestamp(log.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="pane-footer">
                <p className="footer-note">
                    📋 Menampilkan {Math.min(filteredLogs.length, 50)} dari {filteredLogs.length} log
                </p>
            </div>
        </div>
    );
};

export default TabLogAktivitas;
