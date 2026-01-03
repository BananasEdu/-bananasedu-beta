import { useState, useCallback } from "react";
import {
    adminMasterDataApi,
    adminValidationsApi,
    adminSettingsApi,
    type AcademicYear,
    type Level,
    type Major,
    type ClassData,
    type Subject,
    type Student,
    type PendingValidation,
    type ValidationHistoryItem,
    type RankingSettings,
    type AccessSettings,
    type AdminUser
} from "../lib/adminApi";

// ==================== MASTER DATA HOOKS ====================

export function useAcademicYears() {
    const [data, setData] = useState<AcademicYear[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminMasterDataApi.getAcademicYears();
            setData(result.academicYears);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const create = async (params: { year: string; semester: string; status?: string }) => {
        await adminMasterDataApi.createAcademicYear(params);
        await fetch();
    };

    const update = async (id: string, params: Partial<{ year: string; semester: string; status: string }>) => {
        await adminMasterDataApi.updateAcademicYear(id, params);
        await fetch();
    };

    const remove = async (id: string) => {
        await adminMasterDataApi.deleteAcademicYear(id);
        await fetch();
    };

    return { data, isLoading, error, fetch, create, update, remove };
}

export function useLevels() {
    const [data, setData] = useState<Level[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminMasterDataApi.getLevels();
            setData(result.levels);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const create = async (params: { name: string; code: string }) => {
        await adminMasterDataApi.createLevel(params);
        await fetch();
    };

    const update = async (id: string, params: Partial<{ name: string; code: string }>) => {
        await adminMasterDataApi.updateLevel(id, params);
        await fetch();
    };

    const remove = async (id: string) => {
        await adminMasterDataApi.deleteLevel(id);
        await fetch();
    };

    return { data, isLoading, error, fetch, create, update, remove };
}

export function useMajors() {
    const [data, setData] = useState<Major[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminMasterDataApi.getMajors();
            setData(result.majors);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const create = async (params: { name: string; code: string }) => {
        await adminMasterDataApi.createMajor(params);
        await fetch();
    };

    const update = async (id: string, params: Partial<{ name: string; code: string }>) => {
        await adminMasterDataApi.updateMajor(id, params);
        await fetch();
    };

    const remove = async (id: string) => {
        await adminMasterDataApi.deleteMajor(id);
        await fetch();
    };

    return { data, isLoading, error, fetch, create, update, remove };
}

export function useClasses(params?: { levelId?: string; majorId?: string; academicYearId?: string }) {
    const [data, setData] = useState<ClassData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminMasterDataApi.getClasses(params);
            setData(result.classes);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, [params?.levelId, params?.majorId, params?.academicYearId]);

    const create = async (data: { name: string; levelId: string; majorId: string; academicYearId: string; homeroom?: string }) => {
        await adminMasterDataApi.createClass(data);
        await fetch();
    };

    const update = async (id: string, data: Partial<{ name: string; levelId: string; majorId: string; homeroom: string }>) => {
        await adminMasterDataApi.updateClass(id, data);
        await fetch();
    };

    const remove = async (id: string) => {
        await adminMasterDataApi.deleteClass(id);
        await fetch();
    };

    return { data, isLoading, error, fetch, create, update, remove };
}

export function useSubjects(params?: { type?: string; majorId?: string }) {
    const [data, setData] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminMasterDataApi.getSubjects(params);
            setData(result.subjects);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, [params?.type, params?.majorId]);

    const create = async (data: { name: string; code: string; type: string; majorId?: string }) => {
        await adminMasterDataApi.createSubject(data);
        await fetch();
    };

    const update = async (id: string, data: Partial<{ name: string; code: string; type: string; majorId: string }>) => {
        await adminMasterDataApi.updateSubject(id, data);
        await fetch();
    };

    const remove = async (id: string) => {
        await adminMasterDataApi.deleteSubject(id);
        await fetch();
    };

    return { data, isLoading, error, fetch, create, update, remove };
}

export function useStudents(params?: { classId?: string; hasAccount?: boolean; search?: string; page?: number; limit?: number }) {
    const [data, setData] = useState<Student[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminMasterDataApi.getStudents(params);
            setData(result.students);
            setPagination(result.pagination);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, [params?.classId, params?.hasAccount, params?.search, params?.page, params?.limit]);

    const create = async (data: { nis: string; name: string; gender: string; classId: string }) => {
        await adminMasterDataApi.createStudent(data);
        await fetch();
    };

    const update = async (id: string, data: Partial<{ nis: string; name: string; gender: string; classId: string }>) => {
        await adminMasterDataApi.updateStudent(id, data);
        await fetch();
    };

    const remove = async (id: string) => {
        await adminMasterDataApi.deleteStudent(id);
        await fetch();
    };

    const generateAccounts = async (data: { classId?: string; studentIds?: string[] }) => {
        return adminMasterDataApi.generateAccounts(data);
    };

    const resetPassword = async (id: string) => {
        return adminMasterDataApi.resetStudentPassword(id);
    };

    return { data, pagination, isLoading, error, fetch, create, update, remove, generateAccounts, resetPassword };
}

// ==================== VALIDATION HOOKS ====================

export function usePendingValidations(params?: { classId?: string; subjectId?: string; page?: number; limit?: number }) {
    const [data, setData] = useState<PendingValidation[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminValidationsApi.getPending(params);
            setData(result.pending);
            setPagination(result.pagination);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, [params?.classId, params?.subjectId, params?.page, params?.limit]);

    const approve = async (id: string, notes?: string) => {
        await adminValidationsApi.approve(id, notes);
        await fetch();
    };

    const reject = async (id: string, notes: string) => {
        await adminValidationsApi.reject(id, notes);
        await fetch();
    };

    const bulkApprove = async (gradeIds: string[], notes?: string) => {
        await adminValidationsApi.bulkApprove(gradeIds, notes);
        await fetch();
    };

    const bulkReject = async (gradeIds: string[], notes: string) => {
        await adminValidationsApi.bulkReject(gradeIds, notes);
        await fetch();
    };

    return { data, pagination, isLoading, error, fetch, approve, reject, bulkApprove, bulkReject };
}

export function useValidationHistory(params?: { action?: string; page?: number; limit?: number }) {
    const [data, setData] = useState<ValidationHistoryItem[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminValidationsApi.getHistory(params);
            setData(result.history);
            setPagination(result.pagination);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, [params?.action, params?.page, params?.limit]);

    return { data, pagination, isLoading, error, fetch };
}

// ==================== SETTINGS HOOKS ====================

export function useRankingSettings() {
    const [data, setData] = useState<RankingSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminSettingsApi.getRankingSettings();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const update = async (data: Partial<RankingSettings>) => {
        await adminSettingsApi.updateRankingSettings(data);
        await fetch();
    };

    return { data, isLoading, error, fetch, update };
}

export function useAccessSettings() {
    const [data, setData] = useState<AccessSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminSettingsApi.getAccessSettings();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const update = async (data: Partial<AccessSettings>) => {
        await adminSettingsApi.updateAccessSettings(data);
        await fetch();
    };

    return { data, isLoading, error, fetch, update };
}

export function useAdminUsers() {
    const [data, setData] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminSettingsApi.getAdminUsers();
            setData(result.admins);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const create = async (data: { username: string; name: string; email?: string; password: string; role: string }) => {
        await adminSettingsApi.createAdminUser(data);
        await fetch();
    };

    const update = async (id: string, data: Partial<{ name: string; email: string; role: string; status: string }>) => {
        await adminSettingsApi.updateAdminUser(id, data);
        await fetch();
    };

    const resetPassword = async (id: string, newPassword: string) => {
        await adminSettingsApi.resetAdminPassword(id, newPassword);
    };

    const remove = async (id: string) => {
        await adminSettingsApi.deleteAdminUser(id);
        await fetch();
    };

    return { data, isLoading, error, fetch, create, update, resetPassword, remove };
}

export function useAdminProfile() {
    const [data, setData] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminSettingsApi.getProfile();
            setData(result.profile);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const update = async (data: { name?: string; email?: string }) => {
        await adminSettingsApi.updateProfile(data);
        await fetch();
    };

    return { data, isLoading, error, fetch, update };
}
