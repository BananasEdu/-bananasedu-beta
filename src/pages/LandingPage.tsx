
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import './LandingPage.css';

// Feature Data for Bento Grid
const features = [
    {
        emoji: '📝',
        title: 'E-Rapor Digital',
        description: 'Upload foto rapor, nilai dikenali AI secara otomatis dan tersimpan aman',
        size: 'large'
    },
    {
        emoji: '🧮',
        title: 'Flexi-Calc',
        description: 'Simulasi nilai target untuk semester berikutnya dan prediksi SNBP',
        size: 'large'
    },
    {
        emoji: '🏆',
        title: 'Peringkat',
        description: 'Lihat ranking vs siswa lain secara real-time',
        size: 'large'
    },
    {
        emoji: '📊',
        title: 'Analisis',
        description: 'Grafik tren nilai dari semester ke semester',
        size: 'large'
    }
];

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="landing-page">
            {/* Animated Background */}
            <div className="landing-bg">
                <div className="bg-gradient"></div>
                <div className="bg-pattern"></div>
            </div>

            {/* Header */}
            <header className="landing-header">
                <div className="container header-content">
                    <Link to="/" className="logo">
                        <span className="logo-icon">🍌</span>
                        <span className="logo-text">BananasEdu</span>
                        <span className="beta-badge">Beta</span>
                    </Link>

                    <div className="header-actions">
                        <Link to="/register" className="btn-register-header">
                            DAFTAR
                        </Link>
                        <Link to="/login" className="btn-login-header">
                            MASUK <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content animate-fadeIn">
                        <div className="hero-banana-icon">🍌</div>
                        <h1 className="hero-title">
                            Pantau Nilai Rapor,<br />
                            <span className="highlight">Raih Sekolah/PTN Impian!</span>
                        </h1>
                        <p className="hero-subtitle">
                            Platform digital untuk membantu siswa SD/SMP/SMA<br />
                            memantau nilai rapor, melihat peringkat,<br />
                            dan merencanakan langkah menuju sekolah impian.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-hero btn-yellow" onClick={handleLogin}>
                                MASUK <ArrowRight size={18} />
                            </button>
                            <button className="btn-hero btn-white" onClick={() => navigate('/register')}>
                                DAFTAR SEKARANG
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Bento Grid */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">
                        <span className="emoji">✨</span> FITUR UNGGULAN
                    </h2>
                    <div className="bento-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`bento-card bento-${feature.size}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="bento-icon">{feature.emoji}</div>
                                <h3 className="bento-title">{feature.title}</h3>
                                <p className="bento-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2 className="cta-title">Siap pantau nilai dan raih PTN impian?</h2>
                        <p className="cta-subtitle">Bergabung dengan ribuan siswa yang sudah menggunakan BananasEdu</p>
                        <div className="hero-buttons">
                            <button className="btn-hero btn-yellow" onClick={handleLogin}>
                                MASUK <ArrowRight size={18} />
                            </button>
                            <button className="btn-hero btn-white" onClick={() => navigate('/register')}>
                                DAFTAR SEKARANG
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container footer-content">
                    <div className="footer-left">
                        <div className="logo">
                            <span className="logo-icon">🍌</span>
                            <span className="logo-text">BananasEdu</span>
                        </div>
                        <p className="copyright">© 2026 BananasEdu. All rights reserved.</p>
                    </div>
                    <div className="footer-right">
                        <a href="mailto:bananas.edu95@gmail.com" className="contact-link">
                            <Mail size={16} /> bananas.edu95@gmail.com
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
