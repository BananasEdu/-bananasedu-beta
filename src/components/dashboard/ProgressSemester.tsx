
import React from 'react';
import './ProgressSemester.css';

interface ProgressSemesterProps {
    uploadedSemesters: number;
    totalSemesters: number;
}

const ProgressSemester: React.FC<ProgressSemesterProps> = ({
    uploadedSemesters,
    totalSemesters
}) => {
    const progress = (uploadedSemesters / totalSemesters) * 100;

    return (
        <div className="progress-semester">
            <div className="progress-semester-bar">
                {Array.from({ length: totalSemesters }, (_, i) => (
                    <div
                        key={i}
                        className={`semester-dot ${i < uploadedSemesters ? 'filled' : ''}`}
                    >
                        <span className="semester-label">S{i + 1}</span>
                    </div>
                ))}
            </div>
            <div className="progress-semester-track">
                <div
                    className="progress-semester-fill"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="progress-semester-text">
                <span className="uploaded">{uploadedSemesters}</span>
                <span className="separator">/</span>
                <span className="total">{totalSemesters}</span>
                <span className="label">semester</span>
            </div>
        </div>
    );
};

export default ProgressSemester;
