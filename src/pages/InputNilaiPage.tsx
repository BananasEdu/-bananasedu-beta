import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Check, Loader2, Edit3, Send, ArrowLeft, X, AlertCircle, Trash2, Scan, PenTool } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import './InputNilaiPage.css';

// Set worker path for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    file: File;
}

interface SemesterData {
    id: number;
    label: string;
    files: UploadedFile[];
    grades: Record<string, number | null>;
    status: 'empty' | 'uploaded' | 'scanned' | 'manual' | 'edited';
    inputMode: 'none' | 'ocr' | 'manual';
    isScanning: boolean;
    scanProgress: number;
}

interface Subject {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
}

export default function InputNilaiPage() {
    const navigate = useNavigate();
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    // Config from backend
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [requiredSemesters, setRequiredSemesters] = useState<number[]>([1, 2, 3, 4, 5]);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    const [semesters, setSemesters] = useState<SemesterData[]>([]);
    const [activeSemester, setActiveSemester] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch subjects and settings from backend
    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoadingConfig(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL;

                // Fetch subjects
                const subjectsUrl = new URL(apiUrl);
                subjectsUrl.searchParams.append('action', 'getSubjects');
                const subjectsRes = await fetch(subjectsUrl.toString());
                const subjectsData = await subjectsRes.json();
                if (subjectsData.success) {
                    setSubjects(subjectsData.subjects.filter((s: Subject) => s.isActive));
                }

                // Fetch settings
                const settingsUrl = new URL(apiUrl);
                settingsUrl.searchParams.append('action', 'getSettings');
                const settingsRes = await fetch(settingsUrl.toString());
                const settingsData = await settingsRes.json();
                if (settingsData.success && settingsData.settings.required_semesters) {
                    const reqSems = settingsData.settings.required_semesters
                        .split(',')
                        .map((s: string) => parseInt(s.trim(), 10))
                        .filter((n: number) => !isNaN(n));
                    setRequiredSemesters(reqSems);

                    // Initialize semesters based on required ones
                    setSemesters(reqSems.map((id: number) => ({
                        id,
                        label: `Semester ${id}`,
                        files: [],
                        grades: {},
                        status: 'empty' as const,
                        inputMode: 'none' as const,
                        isScanning: false,
                        scanProgress: 0
                    })));
                } else {
                    // Default to all 5 semesters
                    setSemesters([1, 2, 3, 4, 5].map(id => ({
                        id,
                        label: `Semester ${id}`,
                        files: [],
                        grades: {},
                        status: 'empty' as const,
                        inputMode: 'none' as const,
                        isScanning: false,
                        scanProgress: 0
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch config:', error);
                // Fallback to defaults
                setSemesters([1, 2, 3, 4, 5].map(id => ({
                    id,
                    label: `Semester ${id}`,
                    files: [],
                    grades: {},
                    status: 'empty' as const,
                    inputMode: 'none' as const,
                    isScanning: false,
                    scanProgress: 0
                })));
            } finally {
                setIsLoadingConfig(false);
            }
        };
        fetchConfig();
    }, []);

    // Handle file upload
    const handleFileUpload = useCallback((semesterId: number, files: FileList | null) => {
        if (!files || files.length === 0) return;

        const validFiles: UploadedFile[] = [];
        const errors: string[] = [];

        Array.from(files).forEach(file => {
            // Check PDF format
            if (file.type !== 'application/pdf') {
                errors.push(`${file.name}: Hanya file PDF yang diperbolehkan`);
                return;
            }
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name}: Ukuran file melebihi 5MB`);
                return;
            }
            validFiles.push({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                size: file.size,
                file: file
            });
        });

        if (errors.length > 0) {
            setErrorMessage(errors.join('\n'));
            setTimeout(() => setErrorMessage(null), 5000);
        }

        if (validFiles.length > 0) {
            setSemesters(prev => prev.map(s =>
                s.id === semesterId
                    ? { ...s, files: [...s.files, ...validFiles], status: 'uploaded' }
                    : s
            ));
        }
    }, []);

    // Remove file
    const removeFile = (semesterId: number, fileId: string) => {
        setSemesters(prev => prev.map(s => {
            if (s.id !== semesterId) return s;
            const newFiles = s.files.filter(f => f.id !== fileId);
            return {
                ...s,
                files: newFiles,
                status: newFiles.length === 0 ? 'empty' : s.status,
                inputMode: newFiles.length === 0 ? 'none' : s.inputMode
            };
        }));
    };

    // Convert PDF to images for OCR
    const convertPdfToImages = async (file: File): Promise<string[]> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const images: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport, canvas }).promise;
            images.push(canvas.toDataURL('image/png'));
        }
        return images;
    };

    // Run OCR on semester
    const runOcrScan = async (semesterId: number) => {
        const semester = semesters.find(s => s.id === semesterId);
        if (!semester || semester.files.length === 0) return;

        setSemesters(prev => prev.map(s =>
            s.id === semesterId ? { ...s, isScanning: true, scanProgress: 0, inputMode: 'ocr' } : s
        ));

        try {
            const allText: string[] = [];
            const totalFiles = semester.files.length;

            for (let i = 0; i < semester.files.length; i++) {
                const file = semester.files[i];
                // Convert PDF to images
                const images = await convertPdfToImages(file.file);

                for (const image of images) {
                    const result = await Tesseract.recognize(image, 'ind');
                    allText.push(result.data.text);
                }

                setSemesters(prev => prev.map(s =>
                    s.id === semesterId ? { ...s, scanProgress: ((i + 1) / totalFiles) * 100 } : s
                ));
            }

            // Parse all OCR text
            const combinedText = allText.join('\n');
            const extractedGrades = parseOcrResult(combinedText);

            setSemesters(prev => prev.map(s =>
                s.id === semesterId
                    ? { ...s, isScanning: false, grades: extractedGrades, status: 'scanned', scanProgress: 100 }
                    : s
            ));
        } catch (error) {
            console.error('OCR Error:', error);
            setSemesters(prev => prev.map(s =>
                s.id === semesterId ? { ...s, isScanning: false, status: 'uploaded' } : s
            ));
            setErrorMessage('Gagal melakukan scan OCR. Silakan coba lagi atau input manual.');
        }
    };

    // Set manual input mode
    const setManualMode = (semesterId: number) => {
        setSemesters(prev => prev.map(s =>
            s.id === semesterId
                ? { ...s, inputMode: 'manual', status: 'manual', grades: {} }
                : s
        ));
    };

    // Parse OCR text to extract grades
    const parseOcrResult = (text: string): Record<string, number | null> => {
        const grades: Record<string, number | null> = {};
        subjects.forEach(subject => {
            const patterns = [
                new RegExp(`${subject.name}[:\\s]+([0-9]{2,3})`, 'i'),
                new RegExp(`${subject.code}[:\\s]+([0-9]{2,3})`, 'i'),
            ];
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const value = parseInt(match[1], 10);
                    if (value >= 0 && value <= 100) {
                        grades[subject.code] = value;
                        break;
                    }
                }
            }
            if (grades[subject.code] === undefined) {
                grades[subject.code] = null;
            }
        });
        return grades;
    };

    // Update grade manually
    const updateGrade = (semesterId: number, subjectCode: string, value: number | null) => {
        setSemesters(prev => prev.map(s =>
            s.id === semesterId
                ? { ...s, grades: { ...s.grades, [subjectCode]: value }, status: 'edited' }
                : s
        ));
    };

    // Check if can submit
    const canSubmit = semesters.some(s => s.status === 'scanned' || s.status === 'manual' || s.status === 'edited');

    // Submit for validation
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const gradesData: Array<{
                subjectCode: string;
                subjectName: string;
                semester: number;
                value: number;
            }> = [];

            semesters.forEach(sem => {
                if (sem.status !== 'empty' && sem.status !== 'uploaded') {
                    Object.entries(sem.grades).forEach(([code, value]) => {
                        if (value !== null) {
                            const subject = subjects.find(s => s.code === code);
                            gradesData.push({
                                subjectCode: code,
                                subjectName: subject?.name || code,
                                semester: sem.id,
                                value: value
                            });
                        }
                    });
                }
            });

            if (gradesData.length === 0) {
                setErrorMessage('Tidak ada nilai yang diinput. Silakan input nilai terlebih dahulu.');
                setIsSubmitting(false);
                return;
            }

            // Save to localStorage (Primary Storage)
            const localGrades = semesters.map(s => ({
                semesterId: s.id,
                grades: s.grades,
                status: s.status
            }));
            localStorage.setItem('bananasedu_local_grades', JSON.stringify(localGrades));

            // Allow offline usage: if token is present, try sync, otherwise just finish
            const token = localStorage.getItem('bananasedu_token');
            if (token) {
                try {
                    // Call GAS API - use URL params for action, POST body for data
                    const apiUrl = import.meta.env.VITE_API_URL;
                    const url = new URL(apiUrl);
                    url.searchParams.append('action', 'submitForValidation');

                    // Non-blocking sync attempt (or blocking if we want to ensure backup)
                    // For now, let's wait but handle error gracefully
                    await fetch(url.toString(), {
                        method: 'POST',
                        body: JSON.stringify({
                            token: token,
                            grades: gradesData
                        })
                    });
                } catch (e) {
                    console.warn("Backend sync failed, but data saved locally:", e);
                }
            }

            setShowConfirmModal(false);
            alert('✅ Nilai berhasil disimpan (Lokal)!');
            navigate('/dashboard'); // Direct to dashboard to see results

        } catch (error) {
            console.error('Submit error:', error);
            setErrorMessage('Terjadi kesalahan. Data mungkin hanya tersimpan lokal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Render semester card
    const renderSemesterCard = (semester: SemesterData) => {
        const isActive = activeSemester === semester.id;
        const hasFiles = semester.files.length > 0;
        const needsModeSelection = hasFiles && semester.inputMode === 'none';

        return (
            <div
                key={semester.id}
                className={`semester-card ${semester.status} ${isActive ? 'active' : ''}`}
            >
                <div className="semester-header" onClick={() => setActiveSemester(isActive ? null : semester.id)}>
                    <span className="semester-label">{semester.label}</span>
                    <div className="status-badges">
                        {semester.files.length > 0 && (
                            <span className="file-count">{semester.files.length} PDF</span>
                        )}
                        {semester.status === 'scanned' && <Check className="status-icon scanned" size={16} />}
                        {semester.status === 'manual' && <PenTool className="status-icon manual" size={16} />}
                        {semester.status === 'edited' && <Edit3 className="status-icon edited" size={16} />}
                        {semester.isScanning && <Loader2 className="status-icon scanning" size={16} />}
                    </div>
                </div>

                {/* File List */}
                {hasFiles && (
                    <div className="file-list">
                        {semester.files.map(f => (
                            <div key={f.id} className="file-item">
                                <FileText size={16} />
                                <span className="file-name">{f.name}</span>
                                <span className="file-size">{formatSize(f.size)}</span>
                                <button className="remove-file" onClick={() => removeFile(semester.id, f.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mode Selection */}
                {needsModeSelection && !semester.isScanning && (
                    <div className="mode-selection">
                        <p>Pilih metode input nilai:</p>
                        <div className="mode-buttons">
                            <button className="mode-btn ocr" onClick={() => runOcrScan(semester.id)}>
                                <Scan size={18} />
                                <span>Scan OCR</span>
                            </button>
                            <button className="mode-btn manual" onClick={() => setManualMode(semester.id)}>
                                <PenTool size={18} />
                                <span>Input Manual</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Scanning Progress */}
                {semester.isScanning && (
                    <div className="scanning-progress">
                        <Loader2 className="spinner" size={24} />
                        <span>Memindai PDF... {Math.round(semester.scanProgress)}%</span>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${semester.scanProgress}%` }} />
                        </div>
                    </div>
                )}

                {/* Upload Zone */}
                <div className="upload-zone" onClick={() => fileInputRefs.current[semester.id]?.click()}>
                    <input
                        ref={el => { fileInputRefs.current[semester.id] = el; }}
                        type="file"
                        accept=".pdf,application/pdf"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(semester.id, e.target.files)}
                    />
                    <FileText size={20} />
                    <span>{hasFiles ? 'Tambah PDF lainnya' : 'Upload PDF Rapor'}</span>
                    <small>Maksimal 5MB per file</small>
                </div>
            </div>
        );
    };

    // Render grade editor
    const renderGradeEditor = (semester: SemesterData) => (
        <div className="grade-editor">
            <div className="editor-header">
                <h3>{semester.label} - {semester.inputMode === 'ocr' ? 'Hasil OCR' : 'Input Manual'}</h3>
                <button className="close-btn" onClick={() => setActiveSemester(null)}>
                    <X size={20} />
                </button>
            </div>

            <div className="grade-form">
                {subjects.map(subject => (
                    <div key={subject.code} className="grade-row">
                        <label>{subject.name}</label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={semester.grades[subject.code] ?? ''}
                            onChange={(e) => updateGrade(
                                semester.id,
                                subject.code,
                                e.target.value ? parseInt(e.target.value, 10) : null
                            )}
                            placeholder="-"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    const activeSemData = semesters.find(s => s.id === activeSemester);

    // Loading state
    if (isLoadingConfig) {
        return (
            <div className="input-nilai-page">
                <main className="input-nilai-main">
                    <div className="container">
                        <div className="loading-state">
                            <Loader2 className="spinner" size={40} />
                            <p>Memuat konfigurasi...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="input-nilai-page">
            {/* Error Toast */}
            {errorMessage && (
                <div className="error-toast">
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)}><X size={16} /></button>
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>📤 Submit untuk Validasi?</h3>
                        <p>Nilai yang sudah disubmit akan diperiksa oleh Admin sebelum bisa dilihat.</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>
                                Batal
                            </button>
                            <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="spinner" size={16} /> : <Send size={16} />}
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="input-nilai-main">
                <div className="container">
                    {/* Header */}
                    <div className="page-header">
                        <button className="back-btn" onClick={() => navigate('/e-rapor')}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="page-title">📝 Input Nilai Rapor</h1>
                            <p className="page-subtitle">Upload PDF rapor per semester</p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="info-card">
                        <AlertCircle size={20} />
                        <div>
                            <strong>Cara Input:</strong>
                            <ol>
                                <li>Upload file PDF rapor (max 5MB per file)</li>
                                <li>Pilih metode: <strong>Scan OCR</strong> atau <strong>Input Manual</strong></li>
                                <li>Periksa dan edit nilai jika perlu</li>
                                <li>Submit untuk validasi oleh Admin</li>
                            </ol>
                        </div>
                    </div>

                    {/* Semester Grid */}
                    <div className="semester-grid">
                        {semesters.map(renderSemesterCard)}
                    </div>

                    {/* Grade Editor Panel */}
                    {activeSemData && (activeSemData.status === 'scanned' || activeSemData.status === 'manual' || activeSemData.status === 'edited') && (
                        <div className="editor-panel">
                            {renderGradeEditor(activeSemData)}
                        </div>
                    )}

                    {/* Submit Section */}
                    <div className="submit-section">
                        <div className="progress-info">
                            <span>{semesters.filter(s => ['scanned', 'manual', 'edited'].includes(s.status)).length}/{requiredSemesters.length} semester siap</span>
                        </div>
                        <button
                            className="btn-submit"
                            disabled={!canSubmit}
                            onClick={() => setShowConfirmModal(true)}
                        >
                            <Send size={18} />
                            Submit untuk Validasi
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
