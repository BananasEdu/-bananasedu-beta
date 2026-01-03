
import { currentUserRank } from './mockPeringkatData';

// --- Interfaces ---

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string; // e.g., "5m lalu"
    type: 'success' | 'info' | 'warning';
    read: boolean;
}

export interface SpiderChartData {
    subject: string;
    value: number;
    fullMark: number;
}

export interface DashboardData {
    user: {
        name: string;
        avatar: string; // URL or placeholder
        grade: string; // e.g., "XII MIPA 1"
        semester: number; // Current semester, e.g., 5
    };
    stats: {
        average: number;
        averageGrade: string; // e.g., "B+"
        averageLabel: string; // e.g., "Baik"
        rank: number;
        totalStudents: number;
        rankTrend: number; // Positive = up, Negative = down
        streak: number; // Semesters with improvement
    };
    validation: {
        status: 'validated' | 'pending' | 'not_uploaded';
        date?: string;
        progress: number; // 0-100
        totalSemesters: number;
        uploadedSemesters: number;
    };
    snbpCountdown: {
        targetDate: string; // ISO string
        title: string;
    };
    target: {
        average: number;
        grade: string;
        achieved: boolean;
    };
    spiderChart: {
        mode: 'highest' | 'lowest' | 'custom';
        data: SpiderChartData[];
    };
    notifications: Notification[];
}

// --- Mock Data ---

// 1. Empty State (User hasn't uploaded anything)
export const emptyDashboardData: DashboardData = {
    user: {
        name: 'Andi Pratama',
        avatar: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=FBBF24&color=1F2937',
        grade: 'XII MIPA 1',
        semester: 5
    },
    stats: {
        average: 0,
        averageGrade: '-',
        averageLabel: '-',
        rank: 0,
        totalStudents: 268,
        rankTrend: 0,
        streak: 0
    },
    validation: {
        status: 'not_uploaded',
        progress: 0,
        totalSemesters: 5,
        uploadedSemesters: 0
    },
    snbpCountdown: {
        targetDate: '2025-02-14T00:00:00', // Example date
        title: 'Pendaftaran SNBP'
    },
    target: {
        average: 90.0,
        grade: 'A',
        achieved: false
    },
    spiderChart: {
        mode: 'highest',
        data: []
    },
    notifications: [
        {
            id: '1',
            title: '🎉 Selamat Datang!',
            message: 'Akun kamu berhasil dibuat. Silakan upload nilai rapor.',
            time: 'Baru saja',
            type: 'info',
            read: false
        }
    ]
};

// 2. Full State (User has uploaded and validated)
export const fullDashboardData: DashboardData = {
    user: {
        name: 'Andi Pratama',
        avatar: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=FBBF24&color=1F2937',
        grade: 'XII MIPA 1',
        semester: 5
    },
    stats: {
        average: currentUserRank.average, // 87.45
        averageGrade: currentUserRank.grade, // B+
        averageLabel: 'Baik',
        rank: currentUserRank.rank, // 15
        totalStudents: 268,
        rankTrend: 3, // +3
        streak: 3
    },
    validation: {
        status: 'validated',
        date: '28 Des 2024',
        progress: 80, // 4/5 semesters valid (mock scenario)
        totalSemesters: 5,
        uploadedSemesters: 4
    },
    snbpCountdown: {
        targetDate: '2025-02-14T00:00:00',
        title: 'Pendaftaran SNBP'
    },
    target: {
        average: 90.0,
        grade: 'A',
        achieved: false
    },
    spiderChart: {
        mode: 'highest',
        data: [
            { subject: 'Agama', value: 92.5, fullMark: 100 },
            { subject: 'Matematika', value: 88.25, fullMark: 100 },
            { subject: 'Biologi', value: 89.5, fullMark: 100 },
            { subject: 'Fisika', value: 82.75, fullMark: 100 },
            { subject: 'Geografi', value: 90.67, fullMark: 100 },
            { subject: 'B. Ind', value: 86.75, fullMark: 100 },
        ]
    },
    notifications: [
        {
            id: 'n1',
            title: '🎉 Nilai kamu sudah divalidasi',
            message: 'Rapor Semester 1-4 telah berhasil divalidasi oleh admin.',
            time: '5m lalu',
            type: 'success',
            read: false
        },
        {
            id: 'n2',
            title: '📝 Semester 5 sudah bisa diinput',
            message: 'Segera lengkapi data nilaimu untuk melihat peluang SNBP.',
            time: '1h lalu',
            type: 'info',
            read: false
        },
        {
            id: 'n3',
            title: '🔓 Fitur Flexi-Calc sudah terbuka',
            message: 'Kamu sekarang bisa menghitung simulasi target nilai.',
            time: '2h lalu',
            type: 'success',
            read: true
        }
    ]
};

// Generic type helper for Widget Props
export interface WidgetProps {
    data: DashboardData;
}
