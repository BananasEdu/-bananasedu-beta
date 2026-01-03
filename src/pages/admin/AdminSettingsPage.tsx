import React from 'react';
import { User, LogOut, Database, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminStyles.css';

const AdminSettingsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-settings-page">
            <h1 className="page-title">⚙️ Profil & Pengaturan</h1>

            <div className="settings-grid">
                {/* Profile Card */}
                <div className="settings-card">
                    <h2 className="card-title"><User size={20} /> Profil Admin</h2>
                    <div className="profile-info">
                        <div className="avatar-large">👤</div>
                        <div className="profile-details">
                            <div className="info-row">
                                <span className="label">Username</span>
                                <span className="value">@{user?.username || 'admin'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Nama</span>
                                <span className="value">{user?.fullName || 'Administrator'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Role</span>
                                <span className="value badge-admin">👑 Admin</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-danger logout-btn" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                {/* System Info Card */}
                <div className="settings-card">
                    <h2 className="card-title"><Info size={20} /> Informasi Sistem</h2>
                    <div className="system-info">
                        <div className="info-row">
                            <span className="label">Versi Aplikasi</span>
                            <span className="value">BananasEdu Beta v1.0</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Backend</span>
                            <span className="value">Google Apps Script</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Database</span>
                            <span className="value">Google Sheets</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Status Koneksi</span>
                            <span className="value status-connected">
                                <CheckCircle size={14} /> Terhubung
                            </span>
                        </div>
                    </div>
                </div>

                {/* Storage Info Card */}
                <div className="settings-card">
                    <h2 className="card-title"><Database size={20} /> Penyimpanan Data</h2>
                    <div className="system-info">
                        <div className="info-row">
                            <span className="label">Sheet Users</span>
                            <span className="value">Aktif</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Sheet Grades</span>
                            <span className="value">Aktif</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Spreadsheet ID</span>
                            <span className="value code">1DrKly...q6M</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
