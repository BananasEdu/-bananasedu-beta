import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, BookOpen, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Subject {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

const TabMapel: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        setIsLoading(true);
        try {
            const url = new URL(API_URL);
            url.searchParams.append('action', 'getSubjects');
            const res = await fetch(url.toString());
            const data = await res.json();
            if (data.success) {
                setSubjects(data.subjects);
            }
        } catch (error) {
            console.error('Failed to load subjects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Stats
    const stats = useMemo(() => ({
        total: subjects.length,
        active: subjects.filter(s => s.isActive).length,
        inactive: subjects.filter(s => !s.isActive).length,
    }), [subjects]);

    // Filtered subjects
    const filteredSubjects = useMemo(() => {
        return subjects.filter(s => {
            const matchActive = filterActive === 'all' ||
                (filterActive === 'active' && s.isActive) ||
                (filterActive === 'inactive' && !s.isActive);
            const matchSearch = !searchQuery ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.code.toLowerCase().includes(searchQuery.toLowerCase());
            return matchActive && matchSearch;
        });
    }, [subjects, filterActive, searchQuery]);

    const handleDelete = async () => {
        if (!selectedSubject) return;
        setIsSaving(true);
        try {
            const token = localStorage.getItem('bananasedu_token');
            const url = new URL(API_URL);
            url.searchParams.append('action', 'deleteSubject');
            await fetch(url.toString(), {
                method: 'POST',
                body: JSON.stringify({ token, id: selectedSubject.id })
            });
            await loadSubjects();
            setShowDeleteConfirm(false);
            setSelectedSubject(null);
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (subject: Subject) => {
        try {
            const token = localStorage.getItem('bananasedu_token');
            const url = new URL(API_URL);
            url.searchParams.append('action', 'updateSubject');
            await fetch(url.toString(), {
                method: 'POST',
                body: JSON.stringify({
                    token,
                    id: subject.id,
                    isActive: !subject.isActive
                })
            });
            await loadSubjects();
        } catch (error) {
            console.error('Toggle failed:', error);
        }
    };

    const openEditModal = (subject: Subject) => {
        setSelectedSubject(subject);
        setShowEditModal(true);
    };

    const openDeleteConfirm = (subject: Subject) => {
        setSelectedSubject(subject);
        setShowDeleteConfirm(true);
    };

    if (isLoading) {
        return (
            <div className="tab-pane">
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Memuat data mata pelajaran...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            {/* Stats Cards */}
            <div className="stat-cards">
                <div className="stat-card" onClick={() => setFilterActive('all')}>
                    <div className="stat-card-icon"><BookOpen size={24} /></div>
                    <div className="stat-card-info">
                        <p className="stat-card-label">Total</p>
                        <h3 className="stat-card-value">{stats.total}</h3>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setFilterActive('active')}>
                    <div className="stat-card-icon" style={{ color: '#22c55e' }}>✓</div>
                    <div className="stat-card-info">
                        <p className="stat-card-label">Aktif</p>
                        <h3 className="stat-card-value">{stats.active}</h3>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setFilterActive('inactive')}>
                    <div className="stat-card-icon" style={{ color: '#ef4444' }}>✗</div>
                    <div className="stat-card-info">
                        <p className="stat-card-label">Non-Aktif</p>
                        <h3 className="stat-card-value">{stats.inactive}</h3>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="pane-header">
                <div className="filter-group">
                    <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                        className="filter-select"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Non-Aktif</option>
                    </select>
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Cari mapel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> Tambah Mapel
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Nama Mapel</th>
                            <th>Kode</th>
                            <th>Status</th>
                            <th style={{ width: '120px' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubjects.map((subject, idx) => (
                            <tr key={subject.id}>
                                <td>{idx + 1}</td>
                                <td className="font-medium">{subject.name}</td>
                                <td><code className="code-badge">{subject.code}</code></td>
                                <td>
                                    <button
                                        className={`toggle-btn ${subject.isActive ? 'active' : ''}`}
                                        onClick={() => handleToggleActive(subject)}
                                        title={subject.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                    >
                                        {subject.isActive ? (
                                            <><ToggleRight size={20} /> Aktif</>
                                        ) : (
                                            <><ToggleLeft size={20} /> Off</>
                                        )}
                                    </button>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="icon-btn-sm"
                                            title="Edit"
                                            onClick={() => openEditModal(subject)}
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            className="icon-btn-sm danger"
                                            title="Hapus"
                                            onClick={() => openDeleteConfirm(subject)}
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

            <div className="pane-footer">
                <p className="footer-note">📚 Total: {filteredSubjects.length} mata pelajaran (sync ke Google Sheets)</p>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <ModalTambahMapel
                    onClose={() => setShowAddModal(false)}
                    onAdd={() => {
                        loadSubjects();
                        setShowAddModal(false);
                    }}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && selectedSubject && (
                <ModalEditMapel
                    subject={selectedSubject}
                    onClose={() => { setShowEditModal(false); setSelectedSubject(null); }}
                    onSave={() => {
                        loadSubjects();
                        setShowEditModal(false);
                        setSelectedSubject(null);
                    }}
                />
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && selectedSubject && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🗑️ Hapus Mapel?</h3>
                            <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Yakin ingin menghapus mata pelajaran:</p>
                            <p><strong>{selectedSubject.name}</strong> ({selectedSubject.code})?</p>
                            <p className="warning-text">⚠️ Data akan dihapus dari Google Sheets!</p>
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
        </div>
    );
};

// Modal: Tambah Mapel
const ModalTambahMapel: React.FC<{
    onClose: () => void;
    onAdd: () => void;
}> = ({ onClose, onAdd }) => {
    const [form, setForm] = useState({ name: '', code: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!form.name || !form.code) return;
        setIsSaving(true);
        try {
            const token = localStorage.getItem('bananasedu_token');
            const url = new URL(API_URL);
            url.searchParams.append('action', 'addSubject');
            await fetch(url.toString(), {
                method: 'POST',
                body: JSON.stringify({ token, name: form.name, code: form.code })
            });
            onAdd();
        } catch (error) {
            console.error('Add failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>➕ Tambah Mata Pelajaran</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Nama Mapel *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Contoh: Matematika"
                        />
                    </div>
                    <div className="form-group">
                        <label>Kode *</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            placeholder="Contoh: MTK"
                            style={{ maxWidth: '150px' }}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Batal</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!form.name || !form.code || isSaving}
                    >
                        {isSaving ? <Loader2 className="spinner" size={16} /> : '💾 Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal: Edit Mapel
const ModalEditMapel: React.FC<{
    subject: Subject;
    onClose: () => void;
    onSave: () => void;
}> = ({ subject, onClose, onSave }) => {
    const [form, setForm] = useState({ name: subject.name, code: subject.code });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('bananasedu_token');
            const url = new URL(API_URL);
            url.searchParams.append('action', 'updateSubject');
            await fetch(url.toString(), {
                method: 'POST',
                body: JSON.stringify({ token, id: subject.id, name: form.name, code: form.code })
            });
            onSave();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Edit Mata Pelajaran</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Nama Mapel</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Kode</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            style={{ maxWidth: '150px' }}
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Batal</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="spinner" size={16} /> : '💾 Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TabMapel;
