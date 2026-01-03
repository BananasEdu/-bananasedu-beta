
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail, ArrowLeft, Send, CheckCircle, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

type ViewState = 'login' | 'forgot' | 'sent';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // View state
    const [view, setView] = useState<ViewState>('login');

    // Login form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Forgot password state
    const [email, setEmail] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');

    // Error/Loading state
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    // Validation
    const validateLogin = (): boolean => {
        if (!username.trim()) {
            setError('Username tidak boleh kosong');
            return false;
        }
        if (!password.trim()) {
            setError('Password tidak boleh kosong');
            return false;
        }
        return true;
    };

    const validateEmail = (emailStr: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailStr);
    };

    // Login handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLocked) {
            setError('Terlalu banyak percobaan. Coba lagi dalam 5 menit');
            return;
        }

        if (!validateLogin()) return;

        setIsLoading(true);

        try {
            const result = await login(username, password);

            if (result.success && result.user) {
                // Redirect based on role
                if (result.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                // Failed login
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);

                if (newAttempts >= 5) {
                    setIsLocked(true);
                    setError('Akun terkunci. Coba lagi dalam 5 menit');
                    setTimeout(() => {
                        setIsLocked(false);
                        setAttempts(0);
                    }, 5 * 60 * 1000);
                } else {
                    setError(result.error || 'Username atau password salah');
                }
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Koneksi gagal. Coba lagi nanti.';
            setError(message);
        }

        setIsLoading(false);
    };

    // Forgot password handler
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email tidak boleh kosong');
            return;
        }

        if (!validateEmail(email)) {
            setError('Format email tidak valid');
            return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mask email for display
        const [localPart, domain] = email.split('@');
        const masked = localPart.slice(0, 3) + '***@' + domain;
        setMaskedEmail(masked);

        setView('sent');
        setIsLoading(false);
    };

    // Render Login Form
    const renderLoginForm = () => (
        <form className="login-form" onSubmit={handleLogin}>
            <div className="form-header">
                <div className="logo-icon">🍌</div>
                <h1 className="logo-text">BANANASEDU</h1>
                <p className="subtitle">Selamat datang kembali!</p>
                <p className="description">Masuk untuk memantau nilai rapor kamu</p>
            </div>

            <div className="form-body">
                {error && (
                    <div className="error-message animate-shake">
                        ⚠️ {error}
                    </div>
                )}

                <div className="input-group">
                    <label htmlFor="username">
                        <User size={16} /> Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Masukkan username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        disabled={isLoading}
                        autoComplete="username"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">
                        <Lock size={16} /> Password
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Masukkan password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            autoComplete="current-password"
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
                </div>

                <div className="form-options">
                    <label className="remember-me">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Ingat saya
                    </label>
                </div>

                <button
                    type="submit"
                    className="btn-login"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        <>
                            <Rocket size={18} /> LOGIN
                        </>
                    )}
                </button>

                <p className="register-link">
                    Belum punya akun? <Link to="/register">Daftar di sini</Link>
                </p>
            </div>

            <Link to="/" className="back-link">
                <ArrowLeft size={16} /> Kembali ke Beranda
            </Link>
        </form >
    );

    // Render Forgot Password Form
    const renderForgotForm = () => (
        <form className="login-form forgot-form" onSubmit={handleForgotPassword}>
            <div className="form-header">
                <div className="logo-icon">🔑</div>
                <h1 className="logo-text">LUPA PASSWORD</h1>
                <p className="description">Masukkan email terdaftar untuk reset password</p>
            </div>

            <div className="form-body">
                {error && (
                    <div className="error-message animate-shake">
                        ⚠️ {error}
                    </div>
                )}

                <div className="input-group">
                    <label htmlFor="email">
                        <Mail size={16} /> Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Masukkan email terdaftar..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        autoComplete="email"
                    />
                </div>

                <button
                    type="submit"
                    className="btn-login"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="loading-spinner"></span>
                    ) : (
                        <>
                            <Send size={18} /> KIRIM LINK RESET
                        </>
                    )}
                </button>
            </div>

            <button
                type="button"
                className="back-link"
                onClick={() => { setView('login'); setError(''); }}
            >
                <ArrowLeft size={16} /> Kembali ke Login
            </button>
        </form>
    );

    // Render Email Sent Confirmation
    const renderSentConfirmation = () => (
        <div className="login-form sent-form">
            <div className="form-header">
                <div className="success-icon">
                    <CheckCircle size={48} />
                </div>
                <h1 className="logo-text">EMAIL TERKIRIM!</h1>
                <p className="description">
                    Link reset password sudah dikirim ke:
                </p>
                <p className="masked-email">{maskedEmail}</p>
                <p className="info-text">
                    Cek inbox atau folder spam. Link kadaluarsa dalam 24 jam.
                </p>
            </div>

            <div className="form-body sent-actions">
                <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-login btn-secondary"
                >
                    <Mail size={18} /> Buka Email
                </a>
                <button
                    type="button"
                    className="back-link"
                    onClick={() => { setView('login'); setEmail(''); }}
                >
                    <ArrowLeft size={16} /> Kembali ke Login
                </button>
            </div>
        </div>
    );

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
                {view === 'login' && renderLoginForm()}
                {view === 'forgot' && renderForgotForm()}
                {view === 'sent' && renderSentConfirmation()}
            </div>
        </div>
    );
};

export default LoginPage;
