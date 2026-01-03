import { useState, useEffect, useCallback } from "react";
import { studentApi, type StudentProfile, type Grade, type ERaporData, type RankingData } from "../lib/api";
import { adminDashboardApi, type DashboardStats, type DashboardProgress, type PendingItem, type ActivityItem, type ClassProgress } from "../lib/adminApi";

// ==================== GENERIC DATA HOOK ====================

interface UseDataResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

function useData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseDataResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    }, deps);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, isLoading, error, refetch };
}

// ==================== STUDENT HOOKS ====================

export function useStudentProfile() {
    return useData<StudentProfile>(() => studentApi.getProfile(), []);
}

export function useStudentGrades(academicYearId?: string) {
    return useData<{ grades: Grade[] }>(
        () => studentApi.getGrades(academicYearId),
        [academicYearId]
    );
}

export function useERapor(academicYearId?: string) {
    return useData<ERaporData>(
        () => studentApi.getERapor(academicYearId),
        [academicYearId]
    );
}

export function useStudentRanking() {
    return useData<RankingData>(() => studentApi.getRanking(), []);
}

// ==================== ADMIN DASHBOARD HOOKS ====================

export function useAdminDashboardStats() {
    return useData<{ stats: DashboardStats; activeYear: { year: string; semester: string } | null }>(
        () => adminDashboardApi.getStats(),
        []
    );
}

export function useAdminDashboardProgress() {
    return useData<{ progress: DashboardProgress }>(
        () => adminDashboardApi.getProgress(),
        []
    );
}

export function useAdminPending(limit?: number) {
    return useData<{ pending: PendingItem[] }>(
        () => adminDashboardApi.getPending(limit),
        [limit]
    );
}

export function useAdminActivity(limit?: number) {
    return useData<{ activities: ActivityItem[] }>(
        () => adminDashboardApi.getActivity(limit),
        [limit]
    );
}

export function useAdminClassProgress() {
    return useData<{ classProgress: ClassProgress[] }>(
        () => adminDashboardApi.getClassProgress(),
        []
    );
}

// ==================== COMBINED DASHBOARD DATA ====================

export interface DashboardData {
    stats: DashboardStats | null;
    activeYear: { year: string; semester: string } | null;
    progress: DashboardProgress | null;
    pending: PendingItem[];
    activities: ActivityItem[];
    classProgress: ClassProgress[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useAdminDashboard(): DashboardData {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activeYear, setActiveYear] = useState<{ year: string; semester: string } | null>(null);
    const [progress, setProgress] = useState<DashboardProgress | null>(null);
    const [pending, setPending] = useState<PendingItem[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [classProgress, setClassProgress] = useState<ClassProgress[]>([]);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [statsRes, progressRes, pendingRes, activityRes, classProgressRes] = await Promise.all([
                adminDashboardApi.getStats(),
                adminDashboardApi.getProgress(),
                adminDashboardApi.getPending(5),
                adminDashboardApi.getActivity(10),
                adminDashboardApi.getClassProgress(),
            ]);

            setStats(statsRes.stats);
            setActiveYear(statsRes.activeYear);
            setProgress(progressRes.progress);
            setPending(pendingRes.pending);
            setActivities(activityRes.activities);
            setClassProgress(classProgressRes.classProgress);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        stats,
        activeYear,
        progress,
        pending,
        activities,
        classProgress,
        isLoading,
        error,
        refetch,
    };
}

export default {
    useStudentProfile,
    useStudentGrades,
    useERapor,
    useStudentRanking,
    useAdminDashboard,
    useAdminDashboardStats,
    useAdminDashboardProgress,
    useAdminPending,
    useAdminActivity,
    useAdminClassProgress,
};
