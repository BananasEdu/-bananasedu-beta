import { useState, useEffect, useCallback } from "react";
import { studentApi, type StudentProfile, type Grade, type ERaporData, type RankingData } from "../lib/api";

// ==================== STUDENT PROFILE ====================

export function useStudentProfile() {
    const [data, setData] = useState<StudentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await studentApi.getProfile();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch profile");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const update = async (data: { name?: string }) => {
        await studentApi.updateProfile(data);
        await fetch();
    };

    return { data, isLoading, error, fetch, update };
}

// ==================== STUDENT GRADES ====================

export function useStudentGrades(academicYearId?: string) {
    const [data, setData] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await studentApi.getGrades(academicYearId);
            setData(result.grades);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch grades");
        } finally {
            setIsLoading(false);
        }
    }, [academicYearId]);

    const submitGrade = async (gradeData: {
        subjectId: string;
        academicYearId: string;
        uh1?: number;
        uh2?: number;
        uh3?: number;
        pts?: number;
        pas?: number;
        skill?: number;
    }) => {
        const result = await studentApi.submitGrade(gradeData);
        await fetch();
        return result;
    };

    const submitAllGrades = async (academicYearId: string) => {
        const result = await studentApi.submitAllGrades(academicYearId);
        await fetch();
        return result;
    };

    return { data, isLoading, error, fetch, submitGrade, submitAllGrades };
}

// ==================== E-RAPOR DATA ====================

export function useERapor(academicYearId?: string) {
    const [data, setData] = useState<ERaporData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await studentApi.getERapor(academicYearId);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch e-rapor");
        } finally {
            setIsLoading(false);
        }
    }, [academicYearId]);

    return { data, isLoading, error, fetch };
}

// ==================== STUDENT RANKING ====================

export function useStudentRanking() {
    const [data, setData] = useState<RankingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await studentApi.getRanking();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch ranking");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { data, isLoading, error, fetch };
}

// ==================== COMBINED STUDENT DASHBOARD ====================

interface DashboardData {
    profile: StudentProfile | null;
    grades: Grade[];
    ranking: RankingData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useStudentDashboard(): DashboardData {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [ranking, setRanking] = useState<RankingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [profileRes, gradesRes, rankingRes] = await Promise.all([
                studentApi.getProfile(),
                studentApi.getGrades(),
                studentApi.getRanking(),
            ]);

            setProfile(profileRes);
            setGrades(gradesRes.grades);
            setRanking(rankingRes);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { profile, grades, ranking, isLoading, error, refetch };
}

export default {
    useStudentProfile,
    useStudentGrades,
    useERapor,
    useStudentRanking,
    useStudentDashboard,
};
