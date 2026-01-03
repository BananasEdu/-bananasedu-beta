
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Loader2, Filter } from 'lucide-react';
import { useClasses, useLevels, useMajors } from '../../../hooks/useAdminData';
import { kelasList, tingkatanList, jurusanList } from '../../../data/mockAdminData';

const TabKelas: React.FC = () => {
    const [filterLevel, setFilterLevel] = useState('');
    const [filterMajor, setFilterMajor] = useState('');

    const { data: apiClasses, isLoading, error, fetch } = useClasses({ levelId: filterLevel || undefined, majorId: filterMajor || undefined });
    const { data: apiLevels, fetch: fetchLevels } = useLevels();
    const { data: apiMajors, fetch: fetchMajors } = useMajors();

    useEffect(() => {
        fetch();
        fetchLevels();
        fetchMajors();
    }, [fetch, fetchLevels, fetchMajors]);

    // Use API data if available, otherwise fall back to mock data
    const levels = apiLevels.length > 0 ? apiLevels : tingkatanList;
    const majors = apiMajors.length > 0 ? apiMajors : jurusanList;

    const data = apiClasses.length > 0 ? apiClasses.map((c) => ({
        id: c.id,
        name: c.name,
        tingkatan: c.level.name,
        jurusan: c.major.name,
        studentCount: c.studentCount,
        waliKelas: c.homeroom || '-'
    })) : kelasList.filter(k => {
        if (filterLevel && !k.tingkatan.toLowerCase().includes(filterLevel.toLowerCase())) return false;
        if (filterMajor && !k.jurusan.toLowerCase().includes(filterMajor.toLowerCase())) return false;
        return true;
    });

    const isUsingMockData = apiClasses.length === 0 && !isLoading;

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
                <div className="filter-group">
                    <Filter size={16} />
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Tingkatan</option>
                        {levels.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterMajor}
                        onChange={(e) => setFilterMajor(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Semua Jurusan</option>
                        {majors.map((j) => (
                            <option key={j.id} value={j.id}>{j.name}</option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary">
                    <Plus size={16} /> Tambah Kelas
                </button>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Nama Kelas</th>
                            <th>Tingkatan</th>
                            <th>Jurusan</th>
                            <th>Wali Kelas</th>
                            <th>Siswa</th>
                            <th style={{ width: '120px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td className="font-medium">{item.name}</td>
                                <td>{item.tingkatan}</td>
                                <td>{item.jurusan}</td>
                                <td>{item.waliKelas}</td>
                                <td>{item.studentCount} siswa</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="icon-btn-sm" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button className="icon-btn-sm danger" title="Hapus">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pane-footer">
                <p className="footer-note">📊 Total: {data.length} kelas</p>
            </div>
        </div>
    );
};

export default TabKelas;
