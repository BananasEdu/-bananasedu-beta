import React, { useState, useEffect } from 'react';
import { User, Key, LogOut, Edit2, Save, X, Camera } from 'lucide-react';
import { dataStore, formatTimestamp } from '../../../store/dataStore';
import type { Admin } from '../../../store/dataStore';

const TabProfilSaya: React.FC = () => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [photoUrl, setPhotoUrl] = useState('');
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    useEffect(() => {
        loadAdmin();
    }, []);

    const loadAdmin = () => {
        // Get current admin or default to first admin for demo
        let currentAdmin = dataStore.getCurrentAdmin();
        if (!currentAdmin) {
            const admins = dataStore.getAdmins();
            if (admins.length > 0) {
                currentAdmin = admins[0];
                dataStore.setCurrentAdmin(currentAdmin);
            }
        }
        setAdmin(currentAdmin);
        if (currentAdmin) {
            setNewUsername(currentAdmin.username);
            setPhotoUrl(currentAdmin.photoUrl || '');
        }
    };

    const handleSaveUsername = () => {
        if (!admin || !newUsername.trim()) return;
        if (newUsername === admin.username) {
            setIsEditingUsername(false);
            return;
        }
        // Check if username exists
        const existing = dataStore.getAdminByUsername(newUsername);
        if (existing && existing.id !== admin.id) {
            alert('Username sudah digunakan!');
            return;
        }
        dataStore.updateAdmin(admin.id, { username: newUsername.trim() });
        const updated = dataStore.getAdminById(admin.id);
        if (updated) {
            setAdmin(updated);
            dataStore.setCurrentAdmin(updated);
        }
        setIsEditingUsername(false);
    };

    const handleChangePassword = () => {
        setPasswordError('');
        setPasswordSuccess(false);

        if (!admin) return;
        if (currentPassword !== admin.password) {
            setPasswordError('Password lama salah!');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password minimal 6 karakter!');
            return;
        }
        if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            setPasswordError('Password harus mengandung huruf kecil, huruf besar, dan angka!');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Konfirmasi password tidak cocok!');
            return;
        }

        dataStore.updateAdmin(admin.id, { password: newPassword });
        const updated = dataStore.getAdminById(admin.id);
        if (updated) {
            setAdmin(updated);
            dataStore.setCurrentAdmin(updated);
        }
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
            setShowPasswordModal(false);
            setPasswordSuccess(false);
        }, 1500);
    };

    const handleSavePhoto = () => {
        if (!admin) return;
        dataStore.updateAdmin(admin.id, { photoUrl });
        const updated = dataStore.getAdminById(admin.id);
        if (updated) {
            setAdmin(updated);
            dataStore.setCurrentAdmin(updated);
        }
        setShowPhotoModal(false);
    };

    const handleLogout = () => {
        if (confirm('Yakin ingin logout?')) {
            dataStore.logoutCurrentAdmin();
            // Redirect to login (in real app would use router)
            window.location.href = '/login';
        }
    };

    if (!admin) {
        return (
            <div className="tab-pane">
                <div className="empty-state">
                    <div className="empty-icon">👤</div>
                    <div className="empty-title">Tidak ada admin yang login</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            {/* Profile Card */}
            <div className="profile-card glass-card">
                <div className="profile-header">
                    <div className="avatar-container" onClick={() => setShowPhotoModal(true)}>
                        {admin.photoUrl ? (
                            <img src={admin.photoUrl} alt={admin.username} className="avatar-img" />
                        ) : (
                            <div className="avatar-placeholder">
                                <User size={48} />
                            </div>
                        )}
                        <div className="avatar-overlay">
                            <Camera size={20} />
                        </div>
                    </div>
                    <div className="profile-info">
                        {isEditingUsername ? (
                            <div className="edit-username-inline">
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="username-input"
                                    autoFocus
                                />
                                <button className="icon-btn-sm success" onClick={handleSaveUsername}>
                                    <Save size={16} />
                                </button>
                                <button className="icon-btn-sm" onClick={() => { setIsEditingUsername(false); setNewUsername(admin.username); }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="username-display">
                                <h2>{admin.username}</h2>
                                <button className="icon-btn-sm" onClick={() => setIsEditingUsername(true)} title="Edit username">
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        )}
                        <span className={`role-badge ${admin.role === 'super_admin' ? 'primary' : 'secondary'}`}>
                            {admin.role === 'super_admin' ? '👑 Super Admin' : '🔧 Admin'}
                        </span>
                    </div>
                </div>

                <div className="profile-details">
                    <div className="detail-row">
                        <span className="label">Status</span>
                        <span className={`status-badge ${admin.status}`}>
                            {admin.status === 'active' ? '🟢 Aktif' : '🔴 Nonaktif'}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Bergabung sejak</span>
                        <span className="value">{formatTimestamp(admin.createdAt)}</span>
                    </div>
                </div>

                <div className="profile-actions">
                    <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
                        <Key size={16} /> Ganti Password
                    </button>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Permissions Info (for reference) */}
            {admin.role === 'admin' && (
                <div className="permissions-card glass-card">
                    <h3>🔐 Akses Anda</h3>
                    <div className="permissions-grid">
                        <div className={`perm-item ${admin.permissions.canViewMasterData ? 'allowed' : 'denied'}`}>
                            {admin.permissions.canViewMasterData ? '✅' : '❌'} Lihat Master Data
                        </div>
                        <div className={`perm-item ${admin.permissions.canEditMasterData ? 'allowed' : 'denied'}`}>
                            {admin.permissions.canEditMasterData ? '✅' : '❌'} Edit Master Data
                        </div>
                        <div className={`perm-item ${admin.permissions.canViewMasterNilai ? 'allowed' : 'denied'}`}>
                            {admin.permissions.canViewMasterNilai ? '✅' : '❌'} Lihat Master Nilai
                        </div>
                        <div className={`perm-item ${admin.permissions.canEditMasterNilai ? 'allowed' : 'denied'}`}>
                            {admin.permissions.canEditMasterNilai ? '✅' : '❌'} Edit Master Nilai
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔐 Ganti Password</h3>
                            <button className="close-btn" onClick={() => setShowPasswordModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                            {passwordSuccess && <div className="alert alert-success">Password berhasil diubah!</div>}

                            <div className="form-group">
                                <label>Password Lama</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Masukkan password lama"
                                />
                            </div>
                            <div className="form-group">
                                <label>Password Baru</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 6 karakter, huruf besar+kecil+angka"
                                />
                            </div>
                            <div className="form-group">
                                <label>Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password baru"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleChangePassword}>💾 Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo URL Modal */}
            {showPhotoModal && (
                <div className="modal-overlay" onClick={() => setShowPhotoModal(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📷 Ubah Foto Profil</h3>
                            <button className="close-btn" onClick={() => setShowPhotoModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>URL Foto (Google Drive atau link lainnya)</label>
                                <input
                                    type="url"
                                    value={photoUrl}
                                    onChange={(e) => setPhotoUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            {photoUrl && (
                                <div className="photo-preview">
                                    <img src={photoUrl} alt="Preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPhotoModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleSavePhoto}>💾 Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabProfilSaya;
