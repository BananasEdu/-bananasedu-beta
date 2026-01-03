
import React, { useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useLevels } from '../../../hooks/useAdminData';
import { tingkatanList } from '../../../data/mockAdminData';

const TabTingkatan: React.FC = () => {
    const { data: apiData, isLoading, error, fetch } = useLevels();

    useEffect(() => {
        fetch();
    }, [fetch]);

    // Use API data if available, otherwise fall back to mock data
    const data = apiData.length > 0 ? apiData.map((l) => ({
        id: l.id,
        name: l.name,
        code: l.code,
        classCount: l.classCount
    })) : tingkatanList;

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
                    <Plus size={16} /> Tambah Tingkatan
                </button>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Nama Tingkatan</th>
                            <th>Kode</th>
                            <th>Jumlah Kelas</th>
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

export default TabTingkatan;
