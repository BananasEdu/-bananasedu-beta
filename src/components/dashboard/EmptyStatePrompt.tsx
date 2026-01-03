
import React, { useState, useEffect } from 'react';
import { Upload, ChevronRight, Calendar, Megaphone, Pin } from 'lucide-react';
import './EmptyStatePrompt.css';

interface Announcement {
    id: string;
    title: string;
    date?: string;
}

interface EmptyStatePromptProps {
    onUpload: () => void;
    snbpDeadline?: Date;
    announcements?: Announcement[];
}

const EmptyStatePrompt: React.FC<EmptyStatePromptProps> = ({
    onUpload,
    snbpDeadline = new Date('2025-04-15'),
    announcements = [
        { id: '1', title: 'Event Validasi Semester Ganjil dimulai', date: '20 Des 2024' },
        { id: '2', title: 'Ranking nonaktif sampai 100% tervalidasi' }
    ]
}) => {
    // Live countdown state
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Calculate and update countdown every second
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = snbpDeadline.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / (1000 * 60)) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [snbpDeadline]);

    // Urgency status
    const getUrgencyClass = () => {
        if (timeLeft.days > 30) return 'normal';
        if (timeLeft.days >= 7) return 'warning';
        return 'danger';
    };

    return (
        <div className="empty-state-container">
            {/* Main CTA Card */}
            <div className="empty-state-card animate-enter">
                <div className="empty-content">
                    <div className="empty-icon-wrapper">
                        <Upload size={32} className="empty-icon" />
                    </div>

                    <h2 className="empty-title">KAMU BELUM MENGINPUT NILAI RAPOR</h2>

                    <div className="empty-divider"></div>

                    <p className="empty-description">
                        Input nilai rapor untuk membuka akses fitur premium:
                    </p>

                    <ul className="empty-features">
                        <li>
                            <span className="check-icon">✓</span>
                            Rata-rata nilai dan kalkulasi Grade otomatis
                        </li>
                        <li>
                            <span className="check-icon">✓</span>
                            Posisi peringkatmu di tingkat & jurusan
                        </li>
                        <li>
                            <span className="check-icon">✓</span>
                            Grafik tren perkembangan nilai (S1-S5)
                        </li>
                    </ul>

                    <button className="btn btn-primary btn-lg empty-action-btn" onClick={onUpload}>
                        <Upload size={20} />
                        INPUT NILAI SEKARANG
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Background decoration */}
                <div className="empty-bg-pattern"></div>
            </div>

            {/* Bottom Info Cards */}
            <div className="empty-info-row">
                {/* Countdown SNBP */}
                <div className={`empty-info-card countdown-card ${getUrgencyClass()}`}>
                    <div className="info-card-header">
                        <Calendar size={18} />
                        <span>COUNTDOWN SNBP</span>
                    </div>
                    <div className="countdown-display">
                        <div className="countdown-segment">
                            <span className="countdown-num">{timeLeft.days}</span>
                            <span className="countdown-label">hari</span>
                        </div>
                        <span className="countdown-sep">:</span>
                        <div className="countdown-segment">
                            <span className="countdown-num">{timeLeft.hours.toString().padStart(2, '0')}</span>
                            <span className="countdown-label">jam</span>
                        </div>
                        <span className="countdown-sep">:</span>
                        <div className="countdown-segment">
                            <span className="countdown-num">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                            <span className="countdown-label">menit</span>
                        </div>
                        <span className="countdown-sep">:</span>
                        <div className="countdown-segment">
                            <span className="countdown-num">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                            <span className="countdown-label">detik</span>
                        </div>
                    </div>
                    <div className="countdown-subtitle">Pendaftaran SNBP</div>
                </div>

                {/* Pengumuman */}
                <div className="empty-info-card announcement-card">
                    <div className="info-card-header">
                        <Megaphone size={18} />
                        <span>PENGUMUMAN</span>
                    </div>
                    <div className="announcement-list">
                        {announcements.map(ann => (
                            <div key={ann.id} className="announcement-item">
                                <Pin size={14} className="pin-icon" />
                                <span>{ann.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyStatePrompt;

