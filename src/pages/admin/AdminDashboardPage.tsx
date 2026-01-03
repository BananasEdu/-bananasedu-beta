import React, { useState, useEffect, useMemo } from 'react';
import { Users, FileText, TrendingUp, School, Loader2, RefreshCw } from 'lucide-react';
import { gasApi, type GasUserData, type GasGradeData } from '../../lib/adminApi';
import '../../styles/AdminStyles.css';

const AdminDashboardPage: React.FC = () => {
    const [users, setUsers] = useState<GasUserData[]>([]);
    const [grades, setGrades] = useState<GasGradeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Statistics
    const stats = useMemo(() => {
        const students = users.filter(u => u.role !== 'admin');
        const sdCount = students.filter(u => ['SD', 'MI'].includes(u.schoolLevel)).length;
        const smpCount = students.filter(u => ['SMP', 'MTs'].includes(u.schoolLevel)).length;
        const smaCount = students.filter(u => ['SMA', 'SMK', 'MA'].includes(u.schoolLevel)).length;

        const avgGrade = grades.length > 0
            ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
            : 0;

        return {
            totalStudents: students.length,
            sdCount,
            smpCount,
            smaCount,
            totalGrades: grades.length,
            avgGrade: avgGrade.toFixed(1)
        };
    }, [users, grades]);

    // Recent registrations (last 5)
    const recentUsers = useMemo(() => {
        return [...users]
            .filter(u => u.role !== 'admin')
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 5);
    }, [users]);

    // Recent grades (last 5)
    const recentGrades = useMemo(() => {
        const usersMap = new Map(users.map(u => [u.id, u.fullName]));
        return [...grades]
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 5)
            .map(g => ({ ...g, studentName: usersMap.get(g.userId || '') || 'Unknown' }));
    }, [grades, users]);

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
            <div className="admin-dashboard-page">
                <div className="loading-state">
                    <Loader2 className="spinner" size={40} />
                    <p>Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard-page">
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
        <div className="admin-dashboard-page">
            <div className="page-header">
                <h1 className="page-title">📊 Dashboard Admin</h1>
                <button className="btn btn-secondary btn-sm" onClick={loadData}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards">
                <div className="stat-card">
                    <div className="stat-icon blue"><Users size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalStudents}</span>
                        <span className="stat-label">Total Siswa</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><School size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.sdCount} / {stats.smpCount} / {stats.smaCount}</span>
                        <span className="stat-label">SD / SMP / SMA</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple"><FileText size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalGrades}</span>
                        <span className="stat-label">Total Nilai</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon yellow"><TrendingUp size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.avgGrade}</span>
                        <span className="stat-label">Rata-rata Nilai</span>
                    </div>
                </div>
            </div>

            {/* Activity Tables */}
            <div className="activity-grid">
                {/* Recent Registrations */}
                <div className="activity-card">
                    <h3 className="card-title">👥 Registrasi Terbaru</h3>
                    <div className="table-container">
                        <table className="admin-table compact">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Sekolah</th>
                                    <th>Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center text-muted">Belum ada data</td></tr>
                                ) : (
                                    recentUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="font-medium">{user.fullName}</td>
                                            <td>{user.schoolLevel} - {user.schoolName}</td>
                                            <td className="text-muted">{formatDate(user.createdAt)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Grades */}
                <div className="activity-card">
                    <h3 className="card-title">📝 Nilai Terbaru</h3>
                    <div className="table-container">
                        <table className="admin-table compact">
                            <thead>
                                <tr>
                                    <th>Siswa</th>
                                    <th>Mapel</th>
                                    <th>Nilai</th>
                                    <th>Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentGrades.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center text-muted">Belum ada data</td></tr>
                                ) : (
                                    recentGrades.map(grade => (
                                        <tr key={grade.id}>
                                            <td className="font-medium">{grade.studentName}</td>
                                            <td>{grade.subject}</td>
                                            <td><span className="grade-badge">{grade.grade}</span></td>
                                            <td className="text-muted">{formatDate(grade.createdAt)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
