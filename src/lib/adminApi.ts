import { api } from "./api";

// ==================== ADMIN DASHBOARD API ====================

export interface DashboardStats {
    totalStudents: number;
    studentsWithAccount: number;
    studentsWithoutAccount: number;
    totalGrades: number;
    pendingGrades: number;
    approvedGrades: number;
    totalClasses: number;
    validationProgress: number;
}

export interface DashboardProgress {
    validated: number;
    pending: number;
    draft: number;
    total: number;
    percentage: number;
}

export interface PendingItem {
    id: string;
    student: { name: string; nis: string };
    subject: string;
    finalScore: number | null;
    submittedAt: string;
}

export interface ActivityItem {
    id: string;
    admin: string;
    action: string;
    category: string;
    timestamp: string;
}

export interface ClassProgress {
    id: string;
    name: string;
    level: string;
    major: string;
    studentCount: number;
    totalGrades: number;
    approvedGrades: number;
    pendingGrades: number;
    draftGrades: number;
    progress: number;
}

export const adminDashboardApi = {
    getStats: async (): Promise<{ stats: DashboardStats; activeYear: { year: string; semester: string } | null }> => {
        return api.get("/admin/dashboard/stats");
    },

    getProgress: async (): Promise<{ progress: DashboardProgress }> => {
        return api.get("/admin/dashboard/progress");
    },

    getPending: async (limit?: number): Promise<{ pending: PendingItem[] }> => {
        const query = limit ? `?limit=${limit}` : "";
        return api.get(`/admin/dashboard/pending${query}`);
    },

    getActivity: async (limit?: number): Promise<{ activities: ActivityItem[] }> => {
        const query = limit ? `?limit=${limit}` : "";
        return api.get(`/admin/dashboard/activity${query}`);
    },

    getClassProgress: async (): Promise<{ classProgress: ClassProgress[] }> => {
        return api.get("/admin/dashboard/class-progress");
    },
};

// ==================== ADMIN MASTER DATA API ====================

export interface AcademicYear {
    id: string;
    year: string;
    semester: string;
    status: string;
    classCount: number;
    gradeCount: number;
    createdAt: string;
}

export interface Level {
    id: string;
    name: string;
    code: string;
    classCount: number;
}

export interface Major {
    id: string;
    name: string;
    code: string;
    classCount: number;
    subjectCount: number;
}

export interface ClassData {
    id: string;
    name: string;
    level: { id: string; name: string };
    major: { id: string; name: string };
    academicYear: { id: string; year: string; semester: string };
    homeroom: string;
    studentCount: number;
}

export interface Subject {
    id: string;
    name: string;
    code: string;
    type: string;
    major: { id: string; name: string } | null;
    gradeCount: number;
}

export interface Student {
    id: string;
    nis: string;
    name: string;
    gender: string;
    class: {
        id: string;
        name: string;
        level: string;
        major: string;
    };
    hasAccount: boolean;
    accountStatus: string;
    createdAt: string;
}

export const adminMasterDataApi = {
    // Academic Years
    getAcademicYears: async (): Promise<{ academicYears: AcademicYear[] }> => {
        return api.get("/admin/academic-years");
    },

    createAcademicYear: async (data: { year: string; semester: string; status?: string }): Promise<{ success: boolean; academicYear: AcademicYear }> => {
        return api.post("/admin/academic-years", data);
    },

    updateAcademicYear: async (id: string, data: Partial<{ year: string; semester: string; status: string }>): Promise<{ success: boolean }> => {
        return api.put(`/admin/academic-years/${id}`, data);
    },

    deleteAcademicYear: async (id: string): Promise<{ success: boolean }> => {
        return api.delete(`/admin/academic-years/${id}`);
    },

    // Levels
    getLevels: async (): Promise<{ levels: Level[] }> => {
        return api.get("/admin/levels");
    },

    createLevel: async (data: { name: string; code: string }): Promise<{ success: boolean; level: Level }> => {
        return api.post("/admin/levels", data);
    },

    updateLevel: async (id: string, data: Partial<{ name: string; code: string }>): Promise<{ success: boolean }> => {
        return api.put(`/admin/levels/${id}`, data);
    },

    deleteLevel: async (id: string): Promise<{ success: boolean }> => {
        return api.delete(`/admin/levels/${id}`);
    },

    // Majors
    getMajors: async (): Promise<{ majors: Major[] }> => {
        return api.get("/admin/majors");
    },

    createMajor: async (data: { name: string; code: string }): Promise<{ success: boolean; major: Major }> => {
        return api.post("/admin/majors", data);
    },

    updateMajor: async (id: string, data: Partial<{ name: string; code: string }>): Promise<{ success: boolean }> => {
        return api.put(`/admin/majors/${id}`, data);
    },

    deleteMajor: async (id: string): Promise<{ success: boolean }> => {
        return api.delete(`/admin/majors/${id}`);
    },

    // Classes
    getClasses: async (params?: { levelId?: string; majorId?: string; academicYearId?: string }): Promise<{ classes: ClassData[] }> => {
        const searchParams = new URLSearchParams();
        if (params?.levelId) searchParams.append("levelId", params.levelId);
        if (params?.majorId) searchParams.append("majorId", params.majorId);
        if (params?.academicYearId) searchParams.append("academicYearId", params.academicYearId);
        const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
        return api.get(`/admin/classes${query}`);
    },

    createClass: async (data: { name: string; levelId: string; majorId: string; academicYearId: string; homeroom?: string }): Promise<{ success: boolean }> => {
        return api.post("/admin/classes", data);
    },

    updateClass: async (id: string, data: Partial<{ name: string; levelId: string; majorId: string; homeroom: string }>): Promise<{ success: boolean }> => {
        return api.put(`/admin/classes/${id}`, data);
    },

    deleteClass: async (id: string): Promise<{ success: boolean }> => {
        return api.delete(`/admin/classes/${id}`);
    },

    // Subjects
    getSubjects: async (params?: { type?: string; majorId?: string }): Promise<{ subjects: Subject[] }> => {
        const searchParams = new URLSearchParams();
        if (params?.type) searchParams.append("type", params.type);
        if (params?.majorId) searchParams.append("majorId", params.majorId);
        const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
        return api.get(`/admin/subjects${query}`);
    },

    createSubject: async (data: { name: string; code: string; type: string; majorId?: string }): Promise<{ success: boolean }> => {
        return api.post("/admin/subjects", data);
    },

    updateSubject: async (id: string, data: Partial<{ name: string; code: string; type: string; majorId: string }>): Promise<{ success: boolean }> => {
        return api.put(`/admin/subjects/${id}`, data);
    },

    deleteSubject: async (id: string): Promise<{ success: boolean }> => {
        return api.delete(`/admin/subjects/${id}`);
    },

    // Students
    getStudents: async (params?: { classId?: string; hasAccount?: boolean; search?: string; page?: number; limit?: number }): Promise<{ students: Student[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
        const searchParams = new URLSearchParams();
        if (params?.classId) searchParams.append("classId", params.classId);
        if (params?.hasAccount !== undefined) searchParams.append("hasAccount", String(params.hasAccount));
        if (params?.search) searchParams.append("search", params.search);
        if (params?.page) searchParams.append("page", String(params.page));
        if (params?.limit) searchParams.append("limit", String(params.limit));
        const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
        return api.get(`/admin/students${query}`);
    },

    createStudent: async (data: { nis: string; name: string; gender: string; classId: string }): Promise<{ success: boolean }> => {
        return api.post("/admin/students", data);
    },

    updateStudent: async (id: string, data: Partial<{ nis: string; name: string; gender: string; classId: string }>): Promise<{ success: boolean }> => {
        return api.put(`/admin/students/${id}`, data);
    },

    deleteStudent: async (id: string): Promise<{ success: boolean }> => {
        return api.delete(`/admin/students/${id}`);
    },

    generateAccounts: async (data: { classId?: string; studentIds?: string[] }): Promise<{ success: boolean; count: number }> => {
        return api.post("/admin/students/generate-accounts", data);
    },

    resetStudentPassword: async (id: string): Promise<{ success: boolean }> => {
        return api.post(`/admin/students/${id}/reset-password`, {});
    },
};

// ==================== ADMIN VALIDATIONS API ====================

export interface PendingValidation {
    id: string;
    student: {
        id: string;
        name: string;
        nis: string;
        class: string;
    };
    subject: {
        id: string;
        name: string;
        code: string;
    };
    academicYear: string;
    scores: {
        uh1: number | null;
        uh2: number | null;
        uh3: number | null;
        pts: number | null;
        pas: number | null;
        skill: number | null;
    };
    finalScore: number | null;
    submittedAt: string;
}

export interface ValidationHistoryItem {
    id: string;
    admin: string;
    student: string;
    studentNis: string;
    subject: string;
    action: string;
    notes: string | null;
    timestamp: string;
}

export const adminValidationsApi = {
    getPending: async (params?: { classId?: string; subjectId?: string; page?: number; limit?: number }): Promise<{ pending: PendingValidation[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
        const searchParams = new URLSearchParams();
        if (params?.classId) searchParams.append("classId", params.classId);
        if (params?.subjectId) searchParams.append("subjectId", params.subjectId);
        if (params?.page) searchParams.append("page", String(params.page));
        if (params?.limit) searchParams.append("limit", String(params.limit));
        const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
        return api.get(`/admin/validations/pending${query}`);
    },

    approve: async (id: string, notes?: string): Promise<{ success: boolean }> => {
        return api.post(`/admin/validations/${id}/approve`, { notes });
    },

    reject: async (id: string, notes: string): Promise<{ success: boolean }> => {
        return api.post(`/admin/validations/${id}/reject`, { notes });
    },

    bulkApprove: async (gradeIds: string[], notes?: string): Promise<{ success: boolean; count: number }> => {
        return api.post("/admin/validations/bulk-approve", { gradeIds, notes });
    },

    bulkReject: async (gradeIds: string[], notes: string): Promise<{ success: boolean; count: number }> => {
        return api.post("/admin/validations/bulk-reject", { gradeIds, notes });
    },

    getHistory: async (params?: { action?: string; page?: number; limit?: number }): Promise<{ history: ValidationHistoryItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
        const searchParams = new URLSearchParams();
        if (params?.action) searchParams.append("action", params.action);
        if (params?.page) searchParams.append("page", String(params.page));
        if (params?.limit) searchParams.append("limit", String(params.limit));
        const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
        return api.get(`/admin/validations/history${query}`);
    },
};

// ==================== ADMIN SETTINGS API ====================

export interface RankingSettings {
    enabled: boolean;
    minValidationPercent: number;
    showScore: boolean;
}

export interface AccessSettings {
    semesterLocked: boolean;
    raporLocked: boolean;
    gradeSubmissionOpen: boolean;
}

export interface AdminUser {
    id: string;
    username: string;
    name: string;
    email: string | null;
    role: string;
    status: string;
    createdAt: string;
}

export const adminSettingsApi = {
    getRankingSettings: async (): Promise<RankingSettings> => {
        return api.get("/admin/settings/ranking");
    },

    updateRankingSettings: async (data: Partial<RankingSettings>): Promise<{ success: boolean }> => {
        return api.put("/admin/settings/ranking", data);
    },

    getAccessSettings: async (): Promise<AccessSettings> => {
        return api.get("/admin/settings/access");
    },

    updateAccessSettings: async (data: Partial<AccessSettings>): Promise<{ success: boolean }> => {
        return api.put("/admin/settings/access", data);
    },

    getAdminUsers: async (): Promise<{ admins: AdminUser[] }> => {
        return api.get("/admin/settings/users");
    },

    createAdminUser: async (data: { username: string; name: string; email?: string; password: string; role: string }): Promise<{ success: boolean }> => {
        return api.post("/admin/settings/users", data);
    },

    updateAdminUser: async (id: string, data: Partial<{ name: string; email: string; role: string; status: string }>): Promise<{ success: boolean }> => {
        return api.put(`/admin/settings/users/${id}`, data);
    },

    resetAdminPassword: async (id: string, newPassword: string): Promise<{ success: boolean }> => {
        return api.post(`/admin/settings/users/${id}/reset-password`, { newPassword });
    },

    deleteAdminUser: async (id: string): Promise<{ success: boolean }> => {
        return api.delete(`/admin/settings/users/${id}`);
    },

    getActivityLogs: async (params?: { category?: string; adminId?: string; page?: number; limit?: number }): Promise<{ logs: ActivityItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
        const searchParams = new URLSearchParams();
        if (params?.category) searchParams.append("category", params.category);
        if (params?.adminId) searchParams.append("adminId", params.adminId);
        if (params?.page) searchParams.append("page", String(params.page));
        if (params?.limit) searchParams.append("limit", String(params.limit));
        const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
        return api.get(`/admin/settings/logs${query}`);
    },

    getProfile: async (): Promise<{ profile: AdminUser }> => {
        return api.get("/admin/settings/profile");
    },

    updateProfile: async (data: { name?: string; email?: string }): Promise<{ success: boolean }> => {
        return api.put("/admin/settings/profile", data);
    },
};

// ==================== GOOGLE APPS SCRIPT BACKEND API ====================

const GAS_API_URL = import.meta.env.VITE_API_URL || '';

async function gasApiPost(data: object) {
    if (!GAS_API_URL) {
        throw new Error('API URL belum dikonfigurasi');
    }
    const response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}

export interface GasUserData {
    id: string;
    username: string;
    fullName: string;
    password?: string;
    schoolLevel: string;
    schoolStatus?: string;
    schoolName: string;
    classLevel: string;
    major: string;
    className: string;
    createdAt: string;
    role: string;
}

export interface GasGradeData {
    id?: string;
    userId?: string;
    semester: string;
    subject: string;
    grade: number;
    createdAt?: string;
}

export interface GasLogData {
    id: string;
    timestamp: string;
    action: string;
    userId: string;
    username: string;
    details: string;
    userAgent?: string;
}

export const gasApi = {
    // User Management
    getAllUsers: async (): Promise<{ success: boolean; users?: GasUserData[]; error?: string }> => {
        return gasApiPost({ action: 'getAllUsers' });
    },
    updateUser: async (userId: string, updates: Partial<GasUserData>): Promise<{ success: boolean; error?: string }> => {
        return gasApiPost({ action: 'updateUser', userId, ...updates });
    },
    deleteUser: async (userId: string): Promise<{ success: boolean; error?: string }> => {
        return gasApiPost({ action: 'deleteUser', userId });
    },

    // Grade Management
    getGrades: async (userId: string): Promise<{ success: boolean; grades?: GasGradeData[]; error?: string }> => {
        return gasApiPost({ action: 'getGrades', userId });
    },
    saveGrades: async (userId: string, grades: GasGradeData[]): Promise<{ success: boolean; count?: number; error?: string }> => {
        return gasApiPost({ action: 'saveGrades', userId, grades });
    },
    getAllGrades: async (): Promise<{ success: boolean; grades?: GasGradeData[]; error?: string }> => {
        return gasApiPost({ action: 'getAllGrades' });
    },
    updateGrade: async (gradeId: string, updates: Partial<GasGradeData>): Promise<{ success: boolean; error?: string }> => {
        return gasApiPost({ action: 'updateGrade', gradeId, ...updates });
    },
    deleteGrade: async (gradeId: string): Promise<{ success: boolean; error?: string }> => {
        return gasApiPost({ action: 'deleteGrade', gradeId });
    },

    // Activity Logs
    getAllLogs: async (): Promise<{ success: boolean; logs?: GasLogData[]; error?: string }> => {
        return gasApiPost({ action: 'getAllLogs' });
    },
};

export default {
    dashboard: adminDashboardApi,
    masterData: adminMasterDataApi,
    validations: adminValidationsApi,
    settings: adminSettingsApi,
    gas: gasApi,
};
