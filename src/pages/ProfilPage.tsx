import { useState, useEffect } from 'react';
import { Send, User, School, GraduationCap, BookOpen, LogOut, Lock, Eye, EyeOff, Check, Edit2, X, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logActivity, getActivityLogs, formatActivityType, formatTimestamp, type ActivityLog } from '../utils/activityLogger';
import { feedbackApi } from '../lib/api';
import './ProfilPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfilPage() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    // States
    const [feedbackType, setFeedbackType] = useState<'saran' | 'kritik'>('saran');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Password change states
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Profile edit states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editUsername, setEditUsername] = useState(user?.username || '');
    const [editFullName, setEditFullName] = useState(user?.fullName || '');
    const [editSchoolName, setEditSchoolName] = useState(user?.schoolName || '');
    const [editClassLevel, setEditClassLevel] = useState(user?.classLevel || '');
    const [editMajor, setEditMajor] = useState(user?.major || '');
    const [editClassName, setEditClassName] = useState(user?.className || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Activity log state
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    // Social links state
    const [isEditingSocial, setIsEditingSocial] = useState(false);
    const [socialInstagram, setSocialInstagram] = useState('');
    const [socialTwitter, setSocialTwitter] = useState('');
    const [socialLinkedin, setSocialLinkedin] = useState('');

    // Load saved data on mount
    useEffect(() => {
        // Always use dark mode
        document.body.classList.remove('light-mode');

        // Load activity logs
        setActivityLogs(getActivityLogs(10));

        // Load social links
        const savedSocial = localStorage.getItem(`bananasedu_social_${user?.id}`);
        if (savedSocial) {
            const parsed = JSON.parse(savedSocial);
            setSocialInstagram(parsed.instagram || '');
            setSocialTwitter(parsed.twitter || '');
            setSocialLinkedin(parsed.linkedin || '');
        }
    }, [user?.id]);

    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackMessage.trim()) return;

        // Use API to save feedback
        const result = await feedbackApi.saveFeedback({
            userId: user?.id || 'guest',
            username: user?.username || 'Guest',
            message: feedbackMessage,
            type: feedbackType
        });

        if (result.success) {
            setFeedbackMessage('');
            showToastMessage('✅ Feedback berhasil dikirim!');
            // Also log locally if preferred for immediate UI update, or rely on toast
        } else {
            showToastMessage('❌ Gagal mengirim feedback: ' + (result.error || 'Server error'));
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            showToastMessage('❌ Semua field harus diisi');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToastMessage('❌ Password baru tidak cocok');
            return;
        }

        // Password validation: min 8 chars, lowercase, uppercase, numbers
        const hasMinLength = newPassword.length >= 8;
        const hasLowercase = /[a-z]/.test(newPassword);
        const hasUppercase = /[A-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);

        if (!hasMinLength || !hasLowercase || !hasUppercase || !hasNumber) {
            showToastMessage('❌ Password harus minimal 8 karakter, mengandung huruf kecil, huruf besar, dan angka');
            return;
        }

        if (newPassword === oldPassword) {
            showToastMessage('❌ Password baru tidak boleh sama dengan password lama');
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'changePassword',
                    userId: user?.id,
                    oldPassword,
                    newPassword,
                    deviceInfo: navigator.userAgent
                })
            });

            const result = await response.json();

            if (result.success) {
                showToastMessage('✅ Password berhasil diubah!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordForm(false);
                logActivity('PASSWORD_CHANGE', 'Password berhasil diubah', user?.id);
                setActivityLogs(getActivityLogs(10));
            } else {
                showToastMessage(`❌ ${result.error || 'Gagal mengubah password'}`);
            }
        } catch (err) {
            showToastMessage('❌ Terjadi kesalahan. Coba lagi.');
        }

        setIsChangingPassword(false);
    };

    const startEditProfile = () => {
        setEditUsername(user?.username || '');
        setEditFullName(user?.fullName || '');
        setEditSchoolName(user?.schoolName || '');
        setEditClassLevel(user?.classLevel || '');
        setEditMajor(user?.major || '');
        setEditClassName(user?.className || '');
        setIsEditingProfile(true);
    };

    const cancelEditProfile = () => {
        setIsEditingProfile(false);
    };

    const handleSaveProfile = async () => {
        if (!editUsername.trim()) {
            showToastMessage('❌ Username tidak boleh kosong');
            return;
        }
        if (!editFullName.trim()) {
            showToastMessage('❌ Nama tidak boleh kosong');
            return;
        }

        if (!API_URL) {
            showToastMessage('❌ API URL belum dikonfigurasi');
            return;
        }

        setIsSavingProfile(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'updateProfile',
                    userId: user?.id,
                    username: editUsername.trim(),
                    fullName: editFullName.trim(),
                    schoolName: editSchoolName.trim(),
                    classLevel: editClassLevel.trim(),
                    major: editMajor.trim(),
                    className: editClassName.trim()
                })
            });

            const result = await response.json();

            if (result.success) {
                showToastMessage('✅ Profil berhasil diperbarui!');
                setIsEditingProfile(false);
                if (updateUser && result.user) {
                    updateUser(result.user);
                }
                logActivity('PROFILE_UPDATE', 'Profil berhasil diperbarui', user?.id);
                setActivityLogs(getActivityLogs(10));
            } else {
                showToastMessage(`❌ ${result.error || 'Gagal menyimpan profil. Deploy ulang backend.'}`);
            }
        } catch (err) {
            showToastMessage('❌ Gagal menghubungi server. Deploy ulang backend.');
        }

        setIsSavingProfile(false);
    };

    // Save social links
    const saveSocialLinks = () => {
        const socialData = {
            instagram: socialInstagram.trim(),
            twitter: socialTwitter.trim(),
            linkedin: socialLinkedin.trim()
        };
        localStorage.setItem(`bananasedu_social_${user?.id}`, JSON.stringify(socialData));
        setIsEditingSocial(false);
        showToastMessage('✅ Social links berhasil disimpan!');
    };

    const handleLogout = () => {
        logActivity('LOGOUT', 'Logout dari aplikasi', user?.id);
        logout();
        navigate('/login');
    };

    // Get initials for avatar
    const getInitials = () => {
        const name = isEditingProfile ? editFullName : user?.fullName;
        if (!name) return '?';
        const names = name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[1][0]}`.toUpperCase()
            : names[0].substring(0, 2).toUpperCase();
    };

    return (
        <div className="profil-page">
            {/* Toast */}
            {showToast && (
                <div className="toast">
                    {toastMessage}
                </div>
            )}

            {/* Main Content */}
            <main className="profil-main">
                <div className="container">
                    {/* Profile Header Card */}
                    <div className="profile-header-card">
                        <div className="profile-avatar">
                            <span className="avatar-initials">{getInitials()}</span>
                        </div>
                        <div className="profile-header-info">
                            <h1 className="profile-name">{user?.fullName || 'Nama Siswa'}</h1>
                            <p className="profile-username">@{user?.username || 'username'}</p>
                            <div className="profile-badges">
                                <span className="badge badge-level">{user?.schoolLevel || 'SMA'}</span>
                                <span className="badge badge-class">Kelas {user?.classLevel || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Data Card */}
                    <div className="profile-section-card">
                        <div className="section-header-flex">
                            <h2 className="section-title">📋 Informasi Lengkap</h2>
                            {!isEditingProfile && (
                                <button className="btn-icon" onClick={startEditProfile}>
                                    <Edit2 size={16} />
                                </button>
                            )}
                        </div>

                        {!isEditingProfile ? (
                            <div className="profile-info-list">
                                <div className="info-row">
                                    <User size={18} />
                                    <span className="info-label">Nama Lengkap</span>
                                    <span className="info-value">{user?.fullName || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <User size={18} />
                                    <span className="info-label">Username</span>
                                    <span className="info-value">{user?.username || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <School size={18} />
                                    <span className="info-label">Sekolah</span>
                                    <span className="info-value">{user?.schoolName || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <GraduationCap size={18} />
                                    <span className="info-label">Tingkat</span>
                                    <span className="info-value">Kelas {user?.classLevel || '-'}</span>
                                </div>
                                {user?.major && (
                                    <div className="info-row">
                                        <BookOpen size={18} />
                                        <span className="info-label">Jurusan</span>
                                        <span className="info-value">{user.major}</span>
                                    </div>
                                )}
                                <div className="info-row">
                                    <User size={18} />
                                    <span className="info-label">Nama Kelas</span>
                                    <span className="info-value">{user?.className || '-'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-edit-form">
                                <div className="form-group">
                                    <label>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={editFullName}
                                        onChange={e => setEditFullName(e.target.value)}
                                        placeholder="Nama lengkap"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nama Sekolah</label>
                                    <input
                                        type="text"
                                        value={editSchoolName}
                                        onChange={e => setEditSchoolName(e.target.value)}
                                        placeholder="Nama sekolah"
                                    />
                                </div>
                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label>Tingkat Kelas</label>
                                        <select value={editClassLevel} onChange={e => setEditClassLevel(e.target.value)}>
                                            <option value="">Pilih</option>
                                            <option value="10">Kelas 10</option>
                                            <option value="11">Kelas 11</option>
                                            <option value="12">Kelas 12</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Jurusan (opsional)</label>
                                        <input
                                            type="text"
                                            value={editMajor}
                                            onChange={e => setEditMajor(e.target.value)}
                                            placeholder="Contoh: IPA, IPS"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Nama Kelas</label>
                                    <input
                                        type="text"
                                        value={editClassName}
                                        onChange={e => setEditClassName(e.target.value)}
                                        placeholder="Contoh: X IPA 1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><User size={16} /> Username</label>
                                    <input
                                        type="text"
                                        value={editUsername}
                                        onChange={e => setEditUsername(e.target.value)}
                                        placeholder="Username"
                                    />
                                </div>
                                <div className="edit-actions">
                                    <button className="btn btn-secondary" onClick={cancelEditProfile}>
                                        <X size={16} /> Batal
                                    </button>
                                    <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isSavingProfile}>
                                        {isSavingProfile ? 'Menyimpan...' : <><Check size={16} /> Simpan</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Social Links Card */}
                    <div className="profile-section-card">
                        <div className="section-header-flex">
                            <h2 className="section-title">🔗 Social Links</h2>
                            {!isEditingSocial && (
                                <button className="btn-icon" onClick={() => setIsEditingSocial(true)}>
                                    <Edit2 size={16} />
                                </button>
                            )}
                        </div>

                        {!isEditingSocial ? (
                            <div className="social-links-display">
                                {(socialInstagram || socialTwitter || socialLinkedin) ? (
                                    <div className="social-icons">
                                        {socialInstagram && (
                                            <a href={`https://instagram.com/${socialInstagram}`} target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                                                <Instagram size={20} />
                                                <span>@{socialInstagram}</span>
                                            </a>
                                        )}
                                        {socialTwitter && (
                                            <a href={`https://twitter.com/${socialTwitter}`} target="_blank" rel="noopener noreferrer" className="social-icon twitter">
                                                <Twitter size={20} />
                                                <span>@{socialTwitter}</span>
                                            </a>
                                        )}
                                        {socialLinkedin && (
                                            <a href={`https://linkedin.com/in/${socialLinkedin}`} target="_blank" rel="noopener noreferrer" className="social-icon linkedin">
                                                <Linkedin size={20} />
                                                <span>{socialLinkedin}</span>
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="empty-social">Belum ada social links. Klik edit untuk menambahkan.</p>
                                )}
                            </div>
                        ) : (
                            <div className="social-edit-form">
                                <div className="form-group">
                                    <label><Instagram size={16} /> Instagram username</label>
                                    <input
                                        type="text"
                                        value={socialInstagram}
                                        onChange={e => setSocialInstagram(e.target.value)}
                                        placeholder="username (tanpa @)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Twitter size={16} /> Twitter/X username</label>
                                    <input
                                        type="text"
                                        value={socialTwitter}
                                        onChange={e => setSocialTwitter(e.target.value)}
                                        placeholder="username (tanpa @)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Linkedin size={16} /> LinkedIn username</label>
                                    <input
                                        type="text"
                                        value={socialLinkedin}
                                        onChange={e => setSocialLinkedin(e.target.value)}
                                        placeholder="username"
                                    />
                                </div>
                                <div className="edit-actions">
                                    <button className="btn btn-secondary" onClick={() => setIsEditingSocial(false)}>
                                        <X size={16} /> Batal
                                    </button>
                                    <button className="btn btn-primary" onClick={saveSocialLinks}>
                                        <Check size={16} /> Simpan
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Activity Log Card */}
                    <div className="profile-section-card">
                        <h2 className="section-title">📅 Riwayat Aktivitas</h2>
                        {activityLogs.length > 0 ? (
                            <div className="activity-list">
                                {activityLogs.map(log => {
                                    const { icon, label } = formatActivityType(log.type);
                                    return (
                                        <div key={log.id} className="activity-item">
                                            <span className="activity-icon">{icon}</span>
                                            <div className="activity-content">
                                                <span className="activity-label">{label}</span>
                                                <span className="activity-desc">{log.description}</span>
                                            </div>
                                            <span className="activity-time">{formatTimestamp(log.timestamp)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="empty-activity">Belum ada aktivitas tercatat.</p>
                        )}
                    </div>

                    {/* Password Change Card */}
                    <div className="profile-section-card">
                        <h2 className="section-title">🔐 Keamanan Akun</h2>

                        {!showPasswordForm ? (
                            <button
                                className="btn btn-outline password-toggle-btn"
                                onClick={() => setShowPasswordForm(true)}
                            >
                                <Lock size={16} />
                                Ubah Password
                            </button>
                        ) : (
                            <div className="password-form">
                                <div className="password-requirements">
                                    <p>Password harus mengandung:</p>
                                    <ul>
                                        <li className={newPassword.length >= 8 ? 'valid' : ''}>Minimal 8 karakter</li>
                                        <li className={/[a-z]/.test(newPassword) ? 'valid' : ''}>Huruf kecil (a-z)</li>
                                        <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>Huruf besar (A-Z)</li>
                                        <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>Angka (0-9)</li>
                                    </ul>
                                </div>
                                <div className="form-group">
                                    <label>Password Lama</label>
                                    <div className="input-with-icon">
                                        <input
                                            type={showOldPass ? 'text' : 'password'}
                                            value={oldPassword}
                                            onChange={e => setOldPassword(e.target.value)}
                                            placeholder="Masukkan password lama"
                                        />
                                        <button
                                            type="button"
                                            className="icon-btn-sm"
                                            onClick={() => setShowOldPass(!showOldPass)}
                                        >
                                            {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Password Baru</label>
                                    <div className="input-with-icon">
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                        />
                                        <button
                                            type="button"
                                            className="icon-btn-sm"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                        >
                                            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Ketik ulang password baru"
                                    />
                                    {confirmPassword && newPassword && (
                                        <span className={`match-indicator ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
                                            {newPassword === confirmPassword ? <><Check size={14} /> Cocok</> : '❌ Tidak cocok'}
                                        </span>
                                    )}
                                </div>
                                <div className="password-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setOldPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleChangePassword}
                                        disabled={isChangingPassword}
                                    >
                                        {isChangingPassword ? 'Menyimpan...' : 'Simpan Password'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Kirim Feedback */}
                    <div className="profile-section-card">
                        <h2 className="section-title">📨 Kirim Feedback</h2>
                        <div className="feedback-type-select">
                            <label>Jenis Feedback</label>
                            <select
                                value={feedbackType}
                                onChange={(e) => setFeedbackType(e.target.value as 'saran' | 'kritik')}
                                className="feedback-dropdown"
                            >
                                <option value="saran">💡 Saran</option>
                                <option value="kritik">⚠️ Kritik</option>
                            </select>
                        </div>
                        <textarea
                            className="feedback-textarea"
                            placeholder={feedbackType === 'saran'
                                ? 'Tulis saran Anda untuk pengembangan aplikasi...'
                                : 'Tulis kritik Anda tentang masalah yang ditemukan...'}
                            value={feedbackMessage}
                            onChange={e => setFeedbackMessage(e.target.value)}
                        />
                        <button
                            className="btn btn-primary feedback-submit"
                            onClick={handleSubmitFeedback}
                            disabled={!feedbackMessage.trim()}
                        >
                            <Send size={16} />
                            Kirim Feedback
                        </button>
                    </div>

                    {/* Logout Button */}
                    <button className="btn btn-danger logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                        Keluar dari Akun
                    </button>
                </div>
            </main>
        </div>
    );
}
