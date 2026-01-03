
import React, { useState } from 'react';
import { X, Check, Sun, Moon, Download, Instagram, MessageCircle, Copy } from 'lucide-react';
import type { StudentRank } from '../data/mockPeringkatData';
import './ShareModal.css';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    userData: StudentRank;
    totalStudents: number;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, userData, totalStudents }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    if (!isOpen) return null;

    return (
        <div className="share-modal-overlay animate-fadeIn">
            <div className="share-modal-content animate-scaleIn">
                <button className="share-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <h2 className="share-title">📤 Share Ranking</h2>

                {/* Preview Card */}
                <div className={`share-preview-card theme-${theme}`}>
                    <div className="share-card-header">
                        <div className="share-app-name">🍌 BananasEdu</div>
                        <div className="share-card-label">RANKING REPORT</div>
                    </div>

                    <div className="share-card-body">
                        <div className="share-rank-badge">
                            <span className="share-trophy">🏆</span>
                            <span className="share-rank-number">#{userData.rank}</span>
                        </div>
                        <div className="share-rank-total">
                            dari {totalStudents} siswa
                        </div>
                        <div className="share-percentile">
                            Top 6%
                        </div>
                    </div>

                    <div className="share-card-footer">
                        <div className="share-stat-row">
                            <span className="share-stat-label">Tingkat</span>
                            <span className="share-stat-value">XII</span>
                        </div>
                        <div className="share-stat-row">
                            <span className="share-stat-label">Rata-rata</span>
                            <span className="share-stat-value">{userData.average} ({userData.grade})</span>
                        </div>
                        <div className="share-stat-row">
                            <span className="share-stat-label">Trend</span>
                            <span className="share-stat-value trend-positive">▲ Naik {userData.change} posisi</span>
                        </div>

                        <div className="share-motivation">
                            TERUS BERJUANG MENUJU PTN IMPIAN!
                        </div>
                    </div>
                </div>

                {/* Theme Selector */}
                <div className="share-controls">
                    <label className="text-sm font-semibold text-secondary mb-2 block">Pilih Tema</label>
                    <div className="theme-selector">
                        <button
                            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => setTheme('light')}
                        >
                            <Sun size={16} /> Light
                            {theme === 'light' && <Check size={16} className="ml-auto" />}
                        </button>
                        <button
                            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => setTheme('dark')}
                        >
                            <Moon size={16} /> Dark
                            {theme === 'dark' && <Check size={16} className="ml-auto" />}
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="share-actions">
                    <button className="btn btn-primary w-full flex items-center justify-center gap-2">
                        <Download size={18} /> Simpan PNG
                    </button>
                    <div className="flex gap-2 w-full">
                        <button className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
                            <Instagram size={18} /> Story
                        </button>
                        <button className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
                            <MessageCircle size={18} /> WA
                        </button>
                    </div>
                    <button className="btn-text text-sm flex items-center justify-center gap-2 text-primary">
                        <Copy size={14} /> Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
