// Export Data Utility for BananasEdu
// Exports grade data to CSV and triggers PDF print

interface BetaSubject {
    id: string;
    name: string;
    sem1: number | null;
    sem2: number | null;
    sem3: number | null;
    sem4: number | null;
    sem5: number | null;
}

const GRADES_KEY = 'bananasedu_beta_grades';

// Get grades from localStorage
function getGrades(): BetaSubject[] {
    try {
        const stored = localStorage.getItem(GRADES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Calculate average for a subject
function getSubjectAverage(subject: BetaSubject): number {
    const values = [subject.sem1, subject.sem2, subject.sem3, subject.sem4, subject.sem5]
        .filter((v): v is number => v !== null && v > 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

// Export to CSV
export function exportToCSV(userName: string = 'Siswa'): void {
    const grades = getGrades();

    if (grades.length === 0) {
        alert('Tidak ada data nilai untuk di-export.');
        return;
    }

    // CSV Header
    const headers = ['No', 'Mata Pelajaran', 'S1', 'S2', 'S3', 'S4', 'S5', 'Rata-rata'];

    // CSV Rows
    const rows = grades.map((subject, index) => {
        const avg = getSubjectAverage(subject);
        return [
            index + 1,
            subject.name,
            subject.sem1 ?? '-',
            subject.sem2 ?? '-',
            subject.sem3 ?? '-',
            subject.sem4 ?? '-',
            subject.sem5 ?? '-',
            avg.toFixed(2)
        ].join(',');
    });

    // Calculate overall average
    const allScores = grades.flatMap(s =>
        [s.sem1, s.sem2, s.sem3, s.sem4, s.sem5].filter((v): v is number => v !== null && v > 0)
    );
    const overallAvg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

    // Add footer row
    rows.push(`,,,,,,Rata-rata Keseluruhan,${overallAvg.toFixed(2)}`);

    // Combine
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `Rapor_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export to PDF (using print dialog)
export function exportToPDF(): void {
    const grades = getGrades();

    if (grades.length === 0) {
        alert('Tidak ada data nilai untuk di-export.');
        return;
    }

    // Navigate to E-Rapor struk view and print
    // For now, we'll use window.print()
    window.print();
}

// Generate printable HTML content
export function generatePrintableHTML(userName: string, grades: BetaSubject[]): string {
    const allScores = grades.flatMap(s =>
        [s.sem1, s.sem2, s.sem3, s.sem4, s.sem5].filter((v): v is number => v !== null && v > 0)
    );
    const overallAvg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Rapor ${userName}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; color: #1e293b; }
        .header { text-align: center; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: center; }
        th { background: #f1f5f9; color: #1e293b; }
        .subject-name { text-align: left; }
        .total { font-weight: bold; background: #fef3c7; }
        .footer { margin-top: 30px; text-align: center; color: #64748b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍌 BANANASEDU BETA</h1>
        <p>Laporan Nilai Rapor - ${userName}</p>
        <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Mata Pelajaran</th>
                <th>S1</th>
                <th>S2</th>
                <th>S3</th>
                <th>S4</th>
                <th>S5</th>
                <th>Rata-rata</th>
            </tr>
        </thead>
        <tbody>
            ${grades.map((s, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td class="subject-name">${s.name}</td>
                    <td>${s.sem1 ?? '-'}</td>
                    <td>${s.sem2 ?? '-'}</td>
                    <td>${s.sem3 ?? '-'}</td>
                    <td>${s.sem4 ?? '-'}</td>
                    <td>${s.sem5 ?? '-'}</td>
                    <td>${getSubjectAverage(s).toFixed(2)}</td>
                </tr>
            `).join('')}
            <tr class="total">
                <td colspan="7">RATA-RATA KESELURUHAN</td>
                <td>${overallAvg.toFixed(2)}</td>
            </tr>
        </tbody>
    </table>
    <div class="footer">
        <p>Dicetak dari BananasEdu Beta</p>
    </div>
</body>
</html>
    `;
}
