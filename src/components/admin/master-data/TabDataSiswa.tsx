import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2, Search, RefreshCw, X, Loader2, UserCog } from 'lucide-react';
import { gasApi, type GasUserData } from '../../../lib/adminApi';

const TabDataSiswa: React.FC = () => {
    const [users, setUsers] = useState<GasUserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [filterRole, setFilterRole] = useState('');
    const [filterSchool, setFilterSchool] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<GasUserData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load data on mount
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await gasApi.getAllUsers();
            if (result.success && result.users) {
                setUsers(result.users);
            } else {
                setError(result.error || 'Gagal memuat data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique school levels for filter
    const schoolLevels = useMemo(() => {
        const levels = new Set(users.map(u => u.schoolLevel).filter(Boolean));
        return Array.from(levels);
    }, [users]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchRole = !filterRole || u.role === filterRole;
            const matchSchool = !filterSchool || u.schoolLevel === filterSchool;
            const matchSearch = !searchQuery ||
                u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchRole && matchSchool && matchSearch;
        });
    }, [users, filterRole, filterSchool, searchQuery]);

    // Students only (exclude admin)
    const studentCount = users.filter(u => u.role !== 'admin').length;

    const handleDelete = async () => {
        if (!selectedUser) return;
        setIsSaving(true);
        try {
            const result = await gasApi.deleteUser(selectedUser.id);
            if (result.success) {
                await loadUsers();
                setShowDeleteConfirm(false);
                setSelectedUser(null);
            } else {
                alert(result.error || 'Gagal menghapus user');
            }
        } catch (err) {
            alert('Terjadi kesalahan saat menghapus');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return '-';
        }
    };

    if (isLoading) {
        return (
            <div className="tab-pane">
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Memuat data akun...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tab-pane">
                <div className="error-state">
                    <p>⚠️ {error}</p>
                    <button className="btn btn-primary" onClick={loadUsers}>
                        <RefreshCw size={16} /> Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            {/* Header */}
            <div className="pane-header">
                <div className="header-left">
                    <h3><UserCog size={20} /> Kelola Akun ({studentCount} Siswa, {users.filter(u => u.role === 'admin').length} Admin)</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-group">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Role</option>
                        <option value="student">Siswa</option>
                        <option value="admin">Admin</option>
                    </select>

                    <select
                        value={filterSchool}
                        onChange={(e) => setFilterSchool(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Jenjang</option>
                        {schoolLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Cari nama atau sekolah..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Nama Lengkap</th>
                            <th>Jenjang</th>
                            <th>Sekolah</th>
                            <th>Kelas</th>
                            <th>Role</th>
                            <th>Terdaftar</th>
                            <th style={{ width: '100px' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-muted">
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, idx) => (
                                <tr key={user.id}>
                                    <td>{idx + 1}</td>
                                    <td className="font-medium">{user.fullName}</td>
                                    <td>{user.schoolLevel || '-'}</td>
                                    <td>{user.schoolName || '-'}</td>
                                    <td>{user.className || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${user.role === 'admin' ? 'active' : 'pending'}`}>
                                            {user.role === 'admin' ? '👑 Admin' : '👤 Siswa'}
                                        </span>
                                    </td>
                                    <td className="text-muted text-sm">{formatDate(user.createdAt)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="icon-btn-sm"
                                                title="Edit"
                                                onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                className="icon-btn-sm danger"
                                                title="Hapus"
                                                onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }}
                                                disabled={user.role === 'admin'}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pane-footer">
                <p className="footer-note">👥 Total: {filteredUsers.length} akun (dari Google Sheets)</p>
                <button className="btn btn-secondary btn-sm" onClick={loadUsers}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🗑️ Hapus Akun?</h3>
                            <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Yakin ingin menghapus akun:</p>
                            <p><strong>{selectedUser.fullName}</strong></p>
                            <p className="warning-text">⚠️ Data akan dihapus permanen dari Google Sheets!</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                Batal
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={isSaving}>
                                {isSaving ? <Loader2 className="spinner" size={16} /> : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <ModalEditUser
                    user={selectedUser}
                    onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
                    onSave={() => {
                        loadUsers();
                        setShowEditModal(false);
                        setSelectedUser(null);
                    }}
                />
            )}
        </div>
    );
};

// Edit User Modal Component
const ModalEditUser: React.FC<{
    user: GasUserData;
    onClose: () => void;
    onSave: () => void;
}> = ({ user, onClose, onSave }) => {
    const [form, setForm] = useState({
        fullName: user.fullName,
        schoolLevel: user.schoolLevel,
        schoolName: user.schoolName,
        classLevel: user.classLevel,
        major: user.major,
        className: user.className,
        role: user.role,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const result = await gasApi.updateUser(user.id, form);
            if (result.success) {
                onSave();
            } else {
                alert(result.error || 'Gagal mengupdate user');
            }
        } catch (err) {
            alert('Terjadi kesalahan saat update');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Edit Akun</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Nama Lengkap *</label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Jenjang Sekolah</label>
                            <select
                                value={form.schoolLevel}
                                onChange={(e) => setForm({ ...form, schoolLevel: e.target.value })}
                            >
                                <option value="SD">SD</option>
                                <option value="SMP">SMP</option>
                                <option value="SMA">SMA</option>
                                <option value="SMK">SMK</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nama Sekolah</label>
                            <input
                                type="text"
                                value={form.schoolName}
                                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tingkat Kelas</label>
                            <input
                                type="text"
                                value={form.classLevel}
                                onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
                                placeholder="10, 11, 12..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Jurusan</label>
                            <input
                                type="text"
                                value={form.major}
                                onChange={(e) => setForm({ ...form, major: e.target.value })}
                                placeholder="IPA, IPS..."
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Nama Kelas</label>
                        <input
                            type="text"
                            value={form.className}
                            onChange={(e) => setForm({ ...form, className: e.target.value })}
                            placeholder="X IPA 1, XII IPS 2..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="student">Siswa</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Batal</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!form.fullName || isSaving}
                    >
                        {isSaving ? <Loader2 className="spinner" size={16} /> : '💾 Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TabDataSiswa;
