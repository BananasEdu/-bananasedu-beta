import React, { useState, useEffect, useMemo } from 'react';
import { Download, FileText, FileSpreadsheet, Trophy, GraduationCap, RefreshCw } from 'lucide-react';
import { dataStore } from '../../../store/dataStore';
import type { StudentGrade, Student, Class, Level, Major, AcademicYear } from '../../../store/dataStore';

type ReportType = 'nilai' | 'peringkat' | 'sertifikat';

const TabLaporan: React.FC = () => {
    const [reportType, setReportType] = useState<ReportType>('nilai');
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [majors, setMajors] = useState<Major[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

    // Cascade Filters
    const [filterTahun, setFilterTahun] = useState('');
    const [filterTingkat, setFilterTingkat] = useState('');
    const [filterJurusan, setFilterJurusan] = useState('');
    const [filterKelas, setFilterKelas] = useState('');
    const [filterSemester, setFilterSemester] = useState('1');
    const [filterSiswa, setFilterSiswa] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setGrades(dataStore.getGrades());
        setStudents(dataStore.getStudents());
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

    // Get filtered grades for report
    const filteredGrades = useMemo(() => {
        let result = grades.filter(g => g.status === 'validated');
        if (filterKelas) {
            result = result.filter(g => g.classId === filterKelas);
        } else if (filterJurusan || filterTingkat) {
            const matchingClassIds = filteredClasses.map(c => c.id);
            result = result.filter(g => matchingClassIds.includes(g.classId));
        }
        if (filterSemester) {
            result = result.filter(g => g.semester === parseInt(filterSemester));
        }
        return result;
    }, [grades, filterKelas, filterJurusan, filterTingkat, filterSemester, filteredClasses]);

    // Calculate rankings
    const rankings = useMemo(() => {
        const studentAverages: { [key: string]: { student: Student; total: number; count: number } } = {};
        filteredGrades.forEach(grade => {
            const student = students.find(s => s.id === grade.studentId);
            if (!student) return;
            if (!studentAverages[grade.studentId]) {
                studentAverages[grade.studentId] = { student, total: 0, count: 0 };
            }
            studentAverages[grade.studentId].total += grade.value;
            studentAverages[grade.studentId].count++;
        });
        return Object.values(studentAverages)
            .map(({ student, total, count }) => ({
                student,
                average: count > 0 ? total / count : 0,
            }))
            .sort((a, b) => b.average - a.average)
            .map((item, index) => ({ rank: index + 1, ...item }));
    }, [filteredGrades, students]);

    const handleExportExcel = () => {
        // Generate CSV for Excel
        let csv = '';
        if (reportType === 'nilai') {
            csv = 'No,Nama,NIS,Kelas,Mapel,Semester,Nilai\n';
            filteredGrades.forEach((g, i) => {
                csv += `${i + 1},"${g.studentName}","${g.studentNis}","${g.className}","${g.subjectName}",${g.semester},${g.value.toFixed(2)}\n`;
            });
        } else {
            csv = 'Rank,Nama,NIS,Kelas,Rata-rata\n';
            rankings.forEach(r => {
                csv += `${r.rank},"${r.student.name}","${r.student.nis}","${r.student.className}",${r.average.toFixed(2)}\n`;
            });
        }
        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `laporan_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleExportPDF = () => {
        if (!filterSiswa) {
            alert('Pilih siswa untuk membuat sertifikat!');
            return;
        }
        const student = students.find(s => s.id === filterSiswa);
        const ranking = rankings.find(r => r.student.id === filterSiswa);
        if (!student || !ranking) {
            alert('Data siswa tidak ditemukan!');
            return;
        }
        // Open a new window with printable certificate
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sertifikat Peringkat - ${student.name}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; text-align: center; padding: 40px; background: linear-gradient(135deg, #ffecd2, #fcb69f); }
                    .certificate { background: white; padding: 60px; border: 4px double #333; max-width: 800px; margin: 0 auto; }
                    h1 { color: #1a365d; font-size: 32px; margin-bottom: 10px; }
                    h2 { color: #2d3748; font-size: 24px; margin: 20px 0; }
                    .name { font-size: 36px; font-weight: bold; color: #2b6cb0; margin: 30px 0; }
                    .rank { font-size: 72px; font-weight: bold; color: #d69e2e; }
                    .details { font-size: 18px; color: #4a5568; margin: 20px 0; }
                    .footer { margin-top: 60px; font-size: 14px; color: #718096; }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <h1>🏆 SERTIFIKAT PERINGKAT</h1>
                    <h2>Diberikan kepada:</h2>
                    <div class="name">${student.name}</div>
                    <div class="details">NIS: ${student.nis} | Kelas: ${student.className}</div>
                    <p>Yang telah meraih peringkat:</p>
                    <div class="rank">#${ranking.rank}</div>
                    <div class="details">Dengan rata-rata nilai: <strong>${ranking.average.toFixed(2)}</strong></div>
                    <div class="footer">
                        <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                        <p>BananasEdu - Sistem Akademik</p>
                    </div>
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `;
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(content);
            win.document.close();
        }
    };

    return (
        <div className="tab-pane">
            <div className="pane-header">
                <h3 className="section-title">📊 Laporan</h3>
                <button className="btn btn-secondary btn-sm" onClick={loadData}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Report Type Selector */}
            <div className="report-type-selector">
                <button
                    className={`report-type-btn ${reportType === 'nilai' ? 'active' : ''}`}
                    onClick={() => setReportType('nilai')}
                >
                    <FileSpreadsheet size={20} />
                    <span>Rekap Nilai</span>
                    <small>Export Excel</small>
                </button>
                <button
                    className={`report-type-btn ${reportType === 'peringkat' ? 'active' : ''}`}
                    onClick={() => setReportType('peringkat')}
                >
                    <Trophy size={20} />
                    <span>Rekap Peringkat</span>
                    <small>Export Excel</small>
                </button>
                <button
                    className={`report-type-btn ${reportType === 'sertifikat' ? 'active' : ''}`}
                    onClick={() => setReportType('sertifikat')}
                >
                    <GraduationCap size={20} />
                    <span>Sertifikat Siswa</span>
                    <small>Export PDF</small>
                </button>
            </div>

            {/* Cascade Filters */}
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
                        {[1, 2, 3, 4, 5].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sertifikat: Student Selector */}
            {reportType === 'sertifikat' && (
                <div className="student-selector glass-card">
                    <label>Pilih Siswa untuk Sertifikat:</label>
                    <select value={filterSiswa} onChange={(e) => setFilterSiswa(e.target.value)}>
                        <option value="">-- Pilih Siswa --</option>
                        {rankings.map(r => (
                            <option key={r.student.id} value={r.student.id}>
                                #{r.rank} - {r.student.name} ({r.average.toFixed(2)})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Preview */}
            <div className="report-preview glass-card">
                <h4>📋 Preview Data</h4>
                {reportType === 'nilai' ? (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama</th>
                                    <th>NIS</th>
                                    <th>Kelas</th>
                                    <th>Mapel</th>
                                    <th>Sem</th>
                                    <th>Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGrades.slice(0, 10).map((g, i) => (
                                    <tr key={g.id}>
                                        <td>{i + 1}</td>
                                        <td>{g.studentName}</td>
                                        <td>{g.studentNis}</td>
                                        <td>{g.className}</td>
                                        <td>{g.subjectName}</td>
                                        <td>S{g.semester}</td>
                                        <td>{g.value.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredGrades.length > 10 && <p className="text-muted text-sm">... dan {filteredGrades.length - 10} data lainnya</p>}
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Nama</th>
                                    <th>NIS</th>
                                    <th>Kelas</th>
                                    <th>Rata-rata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankings.slice(0, 10).map(r => (
                                    <tr key={r.student.id} className={r.student.id === filterSiswa ? 'highlighted' : ''}>
                                        <td>#{r.rank}</td>
                                        <td>{r.student.name}</td>
                                        <td>{r.student.nis}</td>
                                        <td>{r.student.className}</td>
                                        <td>{r.average.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {rankings.length > 10 && <p className="text-muted text-sm">... dan {rankings.length - 10} data lainnya</p>}
                    </div>
                )}
            </div>

            {/* Export Buttons */}
            <div className="pane-footer">
                <p className="footer-note">
                    📊 Total: {reportType === 'nilai' ? filteredGrades.length : rankings.length} data
                </p>
                {reportType === 'sertifikat' ? (
                    <button className="btn btn-primary" onClick={handleExportPDF} disabled={!filterSiswa}>
                        <FileText size={16} /> Export PDF
                    </button>
                ) : (
                    <button className="btn btn-success" onClick={handleExportExcel}>
                        <Download size={16} /> Export Excel (CSV)
                    </button>
                )}
            </div>
        </div>
    );
};

export default TabLaporan;
