
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ERaporPage from './pages/ERaporPage';
import ProfilPage from './pages/ProfilPage';
import PeringkatPage from './pages/PeringkatPage';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import KelolaDataPage from './pages/admin/KelolaDataPage';
import LogActivityPage from './pages/admin/LogActivityPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import './App.css';

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    // Toggle Theme
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Apply theme to body
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);



    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Student Routes */}
                    <Route element={<StudentLayout theme={theme} />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/e-rapor" element={<ERaporPage />} />
                        <Route path="/peringkat" element={<PeringkatPage />} />
                        <Route path="/profil" element={<ProfilPage />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<AdminLayout theme={theme} onToggleTheme={toggleTheme} />}>
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="/admin/kelola-data" element={<KelolaDataPage />} />
                        <Route path="/admin/log-activity" element={<LogActivityPage />} />
                        <Route path="/admin/settings" element={<AdminSettingsPage />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
