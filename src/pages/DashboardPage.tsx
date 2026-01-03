import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

// Interface matching E-Rapor
interface BetaSubject {
    id: string;
    name: string;
    sem1: number | null;
    sem2: number | null;
    sem3: number | null;
    sem4: number | null;
    sem5: number | null;
}

const LOCAL_STORAGE_KEY = 'bananasedu_beta_grades';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State for E-Rapor data
    const [subjects, setSubjects] = useState<BetaSubject[]>([]);
    const [averageScore, setAverageScore] = useState(0);
    const [filledSemesters, setFilledSemesters] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Load data from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setSubjects(parsed);

                // Calculate stats
                const allScores: number[] = [];
                const semesterHasValue = [false, false, false, false, false];

                parsed.forEach((sub: BetaSubject) => {
                    [sub.sem1, sub.sem2, sub.sem3, sub.sem4, sub.sem5].forEach((val, idx) => {
                        if (val !== null && val > 0) {
                            allScores.push(val);
                            semesterHasValue[idx] = true;
                        }
                    });
                });

                if (allScores.length > 0) {
                    const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
                    setAverageScore(parseFloat(avg.toFixed(2)));
                }

                setFilledSemesters(semesterHasValue.filter(Boolean).length);
            }
        } catch (err) {
            console.error('Failed to load E-Rapor data', err);
        }
        setIsLoading(false);
    }, []);

    // Grade system matching E-Rapor
    const gradeSystem = [
        { min: 95, max: 100, grade: 'A+', category: 'Istimewa', color: '#3b82f6' },
        { min: 90, max: 94.99, grade: 'A', category: 'Istimewa', color: '#2dd4bf' },
        { min: 85, max: 89.99, grade: 'B+', category: 'Baik', color: '#22c55e' },
        { min: 80, max: 84.99, grade: 'B', category: 'Baik', color: '#84cc16' },
        { min: 75, max: 79.99, grade: 'C+', category: 'Memadai', color: '#fde047' },
        { min: 70, max: 74.99, grade: 'C', category: 'Memadai', color: '#f59e0b' },
        { min: 65, max: 69.99, grade: 'D+', category: 'Kurang', color: '#ea580c' },
        { min: 60, max: 64.99, grade: 'D', category: 'Kurang', color: '#ef4444' },
        { min: 0, max: 59.99, grade: 'E', category: 'Sangat Kurang', color: '#7c3aed' },
    ];

    const getGradeInfo = (score: number) => {
        return gradeSystem.find(g => score >= g.min && score <= g.max) || gradeSystem[gradeSystem.length - 1];
    };

    // Helper for grade letter (simplified)
    const getGradeLetter = (score: number) => getGradeInfo(score).grade;
    const getGradeColor = (score: number) => getGradeInfo(score).color;
    const getGradeCategory = (score: number) => getGradeInfo(score).category;

    // Check school level
    const schoolLevel = user?.className?.toUpperCase() || '';
    const isSMA = schoolLevel.includes('SMA') || schoolLevel.includes('SMK') || schoolLevel.includes('MA') || schoolLevel.includes('MAK');
    const isSMP = schoolLevel.includes('SMP') || schoolLevel.includes('MTS');
    const showAcademicProfile = isSMP || isSMA;

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    const hasData = subjects.length > 0;

    if (isLoading) {
        return (
            <div className="dashboard-page">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="dash-header">
                <div className="greeting-section">
                    <h1 className="greeting-title">{getGreeting()}, {user?.fullName?.split(' ')[0] || 'Siswa'}! 👋</h1>
                    <p className="greeting-subtitle">
                        {hasData
                            ? (isSMP
                                ? 'Semangat mengejar Sekolah impianmu! 🎯'
                                : 'Semangat mengejar PTN impianmu! 🎯')
                            : (isSMP
                                ? 'Mulai perjalananmu menuju Sekolah impian!'
                                : 'Mulai perjalananmu menuju PTN impian!')}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {/* Rata-rata Card */}
                <div className="stat-card primary">
                    <div className="stat-icon-box">📊</div>
                    <div className="stat-info">
                        <span className="stat-label">Rata-Rata Rapor</span>
                        <span className="stat-value" style={{ color: getGradeColor(averageScore) }}>
                            {hasData ? averageScore.toFixed(2) : '-.-'}
                        </span>
                        {hasData && (
                            <>
                                <span className="stat-category">({getGradeCategory(averageScore)})</span>
                                <span className="stat-badge" style={{ backgroundColor: getGradeColor(averageScore) }}>
                                    Grade {getGradeLetter(averageScore)}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Jumlah Mapel Card */}
                <div className="stat-card">
                    <div className="stat-icon-box">📚</div>
                    <div className="stat-info">
                        <span className="stat-label">Jumlah Mapel</span>
                        <span className="stat-value">{subjects.length}</span>
                        <span className="stat-sublabel">mata pelajaran</span>
                    </div>
                </div>

                {/* Semester Terisi Card */}
                <div className="stat-card">
                    <div className="stat-icon-box">📅</div>
                    <div className="stat-info">
                        <span className="stat-label">Semester Terisi</span>
                        <span className="stat-value">{filledSemesters}/5</span>
                        <span className="stat-sublabel">semester</span>
                    </div>
                </div>
            </div>

            {/* Empty State or Progress */}
            {!hasData ? (
                <div className="empty-state-card">
                    <div className="empty-icon">🎓</div>
                    <h3>Belum Ada Data Nilai</h3>
                    <p>Mulai dengan menambahkan mata pelajaran dan nilai kamu di halaman E-Rapor.</p>
                    <button className="btn-primary" onClick={() => navigate('/student/erapor')}>
                        <Plus size={18} />
                        Mulai Input Nilai
                    </button>
                </div>
            ) : (
                <>
                    {/* Bento Grid - Trend + Donut in one row */}
                    <div className="bento-grid">
                        {/* Trend Chart */}
                        <div className="bento-item bento-trend">
                            <h2 className="section-title">📈 Tren Rata-rata per Semester</h2>
                            <div className="enhanced-chart-container">
                                {(() => {
                                    const semesterData = [1, 2, 3, 4, 5].map(sem => {
                                        const semKey = `sem${sem}` as keyof BetaSubject;
                                        const scores = subjects.map(s => s[semKey] as number | null).filter(v => v !== null) as number[];
                                        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                                        const gradeInfo = getGradeInfo(avg);
                                        return { sem, avg, hasData: scores.length > 0, grade: gradeInfo.grade, category: gradeInfo.category, color: gradeInfo.color };
                                    });

                                    const chartHeight = 220;
                                    const chartWidth = 400;
                                    const padding = 45;
                                    const minY = 50;
                                    const maxY = 100;

                                    const points = semesterData.map((d, i) => {
                                        const xPos = padding + (i * (chartWidth - 2 * padding) / 4);
                                        const yRange = maxY - minY;
                                        const normalizedAvg = d.hasData ? Math.max(minY, Math.min(maxY, d.avg)) : minY;
                                        const yPos = chartHeight - padding - ((normalizedAvg - minY) / yRange) * (chartHeight - 2 * padding);
                                        return { x: xPos, y: d.hasData ? yPos : chartHeight - padding, ...d };
                                    });

                                    // Create smooth curve path
                                    const filledPoints = points.filter(p => p.hasData);
                                    const linePath = filledPoints.map((p, i) =>
                                        i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`
                                    ).join(' ');

                                    // Area path for gradient fill
                                    const areaPath = filledPoints.length > 0
                                        ? `${linePath} L${filledPoints[filledPoints.length - 1].x},${chartHeight - padding} L${filledPoints[0].x},${chartHeight - padding} Z`
                                        : '';

                                    return (
                                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="enhanced-chart-svg">
                                            <defs>
                                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                                                </linearGradient>
                                                <filter id="glow">
                                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                                </filter>
                                            </defs>

                                            {/* Grid lines */}
                                            {[50, 60, 70, 80, 90, 100].map(val => (
                                                <g key={val}>
                                                    <line
                                                        x1={padding}
                                                        y1={chartHeight - padding - ((val - minY) / (maxY - minY)) * (chartHeight - 2 * padding)}
                                                        x2={chartWidth - padding}
                                                        y2={chartHeight - padding - ((val - minY) / (maxY - minY)) * (chartHeight - 2 * padding)}
                                                        className="grid-line"
                                                    />
                                                    <text
                                                        x={padding - 8}
                                                        y={chartHeight - padding - ((val - minY) / (maxY - minY)) * (chartHeight - 2 * padding) + 4}
                                                        className="y-axis-label"
                                                    >
                                                        {val}
                                                    </text>
                                                </g>
                                            ))}

                                            {/* Area fill */}
                                            {areaPath && <path d={areaPath} fill="url(#areaGradient)" className="trend-area" />}

                                            {/* Main line */}
                                            {linePath && <path d={linePath} className="trend-line-enhanced" fill="none" filter="url(#glow)" />}

                                            {/* Interactive dots with tooltips */}
                                            {points.map((p, i) => (
                                                <g key={i} className="chart-point-group">
                                                    {/* Invisible larger hit area */}
                                                    <circle cx={p.x} cy={p.y} r="16" fill="transparent" className="hit-area" />

                                                    {/* Outer ring */}
                                                    <circle
                                                        cx={p.x} cy={p.y} r="10"
                                                        className={`point-ring ${p.hasData ? '' : 'empty'}`}
                                                        style={{ stroke: p.hasData ? p.color : 'rgba(255,255,255,0.2)' }}
                                                    />

                                                    {/* Inner dot */}
                                                    <circle
                                                        cx={p.x} cy={p.y} r="6"
                                                        className={`point-dot ${p.hasData ? '' : 'empty'}`}
                                                        style={{ fill: p.hasData ? p.color : 'rgba(255,255,255,0.1)' }}
                                                    />

                                                    {/* X-axis label */}
                                                    <text x={p.x} y={chartHeight - 12} textAnchor="middle" className="x-axis-label">
                                                        S{p.sem}
                                                    </text>

                                                    {/* Tooltip */}
                                                    {p.hasData && (
                                                        <g className="tooltip-group">
                                                            <rect
                                                                x={p.x - 45} y={p.y - 55}
                                                                width="90" height="45"
                                                                rx="8"
                                                                className="tooltip-bg"
                                                            />
                                                            <text x={p.x} y={p.y - 38} textAnchor="middle" className="tooltip-value">
                                                                {p.avg.toFixed(1)}
                                                            </text>
                                                            <text x={p.x} y={p.y - 22} textAnchor="middle" className="tooltip-grade" style={{ fill: p.color }}>
                                                                Grade {p.grade}
                                                            </text>
                                                        </g>
                                                    )}
                                                </g>
                                            ))}
                                        </svg>
                                    );
                                })()}
                            </div>
                            <div className="trend-summary">
                                {(() => {
                                    const filledData = [1, 2, 3, 4, 5].map(sem => {
                                        const semKey = `sem${sem}` as keyof BetaSubject;
                                        const scores = subjects.map(s => s[semKey] as number | null).filter(v => v !== null) as number[];
                                        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                                    }).filter(v => v !== null) as number[];

                                    if (filledData.length < 2) return <span className="trend-hint">Isi minimal 2 semester untuk melihat tren</span>;

                                    const trend = filledData[filledData.length - 1] - filledData[0];
                                    const trendIcon = trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️';
                                    const trendText = trend > 0 ? `+${trend.toFixed(1)} poin` : trend < 0 ? `${trend.toFixed(1)} poin` : 'Stabil';
                                    const trendClass = trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable';

                                    return (
                                        <span className={`trend-indicator ${trendClass}`}>
                                            {trendIcon} Tren: {trendText}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Donut Chart - Grade Distribution */}
                        <div className="bento-item bento-donut">
                            <h2 className="section-title">🍩 Distribusi Grade</h2>
                            <div className="donut-chart-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                                {(() => {
                                    // Grade System (Same as ERaporPage) - Defined locally to ensure consistency
                                    const gradeSystem = [
                                        { min: 95, max: 100, grade: 'A+', color: '#3b82f6' },
                                        { min: 90, max: 94.99, grade: 'A', color: '#2dd4bf' },
                                        { min: 85, max: 89.99, grade: 'B+', color: '#22c55e' },
                                        { min: 80, max: 84.99, grade: 'B', color: '#84cc16' },
                                        { min: 75, max: 79.99, grade: 'C+', color: '#fde047' },
                                        { min: 70, max: 74.99, grade: 'C', color: '#f59e0b' },
                                        { min: 65, max: 69.99, grade: 'D+', color: '#ea580c' },
                                        { min: 60, max: 64.99, grade: 'D', color: '#ef4444' },
                                        { min: 0, max: 59.99, grade: 'E', color: '#7c3aed' },
                                    ];

                                    const getGradeInfo = (val: number) => gradeSystem.find(g => val >= g.min && val <= g.max) || gradeSystem[gradeSystem.length - 1];

                                    // Count ALL semester grades
                                    const gradeCounts: Record<string, number> = {};
                                    gradeSystem.forEach(g => gradeCounts[g.grade] = 0);

                                    subjects.forEach(sub => {
                                        [1, 2, 3, 4, 5].forEach(sem => {
                                            const val = sub[`sem${sem}` as keyof BetaSubject] as number | null;
                                            if (val !== null) {
                                                const info = getGradeInfo(val);
                                                if (info) gradeCounts[info.grade]++;
                                            }
                                        });
                                    });

                                    const total = Object.values(gradeCounts).reduce((a, b) => a + b, 0);
                                    let offset = 0;

                                    return (
                                        <>
                                            <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                                                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2a2a2a" strokeWidth="3" />
                                                    {gradeSystem.map((g) => {
                                                        const count = gradeCounts[g.grade];
                                                        if (count === 0) return null;
                                                        const pct = (count / total) * 100;
                                                        const strokeDasharray = `${pct} ${100 - pct}`;
                                                        const strokeDashoffset = -offset;
                                                        offset += pct;
                                                        return (
                                                            <circle
                                                                key={g.grade}
                                                                cx="18" cy="18" r="15.915"
                                                                fill="none"
                                                                stroke={g.color}
                                                                strokeWidth="5"
                                                                strokeDasharray={strokeDasharray}
                                                                strokeDashoffset={strokeDashoffset}
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{total}</div>
                                                    <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Total Data</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
                                                {gradeSystem.filter(g => gradeCounts[g.grade] > 0).map((g) => (
                                                    <div key={g.grade} style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px',
                                                        borderLeft: `3px solid ${g.color}`
                                                    }}>
                                                        <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{g.grade}</span>
                                                        <span style={{ fontSize: '12px', color: '#888' }}>{gradeCounts[g.grade]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Academic Profile Bars - Only for SMP/SMA */}
                    {showAcademicProfile && (
                        <div className="chart-card profile-card">
                            <h2 className="section-title">🕸️ Profil Akademik</h2>
                            <div className="profile-bars">
                                {(() => {
                                    const categories: { [key: string]: number[] } = { 'Sains': [], 'Sosial': [], 'Bahasa': [] };
                                    subjects.forEach(sub => {
                                        const name = sub.name.toLowerCase();
                                        const scores = [sub.sem1, sub.sem2, sub.sem3, sub.sem4, sub.sem5].filter(s => s !== null) as number[];
                                        if (scores.length === 0) return;
                                        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                                        if (name.includes('fisika') || name.includes('kimia') || name.includes('biologi') || name.includes('matematika')) {
                                            categories['Sains'].push(avg);
                                        } else if (name.includes('sejarah') || name.includes('ekonomi') || name.includes('geografi') || name.includes('sosiologi')) {
                                            categories['Sosial'].push(avg);
                                        } else if (name.includes('indonesia') || name.includes('inggris') || name.includes('jepang')) {
                                            categories['Bahasa'].push(avg);
                                        }
                                    });
                                    const colors = { 'Sains': '#3b82f6', 'Sosial': '#f59e0b', 'Bahasa': '#10b981' };
                                    return Object.entries(categories).map(([cat, scores]) => {
                                        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                                        return (
                                            <div key={cat} className="profile-bar-row">
                                                <span className="profile-label">{cat}</span>
                                                <div className="profile-track">
                                                    <div className="profile-fill" style={{ width: `${avg}%`, backgroundColor: colors[cat as keyof typeof colors] }} />
                                                </div>
                                                <span className="profile-value">{avg > 0 ? avg.toFixed(0) : '-'}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Charts Section - Grouped Horizontal Bar Chart (Bottom) */}
                    <div className="charts-section">
                        <div className="chart-card">
                            <h2 className="section-title">📊 Perbandingan Nilai per Semester</h2>
                            <div className="grouped-bar-chart">
                                {subjects.slice(0, 5).map((subject) => {
                                    const semColors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
                                    return (
                                        <div key={subject.id} className="grouped-bar-row">
                                            <span className="grouped-bar-label">
                                                {subject.name.length > 15 ? subject.name.substring(0, 15) + '...' : subject.name}
                                            </span>
                                            <div className="grouped-bars">
                                                {[1, 2, 3, 4, 5].map((sem, idx) => {
                                                    const semKey = `sem${sem}` as keyof BetaSubject;
                                                    const value = subject[semKey] as number | null;
                                                    const hasValue = value !== null && value > 0;
                                                    return (
                                                        <div key={sem} className="grouped-bar-item">
                                                            <div
                                                                className={`grouped-bar-fill ${!hasValue ? 'empty' : ''}`}
                                                                style={{
                                                                    width: hasValue ? `${value}%` : '3%',
                                                                    backgroundColor: hasValue ? semColors[idx] : 'rgba(255,255,255,0.1)'
                                                                }}
                                                            />
                                                            <span className="grouped-bar-value">
                                                                {hasValue ? value : '-'}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                {subjects.length > 5 && (
                                    <p className="chart-more">+ {subjects.length - 5} mapel lainnya</p>
                                )}
                            </div>
                            <div className="grouped-bar-legend">
                                {['S1', 'S2', 'S3', 'S4', 'S5'].map((sem, idx) => (
                                    <span key={sem} className="legend-item">
                                        <span className="dot" style={{ backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'][idx] }}></span>
                                        {sem}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )
            }
        </div >
    );
};

export default DashboardPage;
