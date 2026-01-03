
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trophy, Grid3X3, User, Share2, Calculator } from 'lucide-react';
import './QuickActions.css';

interface QuickActionsProps {
    onShare?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onShare }) => {
    const navigate = useNavigate();

    const actions = [
        { icon: FileText, label: 'E-Rapor', path: '/e-rapor', color: '#a855f7' },
        { icon: Trophy, label: 'Ranking', path: '/peringkat', color: '#fbbf24' },
        { icon: Grid3X3, label: 'Grid', path: '/e-rapor', color: '#ec4899' },
        { icon: User, label: 'Profil', path: '/profil', color: '#4ade80' },
        { icon: Share2, label: 'Share', onClick: onShare, color: '#06b6d4' },
        { icon: Calculator, label: 'Flexi', path: '/e-rapor', color: '#f97316' },
    ];

    const handleClick = (action: typeof actions[0]) => {
        if (action.onClick) {
            action.onClick();
        } else if (action.path) {
            navigate(action.path);
        }
    };

    return (
        <div className="quick-actions-grid">
            {actions.map((action, i) => (
                <button
                    key={i}
                    className="quick-action-btn"
                    onClick={() => handleClick(action)}
                    style={{ '--action-color': action.color } as React.CSSProperties}
                >
                    <action.icon size={20} />
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;
