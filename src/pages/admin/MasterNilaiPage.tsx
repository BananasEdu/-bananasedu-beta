import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Edit, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { gasApi, type GasUserData, type GasGradeData } from '../../lib/adminApi';
import '../../styles/AdminStyles.css';

const MasterNilaiPage: React.FC = () => {
    const [users, setUsers] = useState<GasUserData[]>([]);
    const [grades, setGrades] = useState<(GasGradeData & { studentName?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [filterStudent, setFilterStudent] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<(GasGradeData & { studentName?: string }) | null>(null);
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

            const usersMap = new Map<string, string>();
            if (usersRes.success && usersRes.users) {
                setUsers(usersRes.users);
                usersRes.users.forEach(u => usersMap.set(u.id, u.fullName));
            }

            if (gradesRes.success && gradesRes.grades) {
                setGrades(gradesRes.grades.map(g => ({
                    ...g,
                    studentName: usersMap.get(g.userId || '') || 'Unknown'
                })));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique subjects for filter
    const subjects = useMemo(() => {
        const subs = new Set(grades.map(g => g.subject).filter(Boolean));
        return Array.from(subs);
    }, [grades]);

    // Filtered grades
    const filteredGrades = useMemo(() => {
        return grades.filter(g => {
            const matchStudent = !filterStudent || g.userId === filterStudent;
            const matchSubject = !filterSubject || g.subject === filterSubject;
            const matchSemester = !filterSemester || g.semester === filterSemester;
            const matchSearch = !searchQuery ||
                g.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.subject?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchStudent && matchSubject && matchSemester && matchSearch;
        });
    }, [grades, filterStudent, filterSubject, filterSemester, searchQuery]);

    const handleDelete = async () => {
        if (!selectedGrade?.id) return;
        setIsSaving(true);
        try {
            const result = await gasApi.deleteGrade(selectedGrade.id);
            if (result.success) {
                await loadData();
                setShowDeleteConfirm(false);
                setSelectedGrade(null);
            } else {
                alert(result.error || 'Gagal menghapus');
            }
        } catch (err) {
            alert('Terjadi kesalahan');
        } finally {
            setIsSaving(false);
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
            <div className="master-nilai-page">
                <div className="loading-state">
                    <Loader2 className="spinner" size={40} />
                    <p>Memuat data nilai...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="master-nilai-page">
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
        <div className="master-nilai-page">
            <div className="page-header">
                <h1 className="page-title">📝 Master Nilai</h1>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> Tambah Nilai
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-group">
                    <select
                        value={filterStudent}
                        onChange={(e) => setFilterStudent(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Siswa</option>
                        {users.filter(u => u.role !== 'admin').map(user => (
                            <option key={user.id} value={user.id}>{user.fullName}</option>
                        ))}
                    </select>

                    <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Mapel</option>
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>

                    <select
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                    </select>
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Cari siswa atau mapel..."
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
                            <th>Nama Siswa</th>
                            <th>Semester</th>
                            <th>Mata Pelajaran</th>
                            <th>Nilai</th>
                            <th>Tanggal Input</th>
                            <th style={{ width: '100px' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGrades.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center text-muted">
                                    Tidak ada data nilai
                                </td>
                            </tr>
                        ) : (
                            filteredGrades.map((grade, idx) => (
                                <tr key={grade.id}>
                                    <td>{idx + 1}</td>
                                    <td className="font-medium">{grade.studentName}</td>
                                    <td>Semester {grade.semester}</td>
                                    <td>{grade.subject}</td>
                                    <td><span className="grade-badge">{grade.grade}</span></td>
                                    <td className="text-muted">{formatDate(grade.createdAt)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="icon-btn-sm"
                                                title="Edit"
                                                onClick={() => { setSelectedGrade(grade); setShowEditModal(true); }}
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                className="icon-btn-sm danger"
                                                title="Hapus"
                                                onClick={() => { setSelectedGrade(grade); setShowDeleteConfirm(true); }}
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
                <p className="footer-note">📊 Total: {filteredGrades.length} nilai</p>
                <button className="btn btn-secondary btn-sm" onClick={loadData}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedGrade && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🗑️ Hapus Nilai?</h3>
                            <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Yakin ingin menghapus nilai:</p>
                            <p><strong>{selectedGrade.studentName}</strong> - {selectedGrade.subject} ({selectedGrade.grade})</p>
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

            {/* Add Modal */}
            {showAddModal && (
                <ModalTambahNilai
                    users={users}
                    onClose={() => setShowAddModal(false)}
                    onSave={() => { loadData(); setShowAddModal(false); }}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && selectedGrade && (
                <ModalEditNilai
                    grade={selectedGrade}
                    onClose={() => { setShowEditModal(false); setSelectedGrade(null); }}
                    onSave={() => { loadData(); setShowEditModal(false); setSelectedGrade(null); }}
                />
            )}
        </div>
    );
};

// Modal: Tambah Nilai
const ModalTambahNilai: React.FC<{
    users: GasUserData[];
    onClose: () => void;
    onSave: () => void;
}> = ({ users, onClose, onSave }) => {
    const [form, setForm] = useState({
        userId: '',
        semester: '1',
        subject: '',
        grade: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!form.userId || !form.subject || !form.grade) return;
        setIsSaving(true);
        try {
            const result = await gasApi.saveGrades(form.userId, [{
                semester: form.semester,
                subject: form.subject,
                grade: parseFloat(form.grade)
            }]);
            if (result.success) {
                onSave();
            } else {
                alert(result.error || 'Gagal menyimpan');
            }
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
                        <label>Siswa *</label>
                        <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
                            <option value="">-- Pilih Siswa --</option>
                            {users.filter(u => u.role !== 'admin').map(user => (
                                <option key={user.id} value={user.id}>{user.fullName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Semester *</label>
                        <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Mata Pelajaran *</label>
                        <input
                            type="text"
                            placeholder="Contoh: Matematika"
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nilai (0-100) *</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="85"
                            value={form.grade}
                            onChange={e => setForm({ ...form, grade: e.target.value })}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Batal</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!form.userId || !form.subject || !form.grade || isSaving}
                    >
                        {isSaving ? <Loader2 className="spinner" size={16} /> : '💾 Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal: Edit Nilai
const ModalEditNilai: React.FC<{
    grade: GasGradeData & { studentName?: string };
    onClose: () => void;
    onSave: () => void;
}> = ({ grade, onClose, onSave }) => {
    const [form, setForm] = useState({
        semester: grade.semester || '1',
        subject: grade.subject || '',
        grade: grade.grade?.toString() || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!grade.id || !form.subject || !form.grade) return;
        setIsSaving(true);
        try {
            const result = await gasApi.updateGrade(grade.id, {
                semester: form.semester,
                subject: form.subject,
                grade: parseFloat(form.grade)
            });
            if (result.success) {
                onSave();
            } else {
                alert(result.error || 'Gagal mengupdate');
            }
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
                    <h3>✏️ Edit Nilai - {grade.studentName}</h3>
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
                        <label>Mata Pelajaran *</label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nilai (0-100) *</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.grade}
                            onChange={e => setForm({ ...form, grade: e.target.value })}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Batal</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!form.subject || !form.grade || isSaving}
                    >
                        {isSaving ? <Loader2 className="spinner" size={16} /> : '💾 Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MasterNilaiPage;
