// Activity Logger Utility for BananasEdu
// Stores activity log in localStorage

export interface ActivityLog {
    id: string;
    type: 'LOGIN' | 'LOGOUT' | 'GRADE_UPDATE' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'EXPORT_DATA';
    description: string;
    timestamp: string;
    userId?: string;
}

const STORAGE_KEY = 'bananasedu_activity_log';
const MAX_LOGS = 50; // Keep last 50 activities

export function logActivity(
    type: ActivityLog['type'],
    description: string,
    userId?: string
): void {
    try {
        const logs = getActivityLogs();

        const newLog: ActivityLog = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            description,
            timestamp: new Date().toISOString(),
            userId
        };

        // Add to beginning of array
        logs.unshift(newLog);

        // Keep only last MAX_LOGS
        if (logs.length > MAX_LOGS) {
            logs.splice(MAX_LOGS);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
}

export function getActivityLogs(limit?: number): ActivityLog[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const logs: ActivityLog[] = stored ? JSON.parse(stored) : [];
        return limit ? logs.slice(0, limit) : logs;
    } catch {
        return [];
    }
}

export function clearActivityLogs(): void {
    localStorage.removeItem(STORAGE_KEY);
}

// Helper to format activity for display
export function formatActivityType(type: ActivityLog['type']): { icon: string; label: string } {
    switch (type) {
        case 'LOGIN':
            return { icon: '🔓', label: 'Login' };
        case 'LOGOUT':
            return { icon: '🔒', label: 'Logout' };
        case 'GRADE_UPDATE':
            return { icon: '📝', label: 'Edit Nilai' };
        case 'PASSWORD_CHANGE':
            return { icon: '🔑', label: 'Ubah Password' };
        case 'PROFILE_UPDATE':
            return { icon: '👤', label: 'Edit Profil' };
        case 'EXPORT_DATA':
            return { icon: '📤', label: 'Export Data' };
        default:
            return { icon: '📋', label: 'Aktivitas' };
    }
}

// Helper to format timestamp
export function formatTimestamp(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
