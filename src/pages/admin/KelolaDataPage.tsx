import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Trash2, Eye, X, Loader2, ChevronLeft, Plus } from 'lucide-react';
import { gasApi, type GasUserData, type GasGradeData } from '../../lib/adminApi';
import '../../styles/AdminStyles.css';

type ViewMode = 'list' | 'detail';

const KelolaDataPage: React.FC = () => {
    const [users, setUsers] = useState<GasUserData[]>([]);
    const [grades, setGrades] = useState<GasGradeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // View mode
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedUser, setSelectedUser] = useState<GasUserData | null>(null);

    // Filter states
    const [filterRole, setFilterRole] = useState('');
    const [filterSchool, setFilterSchool] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterMajor, setFilterMajor] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [showAddGradeModal, setShowAddGradeModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [usersRes, gradesRes] = await Promise.all([
                gasApi.getAllUsers(),
                gasApi.getAllGrades()
            ]);
            if (usersRes.success && usersRes.users) setUsers(usersRes.users);
            if (gradesRes.success && gradesRes.grades) setGrades(gradesRes.grades);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique values for filters
    const uniqueSchools = useMemo(() => [...new Set(users.map(u => u.schoolName).filter(Boolean))], [users]);
    const uniqueLevels = useMemo(() => [...new Set(users.map(u => u.classLevel).filter(Boolean))], [users]);
    const uniqueMajors = useMemo(() => [...new Set(users.map(u => u.major).filter(Boolean))], [users]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchRole = !filterRole || u.role === filterRole;
            const matchSchool = !filterSchool || u.schoolName === filterSchool;
            const matchLevel = !filterLevel || u.classLevel === filterLevel;
            const matchMajor = !filterMajor || u.major === filterMajor;
            const matchSearch = !searchQuery ||
                u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.username?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchRole && matchSchool && matchLevel && matchMajor && matchSearch;
        });
    }, [users, filterRole, filterSchool, filterLevel, filterMajor, searchQuery]);

    // Get grades for selected user
    const userGrades = useMemo(() => {
        if (!selectedUser) return [];
        return grades.filter(g => g.userId === selectedUser.id);
    }, [grades, selectedUser]);

    const handleViewDetail = (user: GasUserData) => {
        setSelectedUser(user);
        setViewMode('detail');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedUser(null);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setIsSaving(true);
        try {
            const result = await gasApi.deleteUser(selectedUser.id);
            if (result.success) {
                await loadData();
                setShowDeleteConfirm(false);
                handleBackToList();
            } else {
                alert(result.error || 'Gagal menghapus');
            }
        } catch (err) {
            alert('Terjadi kesalahan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteGrade = async (gradeId: string) => {
        if (!confirm('Yakin hapus nilai ini?')) return;
        try {
            const result = await gasApi.deleteGrade(gradeId);
            if (result.success) await loadData();
            else alert(result.error || 'Gagal menghapus');
        } catch (err) {
            alert('Terjadi kesalahan');
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch {
            return '-';
        }
    };

    if (isLoading) {
        return (
            <div className="kelola-data-page">
                <div className="loading-state">
                    <Loader2 className="spinner" size={40} />
                    <p>Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="kelola-data-page">
                <div className="error-state">
                    <p>⚠️ {error}</p>
                    <button className="btn btn-primary" onClick={loadData}>
                        <RefreshCw size={16} /> Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    // Detail View
    if (viewMode === 'detail' && selectedUser) {
        return (
            <div className="kelola-data-page">
                <div className="page-header">
                    <button className="btn btn-secondary" onClick={handleBackToList}>
                        <ChevronLeft size={16} /> Kembali
                    </button>
                    <div className="header-actions">

                        <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                            <Trash2 size={16} /> Hapus
                        </button>
                    </div>
                </div>

                <div className="detail-grid">
                    {/* User Info Card */}
                    <div className="detail-card user-card">
                        <h2 className="card-title">👤 Data Akun</h2>
                        <div className="info-list">
                            <div className="info-item"><span className="label">Username</span><span className="value">@{selectedUser.username}</span></div>
                            <div className="info-item"><span className="label">Nama Lengkap</span><span className="value">{selectedUser.fullName}</span></div>
                            <div className="info-item"><span className="label">Sekolah</span><span className="value">{selectedUser.schoolLevel} - {selectedUser.schoolName}</span></div>
                            <div className="info-item"><span className="label">Kelas</span><span className="value">Kelas {selectedUser.classLevel} - {selectedUser.className}</span></div>
                            {selectedUser.major && <div className="info-item"><span className="label">Jurusan</span><span className="value">{selectedUser.major}</span></div>}
                            <div className="info-item"><span className="label">Role</span><span className="value">{selectedUser.role === 'admin' ? '👑 Admin' : '📚 Siswa'}</span></div>
                            <div className="info-item"><span className="label">Terdaftar</span><span className="value">{formatDate(selectedUser.createdAt)}</span></div>
                        </div>
                    </div>

                    {/* Grades Card */}
                    <div className="detail-card grades-card">
                        <div className="card-header">
                            <h2 className="card-title">📝 Data Nilai</h2>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowAddGradeModal(true)}>
                                <Plus size={14} /> Tambah
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="admin-table compact">
                                <thead>
                                    <tr>
                                        <th>Semester</th>
                                        <th>Mapel</th>
                                        <th>Nilai</th>
                                        <th>Tanggal</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userGrades.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center text-muted">Belum ada data nilai</td></tr>
                                    ) : (
                                        userGrades.map(grade => (
                                            <tr key={grade.id}>
                                                <td>Semester {grade.semester}</td>
                                                <td>{grade.subject}</td>
                                                <td><span className="grade-badge">{grade.grade}</span></td>
                                                <td className="text-muted">{formatDate(grade.createdAt)}</td>
                                                <td>
                                                    <button className="icon-btn-sm danger" onClick={() => handleDeleteGrade(grade.id!)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Delete User Modal */}
                {showDeleteConfirm && (
                    <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                        <div className="modal-content small" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>🗑️ Hapus Akun?</h3>
                                <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-body">
                                <p>Yakin ingin menghapus akun <strong>{selectedUser.fullName}</strong>?</p>
                                <p className="text-muted">Semua data nilai juga akan terhapus.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Batal</button>
                                <button className="btn btn-danger" onClick={handleDeleteUser} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="spinner" size={16} /> : 'Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Grade Modal */}
                {showAddGradeModal && (
                    <ModalTambahNilai
                        userId={selectedUser.id}
                        onClose={() => setShowAddGradeModal(false)}
                        onSave={() => { loadData(); setShowAddGradeModal(false); }}
                    />
                )}
            </div>
        );
    }

    // List View
    return (
        <div className="kelola-data-page">
            <div className="page-header">
                <h1 className="page-title">📚 Kelola Data</h1>
                <button className="btn btn-secondary btn-sm" onClick={loadData}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-group">
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="filter-select">
                        <option value="">Semua Role</option>
                        <option value="student">Siswa</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)} className="filter-select">
                        <option value="">Semua Sekolah</option>
                        {uniqueSchools.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="filter-select">
                        <option value="">Semua Tingkat</option>
                        {uniqueLevels.map(l => <option key={l} value={l}>Kelas {l}</option>)}
                    </select>
                    <select value={filterMajor} onChange={e => setFilterMajor(e.target.value)} className="filter-select">
                        <option value="">Semua Jurusan</option>
                        {uniqueMajors.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Cari nama atau username..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </div>

            {/* Table */}
            <div className="table-container scrollable">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Nama Lengkap</th>
                            <th>Username</th>
                            <th>Nama Sekolah</th>
                            <th>Status</th>
                            <th>Tingkat</th>
                            <th>Jurusan</th>
                            <th>Kelas</th>
                            <th>Role</th>
                            <th>Password</th>
                            <th>Terdaftar</th>
                            <th style={{ width: '80px' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan={12} className="text-center text-muted">Tidak ada data</td></tr>
                        ) : (
                            filteredUsers.map((user, idx) => (
                                <tr key={user.id}>
                                    <td>{idx + 1}</td>
                                    <td><button className="link-btn" onClick={() => handleViewDetail(user)}>{user.fullName}</button></td>
                                    <td><button className="link-btn" onClick={() => handleViewDetail(user)}>@{user.username}</button></td>
                                    <td>{user.schoolName}</td>
                                    <td><span className={`status-badge ${user.schoolStatus?.toLowerCase()}`}>{user.schoolStatus || '-'}</span></td>
                                    <td>Kelas {user.classLevel}</td>
                                    <td>{user.major || '-'}</td>
                                    <td>{user.className}</td>
                                    <td><span className={`role-badge ${user.role}`}>{user.role === 'admin' ? '👑' : '📚'} {user.role}</span></td>
                                    <td className="text-muted">{user.password}</td>
                                    <td className="text-muted">{formatDate(user.createdAt)}</td>
                                    <td>
                                        <button className="icon-btn-sm" onClick={() => handleViewDetail(user)} title="Lihat Detail">
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pane-footer">
                <p className="footer-note">📊 Total: {filteredUsers.length} akun</p>
            </div>
        </div>
    );
};

// Modal: Tambah Nilai
const ModalTambahNilai: React.FC<{
    userId: string;
    onClose: () => void;
    onSave: () => void;
}> = ({ userId, onClose, onSave }) => {
    const [form, setForm] = useState({ semester: '1', subject: '', grade: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!form.subject || !form.grade) return;
        setIsSaving(true);
        try {
            const result = await gasApi.saveGrades(userId, [{
                semester: form.semester,
                subject: form.subject,
                grade: parseFloat(form.grade)
            }]);
            if (result.success) onSave();
            else alert(result.error || 'Gagal menyimpan');
        } catch (err) {
            alert('Terjadi kesalahan');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>➕ Tambah Nilai</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Semester</label>
                        <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Mata Pelajaran</label>
                        <input type="text" placeholder="Matematika" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Nilai (0-100)</label>
                        <input type="number" min="0" max="100" placeholder="85" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Batal</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.subject || !form.grade || isSaving}>
                        {isSaving ? <Loader2 className="spinner" size={16} /> : '💾 Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KelolaDataPage;
