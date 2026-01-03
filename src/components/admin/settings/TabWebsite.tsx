import React, { useState, useEffect } from 'react';
import { Save, Globe, Mail, RefreshCw } from 'lucide-react';
import { dataStore, formatTimestamp } from '../../../store/dataStore';
import type { WebsiteSettings, Admin } from '../../../store/dataStore';

const TabWebsite: React.FC = () => {
    const [settings, setSettings] = useState<WebsiteSettings | null>(null);
    const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
    const [form, setForm] = useState({
        name: '',
        logoUrl: '',
        faviconUrl: '',
        contactPerson: '',
        email: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const ws = dataStore.getWebsiteSettings();
        setSettings(ws);
        setForm({
            name: ws.name,
            logoUrl: ws.logoUrl,
            faviconUrl: ws.faviconUrl,
            contactPerson: ws.contactPerson,
            email: ws.email,
        });
        setCurrentAdmin(dataStore.getCurrentAdmin());
    };

    const isSuperAdmin = currentAdmin?.role === 'super_admin';

    const handleSave = () => {
        setIsSaving(true);
        dataStore.updateWebsiteSettings(form);
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            loadData();
            setTimeout(() => setSaved(false), 2000);
        }, 500);
    };

    if (!isSuperAdmin) {
        return (
            <div className="tab-pane">
                <div className="empty-state">
                    <div className="empty-icon">🔒</div>
                    <div className="empty-title">Akses Ditolak</div>
                    <div className="empty-text">Hanya Super Admin yang bisa mengubah pengaturan website</div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            <div className="pane-header">
                <h3 className="section-title">🌐 Pengaturan Website</h3>
                <button className="btn btn-secondary btn-sm" onClick={loadData}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {saved && <div className="alert alert-success">✅ Pengaturan berhasil disimpan!</div>}

            <div className="settings-grid">
                {/* Branding Section */}
                <div className="settings-section glass-card">
                    <h4><Globe size={18} /> Identitas Website</h4>

                    <div className="form-group">
                        <label>Nama Website</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="BananasEdu"
                        />
                        <small className="text-muted">Ditampilkan di header dan judul halaman</small>
                    </div>

                    <div className="form-group">
                        <label>Logo URL</label>
                        <input
                            type="url"
                            value={form.logoUrl}
                            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                            placeholder="https://..."
                        />
                        <small className="text-muted">Logo tampil di header, E-Rapor, dan struk</small>
                        {form.logoUrl && (
                            <div className="preview-box">
                                <img
                                    src={form.logoUrl}
                                    alt="Logo Preview"
                                    className="logo-preview"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Favicon URL</label>
                        <input
                            type="url"
                            value={form.faviconUrl}
                            onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
                            placeholder="https://..."
                        />
                        <small className="text-muted">Icon yang tampil di tab browser</small>
                        {form.faviconUrl && (
                            <div className="preview-box">
                                <img
                                    src={form.faviconUrl}
                                    alt="Favicon Preview"
                                    className="favicon-preview"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Section */}
                <div className="settings-section glass-card">
                    <h4><Mail size={18} /> Informasi Kontak</h4>

                    <div className="form-group">
                        <label>Contact Person</label>
                        <input
                            type="text"
                            value={form.contactPerson}
                            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                            placeholder="Admin Sekolah"
                        />
                        <small className="text-muted">Ditampilkan di footer landing page</small>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="admin@sekolah.com"
                        />
                        <small className="text-muted">Ditampilkan di footer landing page</small>
                    </div>
                </div>
            </div>

            {/* Integration Preview */}
            <div className="glass-card integration-preview">
                <h4>🔗 Integrasi</h4>
                <div className="integration-grid">
                    <div className="integration-item">
                        <span className="integration-label">Header semua halaman</span>
                        <span className="integration-value">{form.name || 'BananasEdu'}</span>
                    </div>
                    <div className="integration-item">
                        <span className="integration-label">Footer Landing Page</span>
                        <span className="integration-value">{form.contactPerson || '-'} | {form.email || '-'}</span>
                    </div>
                    <div className="integration-item">
                        <span className="integration-label">E-Rapor & Struk</span>
                        <span className="integration-value">{form.logoUrl ? '✅ Logo tersedia' : '❌ Logo belum diset'}</span>
                    </div>
                </div>
            </div>

            <div className="pane-footer">
                {settings && (
                    <p className="footer-note">📅 Terakhir diupdate: {formatTimestamp(settings.updatedAt)}</p>
                )}
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                    <Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
            </div>
        </div>
    );
};

export default TabWebsite;
