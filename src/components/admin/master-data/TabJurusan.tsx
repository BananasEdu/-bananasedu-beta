
import React, { useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useMajors } from '../../../hooks/useAdminData';
import { jurusanList } from '../../../data/mockAdminData';

const TabJurusan: React.FC = () => {
    const { data: apiData, isLoading, error, fetch } = useMajors();

    useEffect(() => {
        fetch();
    }, [fetch]);

    // Use API data if available, otherwise fall back to mock data
    const data = apiData.length > 0 ? apiData.map((m) => ({
        id: m.id,
        name: m.name,
        code: m.code,
        classCount: m.classCount,
        subjectCount: m.subjectCount || 0
    })) : jurusanList;

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
                    <Plus size={16} /> Tambah Jurusan
                </button>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Nama Jurusan</th>
                            <th>Kode</th>
                            <th>Jumlah Kelas</th>
                            <th>Mata Pelajaran</th>
                            <th style={{ width: '120px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td className="font-medium">{item.name}</td>
                                <td>{item.code}</td>
                                <td>{item.classCount} kelas</td>
                                <td>{item.subjectCount} mapel</td>
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
        </div>
    );
};

export default TabJurusan;
