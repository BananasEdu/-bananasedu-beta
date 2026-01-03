import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calculator, Target, FileText, Eye, X, Plus, Trash2, Edit2, Check, Save, Lock, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import './ERaporPage.css';

const API_URL = import.meta.env.VITE_API_URL;

// Grade System with colors
const gradeSystem = [
    { min: 95, max: 100, grade: 'A+', category: 'Istimewa', color: '#3b82f6', textColor: '#ffffff' },
    { min: 90, max: 94.99, grade: 'A', category: 'Istimewa', color: '#2dd4bf', textColor: '#000000' },
    { min: 85, max: 89.99, grade: 'B+', category: 'Baik', color: '#22c55e', textColor: '#ffffff' },
    { min: 80, max: 84.99, grade: 'B', category: 'Baik', color: '#84cc16', textColor: '#000000' },
    { min: 75, max: 79.99, grade: 'C+', category: 'Memadai', color: '#fde047', textColor: '#000000' },
    { min: 70, max: 74.99, grade: 'C', category: 'Memadai', color: '#f59e0b', textColor: '#ffffff' },
    { min: 65, max: 69.99, grade: 'D+', category: 'Kurang', color: '#ea580c', textColor: '#ffffff' },
    { min: 60, max: 64.99, grade: 'D', category: 'Kurang', color: '#ef4444', textColor: '#ffffff' },
    { min: 0, max: 59.99, grade: 'E', category: 'Sangat Kurang', color: '#7c3aed', textColor: '#ffffff' },
];

function getGradeInfo(value: number | null) {
    if (value === null) return null;
    return gradeSystem.find(g => value >= g.min && value <= g.max) || gradeSystem[gradeSystem.length - 1];
}

// Subject interface for Beta
interface BetaSubject {
    id: string;
    name: string;
    sem1: number | null;
    sem2: number | null;
    sem3: number | null;
    sem4: number | null;
    sem5: number | null;
}

// Calculate average for a subject
function getSubjectAvg(subject: BetaSubject, semesters: number[] = [1, 2, 3, 4, 5]): number {
    const values: number[] = [];
    semesters.forEach(sem => {
        const val = subject[`sem${sem}` as keyof BetaSubject] as number | null;
        if (val !== null) values.push(val);
    });
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

// Count-up animation hook
function useCountUp(end: number, duration = 1500) {
    const [count, setCount] = useState(0);
    const prevEnd = useRef(end);

    useEffect(() => {
        // Only animate if end value changed
        if (end === prevEnd.current && count !== 0) return;
        prevEnd.current = end;

        const startValue = count;
        const start = performance.now();
        const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(startValue + (end - startValue) * easeOut);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
}

// Struk-specific counting hook - smooth BisadanEdu style animation
// Isolated component for separate rendering cycle (Higher Performance)
const StrukCounter = ({ value, duration = 6000, className, style }: { value: number, duration?: number, className?: string, style?: React.CSSProperties }) => {
    const [count, setCount] = useState(0);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const start = performance.now();
        const end = value;

        const animate = (now: number) => {
            const elapsed = now - start;
            // User Request: "0.01 per 0.6 ms" => 1 unit per 60 ms
            const calculated = elapsed / 60;

            const nextValue = Math.min(calculated, end);
            setCount(nextValue);

            if (nextValue < end) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [value, duration]);

    return <span className={className} style={style}>{count.toFixed(2)}</span>;
};

// Fire confetti celebration - BisadanEdu style (from corners with vibrant colors)
function fireConfetti() {
    const count = 150;
    const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#f97316', '#22c55e', '#fbbf24'];

    // Left corner burst
    confetti({
        particleCount: count,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
        zIndex: 20000,
        startVelocity: 45,
        gravity: 0.8,
        scalar: 1.2,
    });

    // Right corner burst
    confetti({
        particleCount: count,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
        zIndex: 20000,
        startVelocity: 45,
        gravity: 0.8,
        scalar: 1.2,
    });

    // Second wave after 200ms
    setTimeout(() => {
        confetti({
            particleCount: 80,
            angle: 90,
            spread: 100,
            origin: { x: 0.5, y: 0.5 },
            colors: colors,
            zIndex: 20000,
            startVelocity: 35,
            gravity: 1,
        });
    }, 200);
}

type ViewMode = 'nilai' | 'flexi' | 'target';
type StrukTheme = 'light' | 'dark';

const LOCAL_STORAGE_KEY = 'bananasedu_beta_grades';
const SEMESTER_PREF_KEY = 'bananasedu_beta_sem_pref';

// Default subjects for new users - kosong agar siswa bisa tambah sendiri
const defaultSubjects: BetaSubject[] = [];

export default function ERaporPage() {
    const { user } = useAuth();

    // Data state
    const [subjects, setSubjects] = useState<BetaSubject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(true);


    // View states
    const [viewMode, setViewMode] = useState<ViewMode>('nilai');
    const [showStrukModal, setShowStrukModal] = useState(false);
    const [strukTheme, setStrukTheme] = useState<StrukTheme>('dark');
    const [strukZoom, setStrukZoom] = useState(100);

    // Subject management
    const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
    const [editingSubjectName, setEditingSubjectName] = useState('');

    // Flexi-Calc states

    const [targetAverage, setTargetAverage] = useState(90);

    // Get visible semesters based on class level
    const visibleSemesters = (() => {
        if (!user?.classLevel) return [1, 2, 3, 4, 5];
        const level = parseInt(user.classLevel);

        // Kelas 7 & 10: Sem 1-2
        if ([7, 10].includes(level)) return [1, 2];

        // Kelas 8 & 11: Sem 1-4
        if ([8, 11].includes(level)) return [1, 2, 3, 4];

        // Kelas 9 & 12: Sem 1-5 (default)
        return [1, 2, 3, 4, 5];
    })();

    // Active semesters state (initialized from localStorage or default visibleSemesters)
    const [activeSemesters, setActiveSemesters] = useState<number[]>(() => {
        const saved = localStorage.getItem(SEMESTER_PREF_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return visibleSemesters;
            }
        }
        return visibleSemesters;
    });

    // Update localStorage when activeSemesters change
    useEffect(() => {
        localStorage.setItem(SEMESTER_PREF_KEY, JSON.stringify(activeSemesters));
    }, [activeSemesters]);

    // Handle manual semester toggle
    const toggleSemesterActive = (sem: number) => {
        setActiveSemesters(prev => {
            if (prev.includes(sem)) {
                return prev.filter(s => s !== sem);
            } else {
                return [...prev, sem].sort((a, b) => a - b);
            }
        });
    };



    // Sync to server
    const syncToServer = async (data: BetaSubject[]) => {
        if (!user?.id || !API_URL) return;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'saveStudentGrades',
                    userId: user.id,
                    subjects: data
                })
            });

            const result = await response.json();
            if (!result.success) {
                console.error(result.error || 'Gagal sync ke server');
            }
        } catch (err) {
            console.error('Gagal terhubung ke server');
        }
    };

    // Load from server
    const loadFromServer = async () => {
        if (!user?.id || !API_URL) return null;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'getStudentGrades',
                    userId: user.id
                })
            });

            const result = await response.json();
            if (result.success && result.subjects) {
                return result.subjects;
            }
        } catch (err) {
            console.error('Failed to load from server:', err);
        }
        return null;
    };

    // Load from server first, fallback to localStorage
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            // Try server first
            const serverData = await loadFromServer();
            if (serverData && serverData.length > 0) {
                setSubjects(serverData);
                // Also update localStorage as cache
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData));
            } else {
                // Fallback to localStorage
                const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedData) {
                    try {
                        const parsed = JSON.parse(savedData);
                        setSubjects(parsed);
                    } catch (e) {
                        setSubjects(defaultSubjects);
                    }
                } else {
                    setSubjects(defaultSubjects);
                }
            }

            setIsLoading(false);
        };

        loadData();
    }, [user?.id]);

    // Save to localStorage and sync to server
    const saveToLocalStorage = (data: BetaSubject[]) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        syncToServer(data);
        setIsSaved(true);
    };

    // Update grade directly
    const updateGrade = (subjectId: string, semester: number, value: number | null) => {
        setSubjects(prev => {
            const updated = prev.map(s =>
                s.id === subjectId
                    ? { ...s, [`sem${semester}`]: value }
                    : s
            );
            saveToLocalStorage(updated);
            return updated;
        });
        setIsSaved(false);
    };

    // Add new subject
    const addSubject = () => {
        if (!newSubjectName.trim()) return;
        const newSubject: BetaSubject = {
            id: Date.now().toString(),
            name: newSubjectName.trim(),
            sem1: null, sem2: null, sem3: null, sem4: null, sem5: null
        };
        setSubjects(prev => {
            const updated = [...prev, newSubject];
            saveToLocalStorage(updated);
            return updated;
        });
        setNewSubjectName('');
        setShowAddSubjectModal(false);
    };

    // Delete subject
    const deleteSubject = (id: string) => {
        if (!confirm('Yakin ingin menghapus mata pelajaran ini?')) return;
        setSubjects(prev => {
            const updated = prev.filter(s => s.id !== id);
            saveToLocalStorage(updated);
            return updated;
        });
    };

    // Rename subject
    const startEditSubject = (id: string, currentName: string) => {
        setEditingSubjectId(id);
        setEditingSubjectName(currentName);
    };

    const saveEditSubject = () => {
        if (!editingSubjectName.trim() || !editingSubjectId) return;
        setSubjects(prev => {
            const updated = prev.map(s =>
                s.id === editingSubjectId
                    ? { ...s, name: editingSubjectName.trim() }
                    : s
            );
            saveToLocalStorage(updated);
            return updated;
        });
        setEditingSubjectId(null);
        setEditingSubjectName('');
    };

    // Calculate overall average based on SEMESTER averages (User Request)
    const semesterAverages = [1, 2, 3, 4, 5].map(sem => {
        const key = `sem${sem}` as keyof BetaSubject;
        const validGrades = subjects
            .map(s => s[key])
            .filter((v): v is number => v !== null);

        if (validGrades.length === 0) return null;
        return validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
    }).filter((avg): avg is number => avg !== null);

    const totalAverage = semesterAverages.length > 0
        ? semesterAverages.reduce((a, b) => a + b, 0) / semesterAverages.length
        : 0;
    const animatedAverage = useCountUp(totalAverage);
    const overallGrade = getGradeInfo(totalAverage);

    // Flexi-Calc calculations




    // Target Booster calculations - Auto-detect last filled semester
    const detectFilledSemesters = (): number[] => {
        const filled: number[] = [];
        [1, 2, 3, 4, 5].forEach(sem => {
            const semKey = `sem${sem}` as keyof BetaSubject;
            const hasData = subjects.some(s => s[semKey] !== null && (s[semKey] as number) > 0);
            if (hasData) filled.push(sem);
        });
        return filled;
    };

    const filledSemesters = detectFilledSemesters();
    const lastFilledSemester = filledSemesters.length > 0 ? Math.max(...filledSemesters) : 0;
    const nextSemester = lastFilledSemester < 5 ? lastFilledSemester + 1 : null;
    const semestersCompleted = filledSemesters.length;
    const totalSemesters = nextSemester ? semestersCompleted + 1 : semestersCompleted;

    // Current average from filled semesters only
    const currentAvgFilled = subjects.length > 0 && filledSemesters.length > 0
        ? subjects.reduce((acc, s) => acc + getSubjectAvg(s, filledSemesters), 0) / subjects.length
        : 0;

    // Required average for next semester
    const requiredNextSemAvg = nextSemester && semestersCompleted > 0
        ? ((targetAverage * totalSemesters) - (currentAvgFilled * semestersCompleted)) / 1
        : 0;

    // Toggle functions




    // Open struk modal with effects
    const openStrukModal = useCallback(() => {
        setShowStrukModal(true);
        // Fire confetti after a brief delay
        setTimeout(() => {
            fireConfetti();
        }, 300);
    }, []);

    // Struk component
    const renderStruk = () => {
        const strukGrade = getGradeInfo(totalAverage);

        // Calculate dynamic semester range
        const activeSems = [1, 2, 3, 4, 5].filter(s =>
            subjects.some(sub => sub[`sem${s}` as keyof BetaSubject] !== null)
        );
        const minSem = activeSems.length > 0 ? Math.min(...activeSems) : 1;
        const maxSem = activeSems.length > 0 ? Math.max(...activeSems) : 1;
        const semRange = minSem === maxSem ? `Semester ${minSem}` : `Semester ${minSem} - ${maxSem}`;
        const shortSemRange = minSem === maxSem ? `S${minSem}` : `S${minSem}-S${maxSem}`;

        return (
            <div className={`struk-card struk-${strukTheme}`}>
                <div className="struk-header">
                    <span className="struk-logo">🍌</span>
                    <h2>BANANASEDU BETA</h2>
                    <p>HASIL RAPOR</p>
                </div>
                <div className="struk-divider"></div>
                <div className="struk-average">
                    <span className="avg-label">RATA-RATA RAPOR</span>
                    <StrukCounter value={totalAverage} duration={6000} className="avg-value counting-value" style={{ color: strukGrade?.color }} />
                    <span className="avg-grade">({strukGrade?.category}) - Grade {strukGrade?.grade}</span>
                    <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{semRange}</span>
                </div>
                <div className="struk-divider"></div>

                {/* Tabel Rata-rata Per Semester */}
                <div className="struk-semester-list" style={{ padding: '4px 0' }}>
                    <div className="subjects-header" style={{ gridTemplateColumns: '1fr 80px 60px' }}>
                        <span>SEMESTER</span>
                        <span style={{ textAlign: 'center' }}>RATA-RATA</span>
                        <span style={{ textAlign: 'center' }}>GRADE</span>
                    </div>
                    {[1, 2, 3, 4, 5].map(sem => {
                        const semKey = `sem${sem}` as keyof BetaSubject;
                        const validVals = subjects.map(s => s[semKey]).filter((v): v is number => v !== null);
                        if (validVals.length === 0) return null;
                        const semAvg = validVals.reduce((a, b) => a + b, 0) / validVals.length;
                        const info = getGradeInfo(semAvg);

                        return (
                            <div key={sem} className="subject-row" style={{ gridTemplateColumns: '1fr 80px 60px' }}>
                                <span className="subject-name">Semester {sem}</span>
                                <span className="subject-avg" style={{ alignItems: 'center', textAlign: 'center' }}>
                                    <div className="val">{semAvg.toFixed(2)}</div>
                                    <div className="cat">({info?.category})</div>
                                </span>
                                <span className="subject-grade" style={{ color: info?.color, textAlign: 'center' }}>{info?.grade}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="struk-divider"></div>
                {/* Tabel Mapel - dipindahkan ke atas */}
                <div className="struk-subjects">
                    <div className="subjects-header" style={{ gridTemplateColumns: '1fr 80px 60px' }}>
                        <span>MATA PELAJARAN</span>
                        <span style={{ textAlign: 'center' }}>RATA-RATA</span>
                        <span style={{ textAlign: 'center' }}>GRADE</span>
                    </div>
                    {subjects.map(subject => {
                        const avg = getSubjectAvg(subject);
                        const info = getGradeInfo(avg);
                        return (
                            <div key={subject.id} className="subject-row" style={{ gridTemplateColumns: '1fr 80px 60px' }}>
                                <span className="subject-name">{subject.name}</span>
                                <span className="subject-avg" style={{ alignItems: 'center', textAlign: 'center' }}>
                                    <div className="val">{avg.toFixed(2)}</div>
                                    <div className="cat">({info?.category})</div>
                                </span>
                                <span className="subject-grade" style={{ color: info?.color, textAlign: 'center' }}>{info?.grade}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="struk-divider"></div>
                {/* Info User - dipindahkan ke bawah */}
                <div className="struk-info">
                    <div className="info-row"><span>Nama</span><span>{user?.fullName || '-'}</span></div>
                    <div className="info-row"><span>ID</span><span>{user?.id ? String(user.id).substring(0, 10) : '-'}</span></div>
                    <div className="info-row"><span>Sekolah</span><span>{user?.schoolName || '-'}</span></div>
                    <div className="info-row"><span>Kelas</span><span>{user?.className || '-'}</span></div>
                    <div className="info-row"><span>Semester</span><span>{shortSemRange}</span></div>
                </div>
                <div className="struk-divider"></div>
                <div className="struk-footer"><p>SEMOGA DITERIMA DI PTN IMPIAN! 🎓</p></div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="erapor-page">
                <main className="erapor-main">
                    <div className="container">
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Memuat data nilai...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="erapor-page">
            {/* Add Subject Modal */}
            {showAddSubjectModal && (
                <div className="modal-overlay" onClick={() => setShowAddSubjectModal(false)}>
                    <div className="modal-card add-subject-modal" onClick={e => e.stopPropagation()}>
                        <h3>➕ Tambah Mata Pelajaran</h3>
                        <input
                            type="text"
                            placeholder="Nama mata pelajaran..."
                            value={newSubjectName}
                            onChange={e => setNewSubjectName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addSubject()}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowAddSubjectModal(false)}>
                                Batal
                            </button>
                            <button className="btn-primary" onClick={addSubject} disabled={!newSubjectName.trim()}>
                                <Plus size={16} /> Tambah
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Struk Modal */}
            {showStrukModal && (
                <div className="modal-overlay" onClick={() => setShowStrukModal(false)}>
                    <div className="struk-modal-wrapper" onClick={e => e.stopPropagation()}>
                        <div className="struk-modal-header">
                            <div className="struk-controls">
                                <div className="theme-selector">
                                    <button className={`theme-option ${strukTheme === 'light' ? 'active' : ''}`} onClick={() => setStrukTheme('light')}>☀️ Light</button>
                                    <button className={`theme-option ${strukTheme === 'dark' ? 'active' : ''}`} onClick={() => setStrukTheme('dark')}>🌙 Dark</button>
                                </div>
                                <div className="zoom-controls">
                                    <button className="zoom-btn" onClick={() => setStrukZoom(Math.max(50, strukZoom - 10))}>➖</button>
                                    <span className="zoom-value">{strukZoom}%</span>
                                    <button className="zoom-btn" onClick={() => setStrukZoom(Math.min(150, strukZoom + 10))}>➕</button>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowStrukModal(false)}><X size={20} /></button>
                        </div>
                        <div className="struk-modal-content">
                            <div style={{ transform: `scale(${strukZoom / 100})`, transformOrigin: 'top center' }}>
                                {renderStruk()}
                            </div>
                        </div>
                        <div className="struk-actions">
                            <button className="action-btn">💾 Simpan PNG</button>
                            <button className="action-btn">📤 Share</button>
                        </div>
                    </div>
                </div>
            )}

            <main className="erapor-main">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header">
                        <div className="page-title-section">
                            <h1 className="page-title">📝 E-Rapor Digital</h1>
                        </div>
                        <div className="view-tabs">
                            <button className={`view-tab ${viewMode === 'nilai' ? 'active' : ''}`} onClick={() => setViewMode('nilai')}>
                                <FileText size={16} /> Nilai
                            </button>
                            <button className={`view-tab ${viewMode === 'flexi' ? 'active' : ''}`} onClick={() => setViewMode('flexi')}>
                                <Calculator size={16} /> Flexi-Calc
                            </button>
                            <button className={`view-tab ${viewMode === 'target' ? 'active' : ''}`} onClick={() => setViewMode('target')}>
                                <Target size={16} /> Target
                            </button>
                        </div>
                    </div>

                    {/* === TAB NILAI === */}
                    {viewMode === 'nilai' && (
                        <div className="nilai-container">
                            <div className="nilai-header-row">
                                <div className="summary-cards">
                                    <div className="summary-card"><span className="summary-icon">📚</span><span className="summary-value">{subjects.length}</span><span className="summary-label">Mata Pelajaran</span></div>
                                    <div className="summary-card highlight"><span className="summary-icon">📊</span><span className="summary-value">{totalAverage > 0 ? animatedAverage.toFixed(2) : '-.-'}</span><span className="summary-label">Rata-rata {totalAverage > 0 ? `(${overallGrade?.category})` : ''}</span></div>
                                    <div className="summary-card"><span className="summary-icon">🏆</span><span className="summary-value" style={{ color: overallGrade?.color }}>{totalAverage > 0 ? overallGrade?.grade : '-'}</span><span className="summary-label">Grade</span></div>
                                </div>
                                <div className="header-actions">
                                    <button className="add-mapel-btn" onClick={() => setShowAddSubjectModal(true)}>
                                        <Plus size={16} /> Tambah Mapel
                                    </button>
                                    <button className="lihat-struk-btn" onClick={openStrukModal}>
                                        <Eye size={16} /> Lihat Struk
                                    </button>
                                </div>
                            </div>

                            {/* Save indicator */}
                            <div className={`save-indicator ${isSaved ? 'saved' : 'unsaved'}`}>
                                <Save size={14} />
                                <span>{isSaved ? 'Tersimpan otomatis' : 'Menyimpan...'}</span>
                            </div>

                            {/* Grade Legend */}
                            <div className="grade-legend">
                                <span className="legend-title">🎨 Legenda:</span>
                                <div className="legend-items">
                                    {gradeSystem.map(g => (
                                        <div key={g.grade} className="legend-item">
                                            <span className="legend-color" style={{ backgroundColor: g.color }}></span>
                                            <span className="legend-label">{g.grade} ({g.min}-{g.max})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Grade Table - Editable */}
                            {/* Info Formula Card */}
                            <div className="formula-info-card" style={{ marginBottom: '20px', padding: '16px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ color: '#60a5fa', flexShrink: 0, marginTop: '2px' }}><Info size={20} /></div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#bfdbfe' }}>ℹ️ Info Rumus Perhitungan</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#dbeafe', lineHeight: '1.5' }}>
                                        Rata-rata Akhir = <strong>(Jumlah Rata-rata Semester) ÷ (Jumlah Semester)</strong>.
                                        <br />
                                        <span style={{ opacity: 0.7, fontSize: '12px' }}>Rumus ini memastikan nilai akhir diambil dari performa tiap semester secara merata.</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grade-table-wrapper">
                                <table className="grade-table editable">
                                    <thead>
                                        <tr>
                                            <th className="th-mapel">Mata Pelajaran</th>
                                            {[1, 2, 3, 4, 5].map(sem => (
                                                <th
                                                    key={sem}
                                                    className={`th-semester-toggle ${activeSemesters.includes(sem) ? 'active' : 'inactive'}`}
                                                    onClick={() => toggleSemesterActive(sem)}
                                                    title={`Klik untuk ${activeSemesters.includes(sem) ? 'menonaktifkan' : 'mengaktifkan'} Semester ${sem}`}
                                                >
                                                    S{sem} {activeSemesters.includes(sem) ? '' : '🔒'}
                                                </th>
                                            ))}
                                            <th className="th-avg">Rata-rata</th>
                                            <th className="th-grade">Grade</th>
                                            <th className="th-actions">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjects.map(subject => {
                                            const avg = getSubjectAvg(subject);
                                            const info = getGradeInfo(avg);
                                            const isEditing = editingSubjectId === subject.id;

                                            return (
                                                <tr key={subject.id}>
                                                    <td className="td-mapel">
                                                        {isEditing ? (
                                                            <div className="edit-name-field">
                                                                <input
                                                                    type="text"
                                                                    value={editingSubjectName}
                                                                    onChange={e => setEditingSubjectName(e.target.value)}
                                                                    onKeyDown={e => e.key === 'Enter' && saveEditSubject()}
                                                                    autoFocus
                                                                />
                                                                <button className="save-name-btn" onClick={saveEditSubject}>
                                                                    <Check size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span>{subject.name}</span>
                                                        )}
                                                    </td>
                                                    {[1, 2, 3, 4, 5].map(sem => {
                                                        const value = subject[`sem${sem}` as keyof BetaSubject] as number | null;
                                                        const cellInfo = getGradeInfo(value);
                                                        const isVisible = activeSemesters.includes(sem);

                                                        return (
                                                            <td key={sem} className={`td-semester ${!isVisible ? 'disabled-cell' : ''}`}>
                                                                {isVisible ? (
                                                                    <input
                                                                        type="number"
                                                                        className="grade-input"
                                                                        value={value ?? ''}
                                                                        onChange={e => {
                                                                            const val = e.target.value === '' ? null : Math.min(100, Math.max(0, parseInt(e.target.value, 10)));
                                                                            updateGrade(subject.id, sem, val);
                                                                        }}
                                                                        min={0}
                                                                        max={100}
                                                                        placeholder="-"
                                                                        style={{
                                                                            backgroundColor: value !== null ? cellInfo?.color : undefined,
                                                                            color: value !== null ? cellInfo?.textColor : undefined
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="disabled-lock-icon">
                                                                        <Lock size={14} className="opacity-30" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="td-avg">
                                                        <span className="avg-value">{avg.toFixed(2)}</span>
                                                        <span className="avg-category">({info?.category})</span>
                                                    </td>
                                                    <td className="td-grade">
                                                        <span className="grade-badge" style={{ backgroundColor: info?.color, color: info?.textColor }}>{info?.grade}</span>
                                                    </td>
                                                    <td className="td-actions">
                                                        <button
                                                            className="action-icon-btn edit"
                                                            onClick={() => startEditSubject(subject.id, subject.name)}
                                                            title="Edit nama"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            className="action-icon-btn delete"
                                                            onClick={() => deleteSubject(subject.id)}
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td className="tf-label">RATA-RATA KESELURUHAN</td>
                                            {[1, 2, 3, 4, 5].map(sem => {
                                                const isVisible = activeSemesters.includes(sem);
                                                // Calculate average for this semester
                                                const validValues = subjects
                                                    .map(s => s[`sem${sem}` as keyof BetaSubject] as number | null)
                                                    .filter((v): v is number => v !== null);

                                                const avg = validValues.length > 0
                                                    ? validValues.reduce((a, b) => a + b, 0) / validValues.length
                                                    : 0;

                                                const info = getGradeInfo(avg);

                                                return (
                                                    <td key={sem} className={!isVisible ? 'disabled-cell' : ''} style={{ textAlign: 'center', verticalAlign: 'middle', padding: '10px 4px' }}>
                                                        {isVisible && validValues.length > 0 ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                                                <span style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>{avg.toFixed(2)}</span>
                                                                <span style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.2', fontWeight: 500 }}>({info?.category})</span>
                                                            </div>
                                                        ) : (isVisible ? '-' : (
                                                            <div className="disabled-lock-icon">
                                                                <Lock size={14} className="opacity-30" />
                                                            </div>
                                                        ))}
                                                    </td>
                                                );
                                            })}
                                            <td className="tf-avg">
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                                    <span className="avg-value total" style={{ fontSize: '24px', fontWeight: 800 }}>{totalAverage.toFixed(2)}</span>
                                                    <span style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>({overallGrade?.category})</span>
                                                </div>
                                            </td>
                                            <td className="tf-grade">
                                                <span className="grade-badge" style={{ backgroundColor: overallGrade?.color, color: overallGrade?.textColor }}>{overallGrade?.grade}</span>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Empty state for no subjects */}
                            {subjects.length === 0 && (
                                <div className="empty-subjects-state">
                                    <p>Belum ada mata pelajaran. Klik "Tambah Mapel" untuk memulai.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === TAB FLEXI-CALC (LOCKED) === */}
                    {viewMode === 'flexi' && (
                        <div className="flexi-container">
                            <div className="section-card locked-feature">
                                <div className="locked-icon">🔒</div>
                                <h2 className="locked-title">Fitur Tidak Tersedia</h2>
                                <p className="locked-desc">
                                    Flexi-Calc tidak tersedia untuk versi beta.<br />
                                    Fitur ini akan hadir di versi lengkap BananasEdu.
                                </p>
                                <button className="btn-secondary" onClick={() => setViewMode('nilai')}>
                                    ← Kembali ke Tab Nilai
                                </button>
                            </div>
                        </div>
                    )}

                    {/* === TAB TARGET BOOSTER === */}
                    {viewMode === 'target' && (
                        <div className="target-container">
                            <div className="section-card">
                                <h2 className="section-title">🎯 Target Booster</h2>
                                <p className="section-desc">
                                    {nextSemester
                                        ? `Hitung nilai S${nextSemester} yang dibutuhkan untuk mencapai target`
                                        : 'Semua semester sudah terisi! Kamu bisa melihat rata-rata akhirmu.'}
                                </p>

                                <div className="target-current">
                                    <div className="target-info-box">
                                        <span className="label">Rata-rata {filledSemesters.length > 0 ? `S${filledSemesters.join('-S')}` : 'Saat ini'}</span>
                                        <span className="value">{currentAvgFilled.toFixed(2)}</span>
                                    </div>
                                    <div className="target-info-box">
                                        <span className="label">Semester Terisi</span>
                                        <span className="value">{filledSemesters.length > 0 ? filledSemesters.map(s => `S${s}`).join(', ') : '-'}</span>
                                    </div>
                                    <div className="target-info-box">
                                        <span className="label">Semester Berikutnya</span>
                                        <span className="value">{nextSemester ? `S${nextSemester}` : '✅ Selesai'}</span>
                                    </div>
                                    <div className="target-info-box">
                                        <span className="label">Jumlah Mapel</span>
                                        <span className="value">{subjects.length}</span>
                                    </div>
                                </div>

                                {nextSemester ? (
                                    <>
                                        <div className="target-input-section">
                                            <label>🎯 Target Rata-rata Akhir</label>
                                            <input
                                                type="number"
                                                value={targetAverage}
                                                onChange={e => setTargetAverage(Number(e.target.value))}
                                                min={0}
                                                max={100}
                                                step={0.5}
                                            />
                                        </div>

                                        <div className="target-result">
                                            <h3>📈 Hasil Simulasi</h3>
                                            <p>Untuk mencapai rata-rata <strong>{targetAverage.toFixed(2)}</strong> setelah S{nextSemester}, kamu perlu:</p>
                                            <div className={`required-avg ${requiredNextSemAvg > 100 ? 'impossible' : requiredNextSemAvg > 95 ? 'hard' : 'achievable'}`}>
                                                <span className="label">Rata-rata S{nextSemester} Minimal</span>
                                                <span className="value">{requiredNextSemAvg > 100 ? '❌ Tidak Mungkin' : requiredNextSemAvg.toFixed(2)}</span>
                                            </div>
                                            {requiredNextSemAvg <= 100 && (
                                                <p className={`feedback ${requiredNextSemAvg > 95 ? 'warning' : 'success'}`}>
                                                    {requiredNextSemAvg > 95 ? '⚠️ Target cukup tinggi! Kamu perlu usaha ekstra.' : '✅ Target realistis! Kamu bisa mencapainya.'}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="target-result">
                                        <h3>🎉 Semua Semester Selesai!</h3>
                                        <p>Rata-rata akhir kamu adalah <strong style={{ color: overallGrade?.color }}>{totalAverage.toFixed(2)}</strong> (Grade {overallGrade?.grade})</p>
                                        <p className="feedback success">Semoga diterima di PTN impianmu! 🎓</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main >

        </div >
    );
}
