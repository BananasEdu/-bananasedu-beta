// Mock Admin Data

// Admin Users
export interface AdminUser {
    id: string;
    name: string;
    username: string;
    role: 'super_admin' | 'admin' | 'validator';
    status: 'active' | 'inactive';
    email?: string;
}

export const mockAdminUsers: AdminUser[] = [
    { id: 'a1', name: 'Admin Utama', username: 'superadmin', role: 'super_admin', status: 'active', email: 'admin@bananasedu.id' },
    { id: 'a2', name: 'Budi Operator', username: 'budi.op', role: 'admin', status: 'active' },
    { id: 'a3', name: 'Siti Validator', username: 'siti.val', role: 'validator', status: 'active' },
];

// Dashboard Stats
export interface DashboardStats {
    totalStudents: number;
    validated: number;
    pending: number;
    feedback: number;
}

export const dashboardStats: DashboardStats = {
    totalStudents: 803,
    validated: 650,
    pending: 12,
    feedback: 5,
};

// Validation Progress
export interface ValidationProgress {
    total: number;
    validated: number;
    percentage: number;
}

export const validationProgress: ValidationProgress = {
    total: 803,
    validated: 650,
    percentage: 81,
};

// Pending Validations
export interface PendingValidation {
    id: string;
    studentName: string;
    class: string;
    submittedAt: string;
    average: number;
}

export const pendingValidations: PendingValidation[] = [
    { id: 'p1', studentName: 'Ahmad Rizki P.', class: 'XI MIPA 1', submittedAt: '28 Des 13:20', average: 90.50 },
    { id: 'p2', studentName: 'Siti Nurhaliza', class: 'XI IPS 2', submittedAt: '28 Des 12:15', average: 85.30 },
    { id: 'p3', studentName: 'Budi Santoso', class: 'XI MIPA 2', submittedAt: '28 Des 11:45', average: 88.75 },
    { id: 'p4', studentName: 'Dewi Kartika', class: 'XII IPA 1', submittedAt: '28 Des 10:30', average: 92.00 },
];

// Activity Logs
export interface ActivityLog {
    id: string;
    admin: string;
    action: string;
    category: 'auth' | 'account' | 'data' | 'grade' | 'master' | 'admin' | 'setting';
    timestamp: string;
}

export const activityLogs: ActivityLog[] = [
    { id: 'l1', admin: 'Admin Budi', action: 'Approve nilai Ahmad', category: 'grade', timestamp: '2 menit lalu' },
    { id: 'l2', admin: 'Super Admin', action: 'Tambah 5 siswa baru', category: 'data', timestamp: '10 menit lalu' },
    { id: 'l3', admin: 'Siti Validator', action: 'Reject nilai Dewi', category: 'grade', timestamp: '25 menit lalu' },
    { id: 'l4', admin: 'Super Admin', action: 'Generate 15 akun', category: 'account', timestamp: '1 jam lalu' },
];

// Feedback
export interface Feedback {
    id: string;
    message: string;
    studentName: string;
    class: string;
    timestamp: string;
    isNew: boolean;
}

export const feedbackList: Feedback[] = [
    { id: 'f1', message: 'Tambah fitur cetak rapor dong', studentName: 'Ahmad', class: 'XI MIPA 1', timestamp: '1 jam lalu', isNew: true },
    { id: 'f2', message: 'Halaman lama loading...', studentName: 'Siti', class: 'XI IPS 2', timestamp: '3 jam lalu', isNew: true },
    { id: 'f3', message: 'Grafik sangat membantu 👍', studentName: 'Budi', class: 'XII IPA 1', timestamp: 'Kemarin', isNew: false },
];

// Master Data - Tahun Pelajaran
export interface TahunPelajaran {
    id: string;
    tahun: string;
    semester: 'Ganjil' | 'Genap';
    status: 'active' | 'archived';
    studentCount: number;
}

export const tahunPelajaranList: TahunPelajaran[] = [
    { id: 'tp1', tahun: '2024/2025', semester: 'Ganjil', status: 'active', studentCount: 803 },
    { id: 'tp2', tahun: '2023/2024', semester: 'Genap', status: 'archived', studentCount: 798 },
    { id: 'tp3', tahun: '2023/2024', semester: 'Ganjil', status: 'archived', studentCount: 795 },
];

// Master Data - Tingkatan
export interface Tingkatan {
    id: string;
    name: string;
    code: string;
    classCount: number;
    studentCount: number;
}

export const tingkatanList: Tingkatan[] = [
    { id: 't1', name: 'Kelas X', code: 'X', classCount: 9, studentCount: 270 },
    { id: 't2', name: 'Kelas XI', code: 'XI', classCount: 9, studentCount: 265 },
    { id: 't3', name: 'Kelas XII', code: 'XII', classCount: 9, studentCount: 268 },
];

// Master Data - Jurusan
export interface Jurusan {
    id: string;
    name: string;
    code: string;
    classCount: number;
    studentCount: number;
    subjectCount?: number;
}

export const jurusanList: Jurusan[] = [
    { id: 'j1', name: 'MIPA', code: 'MIPA', classCount: 9, studentCount: 270, subjectCount: 12 },
    { id: 'j2', name: 'IPS', code: 'IPS', classCount: 6, studentCount: 180, subjectCount: 10 },
    { id: 'j3', name: 'Bahasa', code: 'BHS', classCount: 3, studentCount: 90, subjectCount: 11 },
];

// Master Data - Kelas
export interface Kelas {
    id: string;
    name: string;
    tingkatan: string;
    jurusan: string;
    studentCount: number;
    waliKelas?: string;
}

export const kelasList: Kelas[] = [
    { id: 'k1', name: 'XI MIPA 1', tingkatan: 'XI', jurusan: 'MIPA', studentCount: 30, waliKelas: 'Pak Budi' },
    { id: 'k2', name: 'XI MIPA 2', tingkatan: 'XI', jurusan: 'MIPA', studentCount: 30, waliKelas: 'Bu Sari' },
    { id: 'k3', name: 'XI MIPA 3', tingkatan: 'XI', jurusan: 'MIPA', studentCount: 30, waliKelas: 'Pak Andi' },
    { id: 'k4', name: 'XI IPS 1', tingkatan: 'XI', jurusan: 'IPS', studentCount: 30, waliKelas: 'Bu Rina' },
    { id: 'k5', name: 'XI IPS 2', tingkatan: 'XI', jurusan: 'IPS', studentCount: 30, waliKelas: 'Pak Dedi' },
    { id: 'k6', name: 'XII MIPA 1', tingkatan: 'XII', jurusan: 'MIPA', studentCount: 30, waliKelas: 'Bu Yanti' },
    { id: 'k7', name: 'XII MIPA 2', tingkatan: 'XII', jurusan: 'MIPA', studentCount: 30, waliKelas: 'Pak Hadi' },
    { id: 'k8', name: 'XII IPS 1', tingkatan: 'XII', jurusan: 'IPS', studentCount: 30, waliKelas: 'Bu Dewi' },
];

// Master Data - Mapel
export interface Mapel {
    id: string;
    name: string;
    code: string;
    type: 'wajib' | 'pilihan' | 'mulok';
    jurusan: string; // 'Semua' or specific
}

export const mapelList: Mapel[] = [
    { id: 'm1', name: 'Matematika', code: 'MTK', type: 'wajib', jurusan: 'Semua' },
    { id: 'm2', name: 'Bahasa Indonesia', code: 'BIN', type: 'wajib', jurusan: 'Semua' },
    { id: 'm3', name: 'Bahasa Inggris', code: 'BIG', type: 'wajib', jurusan: 'Semua' },
    { id: 'm4', name: 'Pendidikan Agama', code: 'PAI', type: 'wajib', jurusan: 'Semua' },
    { id: 'm5', name: 'PPKN', code: 'PKN', type: 'wajib', jurusan: 'Semua' },
    { id: 'm6', name: 'Fisika', code: 'FIS', type: 'pilihan', jurusan: 'MIPA' },
    { id: 'm7', name: 'Kimia', code: 'KIM', type: 'pilihan', jurusan: 'MIPA' },
    { id: 'm8', name: 'Biologi', code: 'BIO', type: 'pilihan', jurusan: 'MIPA' },
    { id: 'm9', name: 'Ekonomi', code: 'EKO', type: 'pilihan', jurusan: 'IPS' },
    { id: 'm10', name: 'Geografi', code: 'GEO', type: 'pilihan', jurusan: 'IPS' },
    { id: 'm11', name: 'Sosiologi', code: 'SOS', type: 'pilihan', jurusan: 'IPS' },
    { id: 'm12', name: 'Bahasa Jawa', code: 'BJW', type: 'mulok', jurusan: 'Semua' },
];

// Master Data - Students
export interface Student {
    id: string;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    class: string;
    hasAccount: boolean;
    accountStatus?: 'active' | 'default' | 'inactive';
}

export const studentList: Student[] = [
    { id: 's1', nis: '12001', name: 'Ahmad Rizki Pratama', gender: 'L', class: 'XI MIPA 1', hasAccount: true, accountStatus: 'active' },
    { id: 's2', nis: '12002', name: 'Siti Nurhaliza', gender: 'P', class: 'XI MIPA 1', hasAccount: true, accountStatus: 'default' },
    { id: 's3', nis: '12003', name: 'Budi Santoso', gender: 'L', class: 'XI IPS 1', hasAccount: false },
    { id: 's4', nis: '12004', name: 'Dewi Kartika', gender: 'P', class: 'XII IPA 1', hasAccount: true, accountStatus: 'active' },
    { id: 's5', nis: '12005', name: 'Eko Prasetyo', gender: 'L', class: 'XI MIPA 2', hasAccount: false },
];

// Class Validation Progress
export interface ClassProgress {
    className: string;
    total: number;
    validated: number;
    pending: number;
    notUploaded: number;
    percentage: number;
}

export const classProgressList: ClassProgress[] = [
    { className: 'XI MIPA 1', total: 30, validated: 28, pending: 2, notUploaded: 0, percentage: 93 },
    { className: 'XI MIPA 2', total: 30, validated: 25, pending: 3, notUploaded: 2, percentage: 83 },
    { className: 'XI IPS 1', total: 30, validated: 20, pending: 5, notUploaded: 5, percentage: 67 },
    { className: 'XII MIPA 1', total: 30, validated: 30, pending: 0, notUploaded: 0, percentage: 100 },
];
