import React from 'react';
import './TrendGraph.css';

interface TrendGraphProps {
    data: number[];
    labels: string[];
    currentRank: number;
}

const TrendGraph: React.FC<TrendGraphProps> = ({ data, labels, currentRank }) => {
    // Calculate the best and worst ranks
    const bestRank = Math.min(...data);
    const worstRank = Math.max(...data);
    const totalChange = data[0] - currentRank;

    return (
        <div className="trend-graph-container">
            <h3 className="graph-title">📈 Grafik Perubahan Ranking</h3>

            <div className="graph-visual">
                {/* Y-Axis Labels */}
                <div className="y-axis">
                    <span>#1</span>
                    <span>#15</span>
                    <span>#30</span>
                </div>

                {/* Chart Area */}
                <div className="chart-area">
                    {data.map((rank, index) => {
                        // Calculate position (inverted - lower rank = higher position)
                        const heightPercent = Math.max(5, 100 - ((rank - 1) / 29) * 100);
                        const isLast = index === data.length - 1;

                        return (
                            <div key={index} className="bar-column">
                                <div
                                    className={`bar ${isLast ? 'current' : ''}`}
                                    style={{ height: `${heightPercent}%` }}
                                >
                                    <span className="bar-value">#{rank}</span>
                                </div>
                                <span className="bar-label">{labels[index]}</span>
                            </div>
                        );
                    })}

                    {/* Trend Line connecting bars */}
                    <svg className="trend-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                            className="trend-line"
                            points={data.map((rank, i) => {
                                const x = (i / (data.length - 1)) * 100;
                                const y = ((rank - 1) / 29) * 100;
                                return `${x},${y}`;
                            }).join(' ')}
                        />
                    </svg>
                </div>
            </div>

            {/* Analysis Summary */}
            <div className="analysis-summary">
                <div className="analysis-item positive">
                    ✅ Tren positif: Naik <strong>{Math.abs(totalChange)}</strong> posisi dari S1
                </div>
                <div className="analysis-item">
                    🏆 Best: <strong>S{data.indexOf(bestRank) + 1} (#{bestRank})</strong>
                </div>
                <div className="analysis-item">
                    📉 Worst: <strong>S{data.indexOf(worstRank) + 1} (#{worstRank})</strong>
                </div>
            </div>
        </div>
    );
};

export default TrendGraph;
