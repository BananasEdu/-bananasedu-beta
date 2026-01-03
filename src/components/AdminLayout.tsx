import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Database,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Sun,
    Moon
} from 'lucide-react';
import './AdminLayout.css';

interface AdminLayoutProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

// Mock admin user
const adminUser = {
    name: 'Admin Utama',
    role: 'Super Admin',
    avatar: '👤'
};

const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/kelola-data', icon: Database, label: 'Kelola Data' },
    { path: '/admin/log-activity', icon: FileText, label: 'Log Aktifitas' },
    { path: '/admin/settings', icon: Settings, label: 'Pengaturan' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ theme, onToggleTheme }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string, exact?: boolean) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className={`admin-layout ${theme} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            {/* Mobile Menu Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <Link to="/admin" className="admin-logo">
                        <span className="logo-icon">🍌</span>
                        {!isSidebarCollapsed && (
                            <div className="logo-text">
                                <span className="logo-name">BananasEdu</span>
                                <span className="logo-badge">ADMIN</span>
                            </div>
                        )}
                    </Link>
                    <button
                        className="collapse-btn"
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* User Info */}
                <div className="sidebar-user">
                    <div className="user-avatar">{adminUser.avatar}</div>
                    {!isSidebarCollapsed && (
                        <div className="user-info">
                            <span className="user-name">{adminUser.name}</span>
                            <span className="user-role">{adminUser.role}</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <item.icon size={20} />
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="admin-main">
                {/* Header with Theme Toggle */}
                <div className="admin-header">
                    <div className="header-spacer"></div>
                    <button
                        className="theme-toggle-btn"
                        onClick={onToggleTheme}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
                <div className="admin-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
