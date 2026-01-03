
export interface StudentRank {
    id: string;
    name: string;
    kelas: string;
    jurusan: 'MIPA' | 'IPS' | 'BAHASA';
    average: number;
    grade: string;
    rank: number;
    previousRank: number;
    trend: 'up' | 'down' | 'same';
    change: number;
    semesters: number[]; // Scores history [S1, S2, S3, S4, S5]
}

export interface ValidationEvent {
    isActive: boolean;
    name: string;
    startDate: string;
    validatedCount: number;
    totalStudents: number;
    userValidated: boolean;
    validationDate?: string;
}

export const mockValidationEvent: ValidationEvent = {
    isActive: true, // Toggle this to test states
    name: 'Validasi Semester Ganjil 2024/2025',
    startDate: '20 Des 2024',
    validatedCount: 193,
    totalStudents: 268,
    userValidated: true, // Toggle this to test states
    validationDate: '28 Des 2024, 14:30'
};

export const currentUserRank: StudentRank = {
    id: 'user-123',
    name: 'Andi Pratama',
    kelas: 'XII MIPA 1',
    jurusan: 'MIPA',
    average: 87.45,
    grade: 'B+',
    rank: 15,
    previousRank: 18,
    trend: 'up',
    change: 3,
    semesters: [82.5, 84.0, 85.5, 86.8, 87.45]
};

const generateMockStudents = (count: number): StudentRank[] => {
    const students: StudentRank[] = [];
    const majors = ['MIPA', 'IPS', 'BAHASA'] as const;
    const classes = ['1', '2', '3'];

    // Add current user manually later to ensure position

    for (let i = 1; i <= count; i++) {
        if (i === 15) {
            students.push(currentUserRank);
            continue;
        }

        const prev = i + Math.floor(Math.random() * 5) - 2; // Random previous rank
        const trend = prev > i ? 'up' : prev < i ? 'down' : 'same';

        students.push({
            id: `student-${i}`,
            name: `Student Name ${i}`, // We will mask this in the UI
            kelas: `XII ${majors[Math.floor(Math.random() * majors.length)]} ${classes[Math.floor(Math.random() * classes.length)]}`,
            jurusan: 'MIPA', // Simplified for mock
            average: 98 - (i * 0.1) + (Math.random() * 0.05),
            grade: i <= 10 ? 'A+' : i <= 50 ? 'A' : 'B+',
            rank: i,
            previousRank: prev,
            trend: trend,
            change: Math.abs(prev - i),
            semesters: Array(5).fill(0).map(() => 80 + Math.random() * 15)
        });
    }
    return students;
};

export const mockRankings = generateMockStudents(268);
