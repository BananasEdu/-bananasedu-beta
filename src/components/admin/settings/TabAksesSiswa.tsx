
import React, { useEffect, useState } from 'react';
import { Save, Loader2, ToggleLeft, ToggleRight, Lock, Unlock } from 'lucide-react';
import { useAccessSettings } from '../../../hooks/useAdminData';

const TabAksesSiswa: React.FC = () => {
    const { data: apiData, isLoading, error, fetch, update } = useAccessSettings();

    const [semesterLocked, setSemesterLocked] = useState(false);
    const [raporLocked, setRaporLocked] = useState(false);
    const [gradeSubmissionOpen, setGradeSubmissionOpen] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch();
    }, [fetch]);

    useEffect(() => {
        if (apiData) {
            setSemesterLocked(apiData.semesterLocked);
            setRaporLocked(apiData.raporLocked);
            setGradeSubmissionOpen(apiData.gradeSubmissionOpen);
        }
    }, [apiData]);

    const isUsingMockData = !apiData && !isLoading;

    const handleSave = async () => {
        setSaving(true);
        try {
            await update({ semesterLocked, raporLocked, gradeSubmissionOpen });
            alert('Pengaturan akses berhasil disimpan!');
        } catch (err) {
            alert('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="tab-pane loading-state">
                <Loader2 className="spinner" size={24} />
                <p>Memuat pengaturan...</p>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            {error && isUsingMockData && (
                <div className="connection-warning">
                    ⚠️ Backend tidak terhubung. Pengaturan tidak akan tersimpan.
                </div>
            )}

            <div className="settings-form">
                <div className="setting-item">
                    <div className="setting-info">
                        <h4>
                            {gradeSubmissionOpen ? <Unlock size={18} /> : <Lock size={18} />}
                            Input Nilai Siswa
                        </h4>
                        <p>Izinkan siswa untuk menginput dan mengedit nilai</p>
                    </div>
                    <button
                        className={`toggle-btn ${gradeSubmissionOpen ? 'active' : ''}`}
                        onClick={() => setGradeSubmissionOpen(!gradeSubmissionOpen)}
                    >
                        {gradeSubmissionOpen ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h4>
                            {semesterLocked ? <Lock size={18} /> : <Unlock size={18} />}
                            Kunci Semester
                        </h4>
                        <p>Kunci nilai semester sehingga siswa tidak bisa mengubah</p>
                    </div>
                    <button
                        className={`toggle-btn ${semesterLocked ? 'active' : ''}`}
                        onClick={() => setSemesterLocked(!semesterLocked)}
                    >
                        {semesterLocked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <h4>
                            {raporLocked ? <Lock size={18} /> : <Unlock size={18} />}
                            Kunci E-Rapor
                        </h4>
                        <p>Kunci akses ke halaman E-Rapor</p>
                    </div>
                    <button
                        className={`toggle-btn ${raporLocked ? 'active' : ''}`}
                        onClick={() => setRaporLocked(!raporLocked)}
                    >
                        {raporLocked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>

                <div className="form-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="spinner" size={16} /> : <Save size={16} />}
                        Simpan Pengaturan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TabAksesSiswa;
