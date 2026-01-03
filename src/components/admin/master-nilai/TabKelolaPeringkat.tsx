import React, { useState, useEffect, useMemo } from 'react';
import { Power, Play, Square, RefreshCw, Trophy, AlertTriangle } from 'lucide-react';
import { dataStore, formatTimestamp } from '../../../store/dataStore';
import type { RankingSettings, StudentGrade, Student, Class, Subject, Level, Major, AcademicYear } from '../../../store/dataStore';

const TabKelolaPeringkat: React.FC = () => {
    const [settings, setSettings] = useState<RankingSettings | null>(null);
    const [progress, setProgress] = useState({ validated: 0, total: 0, percentage: 0 });
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [majors, setMajors] = useState<Major[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

    // Cascade Filters
    const [filterTahun, setFilterTahun] = useState('');
    const [filterTingkat, setFilterTingkat] = useState('');
    const [filterJurusan, setFilterJurusan] = useState('');
    const [filterKelas, setFilterKelas] = useState('');

    // Choice Filters
    const [filterSemester, setFilterSemester] = useState<string>('1');
    const [filterMapel, setFilterMapel] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setSettings(dataStore.getRankingSettings());
        setProgress(dataStore.getValidationProgress());
        setStudents(dataStore.getStudents());
        setClasses(dataStore.getClasses());
        setGrades(dataStore.getGrades());
        setSubjects(dataStore.getSubjects());
        setLevels(dataStore.getLevels());
        setMajors(dataStore.getMajors());
        setAcademicYears(dataStore.getAcademicYears());
    };

    // Cascade filter handlers
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

    const handleToggleRanking = () => {
        if (settings?.isEnabled) {
            dataStore.disableRanking();
        } else {
            dataStore.enableRanking();
        }
        loadData();
    };

    const handleToggleValidationEvent = () => {
        if (settings?.validationEventActive) {
            dataStore.endValidationEvent();
        } else {
            dataStore.startValidationEvent();
        }
        loadData();
    };

    // Calculate ranking based on filters
    const calculateRankings = useMemo(() => {
        // Get validated grades that match filters
        let validatedGrades = grades.filter(g => g.status === 'validated');

        // Filter by semester
        if (filterSemester) {
            validatedGrades = validatedGrades.filter(g => g.semester === parseInt(filterSemester));
        }

        // Filter by mapel
        if (filterMapel) {
            validatedGrades = validatedGrades.filter(g => g.subjectId === filterMapel);
        }

        // Filter by class (cascade)
        if (filterKelas) {
            validatedGrades = validatedGrades.filter(g => g.classId === filterKelas);
        } else if (filterJurusan || filterTingkat) {
            const matchingClassIds = filteredClasses.map(c => c.id);
            validatedGrades = validatedGrades.filter(g => matchingClassIds.includes(g.classId));
        }

        // Group grades by student
        const studentAverages: { [key: string]: { student: Student; total: number; count: number } } = {};

        validatedGrades.forEach(grade => {
            const student = students.find(s => s.id === grade.studentId);
            if (!student) return;

            if (!studentAverages[grade.studentId]) {
                studentAverages[grade.studentId] = { student, total: 0, count: 0 };
            }
            studentAverages[grade.studentId].total += grade.value;
            studentAverages[grade.studentId].count++;
        });

        // Calculate averages and sort
        const rankings = Object.values(studentAverages)
            .map(({ student, total, count }) => ({
                student,
                average: count > 0 ? total / count : 0,
            }))
            .sort((a, b) => b.average - a.average)
            .map((item, index) => ({
                rank: index + 1,
                ...item,
            }));

        return rankings;
    }, [grades, students, filterSemester, filterMapel, filterKelas, filterJurusan, filterTingkat, filteredClasses]);

    const getGradeLabel = (avg: number) => {
        if (avg >= 90) return { grade: 'A', color: 'primary' };
        if (avg >= 80) return { grade: 'B', color: 'success' };
        if (avg >= 70) return { grade: 'C', color: 'warning' };
        if (avg >= 60) return { grade: 'D', color: 'danger' };
        return { grade: 'E', color: 'muted' };
    };

    if (!settings) return <div>Loading...</div>;

    return (
        <div className="tab-pane">
            {/* Settings Section */}
            <div className="settings-section">
                <h3 className="section-title">⚙️ Pengaturan Peringkat</h3>

                {/* Toggle Cards */}
                <div className="toggle-cards">
                    {/* Enable/Disable Ranking */}
                    <div className={`toggle-card ${settings.isEnabled ? 'active' : ''}`}>
                        <div className="toggle-info">
                            <div className="toggle-icon">
                                <Trophy size={24} />
                            </div>
                            <div className="toggle-text">
                                <h4>Fitur Peringkat</h4>
                                <p>Izinkan siswa melihat halaman peringkat</p>
                            </div>
                        </div>
                        <button
                            className={`toggle-btn ${settings.isEnabled ? 'on' : 'off'}`}
                            onClick={handleToggleRanking}
                        >
                            <Power size={18} />
                            {settings.isEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* Validation Event */}
                    <div className={`toggle-card ${settings.validationEventActive ? 'active' : ''}`}>
                        <div className="toggle-info">
                            <div className="toggle-icon">
                                <RefreshCw size={24} />
                            </div>
                            <div className="toggle-text">
                                <h4>Event Validasi</h4>
                                <p>Buka event validasi nilai siswa</p>
                            </div>
                        </div>
                        <button
                            className={`toggle-btn ${settings.validationEventActive ? 'on' : 'off'}`}
                            onClick={handleToggleValidationEvent}
                        >
                            {settings.validationEventActive ? <Square size={18} /> : <Play size={18} />}
                            {settings.validationEventActive ? 'STOP' : 'START'}
                        </button>
                    </div>
                </div>

                {/* Validation Progress */}
                {settings.validationEventActive && (
                    <div className="progress-section glass-card">
                        <div className="progress-header">
                            <h4>📊 Progress Validasi</h4>
                            <span className="progress-percentage">{progress.percentage}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                        <div className="progress-stats">
                            <span>✅ {progress.validated} validated</span>
                            <span>📋 {progress.total} total</span>
                            <span>⏳ {progress.total - progress.validated} pending</span>
                        </div>
                        {settings.validationStartDate && (
                            <p className="text-sm text-muted">
                                Dimulai: {formatTimestamp(settings.validationStartDate)}
                            </p>
                        )}
                    </div>
                )}

                {/* Status Info */}
                <div className="status-info glass-card">
                    {!settings.isEnabled ? (
                        <div className="status-warning">
                            <AlertTriangle size={20} />
                            <span>Fitur peringkat dinonaktifkan. Siswa tidak bisa melihat halaman peringkat.</span>
                        </div>
                    ) : settings.validationEventActive && progress.percentage < 100 ? (
                        <div className="status-info-text">
                            <RefreshCw size={20} />
                            <span>Event validasi sedang berjalan. Peringkat akan ditampilkan setelah semua nilai tervalidasi.</span>
                        </div>
                    ) : (
                        <div className="status-success">
                            <Trophy size={20} />
                            <span>Peringkat aktif dan dapat dilihat oleh siswa.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Ranking Preview */}
            <div className="ranking-preview">
                <div className="section-header">
                    <h3 className="section-title">🏆 Preview Peringkat</h3>
                    <button className="btn btn-secondary btn-sm" onClick={loadData}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="filter-bar">
                    <div className="filter-group">
                        {/* Cascade Filters */}
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
                    </div>
                </div>

                {/* Choice Filters (Semester & Mapel) */}
                <div className="choice-filters">
                    <div className="choice-group">
                        <label>Semester:</label>
                        <div className="choice-buttons">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button
                                    key={s}
                                    className={`choice-btn ${filterSemester === String(s) ? 'active' : ''}`}
                                    onClick={() => setFilterSemester(String(s))}
                                >
                                    S{s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="choice-group">
                        <label>Mapel:</label>
                        <div className="choice-buttons">
                            <button
                                className={`choice-btn ${filterMapel === '' ? 'active' : ''}`}
                                onClick={() => setFilterMapel('')}
                            >
                                Semua
                            </button>
                            {subjects.slice(0, 5).map(s => (
                                <button
                                    key={s.id}
                                    className={`choice-btn ${filterMapel === s.id ? 'active' : ''}`}
                                    onClick={() => setFilterMapel(s.id)}
                                >
                                    {s.code}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {calculateRankings.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <div className="empty-title">Belum Ada Data Peringkat</div>
                        <div className="empty-text">
                            Peringkat akan muncul setelah nilai siswa divalidasi
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Top 3 */}
                        <div className="top-3-preview">
                            {calculateRankings.slice(0, 3).map((r, i) => (
                                <div key={r.student.id} className={`top-card rank-${i + 1}`}>
                                    <div className="crown-icon">{['🥇', '🥈', '🥉'][i]}</div>
                                    <div className="rank-number">#{r.rank}</div>
                                    <div className="student-name">{r.student.name}</div>
                                    <div className="student-class">{r.student.className}</div>
                                    <div className="average-score">{r.average.toFixed(2)}</div>
                                    <div className={`grade-badge ${getGradeLabel(r.average).color}`}>
                                        Grade {getGradeLabel(r.average).grade}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Table Preview */}
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>Rank</th>
                                        <th>Nama</th>
                                        <th>Kelas</th>
                                        <th>Rata-rata</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calculateRankings.slice(0, 10).map((r) => {
                                        const gradeInfo = getGradeLabel(r.average);
                                        return (
                                            <tr key={r.student.id}>
                                                <td>
                                                    <span className={`rank-badge ${r.rank <= 3 ? 'top-rank' : ''}`}>
                                                        {r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : `#${r.rank}`}
                                                    </span>
                                                </td>
                                                <td className="font-medium">{r.student.name}</td>
                                                <td>{r.student.className}</td>
                                                <td>
                                                    <span className="score-badge">{r.average.toFixed(2)}</span>
                                                </td>
                                                <td>
                                                    <span className={`grade-badge ${gradeInfo.color}`}>
                                                        {gradeInfo.grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <p className="text-sm text-muted text-center">
                            Menampilkan top 10 dari {calculateRankings.length} siswa
                        </p>
                    </>
                )}
            </div>

            <div className="pane-footer">
                <p className="footer-note">
                    📅 Terakhir diupdate: {formatTimestamp(settings.updatedAt)}
                </p>
            </div>
        </div>
    );
};

export default TabKelolaPeringkat;
