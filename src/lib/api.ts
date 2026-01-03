// API Configuration
const API_BASE_URL = "https://script.google.com/macros/s/AKfycby7qEtYda9WIG-1KDJRwlfY0AaG8g3gf014QKTCzZ3Sv97-ADFK0Iyw9emc8UW_mjA_Pw/exec";

// Token storage keys
const TOKEN_KEY = "bananasedu_token";
const USER_KEY = "bananasedu_user";

// Types
export interface User {
    id: string;
    name: string;
    role: "student" | "admin" | "validator" | "super_admin";
    nis?: string;
    class?: string;
    email?: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    user: User;
}

export interface ApiError {
    error: string;
}

// Token management
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
};

export const setStoredUser = (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// API Client
class ApiClient {
    private baseUrl: string;
    private isGas: boolean;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.isGas = baseUrl.includes("script.google.com");
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = getToken();

        // GAS SPECIAL HANDLING
        if (this.isGas) {
            // Map REST endpoints to GAS Actions
            let action = '';
            let params = {};

            // Auth Mappings
            if (endpoint === '/auth/login') action = 'login';
            else if (endpoint === '/students/profile') action = 'getStudent'; // Matched with GAS script
            else if (endpoint === '/students/grades') {
                if (options.method === 'POST') action = 'saveGrades';
                else action = 'getGrades';
            }
            // Add other mappings as needed

            if (!action) {
                // Fallback for unmapped endpoints or specialized calls
                // If endpoint starts with /, strip it
                const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
                // Try to guess action from endpoint parts? 
                // Better to throw error or handle specific cases in specific API objects.
                // For now, let's assume specific API objects will handle complex cases if this generic mapper fails.
                console.warn(`Endpoint ${endpoint} not explicitly mapped for GAS. Using endpoint name as action.`);
                action = cleanEndpoint.split('/')[1] || cleanEndpoint; // e.g. /students/profile -> profile
            }

            // Construct GAS URL
            const url = new URL(this.baseUrl);
            url.searchParams.append('action', action);

            if (token) url.searchParams.append('token', token);

            // For GET requests, append query params from endpoint string
            if (endpoint.includes('?')) {
                const queryParts = endpoint.split('?')[1];
                const queryParams = new URLSearchParams(queryParts);
                queryParams.forEach((value, key) => url.searchParams.append(key, value));
            }

            // GAS always accepts POST for complex data, but we can stick to method spec if Code.gs handles it.
            // Our Code.gs handles both doGet and doPost via handleRequest.

            // For Request Body
            let body = options.body;
            if (body && typeof body === 'string') {
                const parsed = JSON.parse(body);
                // Merge body into params for uniformity if needed, or send as payload
                params = { ...params, ...parsed };
            }

            // Inject NIS from stored user if available (for stateless GAS)
            const user = getStoredUser();
            if (user?.nis) {
                params = { ...params, nis: user.nis };
            }

            // For GAS, we often send everything as POST to avoid URL length limits, 
            // but GET is fine for fetching. 
            // Important: GAS CORS requires 'text/plain' or 'application/x-www-form-urlencoded' often, 
            // but 'application/json' works with specific CORS handling in Code.gs.

            const fetchOptions: RequestInit = {
                method: 'POST', // Always POST to GAS to avoid caching issues and enable body
                body: JSON.stringify({ action, ...params, token }), // Wrap everything
            };

            // Using 'no-cors' mode is tricky because we can't read response. 
            // We rely on Code.gs returning correct CORS headers.

            const response = await fetch(url.toString(), fetchOptions);
            const data = await response.json();

            if (!data.success && !data.grades && !data.user) { // weak success check
                throw new Error(data.message || data.error || "GAS Error");
            }
            return data as T;
        }

        // STANDARD REST HANDLING (Old Implementation)
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "An error occurred");
        }

        return data;
    }

    // GET request
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    // POST request
    async post<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    // PUT request
    async put<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    // DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}

// Create API client instance
export const api = new ApiClient(API_BASE_URL);

// ==================== AUTH API ====================
// Supports both backend API and localStorage fallback for offline mode

import { dataStore } from '../store/dataStore';

export const authApi = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        // First, try backend API
        try {
            // Pass username as 'nis' for GAS
            const response = await api.post<LoginResponse>("/auth/login", { nis: username, password });
            if (response.success && response.token) {
                setToken(response.token);
                setStoredUser(response.user);
            }
            return response;
        } catch (error) {
            // Backend unavailable, fallback to localStorage
            console.log("Backend unavailable, using localStorage fallback");

            // Check super admin (hardcoded)
            if (username === "Ban4n43du4dmin" && password === "08231Maliffa") {
                const adminUser: User = {
                    id: "super-admin-1",
                    name: "Super Admin",
                    role: "super_admin",
                    email: "admin@bananasedu.id",
                };
                setToken("local-admin-token");
                setStoredUser(adminUser);
                return { success: true, token: "local-admin-token", user: adminUser };
            }

            // Check student from localStorage
            const student = dataStore.authenticateStudent(username, password);
            if (student) {
                const studentUser: User = {
                    id: student.id,
                    name: student.name,
                    role: "student",
                    nis: student.nis,
                    class: student.className,
                };
                setToken(`local-student-${student.id}`);
                setStoredUser(studentUser);
                return { success: true, token: `local-student-${student.id}`, user: studentUser };
            }

            // No match found
            throw new Error("Nama/NIS atau password salah");
        }
    },

    logout: async (): Promise<void> => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            // Ignore backend logout errors
        } finally {
            removeToken();
        }
    },

    getMe: async (): Promise<User> => {
        // Check if we have a local token (offline mode)
        const token = getToken();
        if (token?.startsWith("local-")) {
            const user = getStoredUser();
            if (user) return user;
            throw new Error("User not found");
        }
        return api.get<User>("/auth/me");
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean }> => {
        // Check if offline mode
        const token = getToken();
        if (token?.startsWith("local-student-")) {
            const user = getStoredUser();
            if (user && user.nis) {
                const student = dataStore.findStudentByNis(user.nis);
                if (student && student.password === currentPassword) {
                    dataStore.updateStudent(student.id, { password: newPassword });
                    return { success: true };
                }
                throw new Error("Password lama salah");
            }
        }
        return api.post("/auth/change-password", { currentPassword, newPassword });
    },
};

// ==================== STUDENT API ====================

export interface StudentProfile {
    id: string;
    nis: string;
    name: string;
    gender: string;
    class: {
        id: string;
        name: string;
        level: string;
        major: string;
        homeroom: string;
    };
    academicYear: {
        id: string;
        year: string;
        semester: string;
    };
    accountStatus: string;
}

export interface Grade {
    id: string;
    subject: {
        id: string;
        name: string;
        code: string;
        type: string;
    };
    academicYear: {
        id: string;
        year: string;
        semester: string;
    };
    uh1: number | null;
    uh2: number | null;
    uh3: number | null;
    pts: number | null;
    pas: number | null;
    skill: number | null;
    finalScore: number | null;
    status: string;
    submittedAt: string | null;
    validatedAt: string | null;
}

export interface ERaporData {
    student: {
        id: string;
        nis: string;
        name: string;
        class: string;
        level: string;
        major: string;
    };
    summary: {
        totalSubjects: number;
        completedSubjects: number;
        pendingSubjects: number;
        averageScore: number | null;
        validationProgress: number;
    };
    grades: Array<{
        subject: string;
        subjectCode: string;
        type: string;
        finalScore: number | null;
        status: string;
        semester: string;
        year: string;
    }>;
}

export interface RankingData {
    enabled: boolean;
    student: {
        rank: number;
        totalStudents: number;
        avgScore: number;
        subjectCount: number;
    };
    class: {
        id: string;
        name: string;
    };
    leaderboard: Array<{
        rank: number;
        name: string;
        nis: string | null;
        avgScore: number;
        isCurrentUser: boolean;
    }>;
}

export const studentApi = {
    getProfile: async (): Promise<StudentProfile> => {
        const response = await api.get<{ success: boolean; data: StudentProfile }>("/students/profile");
        // GAS returns { success: true, data: {...} }, extract the data
        return response.data || response as unknown as StudentProfile;
    },

    updateProfile: async (data: { name?: string }): Promise<{ success: boolean }> => {
        return api.put("/students/profile", data);
    },

    getGrades: async (academicYearId?: string): Promise<{ grades: Grade[] }> => {
        const query = academicYearId ? `?academicYearId=${academicYearId}` : "";
        const response = await api.get<{ success: boolean; grades: Grade[] }>(`/students/grades${query}`);
        return { grades: response.grades || [] };
    },

    submitGrade: async (data: {
        subjectId: string;
        academicYearId: string;
        uh1?: number;
        uh2?: number;
        uh3?: number;
        pts?: number;
        pas?: number;
        skill?: number;
    }): Promise<{ success: boolean; gradeId: string; finalScore: number | null }> => {
        return api.post("/students/grades", data);
    },

    submitAllGrades: async (academicYearId: string): Promise<{ success: boolean; count: number }> => {
        return api.post("/students/grades/submit", { academicYearId });
    },

    // Submit grades for admin validation
    submitForValidation: async (grades: Array<{
        subjectCode: string;
        subjectName: string;
        semester: number;
        value: number;
        photoUrl?: string;
    }>): Promise<{ success: boolean; message: string }> => {
        return api.post("/students/grades/validate", { grades });
    },

    // Get validation status
    getValidationStatus: async (): Promise<{
        success: boolean;
        status: 'EMPTY' | 'PENDING' | 'VALIDATED' | 'REJECTED';
        counts: { pending: number; approved: number; rejected: number };
    }> => {
        return api.get("/students/validation-status");
    },

    getERapor: async (academicYearId?: string): Promise<ERaporData> => {
        const query = academicYearId ? `?academicYearId=${academicYearId}` : "";
        return api.get(`/students/erapor${query}`);
    },

    getRanking: async (): Promise<RankingData> => {
        return api.get("/students/ranking");
    },

    // Get notifications
    getNotifications: async (): Promise<{
        success: boolean;
        notifications: Array<{
            id: string;
            type: string;
            message: string;
            read: boolean;
            createdAt: string;
        }>;
    }> => {
        return api.get("/students/notifications");
    },

    // Mark notification as read
    markNotificationRead: async (notificationId: string): Promise<{ success: boolean }> => {
        return api.post("/students/notifications/read", { notificationId });
    },
};

// ==================== RANKING API (PUBLIC) ====================

export interface LeaderboardEntry {
    rank: number;
    name: string;
    class: string;
    level: string;
    major: string;
    avgScore: number;
    subjectCount: number;
}

export interface LeaderboardData {
    enabled: boolean;
    academicYear?: {
        year: string;
        semester: string;
    };
    totalStudents: number;
    leaderboard: LeaderboardEntry[];
}

export const rankingApi = {
    getLeaderboard: async (params?: { classId?: string; levelId?: string; limit?: number }): Promise<LeaderboardData> => {
        const searchParams = new URLSearchParams();
        if (params?.classId) searchParams.append("classId", params.classId);
        if (params?.levelId) searchParams.append("levelId", params.levelId);
        if (params?.limit) searchParams.append("limit", params.limit.toString());

        const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
        return api.get(`/ranking/leaderboard${query}`);
    },

    getClasses: async (): Promise<{ classes: Array<{ id: string; name: string; level: string; major: string; studentCount: number }> }> => {
        return api.get("/ranking/classes");
    },

    getLevels: async (): Promise<{ levels: Array<{ id: string; name: string; code: string }> }> => {
        return api.get("/ranking/levels");
    },
};

// ==================== E-RAPOR SYNC API (BetaSubjects) ====================

export interface BetaSubject {
    id: string;
    name: string;
    sem1: number | null;
    sem2: number | null;
    sem3: number | null;
    sem4: number | null;
    sem5: number | null;
}

export const eraporSyncApi = {
    /**
     * Save student grades (E-Rapor subjects array) to Google Sheets
     */
    saveStudentGrades: async (userId: string, subjects: BetaSubject[]): Promise<{ success: boolean; message?: string; error?: string }> => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveStudentGrades',
                    userId,
                    subjects
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to save grades to backend:', error);
            return { success: false, error: 'Gagal menyimpan ke server' };
        }
    },

    /**
     * Get student grades from Google Sheets
     */
    getStudentGrades: async (userId: string): Promise<{ success: boolean; subjects: BetaSubject[]; error?: string }> => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getStudentGrades',
                    userId
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch grades from backend:', error);
            return { success: false, subjects: [], error: 'Gagal mengambil data dari server' };
        }
    },
};

// ==================== DASHBOARD STATS API ====================

export interface DashboardStats {
    averageScore: number;
    subjectCount: number;
    filledSemesters: number;
    gradeDistribution: { A: number; B: number; C: number; D: number; E: number };
    semesterAverages: (number | null)[];
}

export const dashboardApi = {
    /**
     * Get dashboard statistics from backend
     */
    getDashboardStats: async (userId: string): Promise<{ success: boolean; stats: DashboardStats; error?: string }> => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getDashboardStats',
                    userId
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            return {
                success: false,
                stats: {
                    averageScore: 0,
                    subjectCount: 0,
                    filledSemesters: 0,
                    gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
                    semesterAverages: [null, null, null, null, null]
                },
                error: 'Gagal mengambil statistik'
            };
        }
    },
};

// ==================== FEEDBACK API ====================

export const feedbackApi = {
    saveFeedback: async (data: {
        userId: string,
        username?: string,
        message: string,
        type?: string,
        rating?: string
    }): Promise<{ success: boolean; message?: string; error?: string }> => {
        try {
            const deviceInfo = navigator.userAgent;
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveFeedback',
                    ...data,
                    deviceInfo
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to save feedback:', error);
            return { success: false, error: 'Gagal mengirim feedback' };
        }
    }
};

export default api;
