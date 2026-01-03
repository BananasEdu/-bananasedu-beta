/**
 * LocalStorage-based Data Store for Offline Mode
 * Manages: Students, Subjects (Mapel), Academic Years, Levels, Majors, Classes
 */

// Types
export interface Student {
    id: string;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    classId: string;
    className: string;
    majorId: string;
    majorName: string;
    password: string | null;
    hasAccount: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Subject {
    id: string;
    name: string;
    code: string;
    type: 'wajib' | 'peminatan' | 'muatan_lokal';
    majorId: string | null;
    majorName: string;
    createdAt: string;
    updatedAt: string;
}

export interface AcademicYear {
    id: string;
    year: string;
    semester: 'Ganjil' | 'Genap';
    isActive: boolean;
    createdAt: string;
}

export interface Level {
    id: string;
    name: string;
    order: number;
    createdAt: string;
}

export interface Major {
    id: string;
    name: string;
    code: string;
    createdAt: string;
}

export interface Class {
    id: string;
    name: string;
    levelId: string;
    levelName: string;
    majorId: string;
    majorName: string;
    studentCount: number;
    createdAt: string;
}

// NEW: Student Grade (nilai per semester)
export interface StudentGrade {
    id: string;
    studentId: string;
    studentName: string;
    studentNis: string;
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    semester: 1 | 2 | 3 | 4 | 5;
    value: number; // 0.00 - 100.00 (2 decimal places)
    raporPhotoUrl: string; // URL Google Drive foto rapor
    status: 'pending' | 'validated' | 'rejected';
    submittedAt: string;
    validatedAt?: string;
    validatorNote?: string;
}

// NEW: Ranking Settings
export interface RankingSettings {
    isEnabled: boolean;
    validationEventActive: boolean;
    validationStartDate?: string;
    validationEndDate?: string;
    updatedAt: string;
}

// Admin User
export interface Admin {
    id: string;
    username: string;
    password: string;
    role: 'super_admin' | 'admin';
    permissions: {
        canViewMasterData: boolean;
        canEditMasterData: boolean;
        canViewMasterNilai: boolean;
        canEditMasterNilai: boolean;
        canViewSettings: boolean;
        canManageAdmins: boolean;
    };
    photoUrl: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

// Website Settings
export interface WebsiteSettings {
    name: string;
    logoUrl: string;
    faviconUrl: string;
    contactPerson: string;
    email: string;
    updatedAt: string;
}

// Activity Log
export interface ActivityLog {
    id: string;
    adminId: string;
    adminName: string;
    action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'settings';
    target: string;
    details: string;
    timestamp: string;
}

// Storage Keys
const STORAGE_KEYS = {
    STUDENTS: 'bananasedu_students',
    SUBJECTS: 'bananasedu_subjects',
    ACADEMIC_YEARS: 'bananasedu_academic_years',
    LEVELS: 'bananasedu_levels',
    MAJORS: 'bananasedu_majors',
    CLASSES: 'bananasedu_classes',
    GRADES: 'bananasedu_grades',
    RANKING_SETTINGS: 'bananasedu_ranking_settings',
    ADMINS: 'bananasedu_admins',
    WEBSITE_SETTINGS: 'bananasedu_website_settings',
    ACTIVITY_LOGS: 'bananasedu_activity_logs',
    CURRENT_ADMIN: 'bananasedu_current_admin',
    INITIALIZED: 'bananasedu_initialized',
};

// Generate random password
// Rules: min 6 chars, must contain lowercase, uppercase, and number
export const generatePassword = (): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const allChars = lowercase + uppercase + numbers;

    // Ensure at least one of each required type
    let password = '';
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));

    // Fill remaining 3 characters randomly
    for (let i = 0; i < 3; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to randomize positions
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Generate unique ID
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get current timestamp
export const getTimestamp = (): string => {
    return new Date().toISOString();
};

// Format timestamp for display
export const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// ==================== INITIAL DATA ====================

const initialLevels: Level[] = [
    { id: 'lvl-1', name: 'X', order: 1, createdAt: getTimestamp() },
    { id: 'lvl-2', name: 'XI', order: 2, createdAt: getTimestamp() },
    { id: 'lvl-3', name: 'XII', order: 3, createdAt: getTimestamp() },
];

const initialMajors: Major[] = [
    { id: 'mjr-1', name: 'MIPA', code: 'MIPA', createdAt: getTimestamp() },
    { id: 'mjr-2', name: 'IPS', code: 'IPS', createdAt: getTimestamp() },
    { id: 'mjr-3', name: 'Bahasa', code: 'BHS', createdAt: getTimestamp() },
];

const initialClasses: Class[] = [
    { id: 'cls-1', name: 'X-MIPA-1', levelId: 'lvl-1', levelName: 'X', majorId: 'mjr-1', majorName: 'MIPA', studentCount: 0, createdAt: getTimestamp() },
    { id: 'cls-2', name: 'X-MIPA-2', levelId: 'lvl-1', levelName: 'X', majorId: 'mjr-1', majorName: 'MIPA', studentCount: 0, createdAt: getTimestamp() },
    { id: 'cls-3', name: 'X-IPS-1', levelId: 'lvl-1', levelName: 'XI', majorId: 'mjr-2', majorName: 'IPS', studentCount: 0, createdAt: getTimestamp() },
    { id: 'cls-4', name: 'XI-MIPA-1', levelId: 'lvl-2', levelName: 'XI', majorId: 'mjr-1', majorName: 'MIPA', studentCount: 0, createdAt: getTimestamp() },
    { id: 'cls-5', name: 'XII-MIPA-1', levelId: 'lvl-3', levelName: 'XII', majorId: 'mjr-1', majorName: 'MIPA', studentCount: 0, createdAt: getTimestamp() },
];

const initialAcademicYears: AcademicYear[] = [
    { id: 'ay-1', year: '2024/2025', semester: 'Ganjil', isActive: true, createdAt: getTimestamp() },
    { id: 'ay-2', year: '2024/2025', semester: 'Genap', isActive: false, createdAt: getTimestamp() },
    { id: 'ay-3', year: '2023/2024', semester: 'Genap', isActive: false, createdAt: getTimestamp() },
];

const initialStudents: Student[] = [
    { id: 'std-1', nis: '12345001', name: 'Ahmad Rizki Pratama', gender: 'L', classId: 'cls-1', className: 'X-MIPA-1', majorId: 'mjr-1', majorName: 'MIPA', password: 'xK3mP9', hasAccount: true, createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'std-2', nis: '12345002', name: 'Siti Nurhaliza', gender: 'P', classId: 'cls-1', className: 'X-MIPA-1', majorId: 'mjr-1', majorName: 'MIPA', password: 'aB7qW2', hasAccount: true, createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'std-3', nis: '12345003', name: 'Budi Santoso', gender: 'L', classId: 'cls-2', className: 'X-MIPA-2', majorId: 'mjr-1', majorName: 'MIPA', password: null, hasAccount: false, createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'std-4', nis: '12345004', name: 'Dewi Lestari', gender: 'P', classId: 'cls-3', className: 'X-IPS-1', majorId: 'mjr-2', majorName: 'IPS', password: null, hasAccount: false, createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'std-5', nis: '12345005', name: 'Eko Prasetyo', gender: 'L', classId: 'cls-4', className: 'XI-MIPA-1', majorId: 'mjr-1', majorName: 'MIPA', password: 'zQ5wR8', hasAccount: true, createdAt: getTimestamp(), updatedAt: getTimestamp() },
];

const initialSubjects: Subject[] = [
    { id: 'sbj-1', name: 'Matematika', code: 'MTK', type: 'wajib', majorId: null, majorName: 'Semua', createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'sbj-2', name: 'Bahasa Indonesia', code: 'BIND', type: 'wajib', majorId: null, majorName: 'Semua', createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'sbj-3', name: 'Bahasa Inggris', code: 'BING', type: 'wajib', majorId: null, majorName: 'Semua', createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'sbj-4', name: 'Fisika', code: 'FIS', type: 'peminatan', majorId: 'mjr-1', majorName: 'MIPA', createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'sbj-5', name: 'Kimia', code: 'KIM', type: 'peminatan', majorId: 'mjr-1', majorName: 'MIPA', createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'sbj-6', name: 'Biologi', code: 'BIO', type: 'peminatan', majorId: 'mjr-1', majorName: 'MIPA', createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'sbj-7', name: 'Ekonomi', code: 'EKO', type: 'peminatan', majorId: 'mjr-2', majorName: 'IPS', createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'sbj-8', name: 'Geografi', code: 'GEO', type: 'peminatan', majorId: 'mjr-2', majorName: 'IPS', createdAt: getTimestamp(), updatedAt: getTimestamp() },
    { id: 'sbj-9', name: 'Bahasa Jawa', code: 'BAJA', type: 'muatan_lokal', majorId: null, majorName: 'Semua', createdAt: getTimestamp(), updatedAt: getTimestamp() },
];

// Initial Grades for Demo
const initialGrades: StudentGrade[] = [
    // Ahmad Rizki - Pending grades
    { id: 'grd-1', studentId: 'std-1', studentName: 'Ahmad Rizki Pratama', studentNis: '12345001', classId: 'cls-1', className: 'X-MIPA-1', subjectId: 'sbj-1', subjectName: 'Matematika', semester: 1, value: 85.50, raporPhotoUrl: 'https://drive.google.com/file/d/demo1', status: 'pending', submittedAt: getTimestamp() },
    { id: 'grd-2', studentId: 'std-1', studentName: 'Ahmad Rizki Pratama', studentNis: '12345001', classId: 'cls-1', className: 'X-MIPA-1', subjectId: 'sbj-4', subjectName: 'Fisika', semester: 1, value: 78.25, raporPhotoUrl: 'https://drive.google.com/file/d/demo1', status: 'pending', submittedAt: getTimestamp() },
    // Siti Nurhaliza - Validated grades
    { id: 'grd-3', studentId: 'std-2', studentName: 'Siti Nurhaliza', studentNis: '12345002', classId: 'cls-1', className: 'X-MIPA-1', subjectId: 'sbj-1', subjectName: 'Matematika', semester: 1, value: 92.00, raporPhotoUrl: 'https://drive.google.com/file/d/demo2', status: 'validated', submittedAt: getTimestamp(), validatedAt: getTimestamp(), validatorNote: 'Approved' },
    { id: 'grd-4', studentId: 'std-2', studentName: 'Siti Nurhaliza', studentNis: '12345002', classId: 'cls-1', className: 'X-MIPA-1', subjectId: 'sbj-4', subjectName: 'Fisika', semester: 1, value: 88.75, raporPhotoUrl: 'https://drive.google.com/file/d/demo2', status: 'validated', submittedAt: getTimestamp(), validatedAt: getTimestamp(), validatorNote: 'Approved' },
    // Budi Santoso - Rejected grade
    { id: 'grd-5', studentId: 'std-3', studentName: 'Budi Santoso', studentNis: '12345003', classId: 'cls-2', className: 'X-MIPA-2', subjectId: 'sbj-1', subjectName: 'Matematika', semester: 1, value: 75.00, raporPhotoUrl: 'https://drive.google.com/file/d/demo3', status: 'rejected', submittedAt: getTimestamp(), validatedAt: getTimestamp(), validatorNote: 'Foto tidak jelas, mohon upload ulang' },
    // Eko Prasetyo - Mixed
    { id: 'grd-6', studentId: 'std-5', studentName: 'Eko Prasetyo', studentNis: '12345005', classId: 'cls-4', className: 'XI-MIPA-1', subjectId: 'sbj-1', subjectName: 'Matematika', semester: 1, value: 90.25, raporPhotoUrl: 'https://drive.google.com/file/d/demo5', status: 'validated', submittedAt: getTimestamp(), validatedAt: getTimestamp(), validatorNote: 'Approved' },
    { id: 'grd-7', studentId: 'std-5', studentName: 'Eko Prasetyo', studentNis: '12345005', classId: 'cls-4', className: 'XI-MIPA-1', subjectId: 'sbj-2', subjectName: 'Bahasa Indonesia', semester: 1, value: 87.50, raporPhotoUrl: 'https://drive.google.com/file/d/demo5', status: 'pending', submittedAt: getTimestamp() },
];

// Initial Admins
const initialAdmins: Admin[] = [
    {
        id: 'adm-1',
        username: 'superadmin',
        password: 'Admin123',
        role: 'super_admin',
        permissions: {
            canViewMasterData: true,
            canEditMasterData: true,
            canViewMasterNilai: true,
            canEditMasterNilai: true,
            canViewSettings: true,
            canManageAdmins: true,
        },
        photoUrl: '',
        status: 'active',
        createdAt: getTimestamp(),
    },
    {
        id: 'adm-2',
        username: 'admin1',
        password: 'Admin456',
        role: 'admin',
        permissions: {
            canViewMasterData: true,
            canEditMasterData: true,
            canViewMasterNilai: true,
            canEditMasterNilai: false,
            canViewSettings: true,
            canManageAdmins: false,
        },
        photoUrl: '',
        status: 'active',
        createdAt: getTimestamp(),
    },
];

// Initial Website Settings
const initialWebsiteSettings: WebsiteSettings = {
    name: 'BananasEdu',
    logoUrl: '',
    faviconUrl: '',
    contactPerson: 'Admin Sekolah',
    email: 'admin@bananasedu.com',
    updatedAt: getTimestamp(),
};

// ==================== DATA STORE CLASS ====================

class DataStore {
    constructor() {
        this.initialize();
    }

    private initialize() {
        if (typeof window === 'undefined') return;

        const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
        if (!isInit) {
            // First time - seed initial data
            this.setData(STORAGE_KEYS.LEVELS, initialLevels);
            this.setData(STORAGE_KEYS.MAJORS, initialMajors);
            this.setData(STORAGE_KEYS.CLASSES, initialClasses);
            this.setData(STORAGE_KEYS.ACADEMIC_YEARS, initialAcademicYears);
            this.setData(STORAGE_KEYS.STUDENTS, initialStudents);
            this.setData(STORAGE_KEYS.SUBJECTS, initialSubjects);
            this.setData(STORAGE_KEYS.GRADES, initialGrades);
            this.setData(STORAGE_KEYS.ADMINS, initialAdmins);
            localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(initialWebsiteSettings));
            localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        }
    }

    private getData<T>(key: string): T[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    private setData<T>(key: string, data: T[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(data));
    }

    // ========== STUDENTS ==========
    getStudents(): Student[] {
        return this.getData<Student>(STORAGE_KEYS.STUDENTS);
    }

    addStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Student {
        const students = this.getStudents();
        const newStudent: Student = {
            ...student,
            id: generateId(),
            createdAt: getTimestamp(),
            updatedAt: getTimestamp(),
        };
        students.push(newStudent);
        this.setData(STORAGE_KEYS.STUDENTS, students);
        this.updateClassStudentCount();
        return newStudent;
    }

    updateStudent(id: string, updates: Partial<Student>): Student | null {
        const students = this.getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index === -1) return null;

        students[index] = { ...students[index], ...updates, updatedAt: getTimestamp() };
        this.setData(STORAGE_KEYS.STUDENTS, students);
        this.updateClassStudentCount();
        return students[index];
    }

    deleteStudent(id: string): boolean {
        const students = this.getStudents();
        const filtered = students.filter(s => s.id !== id);
        if (filtered.length === students.length) return false;

        this.setData(STORAGE_KEYS.STUDENTS, filtered);
        this.updateClassStudentCount();
        return true;
    }

    findStudentByNis(nis: string): Student | null {
        const students = this.getStudents();
        return students.find(s => s.nis === nis) || null;
    }

    // Authenticate student for login
    authenticateStudent(nis: string, password: string): Student | null {
        const student = this.findStudentByNis(nis);
        if (student && student.hasAccount && student.password === password) {
            return student;
        }
        return null;
    }

    // ========== SUBJECTS ==========
    getSubjects(): Subject[] {
        return this.getData<Subject>(STORAGE_KEYS.SUBJECTS);
    }

    addSubject(subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Subject {
        const subjects = this.getSubjects();
        const newSubject: Subject = {
            ...subject,
            id: generateId(),
            createdAt: getTimestamp(),
            updatedAt: getTimestamp(),
        };
        subjects.push(newSubject);
        this.setData(STORAGE_KEYS.SUBJECTS, subjects);
        return newSubject;
    }

    updateSubject(id: string, updates: Partial<Subject>): Subject | null {
        const subjects = this.getSubjects();
        const index = subjects.findIndex(s => s.id === id);
        if (index === -1) return null;

        subjects[index] = { ...subjects[index], ...updates, updatedAt: getTimestamp() };
        this.setData(STORAGE_KEYS.SUBJECTS, subjects);
        return subjects[index];
    }

    deleteSubject(id: string): boolean {
        const subjects = this.getSubjects();
        const filtered = subjects.filter(s => s.id !== id);
        if (filtered.length === subjects.length) return false;

        this.setData(STORAGE_KEYS.SUBJECTS, filtered);
        return true;
    }

    // ========== ACADEMIC YEARS ==========
    getAcademicYears(): AcademicYear[] {
        return this.getData<AcademicYear>(STORAGE_KEYS.ACADEMIC_YEARS);
    }

    addAcademicYear(ay: Omit<AcademicYear, 'id' | 'createdAt'>): AcademicYear {
        const years = this.getAcademicYears();
        const newYear: AcademicYear = {
            ...ay,
            id: generateId(),
            createdAt: getTimestamp(),
        };
        years.push(newYear);
        this.setData(STORAGE_KEYS.ACADEMIC_YEARS, years);
        return newYear;
    }

    updateAcademicYear(id: string, updates: Partial<AcademicYear>): AcademicYear | null {
        const years = this.getAcademicYears();
        const index = years.findIndex(y => y.id === id);
        if (index === -1) return null;

        years[index] = { ...years[index], ...updates };
        this.setData(STORAGE_KEYS.ACADEMIC_YEARS, years);
        return years[index];
    }

    deleteAcademicYear(id: string): boolean {
        const years = this.getAcademicYears();
        const filtered = years.filter(y => y.id !== id);
        if (filtered.length === years.length) return false;
        this.setData(STORAGE_KEYS.ACADEMIC_YEARS, filtered);
        return true;
    }

    // ========== LEVELS ==========
    getLevels(): Level[] {
        return this.getData<Level>(STORAGE_KEYS.LEVELS);
    }

    addLevel(level: Omit<Level, 'id' | 'createdAt'>): Level {
        const levels = this.getLevels();
        const newLevel: Level = { ...level, id: generateId(), createdAt: getTimestamp() };
        levels.push(newLevel);
        this.setData(STORAGE_KEYS.LEVELS, levels);
        return newLevel;
    }

    updateLevel(id: string, updates: Partial<Level>): Level | null {
        const levels = this.getLevels();
        const index = levels.findIndex(l => l.id === id);
        if (index === -1) return null;
        levels[index] = { ...levels[index], ...updates };
        this.setData(STORAGE_KEYS.LEVELS, levels);
        return levels[index];
    }

    deleteLevel(id: string): boolean {
        const levels = this.getLevels();
        const filtered = levels.filter(l => l.id !== id);
        if (filtered.length === levels.length) return false;
        this.setData(STORAGE_KEYS.LEVELS, filtered);
        return true;
    }

    // ========== MAJORS ==========
    getMajors(): Major[] {
        return this.getData<Major>(STORAGE_KEYS.MAJORS);
    }

    addMajor(major: Omit<Major, 'id' | 'createdAt'>): Major {
        const majors = this.getMajors();
        const newMajor: Major = { ...major, id: generateId(), createdAt: getTimestamp() };
        majors.push(newMajor);
        this.setData(STORAGE_KEYS.MAJORS, majors);
        return newMajor;
    }

    updateMajor(id: string, updates: Partial<Major>): Major | null {
        const majors = this.getMajors();
        const index = majors.findIndex(m => m.id === id);
        if (index === -1) return null;
        majors[index] = { ...majors[index], ...updates };
        this.setData(STORAGE_KEYS.MAJORS, majors);
        return majors[index];
    }

    deleteMajor(id: string): boolean {
        const majors = this.getMajors();
        const filtered = majors.filter(m => m.id !== id);
        if (filtered.length === majors.length) return false;
        this.setData(STORAGE_KEYS.MAJORS, filtered);
        return true;
    }

    // ========== CLASSES ==========
    getClasses(): Class[] {
        return this.getData<Class>(STORAGE_KEYS.CLASSES);
    }

    addClass(cls: Omit<Class, 'id' | 'createdAt' | 'studentCount'>): Class {
        const classes = this.getClasses();
        const newClass: Class = { ...cls, id: generateId(), studentCount: 0, createdAt: getTimestamp() };
        classes.push(newClass);
        this.setData(STORAGE_KEYS.CLASSES, classes);
        return newClass;
    }

    updateClass(id: string, updates: Partial<Class>): Class | null {
        const classes = this.getClasses();
        const index = classes.findIndex(c => c.id === id);
        if (index === -1) return null;
        classes[index] = { ...classes[index], ...updates };
        this.setData(STORAGE_KEYS.CLASSES, classes);
        return classes[index];
    }

    deleteClass(id: string): boolean {
        const classes = this.getClasses();
        const filtered = classes.filter(c => c.id !== id);
        if (filtered.length === classes.length) return false;
        this.setData(STORAGE_KEYS.CLASSES, filtered);
        return true;
    }

    // Update student counts in classes
    private updateClassStudentCount() {
        const students = this.getStudents();
        const classes = this.getClasses();

        classes.forEach(cls => {
            cls.studentCount = students.filter(s => s.classId === cls.id).length;
        });

        this.setData(STORAGE_KEYS.CLASSES, classes);
    }

    // ========== STUDENT GRADES ==========
    getGrades(): StudentGrade[] {
        return this.getData<StudentGrade>(STORAGE_KEYS.GRADES);
    }

    getGradesByStudent(studentId: string): StudentGrade[] {
        return this.getGrades().filter(g => g.studentId === studentId);
    }

    getGradesByStatus(status: 'pending' | 'validated' | 'rejected'): StudentGrade[] {
        return this.getGrades().filter(g => g.status === status);
    }

    getPendingGrades(): StudentGrade[] {
        return this.getGradesByStatus('pending');
    }

    addGrade(grade: Omit<StudentGrade, 'id' | 'submittedAt' | 'status'>): StudentGrade {
        const grades = this.getGrades();
        const newGrade: StudentGrade = {
            ...grade,
            id: generateId(),
            status: 'pending',
            submittedAt: getTimestamp(),
        };
        grades.push(newGrade);
        this.setData(STORAGE_KEYS.GRADES, grades);
        return newGrade;
    }

    updateGrade(id: string, updates: Partial<StudentGrade>): StudentGrade | null {
        const grades = this.getGrades();
        const index = grades.findIndex(g => g.id === id);
        if (index === -1) return null;

        grades[index] = { ...grades[index], ...updates };
        this.setData(STORAGE_KEYS.GRADES, grades);
        return grades[index];
    }

    approveGrade(id: string, note?: string): StudentGrade | null {
        return this.updateGrade(id, {
            status: 'validated',
            validatedAt: getTimestamp(),
            validatorNote: note || 'Approved',
        });
    }

    rejectGrade(id: string, note: string): StudentGrade | null {
        return this.updateGrade(id, {
            status: 'rejected',
            validatedAt: getTimestamp(),
            validatorNote: note,
        });
    }

    bulkApproveGrades(ids: string[]): void {
        ids.forEach(id => this.approveGrade(id));
    }

    bulkRejectGrades(ids: string[], note: string): void {
        ids.forEach(id => this.rejectGrade(id, note));
    }

    deleteGrade(id: string): boolean {
        const grades = this.getGrades();
        const filtered = grades.filter(g => g.id !== id);
        if (filtered.length === grades.length) return false;
        this.setData(STORAGE_KEYS.GRADES, filtered);
        return true;
    }

    // ========== RANKING SETTINGS ==========
    getRankingSettings(): RankingSettings {
        const data = localStorage.getItem(STORAGE_KEYS.RANKING_SETTINGS);
        if (data) return JSON.parse(data);
        // Default settings
        return {
            isEnabled: false,
            validationEventActive: false,
            updatedAt: getTimestamp(),
        };
    }

    updateRankingSettings(updates: Partial<RankingSettings>): RankingSettings {
        const current = this.getRankingSettings();
        const updated = { ...current, ...updates, updatedAt: getTimestamp() };
        localStorage.setItem(STORAGE_KEYS.RANKING_SETTINGS, JSON.stringify(updated));
        return updated;
    }

    enableRanking(): RankingSettings {
        return this.updateRankingSettings({ isEnabled: true });
    }

    disableRanking(): RankingSettings {
        return this.updateRankingSettings({ isEnabled: false });
    }

    startValidationEvent(): RankingSettings {
        return this.updateRankingSettings({
            validationEventActive: true,
            validationStartDate: getTimestamp(),
        });
    }

    endValidationEvent(): RankingSettings {
        return this.updateRankingSettings({
            validationEventActive: false,
            validationEndDate: getTimestamp(),
        });
    }

    // Calculate validation progress
    getValidationProgress(): { validated: number; total: number; percentage: number } {
        const grades = this.getGrades();
        const total = grades.length;
        const validated = grades.filter(g => g.status === 'validated').length;
        const percentage = total > 0 ? Math.round((validated / total) * 100) : 0;
        return { validated, total, percentage };
    }

    // ========== ADMIN MANAGEMENT ==========
    getAdmins(): Admin[] {
        return this.getData<Admin>(STORAGE_KEYS.ADMINS);
    }

    getAdminById(id: string): Admin | undefined {
        return this.getAdmins().find(a => a.id === id);
    }

    getAdminByUsername(username: string): Admin | undefined {
        return this.getAdmins().find(a => a.username.toLowerCase() === username.toLowerCase());
    }

    addAdmin(admin: Omit<Admin, 'id' | 'createdAt'>): Admin {
        const admins = this.getAdmins();
        const newAdmin: Admin = {
            ...admin,
            id: generateId(),
            createdAt: getTimestamp(),
        };
        admins.push(newAdmin);
        this.setData(STORAGE_KEYS.ADMINS, admins);
        this.logActivity('create', 'Admin', `Added admin: ${admin.username}`);
        return newAdmin;
    }

    updateAdmin(id: string, updates: Partial<Admin>): Admin | null {
        const admins = this.getAdmins();
        const index = admins.findIndex(a => a.id === id);
        if (index === -1) return null;
        admins[index] = { ...admins[index], ...updates };
        this.setData(STORAGE_KEYS.ADMINS, admins);
        this.logActivity('update', 'Admin', `Updated admin: ${admins[index].username}`);
        return admins[index];
    }

    deleteAdmin(id: string): boolean {
        const admins = this.getAdmins();
        const admin = admins.find(a => a.id === id);
        const filtered = admins.filter(a => a.id !== id);
        if (filtered.length === admins.length) return false;
        this.setData(STORAGE_KEYS.ADMINS, filtered);
        if (admin) this.logActivity('delete', 'Admin', `Deleted admin: ${admin.username}`);
        return true;
    }

    toggleAdminStatus(id: string): Admin | null {
        const admin = this.getAdminById(id);
        if (!admin) return null;
        const newStatus = admin.status === 'active' ? 'inactive' : 'active';
        return this.updateAdmin(id, { status: newStatus });
    }

    resetAdminPassword(id: string): string | null {
        const admin = this.getAdminById(id);
        if (!admin) return null;
        const newPassword = generatePassword();
        this.updateAdmin(id, { password: newPassword });
        return newPassword;
    }

    // Current Admin Session
    setCurrentAdmin(admin: Admin): void {
        localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
        this.logActivity('login', 'Session', `Admin logged in: ${admin.username}`);
    }

    getCurrentAdmin(): Admin | null {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
        return data ? JSON.parse(data) : null;
    }

    logoutCurrentAdmin(): void {
        const current = this.getCurrentAdmin();
        if (current) this.logActivity('logout', 'Session', `Admin logged out: ${current.username}`);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
    }

    // ========== WEBSITE SETTINGS ==========
    getWebsiteSettings(): WebsiteSettings {
        const data = localStorage.getItem(STORAGE_KEYS.WEBSITE_SETTINGS);
        if (data) return JSON.parse(data);
        return initialWebsiteSettings;
    }

    updateWebsiteSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
        const current = this.getWebsiteSettings();
        const updated = { ...current, ...updates, updatedAt: getTimestamp() };
        localStorage.setItem(STORAGE_KEYS.WEBSITE_SETTINGS, JSON.stringify(updated));
        this.logActivity('settings', 'Website', 'Updated website settings');
        return updated;
    }

    // ========== ACTIVITY LOGS ==========
    getActivityLogs(): ActivityLog[] {
        return this.getData<ActivityLog>(STORAGE_KEYS.ACTIVITY_LOGS);
    }

    getActivityLogsByAdmin(adminId: string): ActivityLog[] {
        return this.getActivityLogs().filter(log => log.adminId === adminId);
    }

    getActivityLogsByType(action: ActivityLog['action']): ActivityLog[] {
        return this.getActivityLogs().filter(log => log.action === action);
    }

    getActivityLogsByDateRange(start: Date, end: Date): ActivityLog[] {
        return this.getActivityLogs().filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= start && logDate <= end;
        });
    }

    logActivity(action: ActivityLog['action'], target: string, details: string): void {
        const currentAdmin = this.getCurrentAdmin();
        const logs = this.getActivityLogs();
        const newLog: ActivityLog = {
            id: generateId(),
            adminId: currentAdmin?.id || 'system',
            adminName: currentAdmin?.username || 'System',
            action,
            target,
            details,
            timestamp: getTimestamp(),
        };
        logs.push(newLog);
        // Keep only last 1000 logs
        const trimmed = logs.slice(-1000);
        this.setData(STORAGE_KEYS.ACTIVITY_LOGS, trimmed);
    }

    clearActivityLogs(): void {
        this.setData(STORAGE_KEYS.ACTIVITY_LOGS, []);
    }

    // ========== UTILITY ==========
    resetAllData() {
        localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
        localStorage.removeItem(STORAGE_KEYS.STUDENTS);
        localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
        localStorage.removeItem(STORAGE_KEYS.ACADEMIC_YEARS);
        localStorage.removeItem(STORAGE_KEYS.LEVELS);
        localStorage.removeItem(STORAGE_KEYS.MAJORS);
        localStorage.removeItem(STORAGE_KEYS.CLASSES);
        localStorage.removeItem(STORAGE_KEYS.GRADES);
        localStorage.removeItem(STORAGE_KEYS.RANKING_SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.ADMINS);
        localStorage.removeItem(STORAGE_KEYS.WEBSITE_SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
        this.initialize();
    }
}

// Singleton instance
export const dataStore = new DataStore();
