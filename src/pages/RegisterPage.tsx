import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowLeft, ArrowRight, UserPlus, School, GraduationCap, BookOpen, Check } from 'lucide-react';
import { register as registerApi } from '../lib/authApi';
import './LoginPage.css';
import './RegisterPage.css';

// School level options
const schoolLevels = [
    { value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)' },
    { value: 'MTs', label: 'MTs (Madrasah Tsanawiyah)' },
    { value: 'SMA', label: 'SMA (Sekolah Menengah Atas)' },
    { value: 'SMK', label: 'SMK (Sekolah Menengah Kejuruan)' },
    { value: 'MA', label: 'MA (Madrasah Aliyah)' },
    { value: 'MAK', label: 'MAK (Madrasah Aliyah Kejuruan)' },
];

// School status options
const schoolStatusOptions = [
    { value: 'Negeri', label: 'Negeri' },
    { value: 'Swasta', label: 'Swasta' },
];

// Class level options based on school level
const getClassLevels = (schoolLevel: string) => {
    if (['SD', 'MI'].includes(schoolLevel)) {
        return [
            { value: '1', label: 'Kelas 1' },
            { value: '2', label: 'Kelas 2' },
            { value: '3', label: 'Kelas 3' },
            { value: '4', label: 'Kelas 4' },
            { value: '5', label: 'Kelas 5' },
            { value: '6', label: 'Kelas 6' },
        ];
    } else if (['SMP', 'MTs'].includes(schoolLevel)) {
        return [
            { value: '7', label: 'Kelas 7' },
            { value: '8', label: 'Kelas 8' },
            { value: '9', label: 'Kelas 9' },
        ];
    } else {
        return [
            { value: '10', label: 'Kelas 10' },
            { value: '11', label: 'Kelas 11' },
            { value: '12', label: 'Kelas 12' },
        ];
    }
};

// Check if school is SMA/SMK/MA/MAK
const isSMALevel = (schoolLevel: string) => ['SMA', 'SMK', 'MA', 'MAK'].includes(schoolLevel);

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    // Step state (1, 2, or 3)
    const [step, setStep] = useState(1);

    // Form data
    const [formData, setFormData] = useState({
        // Step 1
        schoolLevel: '',
        schoolStatus: '',
        schoolName: '',
        // Step 2
        classLevel: '',
        major: '', // jurusan/peminatan (only for SMA/SMK/MA/MAK)
        className: '',
        // Step 3
        username: '',
        fullName: '',
        password: '',
        confirmPassword: ''
    });

    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Handle input change with auto-uppercase for specific fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Auto uppercase for specific fields
        const uppercaseFields = ['schoolName', 'className', 'major', 'fullName'];
        const finalValue = uppercaseFields.includes(name) ? value.toUpperCase() : value;

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        setError('');
    };

    // Password validation
    const validatePassword = (password: string): { valid: boolean; message: string } => {
        if (password.length < 8) {
            return { valid: false, message: 'Password minimal 8 karakter' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Password harus mengandung huruf besar' };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'Password harus mengandung huruf kecil' };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'Password harus mengandung angka' };
        }
        return { valid: true, message: '' };
    };

    // Step 1 validation
    const validateStep1 = (): boolean => {
        if (!formData.schoolLevel) {
            setError('Pilih tingkat sekolah');
            return false;
        }
        if (!formData.schoolStatus) {
            setError('Pilih status sekolah');
            return false;
        }
        if (!formData.schoolName.trim()) {
            setError('Nama sekolah tidak boleh kosong');
            return false;
        }
        if (formData.schoolName.length < 5) {
            setError('Nama sekolah terlalu pendek');
            return false;
        }
        return true;
    };

    // Step 2 validation
    const validateStep2 = (): boolean => {
        if (!formData.classLevel) {
            setError('Pilih tingkat kelas');
            return false;
        }
        if (isSMALevel(formData.schoolLevel) && !formData.major.trim()) {
            setError('Jurusan/Peminatan tidak boleh kosong');
            return false;
        }
        if (!formData.className.trim()) {
            setError('Nama kelas tidak boleh kosong');
            return false;
        }
        return true;
    };

    // Step 3 validation
    const validateStep3 = (): boolean => {
        // Validate username
        if (!formData.username.trim()) {
            setError('Username tidak boleh kosong');
            return false;
        }
        if (formData.username.length < 4) {
            setError('Username minimal 4 karakter');
            return false;
        }
        if (!/^[a-z0-9_]+$/.test(formData.username)) {
            setError('Username hanya boleh huruf kecil, angka, dan underscore');
            return false;
        }

        if (!formData.fullName.trim()) {
            setError('Nama lengkap tidak boleh kosong');
            return false;
        }
        if (formData.fullName.length < 3) {
            setError('Nama lengkap terlalu pendek');
            return false;
        }
        const passwordCheck = validatePassword(formData.password);
        if (!passwordCheck.valid) {
            setError(passwordCheck.message);
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Konfirmasi password tidak cocok');
            return false;
        }
        return true;
    };

    // Handle next step
    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    // Handle previous step
    const handlePrev = () => {
        setError('');
        if (step > 1) setStep(step - 1);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateStep3()) return;

        setIsLoading(true);

        try {
            // Call register API
            const result = await registerApi({
                username: formData.username,
                fullName: formData.fullName,
                password: formData.password,
                schoolLevel: formData.schoolLevel,
                schoolStatus: formData.schoolStatus,
                schoolName: formData.schoolName,
                classLevel: formData.classLevel,
                major: formData.major || undefined,
                className: formData.className,
            });

            if (result.success) {
                setSuccess(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.error || 'Registrasi gagal');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registrasi gagal. Coba lagi nanti.';
            setError(message);
        }

        setIsLoading(false);
    };

    // Get class name placeholder based on school level
    const getClassNamePlaceholder = () => {
        if (['SD', 'MI'].includes(formData.schoolLevel)) {
            return 'Contoh: 1-A, V-1, IV-C, 5-1';
        } else if (['SMP', 'MTs'].includes(formData.schoolLevel)) {
            return 'Contoh: 7-A, VII-1, IX-C, 8-1';
        } else {
            return 'Contoh: 10 IPAS 1, XI IPS 3, XII IPA 2';
        }
    };

    // Success message
    if (success) {
        return (
            <div className="login-page">
                <div className="login-bg">
                    <div className="bg-gradient"></div>
                    <div className="bg-pattern"></div>
                </div>
                <div className="login-card animate-fadeIn">
                    <div className="login-form sent-form">
                        <div className="form-header">
                            <div className="success-icon">
                                <Check size={48} />
                            </div>
                            <h1 className="logo-text">REGISTRASI BERHASIL!</h1>
                            <p className="description">
                                Akun kamu sudah terdaftar. Silakan login dengan username dan password yang sudah dibuat.
                            </p>
                        </div>
                        <div className="form-body sent-actions">
                            <Link to="/login" className="btn-login">
                                <ArrowLeft size={18} /> Ke Halaman Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            {/* Animated Background */}
            <div className="login-bg">
                <div className="bg-gradient"></div>
                <div className="bg-pattern"></div>
                <div className="floating-shapes">
                    <div className="shape shape-1">🍌</div>
                    <div className="shape shape-2">📚</div>
                    <div className="shape shape-3">🎓</div>
                    <div className="shape shape-4">✨</div>
                </div>
            </div>

            {/* Form Container */}
            <div className="login-card animate-fadeIn">
                <form className="login-form register-form" onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="form-header">
                        <div className="logo-icon">🍌</div>
                        <h1 className="logo-text">DAFTAR AKUN</h1>
                        <p className="subtitle">BananasEdu Beta</p>

                        {/* Step Indicator */}
                        <div className="step-indicator">
                            <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                                <span>1</span>
                            </div>
                            <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
                            <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                                <span>2</span>
                            </div>
                            <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
                            <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>
                                <span>3</span>
                            </div>
                        </div>
                        <p className="step-label">
                            {step === 1 && 'Data Sekolah'}
                            {step === 2 && 'Data Kelas'}
                            {step === 3 && 'Akun & Password'}
                        </p>
                    </div>

                    <div className="form-body">
                        {error && (
                            <div className="error-message animate-shake">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* STEP 1: School Data */}
                        {step === 1 && (
                            <div className="step-content">
                                <div className="input-group">
                                    <label htmlFor="schoolLevel">
                                        <School size={16} /> Tingkat Sekolah <span className="required">*</span>
                                    </label>
                                    <select
                                        id="schoolLevel"
                                        name="schoolLevel"
                                        value={formData.schoolLevel}
                                        onChange={handleChange}
                                        className="select-input"
                                    >
                                        <option value="">-- Pilih Tingkat Sekolah --</option>
                                        {schoolLevels.map(level => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="schoolStatus">
                                        <School size={16} /> Status Sekolah <span className="required">*</span>
                                    </label>
                                    <select
                                        id="schoolStatus"
                                        name="schoolStatus"
                                        value={formData.schoolStatus}
                                        onChange={handleChange}
                                        className="select-input"
                                    >
                                        <option value="">-- Pilih Status Sekolah --</option>
                                        {schoolStatusOptions.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="schoolName">
                                        <BookOpen size={16} /> Nama Sekolah <span className="required">*</span>
                                    </label>
                                    <input
                                        id="schoolName"
                                        name="schoolName"
                                        type="text"
                                        placeholder="Contoh: SMA NEGERI 1 AFRIKA"
                                        value={formData.schoolName}
                                        onChange={handleChange}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    <span className="input-hint">Gunakan HURUF KAPITAL</span>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Class Data */}
                        {step === 2 && (
                            <div className="step-content">
                                <div className="input-group">
                                    <label htmlFor="classLevel">
                                        <GraduationCap size={16} /> Tingkat Kelas <span className="required">*</span>
                                    </label>
                                    <select
                                        id="classLevel"
                                        name="classLevel"
                                        value={formData.classLevel}
                                        onChange={handleChange}
                                        className="select-input"
                                    >
                                        <option value="">-- Pilih Tingkat Kelas --</option>
                                        {getClassLevels(formData.schoolLevel).map(level => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Major field (only for SMA/SMK/MA) */}
                                {isSMALevel(formData.schoolLevel) && (
                                    <div className="input-group">
                                        <label htmlFor="major">
                                            <BookOpen size={16} /> Jurusan/Peminatan <span className="required">*</span>
                                        </label>
                                        <input
                                            id="major"
                                            name="major"
                                            type="text"
                                            placeholder={formData.classLevel === '10' ? 'Isi IPAS untuk kelas 10' : 'Contoh: IPA, IPS, MIPA, SOSHUM'}
                                            value={formData.major}
                                            onChange={handleChange}
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                        {formData.classLevel === '10' && (
                                            <span className="input-hint">Kelas 10 SMA/MA yang belum ada peminatan, isi IPAS</span>
                                        )}
                                    </div>
                                )}

                                <div className="input-group">
                                    <label htmlFor="className">
                                        <BookOpen size={16} /> Nama Kelas <span className="required">*</span>
                                    </label>
                                    <input
                                        id="className"
                                        name="className"
                                        type="text"
                                        placeholder={getClassNamePlaceholder()}
                                        value={formData.className}
                                        onChange={handleChange}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    <span className="input-hint">Gunakan HURUF KAPITAL</span>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Account Data */}
                        {step === 3 && (
                            <div className="step-content">
                                <div className="input-group">
                                    <label htmlFor="username">
                                        <User size={16} /> Username <span className="required">*</span>
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Contoh: john_doe123"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    />
                                    <span className="input-hint">Huruf kecil, angka, dan underscore saja. Minimal 4 karakter.</span>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="fullName">
                                        <User size={16} /> Nama Lengkap <span className="required">*</span>
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        placeholder="Masukkan nama lengkap"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    <span className="input-hint">Gunakan HURUF KAPITAL</span>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="password">
                                        <Lock size={16} /> Password <span className="required">*</span>
                                    </label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Minimal 8 karakter"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div className="password-requirements">
                                        <span className={formData.password.length >= 8 ? 'valid' : ''}>
                                            ✓ Min 8 karakter
                                        </span>
                                        <span className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                                            ✓ Huruf besar
                                        </span>
                                        <span className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                                            ✓ Huruf kecil
                                        </span>
                                        <span className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                                            ✓ Angka
                                        </span>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="confirmPassword">
                                        <Lock size={16} /> Konfirmasi Password <span className="required">*</span>
                                    </label>
                                    <div className="password-input-wrapper">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Ulangi password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && (
                                        <span className={`match-indicator ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                                            {formData.password === formData.confirmPassword ? '✓ Password cocok' : '✗ Password tidak cocok'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="step-navigation">
                            {step > 1 && (
                                <button type="button" className="btn-nav btn-prev" onClick={handlePrev}>
                                    <ArrowLeft size={18} /> Kembali
                                </button>
                            )}

                            {step < 3 ? (
                                <button type="button" className="btn-nav btn-next" onClick={handleNext}>
                                    Lanjut <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button type="submit" className="btn-login" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="loading-spinner"></span>
                                    ) : (
                                        <>
                                            <UserPlus size={18} /> DAFTAR
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <p className="register-link">
                            Sudah punya akun? <Link to="/login">Login di sini</Link>
                        </p>
                    </div>

                    <Link to="/" className="back-link">
                        <ArrowLeft size={16} /> Kembali ke Beranda
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
