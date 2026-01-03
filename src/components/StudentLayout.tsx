
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, LayoutDashboard, FileText, User, Trophy } from 'lucide-react';
import './StudentLayout.css';

import { useAuth } from '../context/AuthContext';

interface StudentLayoutProps {
    theme: 'light' | 'dark';
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ theme }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        // Clear session logic here if needed
        navigate('/login');
    };

    return (
        <div className={`student-layout ${theme}`}>
            {/* Combined Header with Navigation */}
            <header className="top-bar">
                <div className="container top-bar-content">
                    {/* Logo */}
                    <Link to="/dashboard" className="logo">
                        <span className="logo-icon">🍌</span>
                        <span className="logo-text">BananasEdu</span>
                        <span className="beta-badge">Beta</span>
                    </Link>

                    {/* Navigation - Now in Header */}
                    <nav className="main-nav">
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/e-rapor" className={`nav-link ${isActive('/e-rapor') ? 'active' : ''}`}>
                            <FileText size={18} />
                            <span>E-Rapor</span>
                        </Link>
                        <Link to="/peringkat" className={`nav-link ${isActive('/peringkat') ? 'active' : ''}`}>
                            <Trophy size={18} />
                            <span>Peringkat</span>
                        </Link>
                        <Link to="/profil" className={`nav-link ${isActive('/profil') ? 'active' : ''}`}>
                            <User size={18} />
                            <span>Profil</span>
                        </Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}>
                                <span className="admin-icon">👑</span>
                                <span>Admin</span>
                            </Link>
                        )}
                    </nav>

                    {/* Actions */}
                    <div className="top-actions">
                        <div className="notification-wrapper">
                            <span className="notification-badge">3</span>
                            <button className="icon-btn">
                                <Bell size={20} />
                            </button>
                        </div>
                        <button className="icon-btn" onClick={handleLogout}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <div className="container">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="mobile-bottom-nav">
                <Link to="/dashboard" className={`bottom-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                    <LayoutDashboard size={22} />
                    <span>Home</span>
                </Link>
                <Link to="/e-rapor" className={`bottom-nav-item ${isActive('/e-rapor') ? 'active' : ''}`}>
                    <FileText size={22} />
                    <span>E-Rapor</span>
                </Link>
                <Link to="/peringkat" className={`bottom-nav-item ${isActive('/peringkat') ? 'active' : ''}`}>
                    <Trophy size={22} />
                    <span>Ranking</span>
                </Link>
                <Link to="/profil" className={`bottom-nav-item ${isActive('/profil') ? 'active' : ''}`}>
                    <User size={22} />
                    <span>Profil</span>
                </Link>
            </nav>
        </div>
    );
};

export default StudentLayout;
