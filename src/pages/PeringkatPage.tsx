import React from 'react';
import { Trophy, BarChart3, Users, Medal, Star } from 'lucide-react';
import './PeringkatPage.css';

const PeringkatPage: React.FC = () => {
    return (
        <div className="peringkat-page">
            <div className="peringkat-container">
                {/* Empty State Section */}
                <div className="empty-state-section">
                    <div className="empty-icon-wrapper">
                        <div className="icon-glow"></div>
                        <Trophy size={64} className="trophy-icon" />
                    </div>
                    <h1 className="empty-title">Fitur ini tidak tersedia untuk versi beta</h1>
                    <p className="empty-subtitle">
                        Fitur Peringkat akan hadir di versi penuh BananasEdu
                    </p>
                </div>

                {/* Feature Info Card */}
                <div className="feature-info-card">
                    <div className="card-header">
                        <Star className="card-icon" size={24} />
                        <h2>Tentang Fitur Peringkat</h2>
                    </div>
                    <div className="card-content">
                        <p className="card-description">
                            Fitur Peringkat adalah fitur unggulan BananasEdu yang memungkinkan siswa
                            untuk melihat posisi akademik mereka dibandingkan dengan siswa lain.
                        </p>

                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon-wrap">
                                    <BarChart3 size={20} />
                                </div>
                                <div className="feature-text">
                                    <h3>Statistik Lengkap</h3>
                                    <p>Lihat statistik nilai rata-rata, tren, dan perbandingan dengan rata-rata kelas</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon-wrap">
                                    <Users size={20} />
                                </div>
                                <div className="feature-text">
                                    <h3>Peringkat Kelas</h3>
                                    <p>Ketahui posisimu di kelas dan lihat siapa siswa berprestasi lainnya</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon-wrap">
                                    <Medal size={20} />
                                </div>
                                <div className="feature-text">
                                    <h3>Leaderboard Sekolah</h3>
                                    <p>Bersaing dengan seluruh siswa di sekolah dalam leaderboard interaktif</p>
                                </div>
                            </div>
                        </div>

                        <div className="coming-soon-badge">
                            <span className="badge-icon">🚀</span>
                            <span>Segera Hadir di Versi Penuh</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PeringkatPage;
