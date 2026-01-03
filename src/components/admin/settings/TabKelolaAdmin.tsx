import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Key, Power, X, Shield, ShieldCheck } from 'lucide-react';
import { dataStore, formatTimestamp, generatePassword } from '../../../store/dataStore';
import type { Admin } from '../../../store/dataStore';

const TabKelolaAdmin: React.FC = () => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [generatedPassword, setGeneratedPassword] = useState('');

    // Form state
    const [form, setForm] = useState({
        username: '',
        role: 'admin' as 'admin' | 'super_admin',
        permissions: {
            canViewMasterData: true,
            canEditMasterData: false,
            canViewMasterNilai: true,
            canEditMasterNilai: false,
            canViewSettings: true,
            canManageAdmins: false,
        },
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setAdmins(dataStore.getAdmins());
        setCurrentAdmin(dataStore.getCurrentAdmin());
    };

    const isSuperAdmin = currentAdmin?.role === 'super_admin';

    const resetForm = () => {
        setForm({
            username: '',
            role: 'admin',
            permissions: {
                canViewMasterData: true,
                canEditMasterData: false,
                canViewMasterNilai: true,
                canEditMasterNilai: false,
                canViewSettings: true,
                canManageAdmins: false,
            },
        });
    };

    const handleAddAdmin = () => {
        if (!form.username.trim()) {
            alert('Username wajib diisi!');
            return;
        }
        if (dataStore.getAdminByUsername(form.username)) {
            alert('Username sudah digunakan!');
            return;
        }
        const password = generatePassword();
        dataStore.addAdmin({
            username: form.username,
            password,
            role: form.role,
            permissions: form.role === 'super_admin'
                ? { canViewMasterData: true, canEditMasterData: true, canViewMasterNilai: true, canEditMasterNilai: true, canViewSettings: true, canManageAdmins: true }
                : form.permissions,
            photoUrl: '',
            status: 'active',
        });
        setGeneratedPassword(password);
        loadData();
        resetForm();
        setShowAddModal(false);
        // Show password alert
        alert(`Admin berhasil ditambah!\n\nUsername: ${form.username}\nPassword: ${password}\n\nSimpan password ini!`);
    };

    const openEditModal = (admin: Admin) => {
        setSelectedAdmin(admin);
        setForm({
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions,
        });
        setShowEditModal(true);
    };

    const handleEditAdmin = () => {
        if (!selectedAdmin || !form.username.trim()) return;
        const existing = dataStore.getAdminByUsername(form.username);
        if (existing && existing.id !== selectedAdmin.id) {
            alert('Username sudah digunakan!');
            return;
        }
        dataStore.updateAdmin(selectedAdmin.id, {
            username: form.username,
            role: form.role,
            permissions: form.role === 'super_admin'
                ? { canViewMasterData: true, canEditMasterData: true, canViewMasterNilai: true, canEditMasterNilai: true, canViewSettings: true, canManageAdmins: true }
                : form.permissions,
        });
        loadData();
        setShowEditModal(false);
        setSelectedAdmin(null);
        resetForm();
    };

    const handleDeleteAdmin = (admin: Admin) => {
        if (admin.id === currentAdmin?.id) {
            alert('Tidak bisa menghapus akun sendiri!');
            return;
        }
        if (confirm(`Yakin hapus admin "${admin.username}"?`)) {
            dataStore.deleteAdmin(admin.id);
            loadData();
        }
    };

    const handleToggleStatus = (admin: Admin) => {
        if (admin.id === currentAdmin?.id) {
            alert('Tidak bisa menonaktifkan akun sendiri!');
            return;
        }
        dataStore.toggleAdminStatus(admin.id);
        loadData();
    };

    const handleResetPassword = (admin: Admin) => {
        setSelectedAdmin(admin);
        const newPassword = dataStore.resetAdminPassword(admin.id);
        if (newPassword) {
            setGeneratedPassword(newPassword);
            setShowPasswordModal(true);
        }
    };

    const getPermissionLevel = (admin: Admin): string => {
        if (admin.role === 'super_admin') return 'Full Access';
        const perms = admin.permissions;
        if (perms.canEditMasterData && perms.canEditMasterNilai) return 'Edit';
        if (perms.canViewMasterData && perms.canViewMasterNilai) return 'Read-Only';
        return 'Limited';
    };

    if (!isSuperAdmin) {
        return (
            <div className="tab-pane">
                <div className="empty-state">
                    <div className="empty-icon">🔒</div>
                    <div className="empty-title">Akses Ditolak</div>
                    <div className="empty-text">Hanya Super Admin yang bisa mengelola admin lain</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            <div className="pane-header">
                <h3 className="section-title">👥 Kelola Admin</h3>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
                    <Plus size={16} /> Tambah Admin
                </button>
            </div>

            {/* Admin Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Permissions</th>
                            <th>Status</th>
                            <th>Dibuat</th>
                            <th style={{ width: '150px' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id} className={admin.id === currentAdmin?.id ? 'highlighted' : ''}>
                                <td>
                                    <div className="admin-cell">
                                        <span className="font-medium">{admin.username}</span>
                                        {admin.id === currentAdmin?.id && <small className="text-muted">(Anda)</small>}
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-badge ${admin.role === 'super_admin' ? 'primary' : 'secondary'}`}>
                                        {admin.role === 'super_admin' ? '👑 Super Admin' : '🔧 Admin'}
                                    </span>
                                </td>
                                <td>
                                    <span className="permission-badge">
                                        {admin.role === 'super_admin' ? <ShieldCheck size={14} /> : <Shield size={14} />}
                                        {getPermissionLevel(admin)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${admin.status}`}>
                                        {admin.status === 'active' ? '🟢 Aktif' : '🔴 Nonaktif'}
                                    </span>
                                </td>
                                <td className="text-muted text-sm">{formatTimestamp(admin.createdAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="icon-btn-sm" title="Edit" onClick={() => openEditModal(admin)}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="icon-btn-sm warning" title="Reset Password" onClick={() => handleResetPassword(admin)}>
                                            <Key size={14} />
                                        </button>
                                        <button
                                            className={`icon-btn-sm ${admin.status === 'active' ? 'danger' : 'success'}`}
                                            title={admin.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                            onClick={() => handleToggleStatus(admin)}
                                            disabled={admin.id === currentAdmin?.id}
                                        >
                                            <Power size={14} />
                                        </button>
                                        <button
                                            className="icon-btn-sm danger"
                                            title="Hapus"
                                            onClick={() => handleDeleteAdmin(admin)}
                                            disabled={admin.id === currentAdmin?.id}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>➕ Tambah Admin Baru</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    placeholder="Masukkan username"
                                />
                            </div>
                            <div className="form-group">
                                <label>Role *</label>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'super_admin' })}>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                            {form.role === 'admin' && (
                                <div className="form-group">
                                    <label>Permissions</label>
                                    <div className="permission-options">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.permissions.canEditMasterData}
                                                onChange={(e) => setForm({ ...form, permissions: { ...form.permissions, canEditMasterData: e.target.checked } })}
                                            />
                                            Edit Master Data
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.permissions.canEditMasterNilai}
                                                onChange={(e) => setForm({ ...form, permissions: { ...form.permissions, canEditMasterNilai: e.target.checked } })}
                                            />
                                            Edit Master Nilai
                                        </label>
                                    </div>
                                </div>
                            )}
                            <div className="form-note">
                                ℹ️ Password akan di-generate otomatis dan ditampilkan setelah submit
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleAddAdmin}>💾 Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedAdmin && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>✏️ Edit Admin</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role *</label>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'super_admin' })}>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                            {form.role === 'admin' && (
                                <div className="form-group">
                                    <label>Permissions</label>
                                    <div className="permission-options">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.permissions.canEditMasterData}
                                                onChange={(e) => setForm({ ...form, permissions: { ...form.permissions, canEditMasterData: e.target.checked } })}
                                            />
                                            Edit Master Data
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={form.permissions.canEditMasterNilai}
                                                onChange={(e) => setForm({ ...form, permissions: { ...form.permissions, canEditMasterNilai: e.target.checked } })}
                                            />
                                            Edit Master Nilai
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleEditAdmin}>💾 Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && selectedAdmin && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🔐 Password Baru</h3>
                            <button className="close-btn" onClick={() => setShowPasswordModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body text-center">
                            <p>Password baru untuk <strong>{selectedAdmin.username}</strong>:</p>
                            <div className="password-display">
                                <code>{generatedPassword}</code>
                            </div>
                            <p className="text-muted text-sm">Salin dan simpan password ini!</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowPasswordModal(false)}>Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabKelolaAdmin;
