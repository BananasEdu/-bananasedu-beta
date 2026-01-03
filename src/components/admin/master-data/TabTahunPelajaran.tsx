
import React, { useEffect } from 'react';
import { Plus, Edit, Archive, Loader2, CheckCircle } from 'lucide-react';
import { useAcademicYears } from '../../../hooks/useAdminData';
import { tahunPelajaranList } from '../../../data/mockAdminData';

const TabTahunPelajaran: React.FC = () => {
    const { data: apiData, isLoading, error, fetch } = useAcademicYears();

    useEffect(() => {
        fetch();
    }, [fetch]);

    // Use API data if available, otherwise fall back to mock data
    const data = apiData.length > 0 ? apiData.map((ay, _index) => ({
        id: ay.id,
        tahun: ay.year,
        semester: ay.semester === 'ganjil' ? 'Ganjil' : 'Genap',
        status: ay.status as 'active' | 'archived',
        studentCount: ay.classCount * 30 // Approximate
    })) : tahunPelajaranList;

    const isUsingMockData = apiData.length === 0 && !isLoading;

    if (isLoading) {
        return (
            <div className="tab-pane loading-state">
                <Loader2 className="spinner" size={24} />
                <p>Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            {error && isUsingMockData && (
                <div className="connection-warning">
                    ⚠️ Backend tidak terhubung. Menggunakan data demo.
                </div>
            )}
            <div className="pane-header">
                <button className="btn btn-primary">
                    <Plus size={16} /> Tambah Tahun Pelajaran
                </button>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Tahun Pelajaran</th>
                            <th>Semester</th>
                            <th>Status</th>
                            <th>Siswa</th>
                            <th style={{ width: '120px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.id} className={item.status === 'active' ? 'active-row' : ''}>
                                <td>{index + 1}</td>
                                <td className="font-medium">{item.tahun}</td>
                                <td>{item.semester}</td>
                                <td>
                                    <span className={`status-badge ${item.status}`}>
                                        {item.status === 'active' ? '🟢 Aktif' : '⚪ Arsip'}
                                    </span>
                                </td>
                                <td>{item.studentCount}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="icon-btn-sm" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        {item.status === 'active' ? (
                                            <button className="icon-btn-sm disabled" title="Tidak bisa arsip yang aktif" disabled>
                                                <Archive size={16} />
                                            </button>
                                        ) : (
                                            <button className="icon-btn-sm success" title="Aktifkan">
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pane-footer">
                <p className="footer-note">⚠️ Hanya 1 tahun pelajaran yang bisa aktif</p>
            </div>
        </div>
    );
};

export default TabTahunPelajaran;
