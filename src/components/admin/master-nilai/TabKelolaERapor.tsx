import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Search, Eye, X, RefreshCw, ExternalLink, Edit2, Image } from 'lucide-react';
import { dataStore, formatTimestamp } from '../../../store/dataStore';
import type { StudentGrade, Class, Level, Major, AcademicYear } from '../../../store/dataStore';

type SubSection = 'validasi' | 'tabel';
type ValidasiTab = 'pending' | 'history';

const TabKelolaERapor: React.FC = () => {
    const [subSection, setSubSection] = useState<SubSection>('validasi');
    const [validasiTab, setValidasiTab] = useState<ValidasiTab>('pending');

    // Data
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [majors, setMajors] = useState<Major[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

    // Cascade Filters
    const [filterTahun, setFilterTahun] = useState('');
    const [filterTingkat, setFilterTingkat] = useState('');
    const [filterJurusan, setFilterJurusan] = useState('');
    const [filterKelas, setFilterKelas] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Selection for bulk actions
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modal states
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setGrades(dataStore.getGrades());
        setClasses(dataStore.getClasses());
        setLevels(dataStore.getLevels());
        setMajors(dataStore.getMajors());
        setAcademicYears(dataStore.getAcademicYears());
    };

    // Cascade filter logic
    const handleTingkatChange = (value: string) => {
        setFilterTingkat(value);
        setFilterJurusan('');
        setFilterKelas('');
    };

    const handleJurusanChange = (value: string) => {
        setFilterJurusan(value);
        setFilterKelas('');
    };

    const filteredMajors = useMemo(() => {
        if (!filterTingkat) return majors;
        const majorsInTingkat = new Set(classes.filter(c => c.levelId === filterTingkat).map(c => c.majorId));
        return majors.filter(m => majorsInTingkat.has(m.id));
    }, [filterTingkat, majors, classes]);

    const filteredClasses = useMemo(() => {
        return classes.filter(c => {
            const matchTingkat = !filterTingkat || c.levelId === filterTingkat;
            const matchJurusan = !filterJurusan || c.majorId === filterJurusan;
            return matchTingkat && matchJurusan;
        });
    }, [filterTingkat, filterJurusan, classes]);

    // Filter grades based on sub-section and filters
    const filteredGrades = useMemo(() => {
        let result = grades;

        // Filter by sub-section
        if (subSection === 'validasi') {
            if (validasiTab === 'pending') {
                result = result.filter(g => g.status === 'pending');
            } else {
                result = result.filter(g => g.status !== 'pending');
            }
        } else {
            // Tabel - only validated
            result = result.filter(g => g.status === 'validated');
        }

        // Apply cascade filters
        if (filterKelas) {
            result = result.filter(g => g.classId === filterKelas);
        } else if (filterJurusan || filterTingkat) {
            const matchingClassIds = filteredClasses.map(c => c.id);
            result = result.filter(g => matchingClassIds.includes(g.classId));
        }

        if (filterSemester) {
            result = result.filter(g => g.semester === parseInt(filterSemester));
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(g =>
                g.studentName.toLowerCase().includes(q) ||
                g.studentNis.toLowerCase().includes(q)
            );
        }

        return result;
    }, [grades, subSection, validasiTab, filterKelas, filterJurusan, filterTingkat, filterSemester, searchQuery, filteredClasses]);

    // Stats
    const pendingCount = grades.filter(g => g.status === 'pending').length;
    const validatedCount = grades.filter(g => g.status === 'validated').length;
    const rejectedCount = grades.filter(g => g.status === 'rejected').length;

    // Selection handlers
    const handleSelectAll = () => {
        if (selectedIds.length === filteredGrades.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredGrades.map(g => g.id));
        }
    };

    const handleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Action handlers
    const handleApprove = (id: string) => {
        dataStore.approveGrade(id);
        loadData();
        setSelectedIds(selectedIds.filter(i => i !== id));
    };

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return;
        dataStore.bulkApproveGrades(selectedIds);
        loadData();
        setSelectedIds([]);
    };

    const handleBulkReject = () => {
        if (selectedIds.length === 0 || !rejectNote) return;
        dataStore.bulkRejectGrades(selectedIds, rejectNote);
        loadData();
        setSelectedIds([]);
        setRejectNote('');
        setShowRejectModal(false);
    };

    const openDetail = (grade: StudentGrade) => {
        setSelectedGrade(grade);
        setShowDetailModal(true);
    };

    const openEdit = (grade: StudentGrade) => {
        setSelectedGrade(grade);
        setEditValue(grade.value.toFixed(2));
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (!selectedGrade) return;
        const numValue = parseFloat(editValue);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            alert('Nilai harus antara 0.00 - 100.00');
            return;
        }
        dataStore.updateGrade(selectedGrade.id, { value: numValue });
        loadData();
        setShowEditModal(false);
        setSelectedGrade(null);
    };

    const openPhoto = (url: string) => {
        setPhotoUrl(url);
        setShowPhotoModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="status-badge warning">⏳ Pending</span>;
            case 'validated':
                return <span className="status-badge active">✅ Validated</span>;
            case 'rejected':
                return <span className="status-badge archived">❌ Rejected</span>;
            default:
                return null;
        }
    };

    return (
        <div className="tab-pane">
            {/* Stats Cards */}
            <div className="stat-cards">
                <div className="stat-card" onClick={() => { setSubSection('validasi'); setValidasiTab('pending'); }}>
                    <div className="stat-icon">⏳</div>
                    <div className="stat-value">{pendingCount}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card" onClick={() => setSubSection('tabel')}>
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{validatedCount}</div>
                    <div className="stat-label">Validated</div>
                </div>
                <div className="stat-card" onClick={() => { setSubSection('validasi'); setValidasiTab('history'); }}>
                    <div className="stat-icon">❌</div>
                    <div className="stat-value">{rejectedCount}</div>
                    <div className="stat-label">Rejected</div>
                </div>
            </div>

            {/* Sub-section Tabs */}
            <div className="sub-tabs">
                <button
                    className={`sub-tab ${subSection === 'validasi' ? 'active' : ''}`}
                    onClick={() => setSubSection('validasi')}
                >
                    📋 Validasi Nilai
                </button>
                <button
                    className={`sub-tab ${subSection === 'tabel' ? 'active' : ''}`}
                    onClick={() => setSubSection('tabel')}
                >
                    📊 Tabel Nilai Tervalidasi
                </button>
            </div>

            {/* Validasi Sub-tabs */}
            {subSection === 'validasi' && (
                <div className="mini-tabs">
                    <button
                        className={`mini-tab ${validasiTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setValidasiTab('pending')}
                    >
                        Pending ({pendingCount})
                    </button>
                    <button
                        className={`mini-tab ${validasiTab === 'history' ? 'active' : ''}`}
                        onClick={() => setValidasiTab('history')}
                    >
                        History ({validatedCount + rejectedCount})
                    </button>
                </div>
            )}

            {/* Cascade Filter Bar */}
            <div className="filter-bar">
                <div className="filter-group">
                    <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="filter-select">
                        <option value="">Semua Tahun</option>
                        {academicYears.map(t => (
                            <option key={t.id} value={t.id}>{t.year} {t.semester}</option>
                        ))}
                    </select>
                    <select value={filterTingkat} onChange={(e) => handleTingkatChange(e.target.value)} className="filter-select">
                        <option value="">Semua Tingkat</option>
                        {levels.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                    <select value={filterJurusan} onChange={(e) => handleJurusanChange(e.target.value)} className="filter-select">
                        <option value="">Semua Jurusan</option>
                        {filteredMajors.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    <select value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)} className="filter-select">
                        <option value="">Semua Kelas</option>
                        {filteredClasses.map(k => (
                            <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                    </select>
                    <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="filter-select">
                        <option value="">Semua Semester</option>
                        {[1, 2, 3, 4, 5].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                </div>
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Cari nama/NIS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Bulk Actions (only for pending) */}
            {subSection === 'validasi' && validasiTab === 'pending' && selectedIds.length > 0 && (
                <div className="bulk-actions">
                    <span className="selection-count">{selectedIds.length} dipilih</span>
                    <button className="btn btn-success btn-sm" onClick={handleBulkApprove}>
                        <CheckCircle size={16} /> Approve Semua
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setShowRejectModal(true)}>
                        <XCircle size={16} /> Reject Semua
                    </button>
                </div>
            )}

            {/* Table */}
            {filteredGrades.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <div className="empty-title">
                        {subSection === 'validasi' && validasiTab === 'pending' ? 'Tidak ada nilai pending' : 'Tidak ada data'}
                    </div>
                    <div className="empty-text">
                        {subSection === 'validasi' && validasiTab === 'pending'
                            ? 'Semua nilai sudah divalidasi'
                            : 'Belum ada data nilai yang sesuai filter'}
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {subSection === 'validasi' && validasiTab === 'pending' && (
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredGrades.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                )}
                                <th>Siswa</th>
                                <th>Kelas</th>
                                <th>Mapel</th>
                                <th>Sem</th>
                                <th>Nilai</th>
                                <th>Foto</th>
                                {subSection === 'validasi' && <th>Status</th>}
                                <th>Waktu</th>
                                <th style={{ width: '140px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGrades.map((grade) => (
                                <tr key={grade.id}>
                                    {subSection === 'validasi' && validasiTab === 'pending' && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(grade.id)}
                                                onChange={() => handleSelect(grade.id)}
                                            />
                                        </td>
                                    )}
                                    <td>
                                        <div className="student-info">
                                            <span className="font-medium">{grade.studentName}</span>
                                            <small className="text-muted">{grade.studentNis}</small>
                                        </div>
                                    </td>
                                    <td>{grade.className}</td>
                                    <td>{grade.subjectName}</td>
                                    <td>S{grade.semester}</td>
                                    <td><span className="score-badge">{grade.value.toFixed(2)}</span></td>
                                    <td>
                                        <button
                                            className="icon-btn-sm"
                                            title="Lihat Foto Rapor"
                                            onClick={() => openPhoto(grade.raporPhotoUrl)}
                                        >
                                            <Image size={14} />
                                        </button>
                                    </td>
                                    {subSection === 'validasi' && <td>{getStatusBadge(grade.status)}</td>}
                                    <td className="text-muted text-sm">
                                        {formatTimestamp(grade.submittedAt)}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="icon-btn-sm"
                                                title="Detail"
                                                onClick={() => openDetail(grade)}
                                            >
                                                <Eye size={14} />
                                            </button>
                                            {subSection === 'tabel' && (
                                                <button
                                                    className="icon-btn-sm warning"
                                                    title="Edit Nilai"
                                                    onClick={() => openEdit(grade)}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            )}
                                            {subSection === 'validasi' && validasiTab === 'pending' && (
                                                <>
                                                    <button
                                                        className="icon-btn-sm success"
                                                        title="Approve"
                                                        onClick={() => handleApprove(grade.id)}
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button
                                                        className="icon-btn-sm danger"
                                                        title="Reject"
                                                        onClick={() => {
                                                            setSelectedIds([grade.id]);
                                                            setShowRejectModal(true);
                                                        }}
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="pane-footer">
                <p className="footer-note">📊 Total: {filteredGrades.length} nilai | Format: 0.00-100.00</p>
                <button className="btn btn-secondary btn-sm" onClick={loadData}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>❌ Reject {selectedIds.length} Nilai</h3>
                            <button className="close-btn" onClick={() => setShowRejectModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Alasan Penolakan *</label>
                                <textarea
                                    placeholder="Masukkan alasan penolakan..."
                                    value={rejectNote}
                                    onChange={(e) => setRejectNote(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Batal</button>
                            <button className="btn btn-danger" onClick={handleBulkReject} disabled={!rejectNote}>Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedGrade && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>✏️ Edit Nilai</h3>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Siswa</label>
                                    <p>{selectedGrade.studentName}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Mapel</label>
                                    <p>{selectedGrade.subjectName}</p>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Nilai (0.00 - 100.00) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="85.50"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleSaveEdit}>💾 Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedGrade && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📄 Detail Nilai</h3>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Siswa</label>
                                    <p>{selectedGrade.studentName} ({selectedGrade.studentNis})</p>
                                </div>
                                <div className="detail-item">
                                    <label>Kelas</label>
                                    <p>{selectedGrade.className}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Mata Pelajaran</label>
                                    <p>{selectedGrade.subjectName}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Semester</label>
                                    <p>Semester {selectedGrade.semester}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Nilai</label>
                                    <p className="text-xl font-bold">{selectedGrade.value.toFixed(2)}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Status</label>
                                    {getStatusBadge(selectedGrade.status)}
                                </div>
                                <div className="detail-item full-width">
                                    <label>Foto Rapor</label>
                                    <a href={selectedGrade.raporPhotoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                        <ExternalLink size={14} /> Buka di Google Drive
                                    </a>
                                </div>
                                <div className="detail-item">
                                    <label>Disubmit</label>
                                    <p>{formatTimestamp(selectedGrade.submittedAt)}</p>
                                </div>
                                {selectedGrade.validatedAt && (
                                    <>
                                        <div className="detail-item">
                                            <label>Divalidasi</label>
                                            <p>{formatTimestamp(selectedGrade.validatedAt)}</p>
                                        </div>
                                        <div className="detail-item full-width">
                                            <label>Catatan Validator</label>
                                            <p>{selectedGrade.validatorNote || '-'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowDetailModal(false)}>Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Modal */}
            {showPhotoModal && (
                <div className="modal-overlay" onClick={() => setShowPhotoModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📷 Foto Rapor</h3>
                            <button className="close-btn" onClick={() => setShowPhotoModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'center' }}>
                            <p className="text-muted">Foto rapor disimpan di Google Drive:</p>
                            <a href={photoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                <ExternalLink size={16} /> Buka Link Foto
                            </a>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPhotoModal(false)}>Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabKelolaERapor;
