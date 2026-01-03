import React, { useState, useEffect } from 'react';
import { Save, Loader2, Calendar, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const TabPengaturanSemester: React.FC = () => {
    const [semesters, setSemesters] = useState<boolean[]>([true, true, true, true, true]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const url = new URL(API_URL);
            url.searchParams.append('action', 'getSettings');
            const res = await fetch(url.toString());
            const data = await res.json();
            if (data.success && data.settings.required_semesters) {
                const reqSems = data.settings.required_semesters
                    .split(',')
                    .map((s: string) => parseInt(s.trim(), 10));
                // Convert to boolean array
                const boolArr = [1, 2, 3, 4, 5].map(n => reqSems.includes(n));
                setSemesters(boolArr);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (index: number) => {
        const newSems = [...semesters];
        newSems[index] = !newSems[index];
        // Ensure at least one semester is selected
        if (newSems.some(s => s)) {
            setSemesters(newSems);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);
        try {
            const token = localStorage.getItem('bananasedu_token');
            // Convert boolean array to comma-separated string
            const selectedSems = semesters
                .map((checked, i) => checked ? i + 1 : null)
                .filter(n => n !== null)
                .join(',');

            const url = new URL(API_URL);
            url.searchParams.append('action', 'updateSettings');
            const res = await fetch(url.toString(), {
                method: 'POST',
                body: JSON.stringify({
                    token,
                    key: 'required_semesters',
                    value: selectedSems
                })
            });
            const data = await res.json();
            if (data.success) {
                setSaveMessage('✅ Pengaturan berhasil disimpan!');
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage('❌ Gagal menyimpan: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            setSaveMessage('❌ Terjadi kesalahan jaringan');
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="tab-pane">
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Memuat pengaturan...</p>
                </div>
            </div>
        );
    }

    const selectedCount = semesters.filter(s => s).length;

    return (
        <div className="tab-pane">
            {/* Header */}
            <div className="settings-section">
                <div className="settings-header">
                    <Calendar size={24} />
                    <div>
                        <h3>Semester Wajib Upload</h3>
                        <p className="text-muted">Pilih semester yang wajib diisi oleh siswa saat input nilai</p>
                    </div>
                </div>

                <div className="semester-checkboxes">
                    {[1, 2, 3, 4, 5].map((sem, index) => (
                        <label key={sem} className={`semester-checkbox ${semesters[index] ? 'checked' : ''}`}>
                            <input
                                type="checkbox"
                                checked={semesters[index]}
                                onChange={() => handleToggle(index)}
                            />
                            <span className="checkbox-label">Semester {sem}</span>
                        </label>
                    ))}
                </div>

                <div className="settings-info">
                    <Info size={16} />
                    <span>{selectedCount} semester dipilih. Siswa akan melihat {selectedCount} form upload di halaman Input Nilai.</span>
                </div>

                {saveMessage && (
                    <div className={`save-message ${saveMessage.includes('✅') ? 'success' : 'error'}`}>
                        {saveMessage}
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ marginTop: '1rem' }}
                >
                    {isSaving ? (
                        <><Loader2 className="spinner" size={16} /> Menyimpan...</>
                    ) : (
                        <><Save size={16} /> Simpan Pengaturan</>
                    )}
                </button>
            </div>

            <style>{`
                .settings-section {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    padding: 1.5rem;
                }
                .settings-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .settings-header h3 {
                    margin: 0 0 0.25rem;
                    color: var(--text-primary);
                }
                .settings-header p {
                    margin: 0;
                    font-size: 0.9rem;
                }
                .semester-checkboxes {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .semester-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 2px solid var(--glass-border);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .semester-checkbox:hover {
                    border-color: var(--primary-color);
                }
                .semester-checkbox.checked {
                    border-color: #22c55e;
                    background: rgba(34, 197, 94, 0.1);
                }
                .semester-checkbox input {
                    width: 18px;
                    height: 18px;
                    accent-color: #22c55e;
                }
                .checkbox-label {
                    font-weight: 500;
                    color: var(--text-primary);
                }
                .settings-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 8px;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                .save-message {
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    margin-top: 1rem;
                    font-weight: 500;
                }
                .save-message.success {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }
                .save-message.error {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
            `}</style>
        </div>
    );
};

export default TabPengaturanSemester;
